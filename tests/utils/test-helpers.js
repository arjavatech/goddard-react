import { vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Helper to render components with router
export const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

// Helper to create mock Auth0 state
export const createMockAuth0State = (overrides = {}) => ({
  isLoading: false,
  isAuthenticated: false,
  user: null,
  loginWithPopup: vi.fn(),
  logout: vi.fn(),
  getAccessTokenSilently: vi.fn(),
  ...overrides
});

// Helper to create mock user
export const createMockUser = (overrides = {}) => ({
  email: 'test@example.com',
  sub: 'auth0|123456789',
  name: 'Test User',
  ...overrides
});

// Helper to mock successful API response
export const mockApiSuccess = (data) => ({
  ok: true,
  status: 200,
  json: async () => data
});

// Helper to mock API error response  
export const mockApiError = (status = 500, message = 'Server error') => ({
  ok: false,
  status,
  text: async () => message,
  json: async () => ({ error: message })
});

// Helper to wait for async operations
export const waitForAsync = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to create loading state
export const createLoadingState = () => ({
  isLoading: true,
  isAuthenticated: false,
  user: null
});

// Helper to create authenticated state
export const createAuthenticatedState = (user = createMockUser()) => ({
  isLoading: false,
  isAuthenticated: true,
  user
});

// Helper to create unauthenticated state
export const createUnauthenticatedState = () => ({
  isLoading: false,
  isAuthenticated: false,
  user: null
});