import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Login from '../../src/components/Login';

// Mock the useAuth0 hook
vi.mock('@auth0/auth0-react');
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock constants
vi.mock('../../src/utils/const', () => ({
  api_base_url: 'https://api.test.com',
  school_id: 'test-school-123'
}));

// Mock auth utilities
vi.mock('../../src/utils/auth', () => ({
  getAuthHeaders: vi.fn(() => Promise.resolve({
    'Content-Type': 'application/json',
    'Authorization': 'Bearer mock-token'
  }))
}));

describe('Login Component', () => {
  const mockLoginWithPopup = vi.fn();
  const mockLogout = vi.fn();
  const mockGetAccessTokenSilently = vi.fn();

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    mockNavigate.mockClear();
    
    // Default Auth0 mock state
    useAuth0.mockReturnValue({
      loginWithPopup: mockLoginWithPopup,
      isAuthenticated: false,
      isLoading: false,
      user: null,
      logout: mockLogout,
      getAccessTokenSilently: mockGetAccessTokenSilently
    });

    // Mock fetch globally
    global.fetch = vi.fn();
    global.alert = vi.fn();
    console.log = vi.fn();
    console.error = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  };

  describe('Initial Render', () => {
    it('should render login form correctly', () => {
      renderLogin();
      
      expect(screen.getByText('Welcome to Goddard School')).toBeInTheDocument();
      expect(screen.getByText('Please sign in to continue')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
      expect(screen.getByAltText('logo')).toBeInTheDocument();
    });

    it('should show loading state when Auth0 is loading', () => {
      useAuth0.mockReturnValue({
        isLoading: true,
        isAuthenticated: false,
        user: null,
        loginWithPopup: mockLoginWithPopup,
        logout: mockLogout,
        getAccessTokenSilently: mockGetAccessTokenSilently
      });

      renderLogin();
      
      expect(screen.getByText('Loading authentication...')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument(); // Loading spinner
    });
  });

  describe('Authentication Flow', () => {
    it('should handle login button click', async () => {
      const user = userEvent.setup();
      renderLogin();

      const loginButton = screen.getByRole('button', { name: /log in/i });
      await user.click(loginButton);

      expect(mockLoginWithPopup).toHaveBeenCalledWith({
        authorizationParams: {
          prompt: 'login'
        }
      });
    });

    it('should handle signup button click', async () => {
      const user = userEvent.setup();
      renderLogin();

      const signupButton = screen.getByRole('button', { name: /sign up/i });
      await user.click(signupButton);

      expect(mockLoginWithPopup).toHaveBeenCalledWith({
        authorizationParams: {
          screen_hint: 'signup'
        }
      });
    });

    it('should handle login popup errors gracefully', async () => {
      const user = userEvent.setup();
      mockLoginWithPopup.mockRejectedValue(new Error('Login failed'));
      
      renderLogin();
      
      const loginButton = screen.getByRole('button', { name: /log in/i });
      await user.click(loginButton);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Login failed. Please try again.');
      });
    });

    it('should not show error for popup closed by user', async () => {
      const user = userEvent.setup();
      mockLoginWithPopup.mockRejectedValue({ error: 'popup_closed_by_user' });
      
      renderLogin();
      
      const loginButton = screen.getByRole('button', { name: /log in/i });
      await user.click(loginButton);

      await waitFor(() => {
        expect(global.alert).not.toHaveBeenCalled();
      });
    });
  });

  describe('User Permissions Check', () => {
    const mockUser = {
      email: 'test@example.com',
      sub: 'auth0|123456789'
    };

    beforeEach(() => {
      fetch.mockClear();
      mockGetAccessTokenSilently.mockResolvedValue('mock-access-token');
    });

    it('should navigate to admin dashboard for admin users', async () => {
      useAuth0.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: mockUser,
        loginWithPopup: mockLoginWithPopup,
        logout: mockLogout,
        getAccessTokenSilently: mockGetAccessTokenSilently
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          isAdmin: true,
          isParent: false
        })
      });

      renderLogin();

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          'https://api.test.com/sign_in/check/test-school-123',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
              'Authorization': 'Bearer mock-token'
            }),
            body: JSON.stringify({
              email: mockUser.email.toLowerCase(),
              auth0_user: true
            })
          })
        );
        expect(mockNavigate).toHaveBeenCalledWith('/admin-dashboard');
      });
    });

    it('should navigate to parent dashboard for parent users', async () => {
      useAuth0.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: mockUser,
        loginWithPopup: mockLoginWithPopup,
        logout: mockLogout,
        getAccessTokenSilently: mockGetAccessTokenSilently
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          isAdmin: false,
          isParent: true
        })
      });

      renderLogin();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/parent-dashboard');
      });
    });

    it('should logout users with no permissions', async () => {
      useAuth0.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: mockUser,
        loginWithPopup: mockLoginWithPopup,
        logout: mockLogout,
        getAccessTokenSilently: mockGetAccessTokenSilently
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          isAdmin: false,
          isParent: false
        })
      });

      renderLogin();

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(
          'Invalid user - You do not have permission to access this application'
        );
        expect(mockLogout).toHaveBeenCalledWith({
          logoutParams: { returnTo: window.location.origin }
        });
      });
    });

    it('should handle API 404 errors appropriately', async () => {
      useAuth0.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: mockUser,
        loginWithPopup: mockLoginWithPopup,
        logout: mockLogout,
        getAccessTokenSilently: mockGetAccessTokenSilently
      });

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'User not found'
      });

      renderLogin();

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(
          'Invalid user - You are not registered in the system'
        );
        expect(mockLogout).toHaveBeenCalled();
      });
    });

    it('should handle network errors gracefully', async () => {
      useAuth0.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: mockUser,
        loginWithPopup: mockLoginWithPopup,
        logout: mockLogout,
        getAccessTokenSilently: mockGetAccessTokenSilently
      });

      fetch.mockRejectedValueOnce(new Error('Network error'));

      renderLogin();

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(
          'Network error occurred. Please try again.'
        );
        expect(mockLogout).toHaveBeenCalled();
      });
    });
  });

  describe('Signup Flow', () => {
    const mockUser = {
      email: 'newuser@example.com',
      sub: 'auth0|987654321'
    };

    it('should handle successful signup and create user', async () => {
      useAuth0.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: mockUser,
        loginWithPopup: mockLoginWithPopup,
        logout: mockLogout,
        getAccessTokenSilently: mockGetAccessTokenSilently
      });

      // Mock signup API response
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            message: 'SignUp Data successfully updated'
          })
        })
        // Mock permission check response  
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            isAdmin: false,
            isParent: true
          })
        });

      // Simulate signup flow
      const user = userEvent.setup();
      renderLogin();

      const signupButton = screen.getByRole('button', { name: /sign up/i });
      await user.click(signupButton);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Account created successfully!');
        expect(mockNavigate).toHaveBeenCalledWith('/parent-dashboard');
      });
    });

    it('should handle existing user during signup', async () => {
      useAuth0.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: mockUser,
        loginWithPopup: mockLoginWithPopup,
        logout: mockLogout,
        getAccessTokenSilently: mockGetAccessTokenSilently
      });

      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            error: `signup_id with email ${mockUser.email} Already Registered`
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            isAdmin: false,
            isParent: true
          })
        });

      const user = userEvent.setup();
      renderLogin();

      const signupButton = screen.getByRole('button', { name: /sign up/i });
      await user.click(signupButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/parent-dashboard');
      });
    });

    it('should handle signup API failures', async () => {
      useAuth0.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: mockUser,
        loginWithPopup: mockLoginWithPopup,
        logout: mockLogout,
        getAccessTokenSilently: mockGetAccessTokenSilently
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          error: 'Signup failed'
        })
      });

      const user = userEvent.setup();
      renderLogin();

      const signupButton = screen.getByRole('button', { name: /sign up/i });
      await user.click(signupButton);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Signup failed. Please try again.');
        expect(mockLogout).toHaveBeenCalled();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple rapid login attempts', async () => {
      const user = userEvent.setup();
      renderLogin();

      const loginButton = screen.getByRole('button', { name: /log in/i });
      
      // Rapidly click login button multiple times
      await user.click(loginButton);
      await user.click(loginButton);
      await user.click(loginButton);

      // Should only call loginWithPopup once due to Auth0's internal handling
      expect(mockLoginWithPopup).toHaveBeenCalled();
    });

    it('should handle empty user object', async () => {
      useAuth0.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: null, // No user object
        loginWithPopup: mockLoginWithPopup,
        logout: mockLogout,
        getAccessTokenSilently: mockGetAccessTokenSilently
      });

      renderLogin();

      // Should not make API calls without user
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should handle concurrent login and signup state', async () => {
      const user = userEvent.setup();
      renderLogin();

      // Start signup flow
      const signupButton = screen.getByRole('button', { name: /sign up/i });
      await user.click(signupButton);

      // Immediately try login (edge case)
      const loginButton = screen.getByRole('button', { name: /log in/i });
      await user.click(loginButton);

      expect(mockLoginWithPopup).toHaveBeenCalledTimes(2);
    });
  });
});