/**
 * DEPRECATED: Legacy login system with SHA256 password hashing
 * 
 * ⚠️  SECURITY WARNING: This file has been deprecated due to security vulnerabilities:
 * 
 * 1. SHA256 client-side password hashing - easily bypassable
 * 2. localStorage authentication storage - client-side manipulation risk  
 * 3. Hardcoded admin email arrays - maintenance nightmare
 * 4. Console logging of sensitive authentication data
 * 
 * 🔒 REPLACEMENT: Use Auth0 authentication instead
 * 
 * See migration guide: /docs/LEGACY_AUTH_REMOVAL.md
 * Use new Auth0 utilities: /utils/auth-clean.js, /utils/login-auth0.js
 */

console.error(`
🚨 DEPRECATED: login.js is no longer supported

This file contains security vulnerabilities and has been replaced with Auth0 authentication.

❌ Vulnerabilities in this file:
- Client-side SHA256 password hashing (bypassable)
- localStorage authentication tokens (manipulatable) 
- Hardcoded admin email lists (unmaintainable)

✅ Use instead:
- Auth0 authentication via useAuth0 hook
- Server-side permission verification
- JWT token-based authentication

📖 Migration guide: /docs/LEGACY_AUTH_REMOVAL.md
`);

/**
 * DEPRECATED: This function has been removed for security reasons
 * Use Auth0 authentication instead
 */
export const loginFunction = () => {
  throw new Error(`
    SECURITY: loginFunction() has been deprecated due to vulnerabilities.
    
    ❌ Removed: SHA256 client-side password hashing
    ❌ Removed: localStorage authentication storage
    ❌ Removed: Hardcoded admin email verification
    
    ✅ Use: Auth0 authentication with server-side verification
    
    See: /utils/login-auth0.js for secure replacement
    Guide: /docs/LEGACY_AUTH_REMOVAL.md
  `);
};

/**
 * DEPRECATED: This function has been removed for security reasons  
 * Use Auth0 authentication instead
 */
export const handleGoogleLogin = () => {
  throw new Error(`
    SECURITY: handleGoogleLogin() has been deprecated due to vulnerabilities.
    
    ❌ Removed: Hardcoded admin email arrays
    ❌ Removed: localStorage authentication storage
    
    ✅ Use: Auth0 authentication with database-driven roles
    
    See: /utils/auth-clean.js for secure replacement
    Guide: /docs/LEGACY_AUTH_REMOVAL.md
  `);
};