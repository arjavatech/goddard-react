// API service for form-related operations
const API_BASE_URL = 'https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test';

export const formService = {
  // Get parent and children data
  async getParentData(email) {
    const response = await fetch(`${API_BASE_URL}/admission_child_personal/parent_email/${email}`);
    if (!response.ok) {
      throw new Error('Failed to fetch parent data');
    }
    return response.json();
  },

  // Get completed forms for a specific child and year
  async getCompletedForms(childId, year) {
    const response = await fetch(`${API_BASE_URL}/admission_child_personal/completed_form_status_year/${childId}/${year}`);
    if (!response.ok) {
      throw new Error('Failed to fetch completed forms');
    }
    return response.json();
  },

  // Get detailed form data for a child
  async getFormDetails(childId) {
    const response = await fetch(`${API_BASE_URL}/child_all_form_details/fetch/${childId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch form details');
    }
    return response.json();
  },

  // Save form data
  async saveFormData(childId, formData, formType) {
    const response = await fetch(`${API_BASE_URL}/child_all_form_details/update/${childId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...formData,
        form_type: formType
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save form data');
    }
    return response.json();
  },

  // Submit completed form
  async submitCompletedForm(childId, formName) {
    const response = await fetch(`${API_BASE_URL}/admission_child_personal/completed_form_status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        child_id: childId,
        formname: formName,
        completedTimestamp: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to submit completed form');
    }
    return response.json();
  }
};

// Form completion validation logic
export const formValidation = {
  // Check enrollment agreement completion
  validateEnrollmentAgreement(formDetails) {
    return !!(
      formDetails.point_one_field_three &&
      formDetails.point_two_initial_here &&
      formDetails.point_three_initial_here &&
      formDetails.point_four_initial_here &&
      formDetails.point_five_initial_here &&
      formDetails.point_six_initial_here &&
      formDetails.point_seven_initial_here &&
      formDetails.point_eight_initial_here &&
      formDetails.point_nine_initial_here &&
      formDetails.point_ten_initial_here &&
      formDetails.point_eleven_initial_here &&
      formDetails.point_twelve_initial_here &&
      formDetails.point_thirteen_initial_here &&
      formDetails.point_fourteen_initial_here &&
      formDetails.point_fifteen_initial_here &&
      formDetails.point_sixteen_initial_here &&
      formDetails.point_seventeen_initial_here &&
      formDetails.point_eighteen_initial_here &&
      formDetails.point_ninteen_initial_here &&
      formDetails.preferred_start_date &&
      formDetails.preferred_schedule
    );
  },

  // Check authorization completion
  validateAuthorization(formDetails) {
    const achComplete = !!(
      formDetails.bank_routing &&
      formDetails.bank_account &&
      formDetails.driver_license &&
      formDetails.state &&
      formDetails.i
    );
    
    const signatureComplete = !!formDetails.parent_sign_date_ach;
    
    return {
      ach: achComplete,
      signature: signatureComplete,
      complete: achComplete && signatureComplete
    };
  },

  // Check parent handbook completion
  validateParentHandbook(formDetails) {
    const policyComplete = !!(
      formDetails.welcome_goddard_agreement === "on" &&
      formDetails.mission_statement_agreement === "on" &&
      formDetails.general_information_agreement === "on" &&
      formDetails.medical_care_provider_agreement === "on" &&
      formDetails.parent_access_agreement === "on" &&
      formDetails.release_of_children_agreement === "on" &&
      formDetails.registration_fees_agreement === "on" &&
      formDetails.outside_engagements_agreement === "on" &&
      formDetails.health_policies_agreement === "on" &&
      formDetails.medication_procedures_agreement === "on" &&
      formDetails.bring_to_school_agreement === "on" &&
      formDetails.rest_time_agreement === "on" &&
      formDetails.training_philosophy_agreement === "on" &&
      formDetails.affiliation_policy_agreement === "on" &&
      formDetails.security_issue_agreement === "on" &&
      formDetails.expulsion_policy_agreement === "on" &&
      formDetails.addressing_individual_child_agreement === "on" &&
      formDetails.finalword_agreement === "on"
    );

    const signatureComplete = !!(
      formDetails.parent_sign_handbook &&
      formDetails.parent_sign_date_handbook
    );

    return {
      policy: policyComplete,
      signature: signatureComplete,
      complete: policyComplete && signatureComplete
    };
  },

  // Check admission forms completion
  validateAdmissionForms(formDetails) {
    const childBasicInfo = !!(
      formDetails.child_first_name &&
      formDetails.child_last_name &&
      formDetails.nick_name &&
      formDetails.dob &&
      formDetails.primary_language &&
      formDetails.school_age_child_school &&
      formDetails.gender
    );

    const childParentInfo = !!(
      formDetails.primary_parent_info?.parent_name &&
      formDetails.primary_parent_info?.parent_street_address &&
      formDetails.primary_parent_info?.parent_city_address &&
      formDetails.primary_parent_info?.parent_state_address &&
      formDetails.primary_parent_info?.parent_zip_address &&
      formDetails.primary_parent_info?.parent_home_telephone_number &&
      formDetails.primary_parent_info?.parent_business_name &&
      formDetails.primary_parent_info?.parent_work_hours_from &&
      formDetails.primary_parent_info?.parent_work_hours_to &&
      formDetails.primary_parent_info?.parent_business_telephone_number &&
      formDetails.primary_parent_info?.parent_business_cell_number &&
      formDetails.primary_parent_info?.parent_email
    );

    const immunizationComplete = formDetails.do_you_agree_this_immunization_instructions === "on";
    const parentSignature = !!(formDetails.parent_sign_admission && formDetails.parent_sign_date_admission);

    return {
      childInfo: childBasicInfo && childParentInfo,
      immunization: immunizationComplete,
      signature: parentSignature,
      complete: childBasicInfo && childParentInfo && immunizationComplete && parentSignature
    };
  },

  // Get overall form status
  getFormStatus(formDetails) {
    const enrollment = this.validateEnrollmentAgreement(formDetails);
    const authorization = this.validateAuthorization(formDetails);
    const parentHandbook = this.validateParentHandbook(formDetails);
    const admission = this.validateAdmissionForms(formDetails);

    return {
      enrollment: { completed: enrollment },
      authorization: { completed: authorization.complete },
      "authorization_ach": { completed: authorization.ach },
      "authorization_signature": { completed: authorization.signature },
      "enrollment_signature": { completed: !!formDetails.parent_sign_enroll },
      parentHandbook: { completed: parentHandbook.complete },
      "parenthandbook_policy": { completed: parentHandbook.policy },
      "parenthandbook_signature": { completed: parentHandbook.signature },
      admission: { completed: admission.complete },
      "admission_childinformation": { completed: admission.childInfo },
      "admission_immunization": { completed: admission.immunization },
      "admission_parentsignature": { completed: admission.signature }
    };
  }
};
