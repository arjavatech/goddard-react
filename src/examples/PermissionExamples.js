/**
 * Permission System Usage Examples
 * Demonstrates various patterns and use cases for the caching permission system
 */

import React, { useState, useEffect } from 'react';
import {
  PermissionProvider,
  PermissionGate,
  usePermission,
  useMultiplePermissions,
  withPermission,
  createPermissionChecker,
  createPermissionSystem,
  PERMISSIONS
} from '../services/permissions/index.js';

// Example 1: Basic Permission Gate
const BasicPermissionExample = () => {
  return (
    <PermissionGate 
      resource="dashboard" 
      action="read"
      fallback={<div>You don't have access to the dashboard</div>}
      loading={<div>Checking permissions...</div>}
    >
      <div>Welcome to your dashboard!</div>
    </PermissionGate>
  );
};

// Example 2: Using Permission Hook
const PermissionHookExample = () => {
  const { hasPermission, isLoading, error } = usePermission('admin', 'read');

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error checking permissions</div>;

  return (
    <div>
      {hasPermission ? (
        <button>Admin Panel</button>
      ) : (
        <div>Admin access required</div>
      )}
    </div>
  );
};

// Example 3: Multiple Permissions Check
const MultiplePermissionsExample = () => {
  const permissions = [
    { resource: 'users', action: 'read' },
    { resource: 'users', action: 'write' },
    { resource: 'reports', action: 'read' }
  ];

  const { results, isLoading } = useMultiplePermissions(permissions);

  if (isLoading) return <div>Checking permissions...</div>;

  const [canReadUsers, canWriteUsers, canReadReports] = results;

  return (
    <div>
      <h3>Your Permissions:</h3>
      <ul>
        <li>Read Users: {canReadUsers ? '✓' : '✗'}</li>
        <li>Write Users: {canWriteUsers ? '✓' : '✗'}</li>
        <li>Read Reports: {canReadReports ? '✓' : '✗'}</li>
      </ul>
    </div>
  );
};

// Example 4: Higher-Order Component
const AdminPanel = () => <div>Secret Admin Content</div>;
const ProtectedAdminPanel = withPermission('admin', 'read')(AdminPanel);

// Example 5: Conditional Rendering with Context
const ConditionalRenderingExample = () => {
  const { hasPermission: canEdit } = usePermission('profile', 'write');
  const { hasPermission: canDelete } = usePermission('profile', 'delete');

  return (
    <div className="user-profile">
      <h2>User Profile</h2>
      <div>Name: John Doe</div>
      <div>Email: john@example.com</div>
      
      <div className="actions">
        {canEdit && (
          <button className="edit-btn">Edit Profile</button>
        )}
        {canDelete && (
          <button className="delete-btn">Delete Profile</button>
        )}
      </div>
    </div>
  );
};

// Example 6: Permission Checker Utility
const UtilityExample = () => {
  const [permissions, setPermissions] = useState({});
  
  useEffect(() => {
    const checker = createPermissionChecker('user123');
    
    const checkPermissions = async () => {
      const results = await checker.checkMultiple([
        { resource: 'dashboard', action: 'read' },
        { resource: 'settings', action: 'write' },
        { resource: 'reports', action: 'read' }
      ]);
      
      setPermissions({
        dashboard: results[0],
        settings: results[1],
        reports: results[2]
      });
    };
    
    checkPermissions();
  }, []);

  return (
    <div>
      <h3>Permission Status:</h3>
      <pre>{JSON.stringify(permissions, null, 2)}</pre>
    </div>
  );
};

// Example 7: Performance Monitoring
const PerformanceMonitorExample = () => {
  const [stats, setStats] = useState({});

  useEffect(() => {
    const { getStats, startMonitoring } = require('../services/permissions/index.js').createPerformanceMonitor();
    
    // Update stats every 2 seconds
    const interval = setInterval(() => {
      setStats(getStats());
    }, 2000);
    
    // Start performance monitoring
    const stopMonitoring = startMonitoring(10000);
    
    return () => {
      clearInterval(interval);
      stopMonitoring();
    };
  }, []);

  return (
    <div className="performance-stats">
      <h3>Permission System Performance</h3>
      <div>Hit Rate: {(stats.hitRate * 100).toFixed(1)}%</div>
      <div>Cache Size: {stats.cache?.size || 0}</div>
      <div>Memory Usage: {stats.cache?.memoryUsageMB || 0}MB</div>
      <div>Avg Response Time: {stats.avgResponseTime?.toFixed(1) || 0}ms</div>
    </div>
  );
};

// Example 8: Advanced Configuration
const AdvancedConfigExample = () => {
  useEffect(() => {
    // Create customized permission system
    const permissionSystem = createPermissionSystem({
      apiEndpoint: '/api/v2/permissions',
      cache: {
        maxSize: 2000,
        defaultTTL: 900000, // 15 minutes
        maxMemoryMB: 150
      },
      preWarm: true
    });
    
    // Pre-warm cache for current user
    const currentUserId = 'user123';
    permissionSystem.preWarmCache(currentUserId, [
      'dashboard', 'profile', 'settings', 'reports'
    ]);
    
  }, []);

  return <div>Advanced configuration applied</div>;
};

// Example 9: Error Handling
const ErrorHandlingExample = () => {
  const { hasPermission, isLoading, error } = usePermission('admin', 'read');

  if (isLoading) {
    return <div className="loading">Checking permissions...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <h3>Permission Check Failed</h3>
        <p>Error: {error.message}</p>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      Permission Status: {hasPermission ? 'Granted' : 'Denied'}
    </div>
  );
};

// Example 10: Contextual Permissions
const ContextualPermissionExample = () => {
  const userId = 'user123';
  const resourceOwnerId = 'user123'; // Same user
  
  const { hasPermission: canEditOwn } = usePermission(
    'profile', 
    'write', 
    { ownership: 'self', resourceOwnerId }
  );
  
  const { hasPermission: canEditAny } = usePermission(
    'profile', 
    'write', 
    { ownership: 'any' }
  );

  return (
    <div>
      <div>Can edit own profile: {canEditOwn ? 'Yes' : 'No'}</div>
      <div>Can edit any profile: {canEditAny ? 'Yes' : 'No'}</div>
    </div>
  );
};

// Main Example Component
const PermissionExamples = ({ userId = 'user123' }) => {
  return (
    <PermissionProvider userId={userId}>
      <div className="permission-examples">
        <h1>Permission System Examples</h1>
        
        <section>
          <h2>1. Basic Permission Gate</h2>
          <BasicPermissionExample />
        </section>
        
        <section>
          <h2>2. Permission Hook</h2>
          <PermissionHookExample />
        </section>
        
        <section>
          <h2>3. Multiple Permissions</h2>
          <MultiplePermissionsExample />
        </section>
        
        <section>
          <h2>4. HOC Protection</h2>
          <ProtectedAdminPanel />
        </section>
        
        <section>
          <h2>5. Conditional Rendering</h2>
          <ConditionalRenderingExample />
        </section>
        
        <section>
          <h2>6. Permission Utilities</h2>
          <UtilityExample />
        </section>
        
        <section>
          <h2>7. Performance Monitoring</h2>
          <PerformanceMonitorExample />
        </section>
        
        <section>
          <h2>8. Advanced Configuration</h2>
          <AdvancedConfigExample />
        </section>
        
        <section>
          <h2>9. Error Handling</h2>
          <ErrorHandlingExample />
        </section>
        
        <section>
          <h2>10. Contextual Permissions</h2>
          <ContextualPermissionExample />
        </section>
      </div>
    </PermissionProvider>
  );
};

// Usage patterns for different scenarios
export const UsagePatterns = {
  // Pattern 1: Simple resource protection
  SimpleProtection: () => (
    <PermissionGate resource="dashboard" action="read">
      <Dashboard />
    </PermissionGate>
  ),
  
  // Pattern 2: Complex business logic
  BusinessLogic: () => {
    const { hasPermission: canApprove } = usePermission('orders', 'approve');
    const { hasPermission: canReject } = usePermission('orders', 'reject');
    
    const handleOrder = (action) => {
      // Business logic here
    };
    
    return (
      <div>
        {canApprove && <button onClick={() => handleOrder('approve')}>Approve</button>}
        {canReject && <button onClick={() => handleOrder('reject')}>Reject</button>}
      </div>
    );
  },
  
  // Pattern 3: Role-based menu
  RoleBasedMenu: () => {
    const permissions = [
      { resource: 'users', action: 'read' },
      { resource: 'reports', action: 'read' },
      { resource: 'admin', action: 'read' }
    ];
    
    const { results } = useMultiplePermissions(permissions);
    const [canViewUsers, canViewReports, canViewAdmin] = results;
    
    return (
      <nav>
        {canViewUsers && <a href="/users">Users</a>}
        {canViewReports && <a href="/reports">Reports</a>}
        {canViewAdmin && <a href="/admin">Admin</a>}
      </nav>
    );
  }
};

export default PermissionExamples;