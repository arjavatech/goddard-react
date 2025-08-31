// Unified parent service using the consolidated API endpoint
import { apiClient } from '../api/client.js';
import { ENDPOINTS, FORM_TYPES } from '../api/endpoints.js';
import { cacheManager } from '../cache/multiLayerCache.js';

class ValidationError extends Error {
  constructor(message, errors = []) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

class DashboardDataError extends Error {
  constructor(message, originalError) {
    super(message);
    this.name = 'DashboardDataError';
    this.originalError = originalError;
  }
}

export class UnifiedParentService {
  /**
   * Get complete parent dashboard data from unified API
   * @param {string} email - Parent email address
   * @param {Function} getAccessTokenSilently - Auth0 token function
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Transformed dashboard data
   */
  static async getParentDashboardData(email, getAccessTokenSilently, options = {}) {
    const { useCache = true, forceRefresh = false } = options;
    const cacheKey = `parent_dashboard:${email}`;
    
    // Debug: Log the email being used for the API call
    console.log('UnifiedParentService: Making API call for email:', email);
    console.log('UnifiedParentService: API endpoint will be:', ENDPOINTS.PARENT_DASHBOARD_DATA(email));
    
    // Check cache first (unless force refresh)
    if (useCache && !forceRefresh) {
      const cachedData = await cacheManager.get(cacheKey);
      if (cachedData) {
        console.log('Serving parent dashboard data from cache for email:', email);
        return cachedData;
      }
    }

    try {
      console.log('Fetching parent dashboard data from API for email:', email);
      const startTime = performance.now();
      
      const rawData = await apiClient.get(
        ENDPOINTS.PARENT_DASHBOARD_DATA(email),
        { getAccessTokenSilently }
      );

      const loadTime = performance.now() - startTime;
      console.log(`API response time: ${loadTime.toFixed(2)}ms`);

      // Validate and transform data
      const transformedData = this.validateAndTransformData(rawData);

      // Cache the transformed data (5 minute TTL)
      if (useCache) {
        cacheManager.set(cacheKey, transformedData, 300000, {
          persistToSession: true,
          persistToStorage: false // Don't persist sensitive data
        });
      }

      return transformedData;

    } catch (error) {
      console.error('Parent dashboard data fetch failed:', error);
      
      // Try to serve stale cache data as fallback
      if (useCache) {
        const staleData = await cacheManager.get(cacheKey, { 
          fallbackToSession: true,
          updateAccess: false 
        });
        
        if (staleData) {
          console.warn('Serving stale data due to API error');
          return {
            ...staleData,
            isStale: true,
            lastError: error.message
          };
        }
      }

      throw new DashboardDataError('Failed to load dashboard data', error);
    }
  }

  /**
   * Validate and transform raw API response
   * @param {Array} data - Raw API response
   * @returns {Object} Transformed data
   */
  static validateAndTransformData(data) {
    // Validate structure
    if (!Array.isArray(data)) {
      throw new ValidationError('API response must be an array');
    }

    if (data.length === 0) {
      throw new ValidationError('No children found for this parent');
    }

    const errors = [];

    // Validate each child record
    data.forEach((child, index) => {
      if (!child.child_id) {
        errors.push(`Missing child_id at index ${index}`);
      }
      if (!child.child_first_name?.trim()) {
        errors.push(`Missing child name at index ${index}`);
      }
      
      // Ensure required nested objects exist
      child.child_information = child.child_information || {};
      child.CompletedFormStatus = child.CompletedFormStatus || [];
      child.InCompletedFormStatus = child.InCompletedFormStatus || [];
      
      // Sanitize sensitive data for frontend use
      this.sanitizeChildData(child);
    });

    if (errors.length > 0) {
      throw new ValidationError(`Data validation failed: ${errors.join(', ')}`, errors);
    }

    // Transform data for frontend consumption
    const parentName = data[0]?.parent_name || '';
    
    const children = data.map(child => ({
      childId: child.child_id,
      firstName: child.child_first_name,
      lastName: child.child_last_name,
      className: child.child_information?.class_name || 'Not Assigned',
      classId: child.child_information?.class_id || null,
      
      // Form status arrays
      completedForms: this.processCompletedForms(child.CompletedFormStatus),
      incompleteForms: child.InCompletedFormStatus || [],
      
      // Complete form data for form rendering
      formData: child.child_information || {},
      
      // Calculate form statistics
      stats: this.calculateFormStats(
        child.CompletedFormStatus || [], 
        child.InCompletedFormStatus || []
      ),
      
      // Form completion details
      formCompletionStatus: this.getFormCompletionStatus(
        child.CompletedFormStatus || [],
        child.InCompletedFormStatus || [],
        child.child_information || {}
      )
    }));

    return {
      parentName,
      children,
      totalChildren: children.length,
      lastUpdated: new Date().toISOString(),
      overallStats: this.calculateOverallStats(children)
    };
  }

  /**
   * Process completed forms to include formatted dates
   * @param {Array} completedForms - Raw completed forms array
   * @returns {Array} Processed forms with formatted dates
   */
  static processCompletedForms(completedForms) {
    return (completedForms || []).map(form => ({
      ...form,
      completedDate: form.completedTimestamp ? new Date(form.completedTimestamp) : null,
      formattedDate: form.completedTimestamp ? 
        new Date(form.completedTimestamp).toLocaleDateString() : 'Unknown'
    }));
  }

  /**
   * Calculate form statistics for a child
   * @param {Array} completed - Completed forms
   * @param {Array} incomplete - Incomplete forms  
   * @returns {Object} Statistics object
   */
  static calculateFormStats(completed, incomplete) {
    const totalForms = 4; // admission, authorization, handbook, enrollment
    const completedCount = completed.length;
    const incompleteCount = incomplete.length;
    
    return {
      total: totalForms,
      completed: completedCount,
      incomplete: incompleteCount,
      progress: totalForms > 0 ? Math.round((completedCount / totalForms) * 100) : 0,
      isComplete: completedCount === totalForms
    };
  }

  /**
   * Calculate overall statistics across all children
   * @param {Array} children - Array of child objects
   * @returns {Object} Overall statistics
   */
  static calculateOverallStats(children) {
    const totalForms = children.length * 4;
    const completedForms = children.reduce((sum, child) => sum + child.stats.completed, 0);
    
    return {
      totalForms,
      completedForms,
      progress: totalForms > 0 ? Math.round((completedForms / totalForms) * 100) : 0,
      childrenWithCompleteForms: children.filter(child => child.stats.isComplete).length
    };
  }

  /**
   * Get detailed form completion status
   * @param {Array} completedForms - Completed forms
   * @param {Array} incompleteForms - Incomplete forms
   * @param {Object} formData - Form data
   * @returns {Object} Form completion details
   */
  static getFormCompletionStatus(completedForms, incompleteForms, formData) {
    const formTypes = {
      [FORM_TYPES.ADMISSION]: 'Admission Form',
      [FORM_TYPES.AUTHORIZATION]: 'Authorization Form',
      [FORM_TYPES.PARENT_HANDBOOK]: 'Parent Handbook',
      [FORM_TYPES.ENROLLMENT]: 'Enrollment Agreement'
    };

    return Object.entries(formTypes).map(([key, name]) => {
      const completedForm = completedForms.find(form => form.formname === key);
      const isCompleted = !!completedForm;
      const isIncomplete = incompleteForms.includes(key);

      return {
        key,
        name,
        completed: isCompleted,
        completedDate: completedForm?.completedTimestamp || null,
        formattedDate: completedForm?.formattedDate || null,
        isIncomplete,
        canEdit: true, // All forms can be edited
        canDownload: isCompleted,
        canPrint: isCompleted,
        hasData: this.hasFormData(key, formData)
      };
    });
  }

  /**
   * Check if form has data
   * @param {string} formType - Form type key
   * @param {Object} formData - Form data object
   * @returns {boolean} Whether form has data
   */
  static hasFormData(formType, formData) {
    switch (formType) {
      case FORM_TYPES.ADMISSION:
        return !!(formData.child_first_name || formData.child_last_name);
      case FORM_TYPES.AUTHORIZATION:
        return !!(formData.bank_routing || formData.bank_account);
      case FORM_TYPES.PARENT_HANDBOOK:
        return !!(formData.welcome_goddard_agreement);
      case FORM_TYPES.ENROLLMENT:
        return !!(formData.point_one_field_three || formData.preferred_start_date);
      default:
        return false;
    }
  }

  /**
   * Sanitize sensitive child data
   * @param {Object} child - Child object to sanitize
   */
  static sanitizeChildData(child) {
    if (!child.child_information) return;

    const sensitiveFields = ['bank_account', 'bank_routing', 'driver_license'];
    
    sensitiveFields.forEach(field => {
      if (child.child_information[field]) {
        child.child_information[field] = this.maskSensitiveData(
          child.child_information[field]
        );
      }
    });
  }

  /**
   * Mask sensitive data for display
   * @param {string} value - Value to mask
   * @returns {string} Masked value
   */
  static maskSensitiveData(value) {
    if (!value || typeof value !== 'string') return value;
    
    if (value.length <= 4) return '****';
    
    return '*'.repeat(value.length - 4) + value.slice(-4);
  }

  /**
   * Refresh data and invalidate cache
   * @param {string} email - Parent email
   * @param {Function} getAccessTokenSilently - Auth0 token function
   * @returns {Promise<Object>} Fresh data
   */
  static async refreshParentData(email, getAccessTokenSilently) {
    // Invalidate cache
    cacheManager.invalidateParentData(email);
    
    // Fetch fresh data
    return this.getParentDashboardData(email, getAccessTokenSilently, { 
      useCache: false,
      forceRefresh: true 
    });
  }

  /**
   * Get data for specific child
   * @param {string} email - Parent email
   * @param {number} childId - Child ID
   * @param {Function} getAccessTokenSilently - Auth0 token function
   * @returns {Promise<Object>} Child data
   */
  static async getChildData(email, childId, getAccessTokenSilently) {
    const dashboardData = await this.getParentDashboardData(email, getAccessTokenSilently);
    const child = dashboardData.children.find(c => c.childId === childId);
    
    if (!child) {
      throw new Error(`Child with ID ${childId} not found`);
    }
    
    return child;
  }
}

// Export error classes
export { ValidationError, DashboardDataError };