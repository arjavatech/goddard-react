/**
 * Tests for the error handling utility
 */

import { describe, it, expect, vi } from 'vitest';
import { 
  categorizeError, 
  shouldLogout, 
  getErrorMessage, 
  withRetry, 
  handleApiError,
  ERROR_TYPES 
} from '../../src/utils/errorHandler';

describe('Error Handler Utilities', () => {
  describe('categorizeError', () => {
    it('should categorize network errors correctly', () => {
      const networkError = new Error('Failed to fetch');
      networkError.name = 'NetworkError';
      
      const category = categorizeError(networkError);
      expect(category.type).toBe(ERROR_TYPES.NETWORK);
      expect(category.reason).toBe('connection');
    });

    it('should categorize server errors correctly', () => {
      const response = { status: 500 };
      const error = new Error('Server error');
      
      const category = categorizeError(error, response);
      expect(category.type).toBe(ERROR_TYPES.SERVER);
      expect(category.reason).toBe('server_error');
    });

    it('should categorize auth errors correctly', () => {
      const response = { status: 401 };
      const error = new Error('Unauthorized');
      
      const category = categorizeError(error, response);
      expect(category.type).toBe(ERROR_TYPES.AUTH);
      expect(category.reason).toBe('unauthorized');
    });

    it('should categorize permission errors correctly', () => {
      const response = { status: 403 };
      const error = new Error('Forbidden');
      
      const category = categorizeError(error, response);
      expect(category.type).toBe(ERROR_TYPES.PERMISSION);
      expect(category.reason).toBe('forbidden');
    });
  });

  describe('shouldLogout', () => {
    it('should return true only for auth errors', () => {
      expect(shouldLogout({ type: ERROR_TYPES.AUTH })).toBe(true);
      expect(shouldLogout({ type: ERROR_TYPES.NETWORK })).toBe(false);
      expect(shouldLogout({ type: ERROR_TYPES.SERVER })).toBe(false);
      expect(shouldLogout({ type: ERROR_TYPES.PERMISSION })).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('should return appropriate messages for different error types', () => {
      const networkCategory = { type: ERROR_TYPES.NETWORK, reason: 'connection' };
      const serverCategory = { type: ERROR_TYPES.SERVER, reason: 'server_error' };
      const authCategory = { type: ERROR_TYPES.AUTH, reason: 'unauthorized' };
      
      expect(getErrorMessage(networkCategory)).toContain('Network connection error');
      expect(getErrorMessage(serverCategory)).toContain('temporarily unavailable');
      expect(getErrorMessage(authCategory)).toContain('session has expired');
    });
  });

  describe('withRetry', () => {
    it('should retry network errors', async () => {
      let attempts = 0;
      const mockFn = vi.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          const error = new Error('Failed to fetch');
          error.name = 'NetworkError';
          throw error;
        }
        return 'success';
      });

      const result = await withRetry(mockFn, 'test');
      expect(result).toBe('success');
      expect(attempts).toBe(3);
    }, 10000);

    it('should not retry auth errors more than once', async () => {
      let attempts = 0;
      const mockFn = vi.fn().mockImplementation(() => {
        attempts++;
        const error = new Error('Unauthorized');
        error.status = 401;
        throw error;
      });

      try {
        await withRetry(mockFn, 'test');
      } catch (error) {
        expect(attempts).toBe(2); // 1 initial + 1 retry for auth errors
        expect(error.category.type).toBe(ERROR_TYPES.AUTH);
      }
    });

    it('should not retry permission errors', async () => {
      let attempts = 0;
      const mockFn = vi.fn().mockImplementation(() => {
        attempts++;
        const error = new Error('Forbidden');
        error.status = 403;
        throw error;
      });

      try {
        await withRetry(mockFn, 'test');
      } catch (error) {
        expect(attempts).toBe(1); // No retries for permission errors
        expect(error.category.type).toBe(ERROR_TYPES.PERMISSION);
      }
    });
  });

  describe('handleApiError', () => {
    it('should not trigger logout for server errors', () => {
      const mockLogout = vi.fn();
      const serverError = new Error('Server error');
      serverError.status = 500;
      
      const result = handleApiError(serverError, 'test', {
        showAlert: false,
        onLogoutRequired: mockLogout
      });
      
      expect(result.shouldLogout).toBe(false);
      expect(mockLogout).not.toHaveBeenCalled();
    });

    it('should trigger logout only for auth errors', () => {
      const mockLogout = vi.fn();
      const authError = new Error('Unauthorized');
      authError.status = 401;
      
      const result = handleApiError(authError, 'test', {
        showAlert: false,
        onLogoutRequired: mockLogout
      });
      
      expect(result.shouldLogout).toBe(true);
      expect(mockLogout).toHaveBeenCalled();
    });
  });
});