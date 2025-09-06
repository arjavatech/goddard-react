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

  // Safe storage clearing function that preserves Auth0 data with bulletproof detection
  const safeClearStorage = useCallback(() => {
    try {
      // Comprehensive Auth0 localStorage key patterns (bulletproof detection)
      const isAuth0Key = (key) => {
        const auth0Patterns = [
          // Auth0 SPA SDK patterns (critical for cacheLocation="localstorage")
          /^auth0\./,                    // auth0.*
          /^@@auth0spajs@@/,             // @@auth0spajs@@*
          /^auth0_session/,              // auth0_session*
          /^a0/,                         // a0*
          // Specific Auth0 localStorage keys used by SPA SDK
          /auth0.*cache/i,               // auth0 cache entries
          /auth0.*state/i,               // auth0 state
          /auth0.*token/i,               // auth0 tokens
          /auth0.*user/i,                // auth0 user data
          /auth0.*nonce/i,               // auth0 nonce
          /auth0.*pkce/i,                // auth0 PKCE
          /auth0.*code_verifier/i,       // auth0 code verifier
          /auth0.*expires/i,             // auth0 expiration data
          /auth0.*scope/i,               // auth0 scopes
          /auth0.*audience/i,            // auth0 audience
          /auth0.*client/i,              // auth0 client data
          /auth0.*domain/i,              // auth0 domain info
          /auth0.*transaction/i,         // auth0 transaction state
          // Additional safety patterns
          /_auth/i,                      // any key containing _auth
          /session.*auth/i,              // any key containing session and auth
          /oauth/i,                      // any key containing oauth
          /jwt/i,                        // any key containing jwt
          /oidc/i,                       // OpenID Connect related
          /pkce/i                        // PKCE related
        ];
        
        return auth0Patterns.some(pattern => pattern.test(key));
      };

      // Analyze localStorage
      const allLocalStorageKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) allLocalStorageKeys.push(key);
      }

      const auth0LocalKeys = allLocalStorageKeys.filter(isAuth0Key);
      const nonAuth0LocalKeys = allLocalStorageKeys.filter(key => !isAuth0Key(key));

      console.log('🔍 Auth0 localStorage analysis (useAuthState):');
      console.log(`  - Total keys found: ${allLocalStorageKeys.length}`);
      console.log(`  - Auth0 keys preserved: ${auth0LocalKeys.length}`, auth0LocalKeys);
      console.log(`  - Non-Auth0 keys available for clearing: ${nonAuth0LocalKeys.length}`, nonAuth0LocalKeys);

      // Define application-specific keys to clear (whitelist approach)
      const appKeysToClear = [
        'user_preferences',
        'app_settings',
        'cached_data',
        'temporary_data',
        'ui_state',
        'form_data',
        'search_history',
        'filters',
        'sort_preferences',
        'view_preferences',
        'notification_settings',
        'theme_preference',
        'language_preference'
      ];

      // Clear application-specific localStorage items (whitelist)
      let clearedLocalAppKeys = 0;
      appKeysToClear.forEach(key => {
        if (localStorage.getItem(key) !== null) {
          try {
            localStorage.removeItem(key);
            clearedLocalAppKeys++;
          } catch (e) {
            console.warn(`Failed to remove localStorage key: ${key}`, e);
          }
        }
      });

      // Optionally clear other non-Auth0 keys (be extra cautious)
      let clearedOtherLocalKeys = 0;
      nonAuth0LocalKeys.forEach(key => {
        // Skip if it's already in our app keys list or looks system-important
        if (!appKeysToClear.includes(key) && 
            !key.includes('debug') && 
            !key.includes('test') && 
            !key.startsWith('_') &&
            !key.includes('devtools')) {
          try {
            localStorage.removeItem(key);
            clearedOtherLocalKeys++;
          } catch (e) {
            console.warn(`Failed to remove localStorage key: ${key}`, e);
          }
        }
      });

      // Analyze sessionStorage
      const sessionStorageKeys = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) sessionStorageKeys.push(key);
      }

      const auth0SessionKeys = sessionStorageKeys.filter(isAuth0Key);
      const nonAuth0SessionKeys = sessionStorageKeys.filter(key => !isAuth0Key(key));

      console.log('🔍 Auth0 sessionStorage analysis (useAuthState):');
      console.log(`  - Total keys found: ${sessionStorageKeys.length}`);
      console.log(`  - Auth0 keys preserved: ${auth0SessionKeys.length}`, auth0SessionKeys);
      console.log(`  - Non-Auth0 keys available for clearing: ${nonAuth0SessionKeys.length}`, nonAuth0SessionKeys);

      // Clear application-specific sessionStorage items
      let clearedSessionAppKeys = 0;
      appKeysToClear.forEach(key => {
        if (sessionStorage.getItem(key) !== null) {
          try {
            sessionStorage.removeItem(key);
            clearedSessionAppKeys++;
          } catch (e) {
            console.warn(`Failed to remove sessionStorage key: ${key}`, e);
          }
        }
      });

      // Clear other non-Auth0 sessionStorage keys
      let clearedOtherSessionKeys = 0;
      nonAuth0SessionKeys.forEach(key => {
        if (!appKeysToClear.includes(key) && 
            !key.includes('debug') && 
            !key.includes('test') && 
            !key.startsWith('_') &&
            !key.includes('devtools')) {
          try {
            sessionStorage.removeItem(key);
            clearedOtherSessionKeys++;
          } catch (e) {
            console.warn(`Failed to remove sessionStorage key: ${key}`, e);
          }
        }
      });

      console.log('✅ Safe storage clearing completed (useAuthState):');
      console.log(`  - localStorage: ${clearedLocalAppKeys} app keys + ${clearedOtherLocalKeys} other keys cleared`);
      console.log(`  - sessionStorage: ${clearedSessionAppKeys} app keys + ${clearedOtherSessionKeys} other keys cleared`);
      console.log(`  - Auth0 keys preserved: ${auth0LocalKeys.length} (localStorage) + ${auth0SessionKeys.length} (sessionStorage)`);
      console.log('  - Auth0 localStorage cache remains intact for seamless re-authentication');
    } catch (error) {
      console.error('Error during safe storage clearing:', error);
    }
  }, []);

  // Safe cookie clearing function that preserves Auth0 cookies with comprehensive detection
  const safeClearCookies = useCallback(() => {
    try {
      const cookies = document.cookie.split("; ");
      
      // Comprehensive Auth0 cookie detection
      const isAuth0Cookie = (cookieName) => {
        const auth0CookiePatterns = [
          /^auth0/i,                     // starts with auth0
          /^a0/i,                        // starts with a0
          /_auth/i,                      // contains _auth
          /session.*auth/i,              // contains session and auth
          /oauth/i,                      // contains oauth
          /jwt/i,                        // contains jwt
          /token/i,                      // contains token
          /oidc/i,                       // OpenID Connect
          /^__/,                         // system cookies starting with __
          /csrf/i,                       // csrf tokens
          /xsrf/i,                       // xsrf tokens
          /state/i,                      // auth state cookies
          /nonce/i,                      // nonce cookies
          /pkce/i                        // PKCE cookies
        ];
        
        return auth0CookiePatterns.some(pattern => pattern.test(cookieName));
      };
      
      const allCookies = [];
      const auth0Cookies = [];
      const appCookies = [];
      let clearedCount = 0;
      
      for (let i = 0; i < cookies.length; i++) {
        const cookieParts = cookies[i].split("=");
        const cookieName = cookieParts[0]?.trim();
        
        if (!cookieName) continue;
        
        allCookies.push(cookieName);
        
        if (isAuth0Cookie(cookieName)) {
          auth0Cookies.push(cookieName);
          console.log(`🔒 Preserving Auth0 cookie (useAuthState): ${cookieName}`);
          continue;
        }
        
        appCookies.push(cookieName);
        
        // Clear application-specific cookies
        try {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
          clearedCount++;
        } catch (error) {
          console.warn(`Failed to clear cookie: ${cookieName}`, error);
        }
      }
      
      console.log('🍪 Cookie clearing analysis (useAuthState):');
      console.log(`  - Total cookies found: ${allCookies.length}`);
      console.log(`  - Auth0 cookies preserved: ${auth0Cookies.length}`, auth0Cookies);
      console.log(`  - Application cookies cleared: ${clearedCount}`, appCookies);
      console.log('✅ Safely cleared application cookies while preserving Auth0 session cookies');
    } catch (error) {
      console.error('Error during safe cookie clearing:', error);
    }
  }, []);

  // Sign out with proper state management and safe storage clearing
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

      // Safe selective clearing that preserves Auth0 data
      safeClearStorage();
      safeClearCookies();

      // Auth0 logout - this will handle Auth0-specific cleanup properly
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
  }, [logout, cleanup, safeClearStorage, safeClearCookies]);

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