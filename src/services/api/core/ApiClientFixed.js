/**
 * Auth-Compatible API Client 
 * Fixed to work better with existing Auth0 patterns
 */

import { getAuthHeaders } from '../../utils/auth';
import { withRetry, handleApiError } from '../../utils/errorHandler';
import { api_base_url, school_id } from '../../utils/const';

class ApiClientFixed {
  constructor(getAccessTokenSilently, logout) {
    this.getAccessTokenSilently = getAccessTokenSilently;
    this.logout = logout;
    this.baseURL = api_base_url;
    this.schoolId = school_id;
    this.cache = new Map();
    
    // FIXED: Separate deduplication for auth vs non-auth requests
    this.pendingRequests = new Map();
    this.authRequests = new Map(); // Separate tracking for auth requests
    
    this.requestMetrics = {
      total: 0,
      success: 0,
      failed: 0,
      cached: 0
    };
  }

  // FIXED: Don't deduplicate auth token requests
  getRequestKey(url, options = {}) {
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : '';
    
    // Don't include auth requests in deduplication
    const isAuthRequest = url.includes('/sign_in/check') || url.includes('/auth') || url.includes('/token');
    if (isAuthRequest) {
      return `auth:${Date.now()}:${Math.random()}`; // Always unique for auth
    }
    
    return `${method}:${url}:${body}`;
  }

  async executeRequest(url, options) {
    const { method, body, timeout = 15000, context, retries, ...fetchOptions } = options;

    const makeRequest = async () => {
      // FIXED: Longer timeout for auth requests, no abort for token calls
      const isAuthRequest = url.includes('/sign_in/check') || url.includes('/auth');
      const requestTimeout = isAuthRequest ? 30000 : timeout; // 30s for auth, normal for others
      
      let controller, timeoutId;
      
      // FIXED: Don't use AbortController for auth requests
      if (!isAuthRequest) {
        controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), requestTimeout);
      }

      try {
        // FIXED: Handle auth errors more gracefully
        let headers;
        try {
          headers = await getAuthHeaders(this.getAccessTokenSilently);
        } catch (authError) {
          console.error('❌ Auth token acquisition failed:', authError);
          
          // Don't retry auth failures - they usually indicate session issues
          const error = new Error(`Authentication failed: ${authError.message}`);
          error.authError = true;
          throw error;
        }
        
        const fetchConfig = {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
            ...fetchOptions.headers
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: controller?.signal, // Only if controller exists
          ...fetchOptions
        };

        console.log(`🌐 ${method} ${url}`, { context, hasAuth: !!headers.Authorization });

        const response = await fetch(url, fetchConfig);
        
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        if (!response.ok) {
          const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
          error.status = response.status;
          error.response = response;
          
          // FIXED: Mark auth-related errors
          if (response.status === 401 || response.status === 403) {
            error.authError = true;
          }
          
          throw error;
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await response.json();
        }
        
        return response;
      } catch (error) {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        // FIXED: Don't retry auth errors
        if (error.authError) {
          throw error;
        }
        
        throw error;
      }
    };

    // FIXED: Different retry logic for auth vs non-auth requests
    const isAuthRequest = url.includes('/sign_in/check') || url.includes('/auth');
    
    if (retries && !isAuthRequest) {
      return withRetry(makeRequest, context);
    }

    try {
      return await makeRequest();
    } catch (error) {
      // FIXED: Handle auth errors specifically
      if (error.authError) {
        console.error('🚨 Authentication error - potentially logging out:', error);
        handleApiError(error, context, {
          onLogoutRequired: this.logout
        });
      } else {
        handleApiError(error, context, {
          onLogoutRequired: this.logout
        });
      }
      throw error;
    }
  }

  // Rest of the methods remain the same...
  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      body,
      params,
      cache = method === 'GET',
      cacheTTL = 5 * 60 * 1000,
      retries = true,
      timeout = 10000,
      context = 'API request',
      ...fetchOptions
    } = options;

    const url = this.buildURL(endpoint, params);
    const requestKey = this.getRequestKey(url, { method, body });
    
    // FIXED: No deduplication for auth requests
    const isAuthRequest = url.includes('/sign_in/check') || url.includes('/auth');
    
    if (!isAuthRequest && this.pendingRequests.has(requestKey)) {
      console.log(`🔄 Deduplicating request: ${requestKey}`);
      return this.pendingRequests.get(requestKey);
    }

    // Cache check for GET requests (non-auth)
    if (cache && method === 'GET' && !isAuthRequest) {
      const cacheKey = this.getCacheKey(url, { params });
      const cached = this.getCachedResponse(cacheKey);
      if (cached) {
        console.log(`💾 Cache hit: ${cacheKey}`);
        this.requestMetrics.cached++;
        return cached;
      }
    }

    const requestPromise = this.executeRequest(url, {
      method,
      body,
      timeout,
      context,
      retries,
      ...fetchOptions
    });

    // Only deduplicate non-auth requests
    if (!isAuthRequest) {
      this.pendingRequests.set(requestKey, requestPromise);
    }

    try {
      const response = await requestPromise;
      
      // Cache successful GET responses (non-auth)
      if (cache && method === 'GET' && response && !isAuthRequest) {
        const cacheKey = this.getCacheKey(url, { params });
        this.setCachedResponse(cacheKey, response, cacheTTL);
      }

      this.requestMetrics.success++;
      return response;
    } catch (error) {
      this.requestMetrics.failed++;
      throw error;
    } finally {
      if (!isAuthRequest) {
        this.pendingRequests.delete(requestKey);
      }
      this.requestMetrics.total++;
    }
  }

  buildURL(endpoint, params = {}) {
    let url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    url = url.replace('{school_id}', this.schoolId);
    
    if (Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }
    
    return url;
  }

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

  getCacheKey(url, options = {}) {
    const method = options.method || 'GET';
    if (method !== 'GET') return null;
    return `cache:${url}:${JSON.stringify(options.params || {})}`;
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
}

export default ApiClientFixed;