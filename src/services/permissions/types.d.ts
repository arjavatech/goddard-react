/**
 * TypeScript definitions for Permission Caching System
 */

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  cleanups: number;
  evictions: number;
  size: number;
  hitRate: string;
  memoryUsage: string;
}

export interface TTLCacheOptions {
  ttl?: number;
  cleanupInterval?: number;
  maxSize?: number;
}

export declare class TTLCache {
  constructor(options?: TTLCacheOptions);
  
  get(key: string): any;
  set(key: string, value: any, ttl?: number): boolean;
  delete(key: string): boolean;
  has(key: string): boolean;
  clear(): void;
  keys(): string[];
  size(): number;
  getStats(): CacheStats;
  destroy(): void;
}

export interface RequestDeduplicatorStats {
  deduplicatedRequests: number;
  completedRequests: number;
  failedRequests: number;
  timeouts: number;
  cancelled: number;
  currentPending: number;
  deduplicationRate: string;
  avgRequestsPerKey: string;
}

export interface DeduplicatorOptions {
  maxConcurrent?: number;
  timeout?: number;
}

export interface RequestOptions {
  timeout?: number;
  signal?: AbortSignal;
}

export declare class RequestDeduplicator {
  constructor(options?: DeduplicatorOptions);
  
  deduplicate<T>(
    key: string, 
    requestFn: (signal?: AbortSignal) => Promise<T>,
    options?: RequestOptions
  ): Promise<T>;
  
  cancel(key: string): boolean;
  cancelAll(): number;
  clear(): void;
  isPending(key: string): boolean;
  getPendingKeys(): string[];
  getStats(): RequestDeduplicatorStats;
  getPendingDetails(): Array<{
    key: string;
    waitingCallers: number;
    duration: number;
    startTime: number;
  }>;
  createBoundDeduplicator(prefix: string): (
    key: string, 
    requestFn: (signal?: AbortSignal) => Promise<any>,
    options?: RequestOptions
  ) => Promise<any>;
  destroy(): void;
}

export interface User {
  id: string;
  tenant?: {
    id: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface Role {
  name: string;
  permissions?: string[];
  [key: string]: any;
}

export interface ApiService {
  checkPermission(params: {
    permission: string;
    userId: string;
    tenant?: string;
    resource?: string;
  }, options?: { signal?: AbortSignal }): Promise<boolean>;
  
  getUserRole(params: {
    userId: string;
    tenant?: string;
  }, options?: { signal?: AbortSignal }): Promise<Role>;
  
  getUserPermissions(params: {
    userId: string;
    tenant?: string;
  }, options?: { signal?: AbortSignal }): Promise<string[]>;
}

export interface PermissionManagerOptions {
  apiService: ApiService;
  cacheConfig?: TTLCacheOptions;
  deduplicatorConfig?: DeduplicatorOptions;
  securityConfig?: {
    enableAuditLog?: boolean;
    logPermissionChecks?: boolean;
    maxRetries?: number;
    retryDelay?: number;
  };
}

export interface PermissionCheckOptions {
  resource?: string;
  useCache?: boolean;
}

export interface PermissionManagerStats {
  permissionChecks: number;
  cacheHits: number;
  cacheMisses: number;
  apiCalls: number;
  errors: number;
  invalidations: number;
  cache: CacheStats;
  deduplicator: RequestDeduplicatorStats;
  currentUser: string | null;
  auditLogSize: number;
}

export interface AuditLogEntry {
  timestamp: number;
  event: string;
  data: any;
  userAgent: string;
}

export declare class PermissionManager {
  currentUser: User | null;
  currentTenant: User['tenant'] | null;
  
  constructor(options: PermissionManagerOptions);
  
  setCurrentUser(user: User | null): void;
  
  hasPermission(permission: string, options?: PermissionCheckOptions): Promise<boolean>;
  hasPermissions(permissions: string[], options?: PermissionCheckOptions): Promise<Record<string, boolean>>;
  hasAnyPermission(permissions: string[], options?: PermissionCheckOptions): Promise<boolean>;
  hasAllPermissions(permissions: string[], options?: PermissionCheckOptions): Promise<boolean>;
  
  getUserRole(options?: { useCache?: boolean }): Promise<Role | null>;
  getUserPermissions(options?: { useCache?: boolean }): Promise<string[]>;
  
  invalidateUser(userId?: string): void;
  invalidateAll(): void;
  
  getStats(): PermissionManagerStats;
  getAuditLog(limit?: number): AuditLogEntry[];
  
  destroy(): void;
}

// React Context Types
export interface PermissionContextValue {
  user: User | null;
  role: Role | null;
  permissions: string[];
  isLoading: boolean;
  error: Error | null;
  stats: {
    checks: number;
    cacheHits: number;
    cacheMisses: number;
  };
  
  setUser: (user: User | null) => void;
  hasPermission: (permission: string, options?: PermissionCheckOptions) => Promise<boolean>;
  hasPermissions: (permissions: string[], options?: PermissionCheckOptions) => Promise<Record<string, boolean>>;
  hasAnyPermission: (permissions: string[], options?: PermissionCheckOptions) => Promise<boolean>;
  hasAllPermissions: (permissions: string[], options?: PermissionCheckOptions) => Promise<boolean>;
  getUserRole: (options?: { useCache?: boolean }) => Promise<Role | null>;
  getUserPermissions: (options?: { useCache?: boolean }) => Promise<string[]>;
  invalidateCache: (userId?: string) => void;
  getStats: () => PermissionManagerStats | null;
  getCachedPermission: (permission: string, resource?: string) => boolean | undefined;
  
  permissionManager: PermissionManager | null;
}

export interface PermissionProviderProps {
  children: React.ReactNode;
  apiService: ApiService;
  cacheConfig?: TTLCacheOptions;
  securityConfig?: PermissionManagerOptions['securityConfig'];
  fallbackComponent?: React.ReactElement;
}

export declare const PermissionProvider: React.FC<PermissionProviderProps>;

export declare function usePermissions(): PermissionContextValue;

export interface UsePermissionResult {
  hasPermission: boolean | undefined;
  isLoading: boolean;
  checkPermission: () => Promise<boolean>;
}

export declare function usePermission(
  permission: string, 
  options?: PermissionCheckOptions
): UsePermissionResult;

export interface UsePermissionsResult {
  permissions: Record<string, boolean>;
  isLoading: boolean;
  checkPermissions: () => Promise<Record<string, boolean>>;
}

export declare function usePermissions(permissions: string[]): UsePermissionsResult;

export interface WithPermissionOptions {
  loadingComponent?: React.ReactElement;
  fallbackComponent?: React.ReactElement;
}

export declare function withPermission(
  requiredPermission: string,
  options?: WithPermissionOptions
): <P extends object>(
  Component: React.ComponentType<P>
) => React.ComponentType<P>;

export interface PermissionGateProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  resource?: string;
  fallback?: React.ReactNode;
  loading?: React.ReactNode;
}

export declare const PermissionGate: React.FC<PermissionGateProps>;

// Utility type exports
export type PermissionCheck = (permission: string, options?: PermissionCheckOptions) => Promise<boolean>;
export type PermissionBulkCheck = (permissions: string[], options?: PermissionCheckOptions) => Promise<Record<string, boolean>>;

export default PermissionManager;