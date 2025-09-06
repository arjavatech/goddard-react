/**
 * Loading State Manager
 * Manages loading states for API requests with subscription support
 */

import { LoadingState, ApiError } from '../types';

type LoadingStateCallback = (state: LoadingState) => void;

export class LoadingStateManager {
  private states = new Map<string, LoadingState>();
  private subscribers = new Map<string, Set<LoadingStateCallback>>();

  getState(key: string): LoadingState {
    return this.states.get(key) || {
      isLoading: false,
      isError: false,
      error: null
    };
  }

  setState(key: string, partialState: Partial<LoadingState>): void {
    const currentState = this.getState(key);
    const newState: LoadingState = {
      ...currentState,
      ...partialState,
      lastRequestTime: Date.now()
    };

    this.states.set(key, newState);
    this.notifySubscribers(key, newState);
  }

  setLoading(key: string, isLoading: boolean, progress?: number): void {
    this.setState(key, {
      isLoading,
      isError: false,
      error: null,
      progress,
      retryCount: 0
    });
  }

  setSuccess(key: string): void {
    this.setState(key, {
      isLoading: false,
      isError: false,
      error: null,
      progress: 100
    });
  }

  setError(key: string, error: ApiError): void {
    const currentState = this.getState(key);
    this.setState(key, {
      isLoading: false,
      isError: true,
      error,
      retryCount: (currentState.retryCount || 0) + 1
    });
  }

  setProgress(key: string, progress: number): void {
    this.setState(key, { progress });
  }

  clearState(key: string): void {
    this.states.delete(key);
    this.notifySubscribers(key, {
      isLoading: false,
      isError: false,
      error: null
    });
  }

  subscribe(key: string, callback: LoadingStateCallback): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }

    this.subscribers.get(key)!.add(callback);

    // Immediately call with current state
    callback(this.getState(key));

    // Return unsubscribe function
    return () => {
      const keySubscribers = this.subscribers.get(key);
      if (keySubscribers) {
        keySubscribers.delete(callback);
        if (keySubscribers.size === 0) {
          this.subscribers.delete(key);
        }
      }
    };
  }

  private notifySubscribers(key: string, state: LoadingState): void {
    const keySubscribers = this.subscribers.get(key);
    if (keySubscribers) {
      keySubscribers.forEach(callback => {
        try {
          callback(state);
        } catch (error) {
          console.error(`Error in loading state callback for ${key}:`, error);
        }
      });
    }
  }

  // Utility methods
  isLoading(key: string): boolean {
    return this.getState(key).isLoading;
  }

  hasError(key: string): boolean {
    return this.getState(key).isError;
  }

  getError(key: string): ApiError | null {
    return this.getState(key).error;
  }

  getProgress(key: string): number | undefined {
    return this.getState(key).progress;
  }

  // Get all loading states (for debugging)
  getAllStates(): Record<string, LoadingState> {
    const result: Record<string, LoadingState> = {};
    this.states.forEach((state, key) => {
      result[key] = state;
    });
    return result;
  }

  // Get states matching pattern
  getStatesMatching(pattern: RegExp): Record<string, LoadingState> {
    const result: Record<string, LoadingState> = {};
    this.states.forEach((state, key) => {
      if (pattern.test(key)) {
        result[key] = state;
      }
    });
    return result;
  }

  // Clear all states
  clearAllStates(): void {
    this.states.clear();
    // Notify all subscribers that their states are cleared
    this.subscribers.forEach((subscribers, key) => {
      const clearedState: LoadingState = {
        isLoading: false,
        isError: false,
        error: null
      };
      subscribers.forEach(callback => {
        try {
          callback(clearedState);
        } catch (error) {
          console.error(`Error in loading state callback for ${key}:`, error);
        }
      });
    });
  }

  // Get loading summary
  getLoadingSummary(): {
    totalStates: number;
    loadingCount: number;
    errorCount: number;
    successCount: number;
  } {
    let loadingCount = 0;
    let errorCount = 0;
    let successCount = 0;

    this.states.forEach(state => {
      if (state.isLoading) {
        loadingCount++;
      } else if (state.isError) {
        errorCount++;
      } else {
        successCount++;
      }
    });

    return {
      totalStates: this.states.size,
      loadingCount,
      errorCount,
      successCount
    };
  }
}