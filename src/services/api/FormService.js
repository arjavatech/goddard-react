/**
 * Form API Service
 * Handles all form-related API operations
 */

import { toast } from 'sonner';

class FormService {
  constructor(apiClient) {
    this.api = apiClient;
  }

  /**
   * Get all available forms from the main form repository
   */
  async getAllForms() {
    try {
      // Use relative endpoint resolved by ApiClient baseURL
      const data = await this.api.get('/get_all_form_details/{school_id}', {
        context: 'Loading all forms',
        cache: true,
        cacheTTL: 10 * 60 * 1000 // 10 minutes cache
      });

      return this.processAllFormsData(data);
    } catch (error) {
      console.log('Failed to load forms from API');
      return [];
    }
  }

  /**
   * Get available forms for the current school
   */
  async getAvailableForms() {
    try {
      const data = await this.api.get('/get_all_form_details/{school_id}', {
        context: 'Loading available forms',
        cache: true,
        cacheTTL: 5 * 60 * 1000 // 5 minutes cache
      });

      return data; // Return the data directly since it has the correct structure
    } catch (error) {
      console.log('Failed to load available forms:', error);
      return {};
    }
  }

  /**
   * Create a new form
   */
  async createForm(formData) {
    try {
      const result = await this.api.post('/form', {
        form_name: formData.name,
        form_type: formData.type,
        change_type: formData.changeType,
        school_id: this.api.schoolId,
        ...formData
      }, {
        context: 'Creating form'
      });

      // Clear form caches
      this.api.clearCache('form');
      this.api.clearCache('get_all_form_details');
      toast.success('Form created successfully');
      
      return result;
    } catch (error) {
      toast.error('Failed to create form');
      throw error;
    }
  }

  /**
   * Update form details
   */
  async updateForm(formId, updates) {
    try {
      const result = await this.api.put(`/form/${formId}`, {
        ...updates,
        school_id: this.api.schoolId
      }, {
        context: 'Updating form'
      });

      // Clear form caches
      this.api.clearCache('form');
      this.api.clearCache('get_all_form_details');
      toast.success('Form updated successfully');
      
      return result;
    } catch (error) {
      toast.error('Failed to update form');
      throw error;
    }
  }

  /**
   * Delete a form
   */
  async deleteForm(formId) {
    try {
      const result = await this.api.delete(`/form/${formId}`, {
        context: 'Deleting form'
      });

      // Clear form caches
      this.api.clearCache('form');
      this.api.clearCache('get_all_form_details');
      toast.success('Form deleted successfully');
      
      return result;
    } catch (error) {
      toast.error('Failed to delete form');
      throw error;
    }
  }

  /**
   * Get form submissions/completions
   */
  async getFormSubmissions(filters = {}) {
    try {
      const data = await this.api.get('/admission_child_personal/all_child_status/{school_id}', {
        context: 'Loading form submissions',
        params: filters,
        cache: true,
        cacheTTL: 2 * 60 * 1000 // 2 minutes cache
      });

      return this.processFormSubmissions(data);
    } catch (error) {
      console.log('Failed to load form submissions:', error);
      return [];
    }
  }

  /**
   * Get unique form types for dropdown
   */
  async getFormDropdownOptions() {
    try {
      const data = await this.api.get('/admission_child_personal/all_child_status/{school_id}', {
        context: 'Loading form dropdown options',
        cache: true,
        cacheTTL: 5 * 60 * 1000 // 5 minutes cache
      });

      return this.extractUniqueFormNames(data);
    } catch (error) {
      console.log('Failed to load form dropdown options:', error);
      return [];
    }
  }

  /**
   * Submit a form completion
   */
  async submitForm(formId, submissionData) {
    try {
      const result = await this.api.post('/form/submit', {
        form_id: formId,
        school_id: this.api.schoolId,
        ...submissionData
      }, {
        context: 'Submitting form'
      });

      // Clear submission caches
      this.api.clearCache('admission_child_personal/all_child_status');
      toast.success('Form submitted successfully');
      
      return result;
    } catch (error) {
      toast.error('Failed to submit form');
      throw error;
    }
  }

  /**
   * Process all forms data from the API
   */
  processAllFormsData(data) {
    if (!data || typeof data !== 'object') return [];

    const formsList = [];
    let idCounter = 1;

    Object.keys(data).forEach(status => {
      const changeType = status.charAt(0).toUpperCase() + status.slice(1);
      
      // Skip forms with changeType 'All'
      if (changeType === 'All') return;
      
      if (typeof data[status] === 'object' && data[status] !== null) {
        Object.keys(data[status]).forEach(formName => {
          formsList.push({
            id: idCounter++,
            formName: this.formatFormName(formName),
            originalName: formName,
            changeType: changeType,
            status: status
          });
        });
      }
    });

    return formsList;
  }

  /**
   * Process available forms data
   */
  processAvailableFormsData(data) {
    if (!Array.isArray(data)) return [];

    const formsList = [];
    data.forEach(item => {
      if (item.form_name && item.form_id) {
        formsList.push({
          id: item.form_id,
          name: this.formatFormName(item.form_name),
          originalName: item.form_name,
          ...item
        });
      }
    });

    return formsList;
  }

  /**
   * Process form submissions data
   */
  processFormSubmissions(data) {
    if (!Array.isArray(data)) return [];

    const submissionsList = [];
    data.forEach(item => {
      const formsList = [];
      if (item.forms && Object.keys(item.forms).length > 0) {
        Object.values(item.forms).forEach(formName => {
          formsList.push(this.formatFormName(formName));
        });
      }

      submissionsList.push({
        id: item.child_id,
        childId: item.child_id,
        childName: item.child_first_name || 'No name',
        className: item.class_name || 'Unassigned',
        parentEmail: item.primary_email || 'No email provided',
        forms: formsList,
        rawForms: item.forms,
        ...item
      });
    });

    return submissionsList;
  }

  /**
   * Extract unique form names for dropdowns
   */
  extractUniqueFormNames(data) {
    if (!Array.isArray(data)) return [];

    const formsSet = new Set();
    data.forEach(item => {
      if (item.forms && Object.keys(item.forms).length > 0) {
        Object.values(item.forms).forEach(formName => {
          formsSet.add(this.formatFormName(formName));
        });
      }
    });

    return Array.from(formsSet).sort();
  }

  /**
   * Format form names consistently
   */
  formatFormName(formName) {
    return formName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Search and filter forms
   */
  filterForms(forms, searchTerm = '', typeFilter = 'All') {
    let filtered = [...forms];

    // Text search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(form =>
        form.formName?.toLowerCase().includes(term) ||
        form.name?.toLowerCase().includes(term) ||
        form.changeType?.toLowerCase().includes(term)
      );
    }

    // Type filter
    if (typeFilter !== 'All') {
      filtered = filtered.filter(form => 
        form.changeType === typeFilter || form.type === typeFilter
      );
    }

    return filtered;
  }

  /**
   * Get form statistics
   */
  getFormStats(submissions) {
    if (!Array.isArray(submissions)) return {};

    const totalSubmissions = submissions.length;
    const completedForms = submissions.reduce((sum, submission) => sum + (submission.forms?.length || 0), 0);
    const avgFormsPerStudent = totalSubmissions > 0 ? (completedForms / totalSubmissions).toFixed(1) : 0;

    const formCounts = {};
    submissions.forEach(submission => {
      submission.forms?.forEach(formName => {
        formCounts[formName] = (formCounts[formName] || 0) + 1;
      });
    });

    return {
      totalSubmissions,
      completedForms,
      avgFormsPerStudent,
      formCounts,
      mostPopularForm: Object.keys(formCounts).reduce((a, b) => formCounts[a] > formCounts[b] ? a : b, '')
    };
  }
}

export default FormService;