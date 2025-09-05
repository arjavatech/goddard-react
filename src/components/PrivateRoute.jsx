import React, { useEffect, useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { api_base_url,  school_id } from '../utils/const';
import { getAuthHeaders } from '../utils/auth';


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
        
        try {
          console.log('🔍 PrivateRoute checking permissions for:', user.email);
          console.log('🌐 API URL:', `${api_base_url}/sign_in/check/${school_id}`);
          console.log('🔐 Auth0 authenticated:', isAuthenticated);
          console.log('⏰ Starting token acquisition at:', new Date().toISOString());
          
          const tokenStartTime = performance.now();
          
          // First try with auth0_user flag (same as Login component)
          console.log('🎫 Acquiring access token silently...');
          const headers = await getAuthHeaders(getAccessTokenSilently);
          
          const tokenEndTime = performance.now();
          console.log('✅ Token acquisition successful in', (tokenEndTime - tokenStartTime).toFixed(2), 'ms');
          console.log('🎫 Token acquired, headers prepared:', headers);

          const requestBody = {
            email: user.email.toLowerCase(),
            auth0_user: true
          };

          console.log('📨 Making API request with body:', requestBody);

          let response = await fetch(`${api_base_url}/sign_in/check/${school_id}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody)
          });

          console.log('📥 Response status:', response.status);
          console.log('📥 Response ok:', response.ok);

          // If that fails, try with empty password (fallback)
          if (!response.ok) {
            console.log('⚠️ First API call failed, trying fallback with empty password');
            console.log('🎫 Acquiring fallback access token silently...');
            
            const fallbackTokenStartTime = performance.now();
            const fallbackHeaders = await getAuthHeaders(getAccessTokenSilently);
            const fallbackTokenEndTime = performance.now();
            
            console.log('✅ Fallback token acquisition successful in', (fallbackTokenEndTime - fallbackTokenStartTime).toFixed(2), 'ms');

            const fallbackBody = {
              email: user.email.toLowerCase(),
              password: ''
            };

            console.log('📨 Making fallback API request with body:', fallbackBody);

            response = await fetch(`${api_base_url}/sign_in/check/${school_id}`, {
              method: 'POST',
              headers: fallbackHeaders,
              body: JSON.stringify(fallbackBody)
            });

            console.log('📥 Fallback response status:', response.status);
            console.log('📥 Fallback response ok:', response.ok);
          }

          console.log('PrivateRoute API response status:', response.status);

          if (response.ok) {
            const data = await response.json();
            console.log('PrivateRoute permission data:', data);
            console.log('🎯 Setting permissions state:', data);
            
            if (data.isAdmin === true || data.isParent === true) {
              // REMOVED: localStorage storage - auth now handled by Auth0 only
              // localStorage.setItem('logged_in_email', user.email);
              // localStorage.setItem('is_admin', 'true');
              
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
              // REMOVED: handleLogoutAndReset() - This was causing infinite login loop for users without permissions
            }
          } else {
            console.error('❌ PrivateRoute API failed with status:', response.status);
            console.error('🌐 Failed API URL:', `${api_base_url}/sign_in/check/${school_id}`);
            console.error('📧 User email:', user?.email);
            
            let errorText = '';
            try {
              errorText = await response.text();
              console.error('📄 API error response:', errorText);
            } catch (textError) {
              console.error('❌ Failed to read error response:', textError);
            }
            
            // Determine user-friendly error message based on status code
            let userMessage = 'Unable to verify user permissions. Please try logging in again.';
            
            switch (response.status) {
              case 401:
                userMessage = 'Your session has expired. Please log in again.';
                break;
              case 403:
                userMessage = 'Access forbidden. You do not have permission to access this application.';
                break;
              case 404:
                userMessage = 'Service not found. Please contact support if this problem persists.';
                break;
              case 500:
              case 502:
              case 503:
                userMessage = 'Server error occurred. Please try again in a few moments.';
                break;
              default:
                userMessage = `Server responded with error (${response.status}). Please try logging in again.`;
            }
            
            // Handle API errors gracefully - don't force logout on server errors
            console.warn('⚠️ Permission API failed, but maintaining Auth0 session for user:', user?.email);
            setInvalidUser(true);
            alert(userMessage + ' Your session is still valid - try refreshing the page.');
            // REMOVED: handleLogoutAndReset() - This was causing the infinite login loop
          }
        } catch (error) {
          console.error('❌ PrivateRoute permission check error:', error);
          console.error('🔍 Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            timestamp: new Date().toISOString()
          });
          console.error('🌐 API URL was:', `${api_base_url}/sign_in/check/${school_id}`);
          console.error('👤 User email:', user?.email);
          console.error('🔐 Auth0 authenticated:', isAuthenticated);
          console.error('🎫 Token acquisition error context:', {
            userAgent: navigator.userAgent,
            currentTime: new Date().toISOString(),
            location: window.location.href
          });
          
          // Determine error type for user-friendly messaging
          let userMessage = 'An error occurred while verifying your permissions.';
          
          if (error.name === 'NetworkError' || error.message.includes('Failed to fetch')) {
            userMessage = 'Network connection error. Please check your internet connection and try again.';
          } else if (error.message.includes('token') || error.message.includes('unauthorized')) {
            userMessage = 'Authentication token has expired. Please log in again.';
          } else if (error.message.includes('timeout')) {
            userMessage = 'Request timed out. Please try again.';
          }
          
          // Handle network errors gracefully - don't destroy valid Auth0 sessions
          console.warn('⚠️ Network error during permission check, but maintaining Auth0 session for user:', user?.email);
          setInvalidUser(true);
          alert(userMessage + ' Your login session is still valid - please try again or refresh the page.');
          // REMOVED: handleLogoutAndReset() - This was causing the infinite login loop on network errors
        } finally {
          // CRITICAL FIX: Move setCheckingPermissions inside the finally block
          // to ensure it only executes after the permission check is complete
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