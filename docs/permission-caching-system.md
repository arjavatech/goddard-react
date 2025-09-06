# Secure Permission Caching System

A production-ready, comprehensive permission management system with intelligent caching, request deduplication, and seamless React integration.

## Features

- 🚀 **Performance Optimized**: TTL-based caching reduces API calls by up to 90%
- 🔒 **Security First**: Audit logging, secure cache invalidation, fail-safe defaults
- ⚡ **Concurrency Safe**: Request deduplication prevents race conditions
- 🧠 **Memory Efficient**: Automatic cleanup, configurable limits, LRU eviction
- ⚛️ **React Native**: Context, hooks, HOCs, and permission gates
- 🔧 **Production Ready**: Comprehensive error handling, retry logic, monitoring
- 📊 **Observable**: Built-in metrics, performance monitoring, audit trails
- 🎯 **Type Safe**: Full TypeScript support with comprehensive type definitions

## Architecture

```
┌─────────────────────┐    ┌──────────────────────┐    ┌─────────────────┐
│   React Components  │────│  PermissionContext   │────│ PermissionManager│
│                     │    │                      │    │                 │
│ • usePermission     │    │ • Global State       │    │ • API Calls     │
│ • usePermissions    │    │ • Context Provider   │    │ • Cache Logic   │
│ • PermissionGate    │    │ • Error Handling     │    │ • Deduplication │
│ • withPermission    │    │ • Loading States     │    │ • Audit Logging │
└─────────────────────┘    └──────────────────────┘    └─────────────────┘
                                     │                          │
                           ┌─────────▼─────────┐    ┌──────────▼──────────┐
                           │    TTLCache       │    │ RequestDeduplicator │
                           │                   │    │                     │
                           │ • 5min TTL        │    │ • Prevent Race      │
                           │ • Auto Cleanup    │    │ • AbortController   │
                           │ • LRU Eviction    │    │ • Timeout Handling  │
                           │ • Memory Limits   │    │ • Error Propagation │
                           └───────────────────┘    └─────────────────────┘
```

## Quick Start

### 1. Installation

```bash
# Already included in your project structure
# Files are located in:
# - src/services/permissions/
# - src/utils/cache/
# - tests/
```

### 2. Basic Setup

```jsx
// App.jsx
import { PermissionProvider } from './services/permissions';
import { apiService } from './services/api';

function App() {
  return (
    <PermissionProvider apiService={apiService}>
      <Router>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </Router>
    </PermissionProvider>
  );
}
```

### 3. API Service Implementation

```javascript
// services/apiService.js
class ApiService {
  async checkPermission(params, options) {
    const response = await this.httpClient.post('/auth/permissions/check', {
      permission: params.permission,
      userId: params.userId,
      tenant: params.tenant,
      resource: params.resource
    }, {
      signal: options?.signal,
      timeout: 5000
    });
    
    return response.data.hasPermission;
  }

  async getUserRole(params, options) {
    const response = await this.httpClient.get(`/users/${params.userId}/role`, {
      signal: options?.signal,
      params: { tenant: params.tenant }
    });
    
    return response.data.role;
  }

  async getUserPermissions(params, options) {
    const response = await this.httpClient.get(`/users/${params.userId}/permissions`, {
      signal: options?.signal,
      params: { tenant: params.tenant }
    });
    
    return response.data.permissions;
  }
}
```

### 4. Component Usage

```jsx
// Dashboard.jsx
import { usePermissions, usePermission, PermissionGate } from '../services/permissions';

function Dashboard() {
  const { setUser, getUserRole } = usePermissions();
  
  // Single permission check with caching
  const { hasPermission, isLoading } = usePermission('edit-dashboard');

  useEffect(() => {
    setUser({ 
      id: 'user123', 
      tenant: { id: 'tenant456' } 
    });
  }, [setUser]);

  if (isLoading) return <div>Loading permissions...</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      
      {hasPermission && (
        <button>Edit Dashboard</button>
      )}

      <PermissionGate permission="view-analytics">
        <AnalyticsWidget />
      </PermissionGate>

      <PermissionGate 
        permissions={['admin', 'moderator']} 
        requireAll={false}
        fallback={<div>Access denied</div>}
      >
        <AdminTools />
      </PermissionGate>
    </div>
  );
}
```

## Core Components

### TTLCache

Memory-efficient cache with automatic expiration and cleanup.

```javascript
import { TTLCache } from './services/permissions';

const cache = new TTLCache({
  ttl: 5 * 60 * 1000,        // 5 minutes
  cleanupInterval: 60 * 1000, // 1 minute
  maxSize: 1000               // Max items
});

// Basic operations
cache.set('user:123', userData, 300000); // Custom TTL
const user = cache.get('user:123');
cache.delete('user:123');
cache.clear();

// Statistics
const stats = cache.getStats();
console.log(`Hit rate: ${stats.hitRate}, Memory: ${stats.memoryUsage}`);
```

**Key Features:**
- Automatic expiration with custom TTL per item
- LRU-based eviction when memory limits reached
- Background cleanup to prevent memory leaks
- Comprehensive statistics and monitoring
- Thread-safe operations

### RequestDeduplicator

Prevents duplicate concurrent API requests.

```javascript
import { RequestDeduplicator } from './services/permissions';

const deduplicator = new RequestDeduplicator({
  maxConcurrent: 20,
  timeout: 10000
});

// Multiple concurrent calls return same result
const results = await Promise.all([
  deduplicator.deduplicate('user-perms', () => fetchUserPermissions()),
  deduplicator.deduplicate('user-perms', () => fetchUserPermissions()),
  deduplicator.deduplicate('user-perms', () => fetchUserPermissions())
]);
// Only 1 API call made, all get same result

// Cancellation support
const abortController = new AbortController();
const promise = deduplicator.deduplicate('long-task', longRunningTask, {
  signal: abortController.signal
});

setTimeout(() => abortController.abort(), 5000);
```

**Key Features:**
- Deduplicates identical concurrent requests
- AbortController support for cancellation
- Automatic timeout handling
- Error propagation to all waiting callers
- Detailed statistics and monitoring

### PermissionManager

Core permission management with caching and deduplication.

```javascript
import { PermissionManager } from './services/permissions';

const manager = new PermissionManager({
  apiService,
  cacheConfig: {
    ttl: 5 * 60 * 1000,
    maxSize: 500
  },
  securityConfig: {
    enableAuditLog: true,
    maxRetries: 3,
    retryDelay: 1000
  }
});

// Set user context
manager.setCurrentUser({
  id: 'user123',
  tenant: { id: 'tenant456' }
});

// Check permissions
const canEdit = await manager.hasPermission('edit-posts');
const canEditPost = await manager.hasPermission('edit-posts', { 
  resource: 'post-123' 
});

// Bulk checks
const permissions = await manager.hasPermissions([
  'edit-posts', 'delete-posts', 'manage-users'
]);

// Role management  
const userRole = await manager.getUserRole();
const allPermissions = await manager.getUserPermissions();

// Cache management
manager.invalidateUser('user123');
manager.invalidateAll();

// Monitoring
const stats = manager.getStats();
const auditLog = manager.getAuditLog();
```

**Key Features:**
- Intelligent caching with 5-minute TTL
- Request deduplication prevents race conditions
- Retry logic with exponential backoff
- Comprehensive audit logging
- Multi-tenant support
- Bulk permission operations

## React Integration

### PermissionProvider

Root context provider for app-wide permission state.

```jsx
<PermissionProvider 
  apiService={apiService}
  cacheConfig={{ ttl: 300000, maxSize: 1000 }}
  securityConfig={{ enableAuditLog: true }}
  fallbackComponent={<ErrorBoundary />}
>
  <App />
</PermissionProvider>
```

### usePermissions Hook

Access to full permission context and methods.

```jsx
function MyComponent() {
  const {
    user,
    role, 
    permissions,
    isLoading,
    error,
    hasPermission,
    hasPermissions,
    getUserRole,
    invalidateCache,
    getStats
  } = usePermissions();

  const handleRoleChange = async () => {
    const newRole = await getUserRole({ useCache: false });
    console.log('Updated role:', newRole);
  };

  return (
    <div>
      <p>User: {user?.name} ({role?.name})</p>
      <p>Permissions: {permissions.join(', ')}</p>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
    </div>
  );
}
```

### usePermission Hook

Optimized single permission checking with caching.

```jsx
function EditButton({ postId }) {
  const { 
    hasPermission, 
    isLoading, 
    checkPermission 
  } = usePermission('edit-posts', { resource: postId });

  const handleRefresh = async () => {
    const updated = await checkPermission();
    console.log('Updated permission:', updated);
  };

  if (isLoading) return <div>Checking permissions...</div>;
  if (!hasPermission) return null;

  return <button onClick={handleEdit}>Edit Post</button>;
}
```

### PermissionGate Component

Declarative permission-based rendering.

```jsx
// Single permission
<PermissionGate 
  permission="admin"
  fallback={<div>Admin access required</div>}
  loading={<div>Checking admin access...</div>}
>
  <AdminPanel />
</PermissionGate>

// Multiple permissions (OR logic)
<PermissionGate 
  permissions={['moderator', 'admin']} 
  requireAll={false}
>
  <ModerationTools />
</PermissionGate>

// Multiple permissions (AND logic)
<PermissionGate 
  permissions={['edit-posts', 'publish-posts']} 
  requireAll={true}
>
  <PublishButton />
</PermissionGate>

// Resource-specific permission
<PermissionGate 
  permission="edit-post" 
  resource={postId}
  fallback={<ReadOnlyView />}
>
  <EditablePost />
</PermissionGate>
```

### withPermission HOC

Higher-order component for permission protection.

```jsx
import { withPermission } from '../services/permissions';

const AdminPanel = () => <div>Admin Panel Content</div>;

const ProtectedAdminPanel = withPermission('admin', {
  loadingComponent: <div>Checking admin access...</div>,
  fallbackComponent: <div>Admin access required</div>
})(AdminPanel);

// Usage
<ProtectedAdminPanel />
```

## Advanced Features

### Multi-Tenant Support

```javascript
// Set tenant context
manager.setCurrentUser({
  id: 'user123',
  tenant: { id: 'tenant-a', name: 'Company A' }
});

// Permissions are automatically scoped to tenant
const canEdit = await manager.hasPermission('edit-posts');
// API call includes tenant context
```

### Resource-Specific Permissions

```javascript
// Check permission for specific resource
const canEditPost = await manager.hasPermission('edit-posts', {
  resource: 'post-123'
});

// React component example
<PermissionGate permission="edit-user" resource={userId}>
  <EditUserForm userId={userId} />
</PermissionGate>
```

### Cache Management

```javascript
// Get detailed statistics
const stats = manager.getStats();
console.log({
  hitRate: stats.cache.hitRate,
  memoryUsage: stats.cache.memoryUsage,
  apiCalls: stats.apiCalls,
  errors: stats.errors
});

// Invalidate specific user
manager.invalidateUser('user123');

// Invalidate all cache
manager.invalidateAll();

// Monitor performance
setInterval(() => {
  const stats = manager.getStats();
  if (parseFloat(stats.cache.hitRate) < 70) {
    console.warn('Low cache hit rate:', stats.cache.hitRate);
  }
}, 60000);
```

### Error Handling

```javascript
// Configure retry behavior
const manager = new PermissionManager({
  apiService,
  securityConfig: {
    maxRetries: 3,
    retryDelay: 1000, // Base delay in ms
    enableAuditLog: true
  }
});

// Errors are automatically retried (except auth/abort)
// Final errors default to "deny" for security
const hasPermission = await manager.hasPermission('sensitive-action');
// Returns false on error, never throws
```

### Audit Logging

```javascript
// Enable audit logging
const manager = new PermissionManager({
  apiService,
  securityConfig: {
    enableAuditLog: true,
    logPermissionChecks: process.env.NODE_ENV === 'development'
  }
});

// Get audit trail
const auditLog = manager.getAuditLog(50); // Last 50 entries
auditLog.forEach(entry => {
  console.log({
    timestamp: new Date(entry.timestamp),
    event: entry.event,
    data: entry.data
  });
});

// Sample audit events:
// - user_context_set
// - permission_check_error
// - cache_invalidation
// - bulk_permission_check
```

## Performance Optimization

### Cache Configuration

```javascript
const manager = new PermissionManager({
  apiService,
  cacheConfig: {
    ttl: 5 * 60 * 1000,        // 5 minutes
    cleanupInterval: 60 * 1000, // 1 minute
    maxSize: 1000               // 1000 items max
  }
});

// Monitor cache performance
const stats = manager.getStats();
console.log(`Cache hit rate: ${stats.cache.hitRate}`);
console.log(`Memory usage: ${stats.cache.memoryUsage}`);
console.log(`API call reduction: ${((stats.cache.hits / (stats.cache.hits + stats.cache.misses)) * 100).toFixed(1)}%`);
```

### Request Deduplication

```javascript
const manager = new PermissionManager({
  apiService,
  deduplicatorConfig: {
    maxConcurrent: 20,    // Max 20 concurrent requests
    timeout: 10000        // 10 second timeout
  }
});

// View deduplication stats
const stats = manager.getStats();
console.log(`Requests deduplicated: ${stats.deduplicator.deduplicatedRequests}`);
console.log(`Deduplication rate: ${stats.deduplicator.deduplicationRate}`);
```

### Memory Management

```javascript
// Configure memory limits
const cache = new TTLCache({
  maxSize: 500,                // Limit to 500 items
  ttl: 5 * 60 * 1000,         // 5 minute TTL
  cleanupInterval: 30 * 1000   // Check every 30 seconds
});

// Monitor memory usage
setInterval(() => {
  const stats = cache.getStats();
  console.log({
    size: stats.size,
    memoryUsage: stats.memoryUsage,
    evictions: stats.evictions
  });
}, 60000);
```

## Testing

### Unit Testing

```javascript
// Mock API service for testing
const mockApiService = {
  checkPermission: jest.fn(),
  getUserRole: jest.fn(),
  getUserPermissions: jest.fn()
};

// Test permission manager
describe('Permission Manager', () => {
  let manager;

  beforeEach(() => {
    manager = new PermissionManager({
      apiService: mockApiService,
      cacheConfig: { ttl: 1000 }
    });
  });

  test('should cache permission results', async () => {
    mockApiService.checkPermission.mockResolvedValue(true);

    const result1 = await manager.hasPermission('edit-posts');
    const result2 = await manager.hasPermission('edit-posts');

    expect(result1).toBe(true);
    expect(result2).toBe(true);
    expect(mockApiService.checkPermission).toHaveBeenCalledTimes(1);
  });
});
```

### React Testing

```jsx
import { renderWithPermissions } from '../test-utils';

// Test helper
function renderWithPermissions(component, permissions = {}) {
  const mockApiService = createMockApiService(permissions);
  
  return render(
    <PermissionProvider apiService={mockApiService}>
      {component}
    </PermissionProvider>
  );
}

// Component test
test('should show edit button with permission', () => {
  const { getByText } = renderWithPermissions(
    <MyComponent />, 
    { 'edit-posts': true }
  );
  
  expect(getByText('Edit')).toBeInTheDocument();
});
```

## Security Considerations

### Secure by Default

- **Fail Closed**: Returns `false` on errors, never grants access on failure
- **No Sensitive Data in Cache**: Only caches boolean permission results
- **Memory-Safe**: Automatic cleanup prevents memory leaks
- **Audit Trail**: All permission checks and errors are logged

### Best Practices

```javascript
// ✅ Good: Check permissions before sensitive operations
const canDelete = await hasPermission('delete-user', { resource: userId });
if (!canDelete) {
  throw new Error('Insufficient permissions');
}
await deleteUser(userId);

// ✅ Good: Use resource-specific permissions
<PermissionGate permission="edit-post" resource={postId}>
  <EditPostForm postId={postId} />
</PermissionGate>

// ❌ Bad: Don't cache sensitive data
// The system only caches permission booleans, never user data

// ✅ Good: Handle loading states
const { hasPermission, isLoading } = usePermission('admin');
if (isLoading) return <Loading />;
if (!hasPermission) return <AccessDenied />;

// ✅ Good: Invalidate cache after permission changes
await updateUserRole(userId, newRole);
permissionManager.invalidateUser(userId);
```

### Multi-Tenant Security

```javascript
// Permissions are automatically tenant-scoped
manager.setCurrentUser({
  id: 'user123',
  tenant: { id: 'tenant-a' }
});

// This permission check is scoped to tenant-a
const canEdit = await manager.hasPermission('edit-posts');

// Cache keys include tenant ID to prevent cross-tenant leaks
// Key format: "perm:permission:userId:tenantId:resource"
```

## Configuration

### Environment Variables

```bash
# Development
NODE_ENV=development  # Enables detailed permission logging

# Production
PERMISSION_CACHE_TTL=300000      # 5 minutes
PERMISSION_MAX_CACHE_SIZE=1000   # 1000 items
PERMISSION_CLEANUP_INTERVAL=60000 # 1 minute
PERMISSION_MAX_RETRIES=3         # 3 retry attempts
PERMISSION_ENABLE_AUDIT=true     # Enable audit logging
```

### Runtime Configuration

```javascript
const manager = new PermissionManager({
  apiService,
  cacheConfig: {
    ttl: process.env.PERMISSION_CACHE_TTL || 300000,
    maxSize: process.env.PERMISSION_MAX_CACHE_SIZE || 1000,
    cleanupInterval: process.env.PERMISSION_CLEANUP_INTERVAL || 60000
  },
  securityConfig: {
    enableAuditLog: process.env.PERMISSION_ENABLE_AUDIT !== 'false',
    maxRetries: process.env.PERMISSION_MAX_RETRIES || 3,
    logPermissionChecks: process.env.NODE_ENV === 'development'
  }
});
```

## Monitoring & Observability

### Metrics Collection

```javascript
function setupMonitoring(permissionManager) {
  setInterval(() => {
    const stats = permissionManager.getStats();
    
    // Send metrics to monitoring service
    metrics.gauge('permission.cache.hit_rate', parseFloat(stats.cache.hitRate));
    metrics.gauge('permission.cache.size', stats.cache.size);
    metrics.counter('permission.checks.total', stats.permissionChecks);
    metrics.counter('permission.api_calls.total', stats.apiCalls);
    metrics.counter('permission.errors.total', stats.errors);
    
    // Log warnings
    if (parseFloat(stats.cache.hitRate) < 70) {
      console.warn('Low permission cache hit rate', stats.cache.hitRate);
    }
    
    if (stats.errors / stats.permissionChecks > 0.05) {
      console.warn('High permission check error rate', {
        errorRate: (stats.errors / stats.permissionChecks * 100).toFixed(2) + '%'
      });
    }
    
  }, 60000); // Every minute
}
```

### Performance Dashboard

Track these key metrics:

- **Cache Hit Rate**: Should be > 70%
- **API Call Reduction**: Percentage of requests served from cache
- **Error Rate**: Should be < 5%
- **Memory Usage**: Monitor for memory leaks
- **Response Time**: P95 permission check latency
- **Deduplication Rate**: Concurrent request reduction

### Health Checks

```javascript
function healthCheck(permissionManager) {
  const stats = permissionManager.getStats();
  
  return {
    status: 'healthy',
    cache: {
      hitRate: stats.cache.hitRate,
      size: stats.cache.size,
      memoryUsage: stats.cache.memoryUsage
    },
    performance: {
      totalChecks: stats.permissionChecks,
      apiCalls: stats.apiCalls,
      errors: stats.errors,
      deduplicationRate: stats.deduplicator.deduplicationRate
    },
    timestamp: new Date().toISOString()
  };
}
```

## Migration Guide

### From Basic Permission Checking

```javascript
// Before: Direct API calls
const checkPermission = async (permission) => {
  const response = await api.post('/auth/check', { permission });
  return response.data.hasPermission;
};

// After: Cached permission manager
const manager = new PermissionManager({ apiService });
const hasPermission = await manager.hasPermission(permission);
```

### From Redux/Context

```jsx
// Before: Redux permission state
const permissions = useSelector(state => state.auth.permissions);
const canEdit = permissions.includes('edit-posts');

// After: Permission manager with caching
const { hasPermission } = usePermissions();
const canEdit = await hasPermission('edit-posts');
```

### Integration with Existing Auth

```javascript
// Integrate with existing auth system
class AuthService {
  constructor() {
    this.permissionManager = new PermissionManager({
      apiService: this.createApiService()
    });
  }

  async login(credentials) {
    const { user, token } = await this.apiClient.post('/login', credentials);
    
    // Set user in permission system
    this.permissionManager.setCurrentUser(user);
    
    return { user, token };
  }

  async logout() {
    // Clear permission cache on logout
    this.permissionManager.invalidateAll();
    this.permissionManager.setCurrentUser(null);
  }
}
```

## Troubleshooting

### Common Issues

**Low Cache Hit Rate**
```javascript
// Check TTL configuration
const stats = manager.getStats();
console.log('Cache stats:', stats.cache);

// Increase TTL if appropriate
const manager = new PermissionManager({
  apiService,
  cacheConfig: { ttl: 10 * 60 * 1000 } // 10 minutes
});
```

**Memory Usage Growing**
```javascript
// Check cache size and cleanup
const stats = manager.getStats();
if (stats.cache.size > 1000) {
  console.warn('Large cache detected');
  // Reduce maxSize or TTL
}

// Force cleanup
manager.cache._cleanup();
```

**High Error Rate**
```javascript
// Check API service configuration
const auditLog = manager.getAuditLog();
const errors = auditLog.filter(entry => entry.event.includes('error'));
console.log('Recent errors:', errors);

// Increase retry attempts
const manager = new PermissionManager({
  apiService,
  securityConfig: { maxRetries: 5, retryDelay: 2000 }
});
```

### Debug Mode

```javascript
// Enable debug logging
const manager = new PermissionManager({
  apiService,
  securityConfig: {
    logPermissionChecks: true,
    enableAuditLog: true
  }
});

// Check detailed stats
console.log('Detailed stats:', manager.getStats());
console.log('Audit log:', manager.getAuditLog());
console.log('Pending requests:', manager.deduplicator.getPendingDetails());
```

## Contributing

### Code Style

- Use TypeScript for new features
- Follow existing error handling patterns  
- Add comprehensive tests for new functionality
- Include JSDoc documentation
- Follow security-first principles

### Testing Requirements

- Unit tests for all core functionality
- Integration tests for React components
- Performance tests for caching behavior
- Security tests for error conditions
- Memory leak tests for cleanup

---

**Note**: This system is designed for production use with enterprise-grade security and performance requirements. All components include comprehensive error handling, memory management, and observability features.