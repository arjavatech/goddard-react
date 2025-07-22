import { isAuthenticated, signOut } from './auth';

export const checkAuth = () => {
  return isAuthenticated();
};

export const logout = () => {
  signOut();
};

export const getLoggedInEmail = () => {
  return localStorage.getItem('logged_in_email');
};

export const isAdmin = () => {
  return localStorage.getItem('is_admin') === 'true';
};