/**
 * Circuit Breaker Manager
 * Implements circuit breaker pattern to prevent cascade failures
 */

import { CircuitBreakerConfig, CircuitState } from '../types';
import { EventEmitter } from './EventEmitter';

interface CircuitBreakerState {
  state: CircuitState;
  failures: number;
  lastFailureTime: number;
  nextRetryTime: number;
}

export class CircuitBreakerManager extends EventEmitter {
  private config: CircuitBreakerConfig;
  private circuits: Map<string, CircuitBreakerState> = new Map();

  constructor(config: CircuitBreakerConfig) {
    super();
    this.config = config;
  }

  async checkState(endpoint: string): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    const circuit = this.getCircuit(endpoint);

    switch (circuit.state) {
      case 'open':
        if (Date.now() >= circuit.nextRetryTime) {
          circuit.state = 'half-open';
          this.emit('circuitHalfOpen', { endpoint, circuit });
        } else {
          throw new Error(`Circuit breaker is OPEN for ${endpoint}. Next retry at ${new Date(circuit.nextRetryTime).toISOString()}`);
        }
        break;
      case 'half-open':
        // Allow one request through
        break;
      case 'closed':
      default:
        // Normal operation
        break;
    }
  }

  recordSuccess(endpoint: string): void {
    if (!this.config.enabled) {
      return;
    }

    const circuit = this.getCircuit(endpoint);
    
    if (circuit.state === 'half-open') {
      // Success in half-open state, close the circuit
      circuit.state = 'closed';
      circuit.failures = 0;
      this.emit('circuitClosed', { endpoint, circuit });
    }
    
    // Reset failure count on success
    circuit.failures = 0;
  }

  recordFailure(endpoint: string): void {
    if (!this.config.enabled) {
      return;
    }

    const circuit = this.getCircuit(endpoint);
    circuit.failures++;
    circuit.lastFailureTime = Date.now();

    if (circuit.state === 'half-open') {
      // Failure in half-open state, open the circuit again
      circuit.state = 'open';
      circuit.nextRetryTime = Date.now() + this.config.recoveryTimeout;
      this.emit('circuitOpened', { endpoint, circuit });
    } else if (circuit.failures >= this.config.failureThreshold) {
      // Too many failures, open the circuit
      circuit.state = 'open';
      circuit.nextRetryTime = Date.now() + this.config.recoveryTimeout;
      this.emit('circuitOpened', { endpoint, circuit });
    }
  }

  private getCircuit(endpoint: string): CircuitBreakerState {
    if (!this.circuits.has(endpoint)) {
      this.circuits.set(endpoint, {
        state: 'closed',
        failures: 0,
        lastFailureTime: 0,
        nextRetryTime: 0
      });
    }
    
    return this.circuits.get(endpoint)!;
  }

  getCircuitState(endpoint: string): CircuitState {
    const circuit = this.circuits.get(endpoint);
    return circuit?.state || 'closed';
  }

  getAllCircuits(): Record<string, CircuitBreakerState> {
    const result: Record<string, CircuitBreakerState> = {};
    this.circuits.forEach((state, endpoint) => {
      result[endpoint] = { ...state };
    });
    return result;
  }

  resetCircuit(endpoint: string): void {
    const circuit = this.getCircuit(endpoint);
    circuit.state = 'closed';
    circuit.failures = 0;
    circuit.lastFailureTime = 0;
    circuit.nextRetryTime = 0;
    this.emit('circuitReset', { endpoint, circuit });
  }

  resetAllCircuits(): void {
    this.circuits.forEach((_, endpoint) => {
      this.resetCircuit(endpoint);
    });
  }
}