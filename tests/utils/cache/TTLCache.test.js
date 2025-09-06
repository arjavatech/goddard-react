/**
 * TTLCache Tests
 * 
 * Comprehensive test suite for the TTLCache implementation
 */

import { TTLCache } from '../../../src/utils/cache/TTLCache.js';

describe('TTLCache', () => {
  let cache;

  beforeEach(() => {
    cache = new TTLCache({ ttl: 1000 }); // 1 second for testing
  });

  afterEach(() => {
    if (cache) {
      cache.destroy();
    }
  });

  describe('Basic Operations', () => {
    test('should set and get values', () => {
      const result = cache.set('key1', 'value1');
      expect(result).toBe(true);
      
      const value = cache.get('key1');
      expect(value).toBe('value1');
    });

    test('should return undefined for non-existent keys', () => {
      const value = cache.get('nonexistent');
      expect(value).toBeUndefined();
    });

    test('should overwrite existing values', () => {
      cache.set('key1', 'value1');
      cache.set('key1', 'value2');
      
      const value = cache.get('key1');
      expect(value).toBe('value2');
    });

    test('should delete values', () => {
      cache.set('key1', 'value1');
      const deleted = cache.delete('key1');
      
      expect(deleted).toBe(true);
      expect(cache.get('key1')).toBeUndefined();
    });

    test('should check if key exists', () => {
      cache.set('key1', 'value1');
      
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('nonexistent')).toBe(false);
    });

    test('should clear all values', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      cache.clear();
      
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBeUndefined();
      expect(cache.size()).toBe(0);
    });
  });

  describe('TTL Functionality', () => {
    test('should expire values after TTL', async () => {
      cache.set('key1', 'value1', 100); // 100ms TTL
      
      expect(cache.get('key1')).toBe('value1');
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(cache.get('key1')).toBeUndefined();
    });

    test('should use default TTL when not specified', async () => {
      const shortCache = new TTLCache({ ttl: 100 });
      shortCache.set('key1', 'value1');
      
      expect(shortCache.get('key1')).toBe('value1');
      
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(shortCache.get('key1')).toBeUndefined();
      
      shortCache.destroy();
    });

    test('should handle custom TTL per item', async () => {
      cache.set('short', 'value1', 100); // 100ms
      cache.set('long', 'value2', 500); // 500ms
      
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(cache.get('short')).toBeUndefined();
      expect(cache.get('long')).toBe('value2');
      
      await new Promise(resolve => setTimeout(resolve, 400));
      
      expect(cache.get('long')).toBeUndefined();
    });

    test('should automatically cleanup expired items', async () => {
      const cleanupCache = new TTLCache({ 
        ttl: 100, 
        cleanupInterval: 50 
      });
      
      cleanupCache.set('key1', 'value1');
      cleanupCache.set('key2', 'value2');
      
      expect(cleanupCache.size()).toBe(2);
      
      // Wait for expiration and cleanup
      await new Promise(resolve => setTimeout(resolve, 200));
      
      expect(cleanupCache.size()).toBe(0);
      
      cleanupCache.destroy();
    });
  });

  describe('Memory Management', () => {
    test('should enforce max size limit', () => {
      const limitedCache = new TTLCache({ maxSize: 3 });
      
      limitedCache.set('key1', 'value1');
      limitedCache.set('key2', 'value2');
      limitedCache.set('key3', 'value3');
      
      expect(limitedCache.size()).toBe(3);
      
      // Adding 4th item should evict oldest
      limitedCache.set('key4', 'value4');
      
      expect(limitedCache.size()).toBe(3);
      expect(limitedCache.has('key1')).toBe(false); // Oldest should be evicted
      expect(limitedCache.has('key4')).toBe(true);
      
      limitedCache.destroy();
    });

    test('should update access time on get', async () => {
      const limitedCache = new TTLCache({ maxSize: 2 });
      
      limitedCache.set('key1', 'value1');
      // Wait a tiny bit to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 1));
      limitedCache.set('key2', 'value2');
      
      // Access key1 to update its access time
      limitedCache.get('key1');
      
      // Add key3, should evict key2 (least recently accessed)
      limitedCache.set('key3', 'value3');
      
      expect(limitedCache.has('key1')).toBe(true);
      expect(limitedCache.has('key2')).toBe(false);
      expect(limitedCache.has('key3')).toBe(true);
      
      limitedCache.destroy();
    });
  });

  describe('Statistics', () => {
    test('should track hit/miss statistics', () => {
      cache.set('key1', 'value1');
      
      // Hit
      cache.get('key1');
      
      // Miss
      cache.get('nonexistent');
      
      const stats = cache.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.sets).toBe(1);
      expect(stats.size).toBe(1);
    });

    test('should calculate hit rate', () => {
      cache.set('key1', 'value1');
      
      cache.get('key1'); // hit
      cache.get('key1'); // hit
      cache.get('nonexistent'); // miss
      
      const stats = cache.getStats();
      expect(stats.hitRate).toBe('66.67%');
    });

    test('should track memory usage estimate', () => {
      cache.set('key1', 'value1');
      
      const stats = cache.getStats();
      expect(stats.memoryUsage).toBeDefined();
      expect(typeof stats.memoryUsage).toBe('string');
    });
  });

  describe('Error Handling', () => {
    test('should handle errors gracefully in get', () => {
      // Simulate corrupted cache
      cache.cache.set('corrupt', { expiresAt: 'invalid' });
      
      const result = cache.get('corrupt');
      expect(result).toBeUndefined();
      
      const stats = cache.getStats();
      expect(stats.misses).toBe(1);
    });

    test('should handle errors gracefully in set', () => {
      // Mock an error condition by corrupting the cache
      const originalSet = cache.cache.set;
      cache.cache.set = () => {
        throw new Error('Set error');
      };
      
      const result = cache.set('key1', 'value1');
      expect(result).toBe(false);
      
      // Restore
      cache.cache.set = originalSet;
    });

    test('should handle errors in cleanup', () => {
      // This test ensures cleanup doesn't crash on errors
      cache.set('key1', 'value1');
      
      // Corrupt an entry
      const item = cache.cache.get('key1');
      item.expiresAt = 'invalid';
      
      // Should not throw
      expect(() => cache._cleanup()).not.toThrow();
    });
  });

  describe('Utility Methods', () => {
    test('should return all keys', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      const keys = cache.keys();
      expect(keys).toEqual(expect.arrayContaining(['key1', 'key2']));
      expect(keys.length).toBe(2);
    });

    test('should return cache size', () => {
      expect(cache.size()).toBe(0);
      
      cache.set('key1', 'value1');
      expect(cache.size()).toBe(1);
      
      cache.set('key2', 'value2');
      expect(cache.size()).toBe(2);
    });
  });

  describe('Edge Cases', () => {
    test('should handle null/undefined values', () => {
      cache.set('null', null);
      cache.set('undefined', undefined);
      
      expect(cache.get('null')).toBeNull();
      expect(cache.get('undefined')).toBeUndefined();
    });

    test('should handle complex objects', () => {
      const complexObject = {
        nested: { data: 'value' },
        array: [1, 2, 3],
        date: new Date()
      };
      
      cache.set('complex', complexObject);
      const retrieved = cache.get('complex');
      
      expect(retrieved).toEqual(complexObject);
    });

    test('should handle concurrent operations', async () => {
      const promises = [];
      
      // Concurrent sets
      for (let i = 0; i < 10; i++) {
        promises.push(
          new Promise(resolve => {
            cache.set(`key${i}`, `value${i}`);
            resolve();
          })
        );
      }
      
      await Promise.all(promises);
      
      expect(cache.size()).toBe(10);
      
      // All values should be retrievable
      for (let i = 0; i < 10; i++) {
        expect(cache.get(`key${i}`)).toBe(`value${i}`);
      }
    });

    test('should handle destroy cleanup', () => {
      cache.set('key1', 'value1');
      
      const initialSize = cache.size();
      expect(initialSize).toBe(1);
      
      cache.destroy();
      
      // Cache should be cleared
      expect(cache.cache.size).toBe(0);
      expect(cache.timers.size).toBe(0);
      expect(cache.cleanupTimer).toBeNull();
    });
  });
});