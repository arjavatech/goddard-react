import { api_base_url, school_id } from './const';
import { getAuthHeaders } from './auth';

export const resendParentInvite = async (parentEmail, getAccessTokenSilently) => {
  try {
    const headers = await getAuthHeaders(getAccessTokenSilently);
    const response = await fetch(`${api_base_url}/parent_invite_mail/resend/${parentEmail}`, {
      method: 'GET',
      headers
    });
    
    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: 'Email sending failed' };
    }
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
};

export const updateParentStatus = async (parentId, status, getAccessTokenSilently) => {
  try {
    const headers = await getAuthHeaders(getAccessTokenSilently);
    const response = await fetch(`${api_base_url}/update_parent_info_status/${parentId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ status })
    });

    const result = await response.json();
    
    if (result.message?.includes('updated successfully')) {
      return { success: true };
    } else {
      return { success: false, error: 'Update failed' };
    }
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
};

export const loadParentDetails = async (statusFilter = '', getAccessTokenSilently) => {
  try {
    const headers = await getAuthHeaders(getAccessTokenSilently);
    const response = await fetch(`${api_base_url}/parent_invite_status/getall/${school_id}`, {
      headers
    });
    const result = await response.json();
    
    if (!statusFilter) {
      return result.Active || [];
    } else if (statusFilter === "Archive") {
      return result.Archive || [];
    } else if (statusFilter === "Active") {
      return result.Active || [];
    } else {
      return [];
    }
  } catch (error) {
    return [];
  }
};

export const loadParentInfo = async (getAccessTokenSilently) => {
  try {
    const headers = await getAuthHeaders(getAccessTokenSilently);
    const response = await fetch(`${api_base_url}/parent/${school_id}`, {
      headers
    });
    const result = await response.json();
    return result || [];
  } catch (error) {
    return [];
  }
};