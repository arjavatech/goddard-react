import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Moon, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RadioGroup, FormInput } from './InputComponent';
import { api_base_url, school_id } from '@/utils/const';
import { toast } from 'sonner';
import { useAuth0 } from '@auth0/auth0-react';
import { getAuthHeaders } from '@/utils/auth';

const ToiletLearning = ({ expandedSections, toggleSection, formData, handleInputChange, initialFormData, childId }) => {
  const [localFormData, setLocalFormData] = useState({
    restsInMiddleOfDay: '',
    restExplanation: '',
    napRoutine: '',
    isToiletTrained: '',
    toiletTrainedExplanation: ''
  });

  const { getAccessTokenSilently } = useAuth0();

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
        restsInMiddleOfDay: initialFormData.rest_in_the_middle_day === 1 ? 'Yes' : (initialFormData.rest_in_the_middle_day === 2 ? 'No' : ''),
        restExplanation: initialFormData.reason_for_rest_in_the_middle_day || '',
        napRoutine: initialFormData.rest_routine || '',
        isToiletTrained: initialFormData.toilet_trained === 1 ? 'Yes' : (initialFormData.toilet_trained === 2 ? 'No' : ''),
        toiletTrainedExplanation: initialFormData.reason_for_toilet_trained || ''
      }));
    }
  }, [initialFormData, childId]);

  const updateAdmissionData = async (fieldData) => {
    if (!childId) {
      console.error('Child ID is required for API update');
      return;
    }
    const headers = await getAuthHeaders(getAccessTokenSilently);

    try {
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
      'restsInMiddleOfDay',
      'isToiletTrained'
    ];
    
    return requiredFields.every(field => 
      localFormData[field] && localFormData[field].toString().trim() !== ''
    );
  };

  const handleSave = async () => {
    if (!childId) {
      alert('Error: Child ID is missing');
      return;
    }

    try {
      const saveData = {
        child_id: childId,
        school_id: school_id,
        rest_in_the_middle_day: localFormData.restsInMiddleOfDay === 'Yes' ? 1 : 2,
        reason_for_rest_in_the_middle_day: localFormData.restExplanation,
        rest_routine: localFormData.napRoutine,
        toilet_trained: localFormData.isToiletTrained === 'Yes' ? 1 : 2,
        reason_for_toilet_trained: localFormData.toiletTrainedExplanation
      };
      console.log(saveData);
      await updateAdmissionData(saveData);
      toast.success('Toilet Learning data saved successfully!');
    } catch (error) {
      console.error('Failed to save Toilet Learning data:', error);
      toast.error('Error saving Toilet Learning data. Please try again.');
    }
  };
  const isOpen = expandedSections.rest;

  return (
    <Card className="border border-gray-300">
      <CardHeader 
        className={`p-3 cursor-pointer transition-colors ${
          isOpen ? 'bg-[#0F2D52] text-white' : 'bg-[#DBEAFE] text-[#0F2D52]'
        } hover:bg-[#0F2D52] hover:text-white`}
        onClick={() => toggleSection('rest')}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Moon className="h-5 w-5" />
            <div>
              <CardTitle className="text-base font-semibold">Rest and Diapering/Toilet Learning</CardTitle>
              <CardDescription className={`text-sm ${
                isOpen ? 'text-blue-100' : 'text-gray-600'
              }`}>
                Sleep patterns and toilet training status
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
          <RadioGroup
            label="Does your child rest in the middle of the day?"
            name="restsInMiddleOfDay"
            options={[{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }]}
            selectedValue={localFormData.restsInMiddleOfDay}
            onChange={handleRadioChange}
          />

          <FormInput
            label='Explain (Type "NA" if not applicable)'
            name="restExplanation"
            value={localFormData.restExplanation}
            onChange={handleChange}
            placeholder="Indicate if the child takes a midday rest."
          />

          <FormInput
            label="What is their nap/rest routine?"
            name="napRoutine"
            value={localFormData.napRoutine}
            onChange={handleChange}
            placeholder="Describe the child's nap or rest routine."
          />

          <RadioGroup
            label="Is your child toilet trained?"
            name="isToiletTrained"
            options={[{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }]}
            selectedValue={localFormData.isToiletTrained}
            onChange={handleRadioChange}
          />

          <FormInput
            label='Explain (Type "NA" if not applicable)'
            name="toiletTrainedExplanation"
            value={localFormData.toiletTrainedExplanation}
            onChange={handleChange}
            placeholder="Indicate if the child is toilet trained."
          />

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

export default ToiletLearning;
