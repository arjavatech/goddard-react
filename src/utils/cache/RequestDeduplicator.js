/**
 * Request deduplication utility for concurrent identical requests
 */
class RequestDeduplicator {
  constructor(options = {}) {
    this.pendingRequests = new Map();
    this.requestTimeout = options.requestTimeout || 30000; // 30 seconds
    this.maxConcurrentRequests = options.maxConcurrentRequests || 100;
    
    // Statistics
    this.stats = {
      deduplicatedRequests: 0,
      completedRequests: 0,
      timedOutRequests: 0,
      errors: 0
    };
  }

  /**
   * Execute request with deduplication
   * @param {string} key - Unique identifier for the request
   * @param {Function} requestFn - Function that returns a Promise
   * @param {Object} options - Additional options
   * @returns {Promise} - The deduplicated request result
   */
  async execute(key, requestFn, options = {}) {
    const timeout = options.timeout || this.requestTimeout;
    
    // Check if request is already pending
    if (this.pendingRequests.has(key)) {
      this.stats.deduplicatedRequests++;
      return this.pendingRequests.get(key).promise;
    }
    
    // Check concurrent request limits
    if (this.pendingRequests.size >= this.maxConcurrentRequests) {
      throw new Error('Maximum concurrent requests exceeded');
    }
    
    // Create deferred promise structure
    const deferred = this._createDeferred();
    const pendingRequest = {
      promise: deferred.promise,
      resolve: deferred.resolve,
      reject: deferred.reject,
      startTime: Date.now(),
      timeout: null,
      subscribers: 1
    };
    
    // Set timeout
    pendingRequest.timeout = setTimeout(() => {
      this._timeoutRequest(key, pendingRequest);
    }, timeout);
    
    this.pendingRequests.set(key, pendingRequest);
    
    try {
      // Execute the actual request
      const result = await requestFn();
      this._resolveRequest(key, pendingRequest, result);
      return result;
    } catch (error) {
      this._rejectRequest(key, pendingRequest, error);
      throw error;
    }
  }

  /**
   * Subscribe to an existing request
   * @param {string} key - Request key
   * @returns {Promise|null} - Promise if request exists, null otherwise
   */
  subscribe(key) {
    const pendingRequest = this.pendingRequests.get(key);
    if (pendingRequest) {
      pendingRequest.subscribers++;
      this.stats.deduplicatedRequests++;
      return pendingRequest.promise;
    }
    return null;
  }

  /**
   * Check if a request is currently pending
   * @param {string} key - Request key
   * @returns {boolean}
   */
  isPending(key) {
    return this.pendingRequests.has(key);
  }

  /**
   * Cancel a pending request
   * @param {string} key - Request key
   * @returns {boolean} - True if request was cancelled
   */
  cancel(key) {
    const pendingRequest = this.pendingRequests.get(key);
    if (pendingRequest) {
      if (pendingRequest.timeout) {
        clearTimeout(pendingRequest.timeout);
      }
      
      pendingRequest.reject(new Error('Request cancelled'));
      this.pendingRequests.delete(key);
      return true;
    }
    return false;
  }

  /**
   * Get current statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    return {
      ...this.stats,
      pendingRequests: this.pendingRequests.size,
      avgSubscribersPerRequest: this._calculateAverageSubscribers()
    };
  }

  /**
   * Clear all pending requests
   */
  clear() {
    for (const [key, pendingRequest] of this.pendingRequests.entries()) {
      if (pendingRequest.timeout) {
        clearTimeout(pendingRequest.timeout);
      }
      pendingRequest.reject(new Error('Deduplicator cleared'));
    }
    this.pendingRequests.clear();
  }

  /**
   * Get information about pending requests
   * @returns {Array} Array of pending request info
   */
  getPendingRequests() {
    return Array.from(this.pendingRequests.entries()).map(([key, request]) => ({
      key,
      subscribers: request.subscribers,
      startTime: request.startTime,
      duration: Date.now() - request.startTime
    }));
  }

  /**
   * Private: Create deferred promise
   * @returns {Object} Deferred promise object
   */
  _createDeferred() {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    
    return { promise, resolve, reject };
  }

  /**
   * Private: Resolve a request
   * @param {string} key - Request key
   * @param {Object} pendingRequest - Pending request object
   * @param {*} result - Request result
   */
  _resolveRequest(key, pendingRequest, result) {
    if (pendingRequest.timeout) {
      clearTimeout(pendingRequest.timeout);
    }
    
    pendingRequest.resolve(result);
    this.pendingRequests.delete(key);
    this.stats.completedRequests++;
  }

  /**
   * Private: Reject a request
   * @param {string} key - Request key
   * @param {Object} pendingRequest - Pending request object
   * @param {Error} error - Request error
   */
  _rejectRequest(key, pendingRequest, error) {
    if (pendingRequest.timeout) {
      clearTimeout(pendingRequest.timeout);
    }
    
    pendingRequest.reject(error);
    this.pendingRequests.delete(key);
    this.stats.errors++;
  }

  /**
   * Private: Handle request timeout
   * @param {string} key - Request key
   * @param {Object} pendingRequest - Pending request object
   */
  _timeoutRequest(key, pendingRequest) {
    const error = new Error(`Request timed out after ${this.requestTimeout}ms`);
    error.code = 'TIMEOUT';
    
    pendingRequest.reject(error);
    this.pendingRequests.delete(key);
    this.stats.timedOutRequests++;
  }

  /**
   * Private: Calculate average subscribers per request
   * @returns {number} Average subscribers
   */
  _calculateAverageSubscribers() {
    if (this.pendingRequests.size === 0) return 0;
    
    const totalSubscribers = Array.from(this.pendingRequests.values())
      .reduce((sum, request) => sum + request.subscribers, 0);
    
    return totalSubscribers / this.pendingRequests.size;
  }
}

export default RequestDeduplicator;