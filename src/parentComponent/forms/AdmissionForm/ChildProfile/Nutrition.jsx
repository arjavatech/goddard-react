import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { RadioGroup, FormInput } from './InputComponent';

const Nutrition = ({ expandedSections, toggleSection, formData, handleInputChange, initialFormData, childId }) => {
  const [localFormData, setLocalFormData] = useState({
    hasSpecialDiet: '',
    specialDietExplanation: '',
    eatsOnOwn: '',
    eatsOnOwnExplanation: '',
    favoriteFoods: ''
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
        hasSpecialDiet: initialFormData.restricted_diet === 1 ? 'Yes' : (initialFormData.restricted_diet === 2 ? 'No' : ''),
        specialDietExplanation: initialFormData.restricted_diet_reason || '',
        eatsOnOwn: initialFormData.eat_own === 1 ? 'Yes' : (initialFormData.eat_own === 2 ? 'No' : ''),
        eatsOnOwnExplanation: initialFormData.eat_own_reason || '',
        favoriteFoods: initialFormData.favorite_foods || ''
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
        restricted_diet: localFormData.hasSpecialDiet === 'Yes' ? 1 : 2,
        restricted_diet_reason: localFormData.specialDietExplanation,
        eat_own: localFormData.eatsOnOwn === 'Yes' ? 1 : 2,
        eat_own_reason: localFormData.eatsOnOwnExplanation,
        favorite_foods: localFormData.favoriteFoods
      };
      console.log(saveData);
      await updateAdmissionData(saveData);
      alert('Nutrition data saved successfully!');
    } catch (error) {
      console.error('Failed to save Nutrition data:', error);
      alert('Error saving Nutrition data. Please try again.');
    }
  };
  const isOpen = expandedSections.nutrition;

  return (
    <div className="border border-gray-300 border-t-0">
      <div
        className={`p-3 flex items-center justify-between cursor-pointer transition-colors font-semibold 
          ${isOpen ? 'text-[#DBEAFE]' : 'text-gray-700'}
        `}
        style={isOpen ? { backgroundColor: '#0F2D52', color:'#DBEAFE' } : { backgroundColor: '#DBEAFE', color:'#0F2D52' }}
        onClick={() => toggleSection('nutrition')}
        onMouseEnter={(e) => {
          if (!isOpen) e.currentTarget.style.backgroundColor = '#0F2D52';
          e.currentTarget.style.color = '#DBEAFE';
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = '#DBEAFE';
            e.currentTarget.style.color = '#0F2D52';
          }
        }}
      >
        <span>Nutrition</span>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </div>

      {isOpen && (
        <div className="p-6 bg-gray-50 space-y-6" style={{ border: '1px solid #314158' }}>
          <RadioGroup
            label="Does your child have a special or restricted diet?"
            name="hasSpecialDiet"
            options={[{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }]}
            selectedValue={localFormData.hasSpecialDiet}
            onChange={handleRadioChange}
          />

          <FormInput
            label='Explain (Type "NA" if not applicable)'
            name="specialDietExplanation"
            value={localFormData.specialDietExplanation}
            onChange={handleChange}
          />

          <RadioGroup
            label="Does your child eat on their own?"
            name="eatsOnOwn"
            options={[{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }]}
            selectedValue={localFormData.eatsOnOwn}
            onChange={handleRadioChange}
          />

          <FormInput
            label='Explain (Type "NA" if not applicable)'
            name="eatsOnOwnExplanation"
            value={localFormData.eatsOnOwnExplanation}
            onChange={handleChange}
          />

          <FormInput
            label="What are your child's favorite foods?"
            name="favoriteFoods"
            value={localFormData.favoriteFoods}
            onChange={handleChange}
          />

          <div className="flex justify-center">
            <button
              onClick={handleSave}
              className="text-white px-8 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ backgroundColor: '#0F2D52' }}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Nutrition;
