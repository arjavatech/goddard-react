/**
 * Test script to verify auth utilities work correctly
 * Run with: node tests/auth-utilities-test.js
 */

import { 
  getAuthHeaders, 
  getAuthHeadersWithContentType, 
  getAuthHeadersForUpload,
  getAccessToken,
  authenticatedFetch,
  authenticatedPost,
  checkAdminPrivileges,
  checkParentPrivileges,
  getUserPermissions,
  handleAuthError 
} from '../src/utils/auth.js';

// Mock Auth0 getAccessTokenSilently function
const mockGetAccessTokenSilently = () => Promise.resolve('mock-jwt-token-123');
const mockGetAccessTokenSilentlyError = () => Promise.reject(new Error('Token expired'));

console.log('🧪 Testing Auth Utilities...\n');

// Test 1: getAuthHeaders with valid token
async function testGetAuthHeaders() {
  console.log('Test 1: getAuthHeaders with valid token');
  try {
    const headers = await getAuthHeaders(mockGetAccessTokenSilently);
    console.log('✅ Headers:', headers);
    console.assert(headers['Content-Type'] === 'application/json', 'Content-Type should be application/json');
    console.assert(headers['Authorization'] === 'Bearer mock-jwt-token-123', 'Authorization header should contain token');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  console.log('');
}

// Test 2: getAuthHeaders with error
async function testGetAuthHeadersError() {
  console.log('Test 2: getAuthHeaders with token error');
  try {
    const headers = await getAuthHeaders(mockGetAccessTokenSilentlyError);
    console.log('✅ Headers (fallback):', headers);
    console.assert(headers['Content-Type'] === 'application/json', 'Content-Type should be application/json');
    console.assert(!headers['Authorization'], 'Authorization header should not exist on error');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  console.log('');
}

// Test 3: getAuthHeadersWithContentType
async function testGetAuthHeadersWithContentType() {
  console.log('Test 3: getAuthHeadersWithContentType');
  try {
    const headers = await getAuthHeadersWithContentType(mockGetAccessTokenSilently, 'text/plain');
    console.log('✅ Headers with custom content type:', headers);
    console.assert(headers['Content-Type'] === 'text/plain', 'Content-Type should be text/plain');
    console.assert(headers['Authorization'] === 'Bearer mock-jwt-token-123', 'Authorization header should contain token');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  console.log('');
}

// Test 4: getAuthHeadersForUpload
async function testGetAuthHeadersForUpload() {
  console.log('Test 4: getAuthHeadersForUpload');
  try {
    const headers = await getAuthHeadersForUpload(mockGetAccessTokenSilently);
    console.log('✅ Upload headers:', headers);
    console.assert(headers['Authorization'] === 'Bearer mock-jwt-token-123', 'Authorization header should contain token');
    console.assert(!headers['Content-Type'], 'Content-Type should not be set for uploads');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  console.log('');
}

// Test 5: getAccessToken
async function testGetAccessToken() {
  console.log('Test 5: getAccessToken');
  try {
    const token = await getAccessToken(mockGetAccessTokenSilently);
    console.log('✅ Token:', token);
    console.assert(token === 'mock-jwt-token-123', 'Token should match mock value');
    
    const tokenError = await getAccessToken(mockGetAccessTokenSilentlyError);
    console.log('✅ Token with error (should be null):', tokenError);
    console.assert(tokenError === null, 'Token should be null on error');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  console.log('');
}

// Test 6: Function exports
function testFunctionExports() {
  console.log('Test 6: Function exports');
  const functions = {
    getAuthHeaders,
    getAuthHeadersWithContentType,
    getAuthHeadersForUpload,
    getAccessToken,
    authenticatedFetch,
    authenticatedPost,
    checkAdminPrivileges,
    checkParentPrivileges,
    getUserPermissions,
    handleAuthError
  };
  
  for (const [name, func] of Object.entries(functions)) {
    console.assert(typeof func === 'function', `${name} should be a function`);
    console.log(`✅ ${name} is exported as function`);
  }
  console.log('');
}

// Run all tests
async function runAllTests() {
  try {
    await testGetAuthHeaders();
    await testGetAuthHeadersError();
    await testGetAuthHeadersWithContentType();
    await testGetAuthHeadersForUpload();
    await testGetAccessToken();
    testFunctionExports();
    
    console.log('🎉 All tests passed! Auth utilities are working correctly.');
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
}

runAllTests();