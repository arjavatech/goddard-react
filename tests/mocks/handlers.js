/**
 * Mock Service Worker (MSW) handlers for API mocking
 * 
 * This file defines all API route handlers for comprehensive testing.
 * Handlers cover success scenarios, error conditions, and edge cases.
 */

import { http, HttpResponse } from 'msw';

const BASE_URL = 'https://api.test.com';
const SCHOOL_ID = 'test-school-123';

// Mock data store
export const mockData = {
  users: {
    'test@example.com': {
      email: 'test@example.com',
      isAdmin: false,
      isParent: true,
      permissions: ['read:forms', 'write:forms'],
      children: [
        {
          id: '1',
          name: 'Test Child 1',
          status: 'enrolled'
        }
      ]
    },
    'admin@example.com': {
      email: 'admin@example.com',
      isAdmin: true,
      isParent: false,
      permissions: ['admin', 'read:all', 'write:all'],
      children: []
    }
  },
  forms: {
    '1': {
      admission: { status: 'completed', data: {} },
      authorization: { status: 'pending', data: {} },
      parentHandbook: { status: 'not_started', data: {} },
      enrollment: { status: 'in_progress', data: {} }
    }
  },
  dashboard: {
    '1': {
      childId: '1',
      totalForms: 4,
      completedForms: 1,
      pendingForms: 2,
      notStartedForms: 1
    }
  }
};

// Authentication handlers
export const authHandlers = [
  // User authentication check
  http.post(`${BASE_URL}/sign_in/check/:schoolId`, ({ request, params }) => {
    const { schoolId } = params;
    
    if (schoolId !== SCHOOL_ID) {
      return HttpResponse.json({ error: 'School not found' }, { status: 404 });
    }

    return request.json().then((body) => {
      const { email } = body;
      const user = mockData.users[email.toLowerCase()];
      
      if (!user) {
        return HttpResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return HttpResponse.json({
        isAdmin: user.isAdmin,
        isParent: user.isParent,
        permissions: user.permissions,
        email: user.email
      });
    });
  }),

  // User registration
  http.post(`${BASE_URL}/sign_up/:schoolId`, ({ request, params }) => {
    const { schoolId } = params;
    
    if (schoolId !== SCHOOL_ID) {
      return HttpResponse.json({ error: 'School not found' }, { status: 404 });
    }

    return request.json().then((body) => {
      const { email, invite_id } = body;
      
      if (email.includes('exists')) {
        return HttpResponse.json({ 
          error: 'User Already Registered' 
        }, { status: 409 });
      }

      return HttpResponse.json({
        success: true,
        message: 'User registered successfully',
        user: {
          email,
          invite_id
        }
      });
    });
  }),
];

// Form submission handlers
export const formHandlers = [
  // Admission form
  http.post(`${BASE_URL}/admission_segment/:schoolId/:childId`, ({ request, params }) => {
    const { schoolId, childId } = params;
    
    return request.json().then((formData) => {
      // Simulate validation errors
      if (formData.invalid_data) {
        return HttpResponse.json({
          error: 'Validation failed',
          details: ['Required field missing']
        }, { status: 400 });
      }

      // Simulate server error
      if (formData.force_error) {
        return HttpResponse.json({
          error: 'Internal server error'
        }, { status: 500 });
      }

      mockData.forms[childId] = mockData.forms[childId] || {};
      mockData.forms[childId].admission = {
        status: 'completed',
        data: formData,
        timestamp: new Date().toISOString()
      };

      return HttpResponse.json({
        success: true,
        message: 'Admission form saved successfully',
        formId: `admission_${childId}_${Date.now()}`
      });
    });
  }),

  // Authorization form
  http.post(`${BASE_URL}/authorization_form/:schoolId/:childId`, ({ request, params }) => {
    const { schoolId, childId } = params;
    
    return request.json().then((formData) => {
      mockData.forms[childId] = mockData.forms[childId] || {};
      mockData.forms[childId].authorization = {
        status: 'completed',
        data: formData,
        timestamp: new Date().toISOString()
      };

      return HttpResponse.json({
        success: true,
        message: 'Authorization form saved successfully'
      });
    });
  }),

  // Parent handbook
  http.post(`${BASE_URL}/parent_handbook/:schoolId/:childId`, ({ request, params }) => {
    const { schoolId, childId } = params;
    
    return request.json().then((formData) => {
      mockData.forms[childId] = mockData.forms[childId] || {};
      mockData.forms[childId].parentHandbook = {
        status: 'completed',
        data: formData,
        timestamp: new Date().toISOString()
      };

      return HttpResponse.json({
        success: true,
        message: 'Parent handbook saved successfully'
      });
    });
  }),

  // Enrollment form
  http.post(`${BASE_URL}/enrollment_form/:schoolId/:childId`, ({ request, params }) => {
    const { schoolId, childId } = params;
    
    return request.json().then((formData) => {
      mockData.forms[childId] = mockData.forms[childId] || {};
      mockData.forms[childId].enrollment = {
        status: 'completed',
        data: formData,
        timestamp: new Date().toISOString()
      };

      return HttpResponse.json({
        success: true,
        message: 'Enrollment form saved successfully'
      });
    });
  }),

  // Form status check
  http.get(`${BASE_URL}/admission_child_personal/completed_form_status/:schoolId/:childId`, 
    ({ params }) => {
      const { schoolId, childId } = params;
      const childForms = mockData.forms[childId];

      if (!childForms) {
        return HttpResponse.json({
          admission: { status: 'not_started' },
          authorization: { status: 'not_started' },
          parentHandbook: { status: 'not_started' },
          enrollment: { status: 'not_started' }
        });
      }

      return HttpResponse.json(childForms);
    }
  ),
];

// Dashboard handlers
export const dashboardHandlers = [
  // Parent dashboard data
  http.post(`${BASE_URL}/parent_dashboard_consolidated/:schoolId`, ({ request, params }) => {
    const { schoolId } = params;
    
    return request.json().then((body) => {
      const { email } = body;
      const user = mockData.users[email.toLowerCase()];
      
      if (!user) {
        return HttpResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return HttpResponse.json({
        success: true,
        children: user.children.map(child => ({
          ...child,
          ...mockData.dashboard[child.id]
        }))
      });
    });
  }),

  // Child details
  http.get(`${BASE_URL}/child/:childId/forms`, ({ params }) => {
    const { childId } = params;
    const forms = mockData.forms[childId] || {};

    return HttpResponse.json({
      childId,
      forms: {
        admission: forms.admission || { status: 'not_started' },
        authorization: forms.authorization || { status: 'not_started' },
        parentHandbook: forms.parentHandbook || { status: 'not_started' },
        enrollment: forms.enrollment || { status: 'not_started' }
      }
    });
  }),
];

// Error simulation handlers
export const errorHandlers = [
  // Network timeout simulation
  http.get(`${BASE_URL}/timeout`, () => {
    return new Promise(() => {}); // Never resolves
  }),

  // Rate limiting simulation
  http.get(`${BASE_URL}/rate-limit`, () => {
    return HttpResponse.json({
      error: 'Rate limit exceeded'
    }, { 
      status: 429,
      headers: {
        'Retry-After': '60'
      }
    });
  }),

  // 500 server error
  http.get(`${BASE_URL}/server-error`, () => {
    return HttpResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }),

  // Malformed JSON
  http.get(`${BASE_URL}/malformed-json`, () => {
    return new HttpResponse('{ invalid json }', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }),
];

// Permission testing handlers
export const permissionHandlers = [
  // Admin only endpoint
  http.get(`${BASE_URL}/admin/data`, ({ request }) => {
    const auth = request.headers.get('Authorization');
    
    if (!auth || !auth.includes('admin-token')) {
      return HttpResponse.json({
        error: 'Insufficient permissions'
      }, { status: 403 });
    }

    return HttpResponse.json({
      adminData: 'sensitive information'
    });
  }),

  // Parent only endpoint
  http.get(`${BASE_URL}/parent/data`, ({ request }) => {
    const auth = request.headers.get('Authorization');
    
    if (!auth || !auth.includes('Bearer')) {
      return HttpResponse.json({
        error: 'Authentication required'
      }, { status: 401 });
    }

    return HttpResponse.json({
      parentData: 'parent information'
    });
  }),
];

// Performance testing handlers
export const performanceHandlers = [
  // Slow endpoint
  http.get(`${BASE_URL}/slow`, async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return HttpResponse.json({ message: 'Slow response' });
  }),

  // Large payload
  http.get(`${BASE_URL}/large-payload`, () => {
    const largeArray = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      data: `Item ${i}`,
      timestamp: new Date().toISOString()
    }));

    return HttpResponse.json({ items: largeArray });
  }),
];

// Combine all handlers
export const handlers = [
  ...authHandlers,
  ...formHandlers,
  ...dashboardHandlers,
  ...errorHandlers,
  ...permissionHandlers,
  ...performanceHandlers,
];

// Helper functions for test scenarios
export const resetMockData = () => {
  mockData.users = {
    'test@example.com': {
      email: 'test@example.com',
      isAdmin: false,
      isParent: true,
      permissions: ['read:forms', 'write:forms'],
      children: [
        {
          id: '1',
          name: 'Test Child 1',
          status: 'enrolled'
        }
      ]
    }
  };
  mockData.forms = {};
  mockData.dashboard = {};
};

export const addMockUser = (email, userData) => {
  mockData.users[email] = userData;
};

export const addMockForm = (childId, formType, formData) => {
  mockData.forms[childId] = mockData.forms[childId] || {};
  mockData.forms[childId][formType] = formData;
};