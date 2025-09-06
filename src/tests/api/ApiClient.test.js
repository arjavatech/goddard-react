/**
 * API Client Tests
 * Comprehensive test suite for the API service layer
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ApiClient } from '../../services/api/core/ApiClient';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock performance.now
global.performance = { now: vi.fn(() => Date.now()) };

describe('ApiClient', () => {
  let apiClient;
  let mockConfig;

  beforeEach(() => {
    mockConfig = {
      baseURL: 'https://api.example.com',
      timeout: 5000,
      headers: { 'Content-Type': 'application/json' },
      retry: {
        attempts: 3,
        delay: 1000,
        backoff: 'exponential',
        retryCondition: (error) => error.status >= 500
      },
      circuitBreaker: {
        enabled: false,
        failureThreshold: 5,
        recoveryTimeout: 60000,
        monitoringPeriod: 10000
      },
      cache: {
        enabled: false,
        defaultTTL: 300000,
        maxEntries: 1000,
        storageType: 'memory',
        keyPrefix: 'test_cache_'
      },
      rateLimit: {
        enabled: false,
        requests: 100,
        windowMs: 60000
      },
      auth: {
        tokenStorage: 'memory',
        autoRefresh: false,
        refreshThreshold: 300
      },
      logging: {
        enabled: false,
        level: 'info',
        includeHeaders: false,
        includeData: false,
        maxBodySize: 1024
      }
    };

    apiClient = new ApiClient(mockConfig);
    
    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic HTTP Methods', () => {
    it('should make GET requests', async () => {
      const mockResponse = { data: { id: 1, name: 'test' } };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse.data
      });

      const result = await apiClient.get('/users/1');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users/1',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
      expect(result.data).toEqual(mockResponse.data);
      expect(result.status).toBe(200);
    });

    it('should make POST requests with data', async () => {
      const requestData = { name: 'New User', email: 'user@example.com' };
      const mockResponse = { data: { id: 2, ...requestData } };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        statusText: 'Created',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse.data
      });

      const result = await apiClient.post('/users', requestData);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestData),
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
      expect(result.data).toEqual(mockResponse.data);
      expect(result.status).toBe(201);
    });

    it('should handle query parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ users: [] })
      });

      await apiClient.get('/users', { 
        params: { 
          page: 1, 
          limit: 10, 
          search: 'john' 
        } 
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users?page=1&limit=10&search=john',
        expect.any(Object)
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle HTTP errors', async () => {
      const errorResponse = { message: 'User not found' };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => errorResponse
      });

      await expect(apiClient.get('/users/999')).rejects.toMatchObject({
        status: 404,
        statusText: 'Not Found',
        message: 'User not found'
      });
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Network error'));

      await expect(apiClient.get('/users')).rejects.toMatchObject({
        status: 0,
        message: expect.stringContaining('Network error')
      });
    });

    it('should handle timeout errors', async () => {
      // Mock a slow response that exceeds timeout
      mockFetch.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(resolve, 10000))
      );

      apiClient = new ApiClient({ ...mockConfig, timeout: 100 });

      await expect(apiClient.get('/users')).rejects.toMatchObject({
        status: 408,
        statusText: 'Request Timeout'
      });
    });
  });

  describe('Request Interceptors', () => {
    it('should apply request interceptors', async () => {
      const mockInterceptor = vi.fn((config) => ({
        ...config,
        headers: { ...config.headers, 'X-Custom-Header': 'test-value' }
      }));

      apiClient.addRequestInterceptor({
        id: 'test-interceptor',
        priority: 100,
        onRequest: mockInterceptor
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        json: async () => ({})
      });

      await apiClient.get('/test');

      expect(mockInterceptor).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom-Header': 'test-value'
          })
        })
      );
    });
  });

  describe('Response Interceptors', () => {
    it('should apply response interceptors', async () => {
      const mockInterceptor = vi.fn((response) => ({
        ...response,
        data: { ...response.data, intercepted: true }
      }));

      apiClient.addResponseInterceptor({
        id: 'test-interceptor',
        priority: 100,
        onResponse: mockInterceptor
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        json: async () => ({ original: true })
      });

      const result = await apiClient.get('/test');

      expect(mockInterceptor).toHaveBeenCalled();
      expect(result.data).toMatchObject({
        original: true,
        intercepted: true
      });
    });
  });

  describe('Retry Logic', () => {
    it('should retry on server errors', async () => {
      // First call fails, second succeeds
      mockFetch
        .mockRejectedValueOnce({
          status: 500,
          statusText: 'Internal Server Error',
          message: 'Server error'
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: new Headers(),
          json: async () => ({ success: true })
        });

      const result = await apiClient.get('/test');

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result.data).toMatchObject({ success: true });
    });

    it('should not retry on client errors', async () => {
      mockFetch.mockRejectedValueOnce({
        status: 400,
        statusText: 'Bad Request',
        message: 'Bad request'
      });

      await expect(apiClient.get('/test')).rejects.toMatchObject({
        status: 400,
        message: 'Bad request'
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Request Deduplication', () => {
    it('should deduplicate identical GET requests', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        json: async () => ({ data: 'test' })
      });

      // Make two identical requests simultaneously
      const [result1, result2] = await Promise.all([
        apiClient.get('/test'),
        apiClient.get('/test')
      ]);

      // Should only make one actual fetch call
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result1.data).toEqual(result2.data);
    });
  });

  describe('Metrics Collection', () => {
    it('should collect request metrics', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        json: async () => ({})
      });

      await apiClient.get('/test');

      const metrics = apiClient.getMetrics();
      
      expect(metrics.totalRequests).toBe(1);
      expect(metrics.successfulRequests).toBe(1);
      expect(metrics.failedRequests).toBe(0);
    });

    it('should track error metrics', async () => {
      mockFetch.mockRejectedValueOnce({
        status: 500,
        statusText: 'Internal Server Error',
        message: 'Server error'
      });

      try {
        await apiClient.get('/test');
      } catch (error) {
        // Expected error
      }

      const metrics = apiClient.getMetrics();
      
      expect(metrics.totalRequests).toBe(1);
      expect(metrics.successfulRequests).toBe(0);
      expect(metrics.failedRequests).toBe(1);
      expect(metrics.errorsByStatus[500]).toBe(1);
    });
  });

  describe('Loading State Management', () => {
    it('should manage loading states', async () => {
      const loadingKey = 'GET_/test';
      
      mockFetch.mockImplementationOnce(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            status: 200,
            statusText: 'OK',
            headers: new Headers(),
            json: async () => ({})
          }), 100)
        )
      );

      // Start request
      const requestPromise = apiClient.get('/test');
      
      // Check loading state
      const loadingState = apiClient.getLoadingState(loadingKey);
      expect(loadingState.isLoading).toBe(true);
      expect(loadingState.isError).toBe(false);

      // Wait for completion
      await requestPromise;
      
      // Check final state
      const finalState = apiClient.getLoadingState(loadingKey);
      expect(finalState.isLoading).toBe(false);
      expect(finalState.isError).toBe(false);
    });
  });
});

describe('Token Management', () => {
  let tokenManager;

  beforeEach(() => {
    tokenManager = new (require('../../services/api/core/TokenManager').TokenManager)({
      tokenStorage: 'memory',
      autoRefresh: false,
      refreshThreshold: 300
    });
  });

  it('should store and retrieve tokens', async () => {
    const tokens = {
      accessToken: 'test-token',
      tokenType: 'Bearer',
      expiresAt: Date.now() + 3600000 // 1 hour from now
    };

    await tokenManager.setTokens(tokens);
    const retrievedTokens = await tokenManager.getValidToken();

    expect(retrievedTokens).toEqual(tokens);
  });

  it('should detect expired tokens', async () => {
    const expiredTokens = {
      accessToken: 'expired-token',
      tokenType: 'Bearer',
      expiresAt: Date.now() - 1000 // 1 second ago
    };

    await tokenManager.setTokens(expiredTokens);
    const retrievedTokens = await tokenManager.getValidToken();

    expect(retrievedTokens).toBeNull();
  });
});

describe('Cache Management', () => {
  let cacheManager;

  beforeEach(() => {
    cacheManager = new (require('../../services/api/core/CacheManager').CacheManager)({
      enabled: true,
      defaultTTL: 300000,
      maxEntries: 1000,
      storageType: 'memory',
      keyPrefix: 'test_'
    });
  });

  it('should cache and retrieve data', async () => {
    const testData = { id: 1, name: 'test' };
    
    await cacheManager.set('/test', testData);
    const cached = await cacheManager.get('/test');

    expect(cached).toBeDefined();
    expect(cached.data).toEqual(testData);
    expect(cached.hit).toBe(true);
  });

  it('should respect TTL', async () => {
    const testData = { id: 1, name: 'test' };
    
    await cacheManager.set('/test', testData, 100); // 100ms TTL
    
    // Should be available immediately
    let cached = await cacheManager.get('/test');
    expect(cached).toBeDefined();
    
    // Wait for expiry
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Should be expired now
    cached = await cacheManager.get('/test');
    expect(cached).toBeNull();
  });
});

describe('Integration Tests', () => {
  let apiClient;

  beforeEach(() => {
    apiClient = new ApiClient({
      baseURL: 'https://api.example.com',
      timeout: 5000,
      retry: { attempts: 2, delay: 100, backoff: 'fixed', retryCondition: () => true },
      cache: { enabled: true, defaultTTL: 1000, maxEntries: 10, storageType: 'memory', keyPrefix: 'test_' },
      circuitBreaker: { enabled: false, failureThreshold: 3, recoveryTimeout: 1000, monitoringPeriod: 1000 },
      rateLimit: { enabled: false, requests: 10, windowMs: 1000 },
      auth: { tokenStorage: 'memory', autoRefresh: false, refreshThreshold: 300 },
      logging: { enabled: false, level: 'info', includeHeaders: false, includeData: false, maxBodySize: 1024 }
    });

    vi.clearAllMocks();
  });

  it('should handle complete request lifecycle with caching', async () => {
    const testData = { id: 1, name: 'test' };
    
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => testData
    });

    // First request
    const result1 = await apiClient.get('/users/1');
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(result1.data).toEqual(testData);

    // Second request should use cache
    const result2 = await apiClient.get('/users/1');
    expect(mockFetch).toHaveBeenCalledTimes(1); // Still 1, cached
    expect(result2.data).toEqual(testData);

    // Verify metrics
    const metrics = apiClient.getMetrics();
    expect(metrics.totalRequests).toBe(1); // Only one actual request
    expect(metrics.successfulRequests).toBe(1);
  });
});

export { }; // Make this a module