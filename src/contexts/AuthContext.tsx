import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthContextType, AuthState, User, AuthErrorTypes } from '../types/auth';
import { authService } from '../services/authService';

const initialAuthState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  error: null,
  permissions: [],
  roles: []
};

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      await authService.initialize();
      await refreshAuth();
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to initialize authentication',
        isAuthenticated: false,
        user: null,
        permissions: [],
        roles: []
      }));
    }
  };

  const refreshAuth = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const isAuthenticated = await authService.isAuthenticated();
      
      if (!isAuthenticated) {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
          user: null,
          permissions: [],
          roles: []
        }));
        return;
      }

      const user = await authService.getUser();
      
      if (!user) {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
          user: null,
          permissions: [],
          roles: []
        }));
        return;
      }

      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: true,
        user,
        permissions: user.permissions,
        roles: user.roles,
        error: null
      }));
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to refresh authentication',
        isAuthenticated: false,
        user: null,
        permissions: [],
        roles: []
      }));
    }
  };

  const login = async () => {
    try {
      setAuthState(prev => ({ ...prev, error: null }));
      await authService.login();
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        error: error.message || 'Login failed'
      }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, error: null }));
      
      // Clear auth state immediately for better UX
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        user: null,
        permissions: [],
        roles: []
      }));

      await authService.logout();
    } catch (error: any) {
      // Even if logout fails on the server, clear local state
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        user: null,
        permissions: [],
        roles: [],
        error: error.message || 'Logout failed'
      }));
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!authState.isAuthenticated || !authState.user) {
      return false;
    }

    // Super admin bypass
    if (authState.permissions.includes('super_admin')) {
      return true;
    }

    return authState.permissions.includes(permission);
  };

  const hasRole = (role: string): boolean => {
    if (!authState.isAuthenticated || !authState.user) {
      return false;
    }

    return authState.roles.includes(role);
  };

  const getToken = async (): Promise<string | null> => {
    try {
      if (!authState.isAuthenticated) {
        return null;
      }

      return await authService.getToken();
    } catch (error) {
      // Token refresh failed, trigger re-authentication
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        user: null,
        permissions: [],
        roles: [],
        error: 'Session expired'
      }));
      return null;
    }
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    refreshAuth,
    hasPermission,
    hasRole,
    getToken
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};