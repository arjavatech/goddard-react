// Advanced retry service with circuit breaker pattern
class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000, resetTimeout = 30000) {
    this.failureThreshold = threshold;
    this.timeout = timeout;
    this.resetTimeout = resetTimeout;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.nextAttempt = null;
  }

  async call(operation, ...args) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await operation(...args);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
    this.nextAttempt = null;
  }

  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeout;
    }
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      nextAttempt: this.nextAttempt
    };
  }
}

export class RetryService {
  constructor() {
    this.circuits = new Map();
    this.activeRequests = new Map();
  }

  getCircuitBreaker(key) {
    if (!this.circuits.has(key)) {
      this.circuits.set(key, new CircuitBreaker());
    }
    return this.circuits.get(key);
  }

  async retryWithBackoff(
    operation,
    options = {}
  ) {
    const {
      maxRetries = 3,
      baseDelay = 1000,
      maxDelay = 10000,
      backoffFactor = 2,
      jitter = true,
      circuitBreakerKey = 'default',
      retryCondition = (error) => !error.message.includes('4') // Don't retry client errors
    } = options;

    const circuitBreaker = this.getCircuitBreaker(circuitBreakerKey);
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Use circuit breaker for the operation
        return await circuitBreaker.call(operation);
        
      } catch (error) {
        lastError = error;
        
        // Check if we should retry
        if (attempt === maxRetries || !retryCondition(error)) {
          throw error;
        }

        // Calculate delay with exponential backoff
        let delay = Math.min(
          baseDelay * Math.pow(backoffFactor, attempt),
          maxDelay
        );

        // Add jitter to avoid thundering herd
        if (jitter) {
          delay = delay * (0.5 + Math.random() * 0.5);
        }

        console.warn(
          `Retry attempt ${attempt + 1}/${maxRetries} after ${delay.toFixed(0)}ms delay`,
          { error: error.message, circuitState: circuitBreaker.getState() }
        );

        await this.delay(delay);
      }
    }

    throw lastError;
  }

  async requestWithDeduplication(
    requestKey,
    requestFactory,
    retryOptions = {}
  ) {
    // Check if request is already in progress
    if (this.activeRequests.has(requestKey)) {
      console.log(`Deduplicating request: ${requestKey}`);
      return this.activeRequests.get(requestKey);
    }

    // Create new request with retry logic
    const requestPromise = this.retryWithBackoff(
      requestFactory,
      {
        ...retryOptions,
        circuitBreakerKey: requestKey
      }
    ).finally(() => {
      // Clean up after request completes
      this.activeRequests.delete(requestKey);
    });

    // Store the promise for deduplication
    this.activeRequests.set(requestKey, requestPromise);
    
    return requestPromise;
  }

  // Network-aware retry with online/offline detection
  async networkAwareRetry(operation, options = {}) {
    const {
      offlineRetryDelay = 5000,
      maxOfflineRetries = 3,
      ...retryOptions
    } = options;

    // Check if we're online
    if (!navigator.onLine) {
      throw new Error('Network is offline');
    }

    try {
      return await this.retryWithBackoff(operation, retryOptions);
    } catch (error) {
      // If network went offline during request
      if (!navigator.onLine) {
        console.log('Network went offline, waiting for reconnection...');
        
        return new Promise((resolve, reject) => {
          let offlineAttempts = 0;
          
          const handleOnline = async () => {
            window.removeEventListener('online', handleOnline);
            
            try {
              const result = await this.retryWithBackoff(operation, retryOptions);
              resolve(result);
            } catch (retryError) {
              reject(retryError);
            }
          };

          const checkOnline = () => {
            if (navigator.onLine) {
              handleOnline();
            } else {
              offlineAttempts++;
              if (offlineAttempts >= maxOfflineRetries) {
                reject(new Error('Max offline retry attempts reached'));
                return;
              }
              setTimeout(checkOnline, offlineRetryDelay);
            }
          };

          // Listen for online event
          window.addEventListener('online', handleOnline);
          
          // Also poll periodically
          setTimeout(checkOnline, offlineRetryDelay);
        });
      }
      
      throw error;
    }
  }

  // Batch multiple requests with retry
  async batchRetry(operations, options = {}) {
    const {
      concurrency = 3,
      failFast = false,
      ...retryOptions
    } = options;

    const results = [];
    const errors = [];

    // Process operations in batches
    for (let i = 0; i < operations.length; i += concurrency) {
      const batch = operations.slice(i, i + concurrency);
      
      const batchPromises = batch.map(async (operation, index) => {
        try {
          const result = await this.retryWithBackoff(operation, retryOptions);
          return { success: true, result, index: i + index };
        } catch (error) {
          const errorResult = { success: false, error, index: i + index };
          if (failFast) {
            throw errorResult;
          }
          return errorResult;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(result => {
        if (result.success) {
          results[result.index] = result.result;
        } else {
          errors[result.index] = result.error;
        }
      });

      if (failFast && errors.length > 0) {
        break;
      }
    }

    return { results, errors };
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get circuit breaker status for monitoring
  getCircuitBreakerStatus() {
    const status = {};
    this.circuits.forEach((circuit, key) => {
      status[key] = circuit.getState();
    });
    return status;
  }

  // Reset circuit breaker
  resetCircuitBreaker(key) {
    if (this.circuits.has(key)) {
      const circuit = this.circuits.get(key);
      circuit.failureCount = 0;
      circuit.state = 'CLOSED';
      circuit.nextAttempt = null;
    }
  }

  // Clear all active requests (useful for cleanup)
  clearActiveRequests() {
    this.activeRequests.clear();
  }
}

export const retryService = new RetryService();