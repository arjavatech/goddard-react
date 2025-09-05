/**
 * Authentication utility functions for Auth0 integration
 * 
 * This module provides secure authentication utilities for the application,
 * including token management and HTTP header generation.
 */

/**
 * Generates authenticated headers for API requests
 * @param {Function} getAccessTokenSilently - Auth0 function to get access token
 * @returns {Promise<Object>} Headers object with Authorization and Content-Type
 */
export const getAuthHeaders = async (getAccessTokenSilently) => {
  const startTime = performance.now();
  
  try {
    console.log('🎫 [Auth] Requesting access token for API calls...');
    
    // For backend API calls, request token with specific audience
    const apiAudience = import.meta.env.VITE_AUTH0_AUDIENCE;
    const tokenOptions = apiAudience ? { 
      audience: apiAudience,
      scope: 'openid profile email'
    } : {};
    
    console.log('🔧 [Auth] Token request options:', tokenOptions);
    const token = await getAccessTokenSilently(tokenOptions);
    const endTime = performance.now();
    
    console.log('✅ [Auth] API token acquired successfully in', (endTime - startTime).toFixed(2), 'ms');
    console.log('🔍 [Auth] Token validation:', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenPrefix: token ? token.substring(0, 20) + '...' : 'null',
      timestamp: new Date().toISOString(),
      audience: apiAudience || 'none'
    });
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  } catch (error) {
    const endTime = performance.now();
    
    console.error('❌ [Auth] Failed to get API access token after', (endTime - startTime).toFixed(2), 'ms');
    console.error('🔍 [Auth] Token acquisition error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
    
    console.warn('⚠️ [Auth] Returning headers without authorization due to token failure');
    return {
      'Content-Type': 'application/json',
    };
  }
};

/**
 * Generates authenticated headers with custom content type
 * @param {Function} getAccessTokenSilently - Auth0 function to get access token  
 * @param {string} contentType - Custom content type (default: 'application/json')
 * @returns {Promise<Object>} Headers object with Authorization and custom Content-Type
 */
export const getAuthHeadersWithContentType = async (getAccessTokenSilently, contentType = 'application/json') => {
  const startTime = performance.now();
  
  try {
    console.log('🎫 [Auth] Requesting access token for custom content type:', contentType);
    const token = await getAccessTokenSilently();
    const endTime = performance.now();
    
    console.log('✅ [Auth] Token acquired for custom content type in', (endTime - startTime).toFixed(2), 'ms');
    
    return {
      'Content-Type': contentType,
      'Authorization': `Bearer ${token}`,
    };
  } catch (error) {
    const endTime = performance.now();
    
    console.error('❌ [Auth] Failed to get access token for custom content type after', (endTime - startTime).toFixed(2), 'ms');
    console.error('🔍 [Auth] Error details:', error);
    
    return {
      'Content-Type': contentType,
    };
  }
};

/**
 * Generates authenticated headers for multipart form data (file uploads)
 * @param {Function} getAccessTokenSilently - Auth0 function to get access token
 * @returns {Promise<Object>} Headers object with Authorization (no Content-Type for FormData)
 */
export const getAuthHeadersForUpload = async (getAccessTokenSilently) => {
  const startTime = performance.now();
  
  try {
    console.log('📤 [Auth] Requesting access token for file upload...');
    const token = await getAccessTokenSilently();
    const endTime = performance.now();
    
    console.log('✅ [Auth] Upload token acquired in', (endTime - startTime).toFixed(2), 'ms');
    
    return {
      'Authorization': `Bearer ${token}`,
      // Note: Don't set Content-Type for FormData - browser will set it automatically with boundary
    };
  } catch (error) {
    const endTime = performance.now();
    
    console.error('❌ [Auth] Failed to get upload access token after', (endTime - startTime).toFixed(2), 'ms');
    console.error('🔍 [Auth] Upload token error details:', error);
    
    return {};
  }
};

/**
 * Safely gets the access token with error handling
 * @param {Function} getAccessTokenSilently - Auth0 function to get access token
 * @returns {Promise<string|null>} Access token or null if failed
 */
export const getAccessToken = async (getAccessTokenSilently) => {
  const startTime = performance.now();
  
  try {
    console.log('🎫 [Auth] Getting raw access token...');
    const token = await getAccessTokenSilently();
    const endTime = performance.now();
    
    console.log('✅ [Auth] Raw token acquired in', (endTime - startTime).toFixed(2), 'ms');
    console.log('🔍 [Auth] Token info:', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      timestamp: new Date().toISOString()
    });
    
    return token;
  } catch (error) {
    const endTime = performance.now();
    
    console.error('❌ [Auth] Failed to get raw access token after', (endTime - startTime).toFixed(2), 'ms');
    console.error('🔍 [Auth] Raw token error details:', {
      message: error.message,
      name: error.name,
      timestamp: new Date().toISOString()
    });
    
    return null;
  }
};

/**
 * Creates a fetch request with automatic authentication headers
 * @param {string} url - Request URL
 * @param {Object} options - Fetch options
 * @param {Function} getAccessTokenSilently - Auth0 function to get access token
 * @returns {Promise<Response>} Fetch response
 */
export const authenticatedFetch = async (url, options = {}, getAccessTokenSilently) => {
  const startTime = performance.now();
  
  try {
    console.log('🌐 [Auth] Making authenticated fetch to:', url);
    const headers = await getAuthHeaders(getAccessTokenSilently);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers, // Allow overriding default headers
      },
    });
    
    const endTime = performance.now();
    console.log('📡 [Auth] Fetch completed in', (endTime - startTime).toFixed(2), 'ms', '- Status:', response.status);
    
    return response;
  } catch (error) {
    const endTime = performance.now();
    
    console.error('❌ [Auth] Authenticated fetch failed after', (endTime - startTime).toFixed(2), 'ms');
    console.error('🔍 [Auth] Fetch error details:', {
      url,
      method: options.method || 'GET',
      error: error.message,
      timestamp: new Date().toISOString()
    });
    
    throw error;
  }
};

/**
 * Makes an authenticated POST request with JSON data
 * @param {string} url - Request URL
 * @param {Object} data - Data to send in request body
 * @param {Function} getAccessTokenSilently - Auth0 function to get access token
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Response>} Fetch response
 */
export const authenticatedPost = async (url, data, getAccessTokenSilently, options = {}) => {
  const headers = await getAuthHeaders(getAccessTokenSilently);
  
  return fetch(url, {
    method: 'POST',
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
    body: JSON.stringify(data),
  });
};

/**
 * Makes an authenticated PUT request with JSON data
 * @param {string} url - Request URL
 * @param {Object} data - Data to send in request body
 * @param {Function} getAccessTokenSilently - Auth0 function to get access token
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Response>} Fetch response
 */
export const authenticatedPut = async (url, data, getAccessTokenSilently, options = {}) => {
  const headers = await getAuthHeaders(getAccessTokenSilently);
  
  return fetch(url, {
    method: 'PUT',
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
    body: JSON.stringify(data),
  });
};

/**
 * Makes an authenticated DELETE request
 * @param {string} url - Request URL
 * @param {Function} getAccessTokenSilently - Auth0 function to get access token
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Response>} Fetch response
 */
export const authenticatedDelete = async (url, getAccessTokenSilently, options = {}) => {
  const headers = await getAuthHeaders(getAccessTokenSilently);
  
  return fetch(url, {
    method: 'DELETE',
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });
};

/**
 * Checks if a user has admin privileges
 * @param {Function} getAccessTokenSilently - Auth0 function to get access token
 * @param {string} email - User email to check
 * @param {string} schoolId - School ID for the request
 * @param {string} apiBaseUrl - Base URL for the API
 * @returns {Promise<boolean>} True if user is admin, false otherwise
 */
export const checkAdminPrivileges = async (getAccessTokenSilently, email, schoolId, apiBaseUrl) => {
  try {
    const headers = await getAuthHeaders(getAccessTokenSilently);
    const response = await fetch(`${apiBaseUrl}/sign_in/check/${schoolId}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        email: email.toLowerCase(),
        auth0_user: true
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.isAdmin === true;
    }
    return false;
  } catch (error) {
    console.error('Error checking admin privileges:', error);
    return false;
  }
};

/**
 * Checks if a user has parent privileges
 * @param {Function} getAccessTokenSilently - Auth0 function to get access token
 * @param {string} email - User email to check
 * @param {string} schoolId - School ID for the request
 * @param {string} apiBaseUrl - Base URL for the API
 * @returns {Promise<boolean>} True if user is parent, false otherwise
 */
export const checkParentPrivileges = async (getAccessTokenSilently, email, schoolId, apiBaseUrl) => {
  try {
    const headers = await getAuthHeaders(getAccessTokenSilently);
    const response = await fetch(`${apiBaseUrl}/sign_in/check/${schoolId}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        email: email.toLowerCase(),
        auth0_user: true
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.isParent === true;
    }
    return false;
  } catch (error) {
    console.error('Error checking parent privileges:', error);
    return false;
  }
};

/**
 * Gets user permissions (admin and parent status)
 * @param {Function} getAccessTokenSilently - Auth0 function to get access token
 * @param {string} email - User email to check
 * @param {string} schoolId - School ID for the request
 * @param {string} apiBaseUrl - Base URL for the API
 * @returns {Promise<Object|null>} User permissions object or null if failed
 */
export const getUserPermissions = async (getAccessTokenSilently, email, schoolId, apiBaseUrl) => {
  try {
    const headers = await getAuthHeaders(getAccessTokenSilently);
    
    // Try with auth0_user flag first
    let response = await fetch(`${apiBaseUrl}/sign_in/check/${schoolId}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        email: email.toLowerCase(),
        auth0_user: true
      })
    });

    // If that fails, try with empty password (fallback)
    if (!response.ok) {
      response = await fetch(`${apiBaseUrl}/sign_in/check/${schoolId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          email: email.toLowerCase(),
          password: ''
        })
      });
    }

    if (response.ok) {
      const data = await response.json();
      return {
        isAdmin: data.isAdmin === true,
        isParent: data.isParent === true,
        email: email
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return null;
  }
};

/**
 * Error handler for authentication-related errors
 * @param {Error} error - The error to handle
 * @param {Function} logout - Auth0 logout function
 * @returns {void}
 */
export const handleAuthError = (error, logout) => {
  console.error('❌ [Auth] Authentication error occurred:', error);
  console.error('🔍 [Auth] Error context:', {
    message: error.message,
    name: error.name,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    currentUrl: window.location.href,
    userAgent: navigator.userAgent
  });
  
  // Determine if this is a token-related error that requires logout
  const isTokenError = error.message.includes('token') || 
                      error.message.includes('unauthorized') ||
                      error.message.includes('invalid_token') ||
                      error.message.includes('expired') ||
                      error.name === 'AuthenticationError';
  
  if (isTokenError) {
    console.warn('🚪 [Auth] Token-related error detected, initiating logout...');
    try {
      logout({ 
        logoutParams: { 
          returnTo: window.location.origin + '/login'
        } 
      });
    } catch (logoutError) {
      console.error('❌ [Auth] Logout failed:', logoutError);
      // Fallback: redirect manually
      window.location.href = '/login';
    }
  } else {
    console.log('ℹ️ [Auth] Non-token error, not forcing logout');
  }
};