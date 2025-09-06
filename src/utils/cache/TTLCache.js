/**
 * TTLCache - Time-To-Live Cache Implementation
 * 
 * A memory-efficient cache with automatic cleanup and TTL support.
 * Features:
 * - Automatic expiration of cached items
 * - Memory cleanup to prevent leaks
 * - Thread-safe operations
 * - Configurable TTL and cleanup intervals
 * 
 * @example
 * const cache = new TTLCache({ ttl: 300000, cleanupInterval: 60000 });
 * cache.set('user:123', userData, 300000); // Cache for 5 minutes
 * const user = cache.get('user:123'); // Returns userData if not expired
 */
export class TTLCache {
  /**
   * Create a new TTL Cache
   * @param {Object} options - Configuration options
   * @param {number} options.ttl - Default TTL in milliseconds (default: 5 minutes)
   * @param {number} options.cleanupInterval - Cleanup interval in milliseconds (default: 1 minute)
   * @param {number} options.maxSize - Maximum cache size (default: 1000)
   */
  constructor(options = {}) {
    this.defaultTTL = options.ttl || 5 * 60 * 1000; // 5 minutes
    this.cleanupInterval = options.cleanupInterval || 60 * 1000; // 1 minute
    this.maxSize = options.maxSize || 1000;
    
    // Internal storage
    this.cache = new Map();
    this.timers = new Map();
    
    // Cleanup timer
    this.cleanupTimer = setInterval(() => this._cleanup(), this.cleanupInterval);
    
    // Metrics for monitoring
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      cleanups: 0,
      evictions: 0
    };
    
    // Bind methods to maintain context
    this.get = this.get.bind(this);
    this.set = this.set.bind(this);
    this.delete = this.delete.bind(this);
    this.clear = this.clear.bind(this);
    this.has = this.has.bind(this);
  }

  /**
   * Get an item from the cache
   * @param {string} key - Cache key
   * @returns {*} Cached value or undefined if expired/missing
   */
  get(key) {
    try {
      const item = this.cache.get(key);
      
      if (!item) {
        this.stats.misses++;
        return undefined;
      }
      
      // Check if expired
      if (Date.now() > item.expiresAt) {
        this.delete(key);
        this.stats.misses++;
        return undefined;
      }
      
      // Update access time for LRU-like behavior
      item.accessedAt = Date.now();
      this.stats.hits++;
      
      return item.value;
    } catch (error) {
      console.warn('TTLCache: Error getting item', { key, error: error.message });
      this.stats.misses++;
      return undefined;
    }
  }

  /**
   * Set an item in the cache
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttl - TTL in milliseconds (optional, uses default if not provided)
   * @returns {boolean} True if set successfully
   */
  set(key, value, ttl = this.defaultTTL) {
    try {
      // Enforce max size by evicting oldest items
      if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
        this._evictOldest();
      }
      
      const expiresAt = Date.now() + ttl;
      
      // Clear existing timer if key already exists
      if (this.timers.has(key)) {
        clearTimeout(this.timers.get(key));
      }
      
      // Set cache item
      this.cache.set(key, {
        value,
        expiresAt,
        createdAt: Date.now(),
        accessedAt: Date.now()
      });
      
      // Set expiration timer
      const timer = setTimeout(() => {
        this.delete(key);
      }, ttl);
      
      this.timers.set(key, timer);
      this.stats.sets++;
      
      return true;
    } catch (error) {
      console.error('TTLCache: Error setting item', { key, error: error.message });
      return false;
    }
  }

  /**
   * Delete an item from the cache
   * @param {string} key - Cache key
   * @returns {boolean} True if item was deleted
   */
  delete(key) {
    try {
      const deleted = this.cache.delete(key);
      
      if (this.timers.has(key)) {
        clearTimeout(this.timers.get(key));
        this.timers.delete(key);
      }
      
      if (deleted) {
        this.stats.deletes++;
      }
      
      return deleted;
    } catch (error) {
      console.error('TTLCache: Error deleting item', { key, error: error.message });
      return false;
    }
  }

  /**
   * Check if a key exists and is not expired
   * @param {string} key - Cache key
   * @returns {boolean} True if key exists and is not expired
   */
  has(key) {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (Date.now() > item.expiresAt) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Clear all items from the cache
   */
  clear() {
    try {
      // Clear all timers
      for (const timer of this.timers.values()) {
        clearTimeout(timer);
      }
      
      this.cache.clear();
      this.timers.clear();
      
      // Reset stats except hits/misses for monitoring
      this.stats.sets = 0;
      this.stats.deletes = 0;
      this.stats.cleanups = 0;
      this.stats.evictions = 0;
      
    } catch (error) {
      console.error('TTLCache: Error clearing cache', error);
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : '0.00';
      
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: `${hitRate}%`,
      memoryUsage: this._estimateMemoryUsage()
    };
  }

  /**
   * Get all keys in the cache
   * @returns {string[]} Array of cache keys
   */
  keys() {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache size
   * @returns {number} Number of items in cache
   */
  size() {
    return this.cache.size;
  }

  /**
   * Internal cleanup method to remove expired items
   * @private
   */
  _cleanup() {
    try {
      const now = Date.now();
      let cleaned = 0;
      
      for (const [key, item] of this.cache.entries()) {
        if (now > item.expiresAt) {
          this.delete(key);
          cleaned++;
        }
      }
      
      if (cleaned > 0) {
        this.stats.cleanups++;
      }
      
    } catch (error) {
      console.error('TTLCache: Error during cleanup', error);
    }
  }

  /**
   * Evict the oldest item based on access time
   * @private
   */
  _evictOldest() {
    try {
      let oldestKey = null;
      let oldestTime = Infinity;
      
      for (const [key, item] of this.cache.entries()) {
        if (item.accessedAt < oldestTime) {
          oldestTime = item.accessedAt;
          oldestKey = key;
        }
      }
      
      if (oldestKey) {
        this.delete(oldestKey);
        this.stats.evictions++;
      }
    } catch (error) {
      console.error('TTLCache: Error evicting oldest item', error);
    }
  }

  /**
   * Estimate memory usage (rough approximation)
   * @private
   * @returns {string} Memory usage estimate
   */
  _estimateMemoryUsage() {
    try {
      let totalSize = 0;
      
      for (const [key, item] of this.cache.entries()) {
        // Rough estimation: key size + value size (as JSON)
        totalSize += key.length * 2; // UTF-16 characters
        totalSize += JSON.stringify(item.value).length * 2;
        totalSize += 64; // Overhead for timestamps and structure
      }
      
      // Convert to KB
      return `${(totalSize / 1024).toFixed(2)} KB`;
    } catch (error) {
      return 'Unknown';
    }
  }

  /**
   * Destroy the cache and cleanup resources
   */
  destroy() {
    try {
      if (this.cleanupTimer) {
        clearInterval(this.cleanupTimer);
        this.cleanupTimer = null;
      }
      
      this.clear();
    } catch (error) {
      console.error('TTLCache: Error destroying cache', error);
    }
  }
}

export default TTLCache;