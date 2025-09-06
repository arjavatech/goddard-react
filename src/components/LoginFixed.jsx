/**
 * FIXED Login Component
 * Addresses authentication flow issues and error handling
 */
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Header from './Header';
import { api_base_url, school_id } from '../utils/const';
import { getAuthHeaders, getUserPermissions, handleAuthError } from '../utils/auth-fixed';
import { withRetry, handleApiError } from '../utils/errorHandler';

const LoginFixed = () => {
  const { 
    loginWithRedirect, 
    isAuthenticated, 
    isLoading, 
    user, 
    logout, 
    getAccessTokenSilently,
    error: auth0Error 
  } = useAuth0();
  const navigate = useNavigate();
  const [isSignupFlow, setIsSignupFlow] = useState(false);
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);
  const [authError, setAuthError] = useState(null);
  const authProcessedRef = useRef(false);

  useEffect(() => {
    console.log('Auth state changed:', { 
      isAuthenticated, 
      isLoading, 
      userEmail: user?.email, 
      isSignupFlow,
      hasAuth0Error: !!auth0Error 
    });
    
    // Handle Auth0 errors first
    if (auth0Error) {
      console.error('❌ Auth0 error detected:', auth0Error);
      setAuthError(auth0Error.message);
      handleAuthError(auth0Error, logout);
      return;
    }
    
    // Prevent multiple executions and ensure we only process once per authentication
    if (isAuthenticated && user && !isProcessingAuth && !authProcessedRef.current) {
      authProcessedRef.current = true;
      setIsProcessingAuth(true);
      
      if (isSignupFlow) {
        console.log('Processing signup for user:', user.email);
        handleSignupAPI(user.email);
      } else {
        console.log('User is authenticated, checking permissions...');
        checkUserPermissions(user.email);
      }
    }
  }, [isAuthenticated, user, isProcessingAuth, auth0Error]);

  const checkUserPermissions = async (email) => {
    console.log('🔍 Checking permissions for email:', email);
    
    try {
      // FIXED: Use the improved getUserPermissions function
      const permissions = await withRetry(
        () => getUserPermissions(getAccessTokenSilently, email, school_id, api_base_url),
        'permission check'
      );
      
      console.log('✅ Permission data:', permissions);
      
      // Small delay to ensure Auth0 popup is fully closed before navigation
      setTimeout(() => {
        if (permissions.isAdmin === true) {
          console.log('✅ User is admin - redirecting to admin dashboard');
          navigate('/admin-dashboard', { replace: true });
        } else if (permissions.isParent === true) {
          console.log('✅ User is parent - redirecting to parent dashboard');
          navigate('/parent-dashboard', { replace: true });
        } else {
          // Invalid user - neither admin nor parent
          console.log('❌ Invalid user - no permissions', permissions);
          setAuthError('Access Denied: You do not have permission to access this application.');
          handleLogoutAndReset();
        }
      }, 100);
      
    } catch (error) {
      console.error('❌ Permission check failed:', error);
      
      // FIXED: Better error handling with user feedback
      let userMessage = 'Unable to verify your permissions. ';
      
      if (error.message.includes('Authentication failed')) {
        userMessage += 'Please try logging in again.';
        handleLogoutAndReset();
      } else if (error.message.includes('Permission check failed: 403')) {
        userMessage += 'You do not have access to this application.';
        setAuthError(userMessage);
        handleLogoutAndReset();
      } else if (error.message.includes('Permission check failed: 404')) {
        userMessage += 'Your account was not found. Please contact an administrator.';
        setAuthError(userMessage);
        handleLogoutAndReset();
      } else {
        userMessage += 'Please try again or contact support if the problem persists.';
        setAuthError(userMessage);
        // Don't auto-logout on network errors - let user retry
      }
    } finally {
      setIsProcessingAuth(false);
    }
  };

  const handleSignupAPI = async (email) => {
    console.log('📝 Processing signup for:', email);
    
    try {
      const headers = await getAuthHeaders(getAccessTokenSilently);
      
      const response = await fetch(`${api_base_url}/sign_up`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          email: email.toLowerCase(),
          auth0_user: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Signup successful:', data);
        
        // After successful signup, check permissions
        setTimeout(() => {
          checkUserPermissions(email);
        }, 500);
        
      } else {
        const errorText = await response.text();
        console.error('❌ Signup failed:', response.status, errorText);
        setAuthError(`Signup failed: ${errorText}`);
        handleLogoutAndReset();
      }
      
    } catch (error) {
      console.error('❌ Signup API error:', error);
      setAuthError('Signup failed. Please try again or contact support.');
      handleLogoutAndReset();
    }
  };

  const handleLogoutAndReset = async () => {
    console.log('🚪 Logging out and resetting auth state...');
    
    // Reset local state
    setIsProcessingAuth(false);
    setAuthError(null);
    authProcessedRef.current = false;
    
    try {
      await logout({ 
        logoutParams: { 
          returnTo: window.location.origin + '/login'
        } 
      });
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Force redirect if logout fails
      window.location.href = '/login';
    }
  };

  const handleLogin = async () => {
    console.log('🔑 Initiating login...');
    setIsSignupFlow(false);
    setAuthError(null);
    
    try {
      await loginWithRedirect({
        authorizationParams: {
          screen_hint: 'login'
        }
      });
    } catch (error) {
      console.error('❌ Login initiation failed:', error);
      setAuthError('Unable to start login process. Please try again.');
    }
  };

  const handleSignup = async () => {
    console.log('📝 Initiating signup...');
    setIsSignupFlow(true);
    setAuthError(null);
    
    try {
      await loginWithRedirect({
        authorizationParams: {
          screen_hint: 'signup'
        }
      });
    } catch (error) {
      console.error('❌ Signup initiation failed:', error);
      setAuthError('Unable to start signup process. Please try again.');
    }
  };

  const clearError = () => {
    setAuthError(null);
  };

  // Show loading state
  if (isLoading || isProcessingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full mx-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {isLoading ? 'Loading...' : 'Verifying your account...'}
          </h2>
          <p className="text-gray-600">
            {isLoading 
              ? 'Please wait while we prepare your session.'
              : 'Checking your permissions and setting up your dashboard.'
            }
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (authError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full mx-4">
          <div className="text-red-500 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-red-900 mb-2">Authentication Error</h2>
          <p className="text-red-700 mb-6">{authError}</p>
          <div className="space-y-3">
            <button
              onClick={clearError}
              className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={handleLogoutAndReset}
              className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Already authenticated - should not see this normally
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full mx-4">
          <div className="text-green-500 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-green-900 mb-2">Already Signed In</h2>
          <p className="text-green-700 mb-6">Welcome back, {user?.email}!</p>
          <button
            onClick={() => checkUserPermissions(user.email)}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Main login page
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="mx-auto h-12 w-auto flex justify-center">
              <img
                className="h-12 w-auto"
                src="/logo.svg"
                alt="Goddard School"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div style={{ display: 'none' }} className="h-12 w-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">G</span>
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Welcome to Goddard School
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Access your dashboard and manage your school information
            </p>
          </div>

          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="space-y-4">
              <button
                onClick={handleLogin}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Sign In
              </button>
              
              <button
                onClick={handleSignup}
                className="w-full flex justify-center py-3 px-4 border border-indigo-300 rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Create New Account
              </button>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Secure authentication powered by Auth0</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Need help? Contact your school administrator or technical support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginFixed;