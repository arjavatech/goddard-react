// Optimized hook for Forms Repository with performance monitoring
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { formsRepositoryService } from '../services/optimized/FormsRepositoryService.js';
import { performanceMonitor } from '../services/monitoring/performanceMonitor.js';
import { toast } from 'sonner';

export const useOptimizedFormsRepository = (options = {}) => {
  const { 
    autoLoad = true, 
    enablePerformanceMonitoring = true,
    cacheTimeout = 600000, // 10 minutes
    enableBackgroundRefresh = true
  } = options;

  const { getAccessTokenSilently } = useAuth0();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isStale, setIsStale] = useState(false);
  
  const loadingRef = useRef(false);
  const mountedRef = useRef(true);
  const refreshTimeoutRef = useRef(null);

  // Performance monitoring
  const trackPerformance = useCallback((operation, startTime, metadata = {}) => {
    if (!enablePerformanceMonitoring) return;
    
    const duration = performance.now() - startTime;
    performanceMonitor.recordMetric(operation, duration, metadata);
    
    return duration;
  }, [enablePerformanceMonitoring]);

  // Load data with performance monitoring
  const loadData = useCallback(async (forceRefresh = false) => {
    if (loadingRef.current) return; // Prevent concurrent loads
    
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    
    const startTime = performance.now();
    
    try {
      const result = await formsRepositoryService.loadAllFormsRepositoryData(
        getAccessTokenSilently,
        { 
          useCache: !forceRefresh, 
          forceRefresh 
        }
      );

      if (!mountedRef.current) return;

      setData(result);
      setIsStale(result.isStale || false);
      setLastUpdated(new Date().toISOString());
      
      // Track performance
      const loadTime = trackPerformance('forms_repository_load', startTime, {
        cached: !forceRefresh,
        dataSize: JSON.stringify(result).length,
        totalClassrooms: result.stats?.totalClassrooms || 0,
        totalStudents: result.stats?.totalStudents || 0
      });

      // Performance alerts
      if (loadTime > 3000) {
        console.warn(`Forms repository load took ${loadTime.toFixed(2)}ms - consider optimization`);
      }

      // Schedule background refresh
      if (enableBackgroundRefresh && !forceRefresh) {
        scheduleBackgroundRefresh();
      }

    } catch (err) {
      if (!mountedRef.current) return;
      
      console.error('Forms repository load failed:', err);
      setError(err);
      
      // Track error
      performanceMonitor.trackError(err, {
        component: 'useOptimizedFormsRepository',
        operation: 'loadData'
      });

      // Show user-friendly error
      toast.error('Failed to load forms data. Please try again.');
      
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      loadingRef.current = false;
    }
  }, [getAccessTokenSilently, trackPerformance, enableBackgroundRefresh]);

  // Background refresh to keep cache warm
  const scheduleBackgroundRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // Refresh in background after 5 minutes
    refreshTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('Background refresh of forms repository data');
        await formsRepositoryService.loadAllFormsRepositoryData(
          getAccessTokenSilently,
          { useCache: false, forceRefresh: true }
        );
      } catch (error) {
        console.warn('Background refresh failed:', error);
      }
    }, 300000); // 5 minutes

  }, [getAccessTokenSilently]);

  // Refresh data manually
  const refresh = useCallback(async () => {
    const startTime = performance.now();
    
    await loadData(true);
    
    trackPerformance('forms_repository_refresh', startTime, {
      manual: true
    });
  }, [loadData, trackPerformance]);

  // Smart refresh that checks if data is stale
  const smartRefresh = useCallback(async () => {
    if (!lastUpdated) {
      return loadData();
    }

    const ageInMs = Date.now() - new Date(lastUpdated).getTime();
    const shouldRefresh = ageInMs > cacheTimeout || isStale;

    if (shouldRefresh) {
      console.log('Data is stale, refreshing...');
      return refresh();
    }

    console.log('Data is fresh, no refresh needed');
  }, [lastUpdated, cacheTimeout, isStale, loadData, refresh]);

  // Update specific data sections without full reload
  const updateClassrooms = useCallback(async () => {
    try {
      setLoading(true);
      const startTime = performance.now();
      
      // Invalidate only classroom cache and reload
      formsRepositoryService.invalidateCache();
      await loadData(true);
      
      trackPerformance('classroom_update', startTime, {
        partial: true
      });
      
    } catch (err) {
      console.error('Failed to update classrooms:', err);
      toast.error('Failed to update classroom data');
    } finally {
      setLoading(false);
    }
  }, [loadData, trackPerformance]);

  // Get performance metrics
  const getPerformanceMetrics = useCallback(() => {
    if (!enablePerformanceMonitoring) return null;
    
    return {
      loadMetrics: performanceMonitor.getMetrics('forms_repository_load', 10),
      refreshMetrics: performanceMonitor.getMetrics('forms_repository_refresh', 5),
      summary: performanceMonitor.getSummary()
    };
  }, [enablePerformanceMonitoring]);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad) {
      loadData();
    }

    return () => {
      mountedRef.current = false;
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      // Cancel any pending requests
      formsRepositoryService.cancelAllRequests();
    };
  }, [autoLoad, loadData]);

  // Return hook interface
  return {
    // Data
    data,
    loading,
    error,
    lastUpdated,
    isStale,
    
    // Actions
    loadData,
    refresh,
    smartRefresh,
    updateClassrooms,
    
    // Utilities
    getPerformanceMetrics,
    
    // Computed values
    isDataFresh: !isStale && lastUpdated && 
      (Date.now() - new Date(lastUpdated).getTime()) < cacheTimeout,
    
    // Individual data sections for easier access
    classrooms: data?.classrooms || [],
    forms: data?.forms || [],
    studentForms: data?.studentForms || [],
    availableForms: data?.availableForms || [],
    dropdownForms: data?.dropdownForms || [],
    stats: data?.stats || {}
  };
};