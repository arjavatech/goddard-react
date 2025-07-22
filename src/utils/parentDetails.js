export const resendParentInvite = async (parentEmail) => {
  try {
    const response = await fetch(`https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/parent_invite_mail/resend/${parentEmail}`, {
      method: 'GET'
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

export const updateParentStatus = async (parentId, status) => {
  try {
    const response = await fetch(`https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/update_parent_info_status/${parentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
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

export const loadParentDetails = async (statusFilter = '') => {
  try {
    const response = await fetch('https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/parent_invite_status/getall');
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

export const loadParentInfo = async () => {
  try {
    const response = await fetch('https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/parent_info/getall');
    const result = await response.json();
    return result || [];
  } catch (error) {
    return [];
  }
};