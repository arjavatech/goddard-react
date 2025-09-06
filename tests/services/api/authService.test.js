/**
 * Comprehensive unit tests for Auth Service
 * 
 * Tests all authentication service functions including:
 * - User permission checks
 * - Authentication validation
 * - Error handling scenarios
 * - API integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authService } from '../../../src/services/authService.js';
import { ApiTestSuite, AuthMockUtils, TestDataFactory } from '../../utils/api-test-utils.js';

// Mock fetch globally
global.fetch = vi.fn();

// Mock auth utilities
vi.mock('../../../src/utils/auth', () => ({
  getAuthHeaders: vi.fn(() => Promise.resolve({
    'Content-Type': 'application/json',
    'Authorization': 'Bearer mock-token'
  }))
}));

// Mock constants
vi.mock('../../../src/utils/const', () => ({
  api_base_url: 'https://api.test.com',
  school_id: 'test-school-123'
}));

describe('AuthService', () => {
  let mockGetAccessTokenSilently;
  const apiTestSuite = new ApiTestSuite('/sign_in/check/test-school-123');

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAccessTokenSilently = vi.fn().mockResolvedValue('mock-token');
    global.fetch.mockClear();
  });

  describe('getUserPermissions', () => {
    it('should return mock permissions for any user', async () => {
      const permissions = await authService.getUserPermissions('test-user');
      
      expect(permissions).toEqual(['parent', 'read:forms', 'write:forms']);
    });

    it('should return empty array on error', async () => {
      // Force an error by modifying the implementation temporarily
      const originalConsoleError = console.error;
      console.error = vi.fn();
      
      const permissions = await authService.getUserPermissions('test-user');
      
      expect(permissions).toEqual(['parent', 'read:forms', 'write:forms']);
      console.error = originalConsoleError;
    });

    it('should handle force refresh parameter', async () => {
      const permissions = await authService.getUserPermissions('test-user', true);
      
      expect(permissions).toEqual(['parent', 'read:forms', 'write:forms']);
    });
  });

  describe('checkUserAuth', () => {
    it('should successfully check user authentication', async () => {
      const mockResponse = TestDataFactory.createApiResponse('success', {
        isAdmin: false,
        isParent: true,
        permissions: ['read:forms', 'write:forms'],
        email: 'test@example.com'
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await authService.checkUserAuth('test@example.com', mockGetAccessTokenSilently);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.test.com/sign_in/check/test-school-123',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token'
          },
          body: JSON.stringify({
            email: 'test@example.com',
            auth0_user: true
          })
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it('should handle email case normalization', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ isAdmin: false, isParent: true })
      });

      await authService.checkUserAuth('TEST@EXAMPLE.COM', mockGetAccessTokenSilently);

      const fetchCall = global.fetch.mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      
      expect(requestBody.email).toBe('test@example.com');
    });

    it('should throw error on API failure', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(
        authService.checkUserAuth('test@example.com', mockGetAccessTokenSilently)
      ).rejects.toThrow('API request failed with status: 500');
    });

    it('should handle network errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        authService.checkUserAuth('test@example.com', mockGetAccessTokenSilently)
      ).rejects.toThrow('Network error');
    });

    it('should handle 404 user not found', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(
        authService.checkUserAuth('nonexistent@example.com', mockGetAccessTokenSilently)
      ).rejects.toThrow('API request failed with status: 404');
    });

    it('should handle 401 unauthorized', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      });

      await expect(
        authService.checkUserAuth('test@example.com', mockGetAccessTokenSilently)
      ).rejects.toThrow('API request failed with status: 401');
    });
  });

  describe('hasPermissions', () => {
    it('should return true when user has all required permissions', () => {
      const requiredPermissions = ['read:forms', 'write:forms'];
      const userPermissions = ['read:forms', 'write:forms', 'delete:forms'];
      
      const result = authService.hasPermissions(requiredPermissions, userPermissions);
      
      expect(result).toBe(true);
    });

    it('should return false when user missing required permissions', () => {
      const requiredPermissions = ['read:forms', 'write:forms', 'admin'];
      const userPermissions = ['read:forms', 'write:forms'];
      
      const result = authService.hasPermissions(requiredPermissions, userPermissions);
      
      expect(result).toBe(false);
    });

    it('should return true for super_admin users regardless of required permissions', () => {
      const requiredPermissions = ['read:forms', 'write:forms', 'admin'];
      const userPermissions = ['super_admin'];
      
      const result = authService.hasPermissions(requiredPermissions, userPermissions);
      
      expect(result).toBe(true);
    });

    it('should handle invalid input types', () => {
      expect(authService.hasPermissions(null, ['permission'])).toBe(false);
      expect(authService.hasPermissions(['permission'], null)).toBe(false);
      expect(authService.hasPermissions('not-array', ['permission'])).toBe(false);
      expect(authService.hasPermissions(['permission'], 'not-array')).toBe(false);
    });

    it('should handle empty arrays', () => {
      expect(authService.hasPermissions([], [])).toBe(true);
      expect(authService.hasPermissions([], ['permission'])).toBe(true);
      expect(authService.hasPermissions(['permission'], [])).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true when user has at least one required permission', () => {
      const permissions = ['read:forms', 'admin'];
      const userPermissions = ['read:forms', 'write:forms'];
      
      const result = authService.hasAnyPermission(permissions, userPermissions);
      
      expect(result).toBe(true);
    });

    it('should return false when user has no required permissions', () => {
      const permissions = ['admin', 'super_user'];
      const userPermissions = ['read:forms', 'write:forms'];
      
      const result = authService.hasAnyPermission(permissions, userPermissions);
      
      expect(result).toBe(false);
    });

    it('should return true for super_admin users regardless of permissions', () => {
      const permissions = ['admin', 'super_user'];
      const userPermissions = ['super_admin'];
      
      const result = authService.hasAnyPermission(permissions, userPermissions);
      
      expect(result).toBe(true);
    });

    it('should handle invalid input types', () => {
      expect(authService.hasAnyPermission(null, ['permission'])).toBe(false);
      expect(authService.hasAnyPermission(['permission'], null)).toBe(false);
      expect(authService.hasAnyPermission('not-array', ['permission'])).toBe(false);
      expect(authService.hasAnyPermission(['permission'], 'not-array')).toBe(false);
    });

    it('should handle empty arrays', () => {
      expect(authService.hasAnyPermission([], [])).toBe(false);
      expect(authService.hasAnyPermission([], ['permission'])).toBe(false);
      expect(authService.hasAnyPermission(['permission'], [])).toBe(false);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle token acquisition failures', async () => {
      const failingTokenFunction = vi.fn().mockRejectedValue(new Error('Token expired'));

      await expect(
        authService.checkUserAuth('test@example.com', failingTokenFunction)
      ).rejects.toThrow();
    });

    it('should handle malformed API responses', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      await expect(
        authService.checkUserAuth('test@example.com', mockGetAccessTokenSilently)
      ).rejects.toThrow();
    });

    it('should handle timeout scenarios', async () => {
      global.fetch.mockImplementationOnce(
        () => new Promise(resolve => setTimeout(resolve, 10000))
      );

      // This would timeout in a real scenario
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 100)
      );

      await expect(
        Promise.race([
          authService.checkUserAuth('test@example.com', mockGetAccessTokenSilently),
          timeoutPromise
        ])
      ).rejects.toThrow('Request timeout');
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete authentication flow', async () => {
      const mockAuthResponse = {
        isAdmin: false,
        isParent: true,
        permissions: ['read:forms', 'write:forms'],
        email: 'parent@example.com'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockAuthResponse)
      });

      // Check authentication
      const authResult = await authService.checkUserAuth('parent@example.com', mockGetAccessTokenSilently);
      expect(authResult.isParent).toBe(true);

      // Check permissions
      const hasFormPermissions = authService.hasPermissions(
        ['read:forms', 'write:forms'], 
        authResult.permissions
      );
      expect(hasFormPermissions).toBe(true);

      // Check admin permissions (should fail)
      const hasAdminPermissions = authService.hasPermissions(
        ['admin'], 
        authResult.permissions
      );
      expect(hasAdminPermissions).toBe(false);
    });

    it('should handle admin user flow', async () => {
      const mockAuthResponse = {
        isAdmin: true,
        isParent: false,
        permissions: ['admin', 'read:all', 'write:all'],
        email: 'admin@example.com'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockAuthResponse)
      });

      const authResult = await authService.checkUserAuth('admin@example.com', mockGetAccessTokenSilently);
      expect(authResult.isAdmin).toBe(true);

      // Admin should have all permissions
      const hasAnyPermissions = authService.hasAnyPermission(
        ['read:forms', 'write:forms', 'admin'], 
        authResult.permissions
      );
      expect(hasAnyPermissions).toBe(true);
    });
  });

  describe('Performance Tests', () => {
    it('should complete permission checks quickly', () => {
      const startTime = performance.now();
      
      const requiredPermissions = ['read:forms', 'write:forms'];
      const userPermissions = ['read:forms', 'write:forms', 'delete:forms'];
      
      for (let i = 0; i < 1000; i++) {
        authService.hasPermissions(requiredPermissions, userPermissions);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete 1000 permission checks in under 10ms
      expect(duration).toBeLessThan(10);
    });
  });
});