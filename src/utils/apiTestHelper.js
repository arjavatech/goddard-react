// API Endpoint Testing Utility
// Helps diagnose and fix 405 Method Not Allowed errors
import { api_base_url, school_id } from '@/utils/const';
import { getAuthHeaders } from '@/utils/auth';

/**
 * Test API endpoint with different HTTP methods to find the correct one
 * @param {string} endpoint - API endpoint to test
 * @param {object} testData - Sample data to send
 * @param {Function} getAccessTokenSilently - Auth0 token function
 * @returns {Promise<object>} Test results
 */
export const testEndpointMethods = async (endpoint, testData = {}, getAccessTokenSilently) => {
  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
  const results = {};
  
  console.log(`🧪 Testing endpoint: ${endpoint}`);
  
  try {
    const headers = await getAuthHeaders(getAccessTokenSilently);
    
    for (const method of methods) {
      try {
        const config = {
          method,
          headers
        };
        
        // Only add body for methods that typically use it
        if (['POST', 'PUT', 'PATCH'].includes(method)) {
          config.body = JSON.stringify(testData);
        }
        
        console.log(`🔍 Testing ${method} method...`);
        
        const response = await fetch(`${api_base_url}${endpoint}`, config);
        
        results[method] = {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries())
        };
        
        // If method is allowed, try to get response body
        if (response.status !== 405) {
          try {
            const responseText = await response.text();
            results[method].body = responseText;
            
            // Try to parse as JSON
            try {
              results[method].json = JSON.parse(responseText);
            } catch (e) {
              // Not JSON, keep as text
            }
          } catch (e) {
            results[method].bodyError = e.message;
          }
        }
        
        console.log(`${response.ok ? '✅' : '❌'} ${method}: ${response.status} ${response.statusText}`);
        
      } catch (error) {
        results[method] = {
          error: error.message,
          success: false
        };
        console.log(`❌ ${method}: ${error.message}`);
      }
    }
    
    return results;
  } catch (error) {
    console.error('❌ Endpoint testing failed:', error);
    throw error;
  }
};

/**
 * Test form submission endpoints specifically
 * @param {number} childId - Child ID for testing
 * @param {Function} getAccessTokenSilently - Auth0 token function
 * @returns {Promise<object>} Test results for all form endpoints
 */
export const testFormEndpoints = async (childId, getAccessTokenSilently) => {
  const formEndpoints = {
    admission: `/admission_segment/${school_id}/${childId}`,
    authorization: `/authorization_form/${school_id}/${childId}`,
    parentHandbook: `/parent_handbook/${school_id}/${childId}`,
    enrollment: `/enrollment_form/${school_id}/${childId}`,
    completion: `/admission_child_personal/completed_form_status/${school_id}/${childId}`
  };
  
  const testData = {
    test: true,
    timestamp: new Date().toISOString(),
    child_id: childId
  };
  
  const results = {};
  
  console.log('🏁 Starting comprehensive form endpoint testing...');
  
  for (const [formType, endpoint] of Object.entries(formEndpoints)) {
    console.log(`\n📝 Testing ${formType} endpoint: ${endpoint}`);
    try {
      results[formType] = await testEndpointMethods(endpoint, testData, getAccessTokenSilently);
    } catch (error) {
      results[formType] = { error: error.message };
    }
  }
  
  return results;
};

/**
 * Analyze test results and provide recommendations
 * @param {object} testResults - Results from testEndpointMethods or testFormEndpoints
 * @returns {object} Analysis and recommendations
 */
export const analyzeTestResults = (testResults) => {
  const analysis = {
    recommendations: [],
    workingMethods: {},
    issues: []
  };
  
  for (const [endpoint, methods] of Object.entries(testResults)) {
    if (methods.error) {
      analysis.issues.push(`${endpoint}: ${methods.error}`);
      continue;
    }
    
    const workingMethods = [];
    const methodNotAllowed = [];
    
    for (const [method, result] of Object.entries(methods)) {
      if (result.error) {
        analysis.issues.push(`${endpoint} ${method}: ${result.error}`);
      } else if (result.status === 405) {
        methodNotAllowed.push(method);
      } else if (result.ok || result.status < 400) {
        workingMethods.push(method);
      }
    }
    
    analysis.workingMethods[endpoint] = workingMethods;
    
    if (methodNotAllowed.length > 0) {
      analysis.recommendations.push(
        `${endpoint}: Methods ${methodNotAllowed.join(', ')} not allowed. ` +
        `Try: ${workingMethods.length > 0 ? workingMethods.join(', ') : 'No working methods found'}`
      );
    }
  }
  
  return analysis;
};

/**
 * Quick diagnosis for a specific 405 error
 * @param {string} endpoint - The failing endpoint
 * @param {string} currentMethod - The method that failed
 * @param {Function} getAccessTokenSilently - Auth0 token function
 * @returns {Promise<object>} Diagnosis and suggestions
 */
export const diagnose405Error = async (endpoint, currentMethod, getAccessTokenSilently) => {
  console.log(`🩺 Diagnosing 405 error for ${currentMethod} ${endpoint}`);
  
  const testResults = await testEndpointMethods(endpoint, {}, getAccessTokenSilently);
  const analysis = analyzeTestResults({ [endpoint]: testResults });
  
  const diagnosis = {
    failedMethod: currentMethod,
    endpoint,
    workingMethods: analysis.workingMethods[endpoint] || [],
    recommendations: analysis.recommendations,
    suggestedFix: null
  };
  
  // Suggest the best alternative method
  const alternatives = diagnosis.workingMethods.filter(method => method !== currentMethod);
  if (alternatives.length > 0) {
    // Prefer POST for creation, PUT for updates
    if (alternatives.includes('POST')) {
      diagnosis.suggestedFix = 'POST';
    } else if (alternatives.includes('PUT')) {
      diagnosis.suggestedFix = 'PUT';
    } else {
      diagnosis.suggestedFix = alternatives[0];
    }
  }
  
  console.log('📊 Diagnosis complete:', diagnosis);
  return diagnosis;
};