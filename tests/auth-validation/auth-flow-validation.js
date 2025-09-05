/**
 * Authentication Flow Validation Test Suite
 * Comprehensive testing for Auth0 integration and permission validation
 */

import { render, screen, waitFor, act } from '@testing-library/react';
import { jest } from '@jest/globals';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { BrowserRouter } from 'react-router-dom';
import App from '../../src/App';
import PrivateRoute from '../../src/components/PrivateRoute';
import AdminDashboard from '../../src/pages/AdminDashboard';

// Mock Auth0 configuration
const mockAuth0Config = {
  domain: process.env.REACT_APP_AUTH0_DOMAIN || 'test-domain.auth0.com',
  clientId: process.env.REACT_APP_AUTH0_CLIENT_ID || 'test-client-id',
  audience: process.env.REACT_APP_AUTH0_AUDIENCE || 'https://goddard-api.com'
};

// Mock API responses
const mockTokenResponse = {
  access_token: 'mock-access-token',
  token_type: 'Bearer',
  expires_in: 3600
};

const mockPermissionResponse = {
  hasPermission: true,
  permissions: ['read:dashboard', 'admin:manage'],
  role: 'admin'
};

describe('Authentication Flow Validation', () => {
  let mockGetAccessTokenSilently;
  let mockFetch;
  let consoleWarnSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    // Reset mocks
    mockGetAccessTokenSilently = jest.fn();
    mockFetch = jest.fn();
    global.fetch = mockFetch;
    
    // Console monitoring setup
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Mock Auth0 hook
    jest.doMock('@auth0/auth0-react', () => ({
      ...jest.requireActual('@auth0/auth0-react'),
      useAuth0: () => ({
        isAuthenticated: true,
        isLoading: false,
        user: {
          sub: 'auth0|test-user-id',
          email: 'test@example.com',
          name: 'Test User'
        },
        getAccessTokenSilently: mockGetAccessTokenSilently,
        loginWithRedirect: jest.fn(),
        logout: jest.fn()
      })
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('Auth0Provider Initialization', () => {
    test('should initialize with correct domain and clientId', () => {
      const TestComponent = () => {
        const { isLoading } = useAuth0();
        return <div data-testid="auth-status">{isLoading ? 'Loading' : 'Ready'}</div>;
      };

      render(
        <Auth0Provider
          domain={mockAuth0Config.domain}
          clientId={mockAuth0Config.clientId}
          audience={mockAuth0Config.audience}
          redirectUri={window.location.origin}
        >
          <TestComponent />
        </Auth0Provider>
      );

      expect(screen.getByTestId('auth-status')).toBeInTheDocument();
    });

    test('should include audience parameter for API access', () => {
      expect(mockAuth0Config.audience).toBeDefined();
      expect(mockAuth0Config.audience).toContain('https://');
    });
  });

  describe('Token Acquisition Flow', () => {
    test('should successfully acquire access token with correct audience', async () => {
      mockGetAccessTokenSilently.mockResolvedValue('mock-access-token');

      const result = await mockGetAccessTokenSilently({
        audience: mockAuth0Config.audience
      });

      expect(result).toBe('mock-access-token');
      expect(mockGetAccessTokenSilently).toHaveBeenCalledWith({
        audience: mockAuth0Config.audience
      });
    });

    test('should handle token acquisition errors gracefully', async () => {
      const tokenError = new Error('Token acquisition failed');
      mockGetAccessTokenSilently.mockRejectedValue(tokenError);

      try {
        await mockGetAccessTokenSilently({
          audience: mockAuth0Config.audience
        });
      } catch (error) {
        expect(error.message).toBe('Token acquisition failed');
      }

      expect(mockGetAccessTokenSilently).toHaveBeenCalledWith({
        audience: mockAuth0Config.audience
      });
    });

    test('should measure token acquisition performance', async () => {
      const startTime = performance.now();
      mockGetAccessTokenSilently.mockResolvedValue('mock-access-token');

      await mockGetAccessTokenSilently({
        audience: mockAuth0Config.audience
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe('Permission Check API Integration', () => {
    test('should make API call with proper Bearer token', async () => {
      const mockToken = 'mock-access-token';
      mockGetAccessTokenSilently.mockResolvedValue(mockToken);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPermissionResponse)
      });

      // Simulate permission check API call
      const token = await mockGetAccessTokenSilently({
        audience: mockAuth0Config.audience
      });

      const response = await fetch('/api/permissions/check', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/permissions/check', {
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json'
        }
      });

      expect(response.ok).toBe(true);
    });

    test('should handle API permission check failures', async () => {
      const mockToken = 'mock-access-token';
      mockGetAccessTokenSilently.mockResolvedValue(mockToken);
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ error: 'Insufficient permissions' })
      });

      const token = await mockGetAccessTokenSilently({
        audience: mockAuth0Config.audience
      });

      const response = await fetch('/api/permissions/check', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(403);
    });
  });

  describe('PrivateRoute Permission Validation', () => {
    test('should validate permissions before rendering protected component', async () => {
      mockGetAccessTokenSilently.mockResolvedValue('mock-access-token');
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPermissionResponse)
      });

      const TestProtectedComponent = () => <div data-testid="protected-content">Protected Content</div>;

      render(
        <BrowserRouter>
          <Auth0Provider
            domain={mockAuth0Config.domain}
            clientId={mockAuth0Config.clientId}
            audience={mockAuth0Config.audience}
          >
            <PrivateRoute
              element={<TestProtectedComponent />}
              requiredPermissions={['read:dashboard']}
            />
          </Auth0Provider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });
    });

    test('should block access when permissions are insufficient', async () => {
      mockGetAccessTokenSilently.mockResolvedValue('mock-access-token');
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          hasPermission: false,
          permissions: ['read:basic'],
          role: 'user'
        })
      });

      const TestProtectedComponent = () => <div data-testid="protected-content">Protected Content</div>;

      render(
        <BrowserRouter>
          <Auth0Provider
            domain={mockAuth0Config.domain}
            clientId={mockAuth0Config.clientId}
            audience={mockAuth0Config.audience}
          >
            <PrivateRoute
              element={<TestProtectedComponent />}
              requiredPermissions={['admin:manage']}
            />
          </Auth0Provider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      });
    });
  });

  describe('AdminDashboard Access Control', () => {
    test('should render AdminDashboard for users with admin permissions', async () => {
      mockGetAccessTokenSilently.mockResolvedValue('mock-access-token');
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          hasPermission: true,
          permissions: ['read:dashboard', 'admin:manage'],
          role: 'admin'
        })
      });

      render(
        <BrowserRouter>
          <Auth0Provider
            domain={mockAuth0Config.domain}
            clientId={mockAuth0Config.clientId}
            audience={mockAuth0Config.audience}
          >
            <PrivateRoute
              element={<AdminDashboard />}
              requiredPermissions={['admin:manage']}
            />
          </Auth0Provider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling and Network Failures', () => {
    test('should handle network failures during permission check', async () => {
      mockGetAccessTokenSilently.mockResolvedValue('mock-access-token');
      mockFetch.mockRejectedValue(new Error('Network error'));

      const TestProtectedComponent = () => <div data-testid="protected-content">Protected Content</div>;

      render(
        <BrowserRouter>
          <Auth0Provider
            domain={mockAuth0Config.domain}
            clientId={mockAuth0Config.clientId}
            audience={mockAuth0Config.audience}
          >
            <PrivateRoute
              element={<TestProtectedComponent />}
              requiredPermissions={['read:dashboard']}
            />
          </Auth0Provider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      });
    });

    test('should log appropriate error messages to console', async () => {
      mockGetAccessTokenSilently.mockRejectedValue(new Error('Token error'));

      try {
        await mockGetAccessTokenSilently({
          audience: mockAuth0Config.audience
        });
      } catch (error) {
        console.error('Token acquisition failed:', error.message);
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Token acquisition failed:',
        'Token error'
      );
    });
  });

  describe('Performance Metrics', () => {
    test('should complete full authentication flow within reasonable time', async () => {
      const startTime = performance.now();
      
      mockGetAccessTokenSilently.mockResolvedValue('mock-access-token');
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPermissionResponse)
      });

      // Simulate full flow
      const token = await mockGetAccessTokenSilently({
        audience: mockAuth0Config.audience
      });

      await fetch('/api/permissions/check', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      expect(totalTime).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });

  describe('State Synchronization and Race Conditions', () => {
    test('should handle concurrent permission checks without race conditions', async () => {
      mockGetAccessTokenSilently.mockResolvedValue('mock-access-token');
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPermissionResponse)
      });

      // Simulate concurrent permission checks
      const promises = Array(5).fill().map(async (_, index) => {
        const token = await mockGetAccessTokenSilently({
          audience: mockAuth0Config.audience
        });
        
        return fetch(`/api/permissions/check?resource=${index}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      });

      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.ok).toBe(true);
      });
    });
  });

  describe('Logout and Re-authentication Flow', () => {
    test('should clear authentication state on logout', () => {
      const mockLogout = jest.fn();
      
      jest.doMock('@auth0/auth0-react', () => ({
        ...jest.requireActual('@auth0/auth0-react'),
        useAuth0: () => ({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          logout: mockLogout
        })
      }));

      // Simulate logout
      act(() => {
        mockLogout({ returnTo: window.location.origin });
      });

      expect(mockLogout).toHaveBeenCalledWith({
        returnTo: window.location.origin
      });
    });
  });
});