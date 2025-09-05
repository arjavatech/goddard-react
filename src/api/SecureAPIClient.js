import { api_base_url, school_id } from '../utils/const';

/**
 * Secure API client that handles Auth0 JWT tokens properly
 * No token exposure, proper error handling
 */
export class SecureAPIClient {
  constructor() {
    this.baseURL = api_base_url;
    this.schoolId = school_id;
  }

  /**
   * Get secure headers with Auth0 JWT token
   * Never logs tokens - security critical
   */
  async getSecureHeaders(getAccessTokenSilently) {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: 'goddard-school-api' // Replace with your Auth0 API identifier
        }
      });
      
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
    } catch (error) {
      console.error('Token acquisition failed:', error.message);
      throw new Error('Authentication required - please login again');
    }
  }

  /**
   * Check user permissions - single source of truth
   */
  async checkPermissions(email, getAccessTokenSilently) {
    const headers = await this.getSecureHeaders(getAccessTokenSilently);
    
    try {
      const response = await fetch(`${this.baseURL}/sign_in/check/${this.schoolId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: email.toLowerCase(),
          auth0_user: true
        })
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found in system');
        }
        if (response.status === 401) {
          throw new Error('Authentication required - please login again');
        }
        if (response.status >= 500) {
          throw new Error('Server error - please try again later');
        }
        throw new Error('Permission check failed');
      }

      const data = await response.json();
      
      // Validate response structure
      if (typeof data.isAdmin !== 'boolean' || typeof data.isParent !== 'boolean') {
        throw new Error('Invalid permission data received');
      }

      return data;
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error('Network error - please check your connection');
      }
      throw error;
    }
  }

  /**
   * Register new user with invite
   */
  async registerUser(email, inviteId, getAccessTokenSilently) {
    const headers = await this.getSecureHeaders(getAccessTokenSilently);
    
    const response = await fetch(`${this.baseURL}/sign_up/${this.schoolId}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email: email.toLowerCase(),
        invite_id: inviteId
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (errorData.error && errorData.error.includes('Already Registered')) {
        // User already exists - this is ok
        return { message: 'User already registered' };
      }
      
      throw new Error(errorData.message || 'Registration failed');
    }

    return response.json();
  }

  /**
   * Make any authenticated request with proper error handling
   */
  async makeAuthenticatedRequest(endpoint, options = {}, getAccessTokenSilently) {
    const headers = await this.getSecureHeaders(getAccessTokenSilently);
    
    const config = {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    };

    try {
      const response = await fetch(endpoint, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required - please login again');
        }
        if (response.status === 403) {
          throw new Error('Access denied - insufficient permissions');
        }
        if (response.status >= 500) {
          throw new Error('Server error - please try again later');
        }
        throw new Error(`Request failed with status ${response.status}`);
      }

      return response;
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error('Network error - please check your connection');
      }
      throw error;
    }
  }

  /**
   * Helper method for GET requests
   */
  async get(endpoint, getAccessTokenSilently) {
    const response = await this.makeAuthenticatedRequest(
      endpoint,
      { method: 'GET' },
      getAccessTokenSilently
    );
    return response.json();
  }

  /**
   * Helper method for POST requests
   */
  async post(endpoint, data, getAccessTokenSilently) {
    const response = await this.makeAuthenticatedRequest(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify(data)
      },
      getAccessTokenSilently
    );
    return response.json();
  }

  /**
   * Helper method for PUT requests
   */
  async put(endpoint, data, getAccessTokenSilently) {
    const response = await this.makeAuthenticatedRequest(
      endpoint,
      {
        method: 'PUT',
        body: JSON.stringify(data)
      },
      getAccessTokenSilently
    );
    return response.json();
  }

  /**
   * Helper method for DELETE requests
   */
  async delete(endpoint, getAccessTokenSilently) {
    const response = await this.makeAuthenticatedRequest(
      endpoint,
      { method: 'DELETE' },
      getAccessTokenSilently
    );
    return response.ok;
  }
}