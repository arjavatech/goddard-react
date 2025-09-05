import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import LoginNew from '../../src/components/LoginNew';

// Mock dependencies
vi.mock('@auth0/auth0-react');
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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

// Mock toast notifications
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  }
}));

// Mock ForgotPasswordModal
vi.mock('../../src/components/ForgotPasswordModal', () => ({
  default: ({ isOpen, onClose }) => (
    isOpen ? (
      <div data-testid="forgot-password-modal">
        <button onClick={onClose} data-testid="close-modal">Close</button>
      </div>
    ) : null
  )
}));

describe('LoginNew Component', () => {
  const mockLoginWithPopup = vi.fn();
  const mockLogout = vi.fn();
  const mockGetAccessTokenSilently = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    
    useAuth0.mockReturnValue({
      loginWithPopup: mockLoginWithPopup,
      isAuthenticated: false,
      user: null,
      logout: mockLogout,
      getAccessTokenSilently: mockGetAccessTokenSilently
    });

    global.fetch = vi.fn();
    global.setTimeout = vi.fn((cb) => cb());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderLoginNew = () => {
    return render(
      <BrowserRouter>
        <LoginNew />
      </BrowserRouter>
    );
  };

  describe('Initial Render and UI States', () => {
    it('should render Auth0 login by default', () => {
      renderLoginNew();
      
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByText('Sign in to access your dashboard')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in with auth0/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /use email & password/i })).toBeInTheDocument();
      expect(screen.getByAltText('The Goddard School Logo')).toBeInTheDocument();
    });

    it('should toggle to email/password form', async () => {
      const user = userEvent.setup();
      renderLoginNew();

      await user.click(screen.getByRole('button', { name: /use email & password/i }));

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /← back to auth0 login/i })).toBeInTheDocument();
    });

    it('should toggle back to Auth0 login', async () => {
      const user = userEvent.setup();
      renderLoginNew();

      // Switch to email/password
      await user.click(screen.getByRole('button', { name: /use email & password/i }));
      
      // Switch back to Auth0
      await user.click(screen.getByRole('button', { name: /← back to auth0 login/i }));

      expect(screen.getByRole('button', { name: /sign in with auth0/i })).toBeInTheDocument();
      expect(screen.queryByLabelText(/email address/i)).not.toBeInTheDocument();
    });

    it('should show loading state during Auth0 login', async () => {
      const user = userEvent.setup();
      renderLoginNew();

      mockLoginWithPopup.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      const loginButton = screen.getByRole('button', { name: /sign in with auth0/i });
      await user.click(loginButton);

      expect(screen.getByText('Signing In...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
    });
  });

  describe('Auth0 Login Flow', () => {
    it('should handle Auth0 login successfully', async () => {
      const user = userEvent.setup();
      renderLoginNew();

      await user.click(screen.getByRole('button', { name: /sign in with auth0/i }));

      expect(mockLoginWithPopup).toHaveBeenCalledWith({
        authorizationParams: {
          prompt: 'login'
        }
      });
    });

    it('should handle Auth0 login errors', async () => {
      const { toast } = await import('sonner');
      const user = userEvent.setup();
      
      mockLoginWithPopup.mockRejectedValue(new Error('Auth0 error'));
      renderLoginNew();

      await user.click(screen.getByRole('button', { name: /sign in with auth0/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Login failed', {
          description: 'Please try again.',
        });
      });
    });

    it('should not show error for user-cancelled popup', async () => {
      const { toast } = await import('sonner');
      const user = userEvent.setup();
      
      mockLoginWithPopup.mockRejectedValue({ error: 'popup_closed_by_user' });
      renderLoginNew();

      await user.click(screen.getByRole('button', { name: /sign in with auth0/i }));

      await waitFor(() => {
        expect(toast.error).not.toHaveBeenCalled();
      });
    });
  });

  describe('Email/Password Form Validation', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      renderLoginNew();
      await user.click(screen.getByRole('button', { name: /use email & password/i }));
    });

    it('should validate email format', async () => {
      const user = userEvent.setup();
      
      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /sign in$/i });

      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);

      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });

    it('should validate password length', async () => {
      const user = userEvent.setup();
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in$/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, '123'); // Too short
      await user.click(submitButton);

      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });

    it('should validate required fields', async () => {
      const user = userEvent.setup();
      
      const submitButton = screen.getByRole('button', { name: /sign in$/i });
      await user.click(submitButton);

      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    it('should toggle password visibility', async () => {
      const user = userEvent.setup();
      
      const passwordInput = screen.getByLabelText(/password/i);
      const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });

      expect(passwordInput).toHaveAttribute('type', 'password');
      
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');
      
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Deprecated Password Login', () => {
    it('should show deprecation notice for password login', async () => {
      const { toast } = await import('sonner');
      const user = userEvent.setup();
      renderLoginNew();

      // Switch to email/password form
      await user.click(screen.getByRole('button', { name: /use email & password/i }));

      // Fill form and submit
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in$/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Password login deprecated', {
          description: 'Please use the secure Auth0 login button instead.',
        });
      });

      // Should redirect to Auth0 login after delay
      expect(global.setTimeout).toHaveBeenCalled();
    });
  });

  describe('User Permissions and Navigation', () => {
    const mockUser = {
      email: 'test@example.com',
      sub: 'auth0|123456789'
    };

    beforeEach(() => {
      mockGetAccessTokenSilently.mockResolvedValue('mock-access-token');
    });

    it('should navigate admin users to admin dashboard', async () => {
      useAuth0.mockReturnValue({
        loginWithPopup: mockLoginWithPopup,
        isAuthenticated: true,
        user: mockUser,
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

      renderLoginNew();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/admin-dashboard');
      });
    });

    it('should navigate parent users to parent dashboard', async () => {
      useAuth0.mockReturnValue({
        loginWithPopup: mockLoginWithPopup,
        isAuthenticated: true,
        user: mockUser,
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

      renderLoginNew();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/parent-dashboard');
      });
    });

    it('should handle users with no permissions', async () => {
      const { toast } = await import('sonner');
      
      useAuth0.mockReturnValue({
        loginWithPopup: mockLoginWithPopup,
        isAuthenticated: true,
        user: mockUser,
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

      renderLoginNew();

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Access denied', {
          description: 'You do not have permission to access this application.',
        });
        expect(mockLogout).toHaveBeenCalledWith({
          logoutParams: { returnTo: window.location.origin }
        });
      });
    });

    it('should handle API verification failures', async () => {
      const { toast } = await import('sonner');
      
      useAuth0.mockReturnValue({
        loginWithPopup: mockLoginWithPopup,
        isAuthenticated: true,
        user: mockUser,
        logout: mockLogout,
        getAccessTokenSilently: mockGetAccessTokenSilently
      });

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      renderLoginNew();

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Verification failed', {
          description: 'Unable to verify user permissions.',
        });
        expect(mockLogout).toHaveBeenCalled();
      });
    });

    it('should handle network errors during permission check', async () => {
      const { toast } = await import('sonner');
      
      useAuth0.mockReturnValue({
        loginWithPopup: mockLoginWithPopup,
        isAuthenticated: true,
        user: mockUser,
        logout: mockLogout,
        getAccessTokenSilently: mockGetAccessTokenSilently
      });

      fetch.mockRejectedValueOnce(new Error('Network error'));

      renderLoginNew();

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Network error', {
          description: 'Please check your connection and try again.',
        });
      });
    });
  });

  describe('Forgot Password Modal', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      renderLoginNew();
      await user.click(screen.getByRole('button', { name: /use email & password/i }));
    });

    it('should open forgot password modal', async () => {
      const user = userEvent.setup();
      
      await user.click(screen.getByRole('button', { name: /forgot your password/i }));
      
      expect(screen.getByTestId('forgot-password-modal')).toBeInTheDocument();
    });

    it('should close forgot password modal', async () => {
      const user = userEvent.setup();
      
      await user.click(screen.getByRole('button', { name: /forgot your password/i }));
      expect(screen.getByTestId('forgot-password-modal')).toBeInTheDocument();
      
      await user.click(screen.getByTestId('close-modal'));
      expect(screen.queryByTestId('forgot-password-modal')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility and UI Consistency', () => {
    it('should have proper ARIA labels and roles', () => {
      renderLoginNew();
      
      expect(screen.getByRole('button', { name: /sign in with auth0/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /use email & password/i })).toBeInTheDocument();
      expect(screen.getByAltText('The Goddard School Logo')).toBeInTheDocument();
    });

    it('should disable submit buttons when loading', async () => {
      const user = userEvent.setup();
      renderLoginNew();

      mockLoginWithPopup.mockImplementation(() => new Promise(() => {}));
      
      const loginButton = screen.getByRole('button', { name: /sign in with auth0/i });
      await user.click(loginButton);

      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
    });

    it('should maintain consistent styling across states', async () => {
      const user = userEvent.setup();
      renderLoginNew();

      const auth0Button = screen.getByRole('button', { name: /sign in with auth0/i });
      expect(auth0Button).toHaveClass('bg-[#002e4d]');

      await user.click(screen.getByRole('button', { name: /use email & password/i }));
      
      const emailSubmitButton = screen.getByRole('button', { name: /sign in$/i });
      expect(emailSubmitButton).toHaveClass('bg-[#002e4d]');
    });
  });
});