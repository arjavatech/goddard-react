import { getEnvVar } from './env.js';

export const school_id = getEnvVar('VITE_SCHOOL_ID', 1, 'number');
export const api_base_url = getEnvVar('VITE_API_BASE_URL', 'https://hfj4ckons6.execute-api.ap-south-1.amazonaws.com/dev');
// For local development: "http://localhost:8000";

export const updated_by = getEnvVar('VITE_UPDATED_BY', 'Admin');