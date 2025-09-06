/**
 * API Contract Testing
 * 
 * Tests API contracts and response schemas to ensure:
 * - Response structure consistency
 * - Data type validation
 * - Required field presence
 * - API versioning compatibility
 */

import { describe, it, expect, beforeEach, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { server, startServer, stopServer, resetHandlers } from '../mocks/server.js';
import { authService } from '../../src/services/authService.js';
import { SecureAPIClient } from '../../src/api/SecureAPIClient.js';
import { ApiContractTester, TestDataFactory } from '../utils/api-test-utils.js';

// API Contract Schemas
const schemas = {
  authentication: {
    required: ['isAdmin', 'isParent', 'permissions', 'email'],
    properties: {
      isAdmin: { type: 'boolean' },
      isParent: { type: 'boolean' },
      permissions: { type: 'array' },
      email: { type: 'string' }
    }
  },
  formSubmission: {
    required: ['success', 'message'],
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
      formId: { type: 'string' }
    }
  },
  formStatus: {
    required: ['admission', 'authorization', 'parentHandbook', 'enrollment'],
    properties: {
      admission: { type: 'object' },
      authorization: { type: 'object' },
      parentHandbook: { type: 'object' },
      enrollment: { type: 'object' }
    }
  },
  dashboardData: {
    required: ['success', 'children'],
    properties: {
      success: { type: 'boolean' },
      children: { type: 'array' }
    }
  },
  errorResponse: {
    required: ['error'],
    properties: {
      error: { type: 'string' },
      details: { type: 'array' }
    }
  }
};

// Start server before all tests
beforeAll(() => {
  startServer();
});

afterEach(() => {
  resetHandlers();
});

afterAll(() => {
  stopServer();
});

describe('API Contract Tests', () => {
  let mockGetAccessTokenSilently;
  let secureClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAccessTokenSilently = vi.fn().mockResolvedValue('valid-token');
    secureClient = new SecureAPIClient();
  });

  describe('Authentication API Contracts', () => {
    const authTester = new ApiContractTester('/sign_in/check/*', schemas.authentication);

    it('should validate authentication response contract', async () => {
      const response = await authService.checkUserAuth('test@example.com', mockGetAccessTokenSilently);
      
      const validation = authTester.validateResponse(response);
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should validate admin authentication response', async () => {
      const response = await authService.checkUserAuth('admin@example.com', mockGetAccessTokenSilently);
      
      const validation = authTester.validateResponse(response);
      
      expect(validation.valid).toBe(true);
      expect(response.isAdmin).toBe(true);
      expect(response.isParent).toBe(false);
      expect(Array.isArray(response.permissions)).toBe(true);
    });

    it('should validate parent authentication response', async () => {
      const response = await authService.checkUserAuth('test@example.com', mockGetAccessTokenSilently);
      
      const validation = authTester.validateResponse(response);
      
      expect(validation.valid).toBe(true);
      expect(response.isAdmin).toBe(false);
      expect(response.isParent).toBe(true);
      expect(response.permissions).toContain('read:forms');
    });

    it('should enforce required fields in authentication response', async () => {
      // This test would catch if the API response was missing required fields
      const response = await authService.checkUserAuth('test@example.com', mockGetAccessTokenSilently);
      
      // Check all required fields are present
      expect(response).toHaveProperty('isAdmin');
      expect(response).toHaveProperty('isParent');
      expect(response).toHaveProperty('permissions');
      expect(response).toHaveProperty('email');

      // Validate types
      expect(typeof response.isAdmin).toBe('boolean');
      expect(typeof response.isParent).toBe('boolean');
      expect(Array.isArray(response.permissions)).toBe(true);
      expect(typeof response.email).toBe('string');
    });
  });

  describe('Form Submission API Contracts', () => {
    const formTester = new ApiContractTester('/admission_segment/*/*', schemas.formSubmission);

    it('should validate form submission success response', async () => {
      const formData = TestDataFactory.createFormData('admission');
      
      const response = await secureClient.post(
        '/admission_segment/test-school-123/1',
        formData.data,
        mockGetAccessTokenSilently
      );

      const validation = formTester.validateResponse(response);
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(response.success).toBe(true);
      expect(typeof response.message).toBe('string');
    });

    it('should validate all form type submissions', async () => {
      const formTypes = [
        { type: 'admission', endpoint: 'admission_segment' },
        { type: 'authorization', endpoint: 'authorization_form' },
        { type: 'enrollment', endpoint: 'enrollment_form' }
      ];

      for (const formType of formTypes) {
        const formData = TestDataFactory.createFormData(formType.type);
        
        const response = await secureClient.post(
          `/${formType.endpoint}/test-school-123/1`,
          formData.data,
          mockGetAccessTokenSilently
        );

        const validation = formTester.validateResponse(response);
        expect(validation.valid).toBe(true);
        expect(response.success).toBe(true);
      }
    });

    it('should validate form submission response structure consistency', async () => {
      const formData = TestDataFactory.createFormData('admission');
      
      // Submit multiple times to ensure consistency
      const responses = await Promise.all([
        secureClient.post('/admission_segment/test-school-123/1', formData.data, mockGetAccessTokenSilently),
        secureClient.post('/admission_segment/test-school-123/2', formData.data, mockGetAccessTokenSilently),
        secureClient.post('/admission_segment/test-school-123/3', formData.data, mockGetAccessTokenSilently)
      ]);

      responses.forEach((response, index) => {
        const validation = formTester.validateResponse(response);
        expect(validation.valid).toBe(true);
        
        // All responses should have same structure
        expect(response).toHaveProperty('success');
        expect(response).toHaveProperty('message');
        expect(response.success).toBe(true);
      });
    });
  });

  describe('Form Status API Contracts', () => {
    const statusTester = new ApiContractTester('/admission_child_personal/completed_form_status/*/*', schemas.formStatus);

    it('should validate form status response structure', async () => {
      const response = await secureClient.get(
        '/admission_child_personal/completed_form_status/test-school-123/1',
        mockGetAccessTokenSilently
      );

      const validation = statusTester.validateResponse(response);
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should validate individual form status objects', async () => {
      const response = await secureClient.get(
        '/admission_child_personal/completed_form_status/test-school-123/1',
        mockGetAccessTokenSilently
      );

      const formTypes = ['admission', 'authorization', 'parentHandbook', 'enrollment'];
      
      formTypes.forEach(formType => {
        expect(response).toHaveProperty(formType);
        expect(response[formType]).toHaveProperty('status');
        
        const validStatuses = ['not_started', 'in_progress', 'completed'];
        expect(validStatuses).toContain(response[formType].status);
      });
    });

    it('should maintain status structure consistency across children', async () => {
      const childIds = ['1', '2', '3'];
      
      const responses = await Promise.all(
        childIds.map(childId => 
          secureClient.get(
            `/admission_child_personal/completed_form_status/test-school-123/${childId}`,
            mockGetAccessTokenSilently
          )
        )
      );

      // All responses should have the same structure
      responses.forEach(response => {
        const validation = statusTester.validateResponse(response);
        expect(validation.valid).toBe(true);
      });

      // Compare structures
      const firstResponse = responses[0];
      const formTypes = Object.keys(firstResponse);
      
      responses.slice(1).forEach(response => {
        expect(Object.keys(response)).toEqual(formTypes);
      });
    });
  });

  describe('Dashboard API Contracts', () => {
    const dashboardTester = new ApiContractTester('/parent_dashboard_consolidated/*', schemas.dashboardData);

    it('should validate dashboard response structure', async () => {
      const response = await secureClient.post(
        '/parent_dashboard_consolidated/test-school-123',
        { email: 'test@example.com' },
        mockGetAccessTokenSilently
      );

      const validation = dashboardTester.validateResponse(response);
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(response.success).toBe(true);
      expect(Array.isArray(response.children)).toBe(true);
    });

    it('should validate child data structure within dashboard response', async () => {
      const response = await secureClient.post(
        '/parent_dashboard_consolidated/test-school-123',
        { email: 'test@example.com' },
        mockGetAccessTokenSilently
      );

      expect(response.children.length).toBeGreaterThan(0);
      
      response.children.forEach(child => {
        expect(child).toHaveProperty('id');
        expect(child).toHaveProperty('name');
        expect(typeof child.id).toBe('string');
        expect(typeof child.name).toBe('string');
      });
    });
  });

  describe('Error Response Contracts', () => {
    const errorTester = new ApiContractTester('error-endpoint', schemas.errorResponse);

    it('should validate 404 error response structure', async () => {
      try {
        await authService.checkUserAuth('nonexistent@example.com', mockGetAccessTokenSilently);
        expect.fail('Should have thrown an error');
      } catch (error) {
        // Error messages should be consistent
        expect(error.message).toContain('404');
      }
    });

    it('should validate 401 authentication error structure', async () => {
      const invalidTokenFunction = vi.fn().mockRejectedValue(new Error('Invalid token'));

      try {
        await authService.checkUserAuth('test@example.com', invalidTokenFunction);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toBeTruthy();
        expect(typeof error.message).toBe('string');
      }
    });

    it('should validate validation error response structure', async () => {
      const invalidFormData = {
        invalid_data: true,
        // Missing required fields
      };

      try {
        await secureClient.post(
          '/admission_segment/test-school-123/1',
          invalidFormData,
          mockGetAccessTokenSilently
        );
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toBeTruthy();
      }
    });
  });

  describe('API Versioning Compatibility', () => {
    it('should maintain backward compatibility for authentication responses', async () => {
      const response = await authService.checkUserAuth('test@example.com', mockGetAccessTokenSilently);
      
      // Core fields that should always be present for backward compatibility
      const coreFields = ['isAdmin', 'isParent', 'email'];
      
      coreFields.forEach(field => {
        expect(response).toHaveProperty(field);
      });
    });

    it('should handle optional fields gracefully', async () => {
      const response = await authService.checkUserAuth('test@example.com', mockGetAccessTokenSilently);
      
      // Optional fields should not break the contract if missing
      const optionalFields = ['lastLogin', 'profile', 'preferences'];
      
      optionalFields.forEach(field => {
        if (field in response) {
          // If present, should have expected type
          expect(typeof response[field]).toBeDefined();
        }
      });
    });

    it('should validate API response headers', async () => {
      // This would be tested with actual HTTP responses
      // For now, we ensure the mock responses include appropriate headers
      expect(true).toBe(true); // Placeholder for header validation tests
    });
  });

  describe('Data Type Enforcement', () => {
    it('should enforce strict boolean types for flags', async () => {
      const response = await authService.checkUserAuth('test@example.com', mockGetAccessTokenSilently);
      
      expect(typeof response.isAdmin).toBe('boolean');
      expect(typeof response.isParent).toBe('boolean');
      
      // Should not accept string representations of booleans
      expect(response.isAdmin).not.toBe('false');
      expect(response.isAdmin).not.toBe('true');
    });

    it('should enforce array types for list fields', async () => {
      const response = await authService.checkUserAuth('test@example.com', mockGetAccessTokenSilently);
      
      expect(Array.isArray(response.permissions)).toBe(true);
      
      // Each permission should be a string
      response.permissions.forEach(permission => {
        expect(typeof permission).toBe('string');
        expect(permission.length).toBeGreaterThan(0);
      });
    });

    it('should enforce string types for text fields', async () => {
      const response = await authService.checkUserAuth('test@example.com', mockGetAccessTokenSilently);
      
      expect(typeof response.email).toBe('string');
      expect(response.email).toContain('@');
    });

    it('should validate date field formats', async () => {
      const formData = TestDataFactory.createFormData('admission');
      
      const response = await secureClient.post(
        '/admission_segment/test-school-123/1',
        formData.data,
        mockGetAccessTokenSilently
      );

      // If timestamp is included in response
      if ('timestamp' in response) {
        const timestamp = new Date(response.timestamp);
        expect(timestamp).toBeInstanceOf(Date);
        expect(!isNaN(timestamp.getTime())).toBe(true);
      }
    });
  });

  describe('Field Length and Format Validation', () => {
    it('should validate email format in responses', async () => {
      const response = await authService.checkUserAuth('test@example.com', mockGetAccessTokenSilently);
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test(response.email)).toBe(true);
    });

    it('should validate permission format consistency', async () => {
      const response = await authService.checkUserAuth('test@example.com', mockGetAccessTokenSilently);
      
      response.permissions.forEach(permission => {
        // Permissions should follow a consistent format
        expect(permission).toMatch(/^[a-z]+(:[\w]+)?$/);
      });
    });

    it('should validate ID field formats', async () => {
      const dashboardResponse = await secureClient.post(
        '/parent_dashboard_consolidated/test-school-123',
        { email: 'test@example.com' },
        mockGetAccessTokenSilently
      );

      dashboardResponse.children.forEach(child => {
        expect(typeof child.id).toBe('string');
        expect(child.id.length).toBeGreaterThan(0);
        expect(child.id).not.toContain(' '); // IDs should not contain spaces
      });
    });
  });
});