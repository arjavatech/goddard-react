// SIMPLIFIED Form Submission Utilities - No more complex DOM manipulation!
// Standardized form submission with dashboard refresh integration
import { api_base_url, school_id } from '@/utils/const';
import { getAuthHeaders } from '@/utils/auth';
import { toast } from 'sonner';


/**
 * Submit form data to appropriate API endpoint
 * @param {number} childId - Child ID
 * @param {object} formData - Form data to submit
 * @param {string} formType - Type of form (admission, authorization, parentHandbook, enrollment)
 * @param {Function} getAccessTokenSilently - Auth0 token function
 * @returns {Promise} API response
 */
export const submitFormData = async (childId, formData, formType, getAccessTokenSilently) => {
  if (!childId || !formData || !formType) {
    throw new Error('Missing required parameters for form submission');
  }

  console.log('📝 Submitting form data:', { childId, formType, dataKeys: Object.keys(formData) });

  // API endpoint mapping with correct HTTP methods based on Bruno API docs
  const endpoints = {
    admission: {
      url: `/admission_segment/${school_id}/${childId}`,
      method: 'PUT' // Bruno shows PUT method for updates
    },
    authorization: {
      url: `/authorization_form/${school_id}/${childId}`,
      method: 'PUT' // Bruno shows PUT method for updates
    },
    parentHandbook: {
      url: `/parent_handbook/${school_id}/${childId}`,
      method: 'PUT' // Bruno shows PUT method for updates
    },
    enrollment: {
      url: `/enrollment_form/${school_id}/${childId}`,
      method: 'PUT' // Bruno shows PUT method for updates
    }
  };

  const endpointConfig = endpoints[formType];
  if (!endpointConfig) {
    throw new Error(`Unknown form type: ${formType}`);
  }

  try {
    const headers = await getAuthHeaders(getAccessTokenSilently);
    const startTime = performance.now();
    
    console.log(`🌐 Making ${endpointConfig.method} request to: ${api_base_url}${endpointConfig.url}`);
    
    const response = await fetch(`${api_base_url}${endpointConfig.url}`, {
      method: endpointConfig.method,
      headers,
      body: JSON.stringify(formData)
    });

    const submitTime = performance.now() - startTime;
    console.log(`📊 Form submission time: ${submitTime.toFixed(2)}ms`);

    if (!response.ok) {
      const errorText = await response.text();
      const errorMessage = `Form submission failed: ${response.status} - ${response.statusText}`;
      
      // Enhanced error handling for specific status codes
      if (response.status === 405) {
        console.error('❌ Method Not Allowed - trying alternative method');
        // Try with PUT method as fallback
        const fallbackResponse = await fetch(`${api_base_url}${endpointConfig.url}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(formData)
        });
        
        if (fallbackResponse.ok) {
          console.log('✅ Fallback PUT method succeeded');
          const result = await fallbackResponse.json();
          return result;
        } else {
          const fallbackErrorText = await fallbackResponse.text();
          throw new Error(`Both ${endpointConfig.method} and PUT methods failed. Status: ${response.status}, ${fallbackResponse.status}. Error: ${errorText || fallbackErrorText}`);
        }
      } else if (response.status === 400) {
        throw new Error(`Bad Request - Please check your form data: ${errorText}`);
      } else if (response.status === 401) {
        throw new Error('Authentication required - please login again');
      } else if (response.status === 403) {
        throw new Error('Access denied - insufficient permissions');
      } else if (response.status >= 500) {
        throw new Error(`Server error - please try again later: ${errorText}`);
      } else {
        throw new Error(`${errorMessage}: ${errorText}`);
      }
    }

    const result = await response.json();
    console.log('✅ Form data submitted successfully:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Form submission failed:', error);
    throw error;
  }
};

/**
 * Complete form submission process
 * Submits form data and triggers dashboard refresh
 * @param {number} childId - Child ID
 * @param {object} formData - Form data
 * @param {string} formType - Form type
 * @param {Function} getAccessTokenSilently - Auth0 token function
 * @param {Function} onSuccess - Success callback (triggers dashboard refresh)
 * @returns {Promise<boolean>} Success status
 */
export const submitAndCompleteForm = async (
  childId, 
  formData, 
  formType, 
  getAccessTokenSilently,
  onSuccess = null
) => {
  const startTime = performance.now();
  
  try {
    console.log('🚀 Starting form submission (completion auto-updated by API)...');

    // Submit form data (server updates completion status)
    await submitFormData(childId, formData, formType, getAccessTokenSilently);
    
    const totalTime = performance.now() - startTime;
    console.log(`⚡ Form submission finished in ${totalTime.toFixed(2)}ms`);
    
    // Step 3: Show success message
    const formDisplayName = formatFormName(formType);
    toast.success(`${formDisplayName} submitted successfully!`, {
      duration: 4000,
      description: 'Your form has been saved.'
    });
    
    // Step 4: Trigger dashboard refresh (this will refresh all data with single API call)
    if (onSuccess && typeof onSuccess === 'function') {
      console.log('🔄 Triggering dashboard refresh...');
      onSuccess();
    }
    
    return true;
  } catch (error) {
    console.error('❌ Form submission process failed:', error);
    
    // Show user-friendly error message
    const formDisplayName = formatFormName(formType);
    toast.error(`Failed to submit ${formDisplayName}`, {
      duration: 6000,
      description: error.message || 'Please try again or contact support if the problem persists.'
    });
    
    return false;
  }
};

/**
 * Format form type for display
 * @param {string} formType - Form type identifier
 * @returns {string} Formatted form name
 */
export const formatFormName = (formType) => {
  const formNames = {
    admission: 'Admission Form',
    authorization: 'Authorization Form',
    parentHandbook: 'Parent Handbook',
    enrollment: 'Enrollment Agreement'
  };

  return formNames[formType] || formType.replace(/([A-Z])/g, ' $1').trim();
};