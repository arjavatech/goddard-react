/**
 * Request Deduplicator
 * Prevents duplicate API requests from being sent simultaneously
 */

import { ApiRequestConfig, ApiResponse } from '../types';

interface PendingRequest<T = any> {
  promise: Promise<ApiResponse<T>>;
  timestamp: number;
}

export class RequestDeduplicator {
  private pendingRequests = new Map<string, PendingRequest>();
  private readonly TTL = 30000; // 30 seconds

  async checkDuplicate<T = any>(config: ApiRequestConfig): Promise<ApiResponse<T> | null> {
    // Only deduplicate GET requests
    if (config.method && config.method !== 'GET') {
      return null;
    }

    const key = this.generateKey(config);
    const pending = this.pendingRequests.get(key);

    if (pending) {
      // Check if pending request is still valid
      if (Date.now() - pending.timestamp < this.TTL) {
        console.log(`🔄 [Deduplicator] Reusing pending request for ${key}`);
        return await pending.promise;
      } else {
        // Remove expired pending request
        this.pendingRequests.delete(key);
      }
    }

    return null;
  }

  registerRequest<T = any>(config: ApiRequestConfig, promise: Promise<ApiResponse<T>>): void {
    // Only register GET requests
    if (config.method && config.method !== 'GET') {
      return;
    }

    const key = this.generateKey(config);
    
    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now()
    });

    // Clean up when request completes
    promise.finally(() => {
      this.pendingRequests.delete(key);
    });
  }

  private generateKey(config: ApiRequestConfig): string {
    const parts = [
      config.method || 'GET',
      config.url
    ];

    if (config.params && Object.keys(config.params).length > 0) {
      const sortedParams = Object.keys(config.params)
        .sort()
        .map(k => `${k}=${config.params![k]}`)
        .join('&');
      parts.push(sortedParams);
    }

    return parts.join('|');
  }

  getPendingRequests(): string[] {
    return Array.from(this.pendingRequests.keys());
  }

  clearExpired(): void {
    const now = Date.now();
    for (const [key, request] of this.pendingRequests.entries()) {
      if (now - request.timestamp >= this.TTL) {
        this.pendingRequests.delete(key);
      }
    }
  }
}