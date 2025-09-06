/**
 * API Service Types and Interfaces
 * Comprehensive type definitions for API service layer
 */

// Base API Response Types
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  timestamp: number;
  requestId?: string;
}

export interface ApiError {
  status: number;
  statusText: string;
  message: string;
  code?: string;
  details?: any;
  timestamp: number;
  requestId?: string;
}

// Request Configuration
export interface ApiRequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  data?: any;
  params?: Record<string, any>;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  cacheTTL?: number;
  requiresAuth?: boolean;
  skipInterceptors?: boolean;
  priority?: 'low' | 'normal' | 'high';
  metadata?: Record<string, any>;
}

// Authentication Types
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresAt: number;
  scope?: string;
}

export interface TokenRefreshResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

// Cache Types
export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  etag?: string;
  lastModified?: string;
  hit: boolean;
}

export interface CacheConfig {
  enabled: boolean;
  defaultTTL: number;
  maxEntries: number;
  storageType: 'memory' | 'localStorage' | 'sessionStorage';
  keyPrefix: string;
}

// Retry Configuration
export interface RetryConfig {
  attempts: number;
  delay: number;
  backoff: 'fixed' | 'exponential' | 'linear';
  retryCondition: (error: ApiError) => boolean;
}

// Circuit Breaker Configuration
export interface CircuitBreakerConfig {
  enabled: boolean;
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
}

export type CircuitState = 'closed' | 'open' | 'half-open';

// Rate Limiting
export interface RateLimitConfig {
  enabled: boolean;
  requests: number;
  windowMs: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

// API Client Configuration
export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
  retry: RetryConfig;
  circuitBreaker: CircuitBreakerConfig;
  cache: CacheConfig;
  rateLimit: RateLimitConfig;
  auth: {
    tokenStorage: 'localStorage' | 'sessionStorage' | 'memory';
    autoRefresh: boolean;
    refreshThreshold: number; // seconds before expiry
  };
  logging: {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
    includeHeaders: boolean;
    includeData: boolean;
    maxBodySize: number;
  };
}

// Request/Response Interceptors
export interface RequestInterceptor {
  id: string;
  priority: number;
  onRequest: (config: ApiRequestConfig) => ApiRequestConfig | Promise<ApiRequestConfig>;
  onError?: (error: ApiError) => void | Promise<void>;
}

export interface ResponseInterceptor {
  id: string;
  priority: number;
  onResponse: (response: ApiResponse) => ApiResponse | Promise<ApiResponse>;
  onError?: (error: ApiError) => ApiError | Promise<ApiError>;
}

// Metrics and Monitoring
export interface ApiMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  cacheHitRate: number;
  retryCount: number;
  circuitBreakerTrips: number;
  rateLimitHits: number;
  errorsByStatus: Record<number, number>;
  requestsByEndpoint: Record<string, number>;
  timestamp: number;
}

export interface RequestTiming {
  startTime: number;
  endTime: number;
  duration: number;
  cacheHit: boolean;
  retryCount: number;
}

// Loading State Management
export interface LoadingState {
  isLoading: boolean;
  isError: boolean;
  error: ApiError | null;
  progress?: number;
  retryCount?: number;
  lastRequestTime?: number;
}

export interface LoadingStateManager {
  getState: (key: string) => LoadingState;
  setState: (key: string, state: Partial<LoadingState>) => void;
  clearState: (key: string) => void;
  subscribe: (key: string, callback: (state: LoadingState) => void) => () => void;
}

// Request Queue
export interface QueuedRequest {
  id: string;
  config: ApiRequestConfig;
  priority: number;
  timestamp: number;
  resolve: (value: ApiResponse) => void;
  reject: (error: ApiError) => void;
}

// Event Types
export interface ApiEvent {
  type: 'request' | 'response' | 'error' | 'retry' | 'cache' | 'auth';
  timestamp: number;
  data: any;
  metadata?: Record<string, any>;
}

// Service Registry
export interface ServiceEndpoint {
  name: string;
  baseURL: string;
  version?: string;
  timeout?: number;
  retries?: number;
  rateLimit?: RateLimitConfig;
  authentication?: boolean;
  healthCheck?: string;
}

// Health Check
export interface HealthStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  timestamp: number;
  details?: any;
}

// Pagination
export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta?: Record<string, any>;
}

// Filter and Sort
export interface QueryFilters {
  [key: string]: any;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface QueryOptions {
  page?: number;
  pageSize?: number;
  sort?: SortConfig[];
  filters?: QueryFilters;
  search?: string;
  include?: string[];
  exclude?: string[];
}

// Data Transfer Objects
export interface CreateUserRequest {
  email: string;
  name: string;
  role?: string;
  metadata?: Record<string, any>;
}

export interface UpdateUserRequest {
  name?: string;
  role?: string;
  metadata?: Record<string, any>;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface FormSubmission {
  id: string;
  formId: string;
  userId: string;
  data: Record<string, any>;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

export interface CreateFormSubmissionRequest {
  formId: string;
  data: Record<string, any>;
  status?: 'draft' | 'submitted';
}

export interface UpdateFormSubmissionRequest {
  data?: Record<string, any>;
  status?: 'draft' | 'submitted' | 'approved' | 'rejected';
}

// Webhook Types
export interface WebhookPayload {
  event: string;
  timestamp: number;
  data: any;
  signature?: string;
}

// Export all types for easier imports
export type * from './index';