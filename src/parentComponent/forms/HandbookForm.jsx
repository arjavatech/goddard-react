import React, { useState, useEffect } from 'react';
import FormInput from '../../FormInput';
import FormLabel from '../../FormLabel';

const HandbookForm = ({ formData, childId, editID, onAlert }) => {
  const [formState, setFormState] = useState({
    welcome_goddard_agreement: false,
    mission_statement_agreement: false,
    general_information_agreement: false,
    medical_care_provider_agreement: false,
    parent_access_agreement: false,
    release_of_children_agreement: false,
    registration_fees_agreement: false,
    outside_engagements_agreement: false,
    health_policies_agreement: false,
    medication_procedures_agreement: false,
    bring_to_school_agreement: false,
    rest_time_agreement: false,
    training_philosophy_agreement: false,
    affiliation_policy_agreement: false,
    security_issue_agreement: false,
    expulsion_policy_agreement: false,
    addressing_individual_child_agreement: false,
    finalword_agreement: false,
    parent_sign_handbook: '',
    parent_sign_date_handbook: ''
  });

  useEffect(() => {
    if (formData) {
      const updatedState = { ...formState };
      Object.keys(formState).forEach(key => {
        if (formData[key] !== undefined) {
          if (typeof formState[key] === 'boolean') {
            updatedState[key] = formData[key] === 'on';
          } else {
            updatedState[key] = formData[key];
          }
        }
      });
      setFormState(updatedState);
    }
  }, [formData]);

  const handleCheckboxChange = (field, checked) => {
    setFormState(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  const handleInputChange = (field, value) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (pointer = 29) => {
    try {
      const outputObject = {
        primary_parent_email: editID || localStorage.getItem('logged_in_email'),
        child_id: childId,
        pointer,
        form_year_handbook: new Date().getFullYear().toString(),
        admin_sign_date_handbook: formState.admin_sign_date_handbook ? 
          new Date(formState.admin_sign_date_handbook).getTime() : 
          new Date().getTime(),
        ...formState
      };

      // Convert boolean values to 'on' or '' for backend compatibility
      Object.keys(outputObject).forEach(key => {
        if (typeof outputObject[key] === 'boolean') {
          outputObject[key] = outputObject[key] ? 'on' : '';
        }
      });

      const apiResponse = await fetch(
        `https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/parent_handbook/update/${childId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(outputObject)
        }
      );

      if (apiResponse.ok) {
        onAlert('success', 'Parent handbook form saved successfully!');
        setTimeout(() => {
          sessionStorage.setItem('putcallId', childId);
          window.location.href = `./parent_dashboard.html?id=${editID}`;
        }, 3000);
      } else {
        onAlert('error', 'Failed to save parent handbook form!');
      }
    } catch (error) {
      // console.error('Error submitting handbook form:', error);
      onAlert('error', 'Failed to save parent handbook form!');
    }
  };

  const handbookSections = [
    { key: 'welcome_goddard_agreement', title: 'Welcome to Goddard' },
    { key: 'mission_statement_agreement', title: 'Mission Statement' },
    { key: 'general_information_agreement', title: 'General Information' },
    { key: 'medical_care_provider_agreement', title: 'Medical Care Provider' },
    { key: 'parent_access_agreement', title: 'Parent Access' },
    { key: 'release_of_children_agreement', title: 'Release of Children' },
    { key: 'registration_fees_agreement', title: 'Registration Fees' },
    { key: 'outside_engagements_agreement', title: 'Outside Engagements' },
    { key: 'health_policies_agreement', title: 'Health Policies' },
    { key: 'medication_procedures_agreement', title: 'Medication Procedures' },
    { key: 'bring_to_school_agreement', title: 'Items to Bring to School' },
    { key: 'rest_time_agreement', title: 'Rest Time' },
    { key: 'training_philosophy_agreement', title: 'Training Philosophy' },
    { key: 'affiliation_policy_agreement', title: 'Affiliation Policy' },
    { key: 'security_issue_agreement', title: 'Security Issues' },
    { key: 'expulsion_policy_agreement', title: 'Expulsion Policy' },
    { key: 'addressing_individual_child_agreement', title: 'Addressing Individual Child Needs' },
    { key: 'finalword_agreement', title: 'Final Word' }
  ];

  return (
    <div className="p-6">
      <h3 className="text-2xl font-bold text-[#0F2D52] mb-6">Parent Handbook Agreement</h3>
      
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        {/* Handbook Sections */}
        <div className="bg-gray-50 p-4 rounded mb-6">
          <h4 className="text-lg font-semibold mb-4 text-[#0F2D52]">Handbook Sections</h4>
          <p className="text-sm text-gray-600 mb-4">
            Please check each section to indicate that you have read and agree to the policies:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {handbookSections.map((section) => (
              <div key={section.key} className="flex items-center">
                <input
                  type="checkbox"
                  id={section.key}
                  name={section.key}
                  checked={formState[section.key]}
                  onChange={(e) => handleCheckboxChange(section.key, e.target.checked)}
                  className="mr-3 h-4 w-4 text-[#0F2D52] focus:ring-[#0F2D52] border-gray-300 rounded"
                />
                <label htmlFor={section.key} className="text-sm font-medium text-gray-700">
                  {section.title}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Signature Section */}
        <div className="bg-gray-50 p-4 rounded mb-6">
          <h4 className="text-lg font-semibold mb-4 text-[#0F2D52]">Parent Signature</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormLabel htmlFor="parent_sign_handbook" required>Parent Signature</FormLabel>
              <FormInput
                id="parent_sign_handbook"
                name="parent_sign_handbook"
                value={formState.parent_sign_handbook}
                onChange={(e) => handleInputChange('parent_sign_handbook', e.target.value)}
                required
              />
            </div>
            
            <div>
              <FormLabel htmlFor="parent_sign_date_handbook" required>Date</FormLabel>
              <FormInput
                id="parent_sign_date_handbook"
                name="parent_sign_date_handbook"
                type="date"
                value={formState.parent_sign_date_handbook || new Date().toISOString().split('T')[0]}
                onChange={(e) => handleInputChange('parent_sign_date_handbook', e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Agreement Summary */}
        <div className="bg-blue-50 p-4 rounded mb-6">
          <h4 className="text-lg font-semibold mb-2 text-[#0F2D52]">Agreement Summary</h4>
          <p className="text-sm text-gray-700">
            By signing this form, I acknowledge that I have read, understood, and agree to comply with all 
            policies and procedures outlined in the Parent Handbook. I understand that these policies are 
            subject to change and that I will be notified of any updates.
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-[#0F2D52] text-white rounded hover:opacity-80"
          >
            Save & Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default HandbookForm;