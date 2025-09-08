import { api_base_url, school_id } from '@/utils/const';
import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { getAuthHeaders } from '@/utils/auth';

const useFormStatus = (activeChildId, shouldFetch = true) => {
  const { getAccessTokenSilently } = useAuth0();
  const [openSection, setOpenSection] = useState("enrollment");
  const [formStatus, setFormStatus] = useState({});
  const [loading, setLoading] = useState(false);

  const handleToggle = (key) => {
    setOpenSection((prev) => (prev === key ? null : key));
  };

  const toggleCompleted = () => {
    const completed = document.getElementById("completedFormDetails");
    if (completed) completed.classList.toggle("hidden");
  };

  const isValidValue = (value) => {
    return value !== undefined && value !== null && value !== '' && value !== false;
  };

  const validateSection = (formDetails, fields) => {
    return fields.every(field => isValidValue(formDetails[field]));
  };

  useEffect(() => {
    if (!activeChildId || !shouldFetch) {
      return;
    }

    const fetchFormStatus = async () => {
      setLoading(true);

      try {
        // Get parent email from URL params with priority over localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const urlEmail = urlParams.get('id');
        const localEmail = localStorage.getItem('logged_in_email');
        const parentEmail = urlEmail || localEmail;
        
        if (!parentEmail) {
          throw new Error('No parent email available');
        }
        
        
        const headers = await getAuthHeaders(getAccessTokenSilently);
        const response = await fetch(`${api_base_url}/admission_child_personal/parent_email/${school_id}/${parentEmail}`, {
          headers
        });

        if (!response.ok) {
          throw new Error('Failed to fetch form data');
        }

        const result = await response.json();
        
        // Find the specific child data
        const childData = result.find(child => child.child_id === activeChildId);
        if (!childData) {
          throw new Error('Child data not found');
        }
        
        const formDetails = childData.child_information;
        const completedResult = childData.CompletedFormStatus;
        const incompleteResult = childData.InCompletedFormStatus;
        const isEnrollmentComplete = [
          'point_one_field_three', 'point_two_initial_here', 'point_three_initial_here',
          'point_four_initial_here', 'point_five_initial_here', 'point_six_initial_here',
          'point_seven_initial_here', 'point_eight_initial_here', 'point_nine_initial_here',
          'point_ten_initial_here', 'point_eleven_initial_here', 'point_twelve_initial_here',
          'point_thirteen_initial_here', 'point_fourteen_initial_here', 'point_fifteen_initial_here',
          'point_sixteen_initial_here', 'point_seventeen_initial_here', 'point_eighteen_initial_here',
          'point_ninteen_initial_here', 'preferred_start_date', 'preferred_schedule'
        ].every(field => isValidValue(formDetails.enrollment_form?.[field]));

        const isAuthorizationACHComplete = [
          'bank_routing', 'bank_account', 'driver_license', 'state'
        ].every(field => isValidValue(formDetails.authorization_form?.[field]));
        const isAdminEnrollComplete = isValidValue(formDetails.enrollment_form?.admin_sign_date_enroll)
        const isParentSignComplete = isValidValue(formDetails.authorization_form?.parent_sign_ach);
        const isAdminSignComplete = isValidValue(formDetails.authorization_form?.admin_sign_ach) && isValidValue(formDetails.authorization_form?.admin_sign_date_ach);
        const isAuthorizationComplete = isAuthorizationACHComplete && isParentSignComplete && isAdminSignComplete;
        const isEnrollmentParentSign = isValidValue(formDetails.enrollment_form?.parent_sign_enroll);

        const policyFields = [
          'welcome_goddard_agreement', 'mission_statement_agreement'
        ];

        const isPolicyComplete = policyFields.every(field => formDetails.parent_handbook?.[field] === "on");
        const isHandbookParentSign = isValidValue(formDetails.parent_handbook?.parent_sign_handbook);
        const isHandbookAdminSign = isValidValue(formDetails.parent_handbook?.admin_sign_handbook) && isValidValue(formDetails.parent_handbook?.admin_sign_date_handbook);
        const childBasicFields = [
          'nick_name', 'dob', 'primary_language'
        ];

        const isChildBasicInfoComplete = childBasicFields.every(field => isValidValue(formDetails.admission_form?.[field])) &&
          isValidValue(formDetails.child_first_name) && isValidValue(formDetails.child_last_name);

        const validateParentInfo = (parent) => [
          'parent_name', 'parent_street_address', 'parent_city_address',
          'parent_state_address', 'parent_zip_address', 'parent_home_telephone_number',
          'parent_business_name', 'parent_work_hours_from', 'parent_work_hours_to',
          'parent_business_telephone_number', 'parent_business_cell_number', 'parent_email'
        ].every(field => isValidValue(parent?.[field]));

        const isPrimaryParentComplete = validateParentInfo(formDetails.primary_parent_info);
        const isAdditionalParentComplete = formDetails.additional_parent_info ? validateParentInfo(formDetails.additional_parent_info) : true;

        const medicalFields = [
          'allergies', 'medication', 'additional_info', 'health_insurance', 'policy_number'
        ];
        const isMedicalComplete = validateSection(formDetails.admission_form, medicalFields);

        const isEmergencyContactsValid = formDetails.emergency_contact_info?.every(contact => [
          'child_emergency_contact_name', 'child_emergency_contact_relationship',
          'child_emergency_contact_telephone_number', 'child_emergency_contact_full_address',
          'child_emergency_contact_city_address', 'child_emergency_contact_state_address',
          'child_emergency_contact_zip_address'
        ].every(field => isValidValue(contact?.[field])));

        const isParentAgreeAdmission = formDetails.admission_form?.parent_sign_admission;
        const isAdminAgreeAdmission = formDetails.admission_form?.admin_sign_admission;

        // Admission form validation
        const childbasicInfo = isChildBasicInfoComplete;
        const childparentInfo = validateParentInfo(formDetails.primary_parent_info);
        const additionalChildparentInfo = formDetails.additional_parent_info ? validateParentInfo(formDetails.additional_parent_info) : true;
        const childMedicalcare = isMedicalComplete;
        const childEmergencyContact = isEmergencyContactsValid || true;
        
        const isChildParentAgreementOneComplete = [
          'obtaining_emergency_medical_care',
          'administration_first_aid_procedures',
          'agree_all_above_information_is_correct'
        ].every(field => isValidValue(formDetails.admission_form?.[field]));
        const isChildInfoComplete = childbasicInfo && childparentInfo && additionalChildparentInfo && childMedicalcare && childEmergencyContact && isChildParentAgreementOneComplete;

        const childHistory =
          isValidValue(formDetails.admission_form?.physical_exam_last_date) &&
          isValidValue(formDetails.admission_form?.dental_exam_last_date);


        const medicalHistoryFields = [
          'allergies', 'asthma', 'bleeding_problems', 'diabetes', 'epilepsy',
          'frequent_ear_infections', 'hearing_problems', 'hospitalization',
          'rheumatic_fever', 'seizures_convulsions', 'serious_injuries_accidents',
          'surgeries', 'vision_problems', 'medical_other'
        ];

        const medicalHistory = medicalHistoryFields.every(field => isValidValue(formDetails.admission_form?.[field]));
        const pregnancyHistoryFields = [
          'illness_during_pregnancy', 'condition_of_newborn', 'duration_of_pregnancy',
          'birth_weight_lbs', 'birth_weight_oz', 'complications', 'bottle_fed',
          'breast_fed', 'other_siblings_name', 'other_siblings_age'
        ];

        const pregnancyHistory = pregnancyHistoryFields.every(field => isValidValue(formDetails.admission_form?.[field]));
        const familyHistoryFields = [
          'family_history_allergies',
          'family_history_heart_problems',
          'family_history_tuberculosis',
          'family_history_asthma',
          'family_history_high_blood_pressure',
          'family_history_vision_problems',
          'family_history_diabetes',
          'family_history_hyperactivity',
          'family_history_epilepsy',
          'no_illnesses_for_this_child'
        ];

        const familyHistory = familyHistoryFields.some(field => isValidValue(formDetails.admission_form?.[field]));

        const socialBehaviorFields = [
          'age_group_friends',
          'neighborhood_friends',
          'relationship_with_mother',
          'relationship_with_father',
          'relationship_with_siblings',
          'relationship_with_extended_family',
          'fears_conflicts',
          'child_response_frustration',
          'favorite_activities'
        ];

        const socialBehavior = socialBehaviorFields.every(field => isValidValue(formDetails.admission_form?.[field]));
        const environmentalFactorFields = [
          'last_five_years_moved',
          'things_used_at_home',
          'hours_of_television_daily',
          'language_used_at_home',
          'changes_at_home_situation',
          'educational_expectations_of_child'
        ];

        const environmentalFactor = environmentalFactorFields.every(field => isValidValue(formDetails.admission_form?.[field]));
        const parentAgreementTwo = isValidValue(formDetails.admission_form?.agree_all_above_info_is_correct);
        const isChildFamilyHistoryComplete = childHistory && medicalHistory && pregnancyHistory && familyHistory && socialBehavior && environmentalFactor && parentAgreementTwo;

        const immunizationComplete = formDetails.admission_form?.do_you_agree_this_immunization_instructions == "on"


        const isChildprofileComplete = [
          'important_fam_members',
          'about_family_celebrations',
          'childcare_before',
          'reason_for_childcare_before',
          'what_child_interests',
          'drop_off_time',
          'pick_up_time'
        ].every(field => {
          const isValid = isValidValue(formDetails.admission_form?.[field]);
          return isValid;
        })


        const nutritionDetailsComplete = [
          'restricted_diet',
          'eat_own',
          'favorite_foods'
        ].every(field => isValidValue(formDetails.admission_form?.[field]));

        const restDetailsComplete = [
          'rest_in_the_middle_day',
          'rest_routine',
          'toilet_trained'
        ].every(field => isValidValue(formDetails.admission_form?.[field]));

        const medicalDetailsComplete = [
          'existing_illness_allergy',
          'explain_for_existing_illness_allergy',
          'functioning_at_age',
          'explain_for_functioning_at_age',
          'able_to_walk',
          'explain_for_able_to_walk',
          'communicate_their_needs',
          'explain_for_communicate_their_needs',
          'any_medication',
          'explain_for_any_medication',
          'utilize_special_equipment',
          'explain_for_utilize_special_equipment',
          'significant_periods',
          'explain_for_significant_periods',
          'desire_any_accommodations',
          'explain_for_desire_any_accommodations',
          'additional_information'
        ].every(field => isValidValue(formDetails.admission_form?.[field]));

        const parentAgreementThreeComplete = isValidValue(formDetails.admission_form?.do_you_agree_this);
        const allChildProfileComplete =
          isChildprofileComplete &&
          nutritionDetailsComplete &&
          restDetailsComplete &&
          medicalDetailsComplete &&
          parentAgreementThreeComplete;

        const isChildPickupPasswordComplete =
          isValidValue(formDetails.admission_form?.child_password_pick_up_password_form) &&
          isValidValue(formDetails.admission_form?.do_you_agree_this_pick_up_password_form);

        const isPhotoPermissionComplete =
          isValidValue(formDetails.admission_form?.photo_usage_photo_video_permission_form) &&
          formDetails.admission_form?.photo_permission_agree_group_photos_electronic === "on" &&
          formDetails.admission_form?.do_you_agree_this_photo_video_permission_form === "on";

        const isChildSecurityComplete =
          isValidValue(formDetails.admission_form?.security_release_policy_form);

        const childMedicalWaiver =
          isValidValue(formDetails.admission_form?.med_technicians_med_transportation_waiver) &&
          isValidValue(formDetails.admission_form?.medical_transportation_waiver);

        const childHealthPolicies =
          isValidValue(formDetails.admission_form?.do_you_agree_this_health_policies);

        const isChildOutsideEngagementsComplete =
          isValidValue(formDetails.admission_form?.parent_sign_outside_waiver);

        const isSocialMedia =
          isValidValue(formDetails.admission_form?.approve_social_media_post) &&
          isValidValue(formDetails.admission_form?.printed_name_social_media_post) &&
          isValidValue(formDetails.admission_form?.do_you_agree_this_social_media_post);

        const isAdmissionParentSign =
          isValidValue(formDetails.admission_form?.parent_sign_admission) &&
          isValidValue(formDetails.admission_form?.parent_sign_date_admission);

        const isAllAdmissionFormComplete = isChildInfoComplete && isChildFamilyHistoryComplete &&
          immunizationComplete && allChildProfileComplete && isChildPickupPasswordComplete && isPhotoPermissionComplete &&
          isChildSecurityComplete && childMedicalWaiver && childHealthPolicies && isChildOutsideEngagementsComplete &&
          isSocialMedia && isAdmissionParentSign; // Simplified

        const updatedStatus = {
          enrollment: {
            completed: !!isEnrollmentComplete && !!isEnrollmentParentSign && !!isAdminEnrollComplete,
            parentSignature: !!isEnrollmentParentSign,
            adminSignature: !!isAdminEnrollComplete
          },
          authorization: {
            completed: !!isAuthorizationComplete,
            ach: !!isAuthorizationACHComplete,
            parentSignature: !!isParentSignComplete,
            adminSignature: !!isAdminSignComplete
          },
          parentHandbook: {
            completed: !!(isPolicyComplete && !!isHandbookParentSign && !!isHandbookAdminSign),
            policy: !!isPolicyComplete,
            adminSignature: !!isHandbookAdminSign,
            parentSignature: !!isHandbookParentSign
          },
          admission: {
            completed: !!isAllAdmissionFormComplete && !!isParentAgreeAdmission && !!isAdminAgreeAdmission,
            childInfo: !!isChildInfoComplete
          },
          enrollment_agreement: { completed: !!isEnrollmentComplete },
          enrollment_parent_signature: { completed: !!isEnrollmentParentSign },
          enrollment_admin_signature: { completed: !!isAdminEnrollComplete },
          authorization_ach: { completed: !!isAuthorizationACHComplete },
          authorization_signature: { completed: !!isParentSignComplete },
          authorization_admin_signature: { completed: !!isAdminSignComplete },
          enrollment_signature: { completed: !!isEnrollmentParentSign },

          parenthandbook_policy: { completed: !!isPolicyComplete },
          parenthandbook_signature: { completed: !!isHandbookParentSign },
          parenthandbook_admin_signature: { completed: !!isHandbookAdminSign },

          admission_childinformation: { completed: !!childbasicInfo },
          admission_childandfamilyhistory: { completed: !!isChildFamilyHistoryComplete },
          admission_immunization: { completed: !!immunizationComplete },
          admission_child_profile: { completed: !!allChildProfileComplete },
          admission_childpickup_password: { completed: !!isChildPickupPasswordComplete },
          admission_photo_permission: { completed: !!isPhotoPermissionComplete },
          admission_security: { completed: !!isChildSecurityComplete },
          admission_medical_transportation: { completed: !!childMedicalWaiver },
          admission_health_policies: { completed: !!childHealthPolicies },
          admission_outside_engagements: { completed: !!isChildOutsideEngagementsComplete },
          admission_social_media: { completed: !!isSocialMedia },
          admission_agreement: { completed: !!isAdmissionParentSign },
          admission_parentsignature: { completed: !!isParentAgreeAdmission },
          admission_adminsignature: { completed: !!isAdminAgreeAdmission }

        };

        const completedForms = completedResult || [];
        completedForms.forEach((entry) => {
          if (entry.formname && !updatedStatus[entry.formname]) {
            updatedStatus[entry.formname] = { completed: true };
          }
        });

        setFormStatus(updatedStatus);
      } catch (error) {
        console.error('Error fetching form status:', error);
        setFormStatus({});
      } finally {
        setLoading(false);
      }
    };

    fetchFormStatus();
  }, [activeChildId, shouldFetch]);

  return { formStatus, handleToggle, openSection, toggleCompleted, loading };
};

export default useFormStatus;