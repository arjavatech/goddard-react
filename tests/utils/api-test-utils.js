/**
 * Advanced API Testing Utilities
 * 
 * Comprehensive utilities for testing API calls, mocking responses,
 * and validating API contracts and error scenarios.
 */

import { vi } from 'vitest';
import { HttpResponse } from 'msw';

/**
 * API Test Suite Builder
 * Creates comprehensive test scenarios for any API endpoint
 */
export class ApiTestSuite {
  constructor(endpoint, baseURL = 'https://api.test.com') {
    this.endpoint = endpoint;
    this.baseURL = baseURL;
    this.fullUrl = endpoint.startsWith('http') ? endpoint : `${baseURL}${endpoint}`;
  }

  /**
   * Create success response mock
   */
  mockSuccess(data, status = 200, headers = {}) {
    return HttpResponse.json(data, { 
      status,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    });
  }

  /**
   * Create error response mock
   */
  mockError(message, status = 500, details = {}) {
    return HttpResponse.json({
      error: message,
      ...details
    }, { status });
  }

  /**
   * Create network error mock
   */
  mockNetworkError() {
    return HttpResponse.error();
  }

  /**
   * Create timeout mock
   */
  mockTimeout(delay = 5000) {
    return new Promise(() => 
      setTimeout(() => HttpResponse.json({ error: 'Timeout' }, { status: 408 }), delay)
    );
  }

  /**
   * Create rate limiting mock
   */
  mockRateLimit(retryAfter = 60) {
    return HttpResponse.json({
      error: 'Rate limit exceeded'
    }, {
      status: 429,
      headers: {
        'Retry-After': retryAfter.toString()
      }
    });
  }

  /**
   * Create malformed response mock
   */
  mockMalformedResponse() {
    return new HttpResponse('{ invalid: json }', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Generate test scenarios for an endpoint
   */
  generateTestScenarios() {
    return {
      success: {
        name: 'should handle successful response',
        mock: this.mockSuccess({ success: true, data: 'test data' }),
        expectedStatus: 200
      },
      serverError: {
        name: 'should handle 500 server error',
        mock: this.mockError('Internal server error', 500),
        expectedStatus: 500
      },
      notFound: {
        name: 'should handle 404 not found',
        mock: this.mockError('Resource not found', 404),
        expectedStatus: 404
      },
      unauthorized: {
        name: 'should handle 401 unauthorized',
        mock: this.mockError('Unauthorized', 401),
        expectedStatus: 401
      },
      forbidden: {
        name: 'should handle 403 forbidden',
        mock: this.mockError('Forbidden', 403),
        expectedStatus: 403
      },
      badRequest: {
        name: 'should handle 400 bad request',
        mock: this.mockError('Bad request', 400, {
          validation: ['Required field missing']
        }),
        expectedStatus: 400
      },
      networkError: {
        name: 'should handle network errors',
        mock: this.mockNetworkError(),
        expectedError: 'Network error'
      },
      rateLimit: {
        name: 'should handle rate limiting',
        mock: this.mockRateLimit(),
        expectedStatus: 429
      },
      malformedResponse: {
        name: 'should handle malformed JSON response',
        mock: this.mockMalformedResponse(),
        expectedError: 'JSON parse error'
      }
    };
  }
}

/**
 * Authentication Mock Utilities
 */
export class AuthMockUtils {
  static createValidToken() {
    return 'valid-jwt-token';
  }

  static createExpiredToken() {
    return 'expired-jwt-token';
  }

  static createMockAuth0Context(overrides = {}) {
    return {
      isLoading: false,
      isAuthenticated: true,
      user: {
        email: 'test@example.com',
        sub: 'auth0|123456',
        name: 'Test User'
      },
      getAccessTokenSilently: vi.fn().mockResolvedValue(this.createValidToken()),
      loginWithPopup: vi.fn(),
      logout: vi.fn(),
      ...overrides
    };
  }

  static createUnauthenticatedContext() {
    return this.createMockAuth0Context({
      isAuthenticated: false,
      user: null,
      getAccessTokenSilently: vi.fn().mockRejectedValue(new Error('Not authenticated'))
    });
  }

  static createLoadingContext() {
    return this.createMockAuth0Context({
      isLoading: true,
      isAuthenticated: false,
      user: null
    });
  }
}

/**
 * API Contract Testing Utilities
 */
export class ApiContractTester {
  constructor(endpoint, schema) {
    this.endpoint = endpoint;
    this.schema = schema;
  }

  /**
   * Validate response against schema
   */
  validateResponse(response, schema = this.schema) {
    const errors = [];

    // Check required fields
    if (schema.required) {
      schema.required.forEach(field => {
        if (!(field in response)) {
          errors.push(`Missing required field: ${field}`);
        }
      });
    }

    // Check field types
    if (schema.properties) {
      Object.entries(schema.properties).forEach(([field, fieldSchema]) => {
        if (field in response) {
          const value = response[field];
          const expectedType = fieldSchema.type;
          
          if (expectedType === 'string' && typeof value !== 'string') {
            errors.push(`Field ${field} should be string, got ${typeof value}`);
          } else if (expectedType === 'number' && typeof value !== 'number') {
            errors.push(`Field ${field} should be number, got ${typeof value}`);
          } else if (expectedType === 'boolean' && typeof value !== 'boolean') {
            errors.push(`Field ${field} should be boolean, got ${typeof value}`);
          } else if (expectedType === 'array' && !Array.isArray(value)) {
            errors.push(`Field ${field} should be array, got ${typeof value}`);
          }
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate contract test cases
   */
  generateContractTests() {
    return {
      validResponse: {
        name: 'should match API contract for valid response',
        validator: (response) => this.validateResponse(response)
      },
      missingFields: {
        name: 'should detect missing required fields',
        validator: (response) => {
          const partialResponse = { ...response };
          if (this.schema.required && this.schema.required.length > 0) {
            delete partialResponse[this.schema.required[0]];
          }
          return this.validateResponse(partialResponse);
        }
      },
      wrongTypes: {
        name: 'should detect wrong field types',
        validator: (response) => {
          const invalidResponse = { ...response };
          if (this.schema.properties) {
            const firstField = Object.keys(this.schema.properties)[0];
            if (firstField) {
              invalidResponse[firstField] = 'wrong-type-value';
            }
          }
          return this.validateResponse(invalidResponse);
        }
      }
    };
  }
}

/**
 * Performance Testing Utilities
 */
export class PerformanceTestUtils {
  static async measureApiCall(apiCall, iterations = 1) {
    const results = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      
      try {
        await apiCall();
        const endTime = performance.now();
        results.push({
          success: true,
          duration: endTime - startTime,
          iteration: i + 1
        });
      } catch (error) {
        const endTime = performance.now();
        results.push({
          success: false,
          duration: endTime - startTime,
          iteration: i + 1,
          error: error.message
        });
      }
    }

    return this.analyzePerformance(results);
  }

  static analyzePerformance(results) {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    if (successful.length === 0) {
      return {
        totalCalls: results.length,
        successRate: 0,
        averageResponseTime: null,
        minResponseTime: null,
        maxResponseTime: null,
        failedCalls: failed.length,
        errors: failed.map(f => f.error)
      };
    }

    const durations = successful.map(r => r.duration);
    
    return {
      totalCalls: results.length,
      successRate: (successful.length / results.length) * 100,
      averageResponseTime: durations.reduce((a, b) => a + b) / durations.length,
      minResponseTime: Math.min(...durations),
      maxResponseTime: Math.max(...durations),
      failedCalls: failed.length,
      errors: failed.map(f => f.error)
    };
  }

  static createPerformanceThresholds() {
    return {
      acceptableResponseTime: 1000, // 1 second
      slowResponseTime: 3000, // 3 seconds
      minimumSuccessRate: 95, // 95%
      maximumErrorRate: 5 // 5%
    };
  }
}

/**
 * Retry and Circuit Breaker Testing
 */
export class RetryTestUtils {
  static createRetryScenarios() {
    return {
      immediateSuccess: {
        name: 'should succeed on first attempt',
        attempts: [{ success: true, data: 'success' }]
      },
      retrySuccess: {
        name: 'should succeed after retry',
        attempts: [
          { success: false, error: 'Network error' },
          { success: true, data: 'success' }
        ]
      },
      maxRetriesExceeded: {
        name: 'should fail after max retries',
        attempts: [
          { success: false, error: 'Error 1' },
          { success: false, error: 'Error 2' },
          { success: false, error: 'Error 3' },
          { success: false, error: 'Final error' }
        ]
      },
      intermittentFailures: {
        name: 'should handle intermittent failures',
        attempts: [
          { success: false, error: 'Temporary error' },
          { success: true, data: 'success' },
          { success: false, error: 'Another error' },
          { success: true, data: 'final success' }
        ]
      }
    };
  }

  static simulateRetryBehavior(attempts, delay = 0) {
    let currentAttempt = 0;
    
    return () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const attempt = attempts[currentAttempt];
          currentAttempt = Math.min(currentAttempt + 1, attempts.length - 1);
          
          if (attempt.success) {
            resolve(attempt.data);
          } else {
            reject(new Error(attempt.error));
          }
        }, delay);
      });
    };
  }
}

/**
 * Data Validation Utilities
 */
export class DataValidationUtils {
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePhoneNumber(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  static validateDate(date) {
    return date instanceof Date && !isNaN(date);
  }

  static sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .trim();
  }

  static validateFormData(data, schema) {
    const errors = [];
    
    // Check required fields
    schema.required?.forEach(field => {
      if (!data[field]) {
        errors.push(`${field} is required`);
      }
    });

    // Validate email fields
    schema.emails?.forEach(field => {
      if (data[field] && !this.validateEmail(data[field])) {
        errors.push(`${field} must be a valid email`);
      }
    });

    // Validate phone fields
    schema.phones?.forEach(field => {
      if (data[field] && !this.validatePhoneNumber(data[field])) {
        errors.push(`${field} must be a valid phone number`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

/**
 * Test Data Factories
 */
export class TestDataFactory {
  static createUser(overrides = {}) {
    return {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      isAdmin: false,
      isParent: true,
      permissions: ['read:forms', 'write:forms'],
      createdAt: new Date().toISOString(),
      ...overrides
    };
  }

  static createChild(overrides = {}) {
    return {
      id: '1',
      name: 'Test Child',
      age: 5,
      parentEmail: 'test@example.com',
      status: 'enrolled',
      enrollmentDate: new Date().toISOString(),
      ...overrides
    };
  }

  static createFormData(type, overrides = {}) {
    const baseForm = {
      id: `${type}_${Date.now()}`,
      type,
      childId: '1',
      status: 'completed',
      submittedAt: new Date().toISOString(),
      data: {}
    };

    switch (type) {
      case 'admission':
        return {
          ...baseForm,
          data: {
            childName: 'Test Child',
            parentName: 'Test Parent',
            contactInfo: {
              email: 'test@example.com',
              phone: '555-0123'
            },
            ...overrides.data
          },
          ...overrides
        };
      
      case 'authorization':
        return {
          ...baseForm,
          data: {
            authorizedPickup: ['Test Parent'],
            emergencyContacts: [
              {
                name: 'Emergency Contact',
                phone: '555-0456',
                relationship: 'Grandparent'
              }
            ],
            ...overrides.data
          },
          ...overrides
        };
      
      default:
        return { ...baseForm, ...overrides };
    }
  }

  static createApiResponse(type, overrides = {}) {
    const responses = {
      success: {
        success: true,
        message: 'Operation completed successfully',
        timestamp: new Date().toISOString()
      },
      error: {
        success: false,
        error: 'Operation failed',
        details: ['Validation error'],
        timestamp: new Date().toISOString()
      },
      validation: {
        success: false,
        error: 'Validation failed',
        details: [
          'Name is required',
          'Email is invalid'
        ],
        timestamp: new Date().toISOString()
      }
    };

    return { ...responses[type], ...overrides };
  }
}

// Export all utilities
export {
  ApiTestSuite,
  AuthMockUtils,
  ApiContractTester,
  PerformanceTestUtils,
  RetryTestUtils,
  DataValidationUtils,
  TestDataFactory
};