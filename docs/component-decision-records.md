# Architecture Decision Records (ADRs)

## ADR-001: Auth0-Only Authentication

### Status
**Accepted** - December 2024

### Context
The current authentication system mixes legacy SHA256 passwords with Auth0, creating security vulnerabilities:
- Client-side authorization decisions via localStorage
- JWT tokens exposed in console logs
- Inconsistent permission checking across components
- Multiple authentication flows causing confusion

### Decision
Implement **Auth0-only authentication** with the following principles:
1. **Single Source of Truth**: Auth0 handles all authentication
2. **Server-Side Authorization**: All permission decisions on backend
3. **Zero Client Storage**: No auth data in localStorage/sessionStorage
4. **Secure Token Handling**: No token exposure or console logging

### Consequences

#### Positive
- **Enhanced Security**: Eliminates all client-side auth vulnerabilities
- **Consistent Behavior**: Single authentication flow across the app
- **Maintainable Code**: Clear separation between auth and business logic
- **Scalable Architecture**: Easy to add new roles and permissions

#### Negative  
- **Migration Complexity**: Requires updating all components
- **Third-Party Dependency**: Reliance on Auth0 service availability
- **Learning Curve**: Team needs to understand new patterns

### Implementation
- New AuthProvider with centralized state management
- SecureRoute component for route protection
- usePermissions hook for component-level checks
- SecureAPIClient for authenticated requests

---

## ADR-002: Memory-Only Permission Storage

### Status
**Accepted** - December 2024

### Context
Current system stores user permissions in localStorage, which can be:
- Manipulated by users to bypass client-side checks
- Inconsistent with server-side permissions
- Vulnerable to XSS attacks

### Decision
Store all permission data **only in React context/memory**:
1. Fetch permissions from server after Auth0 authentication
2. Store in React state (AuthProvider context)
3. Refresh permissions on auth state changes
4. Clear permissions on logout

### Consequences

#### Positive
- **Security**: Permissions cannot be manipulated client-side
- **Consistency**: Always reflects server-side truth
- **Performance**: No localStorage I/O on every check

#### Negative
- **Session Persistence**: Permissions lost on page refresh (requires re-fetch)
- **Network Dependency**: Must be online to verify permissions

### Implementation
```javascript
// AuthProvider stores permissions in memory only
const [permissions, setPermissions] = useState(null);

// Permissions fetched from server on authentication
const fetchPermissions = async () => {
  const perms = await api.checkPermissions(user.email);
  setPermissions(perms); // Memory only
};
```

---

## ADR-003: Centralized API Client

### Status
**Accepted** - December 2024

### Context
Current API calls scattered throughout components with:
- Inconsistent token handling
- Token exposure in logs
- Different error handling patterns
- Manual header construction

### Decision
Create **SecureAPIClient** class that:
1. Handles all Auth0 JWT token management
2. Provides consistent error handling
3. Never logs sensitive information
4. Offers simple API (get, post, put, delete methods)

### Consequences

#### Positive
- **Consistency**: All API calls follow same pattern
- **Security**: Centralized token handling prevents exposure
- **Maintainability**: Single place to update API logic
- **Error Handling**: Consistent error messages and recovery

#### Negative
- **Abstraction**: Additional layer over fetch API
- **Bundle Size**: Slightly larger client bundle

### Implementation
```javascript
// Single API client instance
const apiClient = new SecureAPIClient();

// Usage in components
const data = await apiClient.get('/api/forms', getAccessTokenSilently);
```

---

## ADR-004: Hook-Based Permission Checking

### Status
**Accepted** - December 2024

### Context
Current permission checks are scattered and inconsistent:
- Direct localStorage.getItem calls in components
- Different permission check patterns
- No centralized permission logic

### Decision
Create **usePermissions hook** that:
1. Provides clean API for all permission checks
2. Handles loading states automatically
3. Offers both basic and granular permissions
4. Includes helper methods for common patterns

### Consequences

#### Positive
- **Clean Code**: Components only need one import for all permissions
- **Consistency**: All permission checks follow same pattern
- **Type Safety**: Clear permission interfaces
- **Developer Experience**: Easy to understand and use

#### Negative
- **Hook Rules**: Must follow React hook rules
- **Context Dependency**: Requires AuthProvider in component tree

### Implementation
```javascript
// Simple usage
const { isAdmin, canEditForms } = usePermissions();

// Advanced usage  
const { renderIfAdmin, checkAnyRole } = usePermissionGuard();
```

---

## ADR-005: Route-Level Protection

### Status
**Accepted** - December 2024

### Context
Current PrivateRoute component has issues:
- Client-side permission checks
- Inconsistent error handling
- localStorage dependencies
- Complex fallback logic

### Decision
Create **SecureRoute component** that:
1. Uses Auth0 authentication state only
2. Shows proper loading states
3. Provides clear error messages
4. Handles edge cases gracefully

### Consequences

#### Positive
- **User Experience**: Clear loading and error states
- **Security**: Server-verified permissions only
- **Simplicity**: Clean component interface
- **Accessibility**: Proper ARIA labels and focus management

#### Negative
- **Network Dependency**: Requires API call for permission verification
- **Loading Time**: Additional delay for permission checks

### Implementation
```jsx
<SecureRoute requireAdmin={true}>
  <AdminDashboard />
</SecureRoute>
```

---

## ADR-006: Graceful Error Handling

### Status
**Accepted** - December 2024

### Context
Current error handling is inconsistent:
- Some errors crash the app
- No user-friendly error messages
- Limited error recovery options

### Decision
Implement **comprehensive error handling**:
1. ErrorBoundary components catch React errors
2. AuthService handles auth-specific errors
3. SecureAPIClient provides consistent error messages
4. Components show user-friendly error states

### Consequences

#### Positive
- **Reliability**: App doesn't crash on errors
- **User Experience**: Clear error messages and recovery options
- **Debugging**: Better error reporting for developers
- **Security**: No sensitive information in error messages

#### Negative
- **Complexity**: More error handling code
- **Bundle Size**: Additional error UI components

### Implementation
```jsx
// Error boundary wraps entire app
<ErrorBoundary>
  <App />
</ErrorBoundary>

// Component-level error handling
const { error, clearError } = useAuth();
if (error) return <ErrorDisplay error={error} onClear={clearError} />;
```

---

## ADR-007: No Console Token Logging

### Status
**Accepted** - December 2024

### Context
Current code logs JWT tokens to console for debugging:
```javascript
console.log('Token:', token); // 🚨 SECURITY ISSUE
```

This exposes sensitive authentication tokens that could be:
- Copied by malicious actors
- Accidentally shared in screenshots
- Logged to external services

### Decision
**Eliminate all token logging**:
1. Remove all console.log statements containing tokens
2. Log only non-sensitive information (status, errors)
3. Use proper debugging tools for development
4. Implement audit trail for security events

### Consequences

#### Positive
- **Security**: No token exposure in logs
- **Compliance**: Meets security audit requirements
- **Production Safety**: No accidental token leaks

#### Negative
- **Debugging**: Harder to debug token-related issues
- **Development**: Need alternative debugging methods

### Implementation
```javascript
// ❌ OLD: Token exposure
console.log('Auth headers:', headers);

// ✅ NEW: Safe logging
console.log('Auth request status:', response.ok ? 'success' : 'failed');
```

---

## ADR-008: Atomic Permission Updates

### Status
**Accepted** - December 2024

### Context
Current permission updates can be inconsistent:
- Partial permission states during updates
- Race conditions between permission calls
- UI flickering during permission changes

### Decision
Implement **atomic permission updates**:
1. All permission changes happen in single state update
2. Loading states prevent partial renders
3. Error states maintain previous valid permissions
4. Optimistic updates where appropriate

### Consequences

#### Positive
- **Consistency**: Permissions always in valid state
- **Performance**: Reduced re-renders
- **User Experience**: No UI flickering

#### Negative
- **Complexity**: More careful state management required
- **Memory**: Hold previous state during updates

### Implementation
```javascript
// Atomic permission update
const updatePermissions = (newPermissions) => {
  setPermissions(prevPerms => ({
    ...prevPerms,
    ...newPermissions,
    lastUpdated: Date.now()
  }));
};
```

---

## Future ADRs to Consider

### ADR-009: Permission Caching Strategy
- Cache duration policies
- Cache invalidation triggers
- Background refresh mechanisms

### ADR-010: Multi-Tenant Architecture  
- School-specific permissions
- Tenant isolation
- Cross-tenant operations

### ADR-011: Audit Trail Implementation
- Permission change logging
- Access attempt tracking
- Compliance reporting

### ADR-012: Progressive Enhancement
- Offline permission caching
- Service worker integration
- Graceful degradation