import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';

const Auth0ProviderWithHistory = ({ children }) => {
  const navigate = useNavigate();
  
  // TODO: Move to environment variables in production
  const domain = "goddard-schools.us.auth0.com";
  const clientId = "qpzxYCkEh4C2rXqBnykPjdLIv9kuIVzk";

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
      }}
      useRefreshTokens={true}
      cacheLocation="memory"
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderWithHistory;