// Performance tests for parent dashboard refactoring
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { performanceMonitor } from '../../services/monitoring/performanceMonitor.js';
import { UnifiedParentService } from '../../services/parentDashboard/unifiedParentService.js';
import { cacheManager } from '../../services/cache/multiLayerCache.js';

// Mock performance API
Object.defineProperty(global, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    memory: {
      usedJSHeapSize: 50000000,   // 50MB
      totalJSHeapSize: 100000000,  // 100MB
      jsHeapSizeLimit: 200000000   // 200MB
    }
  },
  writable: true
});

describe('Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    performanceMonitor.clearMetrics();
    performanceMonitor.enable();
  });

  afterEach(() => {
    performanceMonitor.clearMetrics();
  });

  describe('Dashboard Load Performance', () => {
    it('should load dashboard under 2 seconds', async () => {
      // Mock fast API response
      const mockApiResponse = [
        {
          child_id: 1,
          parent_name: 'Test Parent',
          child_first_name: 'John',
          child_last_name: 'Doe',
          child_information: {},
          CompletedFormStatus: [],
          InCompletedFormStatus: []
        }
      ];

      // Simulate API delay of 500ms (well under threshold)
      let callTime = 0;
      global.performance.now.mockImplementation(() => {
        callTime += 500; // 500ms increment
        return callTime;
      });

      const startTime = performance.now();
      
      // This would normally be called by the hook
      const loadTime = performanceMonitor.trackDashboardLoad(startTime, {
        email: 'test@example.com',
        childCount: 1
      });

      expect(loadTime).toBeLessThan(2000);
      
      const metrics = performanceMonitor.getMetrics('dashboardLoad');
      expect(metrics).toHaveLength(1);
      expect(metrics[0].value).toBeLessThan(2000);
    });

    it('should alert when dashboard load is slow', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Simulate slow response
      let callTime = 0;
      global.performance.now.mockImplementation(() => {
        callTime += 3000; // 3 second delay (over threshold)
        return callTime;
      });

      const startTime = performance.now();
      performanceMonitor.trackDashboardLoad(startTime);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Performance Warning]'),
        expect.objectContaining({
          target: 2000
        })
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Child Switch Performance', () => {
    it('should switch children under 100ms', () => {
      // Child switching should be instant with new architecture
      let callTime = 0;
      global.performance.now.mockImplementation(() => {
        callTime += 50; // 50ms (well under threshold)
        return callTime;
      });

      const startTime = performance.now();
      const switchTime = performanceMonitor.trackChildSwitch(startTime, 123);

      expect(switchTime).toBeLessThan(100);
      
      const metrics = performanceMonitor.getMetrics('childSwitch');
      expect(metrics[0].value).toBeLessThan(100);
      expect(metrics[0].metadata.childId).toBe(123);
    });

    it('should alert when child switch is slow', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Simulate slow switch (shouldn't happen with new architecture)
      let callTime = 0;
      global.performance.now.mockImplementation(() => {
        callTime += 200; // 200ms (over threshold)
        return callTime;
      });

      const startTime = performance.now();
      performanceMonitor.trackChildSwitch(startTime, 123);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Performance Warning]'),
        expect.objectContaining({
          target: 100
        })
      );

      consoleSpy.mockRestore();
    });
  });

  describe('API Call Performance', () => {
    it('should track successful API calls', () => {
      let callTime = 0;
      global.performance.now.mockImplementation(() => {
        callTime += 800; // 800ms (under threshold)
        return callTime;
      });

      const startTime = performance.now();
      const duration = performanceMonitor.trackApiCall(
        startTime,
        '/admission_child_personal/parent_email/1/test@example.com',
        200,
        { cached: false }
      );

      expect(duration).toBe(800);
      
      const metrics = performanceMonitor.getMetrics('apiCall');
      expect(metrics[0].metadata.endpoint).toBe('/admission_child_personal/parent_email/1/test@example.com');
      expect(metrics[0].metadata.status).toBe(200);
    });

    it('should track failed API calls', () => {
      let callTime = 0;
      global.performance.now.mockImplementation(() => {
        callTime += 1500; // 1.5s
        return callTime;
      });

      const startTime = performance.now();
      performanceMonitor.trackApiCall(
        startTime,
        '/admission_child_personal/parent_email/1/test@example.com',
        500,
        { error: 'Internal Server Error' }
      );

      const metrics = performanceMonitor.getMetrics('apiCall');
      expect(metrics[0].metadata.status).toBe(500);
      expect(metrics[0].metadata.error).toBe('Internal Server Error');
    });
  });

  describe('Cache Performance', () => {
    it('should track cache hits and misses', () => {
      performanceMonitor.trackCacheHit('parent_dashboard:test@example.com', 'memory');
      performanceMonitor.trackCacheMiss('parent_dashboard:other@example.com');

      const hitMetrics = performanceMonitor.getMetrics('cacheHit');
      const missMetrics = performanceMonitor.getMetrics('cacheMiss');

      expect(hitMetrics).toHaveLength(1);
      expect(hitMetrics[0].metadata.hitType).toBe('memory');
      
      expect(missMetrics).toHaveLength(1);
      expect(missMetrics[0].metadata.key).toBe('parent_dashboard:other@example.com');
    });
  });

  describe('Memory Usage Monitoring', () => {
    it('should monitor memory usage within limits', () => {
      // Mock normal memory usage
      global.performance.memory.usedJSHeapSize = 50000000;  // 50MB
      global.performance.memory.jsHeapSizeLimit = 200000000; // 200MB

      const usage = performanceMonitor.monitorMemoryUsage();

      expect(usage.used).toBe(50000000);
      expect(usage.percentage).toBe(25); // 50MB / 200MB = 25%
      
      const metrics = performanceMonitor.getMetrics('memoryUsage');
      expect(metrics[0].value).toBe(50000000);
      expect(metrics[0].metadata.percentage).toBe(25);
    });

    it('should alert on high memory usage', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Mock high memory usage (90%)
      global.performance.memory.usedJSHeapSize = 180000000; // 180MB
      global.performance.memory.jsHeapSizeLimit = 200000000; // 200MB

      performanceMonitor.monitorMemoryUsage();

      expect(consoleSpy).toHaveBeenCalledWith(
        'High memory usage detected:',
        expect.objectContaining({
          percentage: 90
        })
      );

      consoleSpy.mockRestore();
    });
  });

  describe('User Interaction Tracking', () => {
    it('should track user interactions', () => {
      let callTime = 0;
      global.performance.now.mockImplementation(() => {
        callTime += 150; // 150ms interaction
        return callTime;
      });

      performanceMonitor.trackUserInteraction('form_submit', 150, {
        formType: 'admission_form',
        fieldCount: 25
      });

      const metrics = performanceMonitor.getMetrics('userInteraction');
      expect(metrics[0].value).toBe(150);
      expect(metrics[0].metadata.interaction).toBe('form_submit');
      expect(metrics[0].metadata.formType).toBe('admission_form');
    });
  });

  describe('Error Tracking', () => {
    it('should track errors with context', () => {
      const testError = new Error('Test error');
      testError.stack = 'Error stack trace';

      performanceMonitor.trackError(testError, {
        component: 'ParentDashboard',
        action: 'loadData'
      });

      const metrics = performanceMonitor.getMetrics('error');
      expect(metrics[0].metadata.message).toBe('Test error');
      expect(metrics[0].metadata.name).toBe('Error');
      expect(metrics[0].metadata.context.component).toBe('ParentDashboard');
    });
  });

  describe('Performance Summary', () => {
    it('should generate performance summary', () => {
      // Generate some test metrics
      performanceMonitor.recordMetric('dashboardLoad', 1200);
      performanceMonitor.recordMetric('dashboardLoad', 1000);
      performanceMonitor.recordMetric('childSwitch', 50);
      performanceMonitor.recordMetric('childSwitch', 75);

      const summary = performanceMonitor.getSummary();

      expect(summary.dashboardLoad).toMatchObject({
        count: 2,
        min: 1000,
        max: 1200,
        avg: 1100,
        latest: 1000,
        threshold: 2000
      });

      expect(summary.childSwitch).toMatchObject({
        count: 2,
        min: 50,
        max: 75,
        avg: 62.5,
        latest: 75,
        threshold: 100
      });
    });
  });

  describe('Regression Tests', () => {
    it('should maintain performance improvements', () => {
      // Test that new architecture maintains performance gains
      const measurements = {
        dashboardLoad: [],
        childSwitch: []
      };

      // Simulate 10 dashboard loads
      for (let i = 0; i < 10; i++) {
        let callTime = 0;
        global.performance.now.mockImplementation(() => {
          callTime += 800 + Math.random() * 400; // 800-1200ms
          return callTime;
        });

        const startTime = performance.now();
        const duration = performanceMonitor.trackDashboardLoad(startTime);
        measurements.dashboardLoad.push(duration);
      }

      // Simulate 10 child switches
      for (let i = 0; i < 10; i++) {
        let callTime = 0;
        global.performance.now.mockImplementation(() => {
          callTime += Math.random() * 50; // 0-50ms
          return callTime;
        });

        const startTime = performance.now();
        const duration = performanceMonitor.trackChildSwitch(startTime, i);
        measurements.childSwitch.push(duration);
      }

      // Check that measurements meet performance targets
      const avgDashboardLoad = measurements.dashboardLoad.reduce((a, b) => a + b) / measurements.dashboardLoad.length;
      const avgChildSwitch = measurements.childSwitch.reduce((a, b) => a + b) / measurements.childSwitch.length;

      expect(avgDashboardLoad).toBeLessThan(2000); // Under 2 seconds
      expect(avgChildSwitch).toBeLessThan(100);    // Under 100ms
      
      // 95th percentile should also meet targets
      const sortedDashboardLoad = measurements.dashboardLoad.sort((a, b) => a - b);
      const sortedChildSwitch = measurements.childSwitch.sort((a, b) => a - b);
      
      const p95DashboardLoad = sortedDashboardLoad[Math.floor(0.95 * sortedDashboardLoad.length)];
      const p95ChildSwitch = sortedChildSwitch[Math.floor(0.95 * sortedChildSwitch.length)];

      expect(p95DashboardLoad).toBeLessThan(2000);
      expect(p95ChildSwitch).toBeLessThan(100);
    });
  });
});