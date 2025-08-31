// Multi-layer caching system with memory, session, and persistent storage

class CacheEntry {
  constructor(value, ttl = 300000) { // 5 minutes default
    this.value = value;
    this.expires = Date.now() + ttl;
    this.created = Date.now();
    this.lastAccessed = Date.now();
    this.version = this.getCacheVersion();
    this.size = this.calculateSize(value);
  }

  isExpired() {
    return Date.now() > this.expires;
  }

  updateAccess() {
    this.lastAccessed = Date.now();
  }

  calculateSize(value) {
    try {
      return new Blob([JSON.stringify(value)]).size;
    } catch {
      return 0;
    }
  }

  getCacheVersion() {
    return import.meta.env?.REACT_APP_VERSION || '1.0.0';
  }
}

export class MultiLayerCacheManager {
  constructor() {
    this.memoryCache = new Map();
    this.maxMemorySize = 50 * 1024 * 1024; // 50MB
    this.currentMemorySize = 0;
    
    this.cacheMetrics = {
      hits: 0,
      misses: 0,
      errors: 0,
      evictions: 0,
      memoryHits: 0,
      sessionHits: 0,
      persistentHits: 0
    };

    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  async get(key, options = {}) {
    const { 
      fallbackToSession = true, 
      fallbackToPersistent = false,
      updateAccess = true 
    } = options;
    
    try {
      // Layer 1: Memory cache (fastest)
      const memoryEntry = this.memoryCache.get(key);
      if (memoryEntry && !memoryEntry.isExpired()) {
        if (updateAccess) {
          memoryEntry.updateAccess();
        }
        this.cacheMetrics.hits++;
        this.cacheMetrics.memoryHits++;
        return memoryEntry.value;
      }

      // Remove expired memory entry
      if (memoryEntry && memoryEntry.isExpired()) {
        this.memoryCache.delete(key);
        this.currentMemorySize -= memoryEntry.size;
      }

      // Layer 2: Session storage
      if (fallbackToSession) {
        const sessionEntry = this.getFromSession(key);
        if (sessionEntry && !sessionEntry.isExpired()) {
          // Promote to memory cache
          this.setInMemory(key, sessionEntry);
          this.cacheMetrics.hits++;
          this.cacheMetrics.sessionHits++;
          return sessionEntry.value;
        }
      }

      // Layer 3: Persistent storage (for offline support)
      if (fallbackToPersistent) {
        const persistentEntry = this.getFromPersistent(key);
        if (persistentEntry && !persistentEntry.isExpired()) {
          // Promote to memory cache
          this.setInMemory(key, persistentEntry);
          this.cacheMetrics.hits++;
          this.cacheMetrics.persistentHits++;
          return persistentEntry.value;
        }
      }

      this.cacheMetrics.misses++;
      return null;

    } catch (error) {
      this.cacheMetrics.errors++;
      console.warn('Cache retrieval error:', error);
      return null;
    }
  }

  set(key, value, ttl = 300000, options = {}) {
    const { persistToSession = true, persistToStorage = false } = options;

    try {
      const entry = new CacheEntry(value, ttl);

      // Store in memory
      this.setInMemory(key, entry);

      // Store in session storage
      if (persistToSession) {
        this.setInSession(key, entry);
      }

      // Store in persistent storage (for offline support)
      if (persistToStorage) {
        this.setInPersistent(key, entry);
      }

      return true;
    } catch (error) {
      console.warn('Cache storage error:', error);
      return false;
    }
  }

  setInMemory(key, entry) {
    // Check memory limits before adding
    if (this.currentMemorySize + entry.size > this.maxMemorySize) {
      this.evictLeastRecentlyUsed();
    }

    const existingEntry = this.memoryCache.get(key);
    if (existingEntry) {
      this.currentMemorySize -= existingEntry.size;
    }

    this.memoryCache.set(key, entry);
    this.currentMemorySize += entry.size;
  }

  getFromSession(key) {
    try {
      const data = sessionStorage.getItem(`cache_${key}`);
      if (!data) return null;

      const parsed = JSON.parse(data);
      const entry = new CacheEntry(parsed.value, 0); // Create entry object
      entry.expires = parsed.expires;
      entry.created = parsed.created;
      entry.lastAccessed = parsed.lastAccessed;
      entry.version = parsed.version;

      return entry;
    } catch (error) {
      return null;
    }
  }

  setInSession(key, entry) {
    try {
      const data = {
        value: entry.value,
        expires: entry.expires,
        created: entry.created,
        lastAccessed: entry.lastAccessed,
        version: entry.version
      };
      
      sessionStorage.setItem(`cache_${key}`, JSON.stringify(data));
    } catch (error) {
      // Session storage full or disabled
      console.warn('Session storage error:', error);
    }
  }

  getFromPersistent(key) {
    try {
      const data = localStorage.getItem(`cache_${key}`);
      if (!data) return null;

      const parsed = JSON.parse(data);
      const entry = new CacheEntry(parsed.value, 0);
      entry.expires = parsed.expires;
      entry.created = parsed.created;
      entry.lastAccessed = parsed.lastAccessed;
      entry.version = parsed.version;

      return entry;
    } catch (error) {
      return null;
    }
  }

  setInPersistent(key, entry) {
    try {
      const data = {
        value: entry.value,
        expires: entry.expires,
        created: entry.created,
        lastAccessed: entry.lastAccessed,
        version: entry.version
      };
      
      localStorage.setItem(`cache_${key}`, JSON.stringify(data));
    } catch (error) {
      // Local storage full or disabled
      console.warn('Local storage error:', error);
    }
  }

  // Smart invalidation based on data relationships
  invalidateRelated(pattern) {
    const keysToInvalidate = [];

    // Find keys matching pattern
    for (const key of this.memoryCache.keys()) {
      if (this.matchesPattern(key, pattern)) {
        keysToInvalidate.push(key);
      }
    }

    // Invalidate matched keys
    keysToInvalidate.forEach(key => this.invalidate(key));
  }

  invalidate(key) {
    // Remove from memory
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry) {
      this.memoryCache.delete(key);
      this.currentMemorySize -= memoryEntry.size;
    }

    // Remove from session storage
    try {
      sessionStorage.removeItem(`cache_${key}`);
    } catch (error) {
      // Ignore errors
    }

    // Remove from persistent storage
    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      // Ignore errors
    }
  }

  // Invalidate parent dashboard data when forms are updated
  invalidateParentData(email) {
    this.invalidateRelated(`parent_dashboard:${email}`);
    this.invalidateRelated(`parent:${email}`);
  }

  // LRU eviction for memory management
  evictLeastRecentlyUsed() {
    let oldestKey = null;
    let oldestAccess = Date.now();

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.lastAccessed < oldestAccess) {
        oldestAccess = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      const entry = this.memoryCache.get(oldestKey);
      this.memoryCache.delete(oldestKey);
      this.currentMemorySize -= entry.size;
      this.cacheMetrics.evictions++;
    }
  }

  // Cleanup expired entries
  cleanup() {
    const expiredKeys = [];

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.isExpired()) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => {
      const entry = this.memoryCache.get(key);
      this.memoryCache.delete(key);
      this.currentMemorySize -= entry.size;
    });

    if (expiredKeys.length > 0) {
      console.log(`Cleaned up ${expiredKeys.length} expired cache entries`);
    }
  }

  // Pattern matching for cache invalidation
  matchesPattern(key, pattern) {
    if (pattern.includes('*')) {
      const regexPattern = pattern.replace(/\*/g, '.*');
      const regex = new RegExp(`^${regexPattern}$`);
      return regex.test(key);
    }
    return key === pattern;
  }

  // Get cache metrics for monitoring
  getMetrics() {
    return {
      ...this.cacheMetrics,
      memorySize: this.currentMemorySize,
      memoryEntries: this.memoryCache.size,
      hitRate: this.cacheMetrics.hits / (this.cacheMetrics.hits + this.cacheMetrics.misses) || 0
    };
  }

  // Clear all cache layers
  clear() {
    this.memoryCache.clear();
    this.currentMemorySize = 0;

    try {
      // Clear session storage cache entries
      const sessionKeys = Object.keys(sessionStorage).filter(key => key.startsWith('cache_'));
      sessionKeys.forEach(key => sessionStorage.removeItem(key));
    } catch (error) {
      // Ignore errors
    }

    try {
      // Clear persistent storage cache entries
      const localKeys = Object.keys(localStorage).filter(key => key.startsWith('cache_'));
      localKeys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      // Ignore errors
    }
  }

  // Cleanup on destroy
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

// Export singleton instance
export const cacheManager = new MultiLayerCacheManager();