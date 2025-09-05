import { useCallback, useMemo } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { AuthErrorTypes } from '../types/auth';

export const useAuth = () => {
  const authContext = useAuthContext();

  const {
    isAuthenticated,
    isLoading,
    user,
    error,
    permissions,
    roles,
    login,
    logout,
    refreshAuth,
    hasPermission,
    hasRole,
    getToken
  } = authContext;

  // Memoized user info
  const userInfo = useMemo(() => {
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      emailVerified: user.email_verified,
      organizationId: user.organizationId,
      schoolId: user.schoolId,
      tenantId: user.tenantId
    };
  }, [user]);

  // Enhanced permission checking
  const checkPermission = useCallback((permission: string): boolean => {
    return hasPermission(permission);
  }, [hasPermission]);

  const checkRole = useCallback((role: string): boolean => {
    return hasRole(role);
  }, [hasRole]);

  const checkMultiplePermissions = useCallback((requiredPermissions: string[], requireAll = true): boolean => {
    if (!isAuthenticated || !user) return false;

    if (requireAll) {
      return requiredPermissions.every(permission => hasPermission(permission));
    } else {
      return requiredPermissions.some(permission => hasPermission(permission));
    }
  }, [isAuthenticated, user, hasPermission]);

  const checkMultipleRoles = useCallback((requiredRoles: string[], requireAll = true): boolean => {
    if (!isAuthenticated || !user) return false;

    if (requireAll) {
      return requiredRoles.every(role => hasRole(role));
    } else {
      return requiredRoles.some(role => hasRole(role));
    }
  }, [isAuthenticated, user, hasRole]);

  // Safe login with error handling
  const loginSafely = useCallback(async () => {
    try {
      await login();
    } catch (error: any) {
      // Login error is handled by the context, we can add additional handling here if needed
      throw error;
    }
  }, [login]);

  // Safe logout with error handling
  const logoutSafely = useCallback(async () => {
    try {
      await logout();
    } catch (error: any) {
      // Logout error is handled by the context, we can add additional handling here if needed
      // Usually we want to clear local state even if server logout fails
    }
  }, [logout]);

  // Get authenticated token
  const getAuthToken = useCallback(async (): Promise<string | null> => {
    try {
      return await getToken();
    } catch (error) {
      return null;
    }
  }, [getToken]);

  // Check if user is in a specific organization/school
  const belongsToOrganization = useCallback((orgId: string): boolean => {
    return user?.organizationId === orgId;
  }, [user]);

  const belongsToSchool = useCallback((schoolId: string): boolean => {
    return user?.schoolId === schoolId;
  }, [user]);

  const belongsToTenant = useCallback((tenantId: string): boolean => {
    return user?.tenantId === tenantId;
  }, [user]);

  // Error type checking
  const isUnauthorizedError = useMemo(() => {
    return error?.includes('Authentication required') || 
           error?.includes('login_required') ||
           error?.includes('unauthorized');
  }, [error]);

  const isForbiddenError = useMemo(() => {
    return error?.includes('Access denied') || 
           error?.includes('Forbidden') ||
           error?.includes('consent_required');
  }, [error]);

  const isNetworkError = useMemo(() => {
    return error?.includes('Network') || 
           error?.includes('Failed to fetch');
  }, [error]);

  // Authentication status helpers
  const isFullyAuthenticated = useMemo(() => {
    return isAuthenticated && user && user.email_verified;
  }, [isAuthenticated, user]);

  const needsEmailVerification = useMemo(() => {
    return isAuthenticated && user && !user.email_verified;
  }, [isAuthenticated, user]);

  const hasAnyPermission = useCallback((permissionsList: string[]): boolean => {
    return permissionsList.some(permission => hasPermission(permission));
  }, [hasPermission]);

  const hasAnyRole = useCallback((rolesList: string[]): boolean => {
    return rolesList.some(role => hasRole(role));
  }, [hasRole]);

  return {
    // Core auth state
    isAuthenticated,
    isLoading,
    user: userInfo,
    error,
    permissions,
    roles,

    // Auth actions
    login: loginSafely,
    logout: logoutSafely,
    refreshAuth,
    getToken: getAuthToken,

    // Permission checking
    hasPermission: checkPermission,
    hasRole: checkRole,
    hasAnyPermission,
    hasAnyRole,
    checkMultiplePermissions,
    checkMultipleRoles,

    // Organization/tenant checking
    belongsToOrganization,
    belongsToSchool,
    belongsToTenant,

    // Status helpers
    isFullyAuthenticated,
    needsEmailVerification,

    // Error type checking
    isUnauthorizedError,
    isForbiddenError,
    isNetworkError
  };
};