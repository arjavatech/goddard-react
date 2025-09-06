import React, { useEffect, useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { api_base_url,  school_id } from '../utils/const';
import { getAuthHeaders } from '../utils/auth';
import { withRetry, handleApiError } from '../utils/errorHandler';


const PrivateRoute = ({ children, requireAdmin = false, requireParent = false }) => {
  const { isAuthenticated, isLoading, user, logout, getAccessTokenSilently } = useAuth0();
  const [permissions, setPermissions] = useState(null);
  const [checkingPermissions, setCheckingPermissions] = useState(true);
  const [invalidUser, setInvalidUser] = useState(false);
  const permissionCheckedRef = useRef(false);

  const handleLogoutAndReset = async () => {
    try {
      permissionCheckedRef.current = false;
      setPermissions(null);
      setInvalidUser(false);
      setCheckingPermissions(true);
      
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

  useEffect(() => {
    const checkPermissions = async () => {
      // Prevent multiple permission checks for the same user
      if (isAuthenticated && user?.email && !permissionCheckedRef.current) {
        permissionCheckedRef.current = true;
        
        // Primary permission check with auth0_user flag
        const makePermissionRequest = async () => {
          console.log('🔍 PrivateRoute checking permissions for:', user.email);
          console.log('🌐 API URL:', `${api_base_url}/sign_in/check/${school_id}`);
          
          const headers = await getAuthHeaders(getAccessTokenSilently);
          const requestBody = {
            email: user.email.toLowerCase(),
            auth0_user: true
          };

          console.log('📨 Making API request with body:', requestBody);

          const response = await fetch(`${api_base_url}/sign_in/check/${school_id}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody)
          });

          console.log('📥 Response status:', response.status);

          if (!response.ok) {
            const error = new Error(`Permission check failed with status: ${response.status}`);
            error.status = response.status;
            error.response = response;
            throw error;
          }

          return response.json();
        };

        // Fallback permission check with empty password
        const makeFallbackRequest = async () => {
          console.log('⚠️ Trying fallback permission check with empty password');
          
          const headers = await getAuthHeaders(getAccessTokenSilently);
          const fallbackBody = {
            email: user.email.toLowerCase(),
            password: ''
          };

          console.log('📨 Making fallback API request with body:', fallbackBody);

          const response = await fetch(`${api_base_url}/sign_in/check/${school_id}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(fallbackBody)
          });

          console.log('📥 Fallback response status:', response.status);

          if (!response.ok) {
            const error = new Error(`Fallback permission check failed with status: ${response.status}`);
            error.status = response.status;
            error.response = response;
            throw error;
          }

          return response.json();
        };

        try {
          let data;
          
          try {
            // Try primary request with retry logic
            data = await withRetry(makePermissionRequest, 'permission check');
          } catch (primaryError) {
            console.log('Primary permission check failed, trying fallback...');
            // Try fallback request
            data = await withRetry(makeFallbackRequest, 'fallback permission check');
          }

          console.log('PrivateRoute permission data:', data);
          
          if (data.isAdmin === true || data.isParent === true) {
            setPermissions(data);
            console.log('✅ Permissions set successfully for user:', user.email, 'Admin:', data.isAdmin, 'Parent:', data.isParent);
          } else {
            // Invalid user - no admin or parent permissions
            console.error('❌ User has no valid permissions:', {
              email: user.email,
              isAdmin: data.isAdmin,
              isParent: data.isParent,
              timestamp: new Date().toISOString()
            });
            setInvalidUser(true);
            alert('Access Denied: Your account does not have the necessary permissions to access this application. Please contact an administrator if you believe this is an error.');
          }
        } catch (error) {
          const errorResult = handleApiError(error, 'permission check', {
            onLogoutRequired: handleLogoutAndReset
          });
          
          // Only logout if it's a genuine authentication failure
          if (!errorResult.shouldLogout) {
            console.warn('⚠️ Permission check failed but maintaining Auth0 session for user:', user?.email);
            setInvalidUser(true);
            // Don't show additional alert as handleApiError already showed one
          }
        } finally {
          setCheckingPermissions(false);
        }
      }
    };

    // Only check permissions if Auth0 has finished loading AND user is authenticated
    if (!isLoading) {
      if (isAuthenticated && user?.email) {
        checkPermissions();
      } else {
        // User is not authenticated, stop checking permissions
        setCheckingPermissions(false);
        console.log('🚫 User not authenticated, skipping permission check');
      }
    }
  }, [isAuthenticated, isLoading, user, logout]);

  // Debug logging for development
  if (import.meta.env.DEV) {
    console.log('🔍 PrivateRoute State:', {
      isLoading,
      isAuthenticated, 
      checkingPermissions,
      hasUser: !!user,
      userEmail: user?.email
    });
  }

  if (isLoading || checkingPermissions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || invalidUser) {
    return <Navigate to="/login" replace />;
  }

  // Check specific permissions if required
  if (requireAdmin && permissions?.isAdmin !== true) {
    console.error('❌ Admin access denied:', {
      requireAdmin,
      permissions,
      isAdmin: permissions?.isAdmin,
      userEmail: user?.email,
      checkingPermissions,
      timestamp: new Date().toISOString(),
      currentPath: window.location.pathname
    });
    alert('Access Denied: This page requires administrator privileges. Please contact an administrator if you believe you should have access.');
    return <Navigate to="/login" replace />;
  }

  // Admin users can access parent routes
  if (requireParent && permissions?.isParent !== true && permissions?.isAdmin !== true) {
    console.error('❌ Parent access denied:', {
      requireParent,
      permissions,
      isParent: permissions?.isParent,
      isAdmin: permissions?.isAdmin,
      userEmail: user?.email,
      timestamp: new Date().toISOString(),
      currentPath: window.location.pathname
    });
    alert('Access Denied: This page requires parent or administrator privileges. Please contact an administrator if you believe you should have access.');
    return <Navigate to="/login" replace />;
  }

  // If no specific requirement, just need to be either admin or parent
  if (!requireAdmin && !requireParent && permissions?.isAdmin !== true && permissions?.isParent !== true) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;