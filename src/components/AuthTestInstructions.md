# Authentication Test Instructions

## Overview
This document provides detailed instructions for testing authentication persistence across page refresh and navigation using the `AuthenticationTest` component.

## Setup

1. **Add the test component to your routing:**

```jsx
// In your App.jsx or main router file
import AuthenticationTest from './components/AuthenticationTest';

// Add this route (accessible to all users for testing)
<Route path="/auth-test" element={<AuthenticationTest />} />
```

2. **Navigate to the test component:**
   - Go to `http://localhost:5173/auth-test` in your browser
   - Open browser developer tools (F12) and go to the Console tab

## Testing Scenarios

### 1. Initial State Validation

**What to check:**
- [ ] Current Authentication State panel shows correct values
- [ ] Token Information panel displays token details (if authenticated)
- [ ] Auth0 localStorage keys are visible in the monitor
- [ ] Console shows authentication monitoring messages

**Expected localStorage keys (when authenticated):**
- Keys starting with `@@auth0spajs@@::`
- May include `auth0.is.authenticated`, token-related keys
- Should show JSON data with length > 0

### 2. Login Flow Test

**If not authenticated:**
1. Click "Test Login" button
2. Complete Auth0 login process in popup
3. **Verify after login:**
   - [ ] Authentication state changes to "Yes"
   - [ ] User email and name appear
   - [ ] localStorage keys populate with Auth0 data
   - [ ] Console shows login success messages
   - [ ] Token information displays valid data

### 3. Page Refresh Persistence Test

**This is the critical test:**
1. Ensure you're authenticated
2. Click "Test Page Refresh" button
3. **After page refresh, verify:**
   - [ ] Authentication state remains "Yes" (should NOT logout)
   - [ ] User information persists
   - [ ] localStorage keys are still present
   - [ ] No authentication errors in console
   - [ ] Token information is restored

**If this fails:**
- Authentication state shows "No" after refresh
- localStorage keys are missing
- User is redirected to login

### 4. Navigation Persistence Test

**Test navigation between routes:**
1. While authenticated, click navigation buttons:
   - "Navigate to Dashboard"
   - "Navigate to Forms"
   - "Navigate to Home"
2. **For each navigation, verify:**
   - [ ] Authentication state persists
   - [ ] No logout occurs
   - [ ] localStorage keys remain
   - [ ] User information stays intact

### 5. Token Refresh Test

1. Click "Test Token Refresh" button
2. **Verify:**
   - [ ] New token is retrieved
   - [ ] Token expiry time updates
   - [ ] Authentication state remains stable
   - [ ] Refresh count increments

### 6. Logout Test

1. Click "Test Logout" button
2. **Verify:**
   - [ ] Authentication state changes to "No"
   - [ ] User information clears
   - [ ] localStorage keys are removed
   - [ ] Redirected to login page (if configured)

## Console Monitoring

**Key console messages to watch for:**

### Authentication State Changes:
```
🔐 [AuthTest] Authentication state changed: { timestamp, isAuthenticated, ... }
```

### localStorage Monitoring:
```
🔐 [AuthTest] Starting authentication monitoring...
```

### Test Results:
```
🧪 [AuthTest] Starting test: [Test Name]
✅ [AuthTest] Test passed: [Test Name]
❌ [AuthTest] Test failed: [Test Name]
```

### Auth0 Token Operations:
```
🎫 [Auth] Requesting access token for API calls...
✅ [Auth] API token acquired successfully in [time]ms
```

## Expected Behavior (Success Criteria)

### ✅ Successful Authentication Persistence:
1. **Page Refresh:** User remains authenticated, no logout
2. **Navigation:** Authentication persists across all routes
3. **localStorage:** Auth0 keys remain intact
4. **Tokens:** Automatically refresh when needed
5. **State:** Authentication context maintains consistency

### ❌ Signs of Issues:
1. **Logout on Refresh:** User gets logged out when refreshing page
2. **Missing localStorage:** Auth0 keys disappear unexpectedly
3. **Authentication Errors:** Console shows token or auth errors
4. **State Inconsistency:** Authentication state flickers or is unstable

## Advanced Testing

### 1. Token Expiry Simulation
- Wait for token to near expiry (check Token Information panel)
- Test if automatic refresh occurs
- Verify no logout happens during refresh

### 2. Network Interruption
- Disable network temporarily
- Refresh page
- Re-enable network
- Verify authentication recovery

### 3. Multiple Tab Testing
- Open application in multiple tabs
- Login in one tab
- Refresh other tabs
- Verify authentication syncs across tabs

## Test Data Export

Use the "Export Test Data" button to save:
- All test results
- Authentication state history
- localStorage key snapshots
- Current authentication state
- Token information

This data can be used for debugging and issue reporting.

## Troubleshooting Common Issues

### Issue: Page refresh causes logout
**Possible causes:**
- Auth0 configuration missing `cacheLocation: 'localstorage'`
- Missing refresh token
- Incorrect Auth0 domain/client configuration

**Check:**
```javascript
// In your Auth0 configuration
{
  cacheLocation: 'localstorage', // This is critical
  useRefreshTokens: true,
  // ... other config
}
```

### Issue: localStorage keys missing
**Check browser settings:**
- localStorage is enabled
- Private/incognito mode issues
- Browser clearing storage

### Issue: Token refresh failures
**Check console for:**
- Network errors
- Auth0 configuration issues
- Expired refresh tokens
- Invalid audience/scope settings

## Validation Checklist

**Complete this checklist for thorough testing:**

- [ ] 1. Component loads without errors
- [ ] 2. Initial authentication state displays correctly
- [ ] 3. localStorage monitoring works
- [ ] 4. Login process completes successfully
- [ ] 5. **Page refresh maintains authentication (CRITICAL)**
- [ ] 6. Navigation between routes works
- [ ] 7. Token refresh functions properly
- [ ] 8. Token retrieval works
- [ ] 9. Logout clears all authentication data
- [ ] 10. Console logging provides clear debugging info
- [ ] 11. Test results export works
- [ ] 12. Authentication state history tracks changes

## Success Metrics

**The authentication system is working correctly if:**
1. ✅ Page refresh **NEVER** causes unexpected logout
2. ✅ Navigation **NEVER** interrupts authentication
3. ✅ localStorage contains Auth0 data consistently
4. ✅ Tokens refresh automatically without user intervention
5. ✅ Manual logout properly clears all auth data
6. ✅ Login process works reliably

## Reporting Issues

If tests fail, include:
1. Browser and version
2. Console error messages
3. Exported test data
4. Screenshots of the test dashboard
5. Specific test that failed
6. Steps to reproduce

The test component provides comprehensive monitoring to identify and debug authentication issues quickly.