// Centralized API endpoint definitions
import { school_id } from '@/utils/const';

export const ENDPOINTS = {
  // Parent & Child Data - Primary endpoint for dashboard
  PARENT_DASHBOARD_DATA: (email) => 
    `/admission_child_personal/parent_email/${school_id}/${email}`,
  
  // Legacy endpoints (for backward compatibility during migration)
  PARENT_BY_EMAIL: (email) => 
    `/admission_child_personal/parent_email/${school_id}/${email}`,
  
  CHILD_FORM_DETAILS: (childId) => 
    `/child_all_form_details/${school_id}/${childId}`,
  
  COMPLETED_FORMS_BY_YEAR: (childId, year) => 
    `/admission_child_personal/completed_form_status_year/${school_id}/${childId}/${year}`,
  
  // Form Operations
  FORM_SAVE: (childId) => 
    `/child_all_form_details/${school_id}/${childId}`,
  
  FORM_SUBMIT_COMPLETION: (childId) => 
    `/admission_child_personal/completed_form_status/${school_id}/${childId}`,
  
  // Specific Form Endpoints (legacy)
  AUTHORIZATION_FORM: (childId) => 
    `/authorization_form/${school_id}/${childId}`,
  
  ENROLLMENT_FORM: (childId) => 
    `/enrollment_form/${school_id}/${childId}`,
  
  ADMISSION_SEGMENT: (childId) => 
    `/admission_segment/${school_id}/${childId}`,
  
  // File Operations
  S3_FILE: (schoolName, childId, fileType, print = false) => 
    `/get-s3-file/${schoolName}/${childId}/${fileType}/${print}`,
  
  // Admin endpoints (if needed)
  ADMIN_DASHBOARD: () => '/admin/dashboard',
  
  // Health check
  HEALTH_CHECK: () => '/health'
};

// Form type mappings
export const FORM_TYPES = {
  ADMISSION: 'admission_form',
  AUTHORIZATION: 'authorization_form',
  PARENT_HANDBOOK: 'parent_handbook',
  ENROLLMENT: 'enrollment_form',
  ENROLLMENT_AGREEMENT: 'enrollment_agreement'
};

// File type mappings for S3 operations
export const FILE_TYPES = {
  [FORM_TYPES.ADMISSION]: 'admission_form',
  [FORM_TYPES.AUTHORIZATION]: 'authorization_form',
  [FORM_TYPES.PARENT_HANDBOOK]: 'parent_handbook',
  [FORM_TYPES.ENROLLMENT]: 'enrollment_agreement',
  [FORM_TYPES.ENROLLMENT_AGREEMENT]: 'enrollment_agreement'
};

// Default school name for S3 operations
export const DEFAULT_SCHOOL_NAME = 'lynnwood';