import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Heart, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { RadioGroup, FormInput } from './InputComponent';
import { api_base_url, school_id } from '@/utils/const';
import { useAuth0 } from '@auth0/auth0-react';
import { getAuthHeaders } from '@/utils/auth';

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

const MedicalGeneral = ({ initialFormData = {}, expandedSections, toggleSection, childId, onSubmitSuccess }) => {
  const { getAccessTokenSilently } = useAuth0();
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
    if (initialFormData && Object.keys(initialFormData).length > 0) {
      setLocalFormData(prevState => ({
        child_id: childId,
        hasExistingCondition: initialFormData?.existing_illness_allergy === 1 ? 'Yes' : (initialFormData?.existing_illness_allergy === 2 ? 'No' : ''),
        existingConditionExplanation: initialFormData?.explain_for_existing_illness_allergy || '',
        functioningAtAge: initialFormData?.functioning_at_age === 1 ? 'Yes' : (initialFormData?.functioning_at_age === 2 ? 'No' : ''),
        functioningAtAgeExplanation: initialFormData?.explain_for_functioning_at_age || '',
        canWalk: initialFormData?.able_to_walk === 1 ? 'Yes' : (initialFormData?.able_to_walk === 2 ? 'No' : ''),
        canWalkExplanation: initialFormData?.explain_for_able_to_walk || '',
        canCommunicate: initialFormData?.communicate_their_needs === 1 ? 'Yes' : (initialFormData?.communicate_their_needs === 2 ? 'No' : ''),
        canCommunicateExplanation: initialFormData?.explain_for_communicate_their_needs || '',
        needsTreatment: initialFormData?.any_medication === 1 ? 'Yes' : (initialFormData?.any_medication === 2 ? 'No' : ''),
        treatmentExplanation: initialFormData?.explain_for_any_medication || '',
        usesEquipment: initialFormData?.utilize_special_equipment === 1 ? 'Yes' : (initialFormData?.utilize_special_equipment === 2 ? 'No' : ''),
        equipmentExplanation: initialFormData?.explain_for_utilize_special_equipment || '',
        needsSupervision: initialFormData?.significant_periods === 1 ? 'Yes' : (initialFormData?.significant_periods === 2 ? 'No' : ''),
        supervisionExplanation: initialFormData?.explain_for_significant_periods || '',
        needsAccommodation: initialFormData?.desire_any_accommodations === 1 ? 'Yes' : (initialFormData?.desire_any_accommodations === 2 ? 'No' : ''),
        accommodationExplanation: initialFormData?.explain_for_desire_any_accommodations || '',
        comments: initialFormData?.additional_information || ''
      }));
    }
  }, [initialFormData, childId]);

  const updateAdmissionData = async (fieldData) => {
    if (!childId) {
      console.error('Child ID is required for API update');
      return;
    }

    try {
      const headers = await getAuthHeaders(getAccessTokenSilently);
      const response = await fetch(`${api_base_url}/admission_segment/${school_id}/${childId}`, {
        method: 'PUT',
        headers,
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

  // Function to check if all required fields are filled
  const isFormComplete = () => {
    const requiredFields = [
      'hasExistingCondition',
      'functioningAtAge', 
      'canWalk',
      'canCommunicate',
      'needsTreatment',
      'usesEquipment',
      'needsSupervision',
      'needsAccommodation'
    ];
    
    return requiredFields.every(field => 
      localFormData[field] && localFormData[field].toString().trim() !== ''
    );
  };

  const handleSave = async (e) => {
    // Prevent any form submission or default behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!childId) {
      toast.error('Error: Child ID is missing');
      return;
    }

    try {
      const saveData = {
        child_id: childId,
        school_id: school_id,
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
      toast.success('Medical General data saved successfully!');
      
      // Call the parent's onSubmitSuccess to mark Child Profile as complete
      if (onSubmitSuccess) {
        // onSubmitSuccess();
      }
    } catch (error) {
      console.error('Failed to save Medical General data:', error);
      toast.error('Error saving Medical General data. Please try again.');
    }
  };
  const isOpen = expandedSections.medical;

  return (
    <Card className="border border-gray-300">
      <CardHeader 
        className={`p-3 cursor-pointer transition-colors ${
          isOpen ? 'bg-[#0F2D52] text-white' : 'bg-[#DBEAFE] text-[#0F2D52]'
        } hover:bg-[#0F2D52] hover:text-white`}
        onClick={() => toggleSection('medical')}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="h-5 w-5" />
            <div>
              <CardTitle className="text-base font-semibold">Medical General</CardTitle>
              <CardDescription className={`text-sm ${
                isOpen ? 'text-blue-100' : 'text-gray-600'
              }`}>
                Health conditions and medical requirements
              </CardDescription>
            </div>
            {isFormComplete() && (
              <Badge className="bg-green-100 text-green-800 ml-2">
                <Check className="h-3 w-3 mr-1" />
                Complete
              </Badge>
            )}
          </div>
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent className="p-6 bg-gray-50 border-t space-y-6">
          {yesNoFields.map(({ label, name, explanation }) => (
            <div key={name} className="space-y-4 p-4 bg-white rounded-lg border">
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
                placeholder="Provide details or type 'NA' if not applicable"
              />
            </div>
          ))}

          <div className="p-4 bg-white rounded-lg border">
            <FormInput
              label="Comments and additional information"
              name="comments"
              value={localFormData.comments}
              onChange={handleChange}
              placeholder="Any additional medical or health information"
            />
          </div>

          <div className="flex justify-center pt-4">
            <Button 
              type="button"
              onClick={handleSave}
              className="bg-[#0F2D52] hover:bg-[#0F2D52]/90 px-8"
            >
              Save
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default MedicalGeneral;
