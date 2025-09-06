import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './mocks/server.js';

// Setup testing environment
beforeAll(() => {
  // Mock environment variables if needed
  process.env.NODE_ENV = 'test';
  
  // Start MSW server
  server.listen({ onUnhandledRequest: 'error' });
});

// Clean up MSW after all tests
afterAll(() => {
  server.close();
});

// Cleanup after each test
afterEach(() => {
  cleanup();
  if (typeof localStorage !== 'undefined') {
    localStorage.clear();
  }
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.clear();
  }
  
  // Reset MSW handlers to default
  server.resetHandlers();
});

// Mock fetch globally
global.fetch = vi.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
};

// Mock window.alert
global.alert = vi.fn();

// Mock Auth0 (default mock - individual tests can override)
const mockAuth0 = {
  isLoading: false,
  isAuthenticated: false,
  user: null,
  loginWithPopup: vi.fn(),
  logout: vi.fn(),
  getAccessTokenSilently: vi.fn(),
};

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => mockAuth0,
  Auth0Provider: ({ children }) => children,
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    BrowserRouter: ({ children }) => children,
    Routes: ({ children }) => children,
    Route: () => null,
  };
});

// Mock constants
vi.mock('../src/utils/const', () => ({
  api_base_url: 'https://api.test.com',
  school_id: 'test-school-123'
}));

// Mock auth utilities
vi.mock('../src/utils/auth', () => ({
  getAuthHeaders: vi.fn(() => Promise.resolve({
    'Content-Type': 'application/json',
    'Authorization': 'Bearer mock-token'
  }))
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  }
}));

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  if (global.fetch && global.fetch.mockClear) {
    global.fetch.mockClear();
  }
});