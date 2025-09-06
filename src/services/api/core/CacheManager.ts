/**
 * Cache Manager for API responses
 * Supports memory, localStorage, and sessionStorage with TTL
 */

import { CacheEntry, CacheConfig } from '../types';

export class CacheManager {
  private memoryCache = new Map<string, CacheEntry>();
  private config: CacheConfig;

  constructor(config: CacheConfig) {
    this.config = config;
    this.startCleanupInterval();
  }

  async get<T>(url: string, params?: Record<string, any>): Promise<CacheEntry<T> | null> {
    const key = this.generateKey(url, params);
    
    try {
      let entry: CacheEntry<T> | null = null;
      
      // Check memory cache first
      if (this.config.storageType === 'memory' || !entry) {
        entry = this.memoryCache.get(key) as CacheEntry<T> || null;
      }
      
      // Check persistent storage if not in memory
      if (!entry && this.config.storageType !== 'memory') {
        entry = this.getFromStorage<T>(key);
      }
      
      if (!entry) {
        return null;
      }
      
      // Check if entry is expired
      if (this.isExpired(entry)) {
        await this.delete(key);
        return null;
      }
      
      // Mark as cache hit
      entry.hit = true;
      
      console.log(`✅ [Cache] Hit for ${key}`);
      return entry;
    } catch (error) {
      console.error(`❌ [Cache] Error retrieving ${key}:`, error);
      return null;
    }
  }

  async set<T>(
    url: string, 
    data: T, 
    ttl?: number, 
    params?: Record<string, any>
  ): Promise<void> {
    const key = this.generateKey(url, params);
    const cacheTTL = ttl || this.config.defaultTTL;
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: cacheTTL,
      hit: false
    };
    
    try {
      // Store in memory
      if (this.config.storageType === 'memory') {
        this.memoryCache.set(key, entry);
        this.enforceMemoryLimit();
      }
      
      // Store in persistent storage
      if (this.config.storageType !== 'memory') {
        this.saveToStorage(key, entry);
      }
      
      console.log(`💾 [Cache] Stored ${key} (TTL: ${cacheTTL}ms)`);
    } catch (error) {
      console.error(`❌ [Cache] Error storing ${key}:`, error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      // Remove from memory
      this.memoryCache.delete(key);
      
      // Remove from persistent storage
      if (this.config.storageType !== 'memory') {
        const storage = this.getStorage();
        if (storage) {
          storage.removeItem(`${this.config.keyPrefix}${key}`);
        }
      }
      
      console.log(`🗑️ [Cache] Deleted ${key}`);
    } catch (error) {
      console.error(`❌ [Cache] Error deleting ${key}:`, error);
    }
  }

  async clear(pattern?: string): Promise<void> {
    try {
      if (pattern) {
        // Clear entries matching pattern
        const regex = new RegExp(pattern);
        
        // Clear from memory
        for (const [key] of this.memoryCache) {
          if (regex.test(key)) {
            this.memoryCache.delete(key);
          }
        }
        
        // Clear from storage
        if (this.config.storageType !== 'memory') {
          const storage = this.getStorage();
          if (storage) {
            const keysToRemove: string[] = [];
            for (let i = 0; i < storage.length; i++) {
              const storageKey = storage.key(i);
              if (storageKey && storageKey.startsWith(this.config.keyPrefix)) {
                const cacheKey = storageKey.substring(this.config.keyPrefix.length);
                if (regex.test(cacheKey)) {
                  keysToRemove.push(storageKey);
                }
              }
            }
            keysToRemove.forEach(key => storage.removeItem(key));
          }
        }
        
        console.log(`🧹 [Cache] Cleared entries matching pattern: ${pattern}`);
      } else {
        // Clear all entries
        this.memoryCache.clear();
        
        if (this.config.storageType !== 'memory') {
          const storage = this.getStorage();
          if (storage) {
            const keysToRemove: string[] = [];
            for (let i = 0; i < storage.length; i++) {
              const key = storage.key(i);
              if (key && key.startsWith(this.config.keyPrefix)) {
                keysToRemove.push(key);
              }
            }
            keysToRemove.forEach(key => storage.removeItem(key));
          }
        }
        
        console.log('🧹 [Cache] Cleared all entries');
      }
    } catch (error) {
      console.error('❌ [Cache] Error clearing cache:', error);
    }
  }

  getStats(): {
    size: number;
    memorySize: number;
    storageSize: number;
    hitRate: number;
  } {
    let storageSize = 0;
    let totalHits = 0;
    let totalRequests = 0;
    
    // Count memory cache
    this.memoryCache.forEach(entry => {
      if (entry.hit) totalHits++;
      totalRequests++;
    });
    
    // Count storage cache
    if (this.config.storageType !== 'memory') {
      const storage = this.getStorage();
      if (storage) {
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key && key.startsWith(this.config.keyPrefix)) {
            storageSize++;
            try {
              const entry = JSON.parse(storage.getItem(key) || '{}');
              if (entry.hit) totalHits++;
              totalRequests++;
            } catch {
              // Ignore invalid entries
            }
          }
        }
      }
    }
    
    return {
      size: this.memoryCache.size + storageSize,
      memorySize: this.memoryCache.size,
      storageSize,
      hitRate: totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0
    };
  }

  private generateKey(url: string, params?: Record<string, any>): string {
    let key = url;
    
    if (params && Object.keys(params).length > 0) {
      const sortedParams = Object.keys(params)
        .sort()
        .map(k => `${k}=${params[k]}`)
        .join('&');
      key += `?${sortedParams}`;
    }
    
    return this.hashKey(key);
  }

  private hashKey(key: string): string {
    // Simple hash function for key generation
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() > (entry.timestamp + entry.ttl);
  }

  private getFromStorage<T>(key: string): CacheEntry<T> | null {
    const storage = this.getStorage();
    if (!storage) return null;
    
    try {
      const stored = storage.getItem(`${this.config.keyPrefix}${key}`);
      if (!stored) return null;
      
      return JSON.parse(stored);
    } catch (error) {
      console.error(`Error parsing cache entry ${key}:`, error);
      return null;
    }
  }

  private saveToStorage<T>(key: string, entry: CacheEntry<T>): void {
    const storage = this.getStorage();
    if (!storage) return;
    
    try {
      storage.setItem(`${this.config.keyPrefix}${key}`, JSON.stringify(entry));
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('Storage quota exceeded, clearing old cache entries');
        this.clearOldestEntries();
        // Try again after cleanup
        try {
          storage.setItem(`${this.config.keyPrefix}${key}`, JSON.stringify(entry));
        } catch (secondError) {
          console.error('Failed to save to storage after cleanup:', secondError);
        }
      } else {
        console.error('Error saving to storage:', error);
      }
    }
  }

  private clearOldestEntries(): void {
    const storage = this.getStorage();
    if (!storage) return;
    
    const entries: Array<{ key: string; timestamp: number }> = [];
    
    // Collect all cache entries with timestamps
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith(this.config.keyPrefix)) {
        try {
          const entry = JSON.parse(storage.getItem(key) || '{}');
          entries.push({ key, timestamp: entry.timestamp || 0 });
        } catch {
          // Remove invalid entries
          storage.removeItem(key);
        }
      }
    }
    
    // Sort by timestamp (oldest first) and remove oldest 25%
    entries.sort((a, b) => a.timestamp - b.timestamp);
    const toRemove = Math.ceil(entries.length * 0.25);
    
    for (let i = 0; i < toRemove; i++) {
      storage.removeItem(entries[i].key);
    }
    
    console.log(`🧹 [Cache] Removed ${toRemove} oldest entries`);
  }

  private enforceMemoryLimit(): void {
    if (this.memoryCache.size <= this.config.maxEntries) {
      return;
    }
    
    // Convert to array and sort by timestamp (oldest first)
    const entries = Array.from(this.memoryCache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);
    
    // Remove oldest entries until we're under the limit
    const toRemove = this.memoryCache.size - this.config.maxEntries;
    for (let i = 0; i < toRemove; i++) {
      this.memoryCache.delete(entries[i][0]);
    }
    
    console.log(`🧹 [Cache] Removed ${toRemove} entries to enforce memory limit`);
  }

  private startCleanupInterval(): void {
    // Clean up expired entries every 5 minutes
    setInterval(() => {
      this.cleanupExpired();
    }, 5 * 60 * 1000);
  }

  private cleanupExpired(): void {
    let removed = 0;
    
    // Cleanup memory cache
    for (const [key, entry] of this.memoryCache) {
      if (this.isExpired(entry)) {
        this.memoryCache.delete(key);
        removed++;
      }
    }
    
    // Cleanup storage cache
    if (this.config.storageType !== 'memory') {
      const storage = this.getStorage();
      if (storage) {
        const keysToRemove: string[] = [];
        
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key && key.startsWith(this.config.keyPrefix)) {
            try {
              const entry = JSON.parse(storage.getItem(key) || '{}');
              if (this.isExpired(entry)) {
                keysToRemove.push(key);
              }
            } catch {
              // Remove invalid entries
              keysToRemove.push(key);
            }
          }
        }
        
        keysToRemove.forEach(key => {
          storage.removeItem(key);
          removed++;
        });
      }
    }
    
    if (removed > 0) {
      console.log(`🧹 [Cache] Cleaned up ${removed} expired entries`);
    }
  }

  private getStorage(): Storage | null {
    if (typeof window === 'undefined') {
      return null;
    }
    
    switch (this.config.storageType) {
      case 'localStorage':
        return window.localStorage;
      case 'sessionStorage':
        return window.sessionStorage;
      default:
        return null;
    }
  }
}