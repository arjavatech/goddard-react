import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Header from './Header';
import { api_base_url, school_id } from '../utils/const';
import { getAuthHeaders } from '../utils/auth';
import { withRetry, handleApiError, createResilientApiCall } from '../utils/errorHandler';


const Login = () => {
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
    console.log('Auth state changed:', { isAuthenticated, isLoading, user: user?.email, isSignupFlow });
    
    // Prevent multiple executions and ensure we only process once per authentication
    if (isAuthenticated && user && !isProcessingAuth && !authProcessedRef.current) {
      authProcessedRef.current = true;
      setIsProcessingAuth(true);
      
      if (isSignupFlow) {
        console.log('Processing signup for user:', user.email);
        handleSignupAPI(user.email);
      } else {
        console.log('User is authenticated, checking permissions...');
        // Check user permissions with API
        checkUserPermissions(user.email);
      }
    }
  }, [isAuthenticated, user, isProcessingAuth]);

  const checkUserPermissions = async (email) => {
    console.log('🔍 Checking permissions for email:', email);
    console.log('🌐 API URL:', `${api_base_url}/sign_in/check/${school_id}`);

    const makePermissionRequest = async () => {
      const headers = await getAuthHeaders(getAccessTokenSilently);
      const requestBody = {
        email: email.toLowerCase(),
        auth0_user: true
      };

      console.log('📨 Making API request with body:', requestBody);

      const response = await fetch(`${api_base_url}/sign_in/check/${school_id}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      if (!response.ok) {
        const error = new Error(`Permission check failed with status: ${response.status}`);
        error.status = response.status;
        error.response = response;
        throw error;
      }

      return response.json();
    };

    try {
      const data = await withRetry(makePermissionRequest, 'permission check');
      console.log('Permission data:', data);
      
      // Small delay to ensure Auth0 popup is fully closed before navigation
      setTimeout(() => {
        // Check if user has valid permissions and navigate accordingly
        if (data.isAdmin === true) {
          console.log('User is admin');
          navigate('/admin-dashboard', { replace: true });
        } else if (data.isParent === true) {
          console.log('User is parent');
          navigate('/parent-dashboard', { replace: true });
        } else {
          // Invalid user - neither admin nor parent
          console.log('Invalid user - no permissions', data);
          alert('Access Denied: You do not have permission to access this application. Please contact an administrator if you believe this is an error.');
          handleLogoutAndReset();
          return;
        }
      }, 100);
    } catch (error) {
      const errorResult = handleApiError(error, 'permission check', {
        onLogoutRequired: handleLogoutAndReset
      });
      
      // Only logout if it's a genuine authentication failure
      if (!errorResult.shouldLogout) {
        // For non-auth errors, show error but don't logout
        console.warn('Permission check failed but maintaining session:', errorResult.message);
      }
    } finally {
      setIsProcessingAuth(false);
    }
  };

  const handleLogoutAndReset = async () => {
    try {
      setIsProcessingAuth(false);
      authProcessedRef.current = false;
      setIsSignupFlow(false);
      
      await logout({ 
        logoutParams: { 
          returnTo: window.location.origin + '/login'
        } 
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Force reload as fallback
      window.location.href = '/login';
    }
  };

  const handleLogin = async () => {
    try {
      // Reset states before login
      authProcessedRef.current = false;
      setIsProcessingAuth(false);
      setIsSignupFlow(false);
      setAuthError(null);
      
      console.log('Redirecting to Auth0 login...');
      await loginWithRedirect({
        authorizationParams: {
          prompt: 'login',
          screen_hint: 'login'
        },
        appState: {
          returnTo: '/login'
        }
      });
    } catch (error) {
      console.error('Login redirect error:', error);
      setAuthError('Login failed. Please try again.');
      // Reset states on error
      authProcessedRef.current = false;
      setIsProcessingAuth(false);
      setIsSignupFlow(false);
    }
  };

  const handleSignupAPI = async (email) => {
    const makeSignupRequest = async () => {
      const obj = {
        email: email,
        invite_id: null
      };

      const headers = await getAuthHeaders(getAccessTokenSilently);

      const response = await fetch(`${api_base_url}/sign_up/${school_id}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(obj)
      });

      if (!response.ok) {
        const error = new Error(`Signup failed with status: ${response.status}`);
        error.status = response.status;
        error.response = response;
        throw error;
      }

      return response.json();
    };

    try {
      const result = await withRetry(makeSignupRequest, 'signup');

      if (result.message === "SignUp Data successfully updated") {
        console.log('Signup successful, checking permissions...');
        alert('Account created successfully!');
        await checkUserPermissions(email);
      } else if (result.error === `signup_id with email ${email} Already Registered`) {
        console.log('User already exists, checking permissions...');
        await checkUserPermissions(email);
      } else {
        alert('Signup failed. Please try again.');
        // Only logout for genuine auth failures, not signup validation issues
        console.warn('Signup validation failed, but maintaining Auth0 session');
        setIsProcessingAuth(false);
        authProcessedRef.current = false;
      }
    } catch (error) {
      const errorResult = handleApiError(error, 'signup', {
        onLogoutRequired: handleLogoutAndReset
      });
      
      // Only logout if it's a genuine authentication failure
      if (!errorResult.shouldLogout) {
        console.warn('Signup failed but maintaining session:', errorResult.message);
        setIsProcessingAuth(false);
        authProcessedRef.current = false;
      }
    } finally {
      setIsSignupFlow(false);
    }
  };

  const handleSignup = async () => {
    try {
      // Reset states before signup
      authProcessedRef.current = false;
      setIsProcessingAuth(false);
      setIsSignupFlow(true);
      setAuthError(null);
      
      console.log('Redirecting to Auth0 signup...');
      await loginWithRedirect({
        authorizationParams: {
          screen_hint: 'signup'
        },
        appState: {
          returnTo: '/login'
        }
      });
    } catch (error) {
      console.error('Signup redirect error:', error);
      setAuthError('Signup failed. Please try again.');
      // Reset states on error
      authProcessedRef.current = false;
      setIsProcessingAuth(false);
      setIsSignupFlow(false);
    }
  };

  if (isLoading || isProcessingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">
            {isLoading ? 'Loading authentication...' : 'Verifying permissions...'}
          </p>
        </div>
      </div>
    );
  }

  // Show Auth0 error if present
  if (auth0Error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Authentication Error</h2>
            <p className="text-red-700 mb-4">{auth0Error.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Login Card */}
      <div className="flex justify-center items-center my-6">
        <div className="w-[470px] bg-blue-100 shadow-lg rounded-[20px] p-4">
          <div className="text-center mb-6">
            <img src="image/gs_logo_tab.png" className="w-[100px] h-[100px] mx-auto" alt="logo" />
          </div>
          
          <div className="px-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#002e4d] mb-2">Welcome to Goddard School</h2>
              <p className="text-gray-600">Please sign in to continue</p>
              {authError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700">{authError}</p>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleLogin}
                className="w-full rounded-md font-bold py-3 px-4 bg-[#002e4d] text-white hover:opacity-90 transition-opacity"
              >
                Log In
              </button>
              
              <button
                onClick={handleSignup}
                className="w-full rounded-md font-bold py-3 px-4 bg-[#0F2D52] text-white hover:opacity-90 transition-opacity"
              >
                Sign Up
              </button>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                New user? Click Sign Up to create an account
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;