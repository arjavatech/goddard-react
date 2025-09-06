/**
 * React Hook for API metrics monitoring
 * Provides real-time metrics and performance data
 */

import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../ApiService';
import { ApiMetrics } from '../types';

export interface UseApiMetricsResult {
  metrics: ApiMetrics & {
    uptime: number;
    successRate: number;
    errorRate: number;
    averageRequestsPerMinute: number;
  };
  isLoading: boolean;
  refreshMetrics: () => void;
  resetMetrics: () => void;
  exportMetrics: () => string;
}

export function useApiMetrics(autoRefresh: boolean = true, refreshInterval: number = 5000): UseApiMetricsResult {
  const [metrics, setMetrics] = useState<UseApiMetricsResult['metrics']>({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    cacheHitRate: 0,
    retryCount: 0,
    circuitBreakerTrips: 0,
    rateLimitHits: 0,
    errorsByStatus: {},
    requestsByEndpoint: {},
    timestamp: Date.now(),
    uptime: 0,
    successRate: 0,
    errorRate: 0,
    averageRequestsPerMinute: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);

  const refreshMetrics = useCallback(() => {
    setIsLoading(true);
    
    try {
      const rawMetrics = apiService.getMetrics();
      const metricsCollector = (apiService as any).metricsCollector;
      
      if (metricsCollector && typeof metricsCollector.getDetailedMetrics === 'function') {
        const detailedMetrics = metricsCollector.getDetailedMetrics();
        setMetrics(detailedMetrics);
      } else {
        // Fallback to basic metrics with calculated values
        const totalRequests = rawMetrics.totalRequests;
        const uptime = Date.now() - rawMetrics.timestamp;
        
        setMetrics({
          ...rawMetrics,
          uptime,
          successRate: totalRequests > 0 ? (rawMetrics.successfulRequests / totalRequests) * 100 : 0,
          errorRate: totalRequests > 0 ? (rawMetrics.failedRequests / totalRequests) * 100 : 0,
          averageRequestsPerMinute: uptime > 0 ? (totalRequests / (uptime / 60000)) : 0
        });
      }
    } catch (error) {
      console.error('Failed to refresh API metrics:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetMetrics = useCallback(() => {
    const metricsCollector = (apiService as any).metricsCollector;
    if (metricsCollector && typeof metricsCollector.resetMetrics === 'function') {
      metricsCollector.resetMetrics();
      refreshMetrics();
    }
  }, [refreshMetrics]);

  const exportMetrics = useCallback(() => {
    const metricsCollector = (apiService as any).metricsCollector;
    if (metricsCollector && typeof metricsCollector.exportMetrics === 'function') {
      return metricsCollector.exportMetrics();
    }
    return JSON.stringify(metrics, null, 2);
  }, [metrics]);

  useEffect(() => {
    refreshMetrics();
    
    if (autoRefresh) {
      const interval = setInterval(refreshMetrics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshMetrics, autoRefresh, refreshInterval]);

  return {
    metrics,
    isLoading,
    refreshMetrics,
    resetMetrics,
    exportMetrics
  };
}