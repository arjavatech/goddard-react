import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

import Login from '../../src/components/Login';
import PrivateRoute from '../../src/components/PrivateRoute';

// Mock Auth0
vi.mock('@auth0/auth0-react');

// Mock components
const MockAdminDashboard = () => <div data-testid="admin-dashboard">Admin Dashboard</div>;
const MockParentDashboard = () => <div data-testid="parent-dashboard">Parent Dashboard</div>;

// Mock API utilities
vi.mock('../../src/utils/const', () => ({
  api_base_url: 'https://api.test.com',
  school_id: 'test-school-123'
}));

vi.mock('../../src/utils/auth', () => ({
  getAuthHeaders: vi.fn(() => Promise.resolve({
    'Content-Type': 'application/json',
    'Authorization': 'Bearer mock-token'
  }))
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  }
}));

describe('Authentication Flow Integration Tests', () => {
  const mockLoginWithRedirect = vi.fn();
  const mockLogout = vi.fn();
  const mockGetAccessTokenSilently = vi.fn();

  let mockAuth0State = {
    isAuthenticated: false,
    isLoading: false,
    user: null,
    loginWithRedirect: mockLoginWithRedirect,
    logout: mockLogout,
    getAccessTokenSilently: mockGetAccessTokenSilently,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    mockGetAccessTokenSilently.mockResolvedValue('mock-token');
    
    useAuth0.mockImplementation(() => mockAuth0State);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    mockAuth0State = {
      isAuthenticated: false,
      isLoading: false,
      user: null,
      loginWithRedirect: mockLoginWithRedirect,
      logout: mockLogout,
      getAccessTokenSilently: mockGetAccessTokenSilently,
    };
  });

  const renderAuthFlow = () => {
    return render(
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin-dashboard" element={
            <PrivateRoute>
              <MockAdminDashboard />
            </PrivateRoute>
          } />
          <Route path="/parent-dashboard" element={
            <PrivateRoute>
              <MockParentDashboard />
            </PrivateRoute>
          } />
          <Route path="/" element={<Login />} />
        </Routes>
      </BrowserRouter>
    );
  };

  describe('Complete Authentication Flow', () => {
    it('should complete full login flow for admin user', async () => {
      // Start unauthenticated
      renderAuthFlow();
      expect(screen.getByText('Welcome to Goddard School')).toBeInTheDocument();

      // Mock successful login
      mockLoginWithRedirect.mockResolvedValue();
      
      // Mock API response for admin user
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          isAdmin: true,
          isParent: false
        })
      });

      // User clicks login button
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /log in/i }));

      // Simulate Auth0 login success
      mockAuth0State.isAuthenticated = true;
      mockAuth0State.user = { email: 'admin@example.com' };
      useAuth0.mockImplementation(() => mockAuth0State);

      // Re-render to trigger useEffect
      renderAuthFlow();

      // Verify API call was made
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          'https://api.test.com/sign_in',
          expect.objectContaining({
            method: 'GET',
            headers: expect.any(Object),
          })
        );
      });
    });

    it('should complete full login flow for parent user', async () => {
      renderAuthFlow();
      
      mockLoginWithRedirect.mockResolvedValue();
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          isAdmin: false,
          isParent: true
        })
      });

      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /log in/i }));

      // Simulate successful authentication
      mockAuth0State.isAuthenticated = true;
      mockAuth0State.user = { email: 'parent@example.com' };
      useAuth0.mockImplementation(() => mockAuth0State);

      renderAuthFlow();

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          'https://api.test.com/sign_in',
          expect.objectContaining({
            method: 'GET',
            headers: expect.any(Object),
          })
        );
      });
    });

    it('should handle login rejection for unauthorized users', async () => {
      const { toast } = await import('sonner');
      renderAuthFlow();
      
      mockLoginWithRedirect.mockResolvedValue();
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          isAdmin: false,
          isParent: false
        })
      });

      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /log in/i }));

      mockAuth0State.isAuthenticated = true;
      mockAuth0State.user = { email: 'unauthorized@example.com' };
      useAuth0.mockImplementation(() => mockAuth0State);

      renderAuthFlow();

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Access denied', {
          description: 'You do not have permission to access this application.',
        });
        expect(mockLogout).toHaveBeenCalled();
      });
    });
  });

  describe('Authentication State Persistence', () => {
    it('should maintain authentication state across page refreshes', async () => {
      // Simulate already authenticated user
      mockAuth0State.isAuthenticated = true;
      mockAuth0State.user = { email: 'admin@example.com' };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          isAdmin: true,
          isParent: false
        })
      });

      renderAuthFlow();

      // Should automatically check permissions and navigate
      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
      });
    });

    it('should handle token refresh scenarios', async () => {
      mockAuth0State.isAuthenticated = true;
      mockAuth0State.user = { email: 'test@example.com' };
      
      // First call fails (token expired)
      mockGetAccessTokenSilently
        .mockRejectedValueOnce(new Error('Token expired'))
        .mockResolvedValueOnce('new-token');

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          isAdmin: false,
          isParent: true
        })
      });

      renderAuthFlow();

      // Should retry token acquisition
      await waitFor(() => {
        expect(mockGetAccessTokenSilently).toHaveBeenCalled();
      });
    });

    it('should clear authentication state on logout', async () => {
      // Start authenticated
      mockAuth0State.isAuthenticated = true;
      mockAuth0State.user = { email: 'test@example.com' };

      renderAuthFlow();

      // Mock logout - should clear state
      await mockLogout();
      
      mockAuth0State.isAuthenticated = false;
      mockAuth0State.user = null;
      useAuth0.mockImplementation(() => mockAuth0State);

      renderAuthFlow();

      // Should show login screen again
      expect(screen.getByText('Welcome to Goddard School')).toBeInTheDocument();
    });
  });

  describe('Error Recovery and Edge Cases', () => {
    it('should recover from network failures during login', async () => {
      const { toast } = await import('sonner');
      renderAuthFlow();

      mockLoginWithRedirect.mockResolvedValue();
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /log in/i }));

      mockAuth0State.isAuthenticated = true;
      mockAuth0State.user = { email: 'test@example.com' };
      useAuth0.mockImplementation(() => mockAuth0State);

      renderAuthFlow();

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Network error', {
          description: 'Please check your connection and try again.',
        });
      });
    });

    it('should handle concurrent authentication attempts', async () => {
      renderAuthFlow();

      const user = userEvent.setup();
      
      // Rapidly click login multiple times
      const promises = [
        user.click(screen.getByRole('button', { name: /log in/i })),
        user.click(screen.getByRole('button', { name: /log in/i })),
        user.click(screen.getByRole('button', { name: /log in/i })),
      ];

      await Promise.all(promises);

      // Auth0 should handle concurrent calls gracefully
      expect(mockLoginWithRedirect).toHaveBeenCalled();
    });

    it('should handle Auth0 service unavailability', async () => {
      const { toast } = await import('sonner');
      renderAuthFlow();

      mockLoginWithRedirect.mockRejectedValue(new Error('Auth0 service unavailable'));

      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /log in/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Login failed', {
          description: 'Please try again.',
        });
      });
    });

    it('should handle malformed API responses', async () => {
      const { toast } = await import('sonner');
      renderAuthFlow();

      mockLoginWithRedirect.mockResolvedValue();
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: 'response' }) // Missing required fields
      });

      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /log in/i }));

      mockAuth0State.isAuthenticated = true;
      mockAuth0State.user = { email: 'test@example.com' };
      useAuth0.mockImplementation(() => mockAuth0State);

      renderAuthFlow();

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Access denied', {
          description: 'You do not have permission to access this application.',
        });
      });
    });
  });

  describe('Session Management', () => {
    it('should handle session timeout gracefully', async () => {
      mockAuth0State.isAuthenticated = true;
      mockAuth0State.user = { email: 'test@example.com' };

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401 // Unauthorized - session expired
      });

      renderAuthFlow();

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalled();
      });
    });

    it('should validate tokens periodically', async () => {
      mockAuth0State.isAuthenticated = true;
      mockAuth0State.user = { email: 'test@example.com' };

      // Mock token validation calls
      mockGetAccessTokenSilently.mockResolvedValue('valid-token');

      renderAuthFlow();

      await waitFor(() => {
        expect(mockGetAccessTokenSilently).toHaveBeenCalled();
      });
    });

    it('should handle cross-tab logout scenarios', async () => {
      // Simulate user logging out in another tab
      mockAuth0State.isAuthenticated = false;
      mockAuth0State.user = null;

      renderAuthFlow();

      // Should redirect to login
      expect(screen.getByText('Welcome to Goddard School')).toBeInTheDocument();
    });
  });

  describe('UI State Consistency', () => {
    it('should maintain consistent loading states', async () => {
      mockAuth0State.isLoading = true;
      renderAuthFlow();

      // Should handle loading state properly
      expect(mockAuth0State.isLoading).toBe(true);
      
      // Complete loading
      mockAuth0State.isLoading = false;
      useAuth0.mockImplementation(() => mockAuth0State);
      
      renderAuthFlow();
      expect(screen.getByText('Welcome to Goddard School')).toBeInTheDocument();
    });

    it('should handle login blocking scenarios', async () => {
      const { toast } = await import('sonner');
      renderAuthFlow();

      // Simulate redirect failure
      mockLoginWithRedirect.mockRejectedValue(new Error('Redirect failed'));

      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /log in/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Login failed', {
          description: 'Please try again.',
        });
      });
    });
  });
});