// Base API client with authentication and error handling
import { api_base_url } from '@/utils/const';
import { getAuthHeaders } from '@/utils/auth';

class ApiError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
  }
}

class NetworkError extends Error {
  constructor(message, originalError) {
    super(message);
    this.name = 'NetworkError';
    this.originalError = originalError;
  }
}

class ServiceError extends Error {
  constructor(message, originalError) {
    super(message);
    this.name = 'ServiceError';
    this.originalError = originalError;
  }
}

class ServiceUnavailableError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ServiceUnavailableError';
  }
}

class CircuitBreaker {
  constructor(failureThreshold = 5, timeout = 60000) {
    this.failureThreshold = failureThreshold;
    this.timeout = timeout;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
  }

  isOpen() {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime >= this.timeout) {
        this.state = 'HALF_OPEN';
        return false;
      }
      return true;
    }
    return false;
  }

  recordSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }
}

export class ApiClient {
  constructor() {
    this.baseURL = api_base_url;
    this.circuitBreaker = new CircuitBreaker();
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2
    };
  }

  async request(url, options = {}) {
    const {
      method = 'GET',
      retries = this.retryConfig.maxRetries,
      getAccessTokenSilently,
      ...fetchOptions
    } = options;

    // Circuit breaker check
    if (this.circuitBreaker.isOpen()) {
      throw new ServiceUnavailableError('Service temporarily unavailable');
    }

    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    
    try {
      const headers = getAccessTokenSilently ? 
        await getAuthHeaders(getAccessTokenSilently) : 
        { 'Content-Type': 'application/json' };

      const response = await this.fetchWithRetry(fullUrl, {
        method,
        headers,
        ...fetchOptions
      }, retries);

      if (!response.ok) {
        throw new ApiError(
          `API request failed: ${response.statusText}`,
          response.status,
          response
        );
      }

      const data = await response.json();
      
      // Record success for circuit breaker
      this.circuitBreaker.recordSuccess();
      
      return data;

    } catch (error) {
      // Record failure for circuit breaker
      this.circuitBreaker.recordFailure();
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error.name === 'TypeError' || error.message.includes('fetch')) {
        throw new NetworkError('Network connection failed', error);
      }

      if (error.status >= 500) {
        throw new ServiceError('Server error - please try again later', error);
      }

      throw error;
    }
  }

  async fetchWithRetry(url, options, retries) {
    let lastError;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, options);
        return response;
      } catch (error) {
        lastError = error;
        
        if (attempt < retries) {
          const delay = Math.min(
            this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt),
            this.retryConfig.maxDelay
          );
          
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  async get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  }

  async post(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export error classes
export { ApiError, NetworkError, ServiceError, ServiceUnavailableError };