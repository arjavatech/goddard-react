import { useState, useEffect } from 'react';
import { formSections } from './formSections';

const useFormStatus = (activeChildId) => {
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

  useEffect(() => {
    if (!activeChildId) return;
    
    const fetchFormStatus = async () => {
      const year = new Date().getFullYear();
      setLoading(true);
      
      try {
        
        // Fetch incomplete form status (like HTML version)
        const incompleteResponse = await fetch(
          `https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/admission_child_personal/incomplete_form_status/${activeChildId}`
        );
        const completedResponse = await fetch(
          `https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/admission_child_personal/completed_form_status_year/${activeChildId}/${year}`
        );
        const formData = await fetch(
          `https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/child_all_form_details/fetch/${activeChildId}`
        );

        if (!incompleteResponse.ok || !completedResponse.ok || !formData.ok) {
          throw new Error('Failed to fetch form data');
        }

        const incompleteResult = await incompleteResponse.json();
        const result = await completedResponse.json();
        const formDetails = await formData.json();

        // Get incomplete forms from API (like HTML version)
        const incompleteFormsList = [];
        if (incompleteResult?.InCompletedFormStatus) {
          for (let value of Object.values(incompleteResult.InCompletedFormStatus)) {
            incompleteFormsList.push(value.replace(/\s+/g, "_").toLowerCase());
          }
        }
        // Determine form completion status based on API data AND detailed validation
        const updatedStatus = {
          // Main form sections - use detailed validation for accuracy
          enrollment: { completed: isEnrollmentComplete },
          authorization: { completed: isAuthorizationComplete },
          parentHandbook: { completed: isPolicyComplete && isHandbookParentSign },
          admission: { completed: isAllAdmissionFormComplete },
        };

        // Add detailed form validation (keeping existing logic for sub-items)
        const isEnrollmentComplete =
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
          formDetails.preferred_schedule;

        const isAuthorizationACHComplete =
          formDetails.bank_routing &&
          formDetails.bank_account &&
          formDetails.driver_license &&
          formDetails.state &&
          formDetails.i;

        const isParentSignComplete =
          formDetails.parent_sign_date_ach;

        const isAuthorizationComplete =
          isAuthorizationACHComplete && isParentSignComplete;

        const isEnrollmentParentSign = formDetails.parent_sign_enroll;

        const isPolicyComplete =
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
          formDetails.finalword_agreement === "on";

        const isHandbookParentSign =
          formDetails.parent_sign_handbook &&
          formDetails.parent_sign_date_handbook;


        const childbasicInfo = formDetails.child_first_name &&
        formDetails.child_last_name &&
        formDetails.nick_name &&
        formDetails.dob &&
        formDetails.primary_language &&
        formDetails.school_age_child_school &&
        formDetails.gender;

      const childparentInfo = formDetails.primary_parent_info?.parent_name &&
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
        formDetails.primary_parent_info?.parent_email;

      const additionalChildparentInfo = formDetails.additional_parent_info?.parent_name &&
        formDetails.additional_parent_info?.parent_street_address &&
        formDetails.additional_parent_info?.parent_city_address &&
        formDetails.additional_parent_info?.parent_state_address &&
        formDetails.additional_parent_info?.parent_zip_address &&
        formDetails.additional_parent_info?.parent_home_telephone_number &&
        formDetails.additional_parent_info?.parent_business_name &&
        formDetails.additional_parent_info?.parent_work_hours_from &&
        formDetails.additional_parent_info?.parent_work_hours_to &&
        formDetails.additional_parent_info?.parent_business_telephone_number &&
        formDetails.additional_parent_info?.parent_business_cell_number &&
        formDetails.additional_parent_info?.parent_email;

      const childMedicalcare = formDetails.child_care_provider_info?.child_care_provider_name &&
        formDetails.child_care_provider_info?.child_care_provider_telephone_number &&
        formDetails.child_care_provider_info?.child_hospital_affiliation &&
        formDetails.child_care_provider_info?.child_care_provider_street_address &&
        formDetails.child_care_provider_info?.child_care_provider_city_address &&
        formDetails.child_care_provider_info?.child_care_provider_state_address &&
        formDetails.child_care_provider_info?.child_care_provider_zip_address &&
        formDetails.child_dentist_name &&
        formDetails.dentist_telephone_number &&
        formDetails.dentist_street_address &&
        formDetails.dentist_city_address &&
        formDetails.dentist_state_address &&
        formDetails.dentist_zip_address &&
        formDetails.special_diabilities &&
        formDetails.allergies_medication_reaction &&
        formDetails.additional_info &&
        formDetails.medication &&
        formDetails.health_insurance &&
        formDetails.policy_number;

      const childEmergencyContact = formDetails.emergency_contact_info?.every(contact =>
        contact.child_emergency_contact_name &&
        contact.child_emergency_contact_relationship &&
        contact.child_emergency_contact_telephone_number &&
        contact.child_emergency_contact_full_address &&
        contact.child_emergency_contact_city_address &&
        contact.child_emergency_contact_state_address &&
        contact.child_emergency_contact_zip_address
      );

      const childParentAgreementOne = formDetails.obtaining_emergency_medical_care &&
        formDetails.administration_first_aid_procedures &&
        formDetails.agree_all_above_information_is_correct 

      const isChildInfoComplete = childbasicInfo && childparentInfo && additionalChildparentInfo && childMedicalcare && childEmergencyContact && childParentAgreementOne;

      const childHistory = formDetails.physical_exam_last_date && formDetails.dental_exam_last_date;

      const medicalHistory = formDetails.allergies &&
        formDetails.asthma &&
        formDetails.bleeding_problems &&
        formDetails.diabetes &&
        formDetails.epilepsy &&
        formDetails.frequent_ear_infections &&
        formDetails.hearing_problems &&
        formDetails.hospitalization &&
        formDetails.rheumatic_fever &&
        formDetails.seizures_convulsions &&
        formDetails.serious_injuries_accidents &&
        formDetails.surgeries &&
        formDetails.vision_problems &&
        formDetails.medical_other;

      const pregnancyHistory = formDetails.illness_during_pregnancy &&
        formDetails.condition_of_newborn &&
        formDetails.duration_of_pregnancy &&
        formDetails.birth_weight_lbs &&
        formDetails.birth_weight_oz &&
        formDetails.complications &&
        formDetails.bottle_fed &&
        formDetails.breast_fed &&
        formDetails.other_siblings_name &&
        formDetails.other_siblings_age;

      const familyHistroy = formDetails.family_history_allergies ||
        formDetails.family_history_heart_problems ||
        formDetails.family_history_tuberculosis ||
        formDetails.family_history_asthma ||
        formDetails.family_history_high_blood_pressure ||
        formDetails.family_history_vision_problems ||
        formDetails.family_history_diabetes ||
        formDetails.family_history_hyperactivity ||
        formDetails.family_history_epilepsy ||
        formDetails.no_illnesses_for_this_child;

      const socialBehavior = formDetails.age_group_friends &&
        formDetails.neighborhood_friends &&
        formDetails.relationship_with_mother &&
        formDetails.relationship_with_father &&
        formDetails.relationship_with_siblings &&
        formDetails.relationship_with_extended_family &&
        formDetails.fears_conflicts &&
        formDetails.child_response_frustration &&
        formDetails.favorite_activities;

      const environmentalFactor = formDetails.last_five_years_moved &&
        formDetails.things_used_at_home &&
        formDetails.hours_of_television_daily &&
        formDetails.language_used_at_home &&
        formDetails.changes_at_home_situation &&
        formDetails.educational_expectations_of_child;

      const parentAgreementTwo = formDetails.agree_all_above_info_is_correct;

      const isChildFamilyHistoryComplete = childHistory && medicalHistory && pregnancyHistory && familyHistroy && socialBehavior && environmentalFactor && parentAgreementTwo;
      const immunizationComplete = formDetails.do_you_agree_this_immunization_instructions == "on"
      const isChildprofileComplete = formDetails.important_fam_members &&
      formDetails.about_family_celebrations &&
      formDetails.childcare_before &&
      formDetails.reason_for_childcare_before &&
      formDetails.what_child_interests &&
      formDetails.drop_off_time &&
      formDetails.pick_up_time

      const nutrisionDetailsComplete = formDetails.restricted_diet &&
      formDetails.eat_own &&
      formDetails.favorite_foods

      const restDetailsComplete = formDetails.rest_in_the_middle_day &&
      formDetails.rest_routine &&
      formDetails.toilet_trained

      const medicalDetails =  formDetails.existing_illness_allergy &&
      formDetails.explain_for_existing_illness_allergy &&
      formDetails.functioning_at_age &&
      formDetails.explain_for_functioning_at_age &&
      formDetails.able_to_walk &&
      formDetails.explain_for_able_to_walk &&
      formDetails.communicate_their_needs &&
      formDetails.explain_for_communicate_their_needs &&
      formDetails.any_medication &&
      formDetails.explain_for_any_medication &&
      formDetails.utilize_special_equipment &&
      formDetails.explain_for_utilize_special_equipment &&
      formDetails.significant_periods &&
      formDetails.explain_for_significant_periods &&
      formDetails.desire_any_accommodations &&
      formDetails.explain_for_desire_any_accommodations &&
      formDetails.additional_information

      const parentAgreementThreeComplete =formDetails.do_you_agree_this;

      const allChildProfileComplete = isChildprofileComplete && nutrisionDetailsComplete && restDetailsComplete && 
      medicalDetails && parentAgreementThreeComplete;

      const isChildPickupPasswordComplete =  formDetails.child_password_pick_up_password_form &&
      formDetails.do_you_agree_this_pick_up_password_form

      const isPhotoPermissioncomplete=  formDetails.photo_usage_photo_video_permission_form &&
      formDetails.photo_permission_agree_group_photos_electronic == "on" &&
      formDetails.do_you_agree_this_photo_video_permission_form == "on"

      const isChildSecurityComplete = formDetails.security_release_policy_form

      const childMedicalwaiver =  formDetails.med_technicians_med_transportation_waiver &&
      formDetails.medical_transportation_waiver

      const childHealthPolicies = formDetails.do_you_agree_this_health_policies
      
      const isChildOutsideEngagementsComplete = formDetails.parent_sign_outside_waiver
      const isSocialMedia =   formDetails.approve_social_media_post &&
      formDetails.printed_name_social_media_post &&
      formDetails.do_you_agree_this_social_media_post

      const isAdmissionParentSign =  formDetails.parent_sign_admission &&
      formDetails.parent_sign_date_admission

      const childParentInfo = formDetails.primary_parent_info.parent_name &&
      formDetails.primary_parent_info.parent_street_address &&
      formDetails.primary_parent_info.parent_city_address &&
      formDetails.primary_parent_info.parent_state_address &&
      formDetails.primary_parent_info.parent_zip_address &&
      formDetails.primary_parent_info.parent_home_telephone_number &&
      formDetails.primary_parent_info.parent_business_name &&
      formDetails.primary_parent_info.parent_work_hours_from &&
      formDetails.primary_parent_info.parent_work_hours_to &&
      formDetails.primary_parent_info.parent_business_telephone_number &&
      formDetails.primary_parent_info.parent_business_cell_number &&
      formDetails.primary_parent_info.parent_email

      const isAllAdmissionFormComplete = childbasicInfo && childParentInfo && additionalChildparentInfo
      && childMedicalcare && childEmergencyContact && childParentAgreementOne && isChildFamilyHistoryComplete && 
      immunizationComplete && allChildProfileComplete && isChildPickupPasswordComplete && isPhotoPermissioncomplete &&
      isChildSecurityComplete && childMedicalwaiver && childHealthPolicies && isChildOutsideEngagementsComplete &&
      isSocialMedia && isAdmissionParentSign


      

        const data = result?.CompletedFormStatus || [];
        
        // Add detailed form status to the existing updatedStatus object
        updatedStatus["authorization_ach"] = { completed: isAuthorizationACHComplete };
        updatedStatus["authorization_signature"] = { completed: isParentSignComplete };
        updatedStatus["enrollment_signature"] = { completed: isEnrollmentParentSign };
        updatedStatus["parenthandbook_policy"] = { completed: isPolicyComplete };
        updatedStatus["parenthandbook_signature"] = { completed: isHandbookParentSign };
        updatedStatus["admission_childinformation"] = { completed: isChildInfoComplete };
        updatedStatus["admission_childandfamilyhistory"] = { completed: isChildFamilyHistoryComplete };
        updatedStatus["admission_immunization"] = { completed: immunizationComplete };
        updatedStatus["admission_child_profile"] = { completed: allChildProfileComplete };
        updatedStatus["admission_childpickup_password"] = { completed: isChildPickupPasswordComplete };
        updatedStatus["admission_photo_permission"] = { completed: isPhotoPermissioncomplete };
        updatedStatus["admission_security"] = { completed: isChildSecurityComplete };
        updatedStatus["admission_medical_transportation"] = { completed: childMedicalwaiver };
        updatedStatus["admission_health_policies"] = { completed: childHealthPolicies };
        updatedStatus["admission_outside_engagements"] = { completed: isChildOutsideEngagementsComplete };
        updatedStatus["admission_social_media"] = { completed: isSocialMedia };
        updatedStatus["admission_parentsignature"] = { completed: isAdmissionParentSign };
        updatedStatus["admmission"] = { completed: isAllAdmissionFormComplete };

        data.forEach((entry) => {
          if (entry.formname && !updatedStatus[entry.formname]) {
            updatedStatus[entry.formname] = { completed: true };
          }
        });

        setFormStatus(updatedStatus);
      } catch (error) {
        setFormStatus({});
      } finally {
        setLoading(false);
      }
    };

    fetchFormStatus();
  }, [activeChildId]);

  return { formStatus, handleToggle, openSection, toggleCompleted, loading };
};

export default useFormStatus;