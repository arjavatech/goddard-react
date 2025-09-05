import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import { authService } from '../services/authService';

interface PermissionHookState {
  permissions: string[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface UsePermissionsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableCache?: boolean;
}

export const usePermissions = (options: UsePermissionsOptions = {}) => {
  const {
    autoRefresh = false,
    refreshInterval = 5 * 60 * 1000, // 5 minutes
    enableCache = true
  } = options;

  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [state, setState] = useState<PermissionHookState>({
    permissions: [],
    isLoading: true,
    error: null,
    lastUpdated: null
  });

  const refreshPermissions = useCallback(async (forceRefresh = false) => {
    if (!isAuthenticated || !user) {
      setState(prev => ({
        ...prev,
        permissions: [],
        isLoading: false,
        error: null
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const permissions = await authService.getUserPermissions(user.id, forceRefresh);
      
      setState(prev => ({
        ...prev,
        permissions,
        isLoading: false,
        error: null,
        lastUpdated: new Date()
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to fetch permissions'
      }));
    }
  }, [isAuthenticated, user]);

  // Initial load and auth state changes
  useEffect(() => {
    if (!authLoading) {
      refreshPermissions();
    }
  }, [authLoading, refreshPermissions]);

  // Auto-refresh if enabled
  useEffect(() => {
    if (!autoRefresh || !isAuthenticated) return;

    const interval = setInterval(() => {
      refreshPermissions();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshPermissions, isAuthenticated]);

  // Permission checking functions
  const hasPermission = useCallback((permission: string): boolean => {
    if (!isAuthenticated || state.isLoading) return false;
    
    // Super admin bypass
    if (state.permissions.includes('super_admin')) {
      return true;
    }

    return state.permissions.includes(permission);
  }, [isAuthenticated, state.permissions, state.isLoading]);

  const hasAllPermissions = useCallback((requiredPermissions: string[]): boolean => {
    if (!isAuthenticated || state.isLoading) return false;
    
    // Super admin bypass
    if (state.permissions.includes('super_admin')) {
      return true;
    }

    return requiredPermissions.every(permission => state.permissions.includes(permission));
  }, [isAuthenticated, state.permissions, state.isLoading]);

  const hasAnyPermission = useCallback((requiredPermissions: string[]): boolean => {
    if (!isAuthenticated || state.isLoading) return false;
    
    // Super admin bypass
    if (state.permissions.includes('super_admin')) {
      return true;
    }

    return requiredPermissions.some(permission => state.permissions.includes(permission));
  }, [isAuthenticated, state.permissions, state.isLoading]);

  // Resource-specific permission checking
  const canAccess = useCallback((resource: string, action: string = 'read'): boolean => {
    const permissionKey = `${resource}:${action}`;
    return hasPermission(permissionKey);
  }, [hasPermission]);

  const canRead = useCallback((resource: string): boolean => {
    return canAccess(resource, 'read');
  }, [canAccess]);

  const canWrite = useCallback((resource: string): boolean => {
    return canAccess(resource, 'write');
  }, [canAccess]);

  const canCreate = useCallback((resource: string): boolean => {
    return canAccess(resource, 'create');
  }, [canAccess]);

  const canUpdate = useCallback((resource: string): boolean => {
    return canAccess(resource, 'update');
  }, [canAccess]);

  const canDelete = useCallback((resource: string): boolean => {
    return canAccess(resource, 'delete');
  }, [canAccess]);

  // Admin checking
  const isAdmin = useMemo(() => {
    return hasPermission('admin') || hasPermission('super_admin');
  }, [hasPermission]);

  const isSuperAdmin = useMemo(() => {
    return hasPermission('super_admin');
  }, [hasPermission]);

  // Permission categories
  const getPermissionsByCategory = useCallback((category: string): string[] => {
    return state.permissions.filter(permission => permission.startsWith(`${category}:`));
  }, [state.permissions]);

  // Force refresh permissions
  const forceRefresh = useCallback(() => {
    refreshPermissions(true);
  }, [refreshPermissions]);

  // Cache status
  const cacheAge = useMemo(() => {
    if (!state.lastUpdated) return null;
    return Date.now() - state.lastUpdated.getTime();
  }, [state.lastUpdated]);

  const isCacheStale = useMemo(() => {
    if (!state.lastUpdated) return true;
    return cacheAge !== null && cacheAge > refreshInterval;
  }, [state.lastUpdated, cacheAge, refreshInterval]);

  return {
    // State
    permissions: state.permissions,
    isLoading: state.isLoading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    cacheAge,
    isCacheStale,

    // Permission checking
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,

    // Resource-based permissions
    canAccess,
    canRead,
    canWrite,
    canCreate,
    canUpdate,
    canDelete,

    // Role-based shortcuts
    isAdmin,
    isSuperAdmin,

    // Utilities
    getPermissionsByCategory,
    forceRefresh
  };
};

// Hook for checking specific permissions with loading state
export const usePermissionCheck = (requiredPermissions: string | string[]) => {
  const { hasPermission, hasAllPermissions, isLoading } = usePermissions();

  const isGranted = useMemo(() => {
    if (isLoading) return false;
    
    if (Array.isArray(requiredPermissions)) {
      return hasAllPermissions(requiredPermissions);
    } else {
      return hasPermission(requiredPermissions);
    }
  }, [requiredPermissions, hasPermission, hasAllPermissions, isLoading]);

  return {
    isGranted,
    isLoading,
    isDenied: !isLoading && !isGranted
  };
};

// Hook for resource-based permission checking
export const useResourcePermissions = (resource: string) => {
  const {
    canRead,
    canWrite,
    canCreate,
    canUpdate,
    canDelete,
    isLoading
  } = usePermissions();

  return useMemo(() => ({
    canRead: canRead(resource),
    canWrite: canWrite(resource),
    canCreate: canCreate(resource),
    canUpdate: canUpdate(resource),
    canDelete: canDelete(resource),
    isLoading
  }), [resource, canRead, canWrite, canCreate, canUpdate, canDelete, isLoading]);
};