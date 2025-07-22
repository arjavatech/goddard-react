import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const checkAuth = () => {
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

  const signOut = () => {
    localStorage.clear();
    localStorage.setItem('isSignout', 'yes');
    
    if (sessionStorage.length > 0) {
      sessionStorage.clear();
    }
    
    // Clear cookies
    const cookies = document.cookie.split("; ");
    for (let i = 0; i < cookies.length; i++) {
      const cookieParts = cookies[i].split("=");
      const cookieName = cookieParts[0];
      document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
    
    window.location.reload();
  };

  useEffect(() => {
    if (checkAuth()) {
      setIsAuthenticated(true);
      document.body.style.visibility = 'visible';
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return { isAuthenticated, signOut };
};