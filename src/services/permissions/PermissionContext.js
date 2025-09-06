/**
 * PermissionContext - React context for app-wide permission state
 * 
 * Provides React context and hooks for managing permissions throughout the application.
 * Features:
 * - React Context for global permission state
 * - Custom hooks for easy permission checking
 * - HOC for component-level permission guards
 * - Real-time permission updates
 * - SSR-safe implementation
 * - Error boundaries for permission failures
 * 
 * @example
 * // In your app root
 * <PermissionProvider apiService={apiService}>
 *   <App />
 * </PermissionProvider>
 * 
 * // In components
 * const { hasPermission, getUserRole } = usePermissions();
 * const canEdit = await hasPermission('edit-posts');
 * 
 * // Using HOC
 * const ProtectedComponent = withPermission('admin')(MyComponent);
 */

import React, { createContext, useContext, useEffect, useReducer, useCallback, useMemo } from 'react';
import { PermissionManager } from './PermissionManager.js';

// Permission Context
const PermissionContext = createContext(null);

// Action types for the permission reducer
const PERMISSION_ACTIONS = {
  SET_USER: 'SET_USER',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CACHE_PERMISSION: 'CACHE_PERMISSION',
  INVALIDATE_CACHE: 'INVALIDATE_CACHE',
  SET_ROLE: 'SET_ROLE',
  SET_PERMISSIONS: 'SET_PERMISSIONS',
  UPDATE_STATS: 'UPDATE_STATS'
};

/**
 * Initial state for permission context
 */
const initialState = {
  user: null,
  role: null,
  permissions: [],
  isLoading: false,
  error: null,
  permissionCache: new Map(),
  stats: {
    checks: 0,
    cacheHits: 0,
    cacheMisses: 0
  }
};

/**
 * Reducer for permission state management
 */
function permissionReducer(state, action) {
  switch (action.type) {
    case PERMISSION_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        // Clear cache when user changes
        permissionCache: action.payload?.id !== state.user?.id ? new Map() : state.permissionCache
      };

    case PERMISSION_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case PERMISSION_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case PERMISSION_ACTIONS.CACHE_PERMISSION:
      const newCache = new Map(state.permissionCache);
      newCache.set(action.payload.key, {
        value: action.payload.value,
        timestamp: Date.now()
      });
      return {
        ...state,
        permissionCache: newCache
      };

    case PERMISSION_ACTIONS.INVALIDATE_CACHE:
      return {
        ...state,
        permissionCache: action.payload ? 
          new Map([...state.permissionCache].filter(([key]) => !key.startsWith(action.payload))) :
          new Map()
      };

    case PERMISSION_ACTIONS.SET_ROLE:
      return {
        ...state,
        role: action.payload
      };

    case PERMISSION_ACTIONS.SET_PERMISSIONS:
      return {
        ...state,
        permissions: action.payload || []
      };

    case PERMISSION_ACTIONS.UPDATE_STATS:
      return {
        ...state,
        stats: {
          ...state.stats,
          ...action.payload
        }
      };

    default:
      return state;
  }
}

/**
 * PermissionProvider component that wraps the app with permission context
 */
export function PermissionProvider({ 
  children, 
  apiService, 
  cacheConfig = {},
  securityConfig = {},
  fallbackComponent = null 
}) {
  const [state, dispatch] = useReducer(permissionReducer, initialState);
  
  // Initialize permission manager
  const permissionManager = useMemo(() => {
    if (!apiService) {
      console.warn('PermissionProvider: apiService not provided, permission checks will fail');
      return null;
    }
    
    return new PermissionManager({
      apiService,
      cacheConfig: {
        ttl: 5 * 60 * 1000, // 5 minutes default
        ...cacheConfig
      },
      securityConfig: {
        enableAuditLog: true,
        logPermissionChecks: process.env.NODE_ENV === 'development',
        ...securityConfig
      }
    });
  }, [apiService, cacheConfig, securityConfig]);

  // Set current user in permission manager when state changes
  useEffect(() => {
    if (permissionManager && state.user) {
      permissionManager.setCurrentUser(state.user);
    }
  }, [permissionManager, state.user]);

  /**
   * Set the current user
   */
  const setUser = useCallback((user) => {
    dispatch({ type: PERMISSION_ACTIONS.SET_USER, payload: user });
  }, []);

  /**
   * Check if user has a specific permission
   */
  const hasPermission = useCallback(async (permission, options = {}) => {
    if (!permissionManager) return false;
    
    try {
      dispatch({ type: PERMISSION_ACTIONS.SET_LOADING, payload: true });
      
      const result = await permissionManager.hasPermission(permission, options);
      
      // Cache result in context for immediate access
      dispatch({
        type: PERMISSION_ACTIONS.CACHE_PERMISSION,
        payload: {
          key: `${permission}:${options.resource || ''}`,
          value: result
        }
      });
      
      // Update stats
      const stats = permissionManager.getStats();
      dispatch({
        type: PERMISSION_ACTIONS.UPDATE_STATS,
        payload: {
          checks: stats.permissionChecks,
          cacheHits: stats.cacheHits,
          cacheMisses: stats.cacheMisses
        }
      });
      
      return result;
      
    } catch (error) {
      dispatch({ type: PERMISSION_ACTIONS.SET_ERROR, payload: error });
      return false;
    } finally {
      dispatch({ type: PERMISSION_ACTIONS.SET_LOADING, payload: false });
    }
  }, [permissionManager]);

  /**
   * Check multiple permissions at once
   */
  const hasPermissions = useCallback(async (permissions, options = {}) => {
    if (!permissionManager) {
      return permissions.reduce((acc, perm) => ({ ...acc, [perm]: false }), {});
    }
    
    try {
      dispatch({ type: PERMISSION_ACTIONS.SET_LOADING, payload: true });
      
      const results = await permissionManager.hasPermissions(permissions, options);
      
      // Cache results
      for (const [permission, hasIt] of Object.entries(results)) {
        dispatch({
          type: PERMISSION_ACTIONS.CACHE_PERMISSION,
          payload: {
            key: `${permission}:${options.resource || ''}`,
            value: hasIt
          }
        });
      }
      
      return results;
      
    } catch (error) {
      dispatch({ type: PERMISSION_ACTIONS.SET_ERROR, payload: error });
      return permissions.reduce((acc, perm) => ({ ...acc, [perm]: false }), {});
    } finally {
      dispatch({ type: PERMISSION_ACTIONS.SET_LOADING, payload: false });
    }
  }, [permissionManager]);

  /**
   * Get user role
   */
  const getUserRole = useCallback(async (options = {}) => {
    if (!permissionManager) return null;
    
    try {
      const role = await permissionManager.getUserRole(options);
      dispatch({ type: PERMISSION_ACTIONS.SET_ROLE, payload: role });
      return role;
    } catch (error) {
      dispatch({ type: PERMISSION_ACTIONS.SET_ERROR, payload: error });
      return null;
    }
  }, [permissionManager]);

  /**
   * Get all user permissions
   */
  const getUserPermissions = useCallback(async (options = {}) => {
    if (!permissionManager) return [];
    
    try {
      const permissions = await permissionManager.getUserPermissions(options);
      dispatch({ type: PERMISSION_ACTIONS.SET_PERMISSIONS, payload: permissions });
      return permissions;
    } catch (error) {
      dispatch({ type: PERMISSION_ACTIONS.SET_ERROR, payload: error });
      return [];
    }
  }, [permissionManager]);

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = useCallback(async (permissions, options = {}) => {
    if (!permissionManager) return false;
    
    try {
      return await permissionManager.hasAnyPermission(permissions, options);
    } catch (error) {
      dispatch({ type: PERMISSION_ACTIONS.SET_ERROR, payload: error });
      return false;
    }
  }, [permissionManager]);

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = useCallback(async (permissions, options = {}) => {
    if (!permissionManager) return false;
    
    try {
      return await permissionManager.hasAllPermissions(permissions, options);
    } catch (error) {
      dispatch({ type: PERMISSION_ACTIONS.SET_ERROR, payload: error });
      return false;
    }
  }, [permissionManager]);

  /**
   * Invalidate permission cache
   */
  const invalidateCache = useCallback((userId = null) => {
    if (permissionManager) {
      if (userId) {
        permissionManager.invalidateUser(userId);
        dispatch({ 
          type: PERMISSION_ACTIONS.INVALIDATE_CACHE, 
          payload: `user:${userId}` 
        });
      } else {
        permissionManager.invalidateAll();
        dispatch({ type: PERMISSION_ACTIONS.INVALIDATE_CACHE });
      }
    }
  }, [permissionManager]);

  /**
   * Get permission statistics
   */
  const getStats = useCallback(() => {
    if (!permissionManager) return null;
    return permissionManager.getStats();
  }, [permissionManager]);

  /**
   * Get cached permission (synchronous)
   */
  const getCachedPermission = useCallback((permission, resource = '') => {
    const key = `${permission}:${resource}`;
    const cached = state.permissionCache.get(key);
    
    if (!cached) return undefined;
    
    // Check if cache is still valid (5 minutes)
    const now = Date.now();
    const age = now - cached.timestamp;
    const maxAge = cacheConfig.ttl || 5 * 60 * 1000;
    
    if (age > maxAge) {
      // Remove expired entry
      const newCache = new Map(state.permissionCache);
      newCache.delete(key);
      dispatch({ type: PERMISSION_ACTIONS.INVALIDATE_CACHE });
      return undefined;
    }
    
    return cached.value;
  }, [state.permissionCache, cacheConfig.ttl]);

  // Context value
  const contextValue = useMemo(() => ({
    // State
    user: state.user,
    role: state.role,
    permissions: state.permissions,
    isLoading: state.isLoading,
    error: state.error,
    stats: state.stats,
    
    // Actions
    setUser,
    hasPermission,
    hasPermissions,
    hasAnyPermission,
    hasAllPermissions,
    getUserRole,
    getUserPermissions,
    invalidateCache,
    getStats,
    getCachedPermission,
    
    // Manager instance (for advanced usage)
    permissionManager
  }), [
    state,
    setUser,
    hasPermission,
    hasPermissions,
    hasAnyPermission,
    hasAllPermissions,
    getUserRole,
    getUserPermissions,
    invalidateCache,
    getStats,
    getCachedPermission,
    permissionManager
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (permissionManager) {
        permissionManager.destroy();
      }
    };
  }, [permissionManager]);

  // Error fallback
  if (state.error && fallbackComponent) {
    return React.cloneElement(fallbackComponent, { error: state.error });
  }

  return (
    <PermissionContext.Provider value={contextValue}>
      {children}
    </PermissionContext.Provider>
  );
}

/**
 * Hook to access permission context
 */
export function usePermissions() {
  const context = useContext(PermissionContext);
  
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  
  return context;
}

/**
 * Hook for checking a specific permission with caching
 */
export function usePermission(permission, options = {}) {
  const { hasPermission, getCachedPermission, isLoading } = usePermissions();
  const [hasIt, setHasIt] = React.useState(() => getCachedPermission(permission, options.resource));
  const [loading, setLoading] = React.useState(false);
  
  useEffect(() => {
    let cancelled = false;
    
    // Check cache first
    const cached = getCachedPermission(permission, options.resource);
    if (cached !== undefined) {
      setHasIt(cached);
      return;
    }
    
    // Fetch from API
    setLoading(true);
    hasPermission(permission, options)
      .then(result => {
        if (!cancelled) {
          setHasIt(result);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    
    return () => {
      cancelled = true;
    };
  }, [permission, options.resource, hasPermission, getCachedPermission]);
  
  return {
    hasPermission: hasIt,
    isLoading: loading || isLoading,
    checkPermission: () => hasPermission(permission, options)
  };
}

/**
 * Hook for checking multiple permissions
 */
export function usePermissions(permissions) {
  const { hasPermissions: checkPermissions, isLoading } = usePermissions();
  const [results, setResults] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  
  useEffect(() => {
    if (!permissions || permissions.length === 0) return;
    
    let cancelled = false;
    
    setLoading(true);
    checkPermissions(permissions)
      .then(results => {
        if (!cancelled) {
          setResults(results);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    
    return () => {
      cancelled = true;
    };
  }, [permissions, checkPermissions]);
  
  return {
    permissions: results,
    isLoading: loading || isLoading,
    checkPermissions: () => checkPermissions(permissions)
  };
}

/**
 * Higher-order component for protecting components with permissions
 */
export function withPermission(requiredPermission, options = {}) {
  return function PermissionWrapper(WrappedComponent) {
    const ComponentWithPermission = (props) => {
      const { hasPermission: checkHasPermission } = usePermissions();
      const [hasPermission, setHasPermission] = React.useState(null);
      const [isLoading, setIsLoading] = React.useState(true);
      
      useEffect(() => {
        let cancelled = false;
        
        checkHasPermission(requiredPermission, options)
          .then(result => {
            if (!cancelled) {
              setHasPermission(result);
              setIsLoading(false);
            }
          });
        
        return () => {
          cancelled = true;
        };
      }, [requiredPermission, checkHasPermission]);
      
      if (isLoading) {
        return options.loadingComponent || <div>Loading...</div>;
      }
      
      if (!hasPermission) {
        return options.fallbackComponent || <div>Access Denied</div>;
      }
      
      return <WrappedComponent {...props} />;
    };
    
    ComponentWithPermission.displayName = `withPermission(${WrappedComponent.displayName || WrappedComponent.name})`;
    
    return ComponentWithPermission;
  };
}

/**
 * Component for conditional rendering based on permissions
 */
export function PermissionGate({ 
  children, 
  permission, 
  permissions,
  requireAll = false,
  resource,
  fallback = null,
  loading = <div>Loading permissions...</div>
}) {
  const { hasPermission, hasPermissions, hasAllPermissions, hasAnyPermission } = usePermissions();
  const [hasAccess, setHasAccess] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  
  useEffect(() => {
    let cancelled = false;
    
    const checkAccess = async () => {
      try {
        let result = false;
        
        if (permission) {
          result = await hasPermission(permission, { resource });
        } else if (permissions && permissions.length > 0) {
          if (requireAll) {
            result = await hasAllPermissions(permissions, { resource });
          } else {
            result = await hasAnyPermission(permissions, { resource });
          }
        }
        
        if (!cancelled) {
          setHasAccess(result);
          setIsLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          setHasAccess(false);
          setIsLoading(false);
        }
      }
    };
    
    checkAccess();
    
    return () => {
      cancelled = true;
    };
  }, [permission, permissions, requireAll, resource, hasPermission, hasPermissions, hasAllPermissions, hasAnyPermission]);
  
  if (isLoading) {
    return loading;
  }
  
  if (!hasAccess) {
    return fallback;
  }
  
  return children;
}

export default PermissionContext;