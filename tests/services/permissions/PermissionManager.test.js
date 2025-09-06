/**
 * PermissionManager Tests
 * 
 * Comprehensive test suite for the PermissionManager implementation
 */

import { vi, describe, test, beforeEach, afterEach, expect } from 'vitest';
import { PermissionManager } from '../../../src/services/permissions/PermissionManager.js';

describe('PermissionManager', () => {
  let permissionManager;
  let mockApiService;

  beforeEach(() => {
    mockApiService = {
      checkPermission: vi.fn(),
      getUserRole: vi.fn(),
      getUserPermissions: vi.fn()
    };

    permissionManager = new PermissionManager({
      apiService: mockApiService,
      cacheConfig: { ttl: 1000 }, // 1 second for testing
      securityConfig: { enableAuditLog: true }
    });
  });

  afterEach(() => {
    if (permissionManager) {
      permissionManager.destroy();
    }
  });

  describe('Initialization', () => {
    test('should require apiService', () => {
      expect(() => new PermissionManager({})).toThrow('PermissionManager: apiService is required');
    });

    test('should initialize with default configuration', () => {
      const manager = new PermissionManager({ apiService: mockApiService });
      expect(manager.apiService).toBe(mockApiService);
      expect(manager).toBeDefined();
      manager.destroy();
    });

    test('should accept custom configuration', () => {
      const customConfig = {
        apiService: mockApiService,
        cacheConfig: { ttl: 2000, maxSize: 100 },
        securityConfig: { enableAuditLog: false, maxRetries: 5 }
      };

      const manager = new PermissionManager(customConfig);
      expect(manager).toBeDefined();
      manager.destroy();
    });
  });

  describe('User Context Management', () => {
    test('should set current user', () => {
      const user = { id: 'user123', tenant: { id: 'tenant456' } };
      
      permissionManager.setCurrentUser(user);
      
      expect(permissionManager.currentUser).toEqual(user);
      expect(permissionManager.currentTenant).toEqual(user.tenant);
    });

    test('should invalidate cache when user changes', () => {
      const user1 = { id: 'user1', tenant: { id: 'tenant1' } };
      const user2 = { id: 'user2', tenant: { id: 'tenant2' } };

      permissionManager.setCurrentUser(user1);
      
      // Set a permission in cache
      permissionManager.cache.set('perm:permission:user1:tenant1:edit', true);
      expect(permissionManager.cache.has('perm:permission:user1:tenant1:edit')).toBe(true);

      // Change user should trigger cache invalidation
      const invalidateSpy = vi.spyOn(permissionManager, 'invalidateUser');
      permissionManager.setCurrentUser(user2);
      
      expect(invalidateSpy).toHaveBeenCalledWith('user1');
    });

    test('should create audit log entries', () => {
      const user = { id: 'user123', tenant: { id: 'tenant456' } };
      
      permissionManager.setCurrentUser(user);
      
      const auditLog = permissionManager.getAuditLog();
      expect(auditLog).toHaveLength(1);
      expect(auditLog[0].event).toBe('user_context_set');
      expect(auditLog[0].data.userId).toBe('user123');
    });
  });

  describe('Permission Checking', () => {
    beforeEach(() => {
      const user = { id: 'user123', tenant: { id: 'tenant456' } };
      permissionManager.setCurrentUser(user);
    });

    test('should check single permission', async () => {
      mockApiService.checkPermission.mockResolvedValue(true);

      const result = await permissionManager.hasPermission('edit-posts');

      expect(result).toBe(true);
      expect(mockApiService.checkPermission).toHaveBeenCalledWith({
        permission: 'edit-posts',
        userId: 'user123',
        tenant: 'tenant456',
        resource: undefined
      }, expect.any(Object));

      const stats = permissionManager.getStats();
      expect(stats.permissionChecks).toBe(1);
      expect(stats.apiCalls).toBe(1);
    });

    test('should return false for users without context', async () => {
      permissionManager.setCurrentUser(null);

      const result = await permissionManager.hasPermission('edit-posts');

      expect(result).toBe(false);
      expect(mockApiService.checkPermission).not.toHaveBeenCalled();
    });

    test('should cache permission results', async () => {
      mockApiService.checkPermission.mockResolvedValue(true);

      // First call
      const result1 = await permissionManager.hasPermission('edit-posts');
      
      // Second call (should use cache)
      const result2 = await permissionManager.hasPermission('edit-posts');

      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(mockApiService.checkPermission).toHaveBeenCalledTimes(1);

      const stats = permissionManager.getStats();
      expect(stats.cache.hits).toBe(1);
      expect(stats.cache.misses).toBe(1);
    });

    test('should deduplicate concurrent requests', async () => {
      mockApiService.checkPermission.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(true), 100))
      );

      // Make concurrent requests
      const promises = [
        permissionManager.hasPermission('edit-posts'),
        permissionManager.hasPermission('edit-posts'),
        permissionManager.hasPermission('edit-posts')
      ];

      const results = await Promise.all(promises);

      expect(results).toEqual([true, true, true]);
      expect(mockApiService.checkPermission).toHaveBeenCalledTimes(1);
      
      const deduplicatorStats = permissionManager.deduplicator.getStats();
      expect(deduplicatorStats.deduplicatedRequests).toBe(2);
    });

    test('should handle permission with resource', async () => {
      mockApiService.checkPermission.mockResolvedValue(true);

      const result = await permissionManager.hasPermission('edit-posts', { 
        resource: 'post123' 
      });

      expect(result).toBe(true);
      expect(mockApiService.checkPermission).toHaveBeenCalledWith({
        permission: 'edit-posts',
        userId: 'user123',
        tenant: 'tenant456',
        resource: 'post123'
      }, expect.any(Object));
    });

    test('should bypass cache when requested', async () => {
      mockApiService.checkPermission.mockResolvedValue(true);

      // First call to populate cache
      await permissionManager.hasPermission('edit-posts');
      
      // Second call with cache bypass
      await permissionManager.hasPermission('edit-posts', { useCache: false });

      expect(mockApiService.checkPermission).toHaveBeenCalledTimes(2);
    });
  });

  describe('Multiple Permission Checking', () => {
    beforeEach(() => {
      const user = { id: 'user123', tenant: { id: 'tenant456' } };
      permissionManager.setCurrentUser(user);
    });

    test('should check multiple permissions', async () => {
      mockApiService.checkPermission
        .mockResolvedValueOnce(true)  // edit-posts
        .mockResolvedValueOnce(false) // delete-posts
        .mockResolvedValueOnce(true); // view-posts

      const permissions = ['edit-posts', 'delete-posts', 'view-posts'];
      const results = await permissionManager.hasPermissions(permissions);

      expect(results).toEqual({
        'edit-posts': true,
        'delete-posts': false,
        'view-posts': true
      });

      expect(mockApiService.checkPermission).toHaveBeenCalledTimes(3);
    });

    test('should validate permissions parameter', async () => {
      const results = await permissionManager.hasPermissions('not-an-array');
      
      expect(results).toEqual({});
      expect(mockApiService.checkPermission).not.toHaveBeenCalled();
    });

    test('should check any permission (OR logic)', async () => {
      mockApiService.checkPermission
        .mockResolvedValueOnce(false) // edit-posts
        .mockResolvedValueOnce(true); // delete-posts

      const result = await permissionManager.hasAnyPermission(['edit-posts', 'delete-posts']);

      expect(result).toBe(true);
    });

    test('should check all permissions (AND logic)', async () => {
      mockApiService.checkPermission
        .mockResolvedValueOnce(true)  // edit-posts
        .mockResolvedValueOnce(false); // delete-posts

      const result = await permissionManager.hasAllPermissions(['edit-posts', 'delete-posts']);

      expect(result).toBe(false);
    });
  });

  describe('Role Management', () => {
    beforeEach(() => {
      const user = { id: 'user123', tenant: { id: 'tenant456' } };
      permissionManager.setCurrentUser(user);
    });

    test('should get user role', async () => {
      const mockRole = { name: 'admin', permissions: ['edit', 'delete'] };
      mockApiService.getUserRole.mockResolvedValue(mockRole);

      const role = await permissionManager.getUserRole();

      expect(role).toEqual(mockRole);
      expect(mockApiService.getUserRole).toHaveBeenCalledWith({
        userId: 'user123',
        tenant: 'tenant456'
      }, expect.any(Object));
    });

    test('should get user permissions', async () => {
      const mockPermissions = ['edit-posts', 'view-posts', 'manage-users'];
      mockApiService.getUserPermissions.mockResolvedValue(mockPermissions);

      const permissions = await permissionManager.getUserPermissions();

      expect(permissions).toEqual(mockPermissions);
      expect(mockApiService.getUserPermissions).toHaveBeenCalledWith({
        userId: 'user123',
        tenant: 'tenant456'
      }, expect.any(Object));
    });

    test('should return null/empty for user without context', async () => {
      permissionManager.setCurrentUser(null);

      const role = await permissionManager.getUserRole();
      const permissions = await permissionManager.getUserPermissions();

      expect(role).toBeNull();
      expect(permissions).toEqual([]);
      expect(mockApiService.getUserRole).not.toHaveBeenCalled();
      expect(mockApiService.getUserPermissions).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      const user = { id: 'user123', tenant: { id: 'tenant456' } };
      permissionManager.setCurrentUser(user);
    });

    test('should handle API errors gracefully', async () => {
      const apiError = new Error('API Error');
      mockApiService.checkPermission.mockRejectedValue(apiError);

      const result = await permissionManager.hasPermission('edit-posts');

      expect(result).toBe(false); // Default to deny on error
      
      const auditLog = permissionManager.getAuditLog();
      const errorEntry = auditLog.find(entry => entry.event === 'permission_check_error');
      expect(errorEntry).toBeDefined();
      expect(errorEntry.data.error).toBe('API Error');
    });

    test('should handle bulk permission errors', async () => {
      const apiError = new Error('Bulk API Error');
      mockApiService.checkPermission.mockRejectedValue(apiError);

      const results = await permissionManager.hasPermissions(['edit-posts', 'delete-posts']);

      expect(results).toEqual({
        'edit-posts': false,
        'delete-posts': false
      });
    });

    test('should implement retry logic', async () => {
      const apiError = new Error('Temporary Error');
      mockApiService.checkPermission
        .mockRejectedValueOnce(apiError)
        .mockRejectedValueOnce(apiError)
        .mockResolvedValueOnce(true);

      const result = await permissionManager.hasPermission('edit-posts');

      expect(result).toBe(true);
      expect(mockApiService.checkPermission).toHaveBeenCalledTimes(3);
    });

    test('should not retry auth errors', async () => {
      const authError = new Error('Unauthorized');
      authError.status = 401;
      mockApiService.checkPermission.mockRejectedValue(authError);

      const result = await permissionManager.hasPermission('edit-posts');

      expect(result).toBe(false);
      expect(mockApiService.checkPermission).toHaveBeenCalledTimes(1); // No retries
    });

    test('should not retry abort errors', async () => {
      const abortError = new DOMException('Operation was aborted', 'AbortError');
      mockApiService.checkPermission.mockRejectedValue(abortError);

      const result = await permissionManager.hasPermission('edit-posts');

      expect(result).toBe(false);
      expect(mockApiService.checkPermission).toHaveBeenCalledTimes(1); // No retries
    });
  });

  describe('Cache Management', () => {
    beforeEach(() => {
      const user = { id: 'user123', tenant: { id: 'tenant456' } };
      permissionManager.setCurrentUser(user);
    });

    test('should invalidate user-specific cache', async () => {
      mockApiService.checkPermission.mockResolvedValue(true);

      // Populate cache
      await permissionManager.hasPermission('edit-posts');
      
      // Verify cache hit
      await permissionManager.hasPermission('edit-posts');
      expect(mockApiService.checkPermission).toHaveBeenCalledTimes(1);

      // Invalidate user cache
      permissionManager.invalidateUser('user123');

      // Next call should hit API again
      await permissionManager.hasPermission('edit-posts');
      expect(mockApiService.checkPermission).toHaveBeenCalledTimes(2);
    });

    test('should invalidate all cache', async () => {
      mockApiService.checkPermission.mockResolvedValue(true);

      // Populate cache
      await permissionManager.hasPermission('edit-posts');
      
      // Verify cache
      const initialStats = permissionManager.getStats();
      expect(initialStats.cache.size).toBeGreaterThan(0);

      // Clear all cache
      permissionManager.invalidateAll();

      // Cache should be empty
      const finalStats = permissionManager.getStats();
      expect(finalStats.cache.size).toBe(0);
    });
  });

  describe('Statistics and Monitoring', () => {
    beforeEach(() => {
      const user = { id: 'user123', tenant: { id: 'tenant456' } };
      permissionManager.setCurrentUser(user);
    });

    test('should provide comprehensive statistics', async () => {
      mockApiService.checkPermission.mockResolvedValue(true);

      await permissionManager.hasPermission('edit-posts');
      await permissionManager.hasPermission('edit-posts'); // cache hit
      
      const stats = permissionManager.getStats();

      expect(stats).toHaveProperty('permissionChecks');
      expect(stats).toHaveProperty('cacheHits');
      expect(stats).toHaveProperty('cacheMisses');
      expect(stats).toHaveProperty('apiCalls');
      expect(stats).toHaveProperty('cache');
      expect(stats).toHaveProperty('deduplicator');
      expect(stats).toHaveProperty('currentUser');
      expect(stats).toHaveProperty('auditLogSize');

      expect(stats.permissionChecks).toBe(2);
      expect(stats.cacheHits).toBe(1);
      expect(stats.cacheMisses).toBe(1);
    });

    test('should provide audit log', () => {
      const user = { id: 'user123', tenant: { id: 'tenant456' } };
      permissionManager.setCurrentUser(user);

      const auditLog = permissionManager.getAuditLog();

      expect(Array.isArray(auditLog)).toBe(true);
      expect(auditLog.length).toBeGreaterThan(0);

      const entry = auditLog[0];
      expect(entry).toHaveProperty('timestamp');
      expect(entry).toHaveProperty('event');
      expect(entry).toHaveProperty('data');
    });

    test('should limit audit log size', () => {
      // Generate many audit events
      for (let i = 0; i < 1100; i++) {
        permissionManager._logAudit(`test-event-${i}`, { index: i });
      }

      const auditLog = permissionManager.getAuditLog();
      expect(auditLog.length).toBeLessThanOrEqual(1000);
    });
  });

  describe('Security Features', () => {
    test('should disable audit logging when configured', () => {
      const manager = new PermissionManager({
        apiService: mockApiService,
        securityConfig: { enableAuditLog: false }
      });

      const user = { id: 'user123' };
      manager.setCurrentUser(user);

      const auditLog = manager.getAuditLog();
      expect(auditLog).toHaveLength(0);

      manager.destroy();
    });

    test('should log permission checks in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation();

      const manager = new PermissionManager({
        apiService: mockApiService,
        securityConfig: { logPermissionChecks: true }
      });

      manager.currentUser = { id: 'user123' };
      manager._logPermissionCheck('test-permission', true, 'cache');

      expect(consoleSpy).toHaveBeenCalledWith(
        'PermissionManager: Permission check',
        expect.objectContaining({
          permission: 'test-permission',
          result: true,
          source: 'cache',
          userId: 'user123'
        })
      );

      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
      manager.destroy();
    });
  });

  describe('Cleanup and Destruction', () => {
    test('should cleanup resources on destroy', () => {
      const cacheSpy = vi.spyOn(permissionManager.cache, 'destroy');
      const deduplicatorSpy = vi.spyOn(permissionManager.deduplicator, 'destroy');

      permissionManager.destroy();

      expect(cacheSpy).toHaveBeenCalled();
      expect(deduplicatorSpy).toHaveBeenCalled();
      expect(permissionManager.auditLog).toHaveLength(0);
    });

    test('should handle destroy errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation();
      
      // Make destroy throw an error
      vi.spyOn(permissionManager.cache, 'destroy').mockImplementation(() => {
        throw new Error('Destroy error');
      });

      expect(() => permissionManager.destroy()).not.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });
});