/**
 * PermissionManager - Centralized permission management with caching
 * 
 * Manages user permissions with intelligent caching, deduplication, and security.
 * Features:
 * - TTL-based permission caching (5 minutes default)
 * - Request deduplication to prevent race conditions
 * - Hierarchical permission checking
 * - Bulk permission operations
 * - Automatic cache invalidation
 * - Security audit logging
 * - Memory-efficient operations
 * 
 * @example
 * const manager = new PermissionManager({ apiService, cacheConfig: { ttl: 300000 } });
 * 
 * // Check single permission
 * const canEdit = await manager.hasPermission('edit-posts');
 * 
 * // Check multiple permissions
 * const permissions = await manager.hasPermissions(['edit-posts', 'delete-posts']);
 * 
 * // Get user role
 * const role = await manager.getUserRole();
 */

import { TTLCache } from '../../utils/cache/TTLCache.js';
import { RequestDeduplicator } from './RequestDeduplicator.js';

export class PermissionManager {
  /**
   * Create a new PermissionManager
   * @param {Object} options - Configuration options
   * @param {Object} options.apiService - API service for fetching permissions
   * @param {Object} options.cacheConfig - Cache configuration
   * @param {Object} options.deduplicatorConfig - Request deduplicator configuration
   * @param {Object} options.securityConfig - Security configuration
   */
  constructor(options = {}) {
    if (!options.apiService) {
      throw new Error('PermissionManager: apiService is required');
    }
    
    this.apiService = options.apiService;
    
    // Initialize cache with 5-minute TTL for permissions
    const cacheConfig = {
      ttl: 5 * 60 * 1000, // 5 minutes
      cleanupInterval: 60 * 1000, // 1 minute cleanup
      maxSize: 500, // Reasonable limit for permissions
      ...options.cacheConfig
    };
    
    this.cache = new TTLCache(cacheConfig);
    
    // Initialize request deduplicator
    const deduplicatorConfig = {
      maxConcurrent: 20,
      timeout: 10 * 1000, // 10 seconds for permission checks
      ...options.deduplicatorConfig
    };
    
    this.deduplicator = new RequestDeduplicator(deduplicatorConfig);
    
    // Security configuration
    this.securityConfig = {
      enableAuditLog: true,
      logPermissionChecks: false, // Can be enabled for debugging
      maxRetries: 3,
      retryDelay: 1000,
      ...options.securityConfig
    };
    
    // User context
    this.currentUser = null;
    this.currentTenant = null;
    
    // Audit log for security monitoring
    this.auditLog = [];
    
    // Statistics
    this.stats = {
      permissionChecks: 0,
      cacheHits: 0,
      cacheMisses: 0,
      apiCalls: 0,
      errors: 0,
      invalidations: 0
    };
    
    // Bind methods
    this.hasPermission = this.hasPermission.bind(this);
    this.hasPermissions = this.hasPermissions.bind(this);
    this.getUserRole = this.getUserRole.bind(this);
    this.getUserPermissions = this.getUserPermissions.bind(this);
    this.invalidateUser = this.invalidateUser.bind(this);
  }

  /**
   * Set the current user context
   * @param {Object} user - User object with id and tenant information
   */
  setCurrentUser(user) {
    const previousUser = this.currentUser;
    this.currentUser = user;
    this.currentTenant = user?.tenant;
    
    // Invalidate cache if user changed
    if (previousUser?.id !== user?.id) {
      this.invalidateUser(previousUser?.id);
    }
    
    this._logAudit('user_context_set', {
      userId: user?.id,
      tenant: user?.tenant?.id,
      previousUserId: previousUser?.id
    });
  }

  /**
   * Check if current user has a specific permission
   * @param {string} permission - Permission to check
   * @param {Object} options - Check options
   * @param {string} options.resource - Specific resource ID
   * @param {boolean} options.useCache - Use cache (default: true)
   * @returns {Promise<boolean>} True if user has permission
   */
  async hasPermission(permission, options = {}) {
    try {
      this.stats.permissionChecks++;
      
      if (!this.currentUser) {
        this._logAudit('permission_check_no_user', { permission });
        return false;
      }
      
      const useCache = options.useCache !== false;
      const cacheKey = this._getCacheKey('permission', permission, options.resource);
      
      // Check cache first
      if (useCache) {
        const cached = this.cache.get(cacheKey);
        if (cached !== undefined) {
          this.stats.cacheHits++;
          this._logPermissionCheck(permission, cached, 'cache');
          return cached;
        }
        this.stats.cacheMisses++;
      }
      
      // Use deduplicator to prevent concurrent identical requests
      const result = await this.deduplicator.deduplicate(
        cacheKey,
        async (signal) => {
          this.stats.apiCalls++;
          return await this._fetchPermission(permission, options, signal);
        }
      );
      
      // Cache the result
      if (useCache) {
        this.cache.set(cacheKey, result);
      }
      
      this._logPermissionCheck(permission, result, 'api');
      return result;
      
    } catch (error) {
      this.stats.errors++;
      this._logAudit('permission_check_error', {
        permission,
        error: error.message,
        userId: this.currentUser?.id
      });
      
      // Default to deny on error for security
      return false;
    }
  }

  /**
   * Check multiple permissions at once
   * @param {string[]} permissions - Array of permissions to check
   * @param {Object} options - Check options
   * @returns {Promise<Object>} Object with permission results
   */
  async hasPermissions(permissions, options = {}) {
    try {
      if (!Array.isArray(permissions)) {
        throw new Error('permissions must be an array');
      }
      
      // Check all permissions concurrently
      const results = await Promise.all(
        permissions.map(async (permission) => {
          const hasIt = await this.hasPermission(permission, options);
          return { permission, hasPermission: hasIt };
        })
      );
      
      // Convert to object format
      const permissionMap = {};
      for (const result of results) {
        permissionMap[result.permission] = result.hasPermission;
      }
      
      this._logAudit('bulk_permission_check', {
        permissions,
        results: permissionMap,
        userId: this.currentUser?.id
      });
      
      return permissionMap;
      
    } catch (error) {
      this.stats.errors++;
      this._logAudit('bulk_permission_error', {
        permissions,
        error: error.message,
        userId: this.currentUser?.id
      });
      
      // Return deny-all object on error
      const denyAll = {};
      for (const permission of permissions) {
        denyAll[permission] = false;
      }
      return denyAll;
    }
  }

  /**
   * Get the current user's role
   * @param {Object} options - Options
   * @param {boolean} options.useCache - Use cache (default: true)
   * @returns {Promise<Object|null>} User role object
   */
  async getUserRole(options = {}) {
    try {
      if (!this.currentUser) {
        return null;
      }
      
      const useCache = options.useCache !== false;
      const cacheKey = this._getCacheKey('role');
      
      // Check cache first
      if (useCache) {
        const cached = this.cache.get(cacheKey);
        if (cached !== undefined) {
          this.stats.cacheHits++;
          return cached;
        }
        this.stats.cacheMisses++;
      }
      
      // Fetch from API with deduplication
      const role = await this.deduplicator.deduplicate(
        cacheKey,
        async (signal) => {
          this.stats.apiCalls++;
          return await this._fetchUserRole(signal);
        }
      );
      
      // Cache the result
      if (useCache) {
        this.cache.set(cacheKey, role);
      }
      
      return role;
      
    } catch (error) {
      this.stats.errors++;
      this._logAudit('role_fetch_error', {
        error: error.message,
        userId: this.currentUser?.id
      });
      return null;
    }
  }

  /**
   * Get all permissions for the current user
   * @param {Object} options - Options
   * @param {boolean} options.useCache - Use cache (default: true)
   * @returns {Promise<string[]>} Array of permission strings
   */
  async getUserPermissions(options = {}) {
    try {
      if (!this.currentUser) {
        return [];
      }
      
      const useCache = options.useCache !== false;
      const cacheKey = this._getCacheKey('all_permissions');
      
      // Check cache first
      if (useCache) {
        const cached = this.cache.get(cacheKey);
        if (cached !== undefined) {
          this.stats.cacheHits++;
          return cached;
        }
        this.stats.cacheMisses++;
      }
      
      // Fetch from API with deduplication
      const permissions = await this.deduplicator.deduplicate(
        cacheKey,
        async (signal) => {
          this.stats.apiCalls++;
          return await this._fetchUserPermissions(signal);
        }
      );
      
      // Cache the result
      if (useCache) {
        this.cache.set(cacheKey, permissions);
      }
      
      return permissions || [];
      
    } catch (error) {
      this.stats.errors++;
      this._logAudit('permissions_fetch_error', {
        error: error.message,
        userId: this.currentUser?.id
      });
      return [];
    }
  }

  /**
   * Check if user has any of the specified permissions (OR logic)
   * @param {string[]} permissions - Permissions to check
   * @param {Object} options - Options
   * @returns {Promise<boolean>} True if user has any of the permissions
   */
  async hasAnyPermission(permissions, options = {}) {
    const results = await this.hasPermissions(permissions, options);
    return Object.values(results).some(hasPermission => hasPermission);
  }

  /**
   * Check if user has all of the specified permissions (AND logic)
   * @param {string[]} permissions - Permissions to check
   * @param {Object} options - Options
   * @returns {Promise<boolean>} True if user has all permissions
   */
  async hasAllPermissions(permissions, options = {}) {
    const results = await this.hasPermissions(permissions, options);
    return Object.values(results).every(hasPermission => hasPermission);
  }

  /**
   * Invalidate cached permissions for a user
   * @param {string} userId - User ID (uses current user if not specified)
   */
  invalidateUser(userId = null) {
    const targetUserId = userId || this.currentUser?.id;
    if (!targetUserId) return;
    
    const keysToInvalidate = [];
    
    // Find all cache keys for this user
    for (const key of this.cache.keys()) {
      if (key.includes(`user:${targetUserId}`)) {
        keysToInvalidate.push(key);
      }
    }
    
    // Remove from cache
    for (const key of keysToInvalidate) {
      this.cache.delete(key);
    }
    
    this.stats.invalidations++;
    
    this._logAudit('cache_invalidation', {
      userId: targetUserId,
      keysInvalidated: keysToInvalidate.length
    });
  }

  /**
   * Invalidate all cached permissions
   */
  invalidateAll() {
    this.cache.clear();
    this.deduplicator.clear();
    this.stats.invalidations++;
    
    this._logAudit('cache_clear_all', {
      userId: this.currentUser?.id
    });
  }

  /**
   * Get manager statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    return {
      ...this.stats,
      cache: this.cache.getStats(),
      deduplicator: this.deduplicator.getStats(),
      currentUser: this.currentUser?.id || null,
      auditLogSize: this.auditLog.length
    };
  }

  /**
   * Get recent audit log entries
   * @param {number} limit - Maximum number of entries (default: 100)
   * @returns {Object[]} Audit log entries
   */
  getAuditLog(limit = 100) {
    return this.auditLog
      .slice(-limit)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Generate a cache key for permissions
   * @private
   */
  _getCacheKey(type, permission = '', resource = '') {
    const userId = this.currentUser?.id || 'anonymous';
    const tenantId = this.currentTenant?.id || 'default';
    const parts = [type, userId, tenantId];
    
    if (permission) parts.push(permission);
    if (resource) parts.push(resource);
    
    return `perm:${parts.join(':')}`;
  }

  /**
   * Fetch permission from API
   * @private
   */
  async _fetchPermission(permission, options, signal) {
    const params = {
      permission,
      userId: this.currentUser.id,
      tenant: this.currentTenant?.id,
      resource: options.resource
    };
    
    return await this._withRetry(
      () => this.apiService.checkPermission(params, { signal })
    );
  }

  /**
   * Fetch user role from API
   * @private
   */
  async _fetchUserRole(signal) {
    const params = {
      userId: this.currentUser.id,
      tenant: this.currentTenant?.id
    };
    
    return await this._withRetry(
      () => this.apiService.getUserRole(params, { signal })
    );
  }

  /**
   * Fetch user permissions from API
   * @private
   */
  async _fetchUserPermissions(signal) {
    const params = {
      userId: this.currentUser.id,
      tenant: this.currentTenant?.id
    };
    
    return await this._withRetry(
      () => this.apiService.getUserPermissions(params, { signal })
    );
  }

  /**
   * Execute function with retry logic
   * @private
   */
  async _withRetry(fn) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.securityConfig.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        // Don't retry on abort or auth errors
        if (error.name === 'AbortError' || error.status === 401 || error.status === 403) {
          break;
        }
        
        if (attempt < this.securityConfig.maxRetries) {
          await new Promise(resolve => 
            setTimeout(resolve, this.securityConfig.retryDelay * attempt)
          );
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Log permission check for debugging
   * @private
   */
  _logPermissionCheck(permission, result, source) {
    if (this.securityConfig.logPermissionChecks) {
      console.log('PermissionManager: Permission check', {
        permission,
        result,
        source,
        userId: this.currentUser?.id
      });
    }
  }

  /**
   * Log audit event
   * @private
   */
  _logAudit(event, data) {
    if (!this.securityConfig.enableAuditLog) return;
    
    const entry = {
      timestamp: Date.now(),
      event,
      data,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server'
    };
    
    this.auditLog.push(entry);
    
    // Keep audit log size manageable
    if (this.auditLog.length > 1000) {
      this.auditLog.splice(0, 100);
    }
  }

  /**
   * Destroy the permission manager and cleanup resources
   */
  destroy() {
    try {
      this.cache.destroy();
      this.deduplicator.destroy();
      this.auditLog.length = 0;
    } catch (error) {
      console.error('PermissionManager: Error destroying manager', error);
    }
  }
}

export default PermissionManager;