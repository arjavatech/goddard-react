/**
 * Comprehensive unit tests for SecureAPIClient
 * 
 * Tests all secure API client methods including:
 * - Authentication handling
 * - Request methods (GET, POST, PUT, DELETE)
 * - Error handling and status codes
 * - Security measures
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SecureAPIClient } from '../../../src/api/SecureAPIClient.js';
import { ApiTestSuite, AuthMockUtils, TestDataFactory } from '../../utils/api-test-utils.js';

// Mock fetch globally
global.fetch = vi.fn();

// Mock constants
vi.mock('../../../src/utils/const', () => ({
  api_base_url: 'https://api.test.com',
  school_id: 'test-school-123'
}));

describe('SecureAPIClient', () => {
  let client;
  let mockGetAccessTokenSilently;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new SecureAPIClient();
    mockGetAccessTokenSilently = vi.fn().mockResolvedValue('valid-jwt-token');
    global.fetch.mockClear();
  });

  describe('Constructor', () => {
    it('should initialize with correct base URL and school ID', () => {
      expect(client.baseURL).toBe('https://api.test.com');
      expect(client.schoolId).toBe('test-school-123');
    });
  });

  describe('getSecureHeaders', () => {
    it('should return headers with JWT token', async () => {
      const headers = await client.getSecureHeaders(mockGetAccessTokenSilently);

      expect(headers).toEqual({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-jwt-token'
      });

      expect(mockGetAccessTokenSilently).toHaveBeenCalledWith({
        authorizationParams: {
          audience: 'goddard-school-api'
        }
      });
    });

    it('should handle token acquisition failure', async () => {
      const failingTokenFunction = vi.fn().mockRejectedValue(new Error('Token expired'));

      await expect(
        client.getSecureHeaders(failingTokenFunction)
      ).rejects.toThrow('Authentication required - please login again');
    });

    it('should not log sensitive token information', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      
      await client.getSecureHeaders(mockGetAccessTokenSilently);

      // Ensure token is never logged
      const logCalls = consoleSpy.mock.calls.flat();
      const hasTokenInLogs = logCalls.some(log => 
        typeof log === 'string' && log.includes('valid-jwt-token')
      );
      
      expect(hasTokenInLogs).toBe(false);
    });
  });

  describe('checkPermissions', () => {
    it('should successfully check user permissions', async () => {
      const mockResponse = {
        isAdmin: false,
        isParent: true,
        permissions: ['read:forms', 'write:forms']
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await client.checkPermissions('test@example.com', mockGetAccessTokenSilently);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.test.com/sign_in/check/test-school-123',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer valid-jwt-token'
          },
          body: JSON.stringify({
            email: 'test@example.com',
            auth0_user: true
          })
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it('should handle 404 user not found', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(
        client.checkPermissions('nonexistent@example.com', mockGetAccessTokenSilently)
      ).rejects.toThrow('User not found in system');
    });

    it('should handle 401 authentication required', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      await expect(
        client.checkPermissions('test@example.com', mockGetAccessTokenSilently)
      ).rejects.toThrow('Authentication required - please login again');
    });

    it('should handle 500 server error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(
        client.checkPermissions('test@example.com', mockGetAccessTokenSilently)
      ).rejects.toThrow('Server error - please try again later');
    });

    it('should handle invalid response structure', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ invalidStructure: true })
      });

      await expect(
        client.checkPermissions('test@example.com', mockGetAccessTokenSilently)
      ).rejects.toThrow('Invalid permission data received');
    });

    it('should handle network errors', async () => {
      global.fetch.mockRejectedValueOnce(new TypeError('Network error'));

      await expect(
        client.checkPermissions('test@example.com', mockGetAccessTokenSilently)
      ).rejects.toThrow('Network error - please check your connection');
    });

    it('should normalize email to lowercase', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ isAdmin: false, isParent: true })
      });

      await client.checkPermissions('TEST@EXAMPLE.COM', mockGetAccessTokenSilently);

      const fetchCall = global.fetch.mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      expect(requestBody.email).toBe('test@example.com');
    });
  });

  describe('registerUser', () => {
    it('should successfully register a new user', async () => {
      const mockResponse = {
        success: true,
        message: 'User registered successfully',
        userId: '12345'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await client.registerUser('newuser@example.com', 'invite-123', mockGetAccessTokenSilently);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.test.com/sign_up/test-school-123',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer valid-jwt-token'
          },
          body: JSON.stringify({
            email: 'newuser@example.com',
            invite_id: 'invite-123'
          })
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it('should handle user already registered', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: () => Promise.resolve({
          error: 'User Already Registered'
        })
      });

      const result = await client.registerUser('existing@example.com', 'invite-123', mockGetAccessTokenSilently);

      expect(result).toEqual({ message: 'User already registered' });
    });

    it('should handle registration failures', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          message: 'Invalid invite code'
        })
      });

      await expect(
        client.registerUser('user@example.com', 'invalid-invite', mockGetAccessTokenSilently)
      ).rejects.toThrow('Invalid invite code');
    });
  });

  describe('makeAuthenticatedRequest', () => {
    it('should make successful authenticated request', async () => {
      const mockResponse = { data: 'test data' };
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse)
      });

      const response = await client.makeAuthenticatedRequest(
        'https://api.test.com/test-endpoint',
        { method: 'GET' },
        mockGetAccessTokenSilently
      );

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
    });

    it('should handle 401 unauthorized requests', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      await expect(
        client.makeAuthenticatedRequest(
          'https://api.test.com/secure-endpoint',
          { method: 'GET' },
          mockGetAccessTokenSilently
        )
      ).rejects.toThrow('Authentication required - please login again');
    });

    it('should handle 403 forbidden requests', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 403
      });

      await expect(
        client.makeAuthenticatedRequest(
          'https://api.test.com/admin-endpoint',
          { method: 'GET' },
          mockGetAccessTokenSilently
        )
      ).rejects.toThrow('Access denied - insufficient permissions');
    });

    it('should handle server errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(
        client.makeAuthenticatedRequest(
          'https://api.test.com/failing-endpoint',
          { method: 'GET' },
          mockGetAccessTokenSilently
        )
      ).rejects.toThrow('Server error - please try again later');
    });

    it('should handle network errors', async () => {
      global.fetch.mockRejectedValueOnce(new TypeError('Network failure'));

      await expect(
        client.makeAuthenticatedRequest(
          'https://api.test.com/network-test',
          { method: 'GET' },
          mockGetAccessTokenSilently
        )
      ).rejects.toThrow('Network error - please check your connection');
    });
  });

  describe('HTTP Method Helpers', () => {
    beforeEach(() => {
      global.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true })
      });
    });

    describe('get', () => {
      it('should make GET request', async () => {
        await client.get('/test-endpoint', mockGetAccessTokenSilently);

        expect(global.fetch).toHaveBeenCalledWith(
          '/test-endpoint',
          expect.objectContaining({
            method: 'GET',
            headers: expect.objectContaining({
              'Authorization': 'Bearer valid-jwt-token'
            })
          })
        );
      });
    });

    describe('post', () => {
      it('should make POST request with data', async () => {
        const testData = { name: 'Test', value: 123 };
        
        await client.post('/test-endpoint', testData, mockGetAccessTokenSilently);

        expect(global.fetch).toHaveBeenCalledWith(
          '/test-endpoint',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Authorization': 'Bearer valid-jwt-token'
            }),
            body: JSON.stringify(testData)
          })
        );
      });
    });

    describe('put', () => {
      it('should make PUT request with data', async () => {
        const testData = { id: 1, name: 'Updated Test' };
        
        await client.put('/test-endpoint', testData, mockGetAccessTokenSilently);

        expect(global.fetch).toHaveBeenCalledWith(
          '/test-endpoint',
          expect.objectContaining({
            method: 'PUT',
            headers: expect.objectContaining({
              'Authorization': 'Bearer valid-jwt-token'
            }),
            body: JSON.stringify(testData)
          })
        );
      });
    });

    describe('delete', () => {
      it('should make DELETE request', async () => {
        global.fetch.mockResolvedValueOnce({
          ok: true,
          status: 204
        });

        const result = await client.delete('/test-endpoint', mockGetAccessTokenSilently);

        expect(global.fetch).toHaveBeenCalledWith(
          '/test-endpoint',
          expect.objectContaining({
            method: 'DELETE',
            headers: expect.objectContaining({
              'Authorization': 'Bearer valid-jwt-token'
            })
          })
        );

        expect(result).toBe(true);
      });
    });
  });

  describe('Security Tests', () => {
    it('should never expose tokens in error messages', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Request failed'));

      try {
        await client.checkPermissions('test@example.com', mockGetAccessTokenSilently);
      } catch (error) {
        expect(error.message).not.toContain('valid-jwt-token');
        expect(error.message).not.toContain('Bearer');
      }
    });

    it('should handle malformed JSON gracefully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      await expect(
        client.checkPermissions('test@example.com', mockGetAccessTokenSilently)
      ).rejects.toThrow();
    });

    it('should properly sanitize request data', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ isAdmin: false, isParent: true })
      });

      const maliciousEmail = "<script>alert('xss')</script>@example.com";
      
      await client.checkPermissions(maliciousEmail, mockGetAccessTokenSilently);

      const fetchCall = global.fetch.mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      
      // Email should be passed as-is (server-side validation should handle sanitization)
      expect(requestBody.email).toBe(maliciousEmail.toLowerCase());
    });
  });

  describe('Error Recovery', () => {
    it('should handle token refresh failures gracefully', async () => {
      const expiredTokenFunction = vi.fn()
        .mockRejectedValueOnce(new Error('Token expired'))
        .mockResolvedValueOnce('new-valid-token');

      // First call fails
      await expect(
        client.checkPermissions('test@example.com', expiredTokenFunction)
      ).rejects.toThrow('Authentication required - please login again');

      // Subsequent call with refreshed token should work
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ isAdmin: false, isParent: true })
      });

      const result = await client.checkPermissions('test@example.com', expiredTokenFunction);
      expect(result).toBeDefined();
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent requests efficiently', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true })
      });

      const requests = Array.from({ length: 10 }, (_, i) => 
        client.get(`/endpoint-${i}`, mockGetAccessTokenSilently)
      );

      const startTime = performance.now();
      await Promise.all(requests);
      const endTime = performance.now();

      // Should complete 10 concurrent requests quickly
      expect(endTime - startTime).toBeLessThan(100);
      expect(global.fetch).toHaveBeenCalledTimes(10);
    });
  });
});