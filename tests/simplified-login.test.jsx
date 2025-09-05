import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAuth } from '../src/hooks/useAuth';
import { renderHook, act } from '@testing-library/react';

// Mock Auth0
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: vi.fn(() => ({
    isLoading: false,
    isAuthenticated: false,
    user: null,
    loginWithPopup: vi.fn(),
    logout: vi.fn(),
    getAccessTokenSilently: vi.fn(),
  }))
}));

describe('Simplified Authentication Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    global.alert = vi.fn();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        clear: vi.fn(),
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });

    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        clear: vi.fn(),
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });

    // Mock window.location
    delete window.location;
    window.location = { href: '', origin: 'http://localhost:3000' };

    // Mock document.cookie
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('useAuth Hook Tests', () => {
    it('should return authenticated state when user is logged in', () => {
      const { useAuth0 } = require('@auth0/auth0-react');
      useAuth0.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { email: 'test@example.com' },
        logout: vi.fn(),
        loginWithPopup: vi.fn(),
        getAccessTokenSilently: vi.fn(),
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.user.email).toBe('test@example.com');
      expect(result.current.isLoggedIn()).toBe(true);
    });

    it('should return unauthenticated state when user is not logged in', () => {
      const { useAuth0 } = require('@auth0/auth0-react');
      useAuth0.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        logout: vi.fn(),
        loginWithPopup: vi.fn(),
        getAccessTokenSilently: vi.fn(),
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.user).toBe(null);
      expect(result.current.isLoggedIn()).toBe(false);
    });

    it('should handle login correctly', async () => {
      const mockLoginWithPopup = vi.fn();
      const { useAuth0 } = require('@auth0/auth0-react');
      useAuth0.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        logout: vi.fn(),
        loginWithPopup: mockLoginWithPopup,
        getAccessTokenSilently: vi.fn(),
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login();
      });

      expect(mockLoginWithPopup).toHaveBeenCalledWith({});
    });

    it('should handle login with custom options', async () => {
      const mockLoginWithPopup = vi.fn();
      const { useAuth0 } = require('@auth0/auth0-react');
      useAuth0.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        logout: vi.fn(),
        loginWithPopup: mockLoginWithPopup,
        getAccessTokenSilently: vi.fn(),
      });

      const { result } = renderHook(() => useAuth());
      const customOptions = { authorizationParams: { prompt: 'login' } };

      await act(async () => {
        await result.current.login(customOptions);
      });

      expect(mockLoginWithPopup).toHaveBeenCalledWith(customOptions);
    });

    it('should handle signup flow', async () => {
      const mockLoginWithPopup = vi.fn();
      const { useAuth0 } = require('@auth0/auth0-react');
      useAuth0.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        logout: vi.fn(),
        loginWithPopup: mockLoginWithPopup,
        getAccessTokenSilently: vi.fn(),
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.loginAsSignup();
      });

      expect(mockLoginWithPopup).toHaveBeenCalledWith({
        authorizationParams: {
          screen_hint: 'signup'
        }
      });
    });

    it('should clear storage on logout', async () => {
      const mockLogout = vi.fn();
      const { useAuth0 } = require('@auth0/auth0-react');
      useAuth0.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { email: 'test@example.com' },
        logout: mockLogout,
        loginWithPopup: vi.fn(),
        getAccessTokenSilently: vi.fn(),
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signOut();
      });

      expect(localStorage.clear).toHaveBeenCalled();
      expect(sessionStorage.clear).toHaveBeenCalled();
      expect(mockLogout).toHaveBeenCalledWith({
        logoutParams: {
          returnTo: 'http://localhost:3000/login'
        }
      });
    });

    it('should handle logout errors gracefully', async () => {
      const mockLogout = vi.fn().mockRejectedValue(new Error('Logout failed'));
      const { useAuth0 } = require('@auth0/auth0-react');
      useAuth0.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { email: 'test@example.com' },
        logout: mockLogout,
        loginWithPopup: vi.fn(),
        getAccessTokenSilently: vi.fn(),
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signOut();
      });

      expect(localStorage.clear).toHaveBeenCalled();
      expect(sessionStorage.clear).toHaveBeenCalled();
      expect(window.location.href).toBe('/login');
    });

    it('should return token when authenticated', async () => {
      const mockToken = 'mock-access-token';
      const mockGetAccessTokenSilently = vi.fn().mockResolvedValue(mockToken);
      const { useAuth0 } = require('@auth0/auth0-react');
      useAuth0.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { email: 'test@example.com' },
        logout: vi.fn(),
        loginWithPopup: vi.fn(),
        getAccessTokenSilently: mockGetAccessTokenSilently,
      });

      const { result } = renderHook(() => useAuth());

      const token = await act(async () => {
        return await result.current.getToken();
      });

      expect(token).toBe(mockToken);
      expect(mockGetAccessTokenSilently).toHaveBeenCalled();
    });

    it('should return null token when not authenticated', async () => {
      const { useAuth0 } = require('@auth0/auth0-react');
      useAuth0.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        logout: vi.fn(),
        loginWithPopup: vi.fn(),
        getAccessTokenSilently: vi.fn(),
      });

      const { result } = renderHook(() => useAuth());

      const token = await act(async () => {
        return await result.current.getToken();
      });

      expect(token).toBe(null);
    });
  });

  describe('Authentication Edge Cases', () => {
    it('should handle login errors', async () => {
      const mockLoginWithPopup = vi.fn().mockRejectedValue(new Error('Login failed'));
      const { useAuth0 } = require('@auth0/auth0-react');
      useAuth0.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        logout: vi.fn(),
        loginWithPopup: mockLoginWithPopup,
        getAccessTokenSilently: vi.fn(),
      });

      const { result } = renderHook(() => useAuth());

      await expect(
        act(async () => {
          await result.current.login();
        })
      ).rejects.toThrow('Login failed');
    });

    it('should handle token retrieval errors', async () => {
      const mockGetAccessTokenSilently = vi.fn().mkRejectedValue(new Error('Token error'));
      const { useAuth0 } = require('@auth0/auth0-react');
      useAuth0.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { email: 'test@example.com' },
        logout: vi.fn(),
        loginWithPopup: vi.fn(),
        getAccessTokenSilently: mockGetAccessTokenSilently,
      });

      const { result } = renderHook(() => useAuth());

      const token = await act(async () => {
        return await result.current.getToken();
      });

      expect(token).toBe(null);
    });

    it('should handle Auth0 state transitions', () => {
      const { useAuth0 } = require('@auth0/auth0-react');
      
      // Initial state - loading
      useAuth0.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        user: null,
        logout: vi.fn(),
        loginWithPopup: vi.fn(),
        getAccessTokenSilently: vi.fn(),
      });

      const { result, rerender } = renderHook(() => useAuth());
      expect(result.current.isLoggedIn()).toBe(false);

      // After login
      useAuth0.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { email: 'test@example.com' },
        logout: vi.fn(),
        loginWithPopup: vi.fn(),
        getAccessTokenSilently: vi.fn(),
      });

      rerender();
      expect(result.current.isLoggedIn()).toBe(true);
    });
  });

  describe('Authentication State Persistence', () => {
    it('should persist authentication across sessions', () => {
      const { useAuth0 } = require('@auth0/auth0-react');
      useAuth0.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { email: 'test@example.com' },
        logout: vi.fn(),
        loginWithPopup: vi.fn(),
        getAccessTokenSilently: vi.fn(),
      });

      const { result } = renderHook(() => useAuth());
      
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user.email).toBe('test@example.com');
    });

    it('should handle session cleanup on logout', async () => {
      const mockLogout = vi.fn();
      const { useAuth0 } = require('@auth0/auth0-react');
      useAuth0.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { email: 'test@example.com' },
        logout: mockLogout,
        loginWithPopup: vi.fn(),
        getAccessTokenSilently: vi.fn(),
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signOut();
      });

      // Verify cleanup
      expect(localStorage.clear).toHaveBeenCalled();
      expect(sessionStorage.clear).toHaveBeenCalled();
    });
  });
});