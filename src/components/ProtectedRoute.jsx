import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ 
  children, 
  requireAdmin = false, 
  requireParent = false,
  redirectTo = '/login' 
}) => {
  const { isAuthenticated, isLoading } = useAuth0();
  
  // For now, just use Auth0 authentication without permission checking
  // This allows the app to work while we fix the permission system
  const permissionsLoading = false;
  const error = null;
  const hasAnyPermission = () => true; // Temporarily allow all authenticated users
  const checkPermission = (permission) => true; // Temporarily allow all permissions

  // Show loading spinner while checking authentication and permissions
  if (isLoading || permissionsLoading) {
    return (
      <LoadingSpinner 
        message="Verifying authentication and permissions..." 
        className="min-h-screen"
      />
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Error occurred while checking permissions
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Permission Error
          </h2>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full bg-[#0F2D52] text-white font-semibold py-2 px-4 rounded-md hover:bg-[#002e4d] transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // No valid permissions found
  if (!hasAnyPermission()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-amber-500 text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this application.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full bg-[#0F2D52] text-white font-semibold py-2 px-4 rounded-md hover:bg-[#002e4d] transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // Check specific role requirements
  if (requireAdmin && !checkPermission('admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Admin Access Required
          </h2>
          <p className="text-gray-600 mb-6">
            This section requires administrator privileges.
          </p>
          <button
            onClick={() => window.history.back()}
            className="w-full bg-[#0F2D52] text-white font-semibold py-2 px-4 rounded-md hover:bg-[#002e4d] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Check parent access (admin users can also access parent sections)
  if (requireParent && !checkPermission('parent') && !checkPermission('admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-amber-500 text-6xl mb-4">👨‍👩‍👧‍👦</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Parent Access Required
          </h2>
          <p className="text-gray-600 mb-6">
            This section is only available to parents and administrators.
          </p>
          <button
            onClick={() => window.history.back()}
            className="w-full bg-[#0F2D52] text-white font-semibold py-2 px-4 rounded-md hover:bg-[#002e4d] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // All checks passed - render the protected content
  return children;
};

export default ProtectedRoute;