/**
 * Authentication Test Component
 * 
 * Comprehensive test component to validate authentication persistence
 * across page refresh, navigation, and state changes.
 * 
 * Features:
 * - Real-time authentication state monitoring
 * - Auth0 localStorage key monitoring
 * - Navigation scenario testing
 * - Page refresh testing
 * - Token refresh validation
 * - Console logging for debugging
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthenticationTest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    isAuthenticated, 
    isLoading, 
    user, 
    error, 
    permissions, 
    roles,
    login, 
    logout, 
    refreshAuth,
    getToken 
  } = useAuthContext();

  // Test state
  const [testResults, setTestResults] = useState({});
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [localStorageKeys, setLocalStorageKeys] = useState({});
  const [authStateHistory, setAuthStateHistory] = useState([]);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);

  // Refs for monitoring
  const authStateRef = useRef();
  const intervalRef = useRef();

  // Auth0 localStorage keys to monitor
  const AUTH0_KEYS = [
    '@@auth0spajs@@::',
    'auth0.is.authenticated',
    'auth0.access_token',
    'auth0.id_token',
    'auth0.refresh_token',
    'auth0.expires_at',
    'auth0.user'
  ];

  // Monitor localStorage changes
  const checkLocalStorage = () => {
    const keys = {};
    AUTH0_KEYS.forEach(keyPattern => {
      // Check for exact matches and pattern matches
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key === keyPattern || key.includes(keyPattern.replace('::', '')))) {
          try {
            const value = localStorage.getItem(key);
            keys[key] = {
              exists: true,
              length: value ? value.length : 0,
              preview: value ? value.substring(0, 50) + '...' : null,
              isJSON: value && (value.startsWith('{') || value.startsWith('['))
            };
          } catch (error) {
            keys[key] = { exists: true, error: error.message };
          }
        }
      }
    });

    // Check for any keys that might contain auth0
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.toLowerCase().includes('auth0')) {
        if (!keys[key]) {
          const value = localStorage.getItem(key);
          keys[key] = {
            exists: true,
            length: value ? value.length : 0,
            preview: value ? value.substring(0, 50) + '...' : null,
            isJSON: value && (value.startsWith('{') || value.startsWith('['))
          };
        }
      }
    }

    setLocalStorageKeys(keys);
  };

  // Monitor authentication state changes
  const logAuthStateChange = (newState) => {
    const timestamp = new Date().toISOString();
    const stateEntry = {
      timestamp,
      isAuthenticated: newState.isAuthenticated,
      isLoading: newState.isLoading,
      hasUser: !!newState.user,
      userEmail: newState.user?.email,
      permissionsCount: newState.permissions?.length || 0,
      rolesCount: newState.roles?.length || 0,
      error: newState.error
    };

    console.log('🔐 [AuthTest] Authentication state changed:', stateEntry);
    
    setAuthStateHistory(prev => [...prev.slice(-9), stateEntry]); // Keep last 10 entries
  };

  // Get current token information
  const checkTokenInfo = async () => {
    try {
      const token = await getToken();
      if (token) {
        // Decode JWT payload (basic decode, not verification)
        const payload = JSON.parse(atob(token.split('.')[1]));
        setTokenInfo({
          hasToken: true,
          expiresAt: new Date(payload.exp * 1000).toISOString(),
          issuedAt: new Date(payload.iat * 1000).toISOString(),
          audience: payload.aud,
          issuer: payload.iss,
          subject: payload.sub
        });
      } else {
        setTokenInfo({ hasToken: false });
      }
    } catch (error) {
      setTokenInfo({ hasToken: false, error: error.message });
    }
  };

  // Initialize monitoring
  useEffect(() => {
    console.log('🔐 [AuthTest] Starting authentication monitoring...');
    
    // Initial checks
    checkLocalStorage();
    checkTokenInfo();
    logAuthStateChange({ isAuthenticated, isLoading, user, error, permissions, roles });

    // Set up periodic monitoring
    intervalRef.current = setInterval(() => {
      checkLocalStorage();
      if (isAuthenticated) {
        checkTokenInfo();
      }
    }, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Monitor auth state changes
  useEffect(() => {
    const currentState = { isAuthenticated, isLoading, user, error, permissions, roles };
    
    // Check if state actually changed
    if (JSON.stringify(currentState) !== JSON.stringify(authStateRef.current)) {
      authStateRef.current = currentState;
      logAuthStateChange(currentState);
    }
  }, [isAuthenticated, isLoading, user, error, permissions, roles]);

  // Test scenarios
  const runTest = async (testName, testFunction) => {
    setIsRunningTest(true);
    const startTime = Date.now();
    
    try {
      console.log(`🧪 [AuthTest] Starting test: ${testName}`);
      const result = await testFunction();
      const duration = Date.now() - startTime;
      
      const testResult = {
        name: testName,
        status: 'passed',
        duration,
        result,
        timestamp: new Date().toISOString()
      };
      
      setTestResults(prev => ({ ...prev, [testName]: testResult }));
      console.log(`✅ [AuthTest] Test passed: ${testName}`, testResult);
      
      return testResult;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      const testResult = {
        name: testName,
        status: 'failed',
        duration,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      setTestResults(prev => ({ ...prev, [testName]: testResult }));
      console.error(`❌ [AuthTest] Test failed: ${testName}`, testResult);
      
      return testResult;
    } finally {
      setIsRunningTest(false);
    }
  };

  // Test functions
  const testPageRefresh = () => {
    return runTest('Page Refresh Test', async () => {
      console.log('🔄 [AuthTest] Triggering page refresh...');
      window.location.reload();
      return { message: 'Page refresh initiated' };
    });
  };

  const testNavigation = (path) => {
    return runTest(`Navigation Test: ${path}`, async () => {
      console.log(`🧭 [AuthTest] Navigating to: ${path}`);
      navigate(path);
      return { message: `Navigated to ${path}`, currentPath: location.pathname };
    });
  };

  const testLogin = () => {
    return runTest('Login Test', async () => {
      console.log('🔑 [AuthTest] Initiating login...');
      await login();
      return { message: 'Login completed' };
    });
  };

  const testLogout = () => {
    return runTest('Logout Test', async () => {
      console.log('🚪 [AuthTest] Initiating logout...');
      await logout();
      return { message: 'Logout completed' };
    });
  };

  const testTokenRefresh = () => {
    return runTest('Token Refresh Test', async () => {
      console.log('🔄 [AuthTest] Refreshing authentication...');
      await refreshAuth();
      setRefreshCount(prev => prev + 1);
      return { message: 'Token refresh completed', refreshCount: refreshCount + 1 };
    });
  };

  const testTokenRetrieval = () => {
    return runTest('Token Retrieval Test', async () => {
      console.log('🎫 [AuthTest] Retrieving access token...');
      const token = await getToken();
      return { 
        hasToken: !!token, 
        tokenLength: token?.length || 0,
        tokenPreview: token ? `${token.substring(0, 20)}...` : null
      };
    });
  };

  const clearTestResults = () => {
    setTestResults({});
    setAuthStateHistory([]);
    setRefreshCount(0);
    console.log('🧹 [AuthTest] Test results cleared');
  };

  const exportTestData = () => {
    const data = {
      testResults,
      authStateHistory,
      localStorageKeys,
      tokenInfo,
      currentState: {
        isAuthenticated,
        isLoading,
        user: user ? { email: user.email, name: user.name } : null,
        permissions,
        roles,
        error
      },
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auth-test-data-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('💾 [AuthTest] Test data exported');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Authentication Test Dashboard
        </h1>
        <p className="text-gray-600">
          Monitor authentication state, test scenarios, and validate persistence across page refresh and navigation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Authentication State */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Current Authentication State
          </h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Is Authenticated:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isAuthenticated ? 'Yes' : 'No'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Is Loading:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                isLoading ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {isLoading ? 'Yes' : 'No'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">User Email:</span>
              <span className="text-gray-600">{user?.email || 'None'}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">User Name:</span>
              <span className="text-gray-600">{user?.name || 'None'}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Permissions:</span>
              <span className="text-gray-600">{permissions?.length || 0}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Roles:</span>
              <span className="text-gray-600">{roles?.length || 0}</span>
            </div>
            
            {error && (
              <div className="flex flex-col">
                <span className="font-medium text-red-600">Error:</span>
                <span className="text-red-500 text-sm bg-red-50 p-2 rounded mt-1">
                  {error}
                </span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="font-medium">Current Path:</span>
              <span className="text-gray-600">{location.pathname}</span>
            </div>
          </div>
        </div>

        {/* Token Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Token Information
          </h2>
          
          {tokenInfo ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Has Token:</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  tokenInfo.hasToken ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {tokenInfo.hasToken ? 'Yes' : 'No'}
                </span>
              </div>
              
              {tokenInfo.hasToken && (
                <>
                  <div className="flex flex-col">
                    <span className="font-medium">Expires At:</span>
                    <span className="text-gray-600 text-sm">{tokenInfo.expiresAt}</span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="font-medium">Issued At:</span>
                    <span className="text-gray-600 text-sm">{tokenInfo.issuedAt}</span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="font-medium">Audience:</span>
                    <span className="text-gray-600 text-sm">{tokenInfo.audience}</span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="font-medium">Subject:</span>
                    <span className="text-gray-600 text-sm font-mono">{tokenInfo.subject}</span>
                  </div>
                </>
              )}
              
              {tokenInfo.error && (
                <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
                  {tokenInfo.error}
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500">Loading token information...</div>
          )}
          
          <div className="mt-4">
            <button
              onClick={checkTokenInfo}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Refresh Token Info
            </button>
          </div>
        </div>

        {/* Test Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Test Scenarios
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={testPageRefresh}
              disabled={isRunningTest}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              Test Page Refresh
            </button>
            
            <button
              onClick={testTokenRefresh}
              disabled={isRunningTest || !isAuthenticated}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              Test Token Refresh
            </button>
            
            <button
              onClick={testTokenRetrieval}
              disabled={isRunningTest || !isAuthenticated}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 transition-colors"
            >
              Test Token Retrieval
            </button>
            
            <button
              onClick={() => testNavigation('/dashboard')}
              disabled={isRunningTest}
              className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50 transition-colors"
            >
              Navigate to Dashboard
            </button>
            
            <button
              onClick={() => testNavigation('/forms')}
              disabled={isRunningTest}
              className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 disabled:opacity-50 transition-colors"
            >
              Navigate to Forms
            </button>
            
            <button
              onClick={() => testNavigation('/')}
              disabled={isRunningTest}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              Navigate to Home
            </button>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-3">
            {!isAuthenticated ? (
              <button
                onClick={testLogin}
                disabled={isRunningTest}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                Test Login
              </button>
            ) : (
              <button
                onClick={testLogout}
                disabled={isRunningTest}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                Test Logout
              </button>
            )}
            
            <button
              onClick={clearTestResults}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Clear Results
            </button>
          </div>
        </div>

        {/* localStorage Monitor */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Auth0 localStorage Keys
          </h2>
          
          {Object.keys(localStorageKeys).length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {Object.entries(localStorageKeys).map(([key, info]) => (
                <div key={key} className="border-l-4 border-blue-200 pl-3 py-2">
                  <div className="font-mono text-sm text-gray-800 truncate" title={key}>
                    {key}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Length: {info.length} | JSON: {info.isJSON ? 'Yes' : 'No'}
                  </div>
                  {info.preview && (
                    <div className="text-xs text-gray-400 mt-1 font-mono">
                      {info.preview}
                    </div>
                  )}
                  {info.error && (
                    <div className="text-xs text-red-500 mt-1">
                      Error: {info.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-4">
              No Auth0 localStorage keys found
            </div>
          )}
          
          <button
            onClick={checkLocalStorage}
            className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors w-full"
          >
            Refresh localStorage
          </button>
        </div>

        {/* Test Results */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Test Results</h2>
            <button
              onClick={exportTestData}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Export Test Data
            </button>
          </div>
          
          {Object.keys(testResults).length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {Object.entries(testResults).map(([testName, result]) => (
                <div
                  key={testName}
                  className={`border-l-4 pl-4 py-2 ${
                    result.status === 'passed' ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{result.name}</div>
                      <div className="text-sm text-gray-600">
                        Duration: {result.duration}ms | {result.timestamp}
                      </div>
                      {result.result && (
                        <div className="text-sm text-gray-700 mt-1">
                          {JSON.stringify(result.result)}
                        </div>
                      )}
                      {result.error && (
                        <div className="text-sm text-red-600 mt-1">
                          Error: {result.error}
                        </div>
                      )}
                    </div>
                    <div className={`px-2 py-1 rounded text-xs ${
                      result.status === 'passed' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                    }`}>
                      {result.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              No test results yet. Run some tests to see results here.
            </div>
          )}
        </div>

        {/* Authentication State History */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Authentication State History ({refreshCount} refreshes)
          </h2>
          
          {authStateHistory.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {authStateHistory.slice().reverse().map((entry, index) => (
                <div key={index} className="border-l-4 border-indigo-200 pl-3 py-2 text-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">
                        Auth: {entry.isAuthenticated ? 'Yes' : 'No'} | 
                        Loading: {entry.isLoading ? 'Yes' : 'No'} |
                        User: {entry.hasUser ? 'Yes' : 'No'}
                      </div>
                      {entry.userEmail && (
                        <div className="text-gray-600">Email: {entry.userEmail}</div>
                      )}
                      {entry.error && (
                        <div className="text-red-600">Error: {entry.error}</div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-4">
              No authentication state changes recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthenticationTest;