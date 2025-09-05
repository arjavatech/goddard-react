import React from 'react';
import { useAuth } from '../auth/AuthProvider';

/**
 * Custom hook for permission checking
 * Provides clean API for components to check user permissions
 */
export const usePermissions = () => {
  const { 
    permissions, 
    isLoadingPermissions, 
    isAdmin, 
    isParent, 
    hasAccess,
    hasRole,
    hasPermission 
  } = useAuth();

  return {
    // Permission state
    permissions,
    isLoadingPermissions,
    
    // Basic role checks
    isAdmin,
    isParent,
    hasAccess,
    
    // Route access checks
    canAccessAdminRoutes: isAdmin,
    canAccessParentRoutes: isParent || isAdmin, // Admins can access parent routes
    
    // Specific permission checks (when backend provides granular permissions)
    canViewReports: hasPermission('canViewReports') || isAdmin,
    canEditForms: hasPermission('canEditForms') || isAdmin,
    canManageUsers: hasPermission('canManageUsers') || isAdmin,
    canInviteParents: hasPermission('canInviteParents') || isAdmin,
    canViewApplications: hasPermission('canViewApplications') || isAdmin,
    canAccessFormsRepository: hasPermission('canAccessFormsRepository') || isAdmin,
    canAccessClassroomRepo: hasPermission('canAccessClassroomRepo') || isAdmin,
    
    // Parent-specific permissions
    canViewChildInfo: isParent || isAdmin,
    canSubmitForms: isParent || isAdmin,
    canViewFormHistory: isParent || isAdmin,
    
    // Helper methods
    hasRole,
    hasPermission,
    
    // Permission checking helpers
    checkRole: (role) => {
      if (isLoadingPermissions) return false;
      return hasRole(role);
    },
    
    checkPermission: (permission) => {
      if (isLoadingPermissions) return false;
      return hasPermission(permission);
    },
    
    checkAnyRole: (roles) => {
      if (isLoadingPermissions) return false;
      return roles.some(role => hasRole(role));
    },
    
    checkAllRoles: (roles) => {
      if (isLoadingPermissions) return false;
      return roles.every(role => hasRole(role));
    },
    
    checkAnyPermission: (permissionList) => {
      if (isLoadingPermissions) return false;
      return permissionList.some(permission => hasPermission(permission));
    },
    
    checkAllPermissions: (permissionList) => {
      if (isLoadingPermissions) return false;
      return permissionList.every(permission => hasPermission(permission));
    }
  };
};

/**
 * Higher-order component for permission-based rendering
 */
export const withPermissions = (Component, requiredPermissions = []) => {
  return function PermissionWrappedComponent(props) {
    const { checkAllPermissions, isLoadingPermissions } = usePermissions();
    
    if (isLoadingPermissions) {
      return <div>Loading permissions...</div>;
    }
    
    if (requiredPermissions.length > 0 && !checkAllPermissions(requiredPermissions)) {
      return <div>Access denied - insufficient permissions</div>;
    }
    
    return <Component {...props} />;
  };
};

/**
 * Hook for conditional rendering based on permissions
 */
export const usePermissionGuard = () => {
  const permissions = usePermissions();
  
  return {
    ...permissions,
    
    // Render helpers
    renderIfAdmin: (component) => permissions.isAdmin ? component : null,
    renderIfParent: (component) => permissions.isParent ? component : null,
    renderIfHasAccess: (component) => permissions.hasAccess ? component : null,
    renderIfRole: (role, component) => permissions.hasRole(role) ? component : null,
    renderIfPermission: (permission, component) => 
      permissions.hasPermission(permission) ? component : null,
    
    // Conditional class helpers for styling
    adminClass: (className) => permissions.isAdmin ? className : '',
    parentClass: (className) => permissions.isParent ? className : '',
    roleClass: (role, className) => permissions.hasRole(role) ? className : '',
    permissionClass: (permission, className) => 
      permissions.hasPermission(permission) ? className : ''
  };
};