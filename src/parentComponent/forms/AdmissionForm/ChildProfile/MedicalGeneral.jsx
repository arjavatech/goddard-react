import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { RadioGroup, FormInput } from './InputComponent';

const yesNoFields = [
  {
    label: 'Does your child have an existing illness/allergy/condition?',
    name: 'hasExistingCondition',
    explanation: 'existingConditionExplanation',
  },
  {
    label: 'Does your think your child is functioning at age-level?',
    name: 'functioningAtAge',
    explanation: 'functioningAtAgeExplanation',
  },
  {
    label: 'Is your child able to walk?',
    name: 'canWalk',
    explanation: 'canWalkExplanation',
  },
  {
    label: 'Is your child able to communicate their needs to others?',
    name: 'canCommunicate',
    explanation: 'canCommunicateExplanation',
  },
  {
    label: 'Does your child require any medication, therapy, treatment, or medical assessment (e.g., blood sugar monitoring)?',
    name: 'needsTreatment',
    explanation: 'treatmentExplanation',
  },
  {
    label: 'Does your child utilize any special equipment (e.g., wheelchair, hearing aid)?',
    name: 'usesEquipment',
    explanation: 'equipmentExplanation',
  },
  {
    label: 'Does your child require one-on-one supervision on a regular basis?',
    name: 'needsSupervision',
    explanation: 'supervisionExplanation',
  },
  {
    label: 'Does your child require or desire any accommodations to participate fully in group settings?',
    name: 'needsAccommodation',
    explanation: 'accommodationExplanation',
  },
];

const MedicalGeneral = ({ initialFormData = null, expandedSections, toggleSection, childId }) => {
  const [localFormData, setLocalFormData] = useState({
    hasExistingCondition: '',
    existingConditionExplanation: '',
    functioningAtAge: '',
    functioningAtAgeExplanation: '',
    canWalk: '',
    canWalkExplanation: '',
    canCommunicate: '',
    canCommunicateExplanation: '',
    needsTreatment: '',
    treatmentExplanation: '',
    usesEquipment: '',
    equipmentExplanation: '',
    needsSupervision: '',
    supervisionExplanation: '',
    needsAccommodation: '',
    accommodationExplanation: '',
    comments: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setLocalFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  useEffect(() => {
    setLocalFormData(prevState => ({
      ...prevState
    }));
  }, []);

  useEffect(() => {
    if (initialFormData) {
      setLocalFormData(prevState => ({
        child_id: childId,
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
        comments: initialFormData.additional_information || ''
      }));
    }
  }, [initialFormData, childId]);

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
        throw new Error(`Failed to update admission data: ${response.status}`);
      }

      const result = await response.json();
      console.log('Admission data updated successfully:', result);
      return result;
    } catch (error) {
      console.error('Error updating admission data:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!childId) {
      alert('Error: Child ID is missing');
      return;
    }

    try {
      const saveData = {
        child_id: childId,
        existing_illness_allergy: localFormData.hasExistingCondition === 'Yes' ? 1 : 2,
        explain_for_existing_illness_allergy: localFormData.existingConditionExplanation,
        functioning_at_age: localFormData.functioningAtAge === 'Yes' ? 1 : 2,
        explain_for_functioning_at_age: localFormData.functioningAtAgeExplanation,
        able_to_walk: localFormData.canWalk === 'Yes' ? 1 : 2,
        explain_for_able_to_walk: localFormData.canWalkExplanation,
        communicate_their_needs: localFormData.canCommunicate === 'Yes' ? 1 : 2,
        explain_for_communicate_their_needs: localFormData.canCommunicateExplanation,
        any_medication: localFormData.needsTreatment === 'Yes' ? 1 : 2,
        explain_for_any_medication: localFormData.treatmentExplanation,
        utilize_special_equipment: localFormData.usesEquipment === 'Yes' ? 1 : 2,
        explain_for_utilize_special_equipment: localFormData.equipmentExplanation,
        significant_periods: localFormData.needsSupervision === 'Yes' ? 1 : 2,
        explain_for_significant_periods: localFormData.supervisionExplanation,
        desire_any_accommodations: localFormData.needsAccommodation === 'Yes' ? 1 : 2,
        explain_for_desire_any_accommodations: localFormData.accommodationExplanation,
        additional_information: localFormData.comments
      };
      console.log(saveData);
      await updateAdmissionData(saveData);
      alert('Medical General data saved successfully!');
    } catch (error) {
      console.error('Failed to save Medical General data:', error);
      alert('Error saving Medical General data. Please try again.');
    }
  };
  const isOpen = expandedSections.MedicalGeneral;

  return (
    <div className="border border-gray-300 border-t-0">
      {/* Accordion Header */}
      <div
        className={`p-3 flex items-center justify-between cursor-pointer transition-colors font-semibold ${isOpen ? 'text-white' : 'text-gray-700'}`}
        style={isOpen ? { backgroundColor: '#0F2D52', color:'#DBEAFE' } : { backgroundColor: '#DBEAFE', color:'#0F2D52' }}
        onClick={() => toggleSection('MedicalGeneral')}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#0F2D52';
          e.currentTarget.style.color = '#DBEAFE';
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = '#DBEAFE';
            e.currentTarget.style.color = '#374151';
          }
        }}
      >
        <span>Medical General</span>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </div>

      {/* Accordion Content */}
      {isOpen && (
        <div className="p-6 bg-gray-50 space-y-6" style={{ border: '1px solid #314158' }}>
          {yesNoFields.map(({ label, name, explanation }) => (
            <React.Fragment key={name}>
              <RadioGroup
                label={label}
                name={name}
                options={[
                  { label: 'Yes', value: 'Yes' },
                  { label: 'No', value: 'No' },
                ]}
                selectedValue={localFormData[name]}
                onChange={handleRadioChange}
              />
              <FormInput
                label='Explain (Type "NA" if not applicable)'
                name={explanation}
                value={localFormData[explanation]}
                onChange={handleChange}
              />
            </React.Fragment>
          ))}

          <FormInput
            label="Comments and additional information"
            name="comments"
            value={localFormData.comments}
            onChange={handleChange}
          />


          <div className="flex justify-center">
            <button
              onClick={handleSave}
              className="text-white px-8 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ backgroundColor: '#0F2D52' }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalGeneral;
