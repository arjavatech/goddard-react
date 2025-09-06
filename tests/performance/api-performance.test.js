/**
 * Performance tests for API endpoints
 * 
 * Tests API performance characteristics including:
 * - Response time benchmarks
 * - Throughput testing
 * - Memory usage patterns
 * - Concurrent request handling
 * - Load testing scenarios
 */

import { describe, it, expect, beforeEach, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { server, startServer, stopServer, resetHandlers, simulateNetworkDelay } from '../mocks/server.js';
import { authService } from '../../src/services/authService.js';
import { SecureAPIClient } from '../../src/api/SecureAPIClient.js';
import { PerformanceTestUtils, TestDataFactory } from '../utils/api-test-utils.js';

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

describe('API Performance Tests', () => {
  let mockGetAccessTokenSilently;
  let secureClient;
  const performanceThresholds = PerformanceTestUtils.createPerformanceThresholds();

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAccessTokenSilently = vi.fn().mockResolvedValue('valid-token');
    secureClient = new SecureAPIClient();
  });

  describe('Response Time Benchmarks', () => {
    it('should complete authentication check within acceptable time', async () => {
      const testFunction = () => 
        authService.checkUserAuth('test@example.com', mockGetAccessTokenSilently);

      const results = await PerformanceTestUtils.measureApiCall(testFunction, 10);

      expect(results.averageResponseTime).toBeLessThan(performanceThresholds.acceptableResponseTime);
      expect(results.maxResponseTime).toBeLessThan(performanceThresholds.slowResponseTime);
      expect(results.successRate).toBeGreaterThan(performanceThresholds.minimumSuccessRate);
    });

    it('should handle form submission within time limits', async () => {
      const formData = TestDataFactory.createFormData('admission');
      
      const testFunction = () => 
        secureClient.post('/admission_segment/test-school-123/1', formData.data, mockGetAccessTokenSilently);

      const results = await PerformanceTestUtils.measureApiCall(testFunction, 5);

      expect(results.averageResponseTime).toBeLessThan(performanceThresholds.acceptableResponseTime);
      expect(results.successRate).toBe(100);
    });

    it('should maintain performance under network latency', async () => {
      // Simulate 200ms network delay
      simulateNetworkDelay(200);

      const testFunction = () => 
        authService.checkUserAuth('test@example.com', mockGetAccessTokenSilently);

      const results = await PerformanceTestUtils.measureApiCall(testFunction, 5);

      // Should still be reasonable even with added latency
      expect(results.averageResponseTime).toBeLessThan(performanceThresholds.acceptableResponseTime + 300);
      expect(results.successRate).toBe(100);
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should handle multiple simultaneous authentication requests', async () => {
      const concurrentUsers = Array.from({ length: 20 }, (_, i) => 
        `user${i}@example.com`
      );

      const startTime = performance.now();
      
      const requests = concurrentUsers.map(email => 
        authService.checkUserAuth(email, mockGetAccessTokenSilently)
      );

      const results = await Promise.allSettled(requests);
      const endTime = performance.now();

      const successfulRequests = results.filter(r => r.status === 'fulfilled');
      const failedRequests = results.filter(r => r.status === 'rejected');

      expect(successfulRequests.length).toBe(20);
      expect(failedRequests.length).toBe(0);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    });

    it('should handle concurrent form submissions efficiently', async () => {
      const formTypes = ['admission', 'authorization', 'enrollment'];
      const childIds = ['1', '2', '3', '4', '5'];

      const submissions = [];
      childIds.forEach(childId => {
        formTypes.forEach(type => {
          const formData = TestDataFactory.createFormData(type);
          submissions.push(
            secureClient.post(
              `/${type}_segment/test-school-123/${childId}`,
              formData.data,
              mockGetAccessTokenSilently
            )
          );
        });
      });

      const startTime = performance.now();
      const results = await Promise.allSettled(submissions);
      const endTime = performance.now();

      const totalTime = endTime - startTime;
      const averageTimePerRequest = totalTime / submissions.length;

      expect(averageTimePerRequest).toBeLessThan(100); // Should be very fast for mocked responses
      
      // Most requests should succeed (some may fail due to endpoint differences)
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      expect(successCount).toBeGreaterThan(submissions.length * 0.8);
    });

    it('should maintain performance with mixed request types', async () => {
      const mixedRequests = [
        // Authentication requests
        ...Array.from({ length: 5 }, (_, i) => 
          () => authService.checkUserAuth(`user${i}@example.com`, mockGetAccessTokenSilently)
        ),
        // Form submissions
        ...Array.from({ length: 5 }, (_, i) => {
          const formData = TestDataFactory.createFormData('admission');
          return () => secureClient.post(
            `/admission_segment/test-school-123/${i}`,
            formData.data,
            mockGetAccessTokenSilently
          );
        }),
        // Status checks
        ...Array.from({ length: 5 }, (_, i) => 
          () => secureClient.get(
            `/admission_child_personal/completed_form_status/test-school-123/${i}`,
            mockGetAccessTokenSilently
          )
        )
      ];

      const startTime = performance.now();
      
      const requests = mixedRequests.map(requestFn => 
        requestFn().catch(error => ({ error: error.message }))
      );

      const results = await Promise.all(requests);
      const endTime = performance.now();

      const totalTime = endTime - startTime;
      expect(totalTime).toBeLessThan(1000); // Should complete within 1 second

      // Check that we got responses for all requests
      expect(results).toHaveLength(15);
    });
  });

  describe('Memory Usage Patterns', () => {
    it('should not leak memory during repeated API calls', async () => {
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const initialMemory = process.memoryUsage().heapUsed;

      // Perform many API calls
      for (let i = 0; i < 100; i++) {
        await authService.checkUserAuth(`user${i}@example.com`, mockGetAccessTokenSilently);
        
        // Force garbage collection periodically
        if (i % 20 === 0 && global.gc) {
          global.gc();
        }
      }

      // Force final garbage collection
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    it('should handle large response payloads efficiently', async () => {
      // Create a large mock response
      const largeResponse = {
        users: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          email: `user${i}@example.com`,
          data: 'x'.repeat(1000) // 1KB of data per user
        }))
      };

      server.use(
        http.get('*/large-data', () => {
          return HttpResponse.json(largeResponse);
        })
      );

      const startTime = performance.now();
      const result = await secureClient.get('/large-data', mockGetAccessTokenSilently);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(500); // Should process large data quickly
      expect(result.users).toHaveLength(1000);
    });
  });

  describe('Load Testing Scenarios', () => {
    it('should handle authentication load spikes', async () => {
      const userCount = 50;
      const requestsPerUser = 3;
      
      const allRequests = [];
      
      for (let user = 0; user < userCount; user++) {
        for (let req = 0; req < requestsPerUser; req++) {
          allRequests.push(
            authService.checkUserAuth(`user${user}@example.com`, mockGetAccessTokenSilently)
          );
        }
      }

      const startTime = performance.now();
      const results = await Promise.allSettled(allRequests);
      const endTime = performance.now();

      const totalTime = endTime - startTime;
      const requestsPerSecond = (allRequests.length / totalTime) * 1000;

      expect(requestsPerSecond).toBeGreaterThan(50); // Should handle at least 50 requests per second
      
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const successRate = (successCount / allRequests.length) * 100;
      
      expect(successRate).toBeGreaterThan(95); // 95% success rate under load
    });

    it('should maintain stability under sustained load', async () => {
      const duration = 2000; // 2 seconds
      const interval = 50; // Request every 50ms
      
      const requests = [];
      const startTime = performance.now();
      
      while (performance.now() - startTime < duration) {
        requests.push(
          authService.checkUserAuth('load-test@example.com', mockGetAccessTokenSilently)
        );
        
        // Wait for interval
        await new Promise(resolve => setTimeout(resolve, interval));
      }

      const results = await Promise.allSettled(requests);
      
      expect(requests.length).toBeGreaterThan(30); // Should have made many requests
      
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const successRate = (successCount / requests.length) * 100;
      
      expect(successRate).toBeGreaterThan(90); // Should maintain high success rate
    });
  });

  describe('Performance Regression Detection', () => {
    it('should detect performance degradation in authentication', async () => {
      const baselineResults = [];
      const testResults = [];

      // Baseline performance
      for (let i = 0; i < 10; i++) {
        const start = performance.now();
        await authService.checkUserAuth(`baseline${i}@example.com`, mockGetAccessTokenSilently);
        const end = performance.now();
        baselineResults.push(end - start);
      }

      // Simulate slower network (regression)
      simulateNetworkDelay(100);

      // Test performance with degradation
      for (let i = 0; i < 10; i++) {
        const start = performance.now();
        await authService.checkUserAuth(`test${i}@example.com`, mockGetAccessTokenSilently);
        const end = performance.now();
        testResults.push(end - start);
      }

      const baselineAvg = baselineResults.reduce((a, b) => a + b) / baselineResults.length;
      const testAvg = testResults.reduce((a, b) => a + b) / testResults.length;

      // Should detect the performance regression
      expect(testAvg).toBeGreaterThan(baselineAvg);
      expect(testAvg - baselineAvg).toBeGreaterThan(50); // Should be noticeably slower
    });

    it('should measure and report comprehensive performance metrics', async () => {
      const metrics = {
        responseTime: [],
        throughput: 0,
        errorRate: 0,
        memoryUsage: []
      };

      const iterations = 20;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        const requestStart = performance.now();
        const memoryBefore = process.memoryUsage().heapUsed;

        try {
          await authService.checkUserAuth(`metric${i}@example.com`, mockGetAccessTokenSilently);
          
          const requestEnd = performance.now();
          const memoryAfter = process.memoryUsage().heapUsed;
          
          metrics.responseTime.push(requestEnd - requestStart);
          metrics.memoryUsage.push(memoryAfter - memoryBefore);
        } catch (error) {
          metrics.errorRate++;
        }
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      metrics.throughput = (iterations / totalTime) * 1000; // requests per second
      metrics.errorRate = (metrics.errorRate / iterations) * 100; // percentage

      // Comprehensive performance assessment
      const avgResponseTime = metrics.responseTime.reduce((a, b) => a + b) / metrics.responseTime.length;
      const maxResponseTime = Math.max(...metrics.responseTime);
      const minResponseTime = Math.min(...metrics.responseTime);

      expect(avgResponseTime).toBeLessThan(100); // Average under 100ms
      expect(maxResponseTime).toBeLessThan(500); // Max under 500ms
      expect(metrics.throughput).toBeGreaterThan(20); // At least 20 RPS
      expect(metrics.errorRate).toBe(0); // No errors under normal conditions

      // Memory usage should be reasonable
      const avgMemoryChange = metrics.memoryUsage.reduce((a, b) => a + b) / metrics.memoryUsage.length;
      expect(Math.abs(avgMemoryChange)).toBeLessThan(10000); // Less than 10KB change per request
    });
  });

  describe('Resource Utilization', () => {
    it('should efficiently utilize system resources', async () => {
      const resourceMetrics = {
        cpuStart: process.cpuUsage(),
        memoryStart: process.memoryUsage()
      };

      // Perform intensive operations
      const tasks = Array.from({ length: 100 }, (_, i) => 
        authService.checkUserAuth(`resource${i}@example.com`, mockGetAccessTokenSilently)
      );

      await Promise.all(tasks);

      const resourceEnd = {
        cpu: process.cpuUsage(resourceMetrics.cpuStart),
        memory: process.memoryUsage()
      };

      // CPU usage should be reasonable
      const totalCpuTime = resourceEnd.cpu.user + resourceEnd.cpu.system;
      expect(totalCpuTime).toBeLessThan(1000000); // Less than 1 second of CPU time

      // Memory growth should be controlled
      const memoryGrowth = resourceEnd.memory.heapUsed - resourceMetrics.memoryStart.heapUsed;
      expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024); // Less than 50MB growth
    });
  });
});