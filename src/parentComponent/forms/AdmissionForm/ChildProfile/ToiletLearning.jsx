import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { RadioGroup, FormInput } from './InputComponent';

const ToiletLearning = ({ expandedSections, toggleSection, formData, handleInputChange, initialFormData, childId }) => {
  const [localFormData, setLocalFormData] = useState({
    restsInMiddleOfDay: '',
    restExplanation: '',
    napRoutine: '',
    isToiletTrained: '',
    toiletTrainedExplanation: ''
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
        rest_in_the_middle_day: localFormData.restsInMiddleOfDay === 'Yes' ? 1 : 2,
        reason_for_rest_in_the_middle_day: localFormData.restExplanation,
        rest_routine: localFormData.napRoutine,
        toilet_trained: localFormData.isToiletTrained === 'Yes' ? 1 : 2,
        reason_for_toilet_trained: localFormData.toiletTrainedExplanation
      };
      console.log(saveData);
      await updateAdmissionData(saveData);
      alert('Toilet Learning data saved successfully!');
    } catch (error) {
      console.error('Failed to save Toilet Learning data:', error);
      alert('Error saving Toilet Learning data. Please try again.');
    }
  };
  const isOpen = expandedSections.rest;

  return (
    <div className="border border-gray-300 border-t-0">
      <div
        className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${isOpen ? 'text-white' : 'text-gray-700'}`}
        style={isOpen ? { backgroundColor: '#0F2D52',color :'text-gray-700' } : {backgroundColor: '#DBEAFE'}}
        onClick={() => toggleSection('rest')}
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
        <div className="flex items-center space-x-3">
          <span className="font-semibold">Rest and Diapering/Toilet Learning</span>
          <img 
            src={isFormComplete() ? "/image/tick.png" : "/image/circle-with.png"} 
            alt={isFormComplete() ? "Complete" : "Incomplete"} 
            className="w-5 h-5"
          />
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </div>

      {isOpen && (
        <div className="p-6 bg-gray-50 space-y-6" style={{ border: '1px solid #314158' }}>
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

          <div className="flex justify-center">
            <button
              onClick={handleSave}
              className="text-white px-8 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ backgroundColor: '#0F2D52' }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToiletLearning;
