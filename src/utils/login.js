import CryptoJS from 'crypto-js';
import { api_base_url, school_id } from './const';

export const loginFunction = async (email, password) => {
  if (!email || !password) {
    return { success: false, error: 'empty' };
  }

  const hashedPassword = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
  const loginData = {
    email: email.toLowerCase(),
    password: hashedPassword
  };

  try {
    const response = await fetch(`${api_base_url}/sign_in/check/${school_id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    });

    const result = await response.json();

    if (result.isAdmin === true) {
      localStorage.setItem('is_admin', result.admin);
      localStorage.setItem('logged_in_email', email);
      return { success: true, redirect: '/admin-dashboard' };
    } else if (result.isParent === true) {
      localStorage.setItem('logged_in_email', email);
      return { success: true, redirect: '/parent-dashboard' };
    } else {
      return { success: false, error: 'invalid' };
    }
  } catch (error) {
    return { success: false, error: 'network' };
  }
};

export const handleGoogleLogin = (response) => {
  const responsePayload = decodeJwtResponse(response.credential);
  localStorage.clear();
  localStorage.setItem('logged_in_email', responsePayload.email);
  
  if (['goddard01arjava@gmail.com', 'goddard02arjava@gmail.com', 's_kaliappan@hotmail.com'].includes(responsePayload.email)) {
    return '/admin-dashboard';
  } else {
    return '/parent-dashboard';
  }
};

const decodeJwtResponse = (token) => {
  let base64Url = token.split('.')[1];
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  let jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(jsonPayload);
};