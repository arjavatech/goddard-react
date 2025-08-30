import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Header from './Header';
import { api_base_url, school_id } from '../utils/const';
import { getAuthHeaders } from '../utils/auth';


const Login = () => {
  const { loginWithPopup, isAuthenticated, isLoading, user, logout, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const [isSignupFlow, setIsSignupFlow] = useState(false);

  useEffect(() => {
    console.log('Auth state changed:', { isAuthenticated, isLoading, user: user?.email, isSignupFlow });
    if (isAuthenticated && user) {
      if (isSignupFlow) {
        console.log('Processing signup for user:', user.email);
        handleSignupAPI(user.email);
      } else {
        console.log('User is authenticated, checking permissions...');
        // Check user permissions with API
        checkUserPermissions(user.email);
      }
    }
  }, [isAuthenticated, user]);

  const checkUserPermissions = async (email) => {
    console.log('Checking permissions for email:', email);
    console.log('API URL:', `${api_base_url}/sign_in/check/${school_id}`);
    
    try {
      // Get Auth0 token and headers
      const headers = await getAuthHeaders(getAccessTokenSilently);

      // Call the API with Auth0 token
      const response = await fetch(`${api_base_url}/sign_in/check/${school_id}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          email: email.toLowerCase(),
          auth0_user: true
        })
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Permission data:', data);
        
        // Check if user has valid permissions
        if (data.isAdmin === true) {
          console.log('User is admin');
          localStorage.setItem('logged_in_email', email);
          localStorage.setItem('is_admin', 'true');
          navigate('/admin-dashboard');
        } else if (data.isParent === true) {
          console.log('User is parent');
          localStorage.setItem('logged_in_email', email);
          localStorage.removeItem('is_admin'); // Ensure admin flag is cleared for parent users
          navigate('/parent-dashboard');
        } else {
          // Invalid user - neither admin nor parent
          console.log('Invalid user - no permissions', data);
          alert('Invalid user - You do not have permission to access this application');
          logout({ logoutParams: { returnTo: window.location.origin } });
          return;
        }
      } else {
        // API call failed
        console.error('Permission check failed with status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        // If user not found in system, show invalid user message
        if (response.status === 404 || response.status === 500) {
          alert('Invalid user - You are not registered in the system');
          logout({ logoutParams: { returnTo: window.location.origin } });
          return;
        } else {
          alert('Unable to verify user permissions. Please contact support.');
          logout({ logoutParams: { returnTo: window.location.origin } });
          return;
        }
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      alert('Network error occurred. Please try again.');
      logout({ logoutParams: { returnTo: window.location.origin } });
      return;
    }
  };

  const handleLogin = async () => {
    try {
      console.log('Opening Auth0 login popup...');
      await loginWithPopup({
        authorizationParams: {
          prompt: 'login' // Force login screen to always show
        }
      });
      console.log('Login popup completed successfully');
    } catch (error) {
      console.error('Login popup error:', error);
      if (error.error !== 'popup_closed_by_user') {
        alert('Login failed. Please try again.');
      }
    }
  };

  const handleSignupAPI = async (email) => {
    try {
      const obj = {
        email: email,
        invite_id: null
      };

      // Get Auth0 token and headers
      const headers = await getAuthHeaders(getAccessTokenSilently);

      const response = await fetch(`${api_base_url}/sign_up/${school_id}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(obj)
      });

      const result = await response.json();

      if (result.message === "SignUp Data successfully updated") {
        console.log('Signup successful, checking permissions...');
        alert('Account created successfully!');
        await checkUserPermissions(email);
      } else if (result.error === `signup_id with email ${email} Already Registered`) {
        console.log('User already exists, checking permissions...');
        await checkUserPermissions(email);
      } else {
        alert('Signup failed. Please try again.');
        await logout({ logoutParams: { returnTo: window.location.origin } });
      }
    } catch (error) {
      console.error('Signup API error:', error);
      alert('Network error occurred during signup.');
    } finally {
      setIsSignupFlow(false);
    }
  };

  const handleSignup = async () => {
    try {
      setIsSignupFlow(true);
      console.log('Opening Auth0 signup popup...');
      await loginWithPopup({
        authorizationParams: {
          screen_hint: 'signup'
        }
      });
      console.log('Signup popup completed successfully');
    } catch (error) {
      console.error('Signup popup error:', error);
      setIsSignupFlow(false);
      if (error.error !== 'popup_closed_by_user') {
        alert('Signup failed. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Login Card */}
      <div className="flex justify-center items-center my-6">
        <div className="w-[470px] bg-blue-100 shadow-lg rounded-[20px] p-4">
          <div className="text-center mb-6">
            <img src="image/gs_logo_tab.png" className="w-[100px] h-[100px] mx-auto" alt="logo" />
          </div>
          
          <div className="px-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#002e4d] mb-2">Welcome to Goddard School</h2>
              <p className="text-gray-600">Please sign in to continue</p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleLogin}
                className="w-full rounded-md font-bold py-3 px-4 bg-[#002e4d] text-white hover:opacity-90 transition-opacity"
              >
                Log In
              </button>
              
              <button
                onClick={handleSignup}
                className="w-full rounded-md font-bold py-3 px-4 bg-[#0F2D52] text-white hover:opacity-90 transition-opacity"
              >
                Sign Up
              </button>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                New user? Click Sign Up to create an account
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;