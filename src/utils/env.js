/**
 * Environment Variables Utility
 * Provides helper functions for environment variable management and validation
 */

/**
 * Get environment variable with fallback and type conversion
 * @param {string} key - Environment variable key
 * @param {any} fallback - Fallback value
 * @param {string} type - Expected type ('string', 'number', 'boolean')
 * @returns {any} - Environment variable value or fallback
 */
export const getEnvVar = (key, fallback = null, type = 'string') => {
  const value = import.meta.env[key];
  
  if (!value) {
    return fallback;
  }
  
  switch (type) {
    case 'number':
      const num = parseInt(value, 10);
      return isNaN(num) ? fallback : num;
    case 'boolean':
      return value.toLowerCase() === 'true';
    default:
      return value;
  }
};

/**
 * Validate required environment variables
 * @param {Array<string>} requiredVars - Array of required environment variable keys
 * @throws {Error} - If any required variables are missing
 */
export const validateRequiredEnvVars = (requiredVars) => {
  const missing = requiredVars.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }
};

/**
 * Get current environment configuration for debugging
 * @returns {object} - Environment configuration object
 */
export const getEnvConfig = () => {
  return {
    auth0: {
      domain: getEnvVar('VITE_AUTH0_DOMAIN', 'not-set'),
      clientId: getEnvVar('VITE_AUTH0_CLIENT_ID', 'not-set'),
      audience: getEnvVar('VITE_AUTH0_AUDIENCE', 'not-set'),
    },
    api: {
      baseUrl: getEnvVar('VITE_API_BASE_URL', 'not-set'),
      schoolId: getEnvVar('VITE_SCHOOL_ID', 0, 'number'),
    },
    app: {
      nodeEnv: getEnvVar('NODE_ENV', 'development'),
      updatedBy: getEnvVar('VITE_UPDATED_BY', 'Admin'),
    }
  };
};

/**
 * Log environment configuration (development only)
 */
export const logEnvConfig = () => {
  if (import.meta.env.DEV) {
    console.log('Environment Configuration:', getEnvConfig());
  }
};

// Environment variable constants
export const ENV_VARS = {
  AUTH0_DOMAIN: 'VITE_AUTH0_DOMAIN',
  AUTH0_CLIENT_ID: 'VITE_AUTH0_CLIENT_ID',
  AUTH0_AUDIENCE: 'VITE_AUTH0_AUDIENCE',
  API_BASE_URL: 'VITE_API_BASE_URL',
  SCHOOL_ID: 'VITE_SCHOOL_ID',
  UPDATED_BY: 'VITE_UPDATED_BY',
  NODE_ENV: 'NODE_ENV'
};

// Required environment variables for production
export const REQUIRED_ENV_VARS = [
  ENV_VARS.AUTH0_DOMAIN,
  ENV_VARS.AUTH0_CLIENT_ID,
  ENV_VARS.API_BASE_URL,
  ENV_VARS.SCHOOL_ID
];