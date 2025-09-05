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

          // First try with auth0_user flag (same as Login component)
          const headers = await getAuthHeaders(getAccessTokenSilently);

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
            const fallbackHeaders = await getAuthHeaders(getAccessTokenSilently);

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
              // Invalid user
              setInvalidUser(true);
              alert('Invalid user - You do not have permission to access this application');
              handleLogoutAndReset();
            }
          } else {
            console.error('PrivateRoute API failed with status:', response.status);
            const errorText = await response.text();
            console.error('PrivateRoute API error response:', errorText);
            
            // REMOVED: localStorage fallback - insecure client-side storage
            // Instead of using localStorage, force user to re-authenticate through Auth0
            setInvalidUser(true);
            alert('Unable to verify user permissions. Please log in again.');
            handleLogoutAndReset();
          }
        } catch (error) {
          console.error('PrivateRoute permission check error:', error);
          
          // REMOVED: localStorage fallback - insecure and unreliable
          // On network error, force re-authentication for security
          setInvalidUser(true);
          alert('Network error occurred. Please log in again.');
          handleLogoutAndReset();
        } finally {
          // CRITICAL FIX: Move setCheckingPermissions inside the finally block
          // to ensure it only executes after the permission check is complete
          setCheckingPermissions(false);
        }
      }
    };

    if (!isLoading) {
      checkPermissions();
    }
  }, [isAuthenticated, isLoading, user, logout]);

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
      checkingPermissions
    });
    alert('Access denied - Admin privileges required');
    return <Navigate to="/login" replace />;
  }

  // Admin users can access parent routes
  if (requireParent && permissions?.isParent !== true && permissions?.isAdmin !== true) {
    alert('Access denied - Parent privileges required');
    return <Navigate to="/login" replace />;
  }

  // If no specific requirement, just need to be either admin or parent
  if (!requireAdmin && !requireParent && permissions?.isAdmin !== true && permissions?.isParent !== true) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;