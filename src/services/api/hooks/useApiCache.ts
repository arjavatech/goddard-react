/**
 * React Hook for API cache management
 * Provides cache control and invalidation
 */

import { useCallback, useEffect, useState } from 'react';
import { apiService } from '../ApiService';

export interface UseApiCacheResult {
  clearCache: (pattern?: string) => void;
  getCacheStats: () => {
    size: number;
    memorySize: number;
    storageSize: number;
    hitRate: number;
  };
  invalidateCache: (urls: string[]) => void;
  preloadCache: (configs: Array<{ url: string; params?: Record<string, any> }>) => Promise<void>;
  cacheStats: {
    size: number;
    memorySize: number;
    storageSize: number;
    hitRate: number;
  };
}

export function useApiCache(): UseApiCacheResult {
  const [cacheStats, setCacheStats] = useState({
    size: 0,
    memorySize: 0,
    storageSize: 0,
    hitRate: 0
  });

  const clearCache = useCallback((pattern?: string) => {
    apiService.clearCache(pattern);
    updateCacheStats();
  }, []);

  const getCacheStats = useCallback(() => {
    const cacheManager = (apiService as any).cacheManager;
    return cacheManager?.getStats() || {
      size: 0,
      memorySize: 0,
      storageSize: 0,
      hitRate: 0
    };
  }, []);

  const invalidateCache = useCallback((urls: string[]) => {
    urls.forEach(url => {
      apiService.clearCache(url);
    });
    updateCacheStats();
  }, []);

  const preloadCache = useCallback(async (configs: Array<{ url: string; params?: Record<string, any> }>) => {
    const promises = configs.map(config => 
      apiService.get(config.url, { params: config.params }).catch(() => {
        // Ignore errors during preloading
      })
    );
    
    await Promise.all(promises);
    updateCacheStats();
  }, []);

  const updateCacheStats = useCallback(() => {
    setCacheStats(getCacheStats());
  }, [getCacheStats]);

  useEffect(() => {
    updateCacheStats();
    
    // Update stats periodically
    const interval = setInterval(updateCacheStats, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [updateCacheStats]);

  return {
    clearCache,
    getCacheStats,
    invalidateCache,
    preloadCache,
    cacheStats
  };
}