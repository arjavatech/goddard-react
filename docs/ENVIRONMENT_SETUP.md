# Environment Variables Configuration

This document explains how to set up environment variables for the Goddard React application.

## Required Environment Variables

The application uses environment variables to configure Auth0 authentication and API endpoints. All environment variables for Vite must be prefixed with `VITE_`.

### Auth0 Configuration

- `VITE_AUTH0_DOMAIN`: Your Auth0 domain (e.g., `your-tenant.us.auth0.com`)
- `VITE_AUTH0_CLIENT_ID`: Auth0 application client ID
- `VITE_AUTH0_AUDIENCE`: (Optional) Auth0 API identifier for token requests

### API Configuration

- `VITE_API_BASE_URL`: Base URL for the backend API
- `VITE_SCHOOL_ID`: School identifier (integer)
- `VITE_UPDATED_BY`: Default value for audit trail fields

### Development Configuration

- `NODE_ENV`: Environment mode (`development`, `production`, `test`)

## Setup Instructions

1. **Copy the example file**:
   ```bash
   cp .env.example .env
   ```

2. **Update the values** in `.env` with your specific configuration:
   ```bash
   # Auth0 Configuration
   VITE_AUTH0_DOMAIN=your-auth0-domain.auth0.com
   VITE_AUTH0_CLIENT_ID=your-auth0-client-id
   VITE_AUTH0_AUDIENCE=https://your-auth0-domain.auth0.com/api/v2/
   
   # API Configuration
   VITE_API_BASE_URL=https://your-api-gateway-url.com/dev
   VITE_SCHOOL_ID=1
   
   # Development Configuration
   NODE_ENV=development
   
   # Application Configuration
   VITE_UPDATED_BY=Admin
   ```

3. **Restart the development server** after making changes to environment variables.

## Security Notes

- The `.env` file is ignored by Git and should never be committed
- Use `.env.example` as a template for other developers
- Environment variables prefixed with `VITE_` are exposed to the client-side code
- Never put sensitive secrets in `VITE_` variables as they will be bundled with your frontend code

## File Structure

- `.env` - Your local environment configuration (ignored by Git)
- `.env.example` - Template file for other developers (committed to Git)
- `src/auth/Auth0Provider.jsx` - Uses Auth0 environment variables
- `src/utils/const.js` - Uses API and application environment variables

## Fallback Values

The application includes fallback values for all environment variables to ensure it works even if some variables are not set. However, for production deployments, all environment variables should be properly configured.

## Troubleshooting

### Environment Variables Not Loading

1. Ensure variables are prefixed with `VITE_`
2. Restart the development server after changes
3. Check that `.env` is in the project root directory
4. Verify `.env` file format (no spaces around `=`)

### Auth0 Authentication Issues

1. Verify `VITE_AUTH0_DOMAIN` is correct (without `https://`)
2. Check `VITE_AUTH0_CLIENT_ID` matches your Auth0 application
3. Ensure redirect URIs are configured in Auth0 dashboard
4. Verify `VITE_AUTH0_AUDIENCE` if using API authorization

### API Connection Issues

1. Check `VITE_API_BASE_URL` is accessible
2. Verify CORS configuration on the API server
3. Ensure `VITE_SCHOOL_ID` is a valid integer