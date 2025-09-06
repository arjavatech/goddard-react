/**
 * Retry Manager for handling request retries
 * Supports different backoff strategies
 */

import { RetryConfig, ApiError } from '../types';

export class RetryManager {
  private config: RetryConfig;

  constructor(config: RetryConfig) {
    this.config = config;
  }

  shouldRetry(error: ApiError, attempt: number): boolean {
    if (attempt >= this.config.attempts) {
      return false;
    }
    
    return this.config.retryCondition(error);
  }

  calculateDelay(attempt: number): number {
    const { delay, backoff } = this.config;
    
    switch (backoff) {
      case 'exponential':
        return delay * Math.pow(2, attempt - 1) + this.getJitter();
      case 'linear':
        return delay * attempt + this.getJitter();
      case 'fixed':
      default:
        return delay + this.getJitter();
    }
  }

  private getJitter(): number {
    // Add random jitter to prevent thundering herd
    return Math.random() * 1000;
  }
}