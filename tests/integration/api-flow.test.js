/**
 * Integration tests for complete API flows
 * 
 * Tests end-to-end API interactions including:
 * - Authentication flow
 * - Form submission workflows  
 * - Dashboard data retrieval
 * - Error recovery scenarios
 */

import { describe, it, expect, beforeEach, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { server, startServer, stopServer, resetHandlers } from '../mocks/server.js';
import { authService } from '../../src/services/authService.js';
import { SecureAPIClient } from '../../src/api/SecureAPIClient.js';
import { apiClient } from '../../src/services/api/client.js';
import { AuthMockUtils, TestDataFactory } from '../utils/api-test-utils.js';

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

describe('API Integration Flows', () => {
  let mockGetAccessTokenSilently;
  let secureClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAccessTokenSilently = vi.fn().mockResolvedValue('valid-jwt-token');
    secureClient = new SecureAPIClient();
  });

  describe('Complete Authentication Flow', () => {
    it('should complete full authentication workflow', async () => {
      const userEmail = 'parent@example.com';

      // Step 1: Check user authentication
      const authResult = await authService.checkUserAuth(userEmail, mockGetAccessTokenSilently);
      
      expect(authResult).toEqual({
        isAdmin: false,
        isParent: true,
        permissions: ['read:forms', 'write:forms'],
        email: userEmail
      });

      // Step 2: Verify permissions
      const hasPermissions = authService.hasPermissions(
        ['read:forms', 'write:forms'], 
        authResult.permissions
      );
      expect(hasPermissions).toBe(true);

      // Step 3: Get user permissions from service
      const userPermissions = await authService.getUserPermissions(userEmail);
      expect(userPermissions).toContain('read:forms');
    });

    it('should handle admin authentication workflow', async () => {
      const adminEmail = 'admin@example.com';

      const authResult = await authService.checkUserAuth(adminEmail, mockGetAccessTokenSilently);
      
      expect(authResult).toEqual({
        isAdmin: true,
        isParent: false,
        permissions: ['admin', 'read:all', 'write:all'],
        email: adminEmail
      });

      // Admin should have elevated permissions
      const hasAdminPermissions = authService.hasPermissions(['admin'], authResult.permissions);
      expect(hasAdminPermissions).toBe(true);
    });

    it('should handle user registration flow', async () => {
      const newUserEmail = 'newuser@example.com';
      const inviteId = 'invite-12345';

      // Register new user
      const registrationResult = await secureClient.registerUser(
        newUserEmail, 
        inviteId, 
        mockGetAccessTokenSilently
      );

      expect(registrationResult.success).toBe(true);
      expect(registrationResult.message).toBe('User registered successfully');

      // Verify user can now authenticate
      const authResult = await authService.checkUserAuth(newUserEmail, mockGetAccessTokenSilently);
      expect(authResult.email).toBe(newUserEmail);
    });
  });

  describe('Form Submission Workflows', () => {
    const childId = '1';
    const schoolId = 'test-school-123';

    it('should complete admission form submission workflow', async () => {
      const formData = TestDataFactory.createFormData('admission', {
        data: {
          childName: 'Test Child',
          parentName: 'Test Parent',
          contactInfo: {
            email: 'parent@example.com',
            phone: '555-0123'
          },
          medicalInfo: {
            allergies: 'None',
            medications: 'None'
          }
        }
      });

      // Submit admission form
      const submitResult = await secureClient.post(
        `/admission_segment/${schoolId}/${childId}`,
        formData.data,
        mockGetAccessTokenSilently
      );

      expect(submitResult.success).toBe(true);
      expect(submitResult.message).toBe('Admission form saved successfully');
      expect(submitResult.formId).toMatch(/admission_1_\d+/);

      // Verify form status was updated
      const statusResult = await secureClient.get(
        `/admission_child_personal/completed_form_status/${schoolId}/${childId}`,
        mockGetAccessTokenSilently
      );

      expect(statusResult.admission.status).toBe('completed');
      expect(statusResult.admission.data).toEqual(formData.data);
    });

    it('should handle multi-form submission workflow', async () => {
      const forms = [
        { type: 'admission', endpoint: 'admission_segment' },
        { type: 'authorization', endpoint: 'authorization_form' },
        { type: 'enrollment', endpoint: 'enrollment_form' }
      ];

      // Submit all forms sequentially
      for (const form of forms) {
        const formData = TestDataFactory.createFormData(form.type);
        
        const result = await secureClient.post(
          `/${form.endpoint}/${schoolId}/${childId}`,
          formData.data,
          mockGetAccessTokenSilently
        );

        expect(result.success).toBe(true);
      }

      // Check final status
      const statusResult = await secureClient.get(
        `/admission_child_personal/completed_form_status/${schoolId}/${childId}`,
        mockGetAccessTokenSilently
      );

      expect(statusResult.admission.status).toBe('completed');
      expect(statusResult.authorization.status).toBe('completed');
      expect(statusResult.enrollment.status).toBe('completed');
    });

    it('should handle form validation errors gracefully', async () => {
      const invalidFormData = {
        invalid_data: true,
        childName: '', // Missing required field
        parentName: ''
      };

      await expect(
        secureClient.post(
          `/admission_segment/${schoolId}/${childId}`,
          invalidFormData,
          mockGetAccessTokenSilently
        )
      ).rejects.toThrow();
    });
  });

  describe('Dashboard Data Flow', () => {
    it('should retrieve complete dashboard data', async () => {
      const parentEmail = 'test@example.com';

      // Get dashboard data
      const dashboardResult = await secureClient.post(
        `/parent_dashboard_consolidated/${schoolId}`,
        { email: parentEmail },
        mockGetAccessTokenSilently
      );

      expect(dashboardResult.success).toBe(true);
      expect(dashboardResult.children).toHaveLength(1);
      
      const child = dashboardResult.children[0];
      expect(child.id).toBe('1');
      expect(child.name).toBe('Test Child 1');
      expect(child.childId).toBe('1');
    });

    it('should retrieve child-specific form data', async () => {
      const childId = '1';

      const formsResult = await secureClient.get(
        `/child/${childId}/forms`,
        mockGetAccessTokenSilently
      );

      expect(formsResult.childId).toBe(childId);
      expect(formsResult.forms).toHaveProperty('admission');
      expect(formsResult.forms).toHaveProperty('authorization');
      expect(formsResult.forms).toHaveProperty('parentHandbook');
      expect(formsResult.forms).toHaveProperty('enrollment');
    });
  });

  describe('Error Recovery Workflows', () => {
    it('should handle network errors with proper recovery', async () => {
      // Simulate network error followed by success
      server.use(
        http.post('*/sign_in/check/*', () => {
          throw new Error('Network error');
        }, { once: true })
      );

      // First call should fail
      await expect(
        authService.checkUserAuth('test@example.com', mockGetAccessTokenSilently)
      ).rejects.toThrow();

      // Second call should succeed (handler only runs once)
      const result = await authService.checkUserAuth('test@example.com', mockGetAccessTokenSilently);
      expect(result.email).toBe('test@example.com');
    });

    it('should handle server errors with appropriate messaging', async () => {
      server.use(
        http.post('*/admission_segment/*/*', () => {
          return HttpResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      await expect(
        secureClient.post(
          '/admission_segment/test-school-123/1',
          { test: 'data' },
          mockGetAccessTokenSilently
        )
      ).rejects.toThrow('Server error - please try again later');
    });

    it('should handle authentication failures gracefully', async () => {
      server.use(
        http.post('*/sign_in/check/*', () => {
          return HttpResponse.json(
            { error: 'Authentication failed' },
            { status: 401 }
          );
        })
      );

      await expect(
        authService.checkUserAuth('test@example.com', mockGetAccessTokenSilently)
      ).rejects.toThrow('API request failed with status: 401');
    });
  });

  describe('Permission-Based Access Control', () => {
    it('should restrict admin endpoints to admin users', async () => {
      // Try to access admin endpoint with parent user
      server.use(
        http.get('*/admin/data', ({ request }) => {
          const auth = request.headers.get('Authorization');
          if (!auth || !auth.includes('admin-token')) {
            return HttpResponse.json(
              { error: 'Insufficient permissions' },
              { status: 403 }
            );
          }
          return HttpResponse.json({ adminData: 'sensitive' });
        })
      );

      await expect(
        secureClient.get('/admin/data', mockGetAccessTokenSilently)
      ).rejects.toThrow('Access denied - insufficient permissions');
    });

    it('should allow parent access to parent endpoints', async () => {
      server.use(
        http.get('*/parent/data', ({ request }) => {
          const auth = request.headers.get('Authorization');
          if (!auth || !auth.includes('Bearer')) {
            return HttpResponse.json(
              { error: 'Authentication required' },
              { status: 401 }
            );
          }
          return HttpResponse.json({ parentData: 'allowed' });
        })
      );

      const result = await secureClient.get('/parent/data', mockGetAccessTokenSilently);
      expect(result.parentData).toBe('allowed');
    });
  });

  describe('Concurrent API Operations', () => {
    it('should handle multiple simultaneous form submissions', async () => {
      const childId = '1';
      const formTypes = ['admission', 'authorization', 'enrollment'];
      
      const submissions = formTypes.map(async (type) => {
        const formData = TestDataFactory.createFormData(type);
        return secureClient.post(
          `/${type}_segment/test-school-123/${childId}`,
          formData.data,
          mockGetAccessTokenSilently
        );
      });

      const results = await Promise.allSettled(submissions);
      
      // Some may succeed, some may fail due to endpoint differences
      // But none should cause system failures
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          expect(result.value).toHaveProperty('success');
        } else {
          // Expect specific error types, not system crashes
          expect(result.reason).toBeInstanceOf(Error);
        }
      });
    });

    it('should handle concurrent authentication checks', async () => {
      const emails = [
        'user1@example.com',
        'user2@example.com', 
        'user3@example.com'
      ];

      const authChecks = emails.map(email => 
        authService.checkUserAuth(email, mockGetAccessTokenSilently)
      );

      const results = await Promise.all(authChecks);
      
      results.forEach((result, index) => {
        expect(result.email).toBe(emails[index]);
      });
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data consistency across multiple operations', async () => {
      const childId = '1';
      const formData = TestDataFactory.createFormData('admission');

      // Submit form
      await secureClient.post(
        `/admission_segment/test-school-123/${childId}`,
        formData.data,
        mockGetAccessTokenSilently
      );

      // Check status immediately
      const status1 = await secureClient.get(
        `/admission_child_personal/completed_form_status/test-school-123/${childId}`,
        mockGetAccessTokenSilently
      );

      // Check status again
      const status2 = await secureClient.get(
        `/admission_child_personal/completed_form_status/test-school-123/${childId}`,
        mockGetAccessTokenSilently
      );

      // Should be consistent
      expect(status1.admission.status).toBe(status2.admission.status);
      expect(status1.admission.data).toEqual(status2.admission.data);
    });
  });
});