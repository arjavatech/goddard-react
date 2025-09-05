import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePermissionCheck } from '../hooks/usePermissions';
import { AuthErrorTypes } from '../types/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermissions?: string | string[];
  requiredRoles?: string | string[];
  requireAll?: boolean;
  fallbackPath?: string;
  requireEmailVerification?: boolean;
  organizationId?: string;
  schoolId?: string;
  tenantId?: string;
  onUnauthorized?: () => void;
  onForbidden?: () => void;
  LoadingComponent?: React.ComponentType;
  UnauthorizedComponent?: React.ComponentType<{ redirectPath: string }>;
  ForbiddenComponent?: React.ComponentType;
  EmailVerificationComponent?: React.ComponentType;
}

const DefaultLoadingComponent: React.FC = () => (
  <div className=\"flex items-center justify-center min-h-screen\">
    <div className=\"animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600\"></div>
    <span className=\"ml-2 text-gray-600\">Loading...</span>
  </div>
);

const DefaultUnauthorizedComponent: React.FC<{ redirectPath: string }> = ({ redirectPath }) => (
  <div className=\"flex flex-col items-center justify-center min-h-screen\">
    <h1 className=\"text-2xl font-bold text-gray-800 mb-4\">Authentication Required</h1>
    <p className=\"text-gray-600 mb-4\">Please log in to access this page.</p>
    <button 
      onClick={() => window.location.href = redirectPath}
      className=\"bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded\"
    >
      Log In
    </button>
  </div>
);

const DefaultForbiddenComponent: React.FC = () => (
  <div className=\"flex flex-col items-center justify-center min-h-screen\">
    <h1 className=\"text-2xl font-bold text-red-600 mb-4\">Access Denied</h1>
    <p className=\"text-gray-600 mb-4\">You don't have permission to access this page.</p>
    <button 
      onClick={() => window.history.back()}
      className=\"bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded\"
    >
      Go Back
    </button>
  </div>
);

const DefaultEmailVerificationComponent: React.FC = () => (
  <div className=\"flex flex-col items-center justify-center min-h-screen\">
    <h1 className=\"text-2xl font-bold text-orange-600 mb-4\">Email Verification Required</h1>
    <p className=\"text-gray-600 mb-4\">Please verify your email address to continue.</p>
    <p className=\"text-sm text-gray-500\">Check your inbox for a verification email.</p>
  </div>
);

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions,
  requiredRoles,
  requireAll = true,
  fallbackPath = '/login',
  requireEmailVerification = true,
  organizationId,
  schoolId,
  tenantId,
  onUnauthorized,
  onForbidden,
  LoadingComponent = DefaultLoadingComponent,
  UnauthorizedComponent = DefaultUnauthorizedComponent,
  ForbiddenComponent = DefaultForbiddenComponent,
  EmailVerificationComponent = DefaultEmailVerificationComponent
}) => {
  const location = useLocation();
  const {
    isAuthenticated,
    isLoading,
    user,
    hasRole,
    checkMultipleRoles,
    belongsToOrganization,
    belongsToSchool,
    belongsToTenant,
    needsEmailVerification,
    error
  } = useAuth();

  // Check permissions if required
  const { isGranted: hasPermissions, isLoading: permissionsLoading } = usePermissionCheck(
    requiredPermissions || []
  );

  // Show loading while authentication is being determined
  if (isLoading || (requiredPermissions && permissionsLoading)) {
    return <LoadingComponent />;
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    onUnauthorized?.();
    
    // Store the attempted URL for redirect after login
    const redirectPath = `${fallbackPath}?returnUrl=${encodeURIComponent(location.pathname + location.search)}`;
    
    if (UnauthorizedComponent) {
      return <UnauthorizedComponent redirectPath={redirectPath} />;
    }
    
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Email verification required but not completed
  if (requireEmailVerification && needsEmailVerification) {
    return <EmailVerificationComponent />;
  }

  // Check organization/school/tenant restrictions
  if (organizationId && !belongsToOrganization(organizationId)) {
    onForbidden?.();
    return <ForbiddenComponent />;
  }

  if (schoolId && !belongsToSchool(schoolId)) {
    onForbidden?.();
    return <ForbiddenComponent />;
  }

  if (tenantId && !belongsToTenant(tenantId)) {
    onForbidden?.();
    return <ForbiddenComponent />;
  }

  // Check role requirements
  if (requiredRoles) {
    const roleArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    const hasRequiredRoles = requireAll 
      ? checkMultipleRoles(roleArray, true)
      : checkMultipleRoles(roleArray, false);

    if (!hasRequiredRoles) {
      onForbidden?.();
      return <ForbiddenComponent />;
    }
  }

  // Check permission requirements
  if (requiredPermissions && !hasPermissions) {
    onForbidden?.();
    return <ForbiddenComponent />;
  }

  // All checks passed - render protected content
  return <>{children}</>;
};

// Higher-order component version
export const withProtectedRoute = <P extends object>(
  Component: React.ComponentType<P>,
  protectionConfig?: Omit<ProtectedRouteProps, 'children'>
) => {
  return (props: P) => (
    <ProtectedRoute {...protectionConfig}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

// Specialized route components for common use cases
export const AdminRoute: React.FC<Omit<ProtectedRouteProps, 'requiredRoles'>> = (props) => (
  <ProtectedRoute {...props} requiredRoles=\"admin\" />
);

export const SuperAdminRoute: React.FC<Omit<ProtectedRouteProps, 'requiredPermissions'>> = (props) => (
  <ProtectedRoute {...props} requiredPermissions=\"super_admin\" />
);

export const TeacherRoute: React.FC<Omit<ProtectedRouteProps, 'requiredRoles'>> = (props) => (
  <ProtectedRoute {...props} requiredRoles={['teacher', 'admin']} requireAll={false} />
);

export const ParentRoute: React.FC<Omit<ProtectedRouteProps, 'requiredRoles'>> = (props) => (
  <ProtectedRoute {...props} requiredRoles={['parent', 'admin']} requireAll={false} />
);

// Route that requires specific resource permissions
interface ResourceProtectedRouteProps extends Omit<ProtectedRouteProps, 'requiredPermissions'> {
  resource: string;
  action?: string;
}

export const ResourceProtectedRoute: React.FC<ResourceProtectedRouteProps> = ({ 
  resource, 
  action = 'read', 
  ...props 
}) => (
  <ProtectedRoute {...props} requiredPermissions={`${resource}:${action}`} />
);