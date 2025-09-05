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
  try {
    const token = await getAccessTokenSilently();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  } catch (error) {
    console.warn('Failed to get access token, returning headers without authorization:', error);
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
  try {
    const token = await getAccessTokenSilently();
    return {
      'Content-Type': contentType,
      'Authorization': `Bearer ${token}`,
    };
  } catch (error) {
    console.warn('Failed to get access token, returning headers without authorization:', error);
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
  try {
    const token = await getAccessTokenSilently();
    return {
      'Authorization': `Bearer ${token}`,
      // Note: Don't set Content-Type for FormData - browser will set it automatically with boundary
    };
  } catch (error) {
    console.warn('Failed to get access token, returning empty headers:', error);
    return {};
  }
};

/**
 * Safely gets the access token with error handling
 * @param {Function} getAccessTokenSilently - Auth0 function to get access token
 * @returns {Promise<string|null>} Access token or null if failed
 */
export const getAccessToken = async (getAccessTokenSilently) => {
  try {
    return await getAccessTokenSilently();
  } catch (error) {
    console.error('Failed to get access token:', error);
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
  const headers = await getAuthHeaders(getAccessTokenSilently);
  
  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers, // Allow overriding default headers
    },
  });
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
  console.error('Authentication error:', error);
  
  // If it's a token-related error, logout the user
  if (error.message.includes('token') || error.message.includes('unauthorized')) {
    logout({ 
      logoutParams: { 
        returnTo: window.location.origin + '/login'
      } 
    });
  }
};