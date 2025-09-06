/**
 * Enhanced API Client with comprehensive features
 * - Authentication with token refresh
 * - Request/Response interceptors
 * - Caching with TTL
 * - Retry logic with exponential backoff
 * - Circuit breaker pattern
 * - Rate limiting
 * - Request deduplication
 * - Comprehensive error handling
 * - Metrics and monitoring
 */

import { 
  ApiResponse, 
  ApiError, 
  ApiRequestConfig, 
  ApiClientConfig, 
  RequestInterceptor, 
  ResponseInterceptor,
  LoadingState,
  CacheEntry,
  CircuitState,
  ApiMetrics,
  RequestTiming,
  QueuedRequest
} from '../types';
import { TokenManager } from './TokenManager';
import { CacheManager } from './CacheManager';
import { RetryManager } from './RetryManager';
import { CircuitBreakerManager } from './CircuitBreakerManager';
import { RateLimiter } from './RateLimiter';
import { RequestDeduplicator } from './RequestDeduplicator';
import { MetricsCollector } from './MetricsCollector';
import { LoadingStateManager } from './LoadingStateManager';
import { EventEmitter } from './EventEmitter';

export class ApiClient extends EventEmitter {
  private config: ApiClientConfig;
  private tokenManager: TokenManager;
  private cacheManager: CacheManager;
  private retryManager: RetryManager;
  private circuitBreakerManager: CircuitBreakerManager;
  private rateLimiter: RateLimiter;
  private requestDeduplicator: RequestDeduplicator;
  private metricsCollector: MetricsCollector;
  private loadingStateManager: LoadingStateManager;
  
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private requestQueue: QueuedRequest[] = [];
  private isProcessingQueue = false;

  constructor(config: ApiClientConfig) {
    super();
    this.config = { ...this.getDefaultConfig(), ...config };
    this.initializeManagers();
    this.setupDefaultInterceptors();
  }

  private getDefaultConfig(): ApiClientConfig {
    return {
      baseURL: '',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      retry: {
        attempts: 3,
        delay: 1000,
        backoff: 'exponential',
        retryCondition: (error: ApiError) => 
          error.status >= 500 || error.status === 429 || error.status === 408
      },
      circuitBreaker: {
        enabled: true,
        failureThreshold: 5,
        recoveryTimeout: 60000,
        monitoringPeriod: 10000
      },
      cache: {
        enabled: true,
        defaultTTL: 300000, // 5 minutes
        maxEntries: 1000,
        storageType: 'memory',
        keyPrefix: 'api_cache_'
      },
      rateLimit: {
        enabled: true,
        requests: 100,
        windowMs: 60000, // 1 minute
        skipSuccessfulRequests: false,
        skipFailedRequests: true
      },
      auth: {
        tokenStorage: 'localStorage',
        autoRefresh: true,
        refreshThreshold: 300 // 5 minutes
      },
      logging: {
        enabled: true,
        level: 'info',
        includeHeaders: false,
        includeData: false,
        maxBodySize: 1024
      }
    };
  }

  private initializeManagers(): void {
    this.tokenManager = new TokenManager(this.config.auth);
    this.cacheManager = new CacheManager(this.config.cache);
    this.retryManager = new RetryManager(this.config.retry);
    this.circuitBreakerManager = new CircuitBreakerManager(this.config.circuitBreaker);
    this.rateLimiter = new RateLimiter(this.config.rateLimit);
    this.requestDeduplicator = new RequestDeduplicator();
    this.metricsCollector = new MetricsCollector();
    this.loadingStateManager = new LoadingStateManager();
  }

  private setupDefaultInterceptors(): void {
    // Authentication interceptor
    this.addRequestInterceptor({
      id: 'auth',
      priority: 100,
      onRequest: async (config) => {
        if (config.requiresAuth !== false) {
          const token = await this.tokenManager.getValidToken();
          if (token) {
            config.headers = {
              ...config.headers,
              Authorization: `Bearer ${token.accessToken}`
            };
          }
        }
        return config;
      }
    });

    // Base URL interceptor
    this.addRequestInterceptor({
      id: 'baseUrl',
      priority: 90,
      onRequest: (config) => {
        if (!config.url.startsWith('http')) {
          config.url = `${this.config.baseURL.replace(/\/$/, '')}/${config.url.replace(/^\//, '')}`;
        }
        return config;
      }
    });

    // Request ID interceptor
    this.addRequestInterceptor({
      id: 'requestId',
      priority: 80,
      onRequest: (config) => {
        const requestId = this.generateRequestId();
        config.headers = {
          ...config.headers,
          'X-Request-ID': requestId
        };
        config.metadata = {
          ...config.metadata,
          requestId
        };
        return config;
      }
    });

    // Error handling interceptor
    this.addResponseInterceptor({
      id: 'errorHandler',
      priority: 100,
      onResponse: (response) => response,
      onError: async (error) => {
        // Handle 401 errors with token refresh
        if (error.status === 401 && this.config.auth.autoRefresh) {
          const refreshed = await this.tokenManager.refreshToken();
          if (refreshed) {
            // Retry the original request with new token
            throw { ...error, shouldRetry: true };
          }
        }
        
        this.emit('error', error);
        throw error;
      }
    });
  }

  // Public API Methods
  async get<T = any>(url: string, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: 'GET', ...config });
  }

  async post<T = any>(url: string, data?: any, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: 'POST', data, ...config });
  }

  async put<T = any>(url: string, data?: any, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: 'PUT', data, ...config });
  }

  async patch<T = any>(url: string, data?: any, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: 'PATCH', data, ...config });
  }

  async delete<T = any>(url: string, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: 'DELETE', ...config });
  }

  // Main request method
  async request<T = any>(config: ApiRequestConfig): Promise<ApiResponse<T>> {
    const requestId = config.metadata?.requestId || this.generateRequestId();
    const loadingKey = this.generateLoadingKey(config);
    
    try {
      // Update loading state
      this.loadingStateManager.setLoading(loadingKey, true);
      
      // Check rate limiting
      if (this.config.rateLimit.enabled) {
        await this.rateLimiter.checkLimit(config.url);
      }

      // Check circuit breaker
      if (this.config.circuitBreaker.enabled) {
        await this.circuitBreakerManager.checkState(config.url);
      }

      // Check for cached response
      if (config.cache !== false && config.method === 'GET') {
        const cached = await this.cacheManager.get<T>(config.url, config.params);
        if (cached) {
          this.metricsCollector.recordCacheHit();
          this.loadingStateManager.setSuccess(loadingKey);
          return cached;
        }
      }

      // Check for duplicate request
      const deduplicatedResponse = await this.requestDeduplicator.checkDuplicate<T>(config);
      if (deduplicatedResponse) {
        this.loadingStateManager.setSuccess(loadingKey);
        return deduplicatedResponse;
      }

      // Process request through interceptors
      const processedConfig = await this.processRequestInterceptors(config);
      
      // Execute request with retry logic
      const response = await this.executeRequestWithRetry<T>(processedConfig);
      
      // Process response through interceptors
      const processedResponse = await this.processResponseInterceptors(response);
      
      // Cache successful GET responses
      if (config.cache !== false && config.method === 'GET' && response.status < 400) {
        await this.cacheManager.set(config.url, processedResponse, config.cacheTTL, config.params);
      }

      // Record metrics
      this.metricsCollector.recordSuccess(processedConfig, response);
      
      // Update loading state
      this.loadingStateManager.setSuccess(loadingKey);
      
      // Emit success event
      this.emit('response', { config: processedConfig, response: processedResponse });
      
      return processedResponse;
      
    } catch (error) {
      const apiError = this.normalizeError(error, requestId);
      
      // Record metrics
      this.metricsCollector.recordError(config, apiError);
      
      // Update circuit breaker
      if (this.config.circuitBreaker.enabled) {
        this.circuitBreakerManager.recordFailure(config.url);
      }
      
      // Update loading state
      this.loadingStateManager.setError(loadingKey, apiError);
      
      // Emit error event
      this.emit('error', { config, error: apiError });
      
      throw apiError;
    }
  }

  private async executeRequestWithRetry<T>(config: ApiRequestConfig): Promise<ApiResponse<T>> {
    let lastError: ApiError;
    const maxAttempts = (config.retries ?? this.config.retry.attempts) + 1;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await this.executeRequest<T>(config);
        
        if (attempt > 1) {
          this.metricsCollector.recordRetry(config, attempt - 1);
        }
        
        return response;
      } catch (error) {
        lastError = this.normalizeError(error);
        
        if (attempt === maxAttempts || !this.shouldRetry(lastError, attempt)) {
          break;
        }
        
        const delay = this.calculateRetryDelay(attempt);
        await this.delay(delay);
        
        this.emit('retry', { config, attempt, error: lastError });
      }
    }
    
    throw lastError!;
  }

  private async executeRequest<T>(config: ApiRequestConfig): Promise<ApiResponse<T>> {
    const startTime = performance.now();
    const controller = new AbortController();
    
    // Set up timeout
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, config.timeout || this.config.timeout);
    
    try {
      const fetchConfig: RequestInit = {
        method: config.method || 'GET',
        headers: { ...this.config.headers, ...config.headers },
        signal: controller.signal
      };
      
      if (config.data && ['POST', 'PUT', 'PATCH'].includes(config.method || '')) {
        if (config.data instanceof FormData) {
          fetchConfig.body = config.data;
          delete (fetchConfig.headers as any)['Content-Type']; // Let browser set it
        } else {
          fetchConfig.body = JSON.stringify(config.data);
        }
      }
      
      // Add query parameters
      let url = config.url;
      if (config.params && Object.keys(config.params).length > 0) {
        const searchParams = new URLSearchParams();
        Object.entries(config.params).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            searchParams.append(key, String(value));
          }
        });
        url += (url.includes('?') ? '&' : '?') + searchParams.toString();
      }
      
      const response = await fetch(url, fetchConfig);
      const endTime = performance.now();
      
      clearTimeout(timeoutId);
      
      const responseData = await this.parseResponse<T>(response);
      
      const apiResponse: ApiResponse<T> = {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: this.parseHeaders(response.headers),
        timestamp: Date.now(),
        requestId: config.metadata?.requestId
      };
      
      if (!response.ok) {
        const error: ApiError = {
          status: response.status,
          statusText: response.statusText,
          message: this.extractErrorMessage(responseData),
          details: responseData,
          timestamp: Date.now(),
          requestId: config.metadata?.requestId
        };
        throw error;
      }
      
      // Record timing
      this.metricsCollector.recordTiming(config, endTime - startTime);
      
      return apiResponse;
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw this.createTimeoutError(config);
      }
      
      throw error;
    }
  }

  // Interceptor management
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
    this.requestInterceptors.sort((a, b) => b.priority - a.priority);
  }

  removeRequestInterceptor(id: string): void {
    this.requestInterceptors = this.requestInterceptors.filter(i => i.id !== id);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
    this.responseInterceptors.sort((a, b) => b.priority - a.priority);
  }

  removeResponseInterceptor(id: string): void {
    this.responseInterceptors = this.responseInterceptors.filter(i => i.id !== id);
  }

  private async processRequestInterceptors(config: ApiRequestConfig): Promise<ApiRequestConfig> {
    let processedConfig = { ...config };
    
    for (const interceptor of this.requestInterceptors) {
      try {
        processedConfig = await interceptor.onRequest(processedConfig);
      } catch (error) {
        if (interceptor.onError) {
          await interceptor.onError(this.normalizeError(error));
        }
        throw error;
      }
    }
    
    return processedConfig;
  }

  private async processResponseInterceptors(response: ApiResponse): Promise<ApiResponse> {
    let processedResponse = { ...response };
    
    for (const interceptor of this.responseInterceptors) {
      try {
        processedResponse = await interceptor.onResponse(processedResponse);
      } catch (error) {
        if (interceptor.onError) {
          const apiError = this.normalizeError(error);
          await interceptor.onError(apiError);
          throw apiError;
        }
        throw error;
      }
    }
    
    return processedResponse;
  }

  // Utility methods
  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      return response.json();
    } else if (contentType.includes('text/')) {
      return response.text() as any;
    } else if (contentType.includes('application/octet-stream') || contentType.includes('application/pdf')) {
      return response.blob() as any;
    } else {
      return response.text() as any;
    }
  }

  private parseHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  private extractErrorMessage(data: any): string {
    if (typeof data === 'string') return data;
    if (data?.message) return data.message;
    if (data?.error?.message) return data.error.message;
    if (data?.error) return String(data.error);
    return 'An unexpected error occurred';
  }

  private normalizeError(error: any, requestId?: string): ApiError {
    if (error.status && error.message) {
      return { ...error, timestamp: Date.now(), requestId };
    }
    
    return {
      status: 0,
      statusText: 'Unknown Error',
      message: error.message || 'An unexpected error occurred',
      details: error,
      timestamp: Date.now(),
      requestId
    };
  }

  private createTimeoutError(config: ApiRequestConfig): ApiError {
    return {
      status: 408,
      statusText: 'Request Timeout',
      message: `Request to ${config.url} timed out after ${config.timeout || this.config.timeout}ms`,
      timestamp: Date.now(),
      requestId: config.metadata?.requestId
    };
  }

  private shouldRetry(error: ApiError, attempt: number): boolean {
    return this.config.retry.retryCondition(error);
  }

  private calculateRetryDelay(attempt: number): number {
    const { delay, backoff } = this.config.retry;
    
    switch (backoff) {
      case 'exponential':
        return delay * Math.pow(2, attempt - 1);
      case 'linear':
        return delay * attempt;
      case 'fixed':
      default:
        return delay;
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateLoadingKey(config: ApiRequestConfig): string {
    return `${config.method || 'GET'}_${config.url}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public API for accessing managers
  getMetrics(): ApiMetrics {
    return this.metricsCollector.getMetrics();
  }

  getLoadingState(key: string): LoadingState {
    return this.loadingStateManager.getState(key);
  }

  subscribeToLoadingState(key: string, callback: (state: LoadingState) => void): () => void {
    return this.loadingStateManager.subscribe(key, callback);
  }

  clearCache(pattern?: string): void {
    this.cacheManager.clear(pattern);
  }

  getTokenManager(): TokenManager {
    return this.tokenManager;
  }

  async healthCheck(): Promise<HealthStatus[]> {
    // Implementation for health checks
    return [];
  }
}

export default ApiClient;