/**
 * Permission Caching System Usage Examples
 * 
 * This file demonstrates how to use the secure permission caching system
 * in various scenarios with practical examples.
 */

import { PermissionManager } from '../PermissionManager.js';
import { RequestDeduplicator } from '../RequestDeduplicator.js';
import { TTLCache } from '../../../utils/cache/TTLCache.js';
import { PermissionProvider, usePermissions, usePermission, PermissionGate } from '../PermissionContext.js';

// Example 1: Basic Permission Manager Setup
// ==========================================

class ApiService {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  async checkPermission(params, options) {
    try {
      const response = await this.apiClient.post('/auth/check-permission', params, {
        signal: options.signal,
        timeout: 5000
      });
      return response.data.hasPermission;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw error;
      }
      throw new Error(`Permission check failed: ${error.message}`);
    }
  }

  async getUserRole(params, options) {
    const response = await this.apiClient.get(`/users/${params.userId}/role`, {
      signal: options.signal,
      params: { tenant: params.tenant }
    });
    return response.data.role;
  }

  async getUserPermissions(params, options) {
    const response = await this.apiClient.get(`/users/${params.userId}/permissions`, {
      signal: options.signal,
      params: { tenant: params.tenant }
    });
    return response.data.permissions;
  }
}

// Initialize the permission manager
function createPermissionManager(apiClient) {
  const apiService = new ApiService(apiClient);
  
  return new PermissionManager({
    apiService,
    cacheConfig: {
      ttl: 5 * 60 * 1000,      // 5 minutes
      cleanupInterval: 60 * 1000, // 1 minute
      maxSize: 1000             // Max cached items
    },
    deduplicatorConfig: {
      maxConcurrent: 20,        // Max concurrent requests
      timeout: 10 * 1000        // 10 second timeout
    },
    securityConfig: {
      enableAuditLog: true,
      logPermissionChecks: process.env.NODE_ENV === 'development',
      maxRetries: 3,
      retryDelay: 1000
    }
  });
}

// Example 2: Basic Permission Checking
// ====================================

async function basicPermissionExample(permissionManager, user) {
  // Set the current user context
  permissionManager.setCurrentUser(user);

  try {
    // Check single permission
    const canEditPosts = await permissionManager.hasPermission('edit-posts');
    console.log('Can edit posts:', canEditPosts);

    // Check permission with resource context
    const canEditSpecificPost = await permissionManager.hasPermission('edit-posts', {
      resource: 'post-123'
    });
    console.log('Can edit specific post:', canEditSpecificPost);

    // Check multiple permissions
    const permissions = await permissionManager.hasPermissions([
      'edit-posts',
      'delete-posts',
      'manage-users',
      'view-analytics'
    ]);
    console.log('Multiple permissions:', permissions);

    // Check if user has ANY of the permissions (OR logic)
    const hasAnyAdminPermission = await permissionManager.hasAnyPermission([
      'manage-users',
      'view-analytics',
      'system-admin'
    ]);
    console.log('Has admin permissions:', hasAnyAdminPermission);

    // Check if user has ALL permissions (AND logic)
    const hasAllEditPermissions = await permissionManager.hasAllPermissions([
      'edit-posts',
      'publish-posts'
    ]);
    console.log('Has all edit permissions:', hasAllEditPermissions);

  } catch (error) {
    console.error('Permission check failed:', error);
  }
}

// Example 3: Role-Based Access Control
// ====================================

async function roleBasedExample(permissionManager, user) {
  permissionManager.setCurrentUser(user);

  try {
    // Get user role
    const userRole = await permissionManager.getUserRole();
    console.log('User role:', userRole);

    // Get all user permissions
    const userPermissions = await permissionManager.getUserPermissions();
    console.log('User permissions:', userPermissions);

    // Role-based logic
    switch (userRole?.name) {
      case 'admin':
        console.log('Admin user - full access granted');
        break;
      case 'editor':
        console.log('Editor user - content permissions');
        const canPublish = await permissionManager.hasPermission('publish-posts');
        console.log('Can publish:', canPublish);
        break;
      case 'viewer':
        console.log('Viewer user - read-only access');
        break;
      default:
        console.log('Unknown role - minimal access');
    }

  } catch (error) {
    console.error('Role check failed:', error);
  }
}

// Example 4: Cache Management
// ===========================

function cacheManagementExample(permissionManager) {
  // Get cache statistics
  const stats = permissionManager.getStats();
  console.log('Permission cache stats:', {
    permissionChecks: stats.permissionChecks,
    cacheHits: stats.cacheHits,
    cacheMisses: stats.cacheMisses,
    hitRate: stats.cache.hitRate,
    cacheSize: stats.cache.size,
    memoryUsage: stats.cache.memoryUsage
  });

  // Invalidate cache for specific user
  permissionManager.invalidateUser('user-123');

  // Invalidate all cached permissions
  permissionManager.invalidateAll();

  // Monitor cache performance
  setInterval(() => {
    const currentStats = permissionManager.getStats();
    if (currentStats.cache.hitRate < '70%') {
      console.warn('Low cache hit rate detected:', currentStats.cache.hitRate);
    }
  }, 60000); // Check every minute
}

// Example 5: Request Deduplication
// ================================

async function deduplicationExample() {
  const deduplicator = new RequestDeduplicator({
    maxConcurrent: 10,
    timeout: 5000
  });

  // Mock API call
  let apiCallCount = 0;
  const mockApiCall = async () => {
    apiCallCount++;
    console.log(`API call #${apiCallCount}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { result: `data-${apiCallCount}` };
  };

  try {
    // Multiple concurrent requests with same key
    const promises = [
      deduplicator.deduplicate('user-permissions', mockApiCall),
      deduplicator.deduplicate('user-permissions', mockApiCall),
      deduplicator.deduplicate('user-permissions', mockApiCall)
    ];

    const results = await Promise.all(promises);
    console.log('Results:', results);
    console.log('API calls made:', apiCallCount); // Should be 1

    // Get deduplication statistics
    const stats = deduplicator.getStats();
    console.log('Deduplication stats:', stats);

  } finally {
    deduplicator.destroy();
  }
}

// Example 6: React Context Usage
// ==============================

// App.jsx - Root component setup
function App() {
  const apiService = new ApiService(httpClient);

  return (
    <PermissionProvider 
      apiService={apiService}
      cacheConfig={{ ttl: 5 * 60 * 1000 }}
      securityConfig={{ enableAuditLog: true }}
    >
      <Router>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </Router>
    </PermissionProvider>
  );
}

// Dashboard.jsx - Using permission hooks
function Dashboard() {
  const { hasPermission, user, getUserRole } = usePermissions();
  const [canEdit, setCanEdit] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkPermissions = async () => {
      const editPermission = await hasPermission('edit-dashboard');
      const role = await getUserRole();
      
      setCanEdit(editPermission);
      setUserRole(role);
    };

    if (user) {
      checkPermissions();
    }
  }, [user, hasPermission, getUserRole]);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>User: {user?.name} ({userRole?.name})</p>
      
      {canEdit && (
        <button>Edit Dashboard</button>
      )}

      <PermissionGate permission="view-analytics">
        <AnalyticsWidget />
      </PermissionGate>

      <PermissionGate 
        permissions={['manage-users', 'view-reports']} 
        requireAll={false}
        fallback={<div>Access denied</div>}
      >
        <AdminTools />
      </PermissionGate>
    </div>
  );
}

// UserProfile.jsx - Using single permission hook
function UserProfile({ userId }) {
  const { hasPermission, isLoading } = usePermission('edit-user-profile', {
    resource: userId
  });

  if (isLoading) {
    return <div>Checking permissions...</div>;
  }

  return (
    <div>
      <h2>User Profile</h2>
      {hasPermission ? (
        <EditProfileForm userId={userId} />
      ) : (
        <ReadOnlyProfile userId={userId} />
      )}
    </div>
  );
}

// Example 7: Advanced Patterns
// =============================

// Permission-based routing
function ProtectedRoute({ children, permission, fallback }) {
  const { hasPermission } = usePermissions();
  const [hasAccess, setHasAccess] = useState(null);

  useEffect(() => {
    hasPermission(permission).then(setHasAccess);
  }, [permission, hasPermission]);

  if (hasAccess === null) return <div>Loading...</div>;
  if (!hasAccess) return fallback || <Navigate to="/unauthorized" />;
  
  return children;
}

// Permission-based component factory
function createPermissionComponent(requiredPermission, Component) {
  return function PermissionWrapped(props) {
    const { hasPermission } = usePermissions();
    const [canAccess, setCanAccess] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      hasPermission(requiredPermission)
        .then(result => {
          setCanAccess(result);
          setLoading(false);
        });
    }, [hasPermission]);

    if (loading) return <div>Checking permissions...</div>;
    if (!canAccess) return <div>Access denied</div>;
    
    return <Component {...props} />;
  };
}

// Usage:
const AdminOnlyComponent = createPermissionComponent('admin', AdminPanel);

// Example 8: Error Handling and Monitoring
// ========================================

function setupPermissionMonitoring(permissionManager) {
  // Monitor permission check errors
  const originalHasPermission = permissionManager.hasPermission.bind(permissionManager);
  permissionManager.hasPermission = async (...args) => {
    try {
      return await originalHasPermission(...args);
    } catch (error) {
      // Log to monitoring service
      console.error('Permission check error:', {
        permission: args[0],
        error: error.message,
        user: permissionManager.currentUser?.id,
        timestamp: new Date().toISOString()
      });
      
      // Send to error tracking service
      // errorTracker.captureException(error, {
      //   context: 'permission_check',
      //   user: permissionManager.currentUser?.id,
      //   permission: args[0]
      // });
      
      throw error;
    }
  };

  // Set up performance monitoring
  setInterval(() => {
    const stats = permissionManager.getStats();
    
    // Log performance metrics
    console.log('Permission system metrics:', {
      cacheHitRate: stats.cache.hitRate,
      totalChecks: stats.permissionChecks,
      apiCalls: stats.apiCalls,
      errors: stats.errors,
      cacheSize: stats.cache.size,
      memoryUsage: stats.cache.memoryUsage
    });

    // Alert on performance issues
    if (parseFloat(stats.cache.hitRate) < 70) {
      console.warn('Low cache hit rate detected');
    }

    if (stats.errors > stats.permissionChecks * 0.05) {
      console.warn('High error rate detected');
    }

  }, 5 * 60 * 1000); // Every 5 minutes
}

// Example 9: Testing Utilities
// ============================

// Mock permission manager for testing
export function createMockPermissionManager(mockPermissions = {}) {
  return {
    setCurrentUser: jest.fn(),
    hasPermission: jest.fn(async (permission) => {
      return mockPermissions[permission] || false;
    }),
    hasPermissions: jest.fn(async (permissions) => {
      const results = {};
      for (const permission of permissions) {
        results[permission] = mockPermissions[permission] || false;
      }
      return results;
    }),
    getUserRole: jest.fn(async () => ({ name: 'test-role' })),
    getUserPermissions: jest.fn(async () => Object.keys(mockPermissions)),
    invalidateUser: jest.fn(),
    invalidateAll: jest.fn(),
    getStats: jest.fn(() => ({
      permissionChecks: 0,
      cacheHits: 0,
      cacheMisses: 0
    })),
    destroy: jest.fn()
  };
}

// Test helper for React components
export function renderWithPermissions(component, permissions = {}) {
  const mockManager = createMockPermissionManager(permissions);
  
  return render(
    <PermissionProvider apiService={mockManager}>
      {component}
    </PermissionProvider>
  );
}

// Export all examples
export {
  createPermissionManager,
  basicPermissionExample,
  roleBasedExample,
  cacheManagementExample,
  deduplicationExample,
  setupPermissionMonitoring,
  createPermissionComponent,
  ProtectedRoute
};