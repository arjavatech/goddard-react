/**
 * React Hook for API requests
 * Provides loading states, error handling, and automatic retries
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { apiService } from '../ApiService';
import { ApiRequestConfig, ApiResponse, ApiError, LoadingState } from '../types';

export interface UseApiRequestOptions extends Partial<ApiRequestConfig> {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
  dependencies?: React.DependencyList;
}

export interface UseApiRequestResult<T = any> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  execute: (config?: Partial<ApiRequestConfig>) => Promise<T>;
  reset: () => void;
  retry: () => Promise<T>;
  cancel: () => void;
}

export function useApiRequest<T = any>(
  config: ApiRequestConfig,
  options: UseApiRequestOptions = {}
): UseApiRequestResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  
  const lastConfigRef = useRef<ApiRequestConfig>(config);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const {
    immediate = false,
    onSuccess,
    onError,
    dependencies = [],
    ...requestOptions
  } = options;

  const execute = useCallback(async (overrideConfig?: Partial<ApiRequestConfig>): Promise<T> => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const finalConfig: ApiRequestConfig = {
      ...lastConfigRef.current,
      ...requestOptions,
      ...overrideConfig
    };

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    if (!isMountedRef.current) return Promise.reject(new Error('Component unmounted'));

    setLoading(true);
    setError(null);

    try {
      const response: ApiResponse<T> = await apiService.request<T>(finalConfig);
      
      if (!isMountedRef.current) return Promise.reject(new Error('Component unmounted'));

      const responseData = response.data;
      setData(responseData);
      setLoading(false);
      
      onSuccess?.(responseData);
      
      return responseData;
    } catch (err) {
      if (!isMountedRef.current) return Promise.reject(err);

      const apiError = err as ApiError;
      setError(apiError);
      setLoading(false);
      
      onError?.(apiError);
      
      throw apiError;
    }
  }, [requestOptions, onSuccess, onError]);

  const retry = useCallback(async (): Promise<T> => {
    return execute();
  }, [execute]);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
  }, []);

  // Execute on mount if immediate is true
  useEffect(() => {
    if (immediate) {
      execute().catch(() => {
        // Error handled by execute function
      });
    }
  }, [immediate, ...dependencies]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Update config reference when it changes
  useEffect(() => {
    lastConfigRef.current = config;
  }, [config]);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    retry,
    cancel
  };
}

// Convenience hooks for specific HTTP methods
export function useGet<T = any>(
  url: string, 
  options: Omit<UseApiRequestOptions, 'method'> = {}
): UseApiRequestResult<T> {
  return useApiRequest<T>(
    { url, method: 'GET' },
    options
  );
}

export function usePost<T = any>(
  url: string,
  options: Omit<UseApiRequestOptions, 'method'> = {}
): UseApiRequestResult<T> {
  return useApiRequest<T>(
    { url, method: 'POST' },
    { ...options, immediate: false }
  );
}

export function usePut<T = any>(
  url: string,
  options: Omit<UseApiRequestOptions, 'method'> = {}
): UseApiRequestResult<T> {
  return useApiRequest<T>(
    { url, method: 'PUT' },
    { ...options, immediate: false }
  );
}

export function useDelete<T = any>(
  url: string,
  options: Omit<UseApiRequestOptions, 'method'> = {}
): UseApiRequestResult<T> {
  return useApiRequest<T>(
    { url, method: 'DELETE' },
    { ...options, immediate: false }
  );
}

// Hook for paginated data
export interface UsePaginatedApiOptions extends UseApiRequestOptions {
  initialPage?: number;
  initialPageSize?: number;
}

export interface UsePaginatedApiResult<T = any> extends Omit<UseApiRequestResult<T>, 'data'> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  nextPage: () => Promise<void>;
  prevPage: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  setPageSize: (size: number) => Promise<void>;
}

export function usePaginatedApi<T = any>(
  baseUrl: string,
  options: UsePaginatedApiOptions = {}
): UsePaginatedApiResult<T> {
  const { initialPage = 1, initialPageSize = 10, ...restOptions } = options;
  
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [pagination, setPagination] = useState<UsePaginatedApiResult<T>['pagination']>(null);
  
  const url = `${baseUrl}?page=${page}&pageSize=${pageSize}`;
  
  const {
    data: rawData,
    loading,
    error,
    execute: originalExecute,
    reset,
    retry,
    cancel
  } = useApiRequest<{
    data: T[];
    pagination: UsePaginatedApiResult<T>['pagination'];
  }>(
    { url, method: 'GET' },
    {
      ...restOptions,
      onSuccess: (response) => {
        setPagination(response.pagination);
        restOptions.onSuccess?.(response);
      }
    }
  );

  const data = rawData?.data || [];

  const nextPage = useCallback(async () => {
    if (pagination?.hasNext) {
      setPage(prev => prev + 1);
    }
  }, [pagination?.hasNext]);

  const prevPage = useCallback(async () => {
    if (pagination?.hasPrev) {
      setPage(prev => prev - 1);
    }
  }, [pagination?.hasPrev]);

  const goToPage = useCallback(async (newPage: number) => {
    if (pagination && newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage);
    }
  }, [pagination]);

  const setPageSize = useCallback(async (size: number) => {
    setPageSizeState(size);
    setPage(1); // Reset to first page when changing page size
  }, []);

  const execute = useCallback(async (config?: Partial<ApiRequestConfig>) => {
    const result = await originalExecute(config);
    return result.data;
  }, [originalExecute]);

  return {
    data,
    pagination,
    loading,
    error,
    execute,
    reset: useCallback(() => {
      reset();
      setPagination(null);
      setPage(initialPage);
    }, [reset, initialPage]),
    retry,
    cancel,
    nextPage,
    prevPage,
    goToPage,
    setPageSize
  };
}