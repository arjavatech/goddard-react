import { useAuth0 } from '@auth0/auth0-react';

export const useAuth = () => {
  const { 
    isAuthenticated, 
    isLoading, 
    logout, 
    user, 
    getAccessTokenSilently,
    loginWithPopup 
  } = useAuth0();

  const signOut = async () => {
    console.log('Signing out user...');
    
    // Clear any remaining localStorage (but don't rely on it for auth)
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear cookies
    const cookies = document.cookie.split("; ");
    for (let i = 0; i < cookies.length; i++) {
      const cookieParts = cookies[i].split("=");
      const cookieName = cookieParts[0];
      document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
    
    try {
      // Use Auth0 logout directly
      await logout({ 
        logoutParams: { 
          returnTo: window.location.origin + '/login'
        } 
      });
    } catch (error) {
      console.error('Auth0 logout error:', error);
      // Fallback to manual redirect
      window.location.href = '/login';
    }
  };

  const login = async (options = {}) => {
    try {
      await loginWithPopup(options);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const loginAsSignup = async () => {
    try {
      await loginWithPopup({
        authorizationParams: {
          screen_hint: 'signup'
        }
      });
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const getToken = async () => {
    try {
      if (isAuthenticated) {
        return await getAccessTokenSilently();
      }
      return null;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };

  // Simple authentication check - no localStorage dependency
  const isLoggedIn = () => {
    return isAuthenticated && !isLoading;
  };

  return { 
    // Auth0 state
    isAuthenticated, 
    isLoading,
    user,
    
    // Auth actions
    signOut,
    login,
    loginAsSignup,
    
    // Token management
    getToken,
    getAccessTokenSilently,
    
    // Utility
    isLoggedIn
  };
};