/**
 * RequestDeduplicator - Prevents concurrent identical API calls
 * 
 * Deduplicates identical requests to prevent race conditions and reduce server load.
 * Features:
 * - Request batching and deduplication
 * - AbortController support for cancellation
 * - Automatic cleanup of completed requests
 * - Error propagation to all waiting clients
 * - Memory-efficient with configurable limits
 * 
 * @example
 * const deduplicator = new RequestDeduplicator();
 * 
 * // Multiple concurrent calls will be deduplicated
 * const result1 = deduplicator.deduplicate('user-123', () => fetchUser(123));
 * const result2 = deduplicator.deduplicate('user-123', () => fetchUser(123));
 * // Only one API call is made, both get the same result
 */
export class RequestDeduplicator {
  /**
   * Create a new RequestDeduplicator
   * @param {Object} options - Configuration options
   * @param {number} options.maxConcurrent - Maximum concurrent requests (default: 50)
   * @param {number} options.timeout - Request timeout in milliseconds (default: 30 seconds)
   */
  constructor(options = {}) {
    this.maxConcurrent = options.maxConcurrent || 50;
    this.timeout = options.timeout || 30 * 1000; // 30 seconds
    
    // Track pending requests
    this.pendingRequests = new Map();
    
    // Metrics for monitoring
    this.stats = {
      deduplicatedRequests: 0,
      completedRequests: 0,
      failedRequests: 0,
      timeouts: 0,
      cancelled: 0
    };
    
    // Bind methods to maintain context
    this.deduplicate = this.deduplicate.bind(this);
    this.cancel = this.cancel.bind(this);
    this.clear = this.clear.bind(this);
    this.getStats = this.getStats.bind(this);
  }

  /**
   * Deduplicate a request by key
   * @param {string} key - Unique request identifier
   * @param {Function} requestFn - Function that returns a Promise
   * @param {Object} options - Request options
   * @param {number} options.timeout - Override default timeout
   * @param {AbortSignal} options.signal - Abort signal for cancellation
   * @returns {Promise} Promise that resolves with the request result
   */
  async deduplicate(key, requestFn, options = {}) {
    // Validate inputs
    if (!key || typeof key !== 'string') {
      throw new Error('RequestDeduplicator: Key must be a non-empty string');
    }
    
    if (!requestFn || typeof requestFn !== 'function') {
      throw new Error('RequestDeduplicator: requestFn must be a function');
    }

    // Check if request already exists
    const existingRequest = this.pendingRequests.get(key);
    
    if (existingRequest) {
      this.stats.deduplicatedRequests++;
      
      // Add this caller to the waiting list
      return new Promise((resolve, reject) => {
        existingRequest.waitingCallers.push({ resolve, reject });
        
        // Handle external abort signal
        if (options.signal) {
          const onAbort = () => {
            // Remove this caller from waiting list
            const index = existingRequest.waitingCallers.findIndex(
              caller => caller.resolve === resolve
            );
            if (index !== -1) {
              existingRequest.waitingCallers.splice(index, 1);
              reject(new DOMException('Request was aborted', 'AbortError'));
            }
          };
          
          if (options.signal.aborted) {
            onAbort();
            return;
          }
          
          options.signal.addEventListener('abort', onAbort, { once: true });
        }
      });
    }

    // Enforce concurrent request limits
    if (this.pendingRequests.size >= this.maxConcurrent) {
      throw new Error(
        `RequestDeduplicator: Maximum concurrent requests (${this.maxConcurrent}) exceeded`
      );
    }

    // Create new request entry
    const abortController = new AbortController();
    const requestTimeout = options.timeout || this.timeout;
    
    const requestEntry = {
      key,
      abortController,
      waitingCallers: [],
      startTime: Date.now(),
      timeout: null
    };

    // Set timeout
    requestEntry.timeout = setTimeout(() => {
      this.stats.timeouts++;
      this._completeRequest(key, null, new Error('Request timeout'));
    }, requestTimeout);

    // Store the pending request
    this.pendingRequests.set(key, requestEntry);

    try {
      // Execute the request function
      const result = await requestFn(abortController.signal);
      
      // Complete successfully
      this._completeRequest(key, result, null);
      
      return result;
      
    } catch (error) {
      // Handle errors
      let finalError = error;
      
      if (error.name === 'AbortError') {
        this.stats.cancelled++;
        finalError = new DOMException('Request was cancelled', 'AbortError');
      } else {
        this.stats.failedRequests++;
      }
      
      this._completeRequest(key, null, finalError);
      throw finalError;
    }
  }

  /**
   * Cancel a pending request
   * @param {string} key - Request key to cancel
   * @returns {boolean} True if request was cancelled
   */
  cancel(key) {
    const request = this.pendingRequests.get(key);
    
    if (!request) {
      return false;
    }

    try {
      // Cancel the request
      request.abortController.abort();
      
      // Complete with cancellation error
      this._completeRequest(
        key,
        null,
        new DOMException('Request was cancelled', 'AbortError')
      );
      
      this.stats.cancelled++;
      return true;
      
    } catch (error) {
      console.error('RequestDeduplicator: Error cancelling request', { key, error });
      return false;
    }
  }

  /**
   * Cancel all pending requests
   */
  cancelAll() {
    const keys = Array.from(this.pendingRequests.keys());
    let cancelled = 0;
    
    for (const key of keys) {
      if (this.cancel(key)) {
        cancelled++;
      }
    }
    
    return cancelled;
  }

  /**
   * Clear all pending requests and reset state
   */
  clear() {
    try {
      // Cancel all pending requests
      this.cancelAll();
      
      // Clear the map
      this.pendingRequests.clear();
      
    } catch (error) {
      console.error('RequestDeduplicator: Error clearing requests', error);
    }
  }

  /**
   * Check if a request is pending
   * @param {string} key - Request key
   * @returns {boolean} True if request is pending
   */
  isPending(key) {
    return this.pendingRequests.has(key);
  }

  /**
   * Get pending request keys
   * @returns {string[]} Array of pending request keys
   */
  getPendingKeys() {
    return Array.from(this.pendingRequests.keys());
  }

  /**
   * Get request statistics
   * @returns {Object} Request statistics
   */
  getStats() {
    const currentPending = this.pendingRequests.size;
    const totalRequests = this.stats.completedRequests + this.stats.failedRequests;
    const deduplicationRate = totalRequests > 0 
      ? ((this.stats.deduplicatedRequests / totalRequests) * 100).toFixed(2)
      : '0.00';
    
    return {
      ...this.stats,
      currentPending,
      deduplicationRate: `${deduplicationRate}%`,
      avgRequestsPerKey: totalRequests > 0 
        ? (this.stats.deduplicatedRequests / totalRequests + 1).toFixed(2)
        : '1.00'
    };
  }

  /**
   * Get detailed information about pending requests
   * @returns {Object[]} Array of pending request info
   */
  getPendingDetails() {
    const details = [];
    const now = Date.now();
    
    for (const [key, request] of this.pendingRequests.entries()) {
      details.push({
        key,
        waitingCallers: request.waitingCallers.length,
        duration: now - request.startTime,
        startTime: request.startTime
      });
    }
    
    return details.sort((a, b) => b.duration - a.duration);
  }

  /**
   * Complete a request and notify all waiting callers
   * @private
   * @param {string} key - Request key
   * @param {*} result - Success result
   * @param {Error} error - Error result
   */
  _completeRequest(key, result, error) {
    const request = this.pendingRequests.get(key);
    
    if (!request) {
      return;
    }

    try {
      // Clear timeout
      if (request.timeout) {
        clearTimeout(request.timeout);
      }

      // Notify all waiting callers
      for (const caller of request.waitingCallers) {
        try {
          if (error) {
            caller.reject(error);
          } else {
            caller.resolve(result);
          }
        } catch (callerError) {
          console.error('RequestDeduplicator: Error notifying caller', {
            key,
            error: callerError
          });
        }
      }

      // Update statistics
      if (error) {
        if (error.name !== 'AbortError') {
          this.stats.failedRequests++;
        }
      } else {
        this.stats.completedRequests++;
      }

      // Remove from pending requests
      this.pendingRequests.delete(key);
      
    } catch (completionError) {
      console.error('RequestDeduplicator: Error completing request', {
        key,
        error: completionError
      });
    }
  }

  /**
   * Create a bound deduplication function for a specific key prefix
   * @param {string} prefix - Key prefix for this deduplicator instance
   * @returns {Function} Bound deduplicate function
   */
  createBoundDeduplicator(prefix) {
    return (key, requestFn, options) => {
      const fullKey = `${prefix}:${key}`;
      return this.deduplicate(fullKey, requestFn, options);
    };
  }

  /**
   * Destroy the deduplicator and cleanup resources
   */
  destroy() {
    try {
      this.clear();
    } catch (error) {
      console.error('RequestDeduplicator: Error destroying deduplicator', error);
    }
  }
}

export default RequestDeduplicator;