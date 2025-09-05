/**
 * Authentication service for managing user permissions and auth state
 * 
 * This service provides standardized methods for checking user permissions,
 * managing authentication state, and interacting with the Auth0 API.
 */

import { api_base_url, school_id } from '../utils/const';
import { getAuthHeaders } from '../utils/auth';

export const authService = {
  /**
   * Get user permissions from the API
   * 
   * @param {string} userId - The user ID
   * @param {boolean} forceRefresh - Whether to bypass cache
   * @returns {Promise<string[]>} Array of user permissions
   */
  async getUserPermissions(userId, forceRefresh = false) {
    try {
      // For now, return mock permissions since the actual permissions API
      // is not implemented yet. This prevents the build from failing.
      
      // TODO: Implement actual API call when permissions endpoint is available
      const mockPermissions = ['parent', 'read:forms', 'write:forms'];
      
      return mockPermissions;
    } catch (error) {
      console.error('Failed to fetch user permissions:', error);
      return [];
    }
  },

  /**
   * Check user authentication status with the API
   * 
   * @param {string} email - User email
   * @param {Function} getAccessTokenSilently - Auth0 token function
   * @returns {Promise<Object>} User authentication data
   */
  async checkUserAuth(email, getAccessTokenSilently) {
    try {
      const headers = await getAuthHeaders(getAccessTokenSilently);
      
      const response = await fetch(`${api_base_url}/sign_in/check/${school_id}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: email.toLowerCase(),
          auth0_user: true
        })
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error(`API request failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      throw error;
    }
  },

  /**
   * Validate user has required permissions
   * 
   * @param {string[]} requiredPermissions - Required permissions
   * @param {string[]} userPermissions - User's current permissions
   * @returns {boolean} Whether user has all required permissions
   */
  hasPermissions(requiredPermissions, userPermissions) {
    if (!Array.isArray(requiredPermissions) || !Array.isArray(userPermissions)) {
      return false;
    }

    // Super admin bypass
    if (userPermissions.includes('super_admin')) {
      return true;
    }

    return requiredPermissions.every(permission => userPermissions.includes(permission));
  },

  /**
   * Check if user has any of the specified permissions
   * 
   * @param {string[]} permissions - Permissions to check
   * @param {string[]} userPermissions - User's current permissions
   * @returns {boolean} Whether user has at least one permission
   */
  hasAnyPermission(permissions, userPermissions) {
    if (!Array.isArray(permissions) || !Array.isArray(userPermissions)) {
      return false;
    }

    // Super admin bypass
    if (userPermissions.includes('super_admin')) {
      return true;
    }

    return permissions.some(permission => userPermissions.includes(permission));
  }
};