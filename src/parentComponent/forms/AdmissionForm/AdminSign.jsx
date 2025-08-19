import React, { useState, useEffect } from 'react';
import FormInput from '../../../components/FormInput';
import FormLabel from '../../../components/FormLabel';

const adminSign = ({ initialFormData = null, formData, childId, editID, onAlert }) => {
  const [formState, setFormState] = useState({
    admin_sign_admission: initialFormData.admin_sign_admission ?? '',
    admin_sign_date_admission: initialFormData.admin_sign_date_admission ?? '',
  });

  useEffect(() => {
    if (formData) {
      setFormState(prevState => ({
        ...prevState,
        ...formData
      }));
    }
  }, [formData]);

  const handleInputChange = (field, value) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };

    const updateAdmissionData = async (fieldData) => {
    if (!childId) {
      console.error('Child ID is required for API update');
      return;
    }

    try {
      const response = await fetch(`https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/admission_segment/${childId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fieldData)
      });

      if (!response.ok) {
        throw new Error(`Failed to update Admission data: ${response.status}`);
      }

      const result = await response.json();
      console.log('Admission data updated successfully:', result);
      return result;
    } catch (error) {
      console.error('Error updating Admission data:', error);
      throw error;
    }
  };

  const handleSubmit = async (type) => {
    
    if (type === 'admin') {
      if (!childId) {
      alert('Error: Child ID is missing');
      return;
    }

    try {
      if(formState.admin_sign_admission == null || formState.admin_sign_admission == '')
      {
        alert('Error: Parent Sign is missing');
        return;
      }
      const epochValue = new Date(formState.admin_sign_date_admission).getTime();

      // Prepare the complete form data for API call including child_id
      // Create a copy to avoid mutating the original initialFormData
      let saveData = { ...initialFormData ,
        child_id: childId,
        important_fam_members: initialFormData.important_fam_members || '',
        about_family_celebrations: initialFormData.about_family_celebrations || '',
        what_child_interests: initialFormData.what_child_interests || '',
        drop_off_time: initialFormData.drop_off_time || '',
        pick_up_time: initialFormData.pick_up_time || '',
        hasExistingCondition: initialFormData.existing_illness_allergy === 1 ? 'Yes' : (initialFormData.existing_illness_allergy === 2 ? 'No' : ''),
        existingConditionExplanation: initialFormData.explain_for_existing_illness_allergy || '',
        functioningAtAge: initialFormData.functioning_at_age === 1 ? 'Yes' : (initialFormData.functioning_at_age === 2 ? 'No' : ''),
        functioningAtAgeExplanation: initialFormData.explain_for_functioning_at_age || '',
        canWalk: initialFormData.able_to_walk === 1 ? 'Yes' : (initialFormData.able_to_walk === 2 ? 'No' : ''),
        canWalkExplanation: initialFormData.explain_for_able_to_walk || '',
        canCommunicate: initialFormData.communicate_their_needs === 1 ? 'Yes' : (initialFormData.communicate_their_needs === 2 ? 'No' : ''),
        canCommunicateExplanation: initialFormData.explain_for_communicate_their_needs || '',
        needsTreatment: initialFormData.any_medication === 1 ? 'Yes' : (initialFormData.any_medication === 2 ? 'No' : ''),
        treatmentExplanation: initialFormData.explain_for_any_medication || '',
        usesEquipment: initialFormData.utilize_special_equipment === 1 ? 'Yes' : (initialFormData.utilize_special_equipment === 2 ? 'No' : ''),
        equipmentExplanation: initialFormData.explain_for_utilize_special_equipment || '',
        needsSupervision: initialFormData.significant_periods === 1 ? 'Yes' : (initialFormData.significant_periods === 2 ? 'No' : ''),
        supervisionExplanation: initialFormData.explain_for_significant_periods || '',
        needsAccommodation: initialFormData.desire_any_accommodations === 1 ? 'Yes' : (initialFormData.desire_any_accommodations === 2 ? 'No' : ''),
        accommodationExplanation: initialFormData.explain_for_desire_any_accommodations || '',
        comments: initialFormData.additional_information || '',
        hasSpecialDiet: initialFormData.restricted_diet === 1 ? 'Yes' : (initialFormData.restricted_diet === 2 ? 'No' : ''),
        specialDietExplanation: initialFormData.restricted_diet_reason || '',
        eatsOnOwn: initialFormData.eat_own === 1 ? 'Yes' : (initialFormData.eat_own === 2 ? 'No' : ''),
        eatsOnOwnExplanation: initialFormData.eat_own_reason || '',
        favoriteFoods: initialFormData.favorite_foods || '',
        agreementConfirmed: initialFormData.do_you_agree_this === 'on' ? true : false,
        restsInMiddleOfDay: initialFormData.rest_in_the_middle_day === 1 ? 'Yes' : (initialFormData.rest_in_the_middle_day === 2 ? 'No' : ''),
        restExplanation: initialFormData.reason_for_rest_in_the_middle_day || '',
        napRoutine: initialFormData.rest_routine || '',
        isToiletTrained: initialFormData.toilet_trained === 1 ? 'Yes' : (initialFormData.toilet_trained === 2 ? 'No' : ''),
        toiletTrainedExplanation: initialFormData.reason_for_toilet_trained || '',
        child_first_name: initialFormData.child_first_name,
        child_last_name: initialFormData.child_last_name,
        nick_name: initialFormData.nick_name,
        dob: initialFormData.dob,
        primary_language: initialFormData.primary_language,
        school_age_child_school: initialFormData.school_age_child_school,
        gender: initialFormData.gender,
        primary_parent_info: initialFormData.primary_parent_info,
        additional_parent_info: initialFormData.additional_parent_info,
        emergency_contact_info: initialFormData.emergency_contact_info,
        child_care_provider_info: initialFormData.child_care_provider_info
        
      };


      // Convert values to proper types for API expectations
      Object.keys(saveData).forEach(key => {
        if (saveData[key] === null || saveData[key] === undefined) {
          saveData[key] = '';
        } else if (Array.isArray(saveData[key])) {
          // Keep arrays as arrays - don't convert to string
          saveData[key] = saveData[key];
        } else if (typeof saveData[key] === 'object' && saveData[key] !== null) {
          // Keep objects as objects - don't convert to string
          saveData[key] = saveData[key];
        } else if (typeof saveData[key] === 'number') {
          // Convert numbers to strings for simple fields
          saveData[key] = String(saveData[key]);
        } else if (typeof saveData[key] === 'boolean') {
          // Convert booleans to strings
          saveData[key] = String(saveData[key]);
        }
        // Leave strings as strings
      });
      
      // Set the required fields
      saveData['child_id'] = childId;
      saveData['admin_sign_date_admission'] = epochValue;
      saveData['admin_sign_admission'] = formState.admin_sign_admission;


      // Call the API to save all form data
      await updateAdmissionData(saveData);
      
      // Show success alert
      alert('Admission form data saved successfully!');
    } catch (error) {
      console.error('Failed to save Admission form:', error);
      alert('Error saving Admission form data. Please try again.');
    }
  
  }
   
  };

  return (      
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        
        {/* Signature Section */}
        <div className="rounded">
          <h2 className="headerstyle text-center bg-[#0F2D52] text-white p-3 text-3xl rounded-t mb-6">Admin Signature</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormLabel htmlFor="admin_sign_admission" required>Admin Signature</FormLabel>
              <FormInput
                id="admin_sign_admission"
                name="admin_sign_admission"
                value={formState.admin_sign_admission}
                onChange={(e) => handleInputChange('admin_sign_admission', e.target.value)}
                required
              />
            </div>
            
            <div className="w-full md:w-1/2 px-3 mb-4">
            <div className="form-group">
              <label htmlFor="admin_sign_date_admission" className="block font-bold mb-2">Date</label>
              <input 
                type="datetime-local" 
                className="form-control border border-gray-300 rounded px-3 py-2 w-full" 
                id="admin_sign_date_admission"
                name="admin_sign_date_admission"
                value={formState.admin_sign_date_admission}
                onChange={(e) => handleInputChange('admin_sign_date_admission', e.target.value)}
              />
            </div>
          </div>
            
          </div>
        </div>

        <div className="text-center mb-4">
          <button 
            className="bg-[#0F2D52] text-white py-2 px-6 rounded hover:bg-opacity-90 transition-colors" 
            onClick={() => handleSubmit('admin')}
          >
            Submit
          </button>
        </div>

        
      </form>
  );
};

export default adminSign;