# Permission Caching System

A comprehensive, high-performance permission checking system with intelligent caching, request deduplication, and memory optimization.

## Features

### Core Capabilities
- ✅ **TTL-based caching** with automatic expiration and cleanup
- ✅ **Request deduplication** for concurrent permission checks
- ✅ **Singleton pattern** for efficient resource management  
- ✅ **API optimization** with batch requests and intelligent retries
- ✅ **Memory-efficient storage** with LRU eviction and compression
- ✅ **React integration** with hooks and components
- ✅ **Performance monitoring** with comprehensive analytics
- ✅ **Cache warming** and preloading strategies

### Performance Optimizations
- **Request Deduplication**: Prevents duplicate API calls for identical concurrent requests
- **Batch Processing**: Groups multiple permission checks into single API calls
- **Intelligent Caching**: Different TTL values based on permission types
- **Memory Management**: LRU eviction with memory usage limits
- **Cache Warming**: Proactive loading of common permissions

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  React Components │────│  Permission      │────│  TTL Cache      │
│  & Hooks         │    │  Manager         │    │                 │
└─────────────────┘    │  (Singleton)     │    └─────────────────┘
                       │                  │
                       │                  │    ┌─────────────────┐
                       │                  │────│  Request        │
                       │                  │    │  Deduplicator   │
                       └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │  Permission API  │
                       │  (REST/GraphQL)  │
                       └──────────────────┘
```

## Quick Start

### 1. Basic Setup

```javascript
import { PermissionProvider, PermissionGate } from '../services/permissions';

function App() {
  return (
    <PermissionProvider userId="user123">
      <PermissionGate 
        resource="dashboard" 
        action="read"
        fallback={<div>Access denied</div>}
      >
        <Dashboard />
      </PermissionGate>
    </PermissionProvider>
  );
}
```

### 2. Using Hooks

```javascript
import { usePermission, useMultiplePermissions } from '../services/permissions';

function UserProfile() {
  const { hasPermission: canEdit } = usePermission('profile', 'write');
  
  const permissions = [
    { resource: 'users', action: 'read' },
    { resource: 'users', action: 'write' },
    { resource: 'admin', action: 'read' }
  ];
  
  const { results } = useMultiplePermissions(permissions);
  const [canReadUsers, canWriteUsers, canAccessAdmin] = results;
  
  return (
    <div>
      {canEdit && <button>Edit Profile</button>}
      {canAccessAdmin && <button>Admin Panel</button>}
    </div>
  );
}
```

### 3. Programmatic Usage

```javascript
import { createPermissionChecker } from '../services/permissions';

const checker = createPermissionChecker('user123');

// Single permission
const canRead = await checker.check('dashboard', 'read');

// Multiple permissions
const results = await checker.checkMultiple([
  { resource: 'users', action: 'read' },
  { resource: 'reports', action: 'write' }
]);

// Cache management
checker.invalidate({ resource: 'users' });
checker.preWarm(['dashboard', 'profile']);
```

## Configuration

### Environment Variables

```bash
REACT_APP_PERMISSIONS_API=/api/permissions
```

### Custom Configuration

```javascript
import { createPermissionSystem } from '../services/permissions';

const permissionSystem = createPermissionSystem({
  apiEndpoint: '/api/v2/permissions',
  cache: {
    maxSize: 2000,
    defaultTTL: 900000, // 15 minutes
    maxMemoryMB: 150
  },
  preWarm: true
});
```

## API Reference

### PermissionManager (Singleton)

```javascript
const manager = PermissionManager.getInstance();

// Check single permission
await manager.checkPermission(userId, resource, action, context);

// Check multiple permissions  
await manager.checkMultiplePermissions(permissions);

// Cache management
manager.invalidateCache(pattern);
manager.preWarmCache(userId, resources);

// Statistics
manager.getStats();
manager.resetStats();
```

### TTL Cache

```javascript
import TTLCache from '../utils/cache/TTLCache';

const cache = new TTLCache({
  maxSize: 1000,
  defaultTTL: 300000, // 5 minutes
  maxMemoryMB: 50
});

// Basic operations
cache.set('key', 'value', 60000); // 1 minute TTL
const value = cache.get('key');
cache.delete('key');

// Statistics
const stats = cache.getStats();
console.log(`Hit rate: ${stats.hitRate * 100}%`);
```

### Request Deduplicator

```javascript
import RequestDeduplicator from '../utils/cache/RequestDeduplicator';

const deduplicator = new RequestDeduplicator({
  requestTimeout: 30000,
  maxConcurrentRequests: 100
});

// Execute with deduplication
const result = await deduplicator.execute(
  'unique-key',
  () => fetch('/api/data').then(r => r.json())
);
```

## React Components & Hooks

### Components

#### PermissionProvider
```javascript
<PermissionProvider userId="user123">
  {/* Your app components */}
</PermissionProvider>
```

#### PermissionGate
```javascript
<PermissionGate 
  resource="admin"
  action="read"
  context={{ department: 'IT' }}
  fallback={<AccessDenied />}
  loading={<Spinner />}
>
  <AdminPanel />
</PermissionGate>
```

### Hooks

#### usePermission
```javascript
const { hasPermission, isLoading, error } = usePermission(
  'dashboard', 
  'read',
  { context: 'optional' }
);
```

#### useMultiplePermissions
```javascript
const permissions = [
  { resource: 'users', action: 'read' },
  { resource: 'admin', action: 'write' }
];
const { results, isLoading, error } = useMultiplePermissions(permissions);
```

#### usePermissions (Context)
```javascript
const { 
  checkPermission, 
  checkMultiplePermissions,
  invalidatePermissions,
  isReady,
  stats 
} = usePermissions();
```

### Higher-Order Components

```javascript
import { withPermission } from '../services/permissions';

const ProtectedComponent = withPermission('admin', 'read')(MyComponent);
```

## Performance Monitoring

### Built-in Analytics

```javascript
import { createPerformanceMonitor } from '../services/permissions';

const monitor = createPerformanceMonitor();

// Get current stats
const stats = monitor.getStats();
console.log({
  hitRate: `${(stats.hitRate * 100).toFixed(1)}%`,
  cacheSize: stats.cache.size,
  memoryUsage: `${stats.cache.memoryUsageMB}MB`,
  avgResponseTime: `${stats.avgResponseTime.toFixed(1)}ms`
});

// Start monitoring (logs every 5 seconds)
const stopMonitoring = monitor.startMonitoring();
// Later: stopMonitoring();
```

### Key Metrics

- **Hit Rate**: Percentage of requests served from cache
- **Cache Size**: Number of cached permissions
- **Memory Usage**: Total memory consumption  
- **Response Time**: Average API response time
- **Deduplication Rate**: Percentage of deduplicated requests

## Cache Strategies

### TTL Configuration by Resource Type

```javascript
// Different TTL values for different permission types
const getTTLForPermission = (resource, action) => {
  const ttlMap = {
    'admin': 300000,    // 5 minutes - frequent changes
    'user': 600000,     // 10 minutes - moderate changes  
    'public': 1800000,  // 30 minutes - rare changes
    'system': 3600000   // 1 hour - very stable
  };
  return ttlMap[resource] || 600000; // Default 10 minutes
};
```

### Cache Warming Strategies

```javascript
// Pre-warm common permissions on user login
const preWarmPatterns = [
  { userId: '*', resource: 'dashboard', action: 'read' },
  { userId: '*', resource: 'profile', action: 'read' },
  { userId: '*', resource: 'settings', action: 'read' }
];

// Pre-warm user-specific permissions
manager.preWarmCache('user123', [
  'dashboard', 'profile', 'settings', 'reports'
]);
```

### Cache Invalidation Patterns

```javascript
// Invalidate by user
manager.invalidateCache({ userId: 'user123' });

// Invalidate by resource
manager.invalidateCache({ resource: 'users' });

// Invalidate by action
manager.invalidateCache({ action: 'write' });

// Invalidate specific permission
manager.invalidateCache({ 
  userId: 'user123', 
  resource: 'admin', 
  action: 'write' 
});
```

## Testing

### Test Coverage

The system includes comprehensive tests covering:

- ✅ Singleton pattern implementation
- ✅ Cache hit/miss scenarios  
- ✅ TTL expiration behavior
- ✅ Request deduplication
- ✅ Memory management and LRU eviction
- ✅ API error handling
- ✅ Batch request optimization
- ✅ Cache invalidation
- ✅ Performance statistics

### Running Tests

```bash
# Run all permission system tests
npm test tests/services/permissions/ tests/utils/cache/

# Run specific test files
npm test tests/services/permissions/PermissionManager.test.js
npm test tests/utils/cache/TTLCache.test.js
```

### Example Test

```javascript
test('should deduplicate concurrent requests', async () => {
  const mockResponse = { allowed: true };
  fetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(mockResponse)
  });

  // Make concurrent requests
  const promises = Array.from({ length: 5 }, () =>
    manager.checkPermission('user1', 'dashboard', 'read')
  );

  const results = await Promise.all(promises);
  
  expect(results).toEqual([true, true, true, true, true]);
  expect(fetch).toHaveBeenCalledTimes(1); // Only one API call
});
```

## Best Practices

### 1. Cache Configuration

```javascript
// Production configuration
const productionConfig = {
  cache: {
    maxSize: 5000,        // Higher limit for production
    defaultTTL: 600000,   // 10 minutes
    maxMemoryMB: 100,     // 100MB limit
    cleanupInterval: 120000 // 2 minutes
  },
  deduplication: {
    requestTimeout: 30000,
    maxConcurrentRequests: 50
  }
};

// Development configuration  
const developmentConfig = {
  cache: {
    maxSize: 1000,
    defaultTTL: 60000,    // 1 minute for faster testing
    maxMemoryMB: 20
  }
};
```

### 2. Error Handling

```javascript
const PermissionAwareComponent = () => {
  const { hasPermission, isLoading, error } = usePermission('admin', 'read');

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    // Log error for monitoring
    console.error('Permission check failed:', error);
    
    // Fallback to safe default (deny access)
    return <AccessDenied />;
  }

  return hasPermission ? <AdminPanel /> : <AccessDenied />;
};
```

### 3. Performance Optimization

```javascript
// Batch permission checks when possible
const checkMultiplePermissions = async () => {
  const permissions = [
    { resource: 'users', action: 'read' },
    { resource: 'users', action: 'write' },
    { resource: 'reports', action: 'read' }
  ];
  
  // Single API call instead of three
  const results = await manager.checkMultiplePermissions(permissions);
  return results;
};

// Pre-warm cache on route changes
useEffect(() => {
  if (location.pathname === '/admin') {
    checker.preWarm(['users', 'reports', 'settings']);
  }
}, [location.pathname]);
```

### 4. Memory Management

```javascript
// Monitor memory usage
const monitorMemoryUsage = () => {
  const stats = manager.getStats();
  
  if (stats.cache.memoryUsageMB > 80) {
    console.warn('High memory usage detected:', stats.cache.memoryUsageMB);
    
    // Trigger cleanup or reduce cache size
    manager.cache.maxSize = Math.floor(manager.cache.maxSize * 0.8);
  }
};

// Set up periodic monitoring
setInterval(monitorMemoryUsage, 60000); // Every minute
```

## Troubleshooting

### Common Issues

#### 1. High Memory Usage
```javascript
// Check cache statistics
const stats = manager.getStats();
console.log('Memory usage:', stats.cache.memoryUsageMB, 'MB');
console.log('Cache size:', stats.cache.size, 'entries');

// Solutions:
// - Reduce maxSize or maxMemoryMB
// - Enable compression
// - Implement more aggressive cleanup
```

#### 2. Low Hit Rate
```javascript
// Analyze hit rate
const hitRate = stats.hitRate;
if (hitRate < 0.5) {
  // Possible causes:
  // - TTL too short
  // - Cache size too small  
  // - Frequent cache invalidation
  
  // Solutions:
  // - Increase TTL for stable permissions
  // - Increase cache size
  // - Review invalidation patterns
}
```

#### 3. API Timeouts
```javascript
// Increase timeout for slow APIs
const manager = new PermissionManager();
manager.apiTimeout = 15000; // 15 seconds

// Or use retry logic
const checkWithRetry = async (userId, resource, action) => {
  for (let i = 0; i < 3; i++) {
    try {
      return await manager.checkPermission(userId, resource, action);
    } catch (error) {
      if (i === 2) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

### Debug Mode

```javascript
// Enable debug logging
localStorage.setItem('permissions_debug', 'true');

// Custom debug logging
const debugLog = (message, data) => {
  if (localStorage.getItem('permissions_debug')) {
    console.log(`[Permissions] ${message}`, data);
  }
};
```

## Advanced Usage

### Custom Permission Context

```javascript
// Context-aware permissions
const contextualPermission = await manager.checkPermission(
  'user123',
  'document', 
  'edit',
  {
    department: 'IT',
    documentType: 'confidential',
    ownership: 'self'
  }
);
```

### Integration with Auth Systems

```javascript
// JWT token integration
const extractUserIdFromToken = (token) => {
  const decoded = jwt.decode(token);
  return decoded.sub;
};

// Auth0 integration
const auth0UserId = user.sub;
const checker = createPermissionChecker(auth0UserId);
```

### Custom Cache Implementations

```javascript
// Redis cache adapter
class RedisTTLCache extends TTLCache {
  async set(key, value, ttl) {
    await redis.setex(key, ttl / 1000, JSON.stringify(value));
  }
  
  async get(key) {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : undefined;
  }
}
```

## Migration Guide

### From Basic Permission Checks

```javascript
// Before: Direct API calls
const hasPermission = await fetch('/api/check-permission', {
  method: 'POST',
  body: JSON.stringify({ userId, resource, action })
}).then(r => r.json());

// After: Cached permission system
const hasPermission = await manager.checkPermission(userId, resource, action);
```

### From Other Caching Solutions

```javascript
// Migrate existing cache data
const migrateCache = (oldCache, newManager) => {
  for (const [key, value] of oldCache.entries()) {
    const [userId, resource, action] = key.split(':');
    newManager.cache.set(key, value);
  }
};
```

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)
- Documentation: [Full documentation](./docs/)
- Examples: [Usage examples](../examples/PermissionExamples.js)