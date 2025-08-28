import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { api_base_url, school_id } from '../utils/const';
import { getAuthHeaders } from '../utils/auth';

export const useAuth = () => {
  const { isAuthenticated, isLoading, logout, user, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();

  const checkAuth = () => {
    // With Auth0, we check the isAuthenticated flag
    if (!isAuthenticated && !isLoading) {
      return false;
    }
    return true;
  };

  const signOut = () => {
    console.log('Signing out user...');
    
    // Clear local storage
    localStorage.clear();
    localStorage.setItem('isSignout', 'yes');
    
    if (sessionStorage.length > 0) {
      sessionStorage.clear();
    }
    
    // Clear cookies
    const cookies = document.cookie.split("; ");
    for (let i = 0; i < cookies.length; i++) {
      const cookieParts = cookies[i].split("=");
      const cookieName = cookieParts[0];
      document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
    
    // Since Auth0 logout is having issues, let's do a simpler approach
    // Clear everything and redirect manually without using Auth0 logout
    console.log('Performing manual logout...');
    
    // Redirect to login page
    window.location.href = '/login';
    
    // Optional: Try Auth0 logout in background (non-blocking)
    setTimeout(() => {
      try {
        logout({ 
          logoutParams: { 
            returnTo: window.location.origin
          } 
        });
      } catch (error) {
        console.log('Auth0 logout failed, but manual logout completed');
      }
    }, 100);
  };

  const checkUserPermissions = async () => {
    if (!user?.email) return null;
    
    try {
      const headers = await getAuthHeaders(getAccessTokenSilently);
      const response = await fetch(`${api_base_url}/sign_in/${school_id}/${encodeURIComponent(user.email)}`, {
        headers
      });
      
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error checking permissions:', error);
      return null;
    }
  };

  useEffect(() => {
    if (!isLoading) {
      if (checkAuth()) {
        document.body.style.visibility = 'visible';
      } else {
        navigate('/login');
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  return { 
    isAuthenticated, 
    isLoading,
    signOut,
    user,
    checkUserPermissions
  };
};