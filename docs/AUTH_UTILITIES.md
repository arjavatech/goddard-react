# Authentication Utilities Documentation

## Overview
The `src/utils/auth.js` module provides secure authentication utilities for the Goddard School application, integrating with Auth0 for JWT token-based authentication.

## Key Features
- ✅ Secure JWT token handling
- ✅ Automatic fallback for authentication errors
- ✅ Support for different content types (JSON, multipart, custom)
- ✅ User permission checking (admin/parent)
- ✅ Comprehensive error handling
- ✅ TypeScript-friendly function signatures

## Main Functions

### Core Header Generation

#### `getAuthHeaders(getAccessTokenSilently)`
Generates authenticated headers for standard API requests.

```javascript
import { getAuthHeaders } from '@/utils/auth';
import { useAuth0 } from '@auth0/auth0-react';

const { getAccessTokenSilently } = useAuth0();
const headers = await getAuthHeaders(getAccessTokenSilently);
// Returns: { 'Content-Type': 'application/json', 'Authorization': 'Bearer <token>' }
```

#### `getAuthHeadersWithContentType(getAccessTokenSilently, contentType)`
Generates authenticated headers with custom content type.

```javascript
const headers = await getAuthHeadersWithContentType(getAccessTokenSilently, 'text/xml');
// Returns: { 'Content-Type': 'text/xml', 'Authorization': 'Bearer <token>' }
```

#### `getAuthHeadersForUpload(getAccessTokenSilently)`
Generates authenticated headers for file uploads (no Content-Type set).

```javascript
const headers = await getAuthHeadersForUpload(getAccessTokenSilently);
// Returns: { 'Authorization': 'Bearer <token>' }
// Note: Content-Type omitted to allow browser to set multipart boundary
```

### Convenience Request Functions

#### `authenticatedFetch(url, options, getAccessTokenSilently)`
Makes authenticated fetch request with automatic header injection.

```javascript
const response = await authenticatedFetch('/api/data', {
  method: 'GET'
}, getAccessTokenSilently);
```

#### `authenticatedPost(url, data, getAccessTokenSilently, options)`
Makes authenticated POST request with JSON data.

```javascript
const response = await authenticatedPost('/api/users', {
  name: 'John Doe',
  email: 'john@example.com'
}, getAccessTokenSilently);
```

### Permission Checking

#### `getUserPermissions(getAccessTokenSilently, email, schoolId, apiBaseUrl)`
Gets user permissions (admin/parent status).

```javascript
import { api_base_url, school_id } from '@/utils/const';

const permissions = await getUserPermissions(
  getAccessTokenSilently,
  'user@example.com',
  school_id,
  api_base_url
);
// Returns: { isAdmin: boolean, isParent: boolean, email: string }
```

#### `checkAdminPrivileges(getAccessTokenSilently, email, schoolId, apiBaseUrl)`
Checks if user has admin privileges.

```javascript
const isAdmin = await checkAdminPrivileges(
  getAccessTokenSilently,
  'user@example.com', 
  school_id,
  api_base_url
);
// Returns: boolean
```

### Error Handling

#### `handleAuthError(error, logout)`
Handles authentication-related errors with automatic logout for token issues.

```javascript
import { useAuth0 } from '@auth0/auth0-react';

const { logout } = useAuth0();

try {
  // API call that might fail
} catch (error) {
  handleAuthError(error, logout);
}
```

## Usage Examples

### Basic API Request
```javascript
import { getAuthHeaders } from '@/utils/auth';
import { useAuth0 } from '@auth0/auth0-react';
import { api_base_url, school_id } from '@/utils/const';

const MyComponent = () => {
  const { getAccessTokenSilently } = useAuth0();
  
  const fetchData = async () => {
    try {
      const headers = await getAuthHeaders(getAccessTokenSilently);
      const response = await fetch(`${api_base_url}/data/${school_id}`, {
        method: 'GET',
        headers
      });
      
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.error('API request failed:', error);
    }
  };
  
  // ... component logic
};
```

### File Upload
```javascript
const uploadFile = async (file) => {
  try {
    const headers = await getAuthHeadersForUpload(getAccessTokenSilently);
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${api_base_url}/upload/${school_id}`, {
      method: 'POST',
      headers, // No Content-Type - browser sets it automatically
      body: formData
    });
    
    return await response.json();
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### Permission-Based Navigation
```javascript
const checkUserAccess = async () => {
  try {
    const permissions = await getUserPermissions(
      getAccessTokenSilently,
      user.email,
      school_id,
      api_base_url
    );
    
    if (permissions?.isAdmin) {
      navigate('/admin-dashboard');
    } else if (permissions?.isParent) {
      navigate('/parent-dashboard');
    } else {
      alert('Access denied - insufficient permissions');
      logout({ logoutParams: { returnTo: window.location.origin } });
    }
  } catch (error) {
    handleAuthError(error, logout);
  }
};
```

## Migration from Legacy Auth

If upgrading from the deprecated `login.js` system:

### Before (Deprecated)
```javascript
// ❌ Insecure - client-side password hashing
import { loginFunction } from '../utils/login.js';
```

### After (Secure)
```javascript
// ✅ Secure - Auth0 JWT tokens
import { getAuthHeaders, getUserPermissions } from '@/utils/auth';
import { useAuth0 } from '@auth0/auth0-react';
```

## Security Benefits

1. **JWT Token-Based**: Secure, server-verified tokens instead of client-side password hashing
2. **Automatic Expiration**: Tokens expire and refresh automatically via Auth0
3. **No localStorage Dependencies**: Authentication state managed securely by Auth0
4. **Server-Side Verification**: Permissions verified by backend API, not client-side arrays
5. **Error Recovery**: Graceful fallback handling for authentication failures

## Error Handling

All functions include comprehensive error handling:

- **Token Failures**: Returns headers without Authorization on token errors
- **Network Issues**: Logs errors and returns null/fallback values
- **Permission Errors**: Returns false for permission checks that fail
- **Automatic Logout**: Token-related errors trigger logout redirect

## Testing

Run the test suite to verify functionality:

```bash
node tests/auth-utilities-test.js
```

The test suite covers:
- ✅ Header generation with valid tokens
- ✅ Error handling and fallbacks  
- ✅ Custom content type support
- ✅ Upload header generation
- ✅ Token extraction
- ✅ Function exports

## Best Practices

1. **Always use these utilities** instead of manually constructing auth headers
2. **Handle errors gracefully** - all functions include error handling
3. **Don't store tokens** in localStorage - let Auth0 manage token lifecycle
4. **Check permissions server-side** - client-side checks are for UX only
5. **Use appropriate content types** - different headers for JSON vs uploads
6. **Test error scenarios** - verify your code handles auth failures properly

## Support

- For Auth0 issues: Check Auth0 dashboard and logs
- For API issues: Verify server endpoints and permissions  
- For component integration: Ensure useAuth0 hook is properly initialized