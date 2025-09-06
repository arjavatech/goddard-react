/**
 * User-specific React hooks
 * Provides convenient hooks for user management operations
 */

import { useCallback } from 'react';
import { userService } from '../endpoints/userService';
import { 
  useApiRequest, 
  usePaginatedApi, 
  UseApiRequestResult, 
  UsePaginatedApiResult 
} from './useApiRequest';
import { 
  User, 
  CreateUserRequest, 
  UpdateUserRequest, 
  QueryOptions 
} from '../types';

export interface UseUsersResult extends UsePaginatedApiResult<User> {
  searchUsers: (query: string) => Promise<void>;
  filterByRole: (role: string) => Promise<void>;
}

export interface UseUserResult extends UseApiRequestResult<User> {
  activate: () => Promise<User>;
  deactivate: () => Promise<User>;
}

// Hook for getting paginated users
export function useUsers(options?: QueryOptions): UseUsersResult {
  const paginatedResult = usePaginatedApi<User>('/api/users', {
    immediate: true,
    ...options
  });

  const searchUsers = useCallback(async (query: string) => {
    await paginatedResult.execute({ 
      url: '/api/users/search',
      params: { search: query }
    });
  }, [paginatedResult.execute]);

  const filterByRole = useCallback(async (role: string) => {
    await paginatedResult.execute({ 
      url: '/api/users/by-role',
      params: { role }
    });
  }, [paginatedResult.execute]);

  return {
    ...paginatedResult,
    searchUsers,
    filterByRole
  };
}

// Hook for getting a single user
export function useUser(id: string, immediate: boolean = true): UseUserResult {
  const result = useApiRequest<User>(
    { url: `/api/users/${id}`, method: 'GET' },
    { immediate }
  );

  const activate = useCallback(async (): Promise<User> => {
    return userService.activateUser(id);
  }, [id]);

  const deactivate = useCallback(async (): Promise<User> => {
    return userService.deactivateUser(id);
  }, [id]);

  return {
    ...result,
    activate,
    deactivate
  };
}

// Hook for creating a user
export function useCreateUser() {
  return useApiRequest<User>(
    { url: '/api/users', method: 'POST' },
    { immediate: false }
  );
}

// Hook for updating a user
export function useUpdateUser(id: string) {
  return useApiRequest<User>(
    { url: `/api/users/${id}`, method: 'PUT' },
    { immediate: false }
  );
}

// Hook for deleting a user
export function useDeleteUser() {
  return useApiRequest<void>(
    { url: '', method: 'DELETE' },
    { immediate: false }
  );
}

// Advanced user management hook
export function useUserManagement() {
  const createUser = useCreateUser();
  const updateUser = useApiRequest<User>(
    { url: '', method: 'PUT' },
    { immediate: false }
  );
  const deleteUser = useDeleteUser();

  const handleCreateUser = useCallback(async (userData: CreateUserRequest): Promise<User> => {
    return createUser.execute({ data: userData });
  }, [createUser.execute]);

  const handleUpdateUser = useCallback(async (id: string, userData: UpdateUserRequest): Promise<User> => {
    return updateUser.execute({ 
      url: `/api/users/${id}`,
      data: userData 
    });
  }, [updateUser.execute]);

  const handleDeleteUser = useCallback(async (id: string): Promise<void> => {
    await deleteUser.execute({ url: `/api/users/${id}` });
  }, [deleteUser.execute]);

  return {
    createUser: {
      ...createUser,
      execute: handleCreateUser
    },
    updateUser: {
      ...updateUser,
      execute: handleUpdateUser
    },
    deleteUser: {
      ...deleteUser,
      execute: handleDeleteUser
    }
  };
}