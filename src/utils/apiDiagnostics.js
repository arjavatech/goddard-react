/**
 * API Diagnostics Utility
 * 
 * This utility provides comprehensive testing and debugging tools for API endpoints,
 * specifically designed for the Goddard authentication system.
 * 
 * Key Features:
 * - Endpoint accessibility testing
 * - CORS policy validation
 * - Auth0 token validation
 * - Network connectivity analysis
 * - Error response analysis
 */

const API_BASE_URL = 'https://hfj4ckons6.execute-api.ap-south-1.amazonaws.com/dev';

/**
 * API Endpoint Configuration
 */
export const API_ENDPOINTS = {
  PERMISSION_CHECK: `${API_BASE_URL}/sign_in/check/1`,
  AUTH_CHECK: `${API_BASE_URL}/auth/verify`,
  USER_INFO: `${API_BASE_URL}/user/info`
};

/**
 * Expected HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

/**
 * Common API Error Messages
 */
export const API_ERROR_MESSAGES = {
  NO_AUTH_HEADER: 'Authorization header is required',
  TOKEN_VERIFICATION_FAILED: 'Token verification failed',
  INVALID_TOKEN: 'Invalid token format',
  NETWORK_ERROR: 'Network request failed',
  TIMEOUT_ERROR: 'Request timeout',
  CORS_ERROR: 'CORS policy violation'
};

/**
 * Test API endpoint accessibility
 * @param {string} endpoint - API endpoint URL
 * @param {Object} options - Request options
 * @returns {Promise<Object>} Diagnostic results
 */
export async function testEndpointAccessibility(endpoint, options = {}) {
  const diagnostics = {
    endpoint,
    timestamp: new Date().toISOString(),
    success: false,
    statusCode: null,
    responseTime: 0,
    error: null,
    headers: {},
    corsEnabled: false,
    authRequired: false
  };

  const startTime = performance.now();

  try {
    const response = await fetch(endpoint, {
      method: options.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      credentials: 'include'
    });

    diagnostics.responseTime = performance.now() - startTime;
    diagnostics.statusCode = response.status;
    diagnostics.success = response.ok;
    
    // Extract response headers
    response.headers.forEach((value, key) => {
      diagnostics.headers[key] = value;
    });

    // Check for CORS headers
    diagnostics.corsEnabled = !!(
      diagnostics.headers['access-control-allow-origin'] ||
      diagnostics.headers['access-control-allow-methods']
    );

    // Parse response body
    const responseText = await response.text();
    let responseData = null;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      responseData = responseText;
    }

    diagnostics.response = responseData;

    // Check for authentication requirements
    if (response.status === 401) {
      diagnostics.authRequired = true;
      if (responseData?.detail === API_ERROR_MESSAGES.NO_AUTH_HEADER) {
        diagnostics.error = 'Missing Authorization header';
      } else if (responseData?.detail === API_ERROR_MESSAGES.TOKEN_VERIFICATION_FAILED) {
        diagnostics.error = 'Invalid or expired token';
      }
    }

  } catch (error) {
    diagnostics.responseTime = performance.now() - startTime;
    diagnostics.error = error.message;
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      diagnostics.error = 'Network connection failed or CORS blocked';
    } else if (error.name === 'AbortError') {
      diagnostics.error = 'Request timeout';
    }
  }

  return diagnostics;
}

/**
 * Test CORS preflight request
 * @param {string} endpoint - API endpoint URL
 * @param {string} origin - Origin header value
 * @returns {Promise<Object>} CORS diagnostic results
 */
export async function testCORSPreflight(endpoint, origin = 'http://localhost:3000') {
  const diagnostics = {
    endpoint,
    origin,
    timestamp: new Date().toISOString(),
    success: false,
    corsEnabled: false,
    allowedOrigins: [],
    allowedMethods: [],
    allowedHeaders: [],
    maxAge: null,
    credentialsAllowed: false,
    error: null
  };

  try {
    const response = await fetch(endpoint, {
      method: 'OPTIONS',
      headers: {
        'Origin': origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    });

    diagnostics.success = response.ok;

    // Parse CORS headers
    const allowOrigin = response.headers.get('access-control-allow-origin');
    const allowMethods = response.headers.get('access-control-allow-methods');
    const allowHeaders = response.headers.get('access-control-allow-headers');
    const maxAge = response.headers.get('access-control-max-age');
    const allowCredentials = response.headers.get('access-control-allow-credentials');

    diagnostics.corsEnabled = !!(allowOrigin || allowMethods);
    diagnostics.allowedOrigins = allowOrigin ? allowOrigin.split(',').map(s => s.trim()) : [];
    diagnostics.allowedMethods = allowMethods ? allowMethods.split(',').map(s => s.trim()) : [];
    diagnostics.allowedHeaders = allowHeaders ? allowHeaders.split(',').map(s => s.trim()) : [];
    diagnostics.maxAge = maxAge ? parseInt(maxAge, 10) : null;
    diagnostics.credentialsAllowed = allowCredentials === 'true';

  } catch (error) {
    diagnostics.error = error.message;
  }

  return diagnostics;
}

/**
 * Validate Auth0 token format
 * @param {string} token - JWT token
 * @returns {Object} Token validation results
 */
export function validateTokenFormat(token) {
  const diagnostics = {
    isValid: false,
    format: null,
    parts: 0,
    header: null,
    payload: null,
    error: null
  };

  if (!token) {
    diagnostics.error = 'Token is empty or undefined';
    return diagnostics;
  }

  // Remove Bearer prefix if present
  const cleanToken = token.replace(/^Bearer\s+/, '');
  
  // JWT should have 3 parts separated by dots
  const parts = cleanToken.split('.');
  diagnostics.parts = parts.length;

  if (parts.length !== 3) {
    diagnostics.error = `Invalid JWT format: expected 3 parts, got ${parts.length}`;
    return diagnostics;
  }

  try {
    // Decode header (first part)
    const headerDecoded = atob(parts[0].replace(/-/g, '+').replace(/_/g, '/'));
    diagnostics.header = JSON.parse(headerDecoded);

    // Decode payload (second part)
    const payloadDecoded = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    diagnostics.payload = JSON.parse(payloadDecoded);

    diagnostics.isValid = true;
    diagnostics.format = 'JWT';

    // Check token expiration
    if (diagnostics.payload.exp) {
      const now = Math.floor(Date.now() / 1000);
      diagnostics.expired = diagnostics.payload.exp < now;
      diagnostics.expiresAt = new Date(diagnostics.payload.exp * 1000);
    }

  } catch (error) {
    diagnostics.error = `Token decode error: ${error.message}`;
  }

  return diagnostics;
}

/**
 * Perform comprehensive API diagnostics
 * @param {string} token - Auth0 token (optional)
 * @returns {Promise<Object>} Complete diagnostic results
 */
export async function performFullDiagnostics(token = null) {
  console.log('🔍 Starting comprehensive API diagnostics...');
  
  const results = {
    timestamp: new Date().toISOString(),
    summary: {
      endpointAccessible: false,
      corsConfigured: false,
      authenticationWorking: false,
      overallStatus: 'FAILED'
    },
    tests: {}
  };

  // Test 1: Basic endpoint accessibility without auth
  console.log('📡 Testing basic endpoint accessibility...');
  results.tests.basicAccess = await testEndpointAccessibility(
    API_ENDPOINTS.PERMISSION_CHECK,
    {
      method: 'POST',
      body: { email: 'test@test.com', auth0_user: true }
    }
  );

  results.summary.endpointAccessible = results.tests.basicAccess.success || 
    results.tests.basicAccess.statusCode === HTTP_STATUS.UNAUTHORIZED;

  // Test 2: CORS preflight
  console.log('🌐 Testing CORS configuration...');
  results.tests.cors = await testCORSPreflight(API_ENDPOINTS.PERMISSION_CHECK);
  results.summary.corsConfigured = results.tests.cors.corsEnabled;

  // Test 3: Token format validation (if token provided)
  if (token) {
    console.log('🔐 Validating token format...');
    results.tests.tokenValidation = validateTokenFormat(token);
    
    // Test 4: Authenticated request
    console.log('🔑 Testing authenticated request...');
    results.tests.authenticatedAccess = await testEndpointAccessibility(
      API_ENDPOINTS.PERMISSION_CHECK,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.replace(/^Bearer\s+/, '')}`
        },
        body: { email: 'test@test.com', auth0_user: true }
      }
    );

    results.summary.authenticationWorking = results.tests.authenticatedAccess.success;
  }

  // Test 5: Network connectivity and timing
  console.log('⚡ Testing network performance...');
  results.tests.performance = {
    averageResponseTime: 0,
    networkStable: true
  };

  const performanceTests = [];
  for (let i = 0; i < 3; i++) {
    const test = await testEndpointAccessibility(API_ENDPOINTS.PERMISSION_CHECK, {
      method: 'POST',
      body: { email: 'test@test.com', auth0_user: true }
    });
    performanceTests.push(test.responseTime);
  }

  results.tests.performance.averageResponseTime = 
    performanceTests.reduce((a, b) => a + b, 0) / performanceTests.length;
  
  results.tests.performance.networkStable = 
    Math.max(...performanceTests) - Math.min(...performanceTests) < 2000; // <2s variance

  // Determine overall status
  if (results.summary.endpointAccessible && results.summary.corsConfigured) {
    if (token && results.summary.authenticationWorking) {
      results.summary.overallStatus = 'SUCCESS';
    } else if (!token) {
      results.summary.overallStatus = 'PARTIAL - No token provided for auth test';
    } else {
      results.summary.overallStatus = 'PARTIAL - Authentication issues';
    }
  }

  return results;
}

/**
 * Generate diagnostic report
 * @param {Object} diagnostics - Diagnostic results
 * @returns {string} Formatted report
 */
export function generateDiagnosticReport(diagnostics) {
  const report = [];
  
  report.push('🔍 API DIAGNOSTIC REPORT');
  report.push('=' .repeat(50));
  report.push(`Timestamp: ${diagnostics.timestamp}`);
  report.push(`Overall Status: ${diagnostics.summary.overallStatus}`);
  report.push('');

  // Summary
  report.push('📊 SUMMARY');
  report.push('-'.repeat(20));
  report.push(`✅ Endpoint Accessible: ${diagnostics.summary.endpointAccessible}`);
  report.push(`🌐 CORS Configured: ${diagnostics.summary.corsConfigured}`);
  report.push(`🔐 Authentication Working: ${diagnostics.summary.authenticationWorking}`);
  report.push('');

  // Detailed results
  Object.entries(diagnostics.tests).forEach(([testName, results]) => {
    report.push(`🔧 ${testName.toUpperCase()}`);
    report.push('-'.repeat(20));
    
    if (typeof results === 'object' && results !== null) {
      Object.entries(results).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          report.push(`${key}: ${JSON.stringify(value, null, 2)}`);
        } else {
          report.push(`${key}: ${value}`);
        }
      });
    }
    report.push('');
  });

  return report.join('\n');
}

/**
 * Quick diagnostic check for development
 * @param {string} token - Optional Auth0 token
 * @returns {Promise<void>} Logs results to console
 */
export async function quickDiagnostic(token = null) {
  try {
    const results = await performFullDiagnostics(token);
    const report = generateDiagnosticReport(results);
    
    console.log(report);
    
    // Return simplified status for programmatic use
    return {
      status: results.summary.overallStatus,
      accessible: results.summary.endpointAccessible,
      corsEnabled: results.summary.corsConfigured,
      authWorking: results.summary.authenticationWorking
    };
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error.message);
    return {
      status: 'ERROR',
      error: error.message
    };
  }
}

// Development helper - expose to global scope in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.apiDiagnostics = {
    test: quickDiagnostic,
    full: performFullDiagnostics,
    endpoints: API_ENDPOINTS,
    validateToken: validateTokenFormat
  };
  
  console.log('🔧 API Diagnostics available on window.apiDiagnostics');
  console.log('Usage: window.apiDiagnostics.test() or window.apiDiagnostics.test("your-token")');
}