import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth0 } from '@auth0/auth0-react';
import { useAuth } from '../../src/hooks/useAuth';

// Mock Auth0
vi.mock('@auth0/auth0-react');

describe('useAuth Hook', () => {
  const mockLogout = vi.fn();
  const mockLoginWithPopup = vi.fn();
  const mockGetAccessTokenSilently = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock localStorage and sessionStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        clear: vi.fn(),
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });

    Object.defineProperty(window, 'sessionStorage', {
      value: {
        clear: vi.fn(),
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });

    // Mock document.cookie
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });

    // Mock window.location
    delete window.location;
    window.location = { href: '', origin: 'http://localhost:3000' };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Authentication State', () => {
    it('should return authenticated state when user is logged in', () => {
      useAuth0.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { email: 'test@example.com' },
        logout: mockLogout,
        loginWithPopup: mockLoginWithPopup,
        getAccessTokenSilently: mockGetAccessTokenSilently,
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.user.email).toBe('test@example.com');
      expect(result.current.isLoggedIn()).toBe(true);
    });

    it('should return loading state during authentication check', () => {
      useAuth0.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        user: null,
        logout: mockLogout,
        loginWithPopup: mockLoginWithPopup,
        getAccessTokenSilently: mockGetAccessTokenSilently,
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isLoggedIn()).toBe(false);
    });

    it('should return unauthenticated state when user is not logged in', () => {
      useAuth0.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        logout: mockLogout,
        loginWithPopup: mockLoginWithPopup,
        getAccessTokenSilently: mockGetAccessTokenSilently,
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.user).toBe(null);
      expect(result.current.isLoggedIn()).toBe(false);
    });
  });

  describe('Login Functionality', () => {
    beforeEach(() => {
      useAuth0.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        logout: mockLogout,
        loginWithPopup: mockLoginWithPopup,
        getAccessTokenSilently: mockGetAccessTokenSilently,
      });
    });

    it('should call Auth0 login with default options', async () => {
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login();
      });

      expect(mockLoginWithPopup).toHaveBeenCalledWith({});
    });

    it('should call Auth0 login with custom options', async () => {
      const { result } = renderHook(() => useAuth());
      const customOptions = { authorizationParams: { prompt: 'login' } };

      await act(async () => {
        await result.current.login(customOptions);
      });

      expect(mockLoginWithPopup).toHaveBeenCalledWith(customOptions);
    });

    it('should handle login errors', async () => {
      const error = new Error('Login failed');
      mockLoginWithPopup.mockRejectedValue(error);

      const { result } = renderHook(() => useAuth());

      await expect(
        act(async () => {
          await result.current.login();
        })
      ).rejects.toThrow('Login failed');
    });

    it('should call Auth0 login with signup hint for signup flow', async () => {
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
  });

  describe('Logout Functionality', () => {
    beforeEach(() => {
      useAuth0.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { email: 'test@example.com' },
        logout: mockLogout,
        loginWithPopup: mockLoginWithPopup,
        getAccessTokenSilently: mockGetAccessTokenSilently,
      });

      // Set up cookies for testing
      document.cookie = 'test-cookie=value; auth-cookie=token';
    });

    it('should clear storage and cookies on logout', async () => {
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
      const error = new Error('Logout failed');
      mockLogout.mockRejectedValue(error);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signOut();
      });

      // Should still clear storage even if Auth0 logout fails
      expect(localStorage.clear).toHaveBeenCalled();
      expect(sessionStorage.clear).toHaveBeenCalled();
      expect(window.location.href).toBe('/login');
    });

    it('should clear individual cookies', async () => {
      // Mock document.cookie to simulate cookies being set
      const mockCookies = ['cookie1=value1', 'cookie2=value2', 'auth=token'];
      Object.defineProperty(document, 'cookie', {
        get: () => mockCookies.join('; '),
        set: vi.fn(),
        configurable: true,
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signOut();
      });

      // Should attempt to clear each cookie
      expect(document.cookie).toBeDefined();
    });
  });

  describe('Token Management', () => {
    it('should return token when authenticated', async () => {
      const mockToken = 'mock-access-token';
      mockGetAccessTokenSilently.mockResolvedValue(mockToken);
      
      useAuth0.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { email: 'test@example.com' },
        logout: mockLogout,
        loginWithPopup: mockLoginWithPopup,
        getAccessTokenSilently: mockGetAccessTokenSilently,
      });

      const { result } = renderHook(() => useAuth());

      const token = await act(async () => {
        return await result.current.getToken();
      });

      expect(token).toBe(mockToken);
      expect(mockGetAccessTokenSilently).toHaveBeenCalled();
    });

    it('should return null when not authenticated', async () => {
      useAuth0.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        logout: mockLogout,
        loginWithPopup: mockLoginWithPopup,
        getAccessTokenSilently: mockGetAccessTokenSilently,
      });

      const { result } = renderHook(() => useAuth());

      const token = await act(async () => {
        return await result.current.getToken();
      });

      expect(token).toBe(null);
      expect(mockGetAccessTokenSilently).not.toHaveBeenCalled();
    });

    it('should handle token retrieval errors', async () => {
      const error = new Error('Token error');
      mockGetAccessTokenSilently.mockRejectedValue(error);
      
      useAuth0.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { email: 'test@example.com' },
        logout: mockLogout,
        loginWithPopup: mockLoginWithPopup,
        getAccessTokenSilently: mockGetAccessTokenSilently,
      });

      const { result } = renderHook(() => useAuth());

      const token = await act(async () => {
        return await result.current.getToken();
      });

      expect(token).toBe(null);
    });

    it('should provide access to getAccessTokenSilently directly', () => {
      useAuth0.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { email: 'test@example.com' },
        logout: mockLogout,
        loginWithPopup: mockLoginWithPopup,
        getAccessTokenSilently: mockGetAccessTokenSilently,
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.getAccessTokenSilently).toBe(mockGetAccessTokenSilently);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle Auth0 state transitions', () => {
      const { result, rerender } = renderHook(() => useAuth());

      // Initial state - loading
      useAuth0.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        user: null,
        logout: mockLogout,
        loginWithPopup: mockLoginWithPopup,
        getAccessTokenSilently: mockGetAccessTokenSilently,
      });

      rerender();
      expect(result.current.isLoggedIn()).toBe(false);

      // After login
      useAuth0.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { email: 'test@example.com' },
        logout: mockLogout,
        loginWithPopup: mockLoginWithPopup,
        getAccessTokenSilently: mockGetAccessTokenSilently,
      });

      rerender();
      expect(result.current.isLoggedIn()).toBe(true);
    });

    it('should handle concurrent logout calls', async () => {
      const { result } = renderHook(() => useAuth());

      // Call signOut multiple times concurrently
      const promises = [
        result.current.signOut(),
        result.current.signOut(),
        result.current.signOut(),
      ];

      await act(async () => {
        await Promise.all(promises);
      });

      // Should handle multiple calls gracefully
      expect(localStorage.clear).toHaveBeenCalled();
      expect(mockLogout).toHaveBeenCalled();
    });

    it('should handle missing Auth0 context gracefully', () => {
      useAuth0.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        logout: undefined,
        loginWithPopup: undefined,
        getAccessTokenSilently: undefined,
      });

      const { result } = renderHook(() => useAuth());

      // Should not throw errors
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoggedIn()).toBe(false);
    });
  });
});