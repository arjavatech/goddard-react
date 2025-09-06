# API Testing Guide

## Overview

This guide provides comprehensive documentation for testing APIs in the Goddard React application. Our testing strategy covers unit tests, integration tests, contract validation, performance testing, and error scenario handling.

## Testing Architecture

### Testing Stack
- **Vitest**: Primary testing framework
- **Mock Service Worker (MSW)**: API mocking and interception
- **@testing-library/react**: Component testing utilities
- **Custom Test Utilities**: Specialized API testing helpers

### File Structure
```
tests/
├── mocks/
│   ├── handlers.js          # MSW request handlers
│   └── server.js            # MSW server setup
├── utils/
│   └── api-test-utils.js    # Testing utilities and helpers
├── services/api/
│   ├── authService.test.js  # Authentication service tests
│   └── SecureAPIClient.test.js # API client tests
├── integration/
│   └── api-flow.test.js     # End-to-end API flow tests
├── performance/
│   └── api-performance.test.js # Performance benchmarks
├── contracts/
│   └── api-contracts.test.js   # Contract validation tests
└── setup.js                 # Global test setup
```

## Testing Strategies

### 1. Unit Testing

Unit tests focus on individual API service methods and functions.

```javascript
import { authService } from '../../../src/services/authService.js';

describe('AuthService', () => {
  it('should check user permissions', async () => {
    const permissions = await authService.getUserPermissions('user@example.com');
    expect(permissions).toContain('read:forms');
  });
});
```

**Coverage Areas:**
- Authentication methods
- Permission validation
- Data transformation
- Error handling
- Input validation

### 2. Integration Testing

Integration tests verify complete API workflows and interactions.

```javascript
describe('Complete Authentication Flow', () => {
  it('should authenticate user and retrieve permissions', async () => {
    // Step 1: Check authentication
    const authResult = await authService.checkUserAuth(userEmail, mockToken);
    
    // Step 2: Verify permissions
    const hasPermissions = authService.hasPermissions(['read:forms'], authResult.permissions);
    
    expect(hasPermissions).toBe(true);
  });
});
```

**Coverage Areas:**
- Multi-step workflows
- Service interactions
- Data consistency
- State management
- Cross-service dependencies

### 3. Error Scenario Testing

Comprehensive error handling validation for all failure modes.

```javascript
describe('Network Errors', () => {
  it('should handle complete network failure', async () => {
    server.use(
      http.post('*/auth/check', () => HttpResponse.error())
    );

    await expect(
      authService.checkUserAuth('test@example.com', mockToken)
    ).rejects.toThrow();
  });
});
```

**Error Categories:**
- Network failures (timeouts, DNS, connectivity)
- HTTP status codes (400, 401, 403, 404, 500, etc.)
- Authentication errors
- Validation failures
- Rate limiting
- Malformed responses

### 4. Performance Testing

Performance benchmarks and load testing scenarios.

```javascript
describe('Performance Tests', () => {
  it('should complete authentication within time limits', async () => {
    const results = await PerformanceTestUtils.measureApiCall(
      () => authService.checkUserAuth('test@example.com', mockToken),
      10
    );
    
    expect(results.averageResponseTime).toBeLessThan(1000);
    expect(results.successRate).toBeGreaterThan(95);
  });
});
```

**Performance Metrics:**
- Response time benchmarks
- Throughput testing
- Memory usage patterns
- Concurrent request handling
- Resource utilization

### 5. Contract Testing

API contract validation ensures response structure consistency.

```javascript
const authSchema = {
  required: ['isAdmin', 'isParent', 'permissions', 'email'],
  properties: {
    isAdmin: { type: 'boolean' },
    isParent: { type: 'boolean' },
    permissions: { type: 'array' },
    email: { type: 'string' }
  }
};

describe('Authentication Contracts', () => {
  it('should validate response structure', async () => {
    const response = await authService.checkUserAuth('test@example.com', mockToken);
    const validation = contractTester.validateResponse(response, authSchema);
    
    expect(validation.valid).toBe(true);
  });
});
```

## Test Utilities

### ApiTestSuite Class

Provides standardized test scenarios for any API endpoint.

```javascript
const apiTest = new ApiTestSuite('/api/endpoint');

// Generate comprehensive test scenarios
const scenarios = apiTest.generateTestScenarios();

// Success scenario
expect(scenarios.success.mock).toBeDefined();
expect(scenarios.success.expectedStatus).toBe(200);

// Error scenarios
expect(scenarios.serverError.expectedStatus).toBe(500);
expect(scenarios.notFound.expectedStatus).toBe(404);
```

### AuthMockUtils Class

Authentication-specific testing utilities.

```javascript
// Create authenticated context
const authContext = AuthMockUtils.createMockAuth0Context({
  user: { email: 'test@example.com' },
  isAuthenticated: true
});

// Create unauthenticated context
const unauthContext = AuthMockUtils.createUnauthenticatedContext();
```

### TestDataFactory Class

Generates consistent test data across all tests.

```javascript
// Create test user
const user = TestDataFactory.createUser({
  email: 'custom@example.com',
  isAdmin: true
});

// Create form data
const formData = TestDataFactory.createFormData('admission', {
  data: { childName: 'Test Child' }
});

// Create API response
const response = TestDataFactory.createApiResponse('success');
```

## Mock Service Worker (MSW) Setup

### Request Handlers

MSW handlers intercept HTTP requests during testing:

```javascript
export const authHandlers = [
  http.post(`${BASE_URL}/sign_in/check/:schoolId`, ({ request, params }) => {
    return request.json().then((body) => {
      const user = mockData.users[body.email];
      if (!user) {
        return HttpResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return HttpResponse.json(user);
    });
  })
];
```

### Server Configuration

Global server setup for all tests:

```javascript
import { setupServer } from 'msw/node';
import { handlers } from './handlers.js';

export const server = setupServer(...handlers);

// Global setup
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Best Practices

### 1. Test Organization

- **Group by functionality**: Organize tests by API service or feature
- **Use descriptive names**: Test names should clearly describe the scenario
- **Follow AAA pattern**: Arrange, Act, Assert structure
- **Isolate tests**: Each test should be independent and idempotent

### 2. Mock Strategy

- **Use MSW for HTTP mocking**: More realistic than function mocks
- **Mock external dependencies**: Don't test third-party services
- **Provide realistic data**: Use representative test data
- **Handle error scenarios**: Mock various failure modes

### 3. Assertion Strategy

- **Test behavior, not implementation**: Focus on outcomes
- **Use specific assertions**: Prefer precise expectations over broad ones
- **Validate error states**: Ensure proper error handling
- **Check side effects**: Verify state changes and interactions

### 4. Performance Considerations

- **Set performance thresholds**: Define acceptable response times
- **Test under load**: Simulate concurrent requests
- **Monitor resource usage**: Check memory and CPU consumption
- **Detect regressions**: Compare against baseline metrics

### 5. Maintenance

- **Keep tests up-to-date**: Update tests with API changes
- **Review test coverage**: Ensure comprehensive coverage
- **Clean up test data**: Reset state between tests
- **Document test scenarios**: Explain complex test setups

## Common Patterns

### Testing Authentication

```javascript
describe('Authentication', () => {
  beforeEach(() => {
    mockGetAccessTokenSilently = vi.fn().mockResolvedValue('valid-token');
  });

  it('should authenticate valid users', async () => {
    const result = await authService.checkUserAuth('user@example.com', mockGetAccessTokenSilently);
    expect(result.isAuthenticated).toBe(true);
  });

  it('should reject invalid tokens', async () => {
    mockGetAccessTokenSilently.mockRejectedValue(new Error('Invalid token'));
    
    await expect(
      authService.checkUserAuth('user@example.com', mockGetAccessTokenSilently)
    ).rejects.toThrow('Invalid token');
  });
});
```

### Testing Form Submissions

```javascript
describe('Form Submission', () => {
  it('should submit valid form data', async () => {
    const formData = TestDataFactory.createFormData('admission');
    
    const result = await secureClient.post(
      '/admission_segment/school-123/child-1',
      formData.data,
      mockGetAccessTokenSilently
    );
    
    expect(result.success).toBe(true);
    expect(result.formId).toMatch(/admission_\w+_\d+/);
  });

  it('should handle validation errors', async () => {
    const invalidData = { /* missing required fields */ };
    
    await expect(
      secureClient.post('/admission_segment/school-123/child-1', invalidData, mockGetAccessTokenSilently)
    ).rejects.toThrow('Validation failed');
  });
});
```

### Testing Error Recovery

```javascript
describe('Error Recovery', () => {
  it('should retry on network failures', async () => {
    let attemptCount = 0;
    
    server.use(
      http.post('*/api/endpoint', () => {
        attemptCount++;
        if (attemptCount <= 2) {
          return HttpResponse.error();
        }
        return HttpResponse.json({ success: true });
      })
    );

    // Should succeed after retries
    const result = await apiClient.post('/api/endpoint', {});
    expect(result.success).toBe(true);
    expect(attemptCount).toBe(3);
  });
});
```

## Running Tests

### Commands

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- authService.test.js

# Run in watch mode
npm test -- --watch

# Run performance tests
npm test -- performance/

# Run integration tests only
npm test -- integration/
```

### Coverage Targets

- **Statements**: >80%
- **Branches**: >75%
- **Functions**: >80%
- **Lines**: >80%

### CI/CD Integration

Tests should be integrated into the CI/CD pipeline:

```yaml
name: API Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run test:coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v1
```

## Debugging Tests

### Common Issues

1. **MSW not intercepting requests**
   - Ensure server is started in `beforeAll`
   - Check handler URL patterns match requests
   - Verify request method matches handler

2. **Test timeouts**
   - Check for infinite promises
   - Increase timeout for slow operations
   - Mock time-consuming operations

3. **Flaky tests**
   - Ensure proper cleanup between tests
   - Check for race conditions
   - Use deterministic test data

### Debugging Tools

```javascript
// Enable MSW debugging
server.listen({ onUnhandledRequest: 'warn' });

// Log request details
server.events.on('request:start', ({ request }) => {
  console.log('MSW intercepted:', request.method, request.url);
});

// Add test debugging
it('should debug test', async () => {
  console.log('Test data:', testData);
  const result = await apiCall();
  console.log('Result:', result);
  expect(result).toBeDefined();
});
```

## Migration Guide

When updating existing tests to use this framework:

1. **Replace fetch mocks with MSW handlers**
2. **Use test utilities instead of manual setup**
3. **Add contract validation to existing tests**
4. **Include error scenario coverage**
5. **Add performance benchmarks for critical paths**

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [MSW Documentation](https://mswjs.io/)
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles)
- [API Testing Best Practices](https://blog.postman.com/api-testing-best-practices/)

## Contributing

When adding new API tests:

1. Follow the established patterns and conventions
2. Include comprehensive error scenarios
3. Add appropriate contract validation
4. Document any new utilities or patterns
5. Ensure tests are deterministic and maintainable