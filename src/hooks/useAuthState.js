import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { api_base_url, school_id } from '../utils/const';
import { getAuthHeaders } from '../utils/auth';

/**
 * Unified authentication state manager
 * Fixes race conditions and state synchronization issues
 */
export const useAuthState = () => {
  const { 
    isAuthenticated, 
    isLoading: auth0Loading, 
    logout, 
    user, 
    getAccessTokenSilently,
    loginWithPopup 
  } = useAuth0();

  // Unified state for all auth-related data
  const [authState, setAuthState] = useState({
    permissions: {
      isAdmin: false,
      isParent: false,
      hasAccess: false,
      isLoading: false,
      error: null,
      lastChecked: null
    },
    ui: {
      showSignOutModal: false,
      isSigningOut: false,
      isCheckingPermissions: false
    }
  });

  // Refs to prevent race conditions
  const abortControllerRef = useRef(null);
  const permissionCheckInProgress = useRef(false);

  // Cleanup function to abort ongoing requests
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    permissionCheckInProgress.current = false;
  }, []);

  // Check user permissions with race condition protection
  const checkPermissions = useCallback(async (email, forceRefresh = false) => {
    if (!email || permissionCheckInProgress.current) {
      return;
    }

    // Prevent multiple concurrent permission checks
    permissionCheckInProgress.current = true;
    cleanup(); // Cancel any existing requests

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      setAuthState(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          isLoading: true,
          error: null
        },
        ui: {
          ...prev.ui,
          isCheckingPermissions: true
        }
      }));

      const headers = await getAuthHeaders(getAccessTokenSilently);
      const requestBody = {
        email: email.toLowerCase(),
        auth0_user: true
      };

      const response = await fetch(`${api_base_url}/sign_in/check/${school_id}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        signal // Add abort signal
      });

      // Check if request was aborted
      if (signal.aborted) {
        return;
      }

      if (response.ok) {
        const data = await response.json();
        
        setAuthState(prev => ({
          ...prev,
          permissions: {
            isAdmin: data.isAdmin === true,
            isParent: data.isParent === true,
            hasAccess: data.isAdmin === true || data.isParent === true,
            isLoading: false,
            error: null,
            lastChecked: new Date()
          },
          ui: {
            ...prev.ui,
            isCheckingPermissions: false
          }
        }));

        return {
          isAdmin: data.isAdmin === true,
          isParent: data.isParent === true,
          hasAccess: data.isAdmin === true || data.isParent === true
        };
      } else {
        throw new Error(`Permission check failed: ${response.status}`);
      }
    } catch (error) {
      // Don't set error state if request was aborted
      if (!signal.aborted) {
        setAuthState(prev => ({
          ...prev,
          permissions: {
            ...prev.permissions,
            isLoading: false,
            error: error.message,
            isAdmin: false,
            isParent: false,
            hasAccess: false
          },
          ui: {
            ...prev.ui,
            isCheckingPermissions: false
          }
        }));
      }
      throw error;
    } finally {
      permissionCheckInProgress.current = false;
    }
  }, [getAccessTokenSilently, cleanup]);

  // Sign out with proper state management
  const signOut = useCallback(async () => {
    setAuthState(prev => ({
      ...prev,
      ui: {
        ...prev.ui,
        isSigningOut: true,
        showSignOutModal: false // Close modal immediately
      }
    }));

    try {
      // Clear any ongoing permission checks
      cleanup();
      
      // Clear state immediately
      setAuthState(prev => ({
        ...prev,
        permissions: {
          isAdmin: false,
          isParent: false,
          hasAccess: false,
          isLoading: false,
          error: null,
          lastChecked: null
        }
      }));

      // Clear browser storage
      localStorage.clear();
      sessionStorage.clear();

      // Clear cookies
      const cookies = document.cookie.split("; ");
      for (let i = 0; i < cookies.length; i++) {
        const cookieParts = cookies[i].split("=");
        const cookieName = cookieParts[0];
        document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      }

      // Auth0 logout
      await logout({ 
        logoutParams: { 
          returnTo: window.location.origin + '/login'
        } 
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect as fallback
      window.location.href = '/login';
    }
  }, [logout, cleanup]);

  // Modal state management
  const showSignOutModal = useCallback(() => {
    setAuthState(prev => ({
      ...prev,
      ui: {
        ...prev.ui,
        showSignOutModal: true
      }
    }));
  }, []);

  const hideSignOutModal = useCallback(() => {
    setAuthState(prev => ({
      ...prev,
      ui: {
        ...prev.ui,
        showSignOutModal: false
      }
    }));
  }, []);

  // Effect to handle auth state changes
  useEffect(() => {
    if (isAuthenticated && user?.email && !authState.permissions.lastChecked) {
      checkPermissions(user.email);
    }
    
    // Reset permissions when not authenticated
    if (!isAuthenticated) {
      setAuthState(prev => ({
        ...prev,
        permissions: {
          isAdmin: false,
          isParent: false,
          hasAccess: false,
          isLoading: false,
          error: null,
          lastChecked: null
        },
        ui: {
          ...prev.ui,
          showSignOutModal: false,
          isSigningOut: false,
          isCheckingPermissions: false
        }
      }));
    }

    // Cleanup on unmount
    return cleanup;
  }, [isAuthenticated, user?.email, checkPermissions, cleanup, authState.permissions.lastChecked]);

  // Computed values
  const isLoading = auth0Loading || authState.permissions.isLoading;
  const getUserRole = useCallback(() => {
    if (authState.permissions.isAdmin) return 'admin';
    if (authState.permissions.isParent) return 'parent';
    return null;
  }, [authState.permissions.isAdmin, authState.permissions.isParent]);

  return {
    // Auth0 state
    isAuthenticated,
    isLoading,
    user,
    
    // Permission state
    isAdmin: authState.permissions.isAdmin,
    isParent: authState.permissions.isParent,
    hasAccess: authState.permissions.hasAccess,
    permissionsError: authState.permissions.error,
    lastPermissionCheck: authState.permissions.lastChecked,
    
    // UI state
    showSignOutModal: authState.ui.showSignOutModal,
    isSigningOut: authState.ui.isSigningOut,
    isCheckingPermissions: authState.ui.isCheckingPermissions,
    
    // Actions
    signOut,
    checkPermissions,
    openSignOutModal: showSignOutModal, // Renamed to avoid conflict
    hideSignOutModal,
    getUserRole,
    
    // Utils
    login: loginWithPopup,
    getToken: getAccessTokenSilently
  };
};