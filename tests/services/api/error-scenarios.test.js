/**
 * Comprehensive error scenario testing for API services
 * 
 * Tests all possible error conditions including:
 * - Network failures
 * - Server errors
 * - Authentication failures
 * - Validation errors
 * - Rate limiting
 * - Timeout scenarios
 */

import { describe, it, expect, beforeEach, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server, startServer, stopServer, resetHandlers, addHandlers } from '../../mocks/server.js';
import { authService } from '../../../src/services/authService.js';
import { SecureAPIClient } from '../../../src/api/SecureAPIClient.js';
import { apiClient } from '../../../src/services/api/client.js';
import { ApiTestSuite, TestDataFactory } from '../../utils/api-test-utils.js';

const BASE_URL = 'https://api.test.com';
const SCHOOL_ID = 'test-school-123';

// Start server before all tests
beforeAll(() => {
  startServer();
});

// Reset handlers after each test
afterEach(() => {
  resetHandlers();
});

// Stop server after all tests
afterAll(() => {
  stopServer();
});

describe('API Error Scenarios', () => {
  let mockGetAccessTokenSilently;
  let secureClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAccessTokenSilently = vi.fn().mockResolvedValue('valid-token');
    secureClient = new SecureAPIClient();
  });

  describe('Network Errors', () => {
    it('should handle complete network failure', async () => {
      addHandlers(
        http.post(`${BASE_URL}/sign_in/check/*`, () => {
          return HttpResponse.error();
        })
      );

      await expect(
        authService.checkUserAuth('test@example.com', mockGetAccessTokenSilently)
      ).rejects.toThrow();
    });

    it('should handle DNS resolution failures', async () => {
      addHandlers(
        http.post(`${BASE_URL}/sign_in/check/*`, () => {
          throw new TypeError('Failed to fetch');
        })
      );

      await expect(
        authService.checkUserAuth('test@example.com', mockGetAccessTokenSilently)
      ).rejects.toThrow();
    });

    it('should handle timeout scenarios', async () => {
      addHandlers(
        http.post(`${BASE_URL}/sign_in/check/*`, () => {
          return new Promise(() => {}); // Never resolves (timeout)
        })
      );

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

    it('should handle intermittent connectivity issues', async () => {
      let attemptCount = 0;
      
      addHandlers(
        http.post(`${BASE_URL}/sign_in/check/*`, () => {
          attemptCount++;
          if (attemptCount <= 2) {
            return HttpResponse.error();
          }
          return HttpResponse.json({
            isAdmin: false,
            isParent: true,
            permissions: ['read:forms'],
            email: 'test@example.com'
          });
        })
      );

      // First two calls should fail
      await expect(
        authService.checkUserAuth('test@example.com', mockGetAccessTokenSilently)
      ).rejects.toThrow();

      await expect(
        authService.checkUserAuth('test@example.com', mockGetAccessTokenSilently)
      ).rejects.toThrow();

      // Third call should succeed
      const result = await authService.checkUserAuth('test@example.com', mockGetAccessTokenSilently);
      expect(result.email).toBe('test@example.com');
    });
  });

  describe('HTTP Status Code Errors', () => {
    const statusTests = [
      { code: 400, name: 'Bad Request', expectedError: 'Bad request' },
      { code: 401, name: 'Unauthorized', expectedError: 'Authentication required' },
      { code: 403, name: 'Forbidden', expectedError: 'Access denied' },
      { code: 404, name: 'Not Found', expectedError: 'User not found' },
      { code: 409, name: 'Conflict', expectedError: 'conflict' },
      { code: 429, name: 'Too Many Requests', expectedError: 'Rate limit' },
      { code: 500, name: 'Internal Server Error', expectedError: 'Server error' },
      { code: 502, name: 'Bad Gateway', expectedError: 'Server error' },
      { code: 503, name: 'Service Unavailable', expectedError: 'Server error' },
    ];

    statusTests.forEach(({ code, name, expectedError }) => {
      it(`should handle ${code} ${name} errors`, async () => {
        addHandlers(
          http.post(`${BASE_URL}/sign_in/check/*`, () => {
            return HttpResponse.json(
              { error: `${name} error` },
              { status: code }
            );
          })
        );

        await expect(
          secureClient.checkPermissions('test@example.com', mockGetAccessTokenSilently)
        ).rejects.toThrow(new RegExp(expectedError, 'i'));
      });
    });
  });

  describe('Authentication Errors', () => {
    it('should handle expired tokens', async () => {
      const expiredTokenFunction = vi.fn().mockRejectedValue(new Error('Token expired'));

      await expect(
        authService.checkUserAuth('test@example.com', expiredTokenFunction)
      ).rejects.toThrow('Token expired');
    });

    it('should handle invalid tokens', async () => {
      addHandlers(
        http.post(`${BASE_URL}/sign_in/check/*`, ({ request }) => {
          const auth = request.headers.get('Authorization');
          if (auth && auth.includes('invalid-token')) {
            return HttpResponse.json(
              { error: 'Invalid token' },
              { status: 401 }
            );
          }
          return HttpResponse.json({ isAdmin: false, isParent: true });
        })
      );

      const invalidTokenFunction = vi.fn().mockResolvedValue('invalid-token');

      await expect(
        secureClient.checkPermissions('test@example.com', invalidTokenFunction)
      ).rejects.toThrow('Authentication required');
    });

    it('should handle token refresh failures', async () => {
      let callCount = 0;
      const intermittentTokenFunction = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount <= 2) {
          return Promise.reject(new Error('Token refresh failed'));
        }
        return Promise.resolve('valid-token');
      });

      // First calls should fail
      await expect(
        secureClient.checkPermissions('test@example.com', intermittentTokenFunction)
      ).rejects.toThrow('Authentication required');

      await expect(
        secureClient.checkPermissions('test@example.com', intermittentTokenFunction)
      ).rejects.toThrow('Authentication required');

      // Third call should succeed
      const result = await secureClient.checkPermissions('test@example.com', intermittentTokenFunction);
      expect(result).toBeDefined();
    });

    it('should handle missing authorization headers', async () => {
      addHandlers(
        http.post(`${BASE_URL}/sign_in/check/*`, ({ request }) => {
          const auth = request.headers.get('Authorization');
          if (!auth) {
            return HttpResponse.json(
              { error: 'Authorization header missing' },
              { status: 401 }
            );
          }
          return HttpResponse.json({ isAdmin: false, isParent: true });
        })
      );

      // Mock a token function that provides no token
      const noTokenFunction = vi.fn().mockResolvedValue('');

      await expect(
        secureClient.checkPermissions('test@example.com', noTokenFunction)
      ).rejects.toThrow();
    });
  });

  describe('Data Validation Errors', () => {
    it('should handle server-side validation failures', async () => {
      addHandlers(
        http.post(`${BASE_URL}/admission_segment/*/*`, ({ request }) => {
          return request.json().then((data) => {
            if (!data.childName) {
              return HttpResponse.json({
                error: 'Validation failed',
                details: ['Child name is required']
              }, { status: 400 });
            }
            return HttpResponse.json({ success: true });
          });
        })
      );

      const invalidData = { parentName: 'Test Parent' }; // Missing childName

      await expect(
        secureClient.post('/admission_segment/test-school-123/1', invalidData, mockGetAccessTokenSilently)
      ).rejects.toThrow();
    });

    it('should handle malformed request data', async () => {
      addHandlers(
        http.post(`${BASE_URL}/admission_segment/*/*`, () => {
          return HttpResponse.json({
            error: 'Invalid JSON format'
          }, { status: 400 });
        })
      );

      await expect(
        secureClient.post('/admission_segment/test-school-123/1', null, mockGetAccessTokenSilently)
      ).rejects.toThrow();
    });

    it('should handle oversized payloads', async () => {
      addHandlers(
        http.post(`${BASE_URL}/admission_segment/*/*`, () => {
          return HttpResponse.json({
            error: 'Payload too large'
          }, { status: 413 });
        })
      );

      const oversizedData = {
        largeField: 'x'.repeat(10000000) // Very large string
      };

      await expect(
        secureClient.post('/admission_segment/test-school-123/1', oversizedData, mockGetAccessTokenSilently)
      ).rejects.toThrow();
    });
  });

  describe('Rate Limiting', () => {
    it('should handle rate limit errors with retry-after header', async () => {
      addHandlers(
        http.post(`${BASE_URL}/sign_in/check/*`, () => {
          return HttpResponse.json(
            { error: 'Rate limit exceeded' },
            { 
              status: 429,
              headers: { 'Retry-After': '60' }
            }
          );
        })
      );

      const error = await authService.checkUserAuth('test@example.com', mockGetAccessTokenSilently)
        .catch(e => e);

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain('429');
    });

    it('should handle progressive rate limiting', async () => {
      let requestCount = 0;
      
      addHandlers(
        http.post(`${BASE_URL}/sign_in/check/*`, () => {
          requestCount++;
          
          if (requestCount <= 3) {
            return HttpResponse.json({ isAdmin: false, isParent: true });
          } else if (requestCount <= 6) {
            return HttpResponse.json(
              { error: 'Rate limit exceeded' },
              { status: 429 }
            );
          } else {
            return HttpResponse.json({ isAdmin: false, isParent: true });
          }
        })
      );

      // First 3 requests should succeed
      for (let i = 0; i < 3; i++) {
        const result = await authService.checkUserAuth(`test${i}@example.com`, mockGetAccessTokenSilently);
        expect(result.isParent).toBe(true);
      }

      // Next 3 should fail with rate limit
      for (let i = 3; i < 6; i++) {
        await expect(
          authService.checkUserAuth(`test${i}@example.com`, mockGetAccessTokenSilently)
        ).rejects.toThrow();
      }

      // Should recover after rate limit period
      const result = await authService.checkUserAuth('test6@example.com', mockGetAccessTokenSilently);
      expect(result.isParent).toBe(true);
    });
  });

  describe('Response Format Errors', () => {
    it('should handle malformed JSON responses', async () => {
      addHandlers(
        http.post(`${BASE_URL}/sign_in/check/*`, () => {
          return new HttpResponse('{ invalid: json }', {
            headers: { 'Content-Type': 'application/json' }
          });
        })
      );

      await expect(
        authService.checkUserAuth('test@example.com', mockGetAccessTokenSilently)
      ).rejects.toThrow();
    });

    it('should handle empty responses', async () => {
      addHandlers(
        http.post(`${BASE_URL}/sign_in/check/*`, () => {
          return new HttpResponse('', {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        })
      );

      await expect(
        authService.checkUserAuth('test@example.com', mockGetAccessTokenSilently)
      ).rejects.toThrow();
    });

    it('should handle unexpected response structure', async () => {
      addHandlers(
        http.post(`${BASE_URL}/sign_in/check/*`, () => {
          return HttpResponse.json({
            unexpectedField: 'value',
            // Missing required fields: isAdmin, isParent
          });
        })
      );

      await expect(
        secureClient.checkPermissions('test@example.com', mockGetAccessTokenSilently)
      ).rejects.toThrow('Invalid permission data received');
    });

    it('should handle binary response when JSON expected', async () => {
      addHandlers(
        http.post(`${BASE_URL}/sign_in/check/*`, () => {
          const buffer = new ArrayBuffer(8);
          return new HttpResponse(buffer, {
            headers: { 'Content-Type': 'application/octet-stream' }
          });
        })
      );

      await expect(
        authService.checkUserAuth('test@example.com', mockGetAccessTokenSilently)
      ).rejects.toThrow();
    });
  });

  describe('Server-Side Errors', () => {
    it('should handle database connection failures', async () => {
      addHandlers(
        http.post(`${BASE_URL}/sign_in/check/*`, () => {
          return HttpResponse.json({
            error: 'Database connection failed',
            details: 'Unable to connect to database server'
          }, { status: 503 });
        })
      );

      await expect(
        secureClient.checkPermissions('test@example.com', mockGetAccessTokenSilently)
      ).rejects.toThrow('Server error');
    });

    it('should handle third-party service failures', async () => {
      addHandlers(
        http.post(`${BASE_URL}/sign_in/check/*`, () => {
          return HttpResponse.json({
            error: 'External service unavailable',
            service: 'authentication-provider'
          }, { status: 502 });
        })
      );

      await expect(
        secureClient.checkPermissions('test@example.com', mockGetAccessTokenSilently)
      ).rejects.toThrow('Server error');
    });

    it('should handle server overload scenarios', async () => {
      addHandlers(
        http.post(`${BASE_URL}/sign_in/check/*`, () => {
          return HttpResponse.json({
            error: 'Server overloaded',
            retryAfter: 30
          }, { status: 503 });
        })
      );

      await expect(
        secureClient.checkPermissions('test@example.com', mockGetAccessTokenSilently)
      ).rejects.toThrow('Server error');
    });
  });

  describe('Form Submission Error Scenarios', () => {
    it('should handle form data corruption during transmission', async () => {
      addHandlers(
        http.post(`${BASE_URL}/admission_segment/*/*`, () => {
          return HttpResponse.json({
            error: 'Data corruption detected',
            details: 'Form data appears to be corrupted during transmission'
          }, { status: 400 });
        })
      );

      const formData = TestDataFactory.createFormData('admission');

      await expect(
        secureClient.post('/admission_segment/test-school-123/1', formData.data, mockGetAccessTokenSilently)
      ).rejects.toThrow();
    });

    it('should handle duplicate form submissions', async () => {
      let submissionCount = 0;
      
      addHandlers(
        http.post(`${BASE_URL}/admission_segment/*/*`, () => {
          submissionCount++;
          
          if (submissionCount > 1) {
            return HttpResponse.json({
              error: 'Duplicate submission detected'
            }, { status: 409 });
          }
          
          return HttpResponse.json({ success: true });
        })
      );

      const formData = TestDataFactory.createFormData('admission');

      // First submission should succeed
      const firstResult = await secureClient.post('/admission_segment/test-school-123/1', formData.data, mockGetAccessTokenSilently);
      expect(firstResult.success).toBe(true);

      // Second submission should fail
      await expect(
        secureClient.post('/admission_segment/test-school-123/1', formData.data, mockGetAccessTokenSilently)
      ).rejects.toThrow();
    });

    it('should handle file upload failures in forms', async () => {
      addHandlers(
        http.post(`${BASE_URL}/admission_segment/*/*`, ({ request }) => {
          return request.json().then((data) => {
            if (data.attachments) {
              return HttpResponse.json({
                error: 'File upload failed',
                details: 'Unable to process attached files'
              }, { status: 422 });
            }
            return HttpResponse.json({ success: true });
          });
        })
      );

      const formDataWithFiles = {
        childName: 'Test Child',
        attachments: [
          { name: 'document.pdf', size: 1024000, type: 'application/pdf' }
        ]
      };

      await expect(
        secureClient.post('/admission_segment/test-school-123/1', formDataWithFiles, mockGetAccessTokenSilently)
      ).rejects.toThrow();
    });
  });

  describe('Concurrent Error Scenarios', () => {
    it('should handle simultaneous network failures', async () => {
      addHandlers(
        http.post(`${BASE_URL}/sign_in/check/*`, () => {
          return HttpResponse.error();
        })
      );

      const concurrentRequests = Array.from({ length: 5 }, (_, i) => 
        authService.checkUserAuth(`test${i}@example.com`, mockGetAccessTokenSilently)
          .catch(error => ({ error: error.message, index: i }))
      );

      const results = await Promise.all(concurrentRequests);
      
      // All should have failed
      results.forEach((result, index) => {
        expect(result).toHaveProperty('error');
        expect(result.index).toBe(index);
      });
    });

    it('should handle partial failure scenarios in batch operations', async () => {
      addHandlers(
        http.post(`${BASE_URL}/admission_segment/*/*`, ({ request }) => {
          return request.json().then((data) => {
            if (data.childId === '2') {
              return HttpResponse.json({
                error: 'Child not found'
              }, { status: 404 });
            }
            return HttpResponse.json({ success: true });
          });
        })
      );

      const childIds = ['1', '2', '3'];
      const submissions = childIds.map(childId => 
        secureClient.post(
          `/admission_segment/test-school-123/${childId}`,
          { childId, data: 'test' },
          mockGetAccessTokenSilently
        ).catch(error => ({ error: error.message, childId }))
      );

      const results = await Promise.all(submissions);
      
      // Only child '2' should have failed
      expect(results[0]).toHaveProperty('success');
      expect(results[1]).toHaveProperty('error');
      expect(results[2]).toHaveProperty('success');
    });
  });
});