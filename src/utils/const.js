import { getEnvVar } from './env.js';

export const school_id = getEnvVar('VITE_SCHOOL_ID', 1, 'number');
export const api_base_url = getEnvVar('VITE_API_BASE_URL', 'https://n80qdmac1b.execute-api.us-west-2.amazonaws.com/prod');
// For local development: "http://localhost:8000";

export const updated_by = getEnvVar('VITE_UPDATED_BY', 'Admin');