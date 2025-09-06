import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import { getEnvVar } from '../utils/env.js';

const Auth0ProviderWithHistory = ({ children }) => {
  const navigate = useNavigate();
  
  // Environment variables configuration (temporary hardcoded for testing)
  const domain = import.meta.env.VITE_AUTH0_DOMAIN || 'goddard-schools.us.auth0.com';
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID || 'qpzxYCkEh4C2rXqBnykPjdLIv9kuIVzk';
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE || 'https://hfj4ckons6.execute-api.ap-south-1.amazonaws.com/dev';
  
  // Development logging
  if (import.meta.env.DEV) {
    console.log('🔧 Auth0 Config:', { domain, clientId, audience: audience ? 'SET' : 'NOT SET' });
  }

  const onRedirectCallback = (appState) => {
    console.log('Auth0 redirect callback:', appState);
    // Navigate to the intended destination or login page
    const targetUrl = appState?.returnTo || '/login';
    console.log('Navigating to:', targetUrl);
    navigate(targetUrl, { replace: true });
  };

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: `${window.location.origin}/login`,
        scope: "openid profile email"
        // REMOVED: audience - not needed for basic web app authentication
        // API access tokens will be requested separately when needed
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderWithHistory;