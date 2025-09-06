/**
 * Mock Service Worker (MSW) server setup for testing
 * 
 * This file sets up the MSW server for intercepting HTTP requests
 * during testing, providing realistic API responses.
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers.js';

// Setup MSW server with all handlers
export const server = setupServer(...handlers);

// Export server control functions
export const startServer = () => server.listen({ onUnhandledRequest: 'error' });
export const stopServer = () => server.close();
export const resetHandlers = () => server.resetHandlers();

// Helper to add runtime handlers
export const addHandlers = (...newHandlers) => {
  server.use(...newHandlers);
};

// Helper to override specific endpoints
export const overrideHandler = (handler) => {
  server.use(handler);
};

// Helper to simulate network conditions
export const simulateNetworkDelay = (delay = 100) => {
  server.use(
    ...handlers.map(handler => {
      const originalHandler = handler;
      return (...args) => {
        return new Promise(resolve => {
          setTimeout(() => resolve(originalHandler(...args)), delay);
        });
      };
    })
  );
};

// Helper to simulate intermittent failures
export const simulateIntermittentFailures = (failureRate = 0.3) => {
  let requestCount = 0;
  
  server.use(
    ...handlers.map(handler => {
      const originalHandler = handler;
      return (...args) => {
        requestCount++;
        if (Math.random() < failureRate) {
          return HttpResponse.json(
            { error: 'Intermittent failure' },
            { status: 500 }
          );
        }
        return originalHandler(...args);
      };
    })
  );
};