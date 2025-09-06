/**
 * Auth0 Integration Example
 * 
 * This example shows how to integrate the permission caching system
 * with your existing Auth0 authentication setup.
 */

import { useAuth0 } from '@auth0/auth0-react';
import { PermissionProvider, usePermissions } from '../index.js';

// 1. Create Auth0-compatible API Service
class Auth0PermissionService {
  constructor(auth0Client) {
    this.auth0Client = auth0Client;
  }

  async checkPermission(params, options) {
    try {
      // Get Auth0 access token
      const token = await this.auth0Client.getAccessTokenSilently({
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        scope: 'read:permissions'
      });

      // Make API call to your backend with Auth0 token
      const response = await fetch('/api/auth/permissions/check', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: options?.signal,
        body: JSON.stringify({
          permission: params.permission,
          userId: params.userId,
          tenant: params.tenant,
          resource: params.resource
        })
      });

      if (!response.ok) {
        throw new Error(`Permission check failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.hasPermission;

    } catch (error) {
      if (error.name === 'AbortError') {
        throw error;
      }
      console.error('Permission check error:', error);
      throw new Error(`Permission check failed: ${error.message}`);
    }
  }

  async getUserRole(params, options) {
    try {
      const token = await this.auth0Client.getAccessTokenSilently({
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        scope: 'read:user_role'
      });

      const response = await fetch(`/api/users/${params.userId}/role`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        signal: options?.signal
      });

      if (!response.ok) {
        throw new Error(`Role fetch failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.role;

    } catch (error) {
      if (error.name === 'AbortError') {
        throw error;
      }
      console.error('Role fetch error:', error);
      return null;
    }
  }

  async getUserPermissions(params, options) {
    try {
      const token = await this.auth0Client.getAccessTokenSilently({
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        scope: 'read:user_permissions'
      });

      const response = await fetch(`/api/users/${params.userId}/permissions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        signal: options?.signal
      });

      if (!response.ok) {
        throw new Error(`Permissions fetch failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.permissions;

    } catch (error) {
      if (error.name === 'AbortError') {
        throw error;
      }
      console.error('Permissions fetch error:', error);
      return [];
    }
  }
}

// 2. Permission Provider Wrapper Component
export function Auth0PermissionProvider({ children }) {
  const { getAccessTokenSilently, user, isAuthenticated, isLoading } = useAuth0();
  
  // Create API service instance
  const apiService = useMemo(() => {
    if (!isAuthenticated) return null;
    
    return new Auth0PermissionService({
      getAccessTokenSilently
    });
  }, [getAccessTokenSilently, isAuthenticated]);

  // Don't render until Auth0 is ready
  if (isLoading || !isAuthenticated || !apiService) {
    return <div>Loading authentication...</div>;
  }

  return (
    <PermissionProvider 
      apiService={apiService}
      cacheConfig={{
        ttl: 5 * 60 * 1000,        // 5 minutes
        maxSize: 500,              // Reasonable for single user
        cleanupInterval: 60 * 1000 // 1 minute
      }}
      securityConfig={{
        enableAuditLog: true,
        logPermissionChecks: process.env.NODE_ENV === 'development',
        maxRetries: 3,
        retryDelay: 1000
      }}
    >
      <Auth0UserSync />
      {children}
    </PermissionProvider>
  );
}

// 3. Component to sync Auth0 user with Permission Manager
function Auth0UserSync() {
  const { user } = useAuth0();
  const { setUser } = usePermissions();

  useEffect(() => {
    if (user) {
      // Map Auth0 user to permission manager format
      const permissionUser = {
        id: user.sub, // Auth0 user ID
        email: user.email,
        name: user.name,
        tenant: {
          id: user['https://yourapp.com/tenant_id'] || 'default',
          name: user['https://yourapp.com/tenant_name'] || 'Default Tenant'
        },
        // Include any custom claims from Auth0
        roles: user['https://yourapp.com/roles'] || [],
        metadata: user.user_metadata || {}
      };

      setUser(permissionUser);
    } else {
      setUser(null);
    }
  }, [user, setUser]);

  return null; // This component doesn't render anything
}

// 4. Main App Component with Auth0 + Permissions
export function AppWithAuth0Permissions() {
  return (
    <Auth0Provider
      domain={process.env.REACT_APP_AUTH0_DOMAIN}
      clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
      audience={process.env.REACT_APP_AUTH0_AUDIENCE}
      redirectUri={window.location.origin}
      scope="openid profile email read:permissions read:user_role read:user_permissions"
    >
      <Auth0PermissionProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Router>
      </Auth0PermissionProvider>
    </Auth0Provider>
  );
}

// 5. Example Dashboard Component
function Dashboard() {
  const { user, isAuthenticated } = useAuth0();
  const { 
    hasPermission, 
    hasPermissions, 
    getUserRole,
    getStats 
  } = usePermissions();
  
  const [permissions, setPermissions] = useState({});
  const [userRole, setUserRole] = useState(null);
  const [cacheStats, setCacheStats] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadPermissions = async () => {
      try {
        // Check multiple permissions at once
        const perms = await hasPermissions([
          'read:dashboard',
          'write:dashboard', 
          'admin:users',
          'view:analytics'
        ]);
        
        setPermissions(perms);

        // Get user role
        const role = await getUserRole();
        setUserRole(role);

        // Get cache performance stats
        const stats = getStats();
        setCacheStats(stats);

      } catch (error) {
        console.error('Failed to load permissions:', error);
      }
    };

    loadPermissions();
  }, [isAuthenticated, hasPermissions, getUserRole, getStats]);

  if (!isAuthenticated) {
    return <LoginButton />;
  }

  return (
    <div className="dashboard">
      <header>
        <h1>Dashboard</h1>
        <div className="user-info">
          <img src={user.picture} alt={user.name} />
          <div>
            <p>{user.name}</p>
            <p>{userRole?.name || 'Loading role...'}</p>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main>
        {/* Permission-based content rendering */}
        <PermissionGate permission="read:dashboard">
          <section className="metrics">
            <h2>Metrics</h2>
            <MetricsWidget />
          </section>
        </PermissionGate>

        <PermissionGate permission="write:dashboard">
          <section className="settings">
            <h2>Dashboard Settings</h2>
            <DashboardSettings />
          </section>
        </PermissionGate>

        <PermissionGate 
          permissions={['admin:users', 'admin:system']} 
          requireAll={false}
        >
          <section className="admin">
            <h2>Administration</h2>
            <AdminTools />
          </section>
        </PermissionGate>

        <PermissionGate permission="view:analytics">
          <section className="analytics">
            <h2>Analytics</h2>
            <AnalyticsCharts />
          </section>
        </PermissionGate>
      </main>

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <aside className="debug-info">
          <h3>Debug Info</h3>
          <details>
            <summary>Permissions</summary>
            <pre>{JSON.stringify(permissions, null, 2)}</pre>
          </details>
          <details>
            <summary>Cache Stats</summary>
            <pre>{JSON.stringify(cacheStats?.cache, null, 2)}</pre>
          </details>
          <details>
            <summary>User Role</summary>
            <pre>{JSON.stringify(userRole, null, 2)}</pre>
          </details>
        </aside>
      )}
    </div>
  );
}

// 6. Permission-based Button Component
function ActionButton({ permission, resource, action, children, ...props }) {
  const { hasPermission, isLoading } = usePermission(permission, { resource });

  if (isLoading) {
    return <button disabled>Loading...</button>;
  }

  if (!hasPermission) {
    return null; // Don't render button if no permission
  }

  return (
    <button onClick={action} {...props}>
      {children}
    </button>
  );
}

// Usage example:
function PostActions({ post }) {
  const handleEdit = () => {
    // Edit logic
  };

  const handleDelete = () => {
    // Delete logic
  };

  return (
    <div className="post-actions">
      <ActionButton 
        permission="edit:posts" 
        resource={post.id}
        action={handleEdit}
      >
        Edit Post
      </ActionButton>
      
      <ActionButton 
        permission="delete:posts" 
        resource={post.id}
        action={handleDelete}
        className="danger"
      >
        Delete Post
      </ActionButton>
    </div>
  );
}

// 7. Backend API Route Example (Node.js/Express)
/*
// /api/auth/permissions/check
app.post('/api/auth/permissions/check', authenticateToken, async (req, res) => {
  try {
    const { permission, userId, tenant, resource } = req.body;
    
    // Validate Auth0 token and get user info
    const auth0User = req.user; // From Auth0 middleware
    
    // Check if userId matches authenticated user
    if (auth0User.sub !== userId) {
      return res.status(403).json({ error: 'User mismatch' });
    }

    // Your permission logic here
    // This could check database, call another service, etc.
    const hasPermission = await checkUserPermission({
      userId,
      permission,
      tenant,
      resource,
      userRoles: auth0User['https://yourapp.com/roles'] || []
    });

    res.json({ hasPermission });
    
  } catch (error) {
    console.error('Permission check error:', error);
    res.status(500).json({ error: 'Permission check failed' });
  }
});

// /api/users/:userId/role
app.get('/api/users/:userId/role', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const auth0User = req.user;
    
    if (auth0User.sub !== userId) {
      return res.status(403).json({ error: 'User mismatch' });
    }

    const role = await getUserRole(userId);
    res.json({ role });
    
  } catch (error) {
    console.error('Role fetch error:', error);
    res.status(500).json({ error: 'Role fetch failed' });
  }
});

// /api/users/:userId/permissions
app.get('/api/users/:userId/permissions', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const auth0User = req.user;
    
    if (auth0User.sub !== userId) {
      return res.status(403).json({ error: 'User mismatch' });
    }

    const permissions = await getUserPermissions(userId);
    res.json({ permissions });
    
  } catch (error) {
    console.error('Permissions fetch error:', error);
    res.status(500).json({ error: 'Permissions fetch failed' });
  }
});
*/

// 8. Testing with Auth0
export function createMockAuth0Context(user, permissions = {}) {
  return {
    isAuthenticated: !!user,
    isLoading: false,
    user: user || null,
    getAccessTokenSilently: jest.fn().mockResolvedValue('mock-token'),
    loginWithRedirect: jest.fn(),
    logout: jest.fn()
  };
}

// Test helper
export function renderWithAuth0Permissions(component, { user = null, permissions = {} } = {}) {
  const mockAuth0 = createMockAuth0Context(user, permissions);
  const mockApiService = createMockPermissionApiService(permissions);
  
  return render(
    <Auth0Context.Provider value={mockAuth0}>
      <PermissionProvider apiService={mockApiService}>
        {component}
      </PermissionProvider>
    </Auth0Context.Provider>
  );
}

export default Auth0PermissionProvider;