// Performance monitoring and metrics collection
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      apiCalls: [],
      cacheHits: [],
      renderTimes: [],
      userInteractions: [],
      errors: []
    };
    
    this.thresholds = {
      dashboardLoad: 2000, // 2 seconds
      childSwitch: 100,    // 100ms
      apiCall: 1000,       // 1 second
      render: 500          // 500ms
    };

    this.listeners = new Set();
    this.isEnabled = import.meta.env?.NODE_ENV === 'development' || 
                     localStorage.getItem('performance_monitoring') === 'true';
  }

  // Enable/disable monitoring
  enable() {
    this.isEnabled = true;
    localStorage.setItem('performance_monitoring', 'true');
  }

  disable() {
    this.isEnabled = false;
    localStorage.removeItem('performance_monitoring');
  }

  // Record a performance metric
  recordMetric(type, value, metadata = {}) {
    if (!this.isEnabled) return;

    const metric = {
      type,
      value,
      timestamp: Date.now(),
      metadata,
      id: this.generateId()
    };

    if (!this.metrics[type]) {
      this.metrics[type] = [];
    }

    this.metrics[type].push(metric);

    // Keep only last 100 metrics per type
    if (this.metrics[type].length > 100) {
      this.metrics[type] = this.metrics[type].slice(-100);
    }

    // Notify listeners
    this.notifyListeners(type, metric);

    // Check thresholds and alert if needed
    this.checkThresholds(type, value, metadata);

    console.log(`[Performance] ${type}: ${value}ms`, metadata);
  }

  // Track dashboard load time
  trackDashboardLoad(startTime, metadata = {}) {
    const loadTime = performance.now() - startTime;
    this.recordMetric('dashboardLoad', loadTime, {
      ...metadata,
      target: this.thresholds.dashboardLoad
    });
    return loadTime;
  }

  // Track child switch time
  trackChildSwitch(startTime, childId) {
    const switchTime = performance.now() - startTime;
    this.recordMetric('childSwitch', switchTime, {
      childId,
      target: this.thresholds.childSwitch
    });
    return switchTime;
  }

  // Track API call performance
  trackApiCall(startTime, endpoint, status, metadata = {}) {
    const duration = performance.now() - startTime;
    this.recordMetric('apiCall', duration, {
      endpoint,
      status,
      ...metadata,
      target: this.thresholds.apiCall
    });
    return duration;
  }

  // Track render time
  trackRender(componentName, startTime, metadata = {}) {
    const renderTime = performance.now() - startTime;
    this.recordMetric('render', renderTime, {
      component: componentName,
      ...metadata,
      target: this.thresholds.render
    });
    return renderTime;
  }

  // Track cache performance
  trackCacheHit(key, hitType = 'memory') {
    this.recordMetric('cacheHit', 0, { key, hitType });
  }

  trackCacheMiss(key) {
    this.recordMetric('cacheMiss', 0, { key });
  }

  // Track user interactions
  trackUserInteraction(interaction, duration = 0, metadata = {}) {
    this.recordMetric('userInteraction', duration, {
      interaction,
      ...metadata
    });
  }

  // Track errors
  trackError(error, context = {}) {
    this.recordMetric('error', 0, {
      message: error.message,
      name: error.name,
      stack: error.stack,
      context,
      timestamp: Date.now()
    });
  }

  // Memory usage monitoring
  monitorMemoryUsage() {
    if (!performance.memory) return null;

    const usage = {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit,
      timestamp: Date.now()
    };

    this.recordMetric('memoryUsage', usage.used, {
      total: usage.total,
      limit: usage.limit,
      percentage: Math.round((usage.used / usage.limit) * 100)
    });

    // Alert if memory usage is high
    if (usage.used / usage.limit > 0.8) {
      console.warn('High memory usage detected:', usage);
      this.alertHighMemoryUsage(usage);
    }

    return usage;
  }

  // Check performance thresholds
  checkThresholds(type, value, metadata) {
    const threshold = this.thresholds[type];
    if (!threshold || value <= threshold) return;

    const warning = {
      type,
      value,
      threshold,
      metadata,
      timestamp: Date.now()
    };

    console.warn(`[Performance Warning] ${type} slow: ${value}ms (threshold: ${threshold}ms)`, metadata);
    this.alertSlowPerformance(warning);
  }

  // Alert handlers
  alertSlowPerformance(warning) {
    // In production, this could send to analytics service
    if (import.meta.env?.NODE_ENV === 'development') {
      console.warn('Performance threshold exceeded:', warning);
    }
  }

  alertHighMemoryUsage(usage) {
    if (import.meta.env?.NODE_ENV === 'development') {
      console.warn('High memory usage:', usage);
    }
  }

  // Get performance summary
  getSummary() {
    const summary = {};

    Object.keys(this.metrics).forEach(type => {
      const metrics = this.metrics[type];
      if (metrics.length === 0) {
        summary[type] = null;
        return;
      }

      const values = metrics.map(m => m.value).filter(v => typeof v === 'number');
      
      if (values.length === 0) {
        summary[type] = { count: metrics.length };
        return;
      }

      summary[type] = {
        count: values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((sum, v) => sum + v, 0) / values.length,
        latest: values[values.length - 1],
        threshold: this.thresholds[type] || null
      };
    });

    return summary;
  }

  // Get detailed metrics
  getMetrics(type = null, limit = 50) {
    if (type) {
      return (this.metrics[type] || []).slice(-limit);
    }
    
    const result = {};
    Object.keys(this.metrics).forEach(metricType => {
      result[metricType] = this.metrics[metricType].slice(-limit);
    });
    
    return result;
  }

  // Clear metrics
  clearMetrics(type = null) {
    if (type) {
      this.metrics[type] = [];
    } else {
      Object.keys(this.metrics).forEach(key => {
        this.metrics[key] = [];
      });
    }
  }

  // Generate unique ID
  generateId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Add performance listener
  addListener(callback) {
    this.listeners.add(callback);
  }

  // Remove performance listener
  removeListener(callback) {
    this.listeners.delete(callback);
  }

  // Notify all listeners
  notifyListeners(type, metric) {
    this.listeners.forEach(callback => {
      try {
        callback(type, metric);
      } catch (error) {
        console.error('Performance listener error:', error);
      }
    });
  }

  // Export metrics to JSON
  exportMetrics() {
    return {
      timestamp: Date.now(),
      summary: this.getSummary(),
      metrics: this.metrics,
      thresholds: this.thresholds,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
  }

  // Start continuous monitoring
  startContinuousMonitoring(interval = 30000) { // 30 seconds
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(() => {
      this.monitorMemoryUsage();
      
      // Log summary every 5 minutes in development
      if (import.meta.env?.NODE_ENV === 'development' && Math.random() < 0.1) {
        console.log('[Performance Summary]', this.getSummary());
      }
    }, interval);
  }

  // Stop continuous monitoring
  stopContinuousMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  // Cleanup
  destroy() {
    this.stopContinuousMonitoring();
    this.listeners.clear();
    this.clearMetrics();
  }
}

// Create and export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Start monitoring in development
if (import.meta.env?.NODE_ENV === 'development') {
  performanceMonitor.enable();
  performanceMonitor.startContinuousMonitoring();
}

// Helper hook for React components
export const usePerformanceMonitor = () => {
  return {
    monitor: performanceMonitor,
    trackRender: (componentName) => {
      const startTime = performance.now();
      return () => performanceMonitor.trackRender(componentName, startTime);
    },
    trackInteraction: (interactionName) => {
      const startTime = performance.now();
      return (metadata = {}) => {
        const duration = performance.now() - startTime;
        performanceMonitor.trackUserInteraction(interactionName, duration, metadata);
      };
    }
  };
};