/**
 * Metrics Collector for API performance monitoring
 * Tracks request metrics, timings, and error rates
 */

import { ApiMetrics, ApiRequestConfig, ApiResponse, ApiError } from '../types';

export class MetricsCollector {
  private metrics: ApiMetrics;
  private requestTimings: Map<string, number> = new Map();
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
    this.resetMetrics();
  }

  recordRequest(config: ApiRequestConfig): string {
    const requestId = this.generateRequestId();
    this.requestTimings.set(requestId, performance.now());
    
    this.metrics.totalRequests++;
    
    // Track requests by endpoint
    const endpoint = this.normalizeEndpoint(config.url);
    this.metrics.requestsByEndpoint[endpoint] = (this.metrics.requestsByEndpoint[endpoint] || 0) + 1;
    
    return requestId;
  }

  recordSuccess(config: ApiRequestConfig, response: ApiResponse): void {
    this.metrics.successfulRequests++;
  }

  recordError(config: ApiRequestConfig, error: ApiError): void {
    this.metrics.failedRequests++;
    
    // Track errors by status
    if (error.status) {
      this.metrics.errorsByStatus[error.status] = (this.metrics.errorsByStatus[error.status] || 0) + 1;
    }
  }

  recordTiming(config: ApiRequestConfig, duration: number): void {
    // Update average response time
    const totalTime = this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + duration;
    this.metrics.averageResponseTime = totalTime / this.metrics.totalRequests;
  }

  recordCacheHit(): void {
    // Cache hits are tracked separately since they don't go through normal request flow
    const totalRequests = this.metrics.totalRequests + 1; // Include cache hit as a request
    this.metrics.cacheHitRate = ((this.metrics.cacheHitRate * this.metrics.totalRequests) + 1) / totalRequests;
  }

  recordRetry(config: ApiRequestConfig, retryCount: number): void {
    this.metrics.retryCount += retryCount;
  }

  recordCircuitBreakerTrip(): void {
    this.metrics.circuitBreakerTrips++;
  }

  recordRateLimitHit(): void {
    this.metrics.rateLimitHits++;
  }

  getMetrics(): ApiMetrics {
    return {
      ...this.metrics,
      timestamp: Date.now()
    };
  }

  getDetailedMetrics(): ApiMetrics & {
    uptime: number;
    successRate: number;
    errorRate: number;
    averageRequestsPerMinute: number;
  } {
    const baseMetrics = this.getMetrics();
    const uptime = Date.now() - this.startTime;
    const totalRequests = baseMetrics.totalRequests;
    
    return {
      ...baseMetrics,
      uptime,
      successRate: totalRequests > 0 ? (baseMetrics.successfulRequests / totalRequests) * 100 : 0,
      errorRate: totalRequests > 0 ? (baseMetrics.failedRequests / totalRequests) * 100 : 0,
      averageRequestsPerMinute: uptime > 0 ? (totalRequests / (uptime / 60000)) : 0
    };
  }

  resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      cacheHitRate: 0,
      retryCount: 0,
      circuitBreakerTrips: 0,
      rateLimitHits: 0,
      errorsByStatus: {},
      requestsByEndpoint: {},
      timestamp: Date.now()
    };
  }

  private generateRequestId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private normalizeEndpoint(url: string): string {
    try {
      const urlObj = new URL(url, 'http://localhost');
      return urlObj.pathname;
    } catch {
      return url;
    }
  }

  exportMetrics(): string {
    return JSON.stringify(this.getDetailedMetrics(), null, 2);
  }

  // Get metrics for specific time period
  getMetricsSince(timestamp: number): Partial<ApiMetrics> {
    // This would require more sophisticated tracking to implement properly
    // For now, return current metrics
    return this.getMetrics();
  }

  // Get top error endpoints
  getTopErrorEndpoints(limit: number = 5): Array<{ endpoint: string; errors: number }> {
    return Object.entries(this.metrics.requestsByEndpoint)
      .map(([endpoint, count]) => ({ endpoint, errors: count }))
      .sort((a, b) => b.errors - a.errors)
      .slice(0, limit);
  }

  // Get most common error status codes
  getTopErrorStatuses(limit: number = 5): Array<{ status: number; count: number }> {
    return Object.entries(this.metrics.errorsByStatus)
      .map(([status, count]) => ({ status: parseInt(status), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
}