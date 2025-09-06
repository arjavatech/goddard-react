/**
 * Token Manager for Authentication
 * Handles JWT token storage, refresh, and validation
 */

import { AuthTokens, TokenRefreshResponse } from '../types';
import { EventEmitter } from './EventEmitter';

export class TokenManager extends EventEmitter {
  private tokens: AuthTokens | null = null;
  private refreshPromise: Promise<AuthTokens | null> | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;
  private config: {
    tokenStorage: 'localStorage' | 'sessionStorage' | 'memory';
    autoRefresh: boolean;
    refreshThreshold: number;
  };

  constructor(config: TokenManager['config']) {
    super();
    this.config = config;
    this.loadTokensFromStorage();
    if (this.config.autoRefresh) {
      this.setupAutoRefresh();
    }
  }

  async getValidToken(): Promise<AuthTokens | null> {
    if (!this.tokens) {
      return null;
    }

    // Check if token is still valid
    if (this.isTokenExpired(this.tokens)) {
      if (this.config.autoRefresh) {
        return await this.refreshToken();
      } else {
        this.clearTokens();
        return null;
      }
    }

    // Check if token needs refreshing soon
    if (this.shouldRefreshToken(this.tokens) && this.config.autoRefresh) {
      // Start refresh in background but return current token
      this.refreshToken().catch(console.error);
    }

    return this.tokens;
  }

  async setTokens(tokens: AuthTokens): Promise<void> {
    this.tokens = tokens;
    this.saveTokensToStorage();
    this.setupAutoRefresh();
    this.emit('tokensUpdated', tokens);
  }

  async refreshToken(): Promise<AuthTokens | null> {
    // Prevent multiple concurrent refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    if (!this.tokens?.refreshToken) {
      this.clearTokens();
      this.emit('authRequired');
      return null;
    }

    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<AuthTokens | null> {
    try {
      console.log('🔄 [TokenManager] Refreshing access token...');
      
      // This would typically call your Auth0 or authentication service
      // For now, we'll simulate with getAccessTokenSilently from Auth0
      if (typeof window !== 'undefined' && (window as any).auth0Client) {
        const auth0Client = (window as any).auth0Client;
        const newToken = await auth0Client.getTokenSilently({
          cacheMode: 'off' // Force refresh
        });
        
        const refreshedTokens: AuthTokens = {
          accessToken: newToken,
          tokenType: 'Bearer',
          expiresAt: Date.now() + (60 * 60 * 1000), // 1 hour from now
          refreshToken: this.tokens?.refreshToken
        };
        
        await this.setTokens(refreshedTokens);
        console.log('✅ [TokenManager] Token refreshed successfully');
        return refreshedTokens;
      }
      
      // Fallback to manual refresh if Auth0 client not available
      const response = await this.callRefreshEndpoint();
      if (response) {
        const refreshedTokens: AuthTokens = {
          accessToken: response.access_token,
          refreshToken: response.refresh_token || this.tokens?.refreshToken,
          tokenType: response.token_type || 'Bearer',
          expiresAt: Date.now() + (response.expires_in * 1000),
          scope: response.scope
        };
        
        await this.setTokens(refreshedTokens);
        console.log('✅ [TokenManager] Token refreshed via API');
        return refreshedTokens;
      }
      
      throw new Error('Unable to refresh token');
    } catch (error) {
      console.error('❌ [TokenManager] Token refresh failed:', error);
      this.clearTokens();
      this.emit('refreshFailed', error);
      this.emit('authRequired');
      return null;
    }
  }

  private async callRefreshEndpoint(): Promise<TokenRefreshResponse | null> {
    if (!this.tokens?.refreshToken) {
      return null;
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: this.tokens.refreshToken
        })
      });

      if (!response.ok) {
        throw new Error(`Refresh failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Refresh endpoint error:', error);
      return null;
    }
  }

  clearTokens(): void {
    this.tokens = null;
    this.clearTokensFromStorage();
    this.clearRefreshTimer();
    this.emit('tokensCleared');
  }

  private isTokenExpired(tokens: AuthTokens): boolean {
    // Add 30 second buffer to account for network latency
    return Date.now() >= (tokens.expiresAt - 30000);
  }

  private shouldRefreshToken(tokens: AuthTokens): boolean {
    // Refresh if token expires within the threshold
    return Date.now() >= (tokens.expiresAt - (this.config.refreshThreshold * 1000));
  }

  private setupAutoRefresh(): void {
    this.clearRefreshTimer();
    
    if (!this.tokens || !this.config.autoRefresh) {
      return;
    }

    const timeUntilRefresh = this.tokens.expiresAt - Date.now() - (this.config.refreshThreshold * 1000);
    
    if (timeUntilRefresh > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshToken().catch(console.error);
      }, timeUntilRefresh);
      
      console.log(`🕒 [TokenManager] Auto-refresh scheduled in ${Math.round(timeUntilRefresh / 1000)}s`);
    }
  }

  private clearRefreshTimer(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  private loadTokensFromStorage(): void {
    try {
      const storage = this.getStorage();
      if (!storage) return;
      
      const storedTokens = storage.getItem('api_tokens');
      if (storedTokens) {
        this.tokens = JSON.parse(storedTokens);
        
        // Validate stored tokens
        if (this.tokens && this.isTokenExpired(this.tokens)) {
          console.log('🗑️ [TokenManager] Stored token expired, clearing...');
          this.clearTokens();
        } else if (this.tokens) {
          console.log('✅ [TokenManager] Loaded valid tokens from storage');
          this.setupAutoRefresh();
        }
      }
    } catch (error) {
      console.error('Failed to load tokens from storage:', error);
      this.clearTokens();
    }
  }

  private saveTokensToStorage(): void {
    try {
      const storage = this.getStorage();
      if (!storage || !this.tokens) return;
      
      storage.setItem('api_tokens', JSON.stringify(this.tokens));
    } catch (error) {
      console.error('Failed to save tokens to storage:', error);
    }
  }

  private clearTokensFromStorage(): void {
    try {
      const storage = this.getStorage();
      if (!storage) return;
      
      storage.removeItem('api_tokens');
    } catch (error) {
      console.error('Failed to clear tokens from storage:', error);
    }
  }

  private getStorage(): Storage | null {
    if (typeof window === 'undefined') {
      return null;
    }
    
    switch (this.config.tokenStorage) {
      case 'localStorage':
        return window.localStorage;
      case 'sessionStorage':
        return window.sessionStorage;
      case 'memory':
      default:
        return null;
    }
  }

  // Public methods for debugging and monitoring
  getTokenInfo(): { hasToken: boolean; expiresAt?: number; expiresIn?: number } {
    if (!this.tokens) {
      return { hasToken: false };
    }
    
    return {
      hasToken: true,
      expiresAt: this.tokens.expiresAt,
      expiresIn: Math.max(0, this.tokens.expiresAt - Date.now())
    };
  }

  isAuthenticated(): boolean {
    return this.tokens !== null && !this.isTokenExpired(this.tokens);
  }

  // Cleanup method
  destroy(): void {
    this.clearRefreshTimer();
    this.removeAllListeners();
  }
}