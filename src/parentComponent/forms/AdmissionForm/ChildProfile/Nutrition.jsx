import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { RadioGroup, FormInput } from './InputComponent';

const Nutrition = ({ expandedSections, toggleSection, formData, handleInputChange }) => {
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
        <div className="p-6 bg-gray-50 space-y-6">
          <RadioGroup
            label="Does your child have a special or restricted diet?"
            name="hasSpecialDiet"
            options={[{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }]}
            selectedValue={formData.hasSpecialDiet}
            onChange={(name, value) => handleInputChange(name, value)}
          />

          <FormInput
            label='Explain (Type "NA" if not applicable)'
            name="specialDietExplanation"
            value={formData.specialDietExplanation}
            onChange={(e) => handleInputChange('specialDietExplanation', e.target.value)}
          />

          <RadioGroup
            label="Does your child eat on their own?"
            name="eatsOnOwn"
            options={[{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }]}
            selectedValue={formData.eatsOnOwn}
            onChange={(name, value) => handleInputChange(name, value)}
          />

          <FormInput
            label='Explain (Type "NA" if not applicable)'
            name="eatsOnOwnExplanation"
            value={formData.eatsOnOwnExplanation}
            onChange={(e) => handleInputChange('eatsOnOwnExplanation', e.target.value)}
          />

          <FormInput
            label="What are your child's favorite foods?"
            name="favoriteFoods"
            value={formData.favoriteFoods}
            onChange={(e) => handleInputChange('favoriteFoods', e.target.value)}
          />

          <div className="flex justify-center">
            <button
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
