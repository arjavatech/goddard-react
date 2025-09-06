/**
 * Permission Caching System - Main Export
 * 
 * A comprehensive permission management system with intelligent caching,
 * request deduplication, and React integration.
 * 
 * Features:
 * - TTL-based caching (5 minutes default)
 * - Request deduplication to prevent race conditions
 * - React Context and hooks for easy integration
 * - Comprehensive error handling and retry logic
 * - Security audit logging
 * - Memory-efficient operations
 * - Production-ready performance monitoring
 */

// Core components
export { TTLCache } from '../../utils/cache/TTLCache.js';
export { RequestDeduplicator } from './RequestDeduplicator.js';
export { PermissionManager } from './PermissionManager.js';

// React integration
export {
  PermissionProvider,
  usePermissions,
  usePermission,
  withPermission,
  PermissionGate
} from './PermissionContext.js';

// Default export - main permission manager
export { PermissionManager as default } from './PermissionManager.js';