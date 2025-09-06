# API Architecture Implementation Plan

## Implementation Examples

### 1. Centralized API Client Implementation

#### Core API Client
```typescript
// src/api/client.ts
import { AuthenticationManager } from './auth/manager';
import { ErrorHandler } from './errors/handler';
import { CacheManager } from './cache/manager';
import { RequestInterceptor, ResponseInterceptor } from './interceptors';

export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: any;
  params?: Record<string, string>;
  headers?: HeadersInit;
  timeout?: number;
  cache?: boolean;
  retries?: number;
}

export interface APIResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  config: RequestConfig;
}

class APIClient {
  private baseURL: string;
  private authManager: AuthenticationManager;
  private errorHandler: ErrorHandler;
  private cacheManager: CacheManager;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  constructor(config: {
    baseURL: string;
    authManager: AuthenticationManager;
    errorHandler: ErrorHandler;
    cacheManager: CacheManager;
  }) {
    this.baseURL = config.baseURL;
    this.authManager = config.authManager;
    this.errorHandler = config.errorHandler;
    this.cacheManager = config.cacheManager;

    // Add default interceptors
    this.addRequestInterceptor(this.authInterceptor.bind(this));
    this.addResponseInterceptor(this.errorResponseInterceptor.bind(this));
  }

  async request<T = any>(config: RequestConfig): Promise<APIResponse<T>> {
    const fullConfig = this.buildConfig(config);
    
    // Check cache first for GET requests
    if (fullConfig.method === 'GET' && fullConfig.cache) {
      const cached = await this.cacheManager.get(this.getCacheKey(fullConfig));
      if (cached) {
        return cached;
      }
    }

    // Apply request interceptors
    let processedConfig = fullConfig;
    for (const interceptor of this.requestInterceptors) {
      processedConfig = await interceptor(processedConfig);
    }

    // Execute request with retry logic
    const response = await this.executeWithRetry(processedConfig);

    // Apply response interceptors
    let processedResponse = response;
    for (const interceptor of this.responseInterceptors) {
      processedResponse = await interceptor(processedResponse, processedConfig);
    }

    // Cache successful GET responses
    if (fullConfig.method === 'GET' && fullConfig.cache && response.status < 400) {
      await this.cacheManager.set(
        this.getCacheKey(fullConfig),
        processedResponse,
        this.getCacheTTL(fullConfig)
      );
    }

    return processedResponse;
  }

  // Convenience methods
  async get<T = any>(url: string, config?: Partial<RequestConfig>): Promise<APIResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async post<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<APIResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  async put<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<APIResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  async delete<T = any>(url: string, config?: Partial<RequestConfig>): Promise<APIResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  private async executeWithRetry(config: RequestConfig): Promise<APIResponse> {
    const maxRetries = config.retries || 3;
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeout || 10000);

        const response = await fetch(this.buildURL(config), {
          method: config.method,
          headers: config.headers,
          body: config.data ? JSON.stringify(config.data) : undefined,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        const data = await this.parseResponse(response);

        return {
          data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          config
        };

      } catch (error) {
        lastError = error as Error;
        
        const shouldRetry = attempt < maxRetries && this.shouldRetry(error as Error);
        if (shouldRetry) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        break;
      }
    }

    throw this.errorHandler.createAPIError(lastError!, config);
  }

  private async authInterceptor(config: RequestConfig): Promise<RequestConfig> {
    const headers = await this.authManager.getAuthHeaders();
    return {
      ...config,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...config.headers
      }
    };
  }

  private async errorResponseInterceptor(
    response: APIResponse, 
    config: RequestConfig
  ): Promise<APIResponse> {
    if (response.status >= 400) {
      const error = this.errorHandler.createHTTPError(response, config);
      throw error;
    }
    return response;
  }

  private buildConfig(config: RequestConfig): RequestConfig {
    return {
      timeout: 10000,
      cache: true,
      retries: 3,
      ...config
    };
  }

  private buildURL(config: RequestConfig): string {
    let url = `${this.baseURL}${config.url}`;
    
    if (config.params) {
      const searchParams = new URLSearchParams(config.params);
      url += `?${searchParams.toString()}`;
    }
    
    return url;
  }

  private async parseResponse(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      return response.json();
    }
    
    return response.text();
  }

  private getCacheKey(config: RequestConfig): string {
    const key = `${config.method}:${config.url}`;
    if (config.params) {
      const paramString = new URLSearchParams(config.params).toString();
      return `${key}?${paramString}`;
    }
    return key;
  }

  private getCacheTTL(config: RequestConfig): number {
    // Default TTL: 5 minutes for API responses
    return 5 * 60 * 1000;
  }

  private shouldRetry(error: Error): boolean {
    // Retry on network errors, timeouts, and 5xx errors
    return (
      error.name === 'NetworkError' ||
      error.name === 'AbortError' ||
      error.message.includes('fetch')
    );
  }

  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }
}

export { APIClient };
```

#### Authentication Manager
```typescript
// src/api/auth/manager.ts
import { useAuth0 } from '@auth0/auth0-react';

export interface AuthenticationManager {
  getAuthHeaders(): Promise<HeadersInit>;
  getToken(): Promise<string | null>;
  isAuthenticated(): Promise<boolean>;
  handleAuthError(): Promise<void>;
}

export class Auth0AuthManager implements AuthenticationManager {
  constructor(
    private getAccessTokenSilently: () => Promise<string>,
    private logout: () => void,
    private isAuthenticated: () => Promise<boolean>
  ) {}

  async getAuthHeaders(): Promise<HeadersInit> {
    try {
      const token = await this.getToken();
      if (!token) {
        return {};
      }

      return {
        'Authorization': `Bearer ${token}`
      };
    } catch (error) {
      console.error('Failed to get auth headers:', error);
      return {};
    }
  }

  async getToken(): Promise<string | null> {
    try {
      if (!(await this.isAuthenticated())) {
        return null;
      }

      const audience = import.meta.env.VITE_AUTH0_AUDIENCE;
      const options = audience ? {
        audience,
        scope: 'openid profile email'
      } : {};

      return await this.getAccessTokenSilently(options);
    } catch (error) {
      console.error('Token acquisition failed:', error);
      return null;
    }
  }

  async handleAuthError(): Promise<void> {
    console.warn('Authentication error detected, logging out...');
    this.logout();
  }
}

// Factory function for creating auth manager
export const createAuthManager = (): AuthenticationManager => {
  const { getAccessTokenSilently, logout, isAuthenticated } = useAuth0();
  
  return new Auth0AuthManager(
    getAccessTokenSilently,
    logout,
    isAuthenticated
  );
};
```

#### Error Handling System
```typescript
// src/api/errors/handler.ts
export enum APIErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN'
}

export class APIError extends Error {
  constructor(
    public type: APIErrorType,
    message: string,
    public statusCode?: number,
    public originalError?: Error,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'APIError';
  }

  get userMessage(): string {
    switch (this.type) {
      case APIErrorType.NETWORK:
        return 'Network connection failed. Please check your internet connection.';
      case APIErrorType.AUTHENTICATION:
        return 'Please log in to continue.';
      case APIErrorType.AUTHORIZATION:
        return 'You do not have permission to access this resource.';
      case APIErrorType.VALIDATION:
        return 'Please check your input and try again.';
      case APIErrorType.SERVER:
        return 'Server error. Please try again later.';
      case APIErrorType.TIMEOUT:
        return 'Request timeout. Please try again.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
}

export class ErrorHandler {
  createAPIError(error: Error, config: RequestConfig): APIError {
    if (error.name === 'AbortError') {
      return new APIError(APIErrorType.TIMEOUT, 'Request timeout', undefined, error, true);
    }

    if (error.message.includes('fetch') || error.message.includes('network')) {
      return new APIError(APIErrorType.NETWORK, 'Network error', undefined, error, true);
    }

    return new APIError(APIErrorType.UNKNOWN, error.message, undefined, error, false);
  }

  createHTTPError(response: APIResponse, config: RequestConfig): APIError {
    const { status, statusText } = response;

    switch (status) {
      case 401:
        return new APIError(APIErrorType.AUTHENTICATION, 'Authentication required', status, undefined, false);
      case 403:
        return new APIError(APIErrorType.AUTHORIZATION, 'Access denied', status, undefined, false);
      case 400:
      case 422:
        return new APIError(APIErrorType.VALIDATION, 'Validation failed', status, undefined, false);
      case 500:
      case 502:
      case 503:
      case 504:
        return new APIError(APIErrorType.SERVER, 'Server error', status, undefined, true);
      default:
        return new APIError(APIErrorType.UNKNOWN, statusText, status, undefined, false);
    }
  }
}
```

### 2. React Query Integration

#### API Service Layer
```typescript
// src/api/services/parentService.ts
import { apiClient } from '../client';
import { ParentDashboard, Child, FormSubmissionData } from '../../types/api';

export class ParentService {
  static async getParentDashboard(email: string): Promise<ParentDashboard> {
    const response = await apiClient.get<ParentDashboard>(
      `/admission_child_personal/parent_email/1/${email}`,
      {
        cache: true,
        timeout: 15000
      }
    );

    return response.data;
  }

  static async submitForm(
    childId: number, 
    formType: string, 
    formData: FormSubmissionData
  ): Promise<void> {
    await apiClient.put(
      `/${formType}/1/${childId}`,
      formData,
      {
        timeout: 30000,
        retries: 2
      }
    );
  }

  static async refreshChildData(email: string): Promise<ParentDashboard> {
    const response = await apiClient.get<ParentDashboard>(
      `/admission_child_personal/parent_email/1/${email}`,
      {
        cache: false, // Force fresh data
        timeout: 15000
      }
    );

    return response.data;
  }
}
```

#### React Query Hooks
```typescript
// src/hooks/api/useParentDashboard.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ParentService } from '../../api/services/parentService';
import { useAuth0 } from '@auth0/auth0-react';
import { toast } from 'sonner';

export const useParentDashboard = (email: string) => {
  const { isAuthenticated } = useAuth0();

  return useQuery({
    queryKey: ['parentDashboard', email],
    queryFn: () => ParentService.getParentDashboard(email),
    enabled: !!email && isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry auth errors
      if (error instanceof APIError && error.type === APIErrorType.AUTHENTICATION) {
        return false;
      }
      return failureCount < 3;
    },
    onError: (error: APIError) => {
      toast.error(error.userMessage);
    }
  });
};

export const useFormSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      childId, 
      formType, 
      formData 
    }: {
      childId: number;
      formType: string;
      formData: FormSubmissionData;
    }) => ParentService.submitForm(childId, formType, formData),
    
    onSuccess: (_, variables) => {
      toast.success('Form submitted successfully!');
      
      // Invalidate and refetch dashboard data
      queryClient.invalidateQueries(['parentDashboard']);
      queryClient.invalidateQueries(['child', variables.childId]);
    },
    
    onError: (error: APIError) => {
      toast.error(`Form submission failed: ${error.userMessage}`);
    }
  });
};

export const useRefreshDashboard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (email: string) => ParentService.refreshChildData(email),
    onSuccess: (data, email) => {
      // Update the cache with fresh data
      queryClient.setQueryData(['parentDashboard', email], data);
      toast.success('Dashboard refreshed!');
    },
    onError: (error: APIError) => {
      toast.error(`Refresh failed: ${error.userMessage}`);
    }
  });
};
```

#### Optimistic Updates Hook
```typescript
// src/hooks/api/useOptimisticFormSubmission.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ParentService } from '../../api/services/parentService';
import { ParentDashboard } from '../../types/api';

export const useOptimisticFormSubmission = (email: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ParentService.submitForm,
    
    onMutate: async ({ childId, formType }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['parentDashboard', email]);

      // Snapshot previous value
      const previousData = queryClient.getQueryData<ParentDashboard>(['parentDashboard', email]);

      // Optimistically update
      if (previousData) {
        const optimisticData = {
          ...previousData,
          children: previousData.children.map(child =>
            child.id === childId
              ? {
                  ...child,
                  completedForms: [...child.completedForms, {
                    formname: formType,
                    completedTimestamp: Date.now(),
                    formattedDate: new Date().toLocaleDateString()
                  }],
                  incompleteForms: child.incompleteForms.filter(f => f !== formType),
                  stats: {
                    ...child.stats,
                    completed: child.stats.completed + 1,
                    incomplete: child.stats.incomplete - 1,
                    progress: Math.round(((child.stats.completed + 1) / 4) * 100)
                  }
                }
              : child
          )
        };

        queryClient.setQueryData(['parentDashboard', email], optimisticData);
      }

      return { previousData };
    },
    
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['parentDashboard', email], context.previousData);
      }
      toast.error('Form submission failed. Please try again.');
    },
    
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries(['parentDashboard', email]);
    }
  });
};
```

### 3. Updated Component Implementation

#### Simplified Dashboard with React Query
```typescript
// src/components/ParentDashboardWithQuery.tsx
import React, { useState } from 'react';
import { useParentDashboard, useFormSubmission } from '../hooks/api/useParentDashboard';
import { LoadingCard, ErrorCard } from './ui/LoadingStates';

interface ParentDashboardProps {
  email: string;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ email }) => {
  const [activeChildId, setActiveChildId] = useState<number | null>(null);
  const [currentSection, setCurrentSection] = useState<string | null>(null);

  // Single hook manages all dashboard data with caching, error handling, etc.
  const {
    data: dashboardData,
    isLoading,
    isRefreshing,
    error,
    refetch
  } = useParentDashboard(email);

  const formSubmission = useFormSubmission();

  // Set default active child
  React.useEffect(() => {
    if (dashboardData?.children.length && !activeChildId) {
      setActiveChildId(dashboardData.children[0].childId);
    }
  }, [dashboardData, activeChildId]);

  if (isLoading) {
    return <LoadingCard>Loading your dashboard...</LoadingCard>;
  }

  if (error) {
    return (
      <ErrorCard 
        error={error} 
        onRetry={refetch}
        title="Failed to load dashboard"
      />
    );
  }

  if (!dashboardData) {
    return <ErrorCard error="No data available" />;
  }

  const activeChild = dashboardData.children.find(c => c.childId === activeChildId);

  const handleFormSubmission = async (formType: string, formData: any) => {
    if (!activeChildId) return;

    try {
      await formSubmission.mutateAsync({
        childId: activeChildId,
        formType,
        formData
      });
      setCurrentSection(null); // Return to dashboard
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster richColors position="top-center" />

      {/* Header with refresh indicator */}
      <HeaderNew 
        isRefreshing={isRefreshing}
        onRefresh={refetch}
      />

      {/* Welcome Section */}
      <WelcomeSection 
        parentName={dashboardData.parentName}
        overallStats={dashboardData.overallStats}
      />

      {/* Child Selection Tabs */}
      <ChildTabsSimple 
        children={dashboardData.children}
        activeChildId={activeChildId}
        onChildSelect={setActiveChildId}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="w-full lg:w-1/4">
            <FormSidebar
              activeChild={activeChild}
              onSectionChange={setCurrentSection}
              currentSection={currentSection}
            />
          </div>

          {/* Main Content Area */}
          <div className="w-full lg:w-3/4">
            {currentSection ? (
              <FormSection
                formType={currentSection}
                childData={activeChild}
                onSubmit={handleFormSubmission}
                isSubmitting={formSubmission.isLoading}
              />
            ) : (
              <CompletedFormsTable
                forms={activeChild?.completedForms || []}
                childName={activeChild?.firstName}
                onRefresh={refetch}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
```

## Migration Strategy

### Phase 1: Infrastructure Setup (Week 1-2)

#### Day 1-3: Core API Client
1. Create API client infrastructure
2. Implement authentication manager
3. Set up error handling system
4. Add TypeScript types

#### Day 4-7: Testing Framework
1. Unit tests for API client
2. Mock server setup
3. Integration test suite
4. CI/CD integration

#### Day 8-14: React Query Setup
1. Install and configure React Query
2. Create query client setup
3. Add devtools integration
4. Performance monitoring setup

### Phase 2: Gradual Migration (Week 3-5)

#### Week 3: Authentication Layer
1. Consolidate Auth0 providers
2. Migrate authentication utilities
3. Update request interceptors
4. Test authentication flows

#### Week 4-5: Data Layer Migration
1. Create service layer abstractions
2. Migrate `useParentData` to React Query
3. Implement optimistic updates
4. Update form submission logic

### Phase 3: Component Updates (Week 6-7)

#### Week 6: Component Migration
1. Update dashboard components
2. Implement new loading states
3. Add error boundaries
4. Update form components

#### Week 7: Testing & Polish
1. Comprehensive testing
2. Performance optimization
3. Error scenario handling
4. User experience improvements

### Phase 4: Rollout (Week 8)

#### Gradual Rollout Strategy
1. Feature flag implementation
2. A/B testing setup
3. Monitoring and alerts
4. Rollback procedures

## Implementation Checklist

### Core Infrastructure
- [ ] API Client class with interceptors
- [ ] Authentication Manager
- [ ] Error Handler with classifications
- [ ] Cache Manager integration
- [ ] TypeScript type definitions
- [ ] Request/Response interceptors

### React Query Integration
- [ ] Query client configuration
- [ ] Custom hooks for API calls
- [ ] Optimistic update patterns
- [ ] Cache invalidation strategies
- [ ] Background refresh setup
- [ ] Error boundary integration

### Testing Framework
- [ ] Unit tests for API client
- [ ] Mock server implementation
- [ ] Integration test suite
- [ ] End-to-end test scenarios
- [ ] Performance test cases
- [ ] Error handling tests

### Migration Tasks
- [ ] Consolidate authentication contexts
- [ ] Replace direct fetch calls
- [ ] Update hook implementations
- [ ] Migrate component state management
- [ ] Update error handling patterns
- [ ] Implement loading states

### Performance Optimization
- [ ] Request deduplication
- [ ] Cache optimization
- [ ] Bundle size analysis
- [ ] Performance monitoring
- [ ] Memory usage tracking
- [ ] Network usage optimization

### Developer Experience
- [ ] API documentation
- [ ] Type definitions
- [ ] Development tools
- [ ] Debugging utilities
- [ ] Error reporting
- [ ] Performance profiling

### Production Readiness
- [ ] Feature flags
- [ ] Monitoring setup
- [ ] Alert configuration
- [ ] Rollback procedures
- [ ] Performance baselines
- [ ] Security audit

## Success Metrics

### Performance Metrics
- Request latency reduction: Target 20% improvement
- Cache hit rate: Target 80% for dashboard data
- Bundle size increase: Keep under 25KB gzipped
- Memory usage: Stable with no leaks

### Developer Experience
- Code reduction: Target 30% less boilerplate
- Type safety: 100% TypeScript coverage for API layer
- Error handling: Consistent patterns across all API calls
- Testing: 90%+ code coverage for API layer

### User Experience
- Loading states: Consistent across all interactions
- Error messages: User-friendly and actionable
- Offline support: Graceful degradation
- Optimistic updates: Immediate feedback for form submissions

## Risk Mitigation

### Technical Risks
- **Migration complexity**: Phased approach with feature flags
- **Performance degradation**: Continuous monitoring and rollback plan
- **Breaking changes**: Comprehensive testing and staged rollout
- **Bundle size increase**: Code splitting and tree shaking

### Business Risks
- **User disruption**: Gradual rollout with rollback capability
- **Development slowdown**: Parallel migration approach
- **Regression bugs**: Extensive testing and QA process
- **Training overhead**: Documentation and knowledge transfer

This implementation plan provides a concrete roadmap for transforming the current API architecture into a modern, maintainable, and performant system while minimizing risks and ensuring continuous delivery capabilities.