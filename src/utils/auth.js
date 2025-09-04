export const isAuthenticated = () => {
  const loggedInEmail = localStorage.getItem('logged_in_email');
  if (!loggedInEmail) {
    const isSignout = localStorage.getItem('isSignout');
    localStorage.removeItem('isSignout');
    // if (isSignout !== 'yes') {
    //   alert('Please login');
    // }
    return false;
  }
  return true;
};

export const signOut = () => {
  localStorage.clear();
  localStorage.setItem('isSignout', 'yes');
  
  if (sessionStorage.length > 0) {
    sessionStorage.clear();
  }

  
  const cookies = document.cookie.split("; ");
  for (let i = 0; i < cookies.length; i++) {
    const cookieName = cookies[i].split("=")[0];
    document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }
  
  window.location.href = '/login';  
};

// Helper function to get authorization headers with JWT token
// For use in components where getAccessTokenSilently is available
export const getAuthHeaders = async (getAccessTokenSilently) => {
  try {
    console.log('🔑 Attempting to get Auth0 access token...');
    const token = await getAccessTokenSilently();
    console.log('✅ Auth0 token fetched successfully:', token ? `${token.substring(0, 20)}...` : 'EMPTY_TOKEN');

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    console.log('📤 Headers being sent:', {
      'Content-Type': headers['Content-Type'],
      'Authorization': headers['Authorization'] ? `${headers['Authorization'].substring(0, 30)}...` : 'MISSING'
    });

    return headers;
  } catch (error) {
    console.error('❌ Error getting Auth0 token:', error);
    console.log('⚠️ Falling back to headers without Authorization');

    const fallbackHeaders = {
      'Content-Type': 'application/json'
    };

    console.log('📤 Fallback headers being sent:', fallbackHeaders);

    return fallbackHeaders;
  }
};