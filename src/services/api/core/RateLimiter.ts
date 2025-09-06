/**
 * Rate Limiter for API requests
 * Implements sliding window rate limiting
 */

import { RateLimitConfig, RateLimitInfo } from '../types';

interface RateLimitWindow {
  requests: number[];
  lastReset: number;
}

export class RateLimiter {
  private config: RateLimitConfig;
  private windows: Map<string, RateLimitWindow> = new Map();

  constructor(config: RateLimitConfig) {
    this.config = config;
    this.startCleanupInterval();
  }

  async checkLimit(endpoint: string): Promise<RateLimitInfo> {
    if (!this.config.enabled) {
      return {
        limit: Infinity,
        remaining: Infinity,
        reset: Date.now() + this.config.windowMs
      };
    }

    const window = this.getWindow(endpoint);
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Remove old requests outside the window
    window.requests = window.requests.filter(time => time > windowStart);

    const rateLimitInfo: RateLimitInfo = {
      limit: this.config.requests,
      remaining: Math.max(0, this.config.requests - window.requests.length),
      reset: windowStart + this.config.windowMs
    };

    // Check if limit exceeded
    if (window.requests.length >= this.config.requests) {
      const oldestRequest = Math.min(...window.requests);
      const retryAfter = oldestRequest + this.config.windowMs - now;
      
      throw new Error(`Rate limit exceeded for ${endpoint}. Retry after ${Math.ceil(retryAfter / 1000)} seconds.`);
    }

    // Record this request
    window.requests.push(now);

    return rateLimitInfo;
  }

  recordRequest(endpoint: string, wasSuccessful: boolean): void {
    if (!this.config.enabled) {
      return;
    }

    // Skip recording based on config
    if (wasSuccessful && this.config.skipSuccessfulRequests) {
      return;
    }
    
    if (!wasSuccessful && this.config.skipFailedRequests) {
      return;
    }

    // Request is already recorded in checkLimit
  }

  private getWindow(endpoint: string): RateLimitWindow {
    if (!this.windows.has(endpoint)) {
      this.windows.set(endpoint, {
        requests: [],
        lastReset: Date.now()
      });
    }
    
    return this.windows.get(endpoint)!;
  }

  private startCleanupInterval(): void {
    // Clean up old windows every minute
    setInterval(() => {
      const now = Date.now();
      const cutoff = now - (this.config.windowMs * 2); // Keep some buffer
      
      this.windows.forEach((window, endpoint) => {
        window.requests = window.requests.filter(time => time > cutoff);
        
        // Remove empty windows that haven't been used recently
        if (window.requests.length === 0 && window.lastReset < cutoff) {
          this.windows.delete(endpoint);
        }
      });
    }, 60000);
  }

  getRateLimitInfo(endpoint: string): RateLimitInfo {
    if (!this.config.enabled) {
      return {
        limit: Infinity,
        remaining: Infinity,
        reset: Date.now() + this.config.windowMs
      };
    }

    const window = this.getWindow(endpoint);
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Filter requests within current window
    const currentRequests = window.requests.filter(time => time > windowStart);

    return {
      limit: this.config.requests,
      remaining: Math.max(0, this.config.requests - currentRequests.length),
      reset: windowStart + this.config.windowMs
    };
  }

  resetLimits(endpoint?: string): void {
    if (endpoint) {
      this.windows.delete(endpoint);
    } else {
      this.windows.clear();
    }
  }
}