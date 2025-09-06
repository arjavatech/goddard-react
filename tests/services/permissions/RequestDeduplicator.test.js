/**
 * RequestDeduplicator Tests
 * 
 * Comprehensive test suite for the RequestDeduplicator implementation
 */

import { vi, describe, test, beforeEach, afterEach, expect } from 'vitest';
import { RequestDeduplicator } from '../../../src/services/permissions/RequestDeduplicator.js';

describe('RequestDeduplicator', () => {
  let deduplicator;

  beforeEach(() => {
    deduplicator = new RequestDeduplicator({ timeout: 1000 });
  });

  afterEach(() => {
    if (deduplicator) {
      deduplicator.destroy();
    }
  });

  describe('Basic Operations', () => {
    test('should deduplicate identical requests', async () => {
      let callCount = 0;
      const mockRequest = vi.fn(() => {
        callCount++;
        return Promise.resolve(`result-${callCount}`);
      });

      // Make multiple concurrent requests with the same key
      const promises = [
        deduplicator.deduplicate('test-key', mockRequest),
        deduplicator.deduplicate('test-key', mockRequest),
        deduplicator.deduplicate('test-key', mockRequest)
      ];

      const results = await Promise.all(promises);

      // Only one actual request should be made
      expect(mockRequest).toHaveBeenCalledTimes(1);
      
      // All requests should get the same result
      expect(results[0]).toBe('result-1');
      expect(results[1]).toBe('result-1');
      expect(results[2]).toBe('result-1');
      
      // Statistics should reflect deduplication
      const stats = deduplicator.getStats();
      expect(stats.deduplicatedRequests).toBe(2);
      expect(stats.completedRequests).toBe(1);
    });

    test('should handle different keys separately', async () => {
      const mockRequest1 = vi.fn(() => Promise.resolve('result1'));
      const mockRequest2 = vi.fn(() => Promise.resolve('result2'));

      const results = await Promise.all([
        deduplicator.deduplicate('key1', mockRequest1),
        deduplicator.deduplicate('key2', mockRequest2)
      ]);

      expect(mockRequest1).toHaveBeenCalledTimes(1);
      expect(mockRequest2).toHaveBeenCalledTimes(1);
      expect(results[0]).toBe('result1');
      expect(results[1]).toBe('result2');
    });

    test('should handle sequential requests with same key', async () => {
      let callCount = 0;
      const mockRequest = vi.fn(() => {
        callCount++;
        return Promise.resolve(`result-${callCount}`);
      });

      // First request
      const result1 = await deduplicator.deduplicate('test-key', mockRequest);
      
      // Second request (should not be deduplicated since first completed)
      const result2 = await deduplicator.deduplicate('test-key', mockRequest);

      expect(mockRequest).toHaveBeenCalledTimes(2);
      expect(result1).toBe('result-1');
      expect(result2).toBe('result-2');
    });
  });

  describe('Error Handling', () => {
    test('should propagate errors to all waiting requests', async () => {
      const testError = new Error('Test error');
      const mockRequest = vi.fn(() => Promise.reject(testError));

      const promises = [
        deduplicator.deduplicate('error-key', mockRequest),
        deduplicator.deduplicate('error-key', mockRequest),
        deduplicator.deduplicate('error-key', mockRequest)
      ];

      // All should reject with the same error
      await expect(Promise.all(promises)).rejects.toThrow('Test error');
      
      expect(mockRequest).toHaveBeenCalledTimes(1);
      
      const stats = deduplicator.getStats();
      expect(stats.failedRequests).toBe(1);
      expect(stats.deduplicatedRequests).toBe(2);
    });

    test('should handle request validation errors', async () => {
      await expect(
        deduplicator.deduplicate('', () => Promise.resolve())
      ).rejects.toThrow('Key must be a non-empty string');

      await expect(
        deduplicator.deduplicate('key', null)
      ).rejects.toThrow('requestFn must be a function');

      await expect(
        deduplicator.deduplicate(null, () => Promise.resolve())
      ).rejects.toThrow('Key must be a non-empty string');
    });
  });

  describe('Timeout Handling', () => {
    test('should timeout long-running requests', async () => {
      const slowRequest = () => new Promise(resolve => 
        setTimeout(() => resolve('slow-result'), 2000)
      );

      await expect(
        deduplicator.deduplicate('timeout-key', slowRequest)
      ).rejects.toThrow('Request timeout');

      const stats = deduplicator.getStats();
      expect(stats.timeouts).toBe(1);
    });

    test('should use custom timeout per request', async () => {
      const slowRequest = () => new Promise(resolve => 
        setTimeout(() => resolve('result'), 200)
      );

      // Should timeout with custom 100ms timeout
      await expect(
        deduplicator.deduplicate('custom-timeout', slowRequest, { timeout: 100 })
      ).rejects.toThrow('Request timeout');

      const stats = deduplicator.getStats();
      expect(stats.timeouts).toBe(1);
    });
  });

  describe('Cancellation', () => {
    test('should cancel pending requests', async () => {
      const slowRequest = () => new Promise(resolve => 
        setTimeout(() => resolve('result'), 500)
      );

      const promise = deduplicator.deduplicate('cancel-key', slowRequest);
      
      // Cancel after a short delay
      setTimeout(() => deduplicator.cancel('cancel-key'), 100);

      await expect(promise).rejects.toThrow('Request was cancelled');

      const stats = deduplicator.getStats();
      expect(stats.cancelled).toBe(1);
    });

    test('should handle external abort signals', async () => {
      const abortController = new AbortController();
      const mockRequest = vi.fn((signal) => {
        return new Promise((resolve, reject) => {
          signal.addEventListener('abort', () => {
            reject(new DOMException('Request was aborted', 'AbortError'));
          });
          setTimeout(() => resolve('result'), 500);
        });
      });

      const promise = deduplicator.deduplicate(
        'abort-key', 
        mockRequest, 
        { signal: abortController.signal }
      );

      // Abort the request
      setTimeout(() => abortController.abort(), 100);

      await expect(promise).rejects.toThrow('Request was aborted');
    });

    test('should handle already aborted signals', async () => {
      const abortController = new AbortController();
      abortController.abort();

      const mockRequest = vi.fn();

      await expect(
        deduplicator.deduplicate(
          'aborted-key',
          mockRequest,
          { signal: abortController.signal }
        )
      ).rejects.toThrow('Request was aborted');

      expect(mockRequest).not.toHaveBeenCalled();
    });

    test('should cancel all pending requests', async () => {
      const slowRequest = () => new Promise(resolve => 
        setTimeout(() => resolve('result'), 500)
      );

      const promises = [
        deduplicator.deduplicate('key1', slowRequest),
        deduplicator.deduplicate('key2', slowRequest),
        deduplicator.deduplicate('key3', slowRequest)
      ];

      // Cancel all after delay
      setTimeout(() => deduplicator.cancelAll(), 100);

      const results = await Promise.allSettled(promises);
      
      results.forEach(result => {
        expect(result.status).toBe('rejected');
        expect(result.reason.message).toBe('Request was cancelled');
      });

      const stats = deduplicator.getStats();
      expect(stats.cancelled).toBe(3);
    });
  });

  describe('Concurrency Limits', () => {
    test('should enforce maximum concurrent request limit', async () => {
      const limitedDeduplicator = new RequestDeduplicator({ maxConcurrent: 2 });
      
      const slowRequest = () => new Promise(resolve => 
        setTimeout(() => resolve('result'), 200)
      );

      const promises = [
        limitedDeduplicator.deduplicate('key1', slowRequest),
        limitedDeduplicator.deduplicate('key2', slowRequest)
      ];

      // Third request should be rejected due to limit
      await expect(
        limitedDeduplicator.deduplicate('key3', slowRequest)
      ).rejects.toThrow('Maximum concurrent requests (2) exceeded');

      // Wait for existing requests to complete
      await Promise.all(promises);

      limitedDeduplicator.destroy();
    });
  });

  describe('Statistics and Monitoring', () => {
    test('should track comprehensive statistics', async () => {
      const mockRequest = vi.fn(() => Promise.resolve('result'));
      const errorRequest = vi.fn(() => Promise.reject(new Error('test')));

      // Successful deduplication
      await Promise.all([
        deduplicator.deduplicate('success1', mockRequest),
        deduplicator.deduplicate('success1', mockRequest), // deduped
        deduplicator.deduplicate('success1', mockRequest)  // deduped
      ]);

      // Failed request
      try {
        await deduplicator.deduplicate('error1', errorRequest);
      } catch (e) {
        // Expected
      }

      const stats = deduplicator.getStats();
      
      expect(stats.completedRequests).toBe(1);
      expect(stats.failedRequests).toBe(1);
      expect(stats.deduplicatedRequests).toBe(2);
      expect(stats.deduplicationRate).toBe('66.67%');
    });

    test('should provide pending request details', async () => {
      const slowRequest = () => new Promise(resolve => 
        setTimeout(() => resolve('result'), 500)
      );

      // Start some requests
      deduplicator.deduplicate('pending1', slowRequest);
      deduplicator.deduplicate('pending2', slowRequest);
      
      const details = deduplicator.getPendingDetails();
      
      expect(details).toHaveLength(2);
      expect(details[0]).toHaveProperty('key');
      expect(details[0]).toHaveProperty('waitingCallers');
      expect(details[0]).toHaveProperty('duration');
      expect(details[0]).toHaveProperty('startTime');

      // Cancel to cleanup
      deduplicator.cancelAll();
    });

    test('should track pending request keys', () => {
      const slowRequest = () => new Promise(resolve => 
        setTimeout(() => resolve('result'), 500)
      );

      deduplicator.deduplicate('pending1', slowRequest);
      deduplicator.deduplicate('pending2', slowRequest);
      
      const keys = deduplicator.getPendingKeys();
      expect(keys).toEqual(expect.arrayContaining(['pending1', 'pending2']));
      
      expect(deduplicator.isPending('pending1')).toBe(true);
      expect(deduplicator.isPending('nonexistent')).toBe(false);

      deduplicator.cancelAll();
    });
  });

  describe('Utility Methods', () => {
    test('should create bound deduplicator with prefix', async () => {
      const boundDedup = deduplicator.createBoundDeduplicator('test-prefix');
      const mockRequest = vi.fn(() => Promise.resolve('result'));

      await boundDedup('key1', mockRequest);
      
      // Should use prefixed key internally
      expect(deduplicator.isPending('test-prefix:key1')).toBe(false); // completed
      expect(mockRequest).toHaveBeenCalledTimes(1);
    });

    test('should clear all pending requests', () => {
      const slowRequest = () => new Promise(resolve => 
        setTimeout(() => resolve('result'), 500)
      );

      deduplicator.deduplicate('key1', slowRequest);
      deduplicator.deduplicate('key2', slowRequest);
      
      expect(deduplicator.getPendingKeys()).toHaveLength(2);
      
      deduplicator.clear();
      
      expect(deduplicator.getPendingKeys()).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    test('should handle requests that resolve immediately', async () => {
      const immediateRequest = () => Promise.resolve('immediate');

      const results = await Promise.all([
        deduplicator.deduplicate('immediate', immediateRequest),
        deduplicator.deduplicate('immediate', immediateRequest)
      ]);

      expect(results[0]).toBe('immediate');
      expect(results[1]).toBe('immediate');
    });

    test('should handle requests that reject immediately', async () => {
      const immediateError = () => Promise.reject(new Error('immediate error'));

      const promises = [
        deduplicator.deduplicate('immediate-error', immediateError),
        deduplicator.deduplicate('immediate-error', immediateError)
      ];

      await expect(Promise.all(promises)).rejects.toThrow('immediate error');
    });

    test('should handle complex request functions', async () => {
      const complexRequest = async (signal) => {
        // Simulate some async work
        await new Promise(resolve => setTimeout(resolve, 50));
        
        if (signal?.aborted) {
          throw new DOMException('Aborted', 'AbortError');
        }
        
        return { data: 'complex', timestamp: Date.now() };
      };

      const results = await Promise.all([
        deduplicator.deduplicate('complex', complexRequest),
        deduplicator.deduplicate('complex', complexRequest)
      ]);

      expect(results[0]).toEqual(results[1]);
      expect(results[0]).toHaveProperty('data', 'complex');
      expect(results[0]).toHaveProperty('timestamp');
    });

    test('should handle destroy cleanup', () => {
      const slowRequest = () => new Promise(resolve => 
        setTimeout(() => resolve('result'), 500)
      );

      deduplicator.deduplicate('cleanup1', slowRequest);
      deduplicator.deduplicate('cleanup2', slowRequest);

      expect(deduplicator.getPendingKeys()).toHaveLength(2);

      deduplicator.destroy();

      expect(deduplicator.getPendingKeys()).toHaveLength(0);
    });
  });
});