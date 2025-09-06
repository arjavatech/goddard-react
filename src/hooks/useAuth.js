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

  // Safe storage clearing - preserves Auth0 authentication data
  const safeClearStorage = () => {
    try {
      // Comprehensive Auth0 localStorage key patterns (bulletproof detection)
      const isAuth0Key = (key) => {
        const auth0Patterns = [
          // Auth0 SPA SDK patterns
          /^auth0\./,                    // auth0.*
          /^@@auth0spajs@@/,             // @@auth0spajs@@*
          /^auth0_session/,              // auth0_session*
          /^a0/,                         // a0*
          // Common Auth0 localStorage keys
          /auth0.*state/i,               // any key containing auth0 and state
          /auth0.*token/i,               // any key containing auth0 and token
          /auth0.*user/i,                // any key containing auth0 and user
          /auth0.*cache/i,               // any key containing auth0 and cache
          /auth0.*nonce/i,               // any key containing auth0 and nonce
          /auth0.*pkce/i,                // any key containing auth0 and pkce
          /auth0.*code_verifier/i,       // any key containing auth0 and code_verifier
          /auth0.*expires/i,             // any key containing auth0 and expires
          /auth0.*scope/i,               // any key containing auth0 and scope
          /auth0.*audience/i,            // any key containing auth0 and audience
          // Additional safety patterns
          /_auth/i,                      // any key containing _auth
          /session.*auth/i,              // any key containing session and auth
          /oauth/i,                      // any key containing oauth
          /jwt/i                         // any key containing jwt
        ];
        
        return auth0Patterns.some(pattern => pattern.test(key));
      };

      // Get all localStorage keys for analysis
      const allLocalStorageKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) allLocalStorageKeys.push(key);
      }

      // Identify and preserve Auth0 keys
      const auth0Keys = allLocalStorageKeys.filter(isAuth0Key);
      const nonAuth0Keys = allLocalStorageKeys.filter(key => !isAuth0Key(key));

      console.log('🔍 Auth0 localStorage analysis:');
      console.log(`  - Total keys found: ${allLocalStorageKeys.length}`);
      console.log(`  - Auth0 keys preserved: ${auth0Keys.length}`, auth0Keys);
      console.log(`  - Non-Auth0 keys to clear: ${nonAuth0Keys.length}`, nonAuth0Keys);

      // Define application-specific keys to clear (whitelist approach)
      const appKeys = [
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

      // Clear application-specific localStorage keys (whitelist)
      let clearedAppKeys = 0;
      appKeys.forEach(key => {
        if (localStorage.getItem(key) !== null) {
          try {
            localStorage.removeItem(key);
            clearedAppKeys++;
          } catch (error) {
            console.warn(`Failed to clear localStorage key: ${key}`, error);
          }
        }
      });

      // Clear any remaining non-Auth0 keys (but be extra cautious)
      let clearedOtherKeys = 0;
      nonAuth0Keys.forEach(key => {
        // Additional safety check - skip if key looks important
        if (!key.includes('debug') && !key.includes('test') && !appKeys.includes(key)) {
          try {
            localStorage.removeItem(key);
            clearedOtherKeys++;
          } catch (error) {
            console.warn(`Failed to clear localStorage key: ${key}`, error);
          }
        }
      });

      // Handle sessionStorage with same logic
      const allSessionStorageKeys = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) allSessionStorageKeys.push(key);
      }

      const sessionAuth0Keys = allSessionStorageKeys.filter(isAuth0Key);
      const sessionNonAuth0Keys = allSessionStorageKeys.filter(key => !isAuth0Key(key));

      console.log('🔍 Auth0 sessionStorage analysis:');
      console.log(`  - Total keys found: ${allSessionStorageKeys.length}`);
      console.log(`  - Auth0 keys preserved: ${sessionAuth0Keys.length}`, sessionAuth0Keys);
      console.log(`  - Non-Auth0 keys to clear: ${sessionNonAuth0Keys.length}`, sessionNonAuth0Keys);

      // Clear application-specific sessionStorage keys
      let clearedSessionAppKeys = 0;
      appKeys.forEach(key => {
        if (sessionStorage.getItem(key) !== null) {
          try {
            sessionStorage.removeItem(key);
            clearedSessionAppKeys++;
          } catch (error) {
            console.warn(`Failed to clear sessionStorage key: ${key}`, error);
          }
        }
      });

      // Clear non-Auth0 sessionStorage keys
      let clearedSessionOtherKeys = 0;
      sessionNonAuth0Keys.forEach(key => {
        if (!key.includes('debug') && !key.includes('test') && !appKeys.includes(key)) {
          try {
            sessionStorage.removeItem(key);
            clearedSessionOtherKeys++;
          } catch (error) {
            console.warn(`Failed to clear sessionStorage key: ${key}`, error);
          }
        }
      });

      console.log('✅ Safe storage clearing completed:');
      console.log(`  - localStorage: ${clearedAppKeys} app keys + ${clearedOtherKeys} other keys cleared`);
      console.log(`  - sessionStorage: ${clearedSessionAppKeys} app keys + ${clearedSessionOtherKeys} other keys cleared`);
      console.log(`  - Auth0 keys preserved: ${auth0Keys.length} (localStorage) + ${sessionAuth0Keys.length} (sessionStorage)`);
    } catch (error) {
      console.error('Error during safe storage clearing:', error);
    }
  };

  // Safe cookie clearing - preserves Auth0 cookies with comprehensive detection
  const safeClearCookies = () => {
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
          /^__/,                         // system cookies starting with __
          /csrf/i,                       // csrf tokens
          /xsrf/i                        // xsrf tokens
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
          console.log(`🔒 Preserving Auth0 cookie: ${cookieName}`);
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
      
      console.log('🍪 Cookie clearing analysis:');
      console.log(`  - Total cookies found: ${allCookies.length}`);
      console.log(`  - Auth0 cookies preserved: ${auth0Cookies.length}`, auth0Cookies);
      console.log(`  - Application cookies cleared: ${clearedCount}`, appCookies);
      console.log('✅ Safely cleared application cookies while preserving Auth0 cookies');
    } catch (error) {
      console.error('Error during safe cookie clearing:', error);
    }
  };

  const signOut = async () => {
    console.log('Signing out user...');
    
    // Safe storage clearing - preserves Auth0 authentication data
    safeClearStorage();
    safeClearCookies();
    
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