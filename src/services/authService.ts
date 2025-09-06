/**
 * Enhanced Authentication Service for Auth0 Integration
 * 
 * This service provides comprehensive authentication functionality with
 * proper localStorage persistence and token management.
 */

import { createAuth0Client } from '@auth0/auth0-spa-js';
import type { Auth0Client, Auth0ClientOptions, User, GetTokenSilentlyOptions } from '@auth0/auth0-spa-js';
import { User as AppUser, AuthErrorTypes } from '../types/auth';

class AuthService {
  private auth0Client: Auth0Client | null = null;
  private isInitialized = false;

  /**
   * Initialize Auth0 client with localStorage persistence
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('🔐 [AuthService] Initializing Auth0 client...');

      const domain = import.meta.env.VITE_AUTH0_DOMAIN;
      const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
      const redirectUri = import.meta.env.VITE_AUTH0_REDIRECT_URI || window.location.origin;
      const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

      if (!domain || !clientId) {
        throw new Error('Auth0 domain and client ID are required');
      }

      const config: Auth0ClientOptions = {
        domain,
        clientId,
        authorizationParams: {
          redirect_uri: redirectUri,
          ...(audience && { audience })
        },
        // Critical: Use localStorage for persistence across page refresh
        cacheLocation: 'localstorage',
        useRefreshTokens: true,
        useRefreshTokensFallback: true
      };

      console.log('🔧 [AuthService] Auth0 config:', {
        domain,
        clientId,
        redirectUri,
        audience: audience || 'none',
        cacheLocation: 'localstorage',
        useRefreshTokens: true
      });

      this.auth0Client = await createAuth0Client(config);
      this.isInitialized = true;

      console.log('✅ [AuthService] Auth0 client initialized successfully');

      // Handle redirect callback if present
      if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
        console.log('🔄 [AuthService] Processing Auth0 callback...');
        await this.auth0Client.handleRedirectCallback();
        
        // Clean up URL after callback
        const url = new URL(window.location.href);
        url.searchParams.delete('code');
        url.searchParams.delete('state');
        window.history.replaceState({}, document.title, url.toString());
        
        console.log('✅ [AuthService] Auth0 callback processed successfully');
      }

    } catch (error: any) {
      console.error('❌ [AuthService] Failed to initialize Auth0:', error);
      throw new Error(`Auth0 initialization failed: ${error.message}`);
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    this.ensureInitialized();
    
    try {
      console.log('🔍 [AuthService] Checking authentication status...');
      const isAuth = await this.auth0Client!.isAuthenticated();
      console.log('✅ [AuthService] Authentication check result:', isAuth);
      return isAuth;
    } catch (error: any) {
      console.error('❌ [AuthService] Authentication check failed:', error);
      return false;
    }
  }

  /**
   * Get current authenticated user
   */
  async getUser(): Promise<AppUser | null> {
    this.ensureInitialized();
    
    try {
      console.log('👤 [AuthService] Getting user information...');
      
      const isAuth = await this.auth0Client!.isAuthenticated();
      if (!isAuth) {
        console.log('ℹ️ [AuthService] User not authenticated');
        return null;
      }

      const auth0User = await this.auth0Client!.getUser();
      if (!auth0User) {
        console.log('⚠️ [AuthService] No user data available');
        return null;
      }

      console.log('✅ [AuthService] User retrieved successfully:', {
        email: auth0User.email,
        name: auth0User.name,
        sub: auth0User.sub
      });

      // Transform Auth0 user to app user format
      const user: AppUser = {
        id: auth0User.sub || '',
        email: auth0User.email || '',
        name: auth0User.name || auth0User.email || '',
        picture: auth0User.picture,
        emailVerified: auth0User.email_verified || false,
        permissions: [], // Will be populated by API call
        roles: [] // Will be populated by API call
      };

      return user;
    } catch (error: any) {
      console.error('❌ [AuthService] Failed to get user:', error);
      return null;
    }
  }

  /**
   * Login user via Auth0
   */
  async login(): Promise<void> {
    this.ensureInitialized();
    
    try {
      console.log('🚪 [AuthService] Initiating login...');
      
      await this.auth0Client!.loginWithRedirect({
        authorizationParams: {
          prompt: 'login',
          redirect_uri: window.location.origin
        }
      });
    } catch (error: any) {
      console.error('❌ [AuthService] Login failed:', error);
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  /**
   * Login with popup (alternative method)
   */
  async loginWithPopup(): Promise<void> {
    this.ensureInitialized();
    
    try {
      console.log('🚪 [AuthService] Initiating popup login...');
      
      await this.auth0Client!.loginWithPopup({
        authorizationParams: {
          prompt: 'login'
        }
      });
      
      console.log('✅ [AuthService] Popup login successful');
    } catch (error: any) {
      console.error('❌ [AuthService] Popup login failed:', error);
      
      // Don't throw for user-cancelled popups
      if (error.error === 'popup_closed_by_user') {
        console.log('ℹ️ [AuthService] User cancelled popup login');
        return;
      }
      
      throw new Error(`Popup login failed: ${error.message}`);
    }
  }

  /**
   * Logout user and clear Auth0 session
   */
  async logout(): Promise<void> {
    this.ensureInitialized();
    
    try {
      console.log('🚪 [AuthService] Logging out...');

      // Clear Auth0 session and redirect to login
      await this.auth0Client!.logout({
        logoutParams: {
          returnTo: `${window.location.origin}/login`
        }
      });
    } catch (error: any) {
      console.error('❌ [AuthService] Logout failed:', error);
      
      // Fallback: clear localStorage manually and redirect
      this.clearLocalStorage();
      window.location.href = '/login';
    }
  }

  /**
   * Get access token for API calls
   */
  async getToken(options?: GetTokenSilentlyOptions): Promise<string | null> {
    this.ensureInitialized();
    
    try {
      console.log('🎫 [AuthService] Getting access token...');
      
      const isAuth = await this.auth0Client!.isAuthenticated();
      if (!isAuth) {
        console.log('ℹ️ [AuthService] Not authenticated, cannot get token');
        return null;
      }

      const defaultOptions: GetTokenSilentlyOptions = {
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          scope: 'openid profile email'
        }
      };

      const tokenOptions = { ...defaultOptions, ...options };
      const token = await this.auth0Client!.getTokenSilently(tokenOptions);
      
      console.log('✅ [AuthService] Access token retrieved successfully');
      return token;
    } catch (error: any) {
      console.error('❌ [AuthService] Failed to get access token:', error);
      
      // If token refresh fails, user may need to re-authenticate
      if (error.error === 'login_required' || error.error === 'consent_required') {
        console.log('🔄 [AuthService] Re-authentication required');
        throw new Error('Session expired. Please log in again.');
      }
      
      return null;
    }
  }

  /**
   * Manually clear localStorage (fallback method)
   */
  private clearLocalStorage(): void {
    console.log('🧹 [AuthService] Clearing Auth0 localStorage...');
    
    // Clear all Auth0-related localStorage keys
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('@@auth0spajs@@') || key.includes('auth0'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log('🗑️ [AuthService] Removed localStorage key:', key);
    });
  }

  /**
   * Get Auth0 client instance (for advanced operations)
   */
  getAuth0Client(): Auth0Client | null {
    return this.auth0Client;
  }

  /**
   * Check if Auth0 service is initialized
   */
  isReady(): boolean {
    return this.isInitialized && this.auth0Client !== null;
  }

  /**
   * Ensure Auth0 client is initialized
   */
  private ensureInitialized(): void {
    if (!this.isInitialized || !this.auth0Client) {
      throw new Error('Auth0 service not initialized. Call initialize() first.');
    }
  }

  /**
   * Debug method to check localStorage state
   */
  debugLocalStorage(): void {
    console.log('🔍 [AuthService] Current localStorage state:');
    
    const auth0Keys: Record<string, any> = {};
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('@@auth0spajs@@') || key.includes('auth0'))) {
        try {
          const value = localStorage.getItem(key);
          auth0Keys[key] = {
            length: value?.length || 0,
            preview: value ? value.substring(0, 100) + '...' : null,
            isJSON: value && (value.startsWith('{') || value.startsWith('['))
          };
        } catch (error) {
          auth0Keys[key] = { error: (error as Error).message };
        }
      }
    }
    
    console.table(auth0Keys);
  }
}

// Export singleton instance
export const authService = new AuthService();