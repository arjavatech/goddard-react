import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { authService } from '../auth/AuthService';
import Header from './Header';
import { LoadingSpinner } from './ui/LoadingSpinner';

/**
 * Secure Login component using Auth0-only architecture
 * No localStorage, no token exposure, proper error handling
 */
const SecureLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSignupFlow, setIsSignupFlow] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { 
    isAuthenticated, 
    isLoading, 
    isLoadingPermissions,
    user, 
    login, 
    logout, 
    isAdmin, 
    isParent, 
    hasAccess,
    error,
    clearError
  } = useAuth();

  // Handle successful authentication
  useEffect(() => {
    if (isAuthenticated && user && !isLoadingPermissions) {
      if (isSignupFlow) {
        handleSignupFlow();
      } else {
        handleLoginRedirect();
      }
    }
  }, [isAuthenticated, user, isLoadingPermissions, isAdmin, isParent, hasAccess]);

  const handleLoginRedirect = () => {
    if (hasAccess) {
      // Redirect based on user role
      if (isAdmin) {
        navigate('/admin-dashboard');
      } else if (isParent) {
        navigate('/parent-dashboard');
      }
    }
    // If no access, AuthProvider will handle logout automatically
  };

  const handleSignupFlow = async () => {
    if (!user?.email) return;
    
    setIsProcessing(true);
    try {
      const inviteId = searchParams.get('invite_id');
      await authService.processSignupWithInvite(
        { user, getAccessTokenSilently: () => {} }, // Will be replaced by proper auth0 context
        inviteId
      );
      // Permission refresh and redirect handled by AuthProvider
    } catch (error) {
      console.error('Signup processing failed:', error);
      // Error handling done by AuthService
    } finally {
      setIsProcessing(false);
      setIsSignupFlow(false);
    }
  };

  const handleLogin = async () => {
    clearError();
    setIsSignupFlow(false);
    setIsProcessing(true);
    
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSignup = async () => {
    clearError();
    setIsSignupFlow(true);
    setIsProcessing(true);
    
    try {
      await login(); // Auth0 will show signup screen based on flow
    } catch (error) {
      console.error('Signup failed:', error);
      setIsSignupFlow(false);
    } finally {
      setIsProcessing(false);
    }
  };

  // Show loading states
  if (isLoading || isProcessing) {
    return (
      <LoadingSpinner 
        message={
          isProcessing ? "Processing..." :
          isSignupFlow ? "Creating account..." :
          "Loading authentication..."
        } 
      />
    );
  }

  // If already authenticated and has access, redirect immediately
  if (isAuthenticated && hasAccess && !isLoadingPermissions) {
    handleLoginRedirect();
    return <LoadingSpinner message="Redirecting..." />;
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
              
              {/* Show invite message if present */}
              {searchParams.get('invite_id') && (
                <div className="mt-3 p-3 bg-green-100 rounded-md">
                  <p className="text-sm text-green-700">
                    You've been invited to join. Click "Sign Up" to create your account.
                  </p>
                </div>
              )}
            </div>
            
            {/* Error Display */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
                <button 
                  onClick={clearError}
                  className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                >
                  Dismiss
                </button>
              </div>
            )}
            
            <div className="space-y-3">
              <button
                onClick={handleLogin}
                disabled={isProcessing}
                className="w-full rounded-md font-bold py-3 px-4 bg-[#002e4d] text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing && !isSignupFlow ? 'Logging in...' : 'Log In'}
              </button>
              
              <button
                onClick={handleSignup}
                disabled={isProcessing}
                className="w-full rounded-md font-bold py-3 px-4 bg-[#0F2D52] text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing && isSignupFlow ? 'Creating Account...' : 'Sign Up'}
              </button>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {searchParams.get('invite_id') 
                  ? "Have an account? Click Log In instead."
                  : "New user? Click Sign Up to create an account"
                }
              </p>
            </div>

            {/* Security Notice */}
            <div className="mt-4 pt-4 border-t border-gray-300">
              <p className="text-xs text-gray-500 text-center">
                Secured by Auth0 • Your data is protected with enterprise-grade security
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecureLogin;