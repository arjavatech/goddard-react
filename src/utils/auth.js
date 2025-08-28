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
    const token = await getAccessTokenSilently();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  } catch (error) {
    console.error('Error getting Auth0 token:', error);
    return {
      'Content-Type': 'application/json'
    };
  }
};