import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { RadioGroup, FormInput } from './InputComponent';

const yesNoFields = [
  {
    label: 'Does your child have an existing illness/allergy/condition?',
    name: 'hasSpecialDiet',
    explanation: 'specialDietExplanation',
  },
  {
    label: 'Does your think your child is functioning at age-level?',
    name: 'eatsOnOwn',
    explanation: 'eatsOnOwnExplanation',
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

const MedicalGeneral = ({ initialFormData = null, expandedSections, toggleSection, formData, handleInputChange }) => {
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
                selectedValue={formData[name]}
                onChange={(field, value) => handleInputChange(field, value)}
              />
              <FormInput
                label='Explain (Type "NA" if not applicable)'
                name={explanation}
                value={formData[explanation]}
                onChange={(e) => handleInputChange(explanation, e.target.value)}
              />
            </React.Fragment>
          ))}

          <FormInput
            label="Comments and additional information"
            name="comments"
            value={formData.comments}
            onChange={(e) => handleInputChange('comments', e.target.value)}
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
