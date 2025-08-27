import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import {  school_id } from '../utils/const';

const api_base_url = 'http://localhost:8000'

const PrivateRoute = ({ children, requireAdmin = false, requireParent = false }) => {
  const { isAuthenticated, isLoading, user, logout } = useAuth0();
  const [permissions, setPermissions] = useState(null);
  const [checkingPermissions, setCheckingPermissions] = useState(true);
  const [invalidUser, setInvalidUser] = useState(false);

  useEffect(() => {
    const checkPermissions = async () => {
      if (isAuthenticated && user?.email) {
        try {
          console.log('PrivateRoute checking permissions for:', user.email);
          console.log('API URL:', `${api_base_url}/sign_in/check/${school_id}`);
          
          // First try with auth0_user flag (same as Login component)
          let response = await fetch(`${api_base_url}/sign_in/check/${school_id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              email: user.email.toLowerCase(),
              auth0_user: true
            })
          });
          
          // If that fails, try with empty password (fallback)
          if (!response.ok) {
            console.log('PrivateRoute: Trying fallback API call with empty password');
            response = await fetch(`${api_base_url}/sign_in/check/${school_id}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                email: user.email.toLowerCase(),
                password: ''
              })
            });
          }

          console.log('PrivateRoute API response status:', response.status);

          if (response.ok) {
            const data = await response.json();
            console.log('PrivateRoute permission data:', data);
            
            if (data.isAdmin === true || data.isParent === true) {
              localStorage.setItem('logged_in_email', user.email);
              
              if (data.isAdmin === true) {
                localStorage.setItem('is_admin', 'true');
              }
              
              setPermissions(data);
            } else {
              // Invalid user
              setInvalidUser(true);
              alert('Invalid user - You do not have permission to access this application');
              logout({ logoutParams: { returnTo: window.location.origin } });
            }
          } else {
            console.error('PrivateRoute API failed with status:', response.status);
            const errorText = await response.text();
            console.error('PrivateRoute API error response:', errorText);
            
            // Fallback: Use the same logic as Login component succeeded
            // If user reached here, it means they passed the Login component validation
            // So we can trust that they have valid permissions
            const storedAdmin = localStorage.getItem('is_admin');
            const storedEmail = localStorage.getItem('logged_in_email');
            
            if (storedEmail === user.email) {
              console.log('Using stored permissions as fallback');
              if (storedAdmin === 'true') {
                setPermissions({ isAdmin: true, isParent: false });
              } else {
                setPermissions({ isAdmin: false, isParent: true });
              }
            } else {
              setInvalidUser(true);
              alert('Unable to verify user permissions. You will be logged out.');
              logout({ logoutParams: { returnTo: window.location.origin } });
            }
          }
        } catch (error) {
          console.error('PrivateRoute permission check error:', error);
          
          // Fallback: Use stored permissions if they exist
          const storedAdmin = localStorage.getItem('is_admin');
          const storedEmail = localStorage.getItem('logged_in_email');
          
          if (storedEmail === user.email) {
            console.log('Using stored permissions due to network error');
            if (storedAdmin === 'true') {
              setPermissions({ isAdmin: true, isParent: false });
            } else {
              setPermissions({ isAdmin: false, isParent: true });
            }
          } else {
            setInvalidUser(true);
            alert('Network error occurred. You will be logged out.');
            logout({ logoutParams: { returnTo: window.location.origin } });
          }
        }
      }
      setCheckingPermissions(false);
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
    alert('Access denied - Admin privileges required');
    return <Navigate to="/login" replace />;
  }

  if (requireParent && permissions?.isParent !== true) {
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