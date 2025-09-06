/**
 * User Service API endpoints
 * Handles user-related API operations
 */

import { apiService } from '../ApiService';
import { 
  User, 
  CreateUserRequest, 
  UpdateUserRequest,
  PaginatedResponse,
  QueryOptions 
} from '../types';

export class UserService {
  private baseUrl = '/api/users';

  async getUsers(options?: QueryOptions): Promise<PaginatedResponse<User>> {
    const params = this.buildQueryParams(options);
    return apiService.get<PaginatedResponse<User>>(this.baseUrl, { params });
  }

  async getUserById(id: string): Promise<User> {
    return apiService.get<User>(`${this.baseUrl}/${id}`);
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    return apiService.post<User>(this.baseUrl, userData);
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    return apiService.put<User>(`${this.baseUrl}/${id}`, userData);
  }

  async deleteUser(id: string): Promise<void> {
    await apiService.delete(`${this.baseUrl}/${id}`);
  }

  async searchUsers(query: string, options?: QueryOptions): Promise<PaginatedResponse<User>> {
    const params = {
      ...this.buildQueryParams(options),
      search: query
    };
    return apiService.get<PaginatedResponse<User>>(`${this.baseUrl}/search`, { params });
  }

  async getUsersByRole(role: string, options?: QueryOptions): Promise<PaginatedResponse<User>> {
    const params = {
      ...this.buildQueryParams(options),
      role
    };
    return apiService.get<PaginatedResponse<User>>(`${this.baseUrl}/by-role`, { params });
  }

  async activateUser(id: string): Promise<User> {
    return apiService.post<User>(`${this.baseUrl}/${id}/activate`);
  }

  async deactivateUser(id: string): Promise<User> {
    return apiService.post<User>(`${this.baseUrl}/${id}/deactivate`);
  }

  private buildQueryParams(options?: QueryOptions): Record<string, any> {
    if (!options) return {};

    const params: Record<string, any> = {};

    if (options.page) params.page = options.page;
    if (options.pageSize) params.pageSize = options.pageSize;
    if (options.search) params.search = options.search;
    
    if (options.sort && options.sort.length > 0) {
      params.sort = options.sort.map(s => `${s.field}:${s.direction}`).join(',');
    }
    
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params[`filter.${key}`] = value;
        }
      });
    }

    if (options.include) {
      params.include = options.include.join(',');
    }

    if (options.exclude) {
      params.exclude = options.exclude.join(',');
    }

    return params;
  }
}

// Export singleton instance
export const userService = new UserService();