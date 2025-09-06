import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Utensils, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RadioGroup, FormInput } from './InputComponent';
import { api_base_url, school_id } from '@/utils/const';
import { toast } from 'sonner';

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
      const response = await fetch(`${api_base_url}/admission_segment/${school_id}/${childId}`, {
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
    // Check if radio buttons are answered
    const hasSpecialDiet = localFormData.hasSpecialDiet && localFormData.hasSpecialDiet.trim() !== '';
    const eatsOnOwn = localFormData.eatsOnOwn && localFormData.eatsOnOwn.trim() !== '';
    
    // Check if explanation fields are filled (should have content or "NA")
    const specialDietExplanation = localFormData.specialDietExplanation && localFormData.specialDietExplanation.trim() !== '';
    const eatsOnOwnExplanation = localFormData.eatsOnOwnExplanation && localFormData.eatsOnOwnExplanation.trim() !== '';
    
    // Check if favorite foods is filled
    const favoriteFoods = localFormData.favoriteFoods && localFormData.favoriteFoods.trim() !== '';
    
    return hasSpecialDiet && eatsOnOwn && specialDietExplanation && eatsOnOwnExplanation && favoriteFoods;
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
        restricted_diet: localFormData.hasSpecialDiet === 'Yes' ? 1 : 2,
        restricted_diet_reason: localFormData.specialDietExplanation,
        eat_own: localFormData.eatsOnOwn === 'Yes' ? 1 : 2,
        eat_own_reason: localFormData.eatsOnOwnExplanation,
        favorite_foods: localFormData.favoriteFoods
      };
      console.log(saveData);
      await updateAdmissionData(saveData);
      toast.success('Nutrition data saved successfully!');
    } catch (error) {
      console.error('Failed to save Nutrition data:', error);
      toast.error('Error saving Nutrition data. Please try again.');
    }
  };
  const isOpen = expandedSections.nutrition;

  return (
    <Card className="border border-gray-300">
      <CardHeader 
        className={`p-3 cursor-pointer transition-colors ${
          isOpen ? 'bg-[#0F2D52] text-white' : 'bg-[#DBEAFE] text-[#0F2D52]'
        } hover:bg-[#0F2D52] hover:text-white`}
        onClick={() => toggleSection('nutrition')}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Utensils className="h-5 w-5" />
            <div>
              <CardTitle className="text-base font-semibold">Nutrition</CardTitle>
              <CardDescription className={`text-sm ${
                isOpen ? 'text-blue-100' : 'text-gray-600'
              }`}>
                Dietary requirements and eating habits
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
            placeholder="Describe any dietary restrictions or allergies"
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
            placeholder="Describe your child's feeding independence level"
          />

          <FormInput
            label="What are your child's favorite foods?"
            name="favoriteFoods"
            value={localFormData.favoriteFoods}
            onChange={handleChange}
            placeholder="List your child's preferred foods"
          />

          <div className="flex justify-center pt-4">
            <Button 
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

export default Nutrition;
