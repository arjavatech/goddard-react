/**
 * @jest-environment jsdom
 */

import {
  testEndpointAccessibility,
  testCORSPreflight,
  validateTokenFormat,
  performFullDiagnostics,
  generateDiagnosticReport,
  API_ENDPOINTS,
  HTTP_STATUS,
  API_ERROR_MESSAGES
} from '../../src/utils/apiDiagnostics';

// Mock fetch for testing
global.fetch = jest.fn();
global.performance = {
  now: jest.fn(() => Date.now())
};

// Mock btoa for Node.js environment
global.btoa = global.btoa || ((str) => Buffer.from(str).toString('base64'));

describe('API Diagnostics Utility', () => {
  beforeEach(() => {
    fetch.mockClear();
    performance.now.mockClear();
    performance.now
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(100);
  });

  describe('testEndpointAccessibility', () => {
    it('should handle successful API response', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Map([
          ['content-type', 'application/json'],
          ['access-control-allow-origin', '*']
        ]),
        text: jest.fn().mockResolvedValue('{"success": true}')
      };
      
      fetch.mockResolvedValue(mockResponse);

      const result = await testEndpointAccessibility(API_ENDPOINTS.PERMISSION_CHECK, {
        method: 'POST',
        body: { email: 'test@test.com', auth0_user: true }
      });

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
      expect(result.corsEnabled).toBe(true);
      expect(result.responseTime).toBe(100);
      expect(result.response).toEqual({ success: true });
    });

    it('should handle unauthorized response (401)', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        headers: new Map([
          ['content-type', 'application/json']
        ]),
        text: jest.fn().mockResolvedValue('{"detail": "Authorization header is required"}')
      };
      
      fetch.mockResolvedValue(mockResponse);

      const result = await testEndpointAccessibility(API_ENDPOINTS.PERMISSION_CHECK);

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(401);
      expect(result.authRequired).toBe(true);
      expect(result.error).toBe('Missing Authorization header');
    });

    it('should handle token verification failure', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        headers: new Map([
          ['content-type', 'application/json']
        ]),
        text: jest.fn().mockResolvedValue('{"detail": "Token verification failed"}')
      };
      
      fetch.mockResolvedValue(mockResponse);

      const result = await testEndpointAccessibility(API_ENDPOINTS.PERMISSION_CHECK, {
        headers: { 'Authorization': 'Bearer invalid-token' }
      });

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(401);
      expect(result.authRequired).toBe(true);
      expect(result.error).toBe('Invalid or expired token');
    });

    it('should handle network errors', async () => {
      fetch.mockRejectedValue(new TypeError('Failed to fetch'));

      const result = await testEndpointAccessibility(API_ENDPOINTS.PERMISSION_CHECK);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network connection failed or CORS blocked');
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'AbortError';
      fetch.mockRejectedValue(timeoutError);

      const result = await testEndpointAccessibility(API_ENDPOINTS.PERMISSION_CHECK);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Request timeout');
    });
  });

  describe('testCORSPreflight', () => {
    it('should parse CORS headers correctly', async () => {
      const mockResponse = {
        ok: true,
        headers: new Map([
          ['access-control-allow-origin', 'http://localhost:3000'],
          ['access-control-allow-methods', 'DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT'],
          ['access-control-allow-headers', 'Content-Type,Authorization'],
          ['access-control-max-age', '600'],
          ['access-control-allow-credentials', 'true']
        ])
      };
      
      fetch.mockResolvedValue(mockResponse);

      const result = await testCORSPreflight(API_ENDPOINTS.PERMISSION_CHECK);

      expect(result.success).toBe(true);
      expect(result.corsEnabled).toBe(true);
      expect(result.allowedOrigins).toEqual(['http://localhost:3000']);
      expect(result.allowedMethods).toContain('POST');
      expect(result.allowedHeaders).toContain('Authorization');
      expect(result.maxAge).toBe(600);
      expect(result.credentialsAllowed).toBe(true);
    });

    it('should handle CORS preflight failure', async () => {
      fetch.mockRejectedValue(new Error('CORS preflight failed'));

      const result = await testCORSPreflight(API_ENDPOINTS.PERMISSION_CHECK);

      expect(result.success).toBe(false);
      expect(result.corsEnabled).toBe(false);
      expect(result.error).toBe('CORS preflight failed');
    });
  });

  describe('validateTokenFormat', () => {
    it('should validate correct JWT token', () => {
      // Mock JWT: header.payload.signature
      const mockHeader = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
      const mockPayload = btoa(JSON.stringify({ 
        sub: '1234567890', 
        name: 'John Doe', 
        exp: Math.floor(Date.now() / 1000) + 3600 
      }));
      const mockSignature = 'mock_signature';
      const mockToken = `${mockHeader}.${mockPayload}.${mockSignature}`;

      const result = validateTokenFormat(mockToken);

      expect(result.isValid).toBe(true);
      expect(result.format).toBe('JWT');
      expect(result.parts).toBe(3);
      expect(result.header.alg).toBe('RS256');
      expect(result.payload.name).toBe('John Doe');
      expect(result.expired).toBe(false);
    });

    it('should handle Bearer prefix', () => {
      const mockHeader = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
      const mockPayload = btoa(JSON.stringify({ sub: '1234567890' }));
      const mockToken = `Bearer ${mockHeader}.${mockPayload}.signature`;

      const result = validateTokenFormat(mockToken);

      expect(result.isValid).toBe(true);
      expect(result.parts).toBe(3);
    });

    it('should detect expired tokens', () => {
      const mockHeader = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
      const mockPayload = btoa(JSON.stringify({ 
        sub: '1234567890', 
        exp: Math.floor(Date.now() / 1000) - 3600 // Expired 1 hour ago
      }));
      const mockToken = `${mockHeader}.${mockPayload}.signature`;

      const result = validateTokenFormat(mockToken);

      expect(result.isValid).toBe(true);
      expect(result.expired).toBe(true);
    });

    it('should handle invalid token format', () => {
      const result = validateTokenFormat('invalid.token');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('expected 3 parts, got 2');
    });

    it('should handle empty token', () => {
      const result = validateTokenFormat('');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Token is empty or undefined');
    });

    it('should handle malformed JWT payload', () => {
      const mockHeader = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
      const invalidPayload = 'invalid_base64_payload';
      const mockToken = `${mockHeader}.${invalidPayload}.signature`;

      const result = validateTokenFormat(mockToken);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Token decode error');
    });
  });

  describe('generateDiagnosticReport', () => {
    it('should generate a formatted report', () => {
      const mockDiagnostics = {
        timestamp: '2023-09-05T10:00:00.000Z',
        summary: {
          endpointAccessible: true,
          corsConfigured: true,
          authenticationWorking: false,
          overallStatus: 'PARTIAL - Authentication issues'
        },
        tests: {
          basicAccess: {
            success: false,
            statusCode: 401,
            error: 'Missing Authorization header'
          },
          cors: {
            corsEnabled: true,
            allowedOrigins: ['http://localhost:3000']
          }
        }
      };

      const report = generateDiagnosticReport(mockDiagnostics);

      expect(report).toContain('API DIAGNOSTIC REPORT');
      expect(report).toContain('Overall Status: PARTIAL - Authentication issues');
      expect(report).toContain('Endpoint Accessible: true');
      expect(report).toContain('CORS Configured: true');
      expect(report).toContain('Authentication Working: false');
      expect(report).toContain('BASICACCESS');
      expect(report).toContain('CORS');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle non-JSON response', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Map(),
        text: jest.fn().mockResolvedValue('Plain text response')
      };
      
      fetch.mockResolvedValue(mockResponse);

      const result = await testEndpointAccessibility(API_ENDPOINTS.PERMISSION_CHECK);

      expect(result.response).toBe('Plain text response');
      expect(result.success).toBe(true);
    });

    it('should handle response with no headers', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: {
          forEach: jest.fn() // Empty headers
        },
        text: jest.fn().mockResolvedValue('{}')
      };
      
      fetch.mockResolvedValue(mockResponse);

      const result = await testEndpointAccessibility(API_ENDPOINTS.PERMISSION_CHECK);

      expect(result.headers).toEqual({});
      expect(result.corsEnabled).toBe(false);
    });

    it('should handle performance measurement correctly', async () => {
      performance.now
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(1500);

      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Map(),
        text: jest.fn().mockResolvedValue('{}')
      };
      
      fetch.mockResolvedValue(mockResponse);

      const result = await testEndpointAccessibility(API_ENDPOINTS.PERMISSION_CHECK);

      expect(result.responseTime).toBe(500);
    });
  });

  describe('Constants and Configuration', () => {
    it('should have correct API endpoints', () => {
      expect(API_ENDPOINTS.PERMISSION_CHECK).toContain('sign_in/check/1');
      expect(API_ENDPOINTS.PERMISSION_CHECK).toContain('execute-api.ap-south-1.amazonaws.com');
    });

    it('should have correct HTTP status codes', () => {
      expect(HTTP_STATUS.OK).toBe(200);
      expect(HTTP_STATUS.UNAUTHORIZED).toBe(401);
      expect(HTTP_STATUS.FORBIDDEN).toBe(403);
    });

    it('should have correct error messages', () => {
      expect(API_ERROR_MESSAGES.NO_AUTH_HEADER).toBe('Authorization header is required');
      expect(API_ERROR_MESSAGES.TOKEN_VERIFICATION_FAILED).toBe('Token verification failed');
    });
  });
});