# Auth0 Integration Setup

## Overview
The authentication system has been updated to use Auth0 instead of custom login/signup logic. This provides a more secure and scalable authentication solution.

## Changes Made

### 1. Dependencies
- Added `@auth0/auth0-react` package for Auth0 integration

### 2. Environment Variables
Created `.env` file with Auth0 credentials:
```
VITE_AUTH0_DOMAIN=goddard-schools.us.auth0.com
VITE_AUTH0_CLIENT_ID=qpzxYCkEh4C2rXqBnykPjdLIv9kuIVzk
```

### 3. New Components
- **Auth0Provider** (`src/auth/Auth0Provider.jsx`): Wraps the app with Auth0 context
- **PrivateRoute** (`src/components/PrivateRoute.jsx`): Protects routes requiring authentication

### 4. Updated Components
- **Login** (`src/components/Login.jsx`): Now uses Auth0's `loginWithRedirect` for authentication
- **SignUp** (`src/components/SignUp.jsx`): Uses Auth0 signup flow with invite_id support
- **useAuth Hook** (`src/hooks/useAuth.js`): Updated to work with Auth0

### 5. Authentication Flow

#### Login Process:
1. User clicks "Log In with Auth0" button
2. Auth0 Universal Login page opens
3. After successful authentication, user is redirected back
4. App checks user permissions via API endpoint:
   - If `isAdmin: true` → Redirect to Admin Dashboard (/admin-dashboard)
   - If `isParent: true` → Redirect to Parent Dashboard (/parent-dashboard)
   - If neither → Show "Invalid user" alert and logout from Auth0

#### Signup Process:
1. User receives invite link with `invite_id` parameter
2. Clicks "Sign Up with Auth0" button
3. Auth0 signup page opens
4. After account creation, API is called to register user with invite_id
5. Permissions are checked:
   - If `isAdmin: true` → Redirect to Admin Dashboard
   - If `isParent: true` → Redirect to Parent Dashboard
   - If neither → Show "Invalid user" alert and logout

### 6. API Integration
The Auth0 integration still uses your existing API endpoints:
- Permission check: `GET /sign_in/{school_id}/{email}`
- Signup registration: `POST /sign_up/{school_id}`

The flow maintains compatibility with your existing backend while adding Auth0 authentication.

## Testing Instructions

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Test Login Flow
1. Navigate to http://localhost:5173
2. Click "Log In with Auth0"
3. Use existing credentials or create a new account
4. Verify redirection to appropriate dashboard

### 3. Test Signup Flow with Invite
1. Navigate to http://localhost:5173/signup?invite_id=test123
2. Click "Sign Up with Auth0"
3. Create a new account
4. Verify the invite_id is processed and user is redirected

### 4. Test Protected Routes
- Admin routes require `isAdmin: true` from API
- Parent routes require `isParent: true` from API
- Invalid users (neither admin nor parent) see "Invalid user" message and are logged out

### 5. Test Logout
1. Click "Sign Out" button in any dashboard
2. Verify user is logged out from Auth0
3. Verify redirection to login page

## Important Notes

1. **Auth0 Credentials**: The current credentials are from the reference Auth0 app. You may want to create your own Auth0 application for production.

2. **Existing User Data**: The integration maintains compatibility with your existing user permission system. Auth0 handles authentication, while your API handles authorization.

3. **Invite System**: The invite_id system is preserved and works with Auth0 signup flow.

4. **Session Management**: Auth0 handles session management automatically with secure tokens.

## Troubleshooting

### If login redirects fail:
- Check that the callback URL is configured in Auth0 dashboard
- Verify the domain and client ID in .env file

### If permissions are not working:
- Check the API endpoints are accessible
- Verify the email is being passed correctly to the API

### If Auth0 popup is blocked:
- Ensure popups are allowed for the domain
- Consider using redirect mode instead of popup mode

## Next Steps

1. Create your own Auth0 tenant and application
2. Configure callback URLs in Auth0 dashboard
3. Update environment variables with your Auth0 credentials
4. Test with production API endpoints
5. Configure Auth0 rules/actions for custom claims if needed