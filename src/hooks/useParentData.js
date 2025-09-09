// Single hook for all parent dashboard data management
// Makes ONE API call and handles all child switching via state updates
import { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { api_base_url, school_id } from '@/utils/const';
import { getAuthHeaders } from '@/utils/auth';
import { toast } from 'sonner';

// Simplified form status calculator for FormSidebar
const calculateFormStatus = (formData, completedForms) => {
  const isValidValue = (value) => {
    return value !== undefined && value !== null && value !== '' && value !== false;
  };

  // Enhanced form completion checks (matching FormStatusLogic validation)
  const enrollment = {
    completed: completedForms.some(f => f.formname === 'enrollment_agreement')
  };
  
  const authorization = {
    completed: completedForms.some(f => f.formname === 'authorization_form')
  };
  
  const parentHandbook = {
    completed: completedForms.some(f => f.formname === 'parent_handbook')
  };
  
  const admission = {
    completed: completedForms.some(f => f.formname === 'admission_form')
  };

  // ENHANCED: Comprehensive enrollment validation (all 21 fields)
  const enrollmentFields = [
    'point_one_field_three', 'point_two_initial_here', 'point_three_initial_here',
    'point_four_initial_here', 'point_five_initial_here', 'point_six_initial_here',
    'point_seven_initial_here', 'point_eight_initial_here', 'point_nine_initial_here',
    'point_ten_initial_here', 'point_eleven_initial_here', 'point_twelve_initial_here',
    'point_thirteen_initial_here', 'point_fourteen_initial_here', 'point_fifteen_initial_here',
    'point_sixteen_initial_here', 'point_seventeen_initial_here', 'point_eighteen_initial_here',
    'point_ninteen_initial_here', 'preferred_start_date', 'preferred_schedule'
  ];

  // Check if enrollment fields are in formData.enrollment_form or root formData
  const enrollmentFromSubForm = formData.enrollment_form && 
    enrollmentFields.every(field => isValidValue(formData.enrollment_form[field]));
  const enrollmentFromRoot = formData &&
    enrollmentFields.every(field => isValidValue(formData[field]));
  const enrollmentComplete = enrollmentFromSubForm || enrollmentFromRoot;
  
  // Individual enrollment item validation
  const enrollmentParentSignComplete = formData && (
    isValidValue(formData.parent_sign_enroll) || 
    isValidValue(formData.enrollment_form?.parent_sign_enroll)
  );
  const enrollmentAdminSignComplete = formData && (
    (isValidValue(formData.admin_sign_enroll) && isValidValue(formData.admin_sign_date_enroll)) ||
    (isValidValue(formData.enrollment_form?.admin_sign_enroll) && isValidValue(formData.enrollment_form?.admin_sign_date_enroll))
  );
  
  // Overall enrollment complete only when ALL 3 items complete
  const enrollmentFullyComplete = enrollmentComplete && enrollmentParentSignComplete && enrollmentAdminSignComplete;
  
  // ENHANCED: Comprehensive authorization validation  
  const authorizationFields = ['bank_routing', 'bank_account', 'driver_license', 'state'];
  // FIX: Authorization fields are in root formData, not formData.authorization_form
  const authorizationACHComplete = formData &&
    authorizationFields.every(field => isValidValue(formData[field]));
  
  // Individual authorization item validation
  const authorizationParentSignComplete = formData && isValidValue(formData.parent_sign_ach);
  const authorizationAdminSignComplete = formData && 
    isValidValue(formData.admin_sign_ach) && isValidValue(formData.admin_sign_date_ach);
  
  // Overall authorization complete only when ALL 3 items complete
  const authorizationFullyComplete = authorizationACHComplete && authorizationParentSignComplete && authorizationAdminSignComplete;
  
  // COMPREHENSIVE AUTHORIZATION DEBUG - What I'm checking behind the scenes:
  console.log('🔍 ========================= AUTHORIZATION VALIDATION DEBUG =========================');
  console.log('📋 WHAT I AM CHECKING FOR AUTHORIZATION TICK MARK:');
  console.log('   1. Does formData exist? (from API)');
  console.log('   2. Are these 4 ACH fields filled in root formData: bank_routing, bank_account, driver_license, state');
  console.log('   3. Each field must not be: undefined, null, empty string, or false');
  console.log('   4. OR is it marked complete in completedForms array from database');
  console.log('');
  
  // Check if completedForms has authorization marked as complete
  console.log('📊 STEP 1: Check completedForms array (from database):');
  console.log('   completedForms array:', completedForms);
  console.log('   Has authorization_form in completedForms?', authorization.completed);
  console.log('');
  
  // Check form data
  console.log('📊 STEP 2: Check form data structure:');
  console.log('   formData exists?', !!formData);
  
  if (formData) {
    console.log('');
    console.log('📊 STEP 3: Validate each required ACH field (in root formData):');
    console.log('   Required fields for tick mark:', authorizationFields);
    
    authorizationFields.forEach(field => {
      const value = formData[field];
      const valid = isValidValue(value);
      
      console.log(`   🔍 ${field}:`);
      console.log(`      Raw value: "${value}"`);
      console.log(`      Value type: ${typeof value}`);
      console.log(`      Is undefined? ${value === undefined}`);
      console.log(`      Is null? ${value === null}`);  
      console.log(`      Is empty string? ${value === ''}`);
      console.log(`      Is false? ${value === false}`);
      console.log(`      ✅ PASSES isValidValue check? ${valid}`);
      console.log('');
    });
    
    console.log('📊 STEP 4: Individual item validation results:');
    console.log('   📋 Authorization ACH complete?', authorizationACHComplete);
    console.log('   ✍️ Parent Signature complete?', authorizationParentSignComplete);
    console.log('   👨‍💼 Admin Signature complete?', authorizationAdminSignComplete);
    console.log('   🎯 ALL authorization items complete?', authorizationFullyComplete);
    console.log('');
    console.log('📊 STEP 5: Section vs Item tick marks:');
    console.log('   🔹 Authorization ACH item tick:', authorizationACHComplete ? '✅ YES' : '❌ NO');
    console.log('   🔹 Parent Signature item tick:', authorizationParentSignComplete ? '✅ YES' : '❌ NO');
    console.log('   🔹 Admin Signature item tick:', authorizationAdminSignComplete ? '✅ YES' : '❌ NO');
    console.log('   🔹 Authorization SECTION tick:', authorization.completed || authorizationFullyComplete ? '✅ YES' : '❌ NO');
    
  } else {
    console.log('❌ formData does NOT exist - no form data from API');
    console.log('   🎯 FINAL TICK MARK WILL SHOW: Only if completedForms has it -', authorization.completed ? '✅ YES' : '❌ NO');
  }
  
  console.log('🔍 ========================= AUTHORIZATION DEBUG END ===========================');
  
  // COMPREHENSIVE ENROLLMENT DEBUG
  console.log('🔍 ========================= ENROLLMENT VALIDATION DEBUG =========================');
  console.log('📋 WHAT I AM CHECKING FOR ENROLLMENT TICK MARKS:');
  console.log('   1. Agreement: All 21 enrollment fields filled (point_one_field_three to preferred_schedule)');
  console.log('   2. Parent Signature: parent_sign_enroll has value');
  console.log('   3. Admin Signature: admin_sign_enroll AND admin_sign_date_enroll have values');
  console.log('');
  
  // Check enrollment structure
  console.log('📊 STEP 1: Check enrollment data structure:');
  console.log('   formData.enrollment_form exists?', !!formData.enrollment_form);
  console.log('   Checking fields in both root formData and formData.enrollment_form');
  console.log('');
  
  if (formData) {
    console.log('📊 STEP 2: Validate enrollment agreement fields:');
    console.log('   Required fields:', enrollmentFields.length, 'fields');
    
    // Check a few key fields to see where they are stored
    const sampleFields = ['point_one_field_three', 'preferred_start_date', 'preferred_schedule'];
    sampleFields.forEach(field => {
      const rootValue = formData[field];
      const subFormValue = formData.enrollment_form?.[field];
      console.log(`   🔍 ${field}:`);
      console.log(`      In root formData: "${rootValue}" -> ${isValidValue(rootValue) ? '✅ VALID' : '❌ INVALID'}`);
      console.log(`      In enrollment_form: "${subFormValue}" -> ${isValidValue(subFormValue) ? '✅ VALID' : '❌ INVALID'}`);
    });
    
    console.log('');
    console.log('📊 STEP 3: Individual enrollment item validation:');
    console.log('   📋 Agreement (21 fields) complete?', enrollmentComplete);
    console.log('   ✍️ Parent Signature complete?', enrollmentParentSignComplete);
    console.log('   👨‍💼 Admin Signature complete?', enrollmentAdminSignComplete);
    console.log('   🎯 ALL enrollment items complete?', enrollmentFullyComplete);
    
    console.log('');
    console.log('📊 STEP 4: Signature field details:');
    console.log('   parent_sign_enroll (root):', formData.parent_sign_enroll);
    console.log('   parent_sign_enroll (sub):', formData.enrollment_form?.parent_sign_enroll);
    console.log('   admin_sign_enroll (root):', formData.admin_sign_enroll);
    console.log('   admin_sign_date_enroll (root):', formData.admin_sign_date_enroll);
    
    console.log('');
    console.log('📊 STEP 5: Enrollment tick marks:');
    console.log('   🔹 Agreement item tick:', enrollmentComplete ? '✅ YES' : '❌ NO');
    console.log('   🔹 Parent Signature item tick:', enrollmentParentSignComplete ? '✅ YES' : '❌ NO');
    console.log('   🔹 Admin Signature item tick:', enrollmentAdminSignComplete ? '✅ YES' : '❌ NO');
    console.log('   🔹 Enrollment SECTION tick:', enrollment.completed || enrollmentFullyComplete ? '✅ YES' : '❌ NO');
  }
  
  console.log('🔍 ========================= ENROLLMENT DEBUG END ===========================');
  
  // ENHANCED: Comprehensive parent handbook validation
  const handbookRequiredFields = ['welcome_goddard_agreement', 'mission_statement_agreement'];
  const handbookSignatureFields = ['parent_sign_handbook', 'admin_sign_handbook', 'admin_sign_date_handbook'];
  
  // Check both root formData and formData.parent_handbook
  const handbookPolicyFromRoot = formData &&
    handbookRequiredFields.every(field => formData[field] === 'on');
  const handbookPolicyFromSub = formData.parent_handbook && 
    handbookRequiredFields.every(field => formData.parent_handbook[field] === 'on');
  const handbookPolicyComplete = handbookPolicyFromRoot || handbookPolicyFromSub;
    
  const handbookParentSignComplete = formData && (
    isValidValue(formData.parent_sign_handbook) ||
    isValidValue(formData.parent_handbook?.parent_sign_handbook)
  );
    
  const handbookAdminSignComplete = formData && (
    (isValidValue(formData.admin_sign_handbook) && isValidValue(formData.admin_sign_date_handbook)) ||
    (isValidValue(formData.parent_handbook?.admin_sign_handbook) && isValidValue(formData.parent_handbook?.admin_sign_date_handbook))
  );
    
  // Complete parent handbook requires: policy agreements + parent signature + admin signature
  const handbookFullyComplete = handbookPolicyComplete && handbookParentSignComplete && handbookAdminSignComplete;
  
  // COMPREHENSIVE PARENT HANDBOOK DEBUG
  console.log('🔍 ========================= PARENT HANDBOOK VALIDATION DEBUG =========================');
  console.log('📋 WHAT I AM CHECKING FOR PARENT HANDBOOK TICK MARKS:');
  console.log('   1. Policy: welcome_goddard_agreement AND mission_statement_agreement = "on"');
  console.log('   2. Parent Signature: parent_sign_handbook has value');
  console.log('   3. Admin Signature: admin_sign_handbook AND admin_sign_date_handbook have values');
  console.log('');
  
  if (formData) {
    console.log('📊 STEP 1: Check parent handbook data structure:');
    console.log('   formData.parent_handbook exists?', !!formData.parent_handbook);
    console.log('   Checking fields in both root formData and formData.parent_handbook');
    console.log('');
    
    console.log('📊 STEP 2: Validate policy agreement fields:');
    handbookRequiredFields.forEach(field => {
      const rootValue = formData[field];
      const subValue = formData.parent_handbook?.[field];
      console.log(`   🔍 ${field}:`);
      console.log(`      In root formData: "${rootValue}" -> ${rootValue === 'on' ? '✅ VALID' : '❌ INVALID (must be "on")'}`);
      console.log(`      In parent_handbook: "${subValue}" -> ${subValue === 'on' ? '✅ VALID' : '❌ INVALID (must be "on")'}`);
    });
    
    console.log('');
    console.log('📊 STEP 3: Signature field details:');
    console.log('   parent_sign_handbook (root):', formData.parent_sign_handbook);
    console.log('   parent_sign_handbook (sub):', formData.parent_handbook?.parent_sign_handbook);
    console.log('   admin_sign_handbook (root):', formData.admin_sign_handbook);
    console.log('   admin_sign_date_handbook (root):', formData.admin_sign_date_handbook);
    console.log('   admin_sign_handbook (sub):', formData.parent_handbook?.admin_sign_handbook);
    console.log('   admin_sign_date_handbook (sub):', formData.parent_handbook?.admin_sign_date_handbook);
    
    console.log('');
    console.log('📊 STEP 4: Individual parent handbook item validation:');
    console.log('   📋 Policy Complete?', handbookPolicyComplete);
    console.log('   ✍️ Parent Signature Complete?', handbookParentSignComplete);
    console.log('   👨‍💼 Admin Signature Complete?', handbookAdminSignComplete);
    console.log('   🎯 ALL handbook items complete?', handbookFullyComplete);
    
    console.log('');
    console.log('📊 STEP 5: Parent Handbook tick marks:');
    console.log('   🔹 Policy item tick:', handbookPolicyComplete ? '✅ YES' : '❌ NO');
    console.log('   🔹 Parent Signature item tick:', handbookParentSignComplete ? '✅ YES' : '❌ NO');
    console.log('   🔹 Admin Signature item tick:', handbookAdminSignComplete ? '✅ YES' : '❌ NO');
    console.log('   🔹 Parent Handbook SECTION tick:', parentHandbook.completed || handbookFullyComplete ? '✅ YES' : '❌ NO');
  }
  
  console.log('🔍 ========================= PARENT HANDBOOK DEBUG END ===========================');
  
  // ENHANCED: Comprehensive admission validation
  // Check both root formData and formData.admission_form for admission fields
  
  // 1. Child Information - basic child details
  const admissionChildInfo = formData && (
    isValidValue(formData.nick_name) || isValidValue(formData.admission_form?.nick_name)
  ) && (
    isValidValue(formData.dob) || isValidValue(formData.admission_form?.dob)
  ) && (
    isValidValue(formData.primary_language) || isValidValue(formData.admission_form?.primary_language)
  );
  
  // 2. Child and Family History - medical/family background
  const admissionChildFamilyHistory = formData && (
    isValidValue(formData.physical_exam_last_date) || isValidValue(formData.admission_form?.physical_exam_last_date)
  );
  
  // 3. Immunization - immunization records
  const admissionImmunization = formData && (
    (formData.do_you_agree_this_immunization_instructions === 'on') ||
    (formData.admission_form?.do_you_agree_this_immunization_instructions === 'on')
  );
  
  // 4. Child Profile - interests, activities, etc.
  const admissionChildProfile = formData && (
    isValidValue(formData.important_fam_members) || isValidValue(formData.admission_form?.important_fam_members)
  ) && (
    isValidValue(formData.drop_off_time) || isValidValue(formData.admission_form?.drop_off_time)
  ) && (
    isValidValue(formData.pick_up_time) || isValidValue(formData.admission_form?.pick_up_time)
  );
  
  // 5. Pick-up Password
  const admissionPickupPassword = formData && (
    isValidValue(formData.child_password_pick_up_password_form) || isValidValue(formData.admission_form?.child_password_pick_up_password_form)
  );
  
  // 6. Photo/Video Permission
  const admissionPhotoPermission = formData && (
    (formData.do_you_agree_this_photo_video_permission_form === 'on') ||
    (formData.admission_form?.do_you_agree_this_photo_video_permission_form === 'on')
  );
  
  // 7. Security & Policy
  const admissionSecurity = formData && (
    isValidValue(formData.security_release_policy_form) || isValidValue(formData.admission_form?.security_release_policy_form)
  );
  
  // 8. Medical Transportation
  const admissionMedicalTransportation = formData && (
    isValidValue(formData.medical_transportation_waiver) || isValidValue(formData.admission_form?.medical_transportation_waiver)
  );
  
  // 9. Health Policies
  const admissionHealthPolicies = formData && (
    (formData.do_you_agree_this_health_policies === 'on') ||
    (formData.admission_form?.do_you_agree_this_health_policies === 'on')
  );
  
  // 10. Outside Engagements
  const admissionOutsideEngagements = formData && (
    isValidValue(formData.parent_sign_outside_waiver) || isValidValue(formData.admission_form?.parent_sign_outside_waiver)
  );
  
  // 11. Social Media Approval
  const admissionSocialMedia = formData && (
    (formData.do_you_agree_this_social_media_post === 'on') ||
    (formData.admission_form?.do_you_agree_this_social_media_post === 'on')
  );
  
  // 12. Parent Signature
  const admissionParentSignature = formData && (
    isValidValue(formData.parent_sign_admission) || isValidValue(formData.admission_form?.parent_sign_admission)
  );
  
  // 13. Admin Signature
  const admissionAdminSignature = formData && (
    (isValidValue(formData.admin_sign_admission) && isValidValue(formData.admin_sign_date_admission)) ||
    (isValidValue(formData.admission_form?.admin_sign_admission) && isValidValue(formData.admission_form?.admin_sign_date_admission))
  );
  
  // Overall admission complete only when ALL 13 items complete
  const admissionFullyComplete = admissionChildInfo && admissionChildFamilyHistory && admissionImmunization && 
    admissionChildProfile && admissionPickupPassword && admissionPhotoPermission && admissionSecurity && 
    admissionMedicalTransportation && admissionHealthPolicies && admissionOutsideEngagements && 
    admissionSocialMedia && admissionParentSignature && admissionAdminSignature;

  // COMPREHENSIVE ADMISSION DEBUG
  console.log('🔍 ========================= ADMISSION VALIDATION DEBUG =========================');
  console.log('📋 ADMISSION FORM HAS 13 ITEMS TO CHECK:');
  console.log('');
  
  if (formData) {
    console.log('📊 STEP 1: Check admission data structure:');
    console.log('   formData.admission_form exists?', !!formData.admission_form);
    console.log('   Checking fields in both root formData and formData.admission_form');
    console.log('');
    
    console.log('📊 STEP 2: Individual admission item validation:');
    const admissionItems = [
      {name: 'Child Information', value: admissionChildInfo, key: 'admission_childinformation'},
      {name: 'Child and Family History', value: admissionChildFamilyHistory, key: 'admission_childandfamilyhistory'},
      {name: 'Immunization', value: admissionImmunization, key: 'admission_immunization'},
      {name: 'Child Profile', value: admissionChildProfile, key: 'admission_child_profile'},
      {name: 'Pick-up Password', value: admissionPickupPassword, key: 'admission_childpickup_password'},
      {name: 'Photo/Video Permission', value: admissionPhotoPermission, key: 'admission_photo_permission'},
      {name: 'Security & Policy', value: admissionSecurity, key: 'admission_security'},
      {name: 'Medical Transportation', value: admissionMedicalTransportation, key: 'admission_medical_transportation'},
      {name: 'Health Policies', value: admissionHealthPolicies, key: 'admission_health_policies'},
      {name: 'Outside Engagements', value: admissionOutsideEngagements, key: 'admission_outside_engagements'},
      {name: 'Social Media Approval', value: admissionSocialMedia, key: 'admission_social_media'},
      {name: 'Parent Signature', value: admissionParentSignature, key: 'admission_parentsignature'},
      {name: 'Admin Signature', value: admissionAdminSignature, key: 'admission_adminsignature'}
    ];
    
    admissionItems.forEach(item => {
      console.log(`   🔹 ${item.name} (${item.key}): ${item.value ? '✅ YES' : '❌ NO'}`);
    });
    
    console.log('');
    console.log('📊 STEP 3: Overall admission validation:');
    console.log('   🎯 ALL admission items complete?', admissionFullyComplete);
    console.log('   🔹 Admission SECTION tick:', admission.completed || admissionFullyComplete ? '✅ YES' : '❌ NO');
    
    const completedCount = admissionItems.filter(item => item.value).length;
    console.log(`   📊 Items completed: ${completedCount}/13`);
  }
  
  console.log('🔍 ========================= ADMISSION DEBUG END ===========================');


  return {
    enrollment: {
      completed: enrollment.completed || enrollmentFullyComplete
    },
    authorization: {
      completed: authorization.completed || authorizationFullyComplete
    },
    parentHandbook: {
      completed: parentHandbook.completed || handbookFullyComplete
    },
    admission: {
      completed: admission.completed || admissionFullyComplete
    },
    
    // Individual item keys that FormItem component expects
    authorization_ach: { 
      completed: authorization.completed || authorizationACHComplete 
    },
    authorization_signature: { 
      completed: authorization.completed || authorizationParentSignComplete 
    },
    authorization_admin_signature: { 
      completed: authorization.completed || authorizationAdminSignComplete 
    },
    
    // Individual enrollment item keys
    enrollment_agreement: { 
      completed: enrollment.completed || enrollmentComplete 
    },
    enrollment_parent_signature: { 
      completed: enrollment.completed || enrollmentParentSignComplete 
    },
    enrollment_admin_signature: { 
      completed: enrollment.completed || enrollmentAdminSignComplete 
    },
    
    // Individual parent handbook item keys
    parenthandbook_policy: { 
      completed: parentHandbook.completed || handbookPolicyComplete 
    },
    parenthandbook_signature: { 
      completed: parentHandbook.completed || handbookParentSignComplete 
    },
    parenthandbook_admin_signature: { 
      completed: parentHandbook.completed || handbookAdminSignComplete 
    },
    
    // Individual admission item keys
    admission_childinformation: { 
      completed: admission.completed || admissionChildInfo 
    },
    admission_childandfamilyhistory: { 
      completed: admission.completed || admissionChildFamilyHistory 
    },
    admission_immunization: { 
      completed: admission.completed || admissionImmunization 
    },
    admission_child_profile: { 
      completed: admission.completed || admissionChildProfile 
    },
    admission_childpickup_password: { 
      completed: admission.completed || admissionPickupPassword 
    },
    admission_photo_permission: { 
      completed: admission.completed || admissionPhotoPermission 
    },
    admission_security: { 
      completed: admission.completed || admissionSecurity 
    },
    admission_medical_transportation: { 
      completed: admission.completed || admissionMedicalTransportation 
    },
    admission_health_policies: { 
      completed: admission.completed || admissionHealthPolicies 
    },
    admission_outside_engagements: { 
      completed: admission.completed || admissionOutsideEngagements 
    },
    admission_social_media: { 
      completed: admission.completed || admissionSocialMedia 
    },
    admission_parentsignature: { 
      completed: admission.completed || admissionParentSignature 
    },
    admission_adminsignature: { 
      completed: admission.completed || admissionAdminSignature 
    }
  };
};

export const useParentData = (email) => {
  const { getAccessTokenSilently } = useAuth0();
  
  const [state, setState] = useState({
    loading: true,
    error: null,
    parentName: '',
    children: [],
    activeChildId: null
  });

  // Single API call to get ALL data - no more API calls needed!
  const fetchData = useCallback(async () => {
    if (!email) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Email is required' 
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const headers = await getAuthHeaders(getAccessTokenSilently);
      const startTime = performance.now();
      
      const response = await fetch(
        `${api_base_url}/admission_child_personal/parent_email/${school_id}/${email}`,
        { headers }
      );
      
      const loadTime = performance.now() - startTime;
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No children found for this parent');
      }

      // Transform API data for frontend use
      const transformedChildren = data.map(child => {
        const completedForms = child.CompletedFormStatus || [];
        const incompleteForms = child.InCompletedFormStatus || [];
        const formData = child.child_information || {};
        
        // Calculate basic form status for FormSidebar (simplified version)
        const formStatus = calculateFormStatus(formData, completedForms);
        
        return {
          id: child.child_id,
          firstName: child.child_first_name,
          lastName: child.child_last_name,
          completedForms,
          incompleteForms,
          formData,
          formStatus, // Add calculated form status
          stats: {
            total: 4, // admission, authorization, handbook, enrollment
            completed: completedForms.length,
            incomplete: incompleteForms.length,
            progress: Math.round((completedForms.length / 4) * 100)
          }
        };
      });

      // Set active child from session storage or first child
      const sessionChildId = sessionStorage.getItem('putcallId');
      const activeChildId = sessionChildId ? 
        parseInt(sessionChildId) : 
        transformedChildren[0]?.id;

      setState({
        loading: false,
        error: null,
        parentName: data[0]?.parent_name || '',
        children: transformedChildren,
        activeChildId: activeChildId
      });

      // Update localStorage for compatibility
      if (data[0]?.parent_name) {
        localStorage.setItem('parent_name', data[0].parent_name);
      }
      localStorage.setItem('number_of_children', transformedChildren.length.toString());
      
      
    } catch (error) {
      console.error('❌ Data loading failed:', error);
      
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Failed to load dashboard data' 
      }));

      // Show user-friendly error message
      if (error.message.includes('Network')) {
        toast.error('Network connection failed. Please check your internet connection.');
      } else if (error.message.includes('500')) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error('Failed to load dashboard data. Please refresh the page.');
      }
    }
  }, [email, getAccessTokenSilently]);

  // Load data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Child switching - pure state update (NO API calls!)
  const switchChild = useCallback((childId) => {
    const child = state.children.find(c => c.id === childId);
    if (!child) {
      console.error(`❌ Child with ID ${childId} not found`);
      toast.error('Child not found');
      return;
    }

    console.log(`🔄 Switching to child: ${child.firstName} (${childId}) - NO API call!`);
    const startTime = performance.now();

    setState(prev => ({ ...prev, activeChildId: childId }));

    const switchTime = performance.now() - startTime;
    console.log(`⚡ Child switch completed in ${switchTime.toFixed(2)}ms`);

    // Update storage for compatibility
    localStorage.setItem('child_name', child.firstName);
    localStorage.setItem('child_id', childId.toString());
    sessionStorage.setItem('putcallId', childId.toString());

    // Show success message
    toast.success(`Selected child: ${child.firstName}`, {
      duration: 2000
    });
  }, [state.children]);

  // Refresh data after form submission
  const refresh = useCallback(() => {
    console.log('🔄 Refreshing parent data after form submission...');
    fetchData();
  }, [fetchData]);

  // Get welcome message - updated to use Auth0 email parameter
  const getWelcomeMessage = useCallback(() => {
    // REMOVED: localStorage dependency - using email parameter instead
    if (email === 'goddard01arjava@gmail.com') {
      return 'Welcome Admin';
    }
    return `Welcome ${state.parentName}`;
  }, [state.parentName, email]);

  // Computed values
  const activeChild = state.children.find(c => c.id === state.activeChildId);
  const hasMultipleChildren = state.children.length > 1;
  const hasData = !state.loading && !state.error && state.children.length > 0;

  return {
    // Core state
    loading: state.loading,
    error: state.error,
    parentName: state.parentName,
    children: state.children,
    activeChildId: state.activeChildId,
    
    // Active child data
    activeChild,
    completedForms: activeChild?.completedForms || [],
    incompleteForms: activeChild?.incompleteForms || [],
    formData: activeChild?.formData || {},
    formStatus: activeChild?.formStatus || {},
    
    // Actions
    switchChild,
    refresh,
    
    // Computed values
    getWelcomeMessage,
    hasMultipleChildren,
    hasData,
    
    // Overall stats
    overallStats: hasData ? {
      totalForms: state.children.length * 4,
      completedForms: state.children.reduce((sum, child) => sum + child.stats.completed, 0),
      progress: Math.round((state.children.reduce((sum, child) => sum + child.stats.completed, 0) / (state.children.length * 4)) * 100)
    } : null
  };
};