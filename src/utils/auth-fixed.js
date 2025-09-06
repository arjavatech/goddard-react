/**
 * FIXED Authentication utility functions for Auth0 integration
 * Addresses critical security and reliability issues
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
    
    // SECURITY FIX: Remove token logging completely
    console.log('✅ [Auth] API token acquired successfully in', (endTime - startTime).toFixed(2), 'ms');
    console.log('🔍 [Auth] Token validation:', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      // REMOVED: tokenPrefix logging for security
      timestamp: new Date().toISOString(),
      audience: apiAudience || 'none'
    });
    
    // CRITICAL: Validate token exists before proceeding
    if (!token) {
      throw new Error('Token acquisition failed - no token received');
    }
    
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
      // SECURITY: Don't log stack traces in production
      timestamp: new Date().toISOString()
    });
    
    // CRITICAL FIX: Don't return headers without auth - throw error instead
    throw new Error(`Authentication failed: ${error.message}`);
  }
};

/**
 * Generates authenticated headers with custom content type
 */
export const getAuthHeadersWithContentType = async (getAccessTokenSilently, contentType = 'application/json') => {
  const startTime = performance.now();
  
  try {
    console.log('🎫 [Auth] Requesting access token for custom content type:', contentType);
    const token = await getAccessTokenSilently();
    
    if (!token) {
      throw new Error('Token acquisition failed');
    }
    
    const endTime = performance.now();
    console.log('✅ [Auth] Token acquired for custom content type in', (endTime - startTime).toFixed(2), 'ms');
    
    return {
      'Content-Type': contentType,
      'Authorization': `Bearer ${token}`,
    };
  } catch (error) {
    const endTime = performance.now();
    console.error('❌ [Auth] Failed to get access token for custom content type after', (endTime - startTime).toFixed(2), 'ms');
    throw new Error(`Authentication failed for custom content type: ${error.message}`);
  }
};

/**
 * Generates authenticated headers for multipart form data (file uploads)
 */
export const getAuthHeadersForUpload = async (getAccessTokenSilently) => {
  const startTime = performance.now();
  
  try {
    console.log('📤 [Auth] Requesting access token for file upload...');
    const token = await getAccessTokenSilently();
    
    if (!token) {
      throw new Error('Upload token acquisition failed');
    }
    
    const endTime = performance.now();
    console.log('✅ [Auth] Upload token acquired in', (endTime - startTime).toFixed(2), 'ms');
    
    return {
      'Authorization': `Bearer ${token}`,
      // Note: Don't set Content-Type for FormData - browser will set it automatically with boundary
    };
  } catch (error) {
    const endTime = performance.now();
    console.error('❌ [Auth] Failed to get upload access token after', (endTime - startTime).toFixed(2), 'ms');
    throw new Error(`Upload authentication failed: ${error.message}`);
  }
};

/**
 * Safely gets the access token with error handling
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
    throw new Error(`Raw token acquisition failed: ${error.message}`);
  }
};

/**
 * Gets user permissions (admin and parent status) - FIXED VERSION
 */
export const getUserPermissions = async (getAccessTokenSilently, email, schoolId, apiBaseUrl) => {
  try {
    const headers = await getAuthHeaders(getAccessTokenSilently);
    
    // SECURITY FIX: Remove dangerous empty password fallback
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
      return {
        isAdmin: data.isAdmin === true,
        isParent: data.isParent === true,
        email: email
      };
    }
    
    // FIXED: Proper error handling instead of silent failure
    const errorText = await response.text();
    throw new Error(`Permission check failed: ${response.status} - ${errorText}`);
    
  } catch (error) {
    console.error('Error getting user permissions:', error);
    throw error; // Re-throw instead of returning null silently
  }
};

/**
 * Enhanced error handler for authentication-related errors
 */
export const handleAuthError = (error, logout) => {
  console.error('❌ [Auth] Authentication error occurred:', error);
  
  // SECURITY: Don't log sensitive context in production
  const errorContext = {
    message: error.message,
    name: error.name,
    timestamp: new Date().toISOString(),
    currentUrl: window.location.pathname // Don't log full URL with potential tokens
  };
  
  if (process.env.NODE_ENV === 'development') {
    errorContext.stack = error.stack;
    errorContext.userAgent = navigator.userAgent;
  }
  
  console.error('🔍 [Auth] Error context:', errorContext);
  
  // Determine if this is a token-related error that requires logout
  const isTokenError = error.message.includes('token') || 
                      error.message.includes('unauthorized') ||
                      error.message.includes('invalid_token') ||
                      error.message.includes('expired') ||
                      error.message.includes('Authentication failed') ||
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

// Enhanced auth utility functions
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
    throw error;
  }
};

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
 * Enhanced permission checking with proper error handling
 */
export const checkAdminPrivileges = async (getAccessTokenSilently, email, schoolId, apiBaseUrl) => {
  try {
    const permissions = await getUserPermissions(getAccessTokenSilently, email, schoolId, apiBaseUrl);
    return permissions.isAdmin;
  } catch (error) {
    console.error('Error checking admin privileges:', error);
    return false;
  }
};

export const checkParentPrivileges = async (getAccessTokenSilently, email, schoolId, apiBaseUrl) => {
  try {
    const permissions = await getUserPermissions(getAccessTokenSilently, email, schoolId, apiBaseUrl);
    return permissions.isParent;
  } catch (error) {
    console.error('Error checking parent privileges:', error);
    return false;
  }
};