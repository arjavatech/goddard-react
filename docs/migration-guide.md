# Auth0-Only Migration Guide

## Overview

This guide provides step-by-step instructions to migrate from the current mixed authentication system to a secure Auth0-only architecture.

## Pre-Migration Checklist

### 1. Backup Current System
```bash
git checkout -b auth-migration-backup
git add -A && git commit -m "Backup before Auth0-only migration"
```

### 2. Verify Dependencies
```bash
npm install @auth0/auth0-react
# Ensure Auth0 is properly configured
```

### 3. Environment Setup
Verify `.env` contains:
```env
VITE_AUTH0_DOMAIN=goddard-schools.us.auth0.com
VITE_AUTH0_CLIENT_ID=qpzxYCkEh4C2rXqBnykPjdLIv9kuIVzk
```

## Migration Steps

### Step 1: Create New Architecture Files

Copy the new architecture files to your project:

1. `/src/auth/AuthProvider.jsx` - Enhanced auth context
2. `/src/auth/AuthService.js` - Clean auth operations  
3. `/src/api/SecureAPIClient.js` - Secure API client
4. `/src/hooks/usePermissions.js` - Permission hook
5. `/src/components/SecureRoute.jsx` - Route protection
6. `/src/components/ui/LoadingSpinner.jsx` - Loading component
7. `/src/components/ui/ErrorBoundary.jsx` - Error boundary

### Step 2: Update Main Entry Point

Replace `src/main.jsx` with the new structure:

```jsx
// NEW: Wrap with AuthProvider inside Auth0Provider
<Auth0ProviderWithHistory>
  <AuthProvider>  {/* NEW */}
    <Routes>
      {/* Replace PrivateRoute with SecureRoute */}
      <Route path="/admin-dashboard" element={
        <SecureRoute requireAdmin={true}>
          <AdminDashboardNew />
        </SecureRoute>
      } />
    </Routes>
  </AuthProvider>
</Auth0ProviderWithHistory>
```

### Step 3: Update Components

#### 3.1 Replace Authentication Hooks

**Before (Mixed System):**
```jsx
// OLD: Multiple auth sources
import { useAuth } from '../hooks/useAuth';
import { isAdmin } from '../utils/authentication';

function AdminPanel() {
  const { user } = useAuth();
  const adminStatus = isAdmin(); // localStorage check
  
  if (!adminStatus) return <div>Access Denied</div>;
  
  return <div>Admin Content</div>;
}
```

**After (Auth0-Only):**
```jsx
// NEW: Single source of truth
import { useAuth } from '../auth/AuthProvider';
import { usePermissions } from '../hooks/usePermissions';

function AdminPanel() {
  const { user } = useAuth();
  const { isAdmin, canManageUsers } = usePermissions();
  
  if (!isAdmin) return <div>Access Denied</div>;
  
  return <div>Admin Content</div>;
}
```

#### 3.2 Replace API Calls

**Before (Insecure):**
```jsx
// OLD: Token exposure and localStorage fallback
const headers = await getAuthHeaders(getAccessTokenSilently);
console.log('Token:', headers.Authorization); // 🚨 SECURITY ISSUE

const response = await fetch('/api/data', { headers });
```

**After (Secure):**
```jsx
// NEW: Secure API client
import { useAuth0 } from '@auth0/auth0-react';
import { apiClient } from '../api/SecureAPIClient';

function DataComponent() {
  const { getAccessTokenSilently } = useAuth0();
  
  const fetchData = async () => {
    // No token exposure, proper error handling
    const response = await apiClient.get('/api/data', getAccessTokenSilently);
    return response;
  };
}
```

#### 3.3 Replace Route Protection

**Before:**
```jsx
<Route path="/admin" element={
  <PrivateRoute requireAdmin={true}>
    <AdminDashboard />
  </PrivateRoute>
} />
```

**After:**
```jsx
<Route path="/admin" element={
  <SecureRoute requireAdmin={true}>
    <AdminDashboard />
  </SecureRoute>
} />
```

### Step 4: Remove Legacy Files

After testing, remove these files:

```bash
# Remove legacy authentication files
rm src/hooks/useAuth.js
rm src/utils/auth.js  
rm src/utils/authentication.js
rm src/components/PrivateRoute.jsx

# Clean up localStorage usage
# Search and replace localStorage auth calls with permission hooks
```

### Step 5: Update Form Components

**Before:**
```jsx
// OLD: localStorage permission checks
function FormComponent() {
  const isAdminUser = localStorage.getItem('is_admin') === 'true';
  
  return (
    <form>
      {isAdminUser && <AdminSection />}
    </form>
  );
}
```

**After:**
```jsx
// NEW: Server-verified permissions
import { usePermissions } from '../hooks/usePermissions';

function FormComponent() {
  const { isAdmin, canEditForms } = usePermissions();
  
  return (
    <form>
      {isAdmin && <AdminSection />}
      {canEditForms && <EditControls />}
    </form>
  );
}
```

## Component Usage Examples

### Basic Permission Checking
```jsx
import { usePermissions } from '../hooks/usePermissions';

function Dashboard() {
  const { 
    isAdmin, 
    isParent, 
    canViewReports,
    isLoadingPermissions 
  } = usePermissions();
  
  if (isLoadingPermissions) {
    return <LoadingSpinner message="Loading permissions..." />;
  }
  
  return (
    <div>
      {isAdmin && <AdminPanel />}
      {isParent && <ParentPanel />}
      {canViewReports && <ReportsSection />}
    </div>
  );
}
```

### Conditional Rendering
```jsx
import { usePermissionGuard } from '../hooks/usePermissions';

function Navigation() {
  const { renderIfAdmin, renderIfParent } = usePermissionGuard();
  
  return (
    <nav>
      <ul>
        <li><a href="/dashboard">Dashboard</a></li>
        {renderIfAdmin(<li><a href="/admin">Admin</a></li>)}
        {renderIfParent(<li><a href="/parent">Parent Portal</a></li>)}
      </ul>
    </nav>
  );
}
```

### Secure API Integration
```jsx
import { useAuth0 } from '@auth0/auth0-react';
import { SecureAPIClient } from '../api/SecureAPIClient';

function DataManager() {
  const { getAccessTokenSilently } = useAuth0();
  const apiClient = new SecureAPIClient();
  
  const saveData = async (data) => {
    try {
      const result = await apiClient.post('/api/save', data, getAccessTokenSilently);
      return result;
    } catch (error) {
      // Error is already properly handled by SecureAPIClient
      console.error('Save failed:', error.message);
      throw error;
    }
  };
  
  return <DataForm onSave={saveData} />;
}
```

### Error Handling
```jsx
import { useAuth } from '../auth/AuthProvider';

function SecureComponent() {
  const { error, clearError } = useAuth();
  
  if (error) {
    return (
      <div className="error-container">
        <p>Error: {error}</p>
        <button onClick={clearError}>Try Again</button>
      </div>
    );
  }
  
  return <ComponentContent />;
}
```

## Testing the Migration

### 1. Authentication Flow Testing
```bash
# Test login flow
1. Navigate to /login
2. Click "Log In" - should open Auth0 popup
3. Login with valid credentials
4. Should redirect to appropriate dashboard

# Test logout flow  
1. Click logout in any dashboard
2. Should clear all auth state
3. Should redirect to /login
4. Should not be able to access protected routes
```

### 2. Permission Testing
```bash
# Test admin permissions
1. Login as admin user
2. Should access /admin-dashboard
3. Should see admin-only components
4. Should access parent routes too

# Test parent permissions  
1. Login as parent user
2. Should access /parent-dashboard
3. Should NOT access admin routes
4. Should see access denied message
```

### 3. Security Validation
```bash
# Verify no token exposure
1. Open browser dev tools
2. Navigate through app
3. Check console - no JWT tokens should be logged
4. Check localStorage - no auth data should be stored

# Verify server-side permissions
1. Try to access admin API with parent token
2. Should receive 403 Forbidden
3. Try to access API without token
4. Should receive 401 Unauthorized
```

## Troubleshooting

### Issue: "useAuth must be used within AuthProvider"
**Solution:** Ensure AuthProvider wraps your component tree in main.jsx

### Issue: Login popup blocked
**Solution:** Allow popups for your domain, or switch to redirect mode

### Issue: Permissions not loading
**Solution:** Check API endpoint is accessible and returns correct format

### Issue: Token refresh failing
**Solution:** Verify Auth0 configuration and audience settings

### Issue: Routes not protecting properly
**Solution:** Ensure SecureRoute wraps protected components correctly

## Performance Considerations

### 1. Permission Caching
The new architecture caches permissions in memory for the session:
- Permissions loaded once after authentication
- No localStorage reads/writes on every route change
- Automatic refresh on auth state change

### 2. Loading States
Proper loading states prevent layout shifts:
- Auth loading: While Auth0 initializes
- Permission loading: While checking server permissions
- Component loading: While fetching data

### 3. Error Recovery
Graceful error handling prevents app crashes:
- Network errors: Retry mechanisms
- Auth errors: Automatic logout and redirect
- Permission errors: Clear error messages

## Security Improvements

✅ **Eliminated Token Exposure**: No JWT tokens in console logs  
✅ **Removed Client-Side Auth Data**: No localStorage auth storage  
✅ **Server-Side Permissions**: All authorization on backend  
✅ **Proper Error Handling**: Secure fallbacks on all errors  
✅ **Session Security**: Auth0 handles all session management  

## Migration Validation Checklist

- [ ] All components use new auth hooks
- [ ] No localStorage auth calls remaining  
- [ ] No console.log of JWT tokens
- [ ] All routes use SecureRoute
- [ ] API calls use SecureAPIClient
- [ ] Error boundaries implemented
- [ ] Loading states properly handled
- [ ] Permission checks work correctly
- [ ] Login/logout flows working
- [ ] Security testing completed

## Rollback Plan

If issues arise during migration:

```bash
# Rollback to backup
git checkout auth-migration-backup

# Or rollback specific files
git checkout HEAD~1 -- src/main.jsx src/components/PrivateRoute.jsx
```

Keep the backup branch until the migration is fully validated in production.