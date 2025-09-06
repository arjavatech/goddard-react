/**
 * Error handling utility for robust authentication and API error management
 * Categorizes errors and provides appropriate responses without unnecessary logouts
 */

// Error categories for different handling strategies
export const ERROR_TYPES = {
  NETWORK: 'NETWORK',
  SERVER: 'SERVER', 
  AUTH: 'AUTH',
  PERMISSION: 'PERMISSION',
  VALIDATION: 'VALIDATION',
  UNKNOWN: 'UNKNOWN'
};

// HTTP status codes that should NOT trigger logout
const SERVER_ERROR_CODES = [500, 502, 503, 504];
const NETWORK_ERROR_CODES = [0, 408, 429];

/**
 * Categorizes an error based on type and status code
 */
export const categorizeError = (error, response = null) => {
  // Network errors (connection issues, timeouts)
  if (!navigator.onLine) {
    return { type: ERROR_TYPES.NETWORK, reason: 'offline' };
  }
  
  if (error?.name === 'NetworkError' || 
      error?.message?.includes('Failed to fetch') ||
      error?.message?.includes('network') ||
      error?.message?.includes('timeout')) {
    return { type: ERROR_TYPES.NETWORK, reason: 'connection' };
  }

  // Response-based errors
  if (response) {
    const status = response.status;
    
    // Authentication failures that should trigger logout
    if (status === 401 || 
        error?.message?.includes('unauthorized') ||
        error?.message?.includes('invalid_token')) {
      return { type: ERROR_TYPES.AUTH, reason: 'unauthorized' };
    }
    
    // Permission errors (should not logout, just deny access)
    if (status === 403) {
      return { type: ERROR_TYPES.PERMISSION, reason: 'forbidden' };
    }
    
    // Server errors (should not logout)
    if (SERVER_ERROR_CODES.includes(status)) {
      return { type: ERROR_TYPES.SERVER, reason: 'server_error' };
    }
    
    // Network-related HTTP errors
    if (NETWORK_ERROR_CODES.includes(status)) {
      return { type: ERROR_TYPES.NETWORK, reason: 'http_network' };
    }
    
    // Validation errors (404, 400, 422)
    if (status === 404 || status === 400 || status === 422) {
      return { type: ERROR_TYPES.VALIDATION, reason: 'validation' };
    }
  }
  
  return { type: ERROR_TYPES.UNKNOWN, reason: 'unknown' };
};

/**
 * Determines if an error should trigger logout
 */
export const shouldLogout = (errorCategory) => {
  // Only logout on genuine authentication failures
  return errorCategory.type === ERROR_TYPES.AUTH;
};

/**
 * Gets user-friendly error message based on error category
 */
export const getErrorMessage = (errorCategory, context = '') => {
  const messages = {
    [ERROR_TYPES.NETWORK]: {
      offline: 'You appear to be offline. Please check your internet connection and try again.',
      connection: 'Network connection error. Please check your internet connection and try again.',
      http_network: 'Connection timeout. The server may be temporarily unavailable.'
    },
    [ERROR_TYPES.SERVER]: {
      server_error: 'Server is temporarily unavailable. Please try again in a few moments.'
    },
    [ERROR_TYPES.AUTH]: {
      unauthorized: 'Your session has expired. Please log in again.'
    },
    [ERROR_TYPES.PERMISSION]: {
      forbidden: 'You do not have permission to access this resource.'
    },
    [ERROR_TYPES.VALIDATION]: {
      validation: 'The request could not be processed. Please check your input and try again.'
    },
    [ERROR_TYPES.UNKNOWN]: {
      unknown: 'An unexpected error occurred. Please try again.'
    }
  };
  
  const categoryMessages = messages[errorCategory.type] || messages[ERROR_TYPES.UNKNOWN];
  return categoryMessages[errorCategory.reason] || categoryMessages.unknown || 'An error occurred.';
};

/**
 * Retry configuration for different error types
 */
const RETRY_CONFIG = {
  [ERROR_TYPES.NETWORK]: { maxRetries: 3, baseDelay: 1000, backoffMultiplier: 2 },
  [ERROR_TYPES.SERVER]: { maxRetries: 2, baseDelay: 2000, backoffMultiplier: 2 },
  [ERROR_TYPES.AUTH]: { maxRetries: 1, baseDelay: 0, backoffMultiplier: 1 },
  [ERROR_TYPES.PERMISSION]: { maxRetries: 0, baseDelay: 0, backoffMultiplier: 1 },
  [ERROR_TYPES.VALIDATION]: { maxRetries: 0, baseDelay: 0, backoffMultiplier: 1 },
  [ERROR_TYPES.UNKNOWN]: { maxRetries: 1, baseDelay: 1000, backoffMultiplier: 1 }
};

/**
 * Executes a function with retry logic based on error categorization
 */
export const withRetry = async (fn, context = 'operation') => {
  let lastError = null;
  let attempt = 0;
  
  while (true) {
    try {
      const result = await fn();
      return result;
    } catch (error) {
      lastError = error;
      attempt++;
      
      // Categorize the error to determine retry strategy
      const response = error.response || (error.status ? { status: error.status } : null);
      const errorCategory = categorizeError(error, response);
      const retryConfig = RETRY_CONFIG[errorCategory.type];
      
      console.log(`Attempt ${attempt} failed for ${context}:`, {
        error: error.message,
        category: errorCategory,
        willRetry: attempt <= retryConfig.maxRetries
      });
      
      // Check if we should retry
      if (attempt > retryConfig.maxRetries) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = retryConfig.baseDelay * Math.pow(retryConfig.backoffMultiplier, attempt - 1);
      
      if (delay > 0) {
        console.log(`Retrying ${context} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // All retries exhausted, throw the last error with category info
  const response = lastError.response || (lastError.status ? { status: lastError.status } : null);
  const errorCategory = categorizeError(lastError, response);
  
  const enhancedError = new Error(lastError.message);
  enhancedError.originalError = lastError;
  enhancedError.category = errorCategory;
  enhancedError.shouldLogout = shouldLogout(errorCategory);
  enhancedError.userMessage = getErrorMessage(errorCategory, context);
  
  throw enhancedError;
};

/**
 * Handles API errors gracefully with user feedback
 */
export const handleApiError = (error, context, options = {}) => {
  const { 
    showAlert = true, 
    logError = true,
    onLogoutRequired = null 
  } = options;
  
  let errorCategory;
  let shouldTriggerLogout = false;
  let userMessage;
  
  // Check if error was processed by withRetry
  if (error.category) {
    errorCategory = error.category;
    shouldTriggerLogout = error.shouldLogout;
    userMessage = error.userMessage;
  } else {
    // Process raw error
    const response = error.response || (error.status ? { status: error.status } : null);
    errorCategory = categorizeError(error, response);
    shouldTriggerLogout = shouldLogout(errorCategory);
    userMessage = getErrorMessage(errorCategory, context);
  }
  
  if (logError) {
    console.error(`Error in ${context}:`, {
      error: error.message,
      category: errorCategory,
      shouldLogout: shouldTriggerLogout,
      userMessage,
      timestamp: new Date().toISOString()
    });
  }
  
  if (showAlert && userMessage) {
    alert(userMessage);
  }
  
  // Only trigger logout for genuine authentication failures
  if (shouldTriggerLogout && onLogoutRequired) {
    onLogoutRequired();
  }
  
  return {
    category: errorCategory,
    shouldLogout: shouldTriggerLogout,
    message: userMessage
  };
};

/**
 * Creates a resilient API call wrapper
 */
export const createResilientApiCall = (getAccessTokenSilently, logout) => {
  return async (url, options = {}, context = 'API call') => {
    const apiCall = async () => {
      const headers = await getAuthHeaders(getAccessTokenSilently);
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers
        }
      });
      
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.status = response.status;
        error.response = response;
        throw error;
      }
      
      return response;
    };
    
    try {
      return await withRetry(apiCall, context);
    } catch (error) {
      handleApiError(error, context, {
        onLogoutRequired: logout
      });
      throw error;
    }
  };
};

// Import auth headers utility
import { getAuthHeaders } from './auth';