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

  // API endpoint mapping - standardized across all forms
  const endpoints = {
    admission: `/admission_segment/${school_id}/${childId}`,
    authorization: `/authorization_form/${school_id}/${childId}`,
    parentHandbook: `/parent_handbook/${school_id}/${childId}`,
    enrollment: `/enrollment_form/${school_id}/${childId}`
  };

  const endpoint = endpoints[formType];
  if (!endpoint) {
    throw new Error(`Unknown form type: ${formType}`);
  }

  try {
    const headers = await getAuthHeaders(getAccessTokenSilently);
    const startTime = performance.now();
    
    const response = await fetch(`${api_base_url}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(formData)
    });

    const submitTime = performance.now() - startTime;
    console.log(`📊 Form submission time: ${submitTime.toFixed(2)}ms`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Form submission failed: ${response.status} - ${errorText}`);
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
 * Mark form as completed in the system
 * @param {number} childId - Child ID
 * @param {string} formType - Form type identifier
 * @param {Function} getAccessTokenSilently - Auth0 token function
 * @returns {Promise} API response
 */
export const markFormCompleted = async (childId, formType, getAccessTokenSilently) => {
  if (!childId || !formType) {
    throw new Error('Missing required parameters for form completion');
  }

  console.log('✅ Marking form as completed:', { childId, formType });

  try {
    const headers = await getAuthHeaders(getAccessTokenSilently);
    
    const response = await fetch(
      `${api_base_url}/admission_child_personal/completed_form_status/${school_id}/${childId}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          child_id: childId,
          formname: formType,
          completedTimestamp: new Date().toISOString()
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to mark form as completed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Form marked as completed:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Failed to mark form as completed:', error);
    throw error;
  }
};

/**
 * Complete form submission process
 * Submits form data, marks as completed, and triggers dashboard refresh
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
    console.log('🚀 Starting complete form submission process...');

    // Step 1: Submit form data
    await submitFormData(childId, formData, formType, getAccessTokenSilently);
    
    // Step 2: Mark as completed
    await markFormCompleted(childId, formType, getAccessTokenSilently);
    
    const totalTime = performance.now() - startTime;
    console.log(`⚡ Complete form submission finished in ${totalTime.toFixed(2)}ms`);
    
    // Step 3: Show success message
    const formDisplayName = formatFormName(formType);
    toast.success(`${formDisplayName} submitted successfully!`, {
      duration: 4000,
      description: 'Your form has been saved and marked as completed.'
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