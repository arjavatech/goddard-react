/**
 * Complete Authentication Flow Integration Tests
 * End-to-end testing of the entire authentication system
 */

import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import { jest } from '@jest/globals';

// Import components
import App from '../../src/App';
import AdminDashboard from '../../src/pages/AdminDashboard';
import ParentDashboard from '../../src/pages/ParentDashboard';
import PrivateRoute from '../../src/components/PrivateRoute';

// Mock fetch globally
global.fetch = jest.fn();

// Mock Auth0 configuration
const mockAuth0Config = {
  domain: process.env.REACT_APP_AUTH0_DOMAIN || 'test-domain.auth0.com',
  clientId: process.env.REACT_APP_AUTH0_CLIENT_ID || 'test-client-id',
  audience: process.env.REACT_APP_AUTH0_AUDIENCE || 'https://goddard-api.com'
};

// Test data
const mockAdminUser = {
  sub: 'auth0|admin-user-id',
  email: 'admin@goddardschool.com',
  name: 'Admin User',
  'https://goddardschool.com/roles': ['admin']
};

const mockParentUser = {
  sub: 'auth0|parent-user-id',
  email: 'parent@example.com',
  name: 'Parent User',
  'https://goddardschool.com/roles': ['parent']
};

const mockAdminPermissions = {
  hasPermission: true,
  permissions: ['read:dashboard', 'admin:manage', 'write:users'],
  role: 'admin'
};

const mockParentPermissions = {
  hasPermission: true,
  permissions: ['read:dashboard', 'parent:children'],
  role: 'parent'
};

describe('Complete Authentication Flow Integration', () => {
  let mockGetAccessTokenSilently;
  let mockLoginWithRedirect;
  let mockLogout;
  let user;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    global.fetch.mockClear();
    
    // Setup user event
    user = userEvent.setup();
    
    // Mock Auth0 functions
    mockGetAccessTokenSilently = jest.fn();
    mockLoginWithRedirect = jest.fn();
    mockLogout = jest.fn();

    // Mock Auth0 hook with default unauthenticated state
    jest.doMock('@auth0/auth0-react', () => ({
      ...jest.requireActual('@auth0/auth0-react'),
      useAuth0: jest.fn(() => ({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        getAccessTokenSilently: mockGetAccessTokenSilently,
        loginWithRedirect: mockLoginWithRedirect,
        logout: mockLogout
      })),
      Auth0Provider: ({ children }) => children
    }));
  });

  const renderAppWithAuth0 = (authState = {}) => {
    const defaultAuthState = {
      isAuthenticated: false,
      isLoading: false,
      user: null,
      getAccessTokenSilently: mockGetAccessTokenSilently,
      loginWithRedirect: mockLoginWithRedirect,
      logout: mockLogout
    };

    const finalAuthState = { ...defaultAuthState, ...authState };

    jest.doMock('@auth0/auth0-react', () => ({
      ...jest.requireActual('@auth0/auth0-react'),
      useAuth0: jest.fn(() => finalAuthState),
      Auth0Provider: ({ children }) => children
    }));

    return render(
      <BrowserRouter>
        <Auth0Provider
          domain={mockAuth0Config.domain}
          clientId={mockAuth0Config.clientId}
          audience={mockAuth0Config.audience}
        >
          <App />
        </Auth0Provider>
      </BrowserRouter>
    );
  };

  describe('Unauthenticated User Flow', () => {
    test('should redirect to login for protected routes', async () => {
      renderAppWithAuth0();
      
      // Try to navigate to admin dashboard
      window.history.pushState({}, 'Admin Dashboard', '/admin-dashboard');
      
      await waitFor(() => {
        expect(screen.getByText(/Please log in/i)).toBeInTheDocument();
      });
    });

    test('should show login button on landing page', async () => {
      renderAppWithAuth0();
      
      await waitFor(() => {
        expect(screen.getByText(/Log In/i)).toBeInTheDocument();
      });
    });

    test('should initiate login when login button clicked', async () => {
      renderAppWithAuth0();
      
      const loginButton = await screen.findByText(/Log In/i);
      await user.click(loginButton);
      
      expect(mockLoginWithRedirect).toHaveBeenCalledWith({
        audience: mockAuth0Config.audience,
        scope: 'openid profile email read:permissions'
      });
    });
  });

  describe('Admin User Authentication Flow', () => {
    test('should complete full admin authentication and dashboard access', async () => {
      // Step 1: Mock successful token acquisition
      mockGetAccessTokenSilently.mockResolvedValue('admin-access-token');
      
      // Step 2: Mock permission check API response
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockAdminPermissions)
      });

      // Step 3: Render with authenticated admin user
      renderAppWithAuth0({
        isAuthenticated: true,
        user: mockAdminUser
      });

      // Step 4: Navigate to admin dashboard
      window.history.pushState({}, 'Admin Dashboard', '/admin-dashboard');

      // Step 5: Verify admin dashboard renders
      await waitFor(() => {
        expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
      }, { timeout: 5000 });

      // Step 6: Verify token was requested with correct audience
      expect(mockGetAccessTokenSilently).toHaveBeenCalledWith({
        audience: mockAuth0Config.audience
      });

      // Step 7: Verify permission check API was called
      expect(global.fetch).toHaveBeenCalledWith('/api/permissions/check', {
        headers: {
          'Authorization': 'Bearer admin-access-token',
          'Content-Type': 'application/json'
        }
      });
    });

    test('should handle admin-specific features', async () => {
      mockGetAccessTokenSilently.mockResolvedValue('admin-access-token');
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockAdminPermissions)
      });

      renderAppWithAuth0({
        isAuthenticated: true,
        user: mockAdminUser
      });

      window.history.pushState({}, 'Admin Dashboard', '/admin-dashboard');

      await waitFor(() => {
        expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
      });

      // Verify admin-specific elements are present
      expect(screen.getByText(/Manage Users/i)).toBeInTheDocument();
      expect(screen.getByText(/System Settings/i)).toBeInTheDocument();
    });
  });

  describe('Parent User Authentication Flow', () => {
    test('should complete parent authentication and dashboard access', async () => {
      mockGetAccessTokenSilently.mockResolvedValue('parent-access-token');
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockParentPermissions)
      });

      renderAppWithAuth0({
        isAuthenticated: true,
        user: mockParentUser
      });

      window.history.pushState({}, 'Parent Dashboard', '/parent-dashboard');

      await waitFor(() => {
        expect(screen.getByText(/Parent Dashboard/i)).toBeInTheDocument();
      });

      expect(mockGetAccessTokenSilently).toHaveBeenCalledWith({
        audience: mockAuth0Config.audience
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/permissions/check', {
        headers: {
          'Authorization': 'Bearer parent-access-token',
          'Content-Type': 'application/json'
        }
      });
    });

    test('should block admin routes for parent users', async () => {
      mockGetAccessTokenSilently.mockResolvedValue('parent-access-token');
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockParentPermissions)
      });

      renderAppWithAuth0({
        isAuthenticated: true,
        user: mockParentUser
      });

      window.history.pushState({}, 'Admin Dashboard', '/admin-dashboard');

      await waitFor(() => {
        expect(screen.getByText(/Access Denied/i)).toBeInTheDocument();
      });

      expect(screen.queryByText(/Admin Dashboard/i)).not.toBeInTheDocument();
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle token acquisition failures gracefully', async () => {
      mockGetAccessTokenSilently.mockRejectedValue(new Error('Token acquisition failed'));

      renderAppWithAuth0({
        isAuthenticated: true,
        user: mockAdminUser
      });

      window.history.pushState({}, 'Admin Dashboard', '/admin-dashboard');

      await waitFor(() => {
        expect(screen.getByText(/Authentication Error/i)).toBeInTheDocument();
      });

      expect(screen.queryByText(/Admin Dashboard/i)).not.toBeInTheDocument();
    });

    test('should handle permission API failures', async () => {
      mockGetAccessTokenSilently.mockResolvedValue('valid-token');
      global.fetch.mockRejectedValue(new Error('Network error'));

      renderAppWithAuth0({
        isAuthenticated: true,
        user: mockAdminUser
      });

      window.history.pushState({}, 'Admin Dashboard', '/admin-dashboard');

      await waitFor(() => {
        expect(screen.getByText(/Permission Check Failed/i)).toBeInTheDocument();
      });
    });

    test('should handle 401 unauthorized responses', async () => {
      mockGetAccessTokenSilently.mockResolvedValue('invalid-token');
      global.fetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Unauthorized' })
      });

      renderAppWithAuth0({
        isAuthenticated: true,
        user: mockAdminUser
      });

      window.history.pushState({}, 'Admin Dashboard', '/admin-dashboard');

      await waitFor(() => {
        expect(screen.getByText(/Session Expired/i)).toBeInTheDocument();
      });

      // Should trigger re-authentication
      expect(mockLoginWithRedirect).toHaveBeenCalled();
    });

    test('should handle 403 forbidden responses', async () => {
      mockGetAccessTokenSilently.mockResolvedValue('valid-token');
      global.fetch.mockResolvedValue({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ error: 'Insufficient permissions' })
      });

      renderAppWithAuth0({
        isAuthenticated: true,
        user: mockParentUser
      });

      window.history.pushState({}, 'Admin Dashboard', '/admin-dashboard');

      await waitFor(() => {
        expect(screen.getByText(/Access Denied/i)).toBeInTheDocument();
      });
    });
  });

  describe('Logout Integration', () => {
    test('should complete full logout flow', async () => {
      // Start with authenticated user
      renderAppWithAuth0({
        isAuthenticated: true,
        user: mockAdminUser
      });

      // Find and click logout button
      const logoutButton = await screen.findByText(/Log Out/i);
      await user.click(logoutButton);

      // Verify logout was called with correct parameters
      expect(mockLogout).toHaveBeenCalledWith({
        returnTo: window.location.origin
      });
    });

    test('should clear authentication state after logout', async () => {
      // Start authenticated, then simulate logout state change
      const { rerender } = renderAppWithAuth0({
        isAuthenticated: true,
        user: mockAdminUser
      });

      // Simulate logout state change
      jest.doMock('@auth0/auth0-react', () => ({
        ...jest.requireActual('@auth0/auth0-react'),
        useAuth0: jest.fn(() => ({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          getAccessTokenSilently: mockGetAccessTokenSilently,
          loginWithRedirect: mockLoginWithRedirect,
          logout: mockLogout
        })),
        Auth0Provider: ({ children }) => children
      }));

      rerender(
        <BrowserRouter>
          <Auth0Provider
            domain={mockAuth0Config.domain}
            clientId={mockAuth0Config.clientId}
            audience={mockAuth0Config.audience}
          >
            <App />
          </Auth0Provider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Log In/i)).toBeInTheDocument();
      });

      expect(screen.queryByText(/Log Out/i)).not.toBeInTheDocument();
    });
  });

  describe('Route Protection Integration', () => {
    test('should properly protect all admin routes', async () => {
      const adminRoutes = [
        '/admin-dashboard',
        '/admin/users',
        '/admin/settings',
        '/admin/reports'
      ];

      for (const route of adminRoutes) {
        renderAppWithAuth0({
          isAuthenticated: false
        });

        window.history.pushState({}, 'Protected Route', route);

        await waitFor(() => {
          expect(screen.getByText(/Please log in/i)).toBeInTheDocument();
        });
      }
    });

    test('should allow access to public routes without authentication', async () => {
      const publicRoutes = [
        '/',
        '/about',
        '/contact'
      ];

      for (const route of publicRoutes) {
        renderAppWithAuth0({
          isAuthenticated: false
        });

        window.history.pushState({}, 'Public Route', route);

        await waitFor(() => {
          expect(screen.queryByText(/Please log in/i)).not.toBeInTheDocument();
        });
      }
    });
  });

  describe('Performance Integration', () => {
    test('should complete authentication flow within acceptable time', async () => {
      const startTime = performance.now();

      mockGetAccessTokenSilently.mockResolvedValue('fast-token');
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockAdminPermissions)
      });

      renderAppWithAuth0({
        isAuthenticated: true,
        user: mockAdminUser
      });

      window.history.pushState({}, 'Admin Dashboard', '/admin-dashboard');

      await waitFor(() => {
        expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within 3 seconds
      expect(duration).toBeLessThan(3000);
    });

    test('should handle concurrent route navigation efficiently', async () => {
      mockGetAccessTokenSilently.mockResolvedValue('concurrent-token');
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockAdminPermissions)
      });

      renderAppWithAuth0({
        isAuthenticated: true,
        user: mockAdminUser
      });

      // Simulate rapid route changes
      const routes = ['/admin-dashboard', '/parent-dashboard', '/admin-dashboard'];
      
      for (const route of routes) {
        act(() => {
          window.history.pushState({}, 'Route', route);
        });
      }

      await waitFor(() => {
        expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
      });

      // Should not have excessive API calls
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('State Synchronization', () => {
    test('should maintain consistent state across components', async () => {
      mockGetAccessTokenSilently.mockResolvedValue('sync-token');
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockAdminPermissions)
      });

      renderAppWithAuth0({
        isAuthenticated: true,
        user: mockAdminUser
      });

      // Check that user info is consistent across the app
      await waitFor(() => {
        expect(screen.getByText(mockAdminUser.name)).toBeInTheDocument();
      });

      window.history.pushState({}, 'Admin Dashboard', '/admin-dashboard');

      await waitFor(() => {
        expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
        // User info should still be present
        expect(screen.getByText(mockAdminUser.name)).toBeInTheDocument();
      });
    });

    test('should handle state updates without causing infinite renders', async () => {
      const renderCount = jest.fn();

      const TestComponent = () => {
        renderCount();
        return <div>Test Component</div>;
      };

      mockGetAccessTokenSilently.mockResolvedValue('stable-token');
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockAdminPermissions)
      });

      render(
        <BrowserRouter>
          <Auth0Provider
            domain={mockAuth0Config.domain}
            clientId={mockAuth0Config.clientId}
            audience={mockAuth0Config.audience}
          >
            <PrivateRoute
              element={<TestComponent />}
              requiredPermissions={['read:dashboard']}
            />
          </Auth0Provider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Component')).toBeInTheDocument();
      });

      // Should not have excessive renders
      expect(renderCount).toHaveBeenCalledTimes(1);
    });
  });
});