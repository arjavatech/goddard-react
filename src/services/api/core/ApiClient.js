/**
 * Centralized API Client with advanced features
 * Handles authentication, caching, retries, and monitoring
 */

import { getAuthHeaders } from '../../../utils/auth';
import { withRetry, handleApiError } from '../../../utils/errorHandler';
import { api_base_url, school_id } from '../../../utils/const';

export default class ApiClient {
  constructor(getAccessTokenSilently, logout) {
    this.getAccessTokenSilently = getAccessTokenSilently;
    this.logout = logout;
    this.baseURL = api_base_url;
    this.schoolId = school_id;
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.requestMetrics = {
      total: 0,
      success: 0,
      failed: 0,
      cached: 0
    };
  }

  // Request deduplication - prevents duplicate concurrent requests
  getRequestKey(url, options = {}) {
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${body}`;
  }

  // Cache management
  getCacheKey(url, options = {}) {
    const method = options.method || 'GET';
    if (method !== 'GET') return null;
    return `cache:${url}:${JSON.stringify(options.params || {})}`;
  }

  // Main request method with all features
  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      body,
      params,
      cache = method === 'GET',
      cacheTTL = 5 * 60 * 1000, // 5 minutes
      retries = true,
      timeout = 10000,
      context = 'API request',
      ...fetchOptions
    } = options;

    const url = this.buildURL(endpoint, params);
    const requestKey = this.getRequestKey(url, { method, body });
    
    // Request deduplication
    if (this.pendingRequests.has(requestKey)) {
      console.log(`🔄 Deduplicating request: ${requestKey}`);
      return this.pendingRequests.get(requestKey);
    }

    // Cache check for GET requests
    if (cache && method === 'GET') {
      const cacheKey = this.getCacheKey(url, { params });
      const cached = this.getCachedResponse(cacheKey);
      if (cached) {
        console.log(`💾 Cache hit: ${cacheKey}`);
        this.requestMetrics.cached++;
        return cached;
      }
    }

    // Create the request promise
    const requestPromise = this.executeRequest(url, {
      method,
      body,
      timeout,
      context,
      retries,
      ...fetchOptions
    });

    // Store pending request for deduplication
    this.pendingRequests.set(requestKey, requestPromise);

    try {
      const response = await requestPromise;
      
      // Cache successful GET responses
      if (cache && method === 'GET' && response) {
        const cacheKey = this.getCacheKey(url, { params });
        this.setCachedResponse(cacheKey, response, cacheTTL);
      }

      this.requestMetrics.success++;
      return response;
    } catch (error) {
      this.requestMetrics.failed++;
      throw error;
    } finally {
      this.pendingRequests.delete(requestKey);
      this.requestMetrics.total++;
    }
  }

  async executeRequest(url, options) {
    const { method, body, timeout, context, retries, ...fetchOptions } = options;

    const makeRequest = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const headers = await getAuthHeaders(this.getAccessTokenSilently);
        
        const fetchConfig = {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
            ...fetchOptions.headers
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
          ...fetchOptions
        };

        console.log(`🌐 ${method} ${url}`, { context });

        const response = await fetch(url, fetchConfig);
        clearTimeout(timeoutId);

        if (!response.ok) {
          const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
          error.status = response.status;
          error.response = response;
          throw error;
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await response.json();
        }
        
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    };

    if (retries) {
      return withRetry(makeRequest, context);
    }

    try {
      return await makeRequest();
    } catch (error) {
      handleApiError(error, context, {
        onLogoutRequired: this.logout
      });
      throw error;
    }
  }

  buildURL(endpoint, params = {}) {
    let url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    // Replace school_id placeholder
    url = url.replace('{school_id}', this.schoolId);
    
    // Add query parameters
    if (Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }
    
    return url;
  }

  // Cache methods
  getCachedResponse(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const { data, expiry } = cached;
    if (Date.now() > expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return data;
  }

  setCachedResponse(key, data, ttl) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl
    });
  }

  clearCache(pattern = null) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Convenience methods
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body, cache: false });
  }

  async put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body, cache: false });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE', cache: false });
  }

  // Metrics and monitoring
  getMetrics() {
    return {
      ...this.requestMetrics,
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      successRate: this.requestMetrics.total > 0 
        ? (this.requestMetrics.success / this.requestMetrics.total * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  // Health check
  async healthCheck() {
    try {
      await this.get('/health', { timeout: 5000, cache: false });
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        error: error.message, 
        timestamp: new Date().toISOString() 
      };
    }
  }
}