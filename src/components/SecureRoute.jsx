import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { LoadingSpinner } from './ui/LoadingSpinner';

/**
 * Secure route protection component
 * Replaces PrivateRoute with proper Auth0-only logic
 */
export const SecureRoute = ({ 
  children, 
  requireAdmin = false, 
  requireParent = false,
  fallbackPath = '/login',
  showAccessDenied = true
}) => {
  const { 
    isAuthenticated, 
    isLoading, 
    isLoadingPermissions, 
    isAdmin, 
    isParent, 
    hasAccess,
    error 
  } = useAuth();

  // Show loading while Auth0 or permissions are loading
  if (isLoading || isLoadingPermissions) {
    return <LoadingSpinner message="Verifying authentication..." />;
  }

  // Handle authentication errors
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-600 mb-2">Authentication Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.href = '/login'}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Check general access first (must be either admin or parent)
  if (!hasAccess) {
    if (showAccessDenied) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0-6V9m0 9a9 9 0 110-18 9 9 0 010 18z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-yellow-600 mb-2">Access Denied</h2>
              <p className="text-gray-600 mb-4">
                You do not have the necessary permissions to access this application.
              </p>
              <button 
                onClick={() => window.location.href = '/login'}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Return to Login
              </button>
            </div>
          </div>
        </div>
      );
    }
    return <Navigate to="/unauthorized" replace />;
  }

  // Check specific admin requirement
  if (requireAdmin && !isAdmin) {
    if (showAccessDenied) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-red-600 mb-2">Admin Access Required</h2>
              <p className="text-gray-600 mb-4">
                Administrator privileges are required to access this section.
              </p>
              <div className="space-y-2">
                <button 
                  onClick={() => window.history.back()}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Go Back
                </button>
                <button 
                  onClick={() => window.location.href = isParent ? '/parent-dashboard' : '/login'}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {isParent ? 'Go to Parent Dashboard' : 'Return to Login'}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return <Navigate to={isParent ? "/parent-dashboard" : "/login"} replace />;
  }

  // Check specific parent requirement (admins can access parent routes)
  if (requireParent && !isParent && !isAdmin) {
    if (showAccessDenied) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-red-600 mb-2">Parent Access Required</h2>
              <p className="text-gray-600 mb-4">
                Parent or administrator privileges are required to access this section.
              </p>
              <button 
                onClick={() => window.history.back()}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      );
    }
    return <Navigate to="/login" replace />;
  }

  // All checks passed - render the protected component
  return (
    <div className="auth-protected">
      {children}
    </div>
  );
};

// Export default for easier imports
export default SecureRoute;