/**
 * Auth0 Login Utilities
 * 
 * Secure authentication functions using Auth0 service
 */

export const auth0LoginFunction = async (loginWithPopup, options = {}) => {
  try {
    console.log('Initiating Auth0 login...');
    
    const result = await loginWithPopup({
      authorizationParams: {
        prompt: 'login',
        ...options.authorizationParams
      },
      ...options
    });
    
    console.log('Auth0 login successful');
    return result;
  } catch (error) {
    console.error('Auth0 login error:', error);
    
    // Don't throw for user-cancelled popups
    if (error.error === 'popup_closed_by_user') {
      return null;
    }
    
    throw error;
  }
};