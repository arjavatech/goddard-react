/**
 * Main API Service Instance
 * Pre-configured API client for the Goddard React application
 */

import ApiClient from './core/ApiClient';
import { ApiClientConfig } from './types';

// Get environment variables
const getEnvVar = (key: string, defaultValue?: string): string => {
  if (typeof window !== 'undefined') {
    return (window as any).__ENV__?.[key] || import.meta.env[key] || defaultValue || '';
  }
  return import.meta.env[key] || defaultValue || '';
};

// API Configuration
const apiConfig: ApiClientConfig = {
  baseURL: getEnvVar('VITE_API_BASE_URL', 'https://api.goddardschool.com'),
  timeout: parseInt(getEnvVar('VITE_API_TIMEOUT', '30000')),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Client-Version': '1.0.0',
    'X-Client-Platform': 'web'
  },
  retry: {
    attempts: 3,
    delay: 1000,
    backoff: 'exponential',
    retryCondition: (error) => {
      // Retry on server errors, timeouts, and rate limits
      return error.status >= 500 || 
             error.status === 429 || 
             error.status === 408 ||
             error.status === 0; // Network errors
    }
  },
  circuitBreaker: {
    enabled: true,
    failureThreshold: 5,
    recoveryTimeout: 60000, // 1 minute
    monitoringPeriod: 10000  // 10 seconds
  },
  cache: {
    enabled: true,
    defaultTTL: 300000, // 5 minutes
    maxEntries: 1000,
    storageType: 'localStorage', // Use localStorage for persistence
    keyPrefix: 'goddard_api_cache_'
  },
  rateLimit: {
    enabled: true,
    requests: 100,
    windowMs: 60000, // 1 minute
    skipSuccessfulRequests: false,
    skipFailedRequests: true
  },
  auth: {
    tokenStorage: 'localStorage',
    autoRefresh: true,
    refreshThreshold: 300 // 5 minutes before expiry
  },
  logging: {
    enabled: getEnvVar('VITE_API_LOGGING', 'true') === 'true',
    level: getEnvVar('VITE_LOG_LEVEL', 'info') as 'debug' | 'info' | 'warn' | 'error',
    includeHeaders: getEnvVar('NODE_ENV') === 'development',
    includeData: getEnvVar('NODE_ENV') === 'development',
    maxBodySize: 1024
  }
};

// Create singleton API client instance
export const apiService = new ApiClient(apiConfig);

// Setup request logging in development
if (apiConfig.logging.enabled) {
  apiService.on('request', ({ config }) => {
    console.log(`🚀 [API] ${config.method?.toUpperCase()} ${config.url}`);
    if (apiConfig.logging.includeData && config.data) {
      console.log('📤 [API] Request data:', config.data);
    }
  });

  apiService.on('response', ({ config, response }) => {
    console.log(`✅ [API] ${response.status} ${config.method?.toUpperCase()} ${config.url} (${response.timestamp - Date.now()}ms)`);
    if (apiConfig.logging.includeData && response.data) {
      console.log('📥 [API] Response data:', response.data);
    }
  });

  apiService.on('error', ({ config, error }) => {
    console.error(`❌ [API] ${error.status} ${config.method?.toUpperCase()} ${config.url}:`, error.message);
  });

  apiService.on('retry', ({ config, attempt, error }) => {
    console.warn(`🔄 [API] Retry ${attempt} for ${config.method?.toUpperCase()} ${config.url}: ${error.message}`);
  });
}

// Export configured API service
export default apiService;

// Export types for convenience
export * from './types';
export { ApiClient } from './core/ApiClient';