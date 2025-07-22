import { ChevronUp, ChevronDown } from 'lucide-react';
import { RadioGroup, FormInput } from './InputComponent';

const ToiletLearning = ({ expandedSections, toggleSection, formData, handleInputChange }) => {
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
        <span className="font-semibold">Rest and Diapering/Toilet Learning</span>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </div>

      {isOpen && (
        <div className="p-6 bg-gray-50 space-y-6">
          <RadioGroup
            label="Does your child rest in the middle of the day?"
            name="restsInMiddleOfDay"
            options={[{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }]}
            selectedValue={formData.restsInMiddleOfDay}
            onChange={(field, value) => handleInputChange(field, value)}
          />

          <FormInput
            label='Explain (Type "NA" if not applicable)'
            name="restExplanation"
            value={formData.restExplanation}
            onChange={(e) => handleInputChange('restExplanation', e.target.value)}
            placeholder="Indicate if the child takes a midday rest."
          />

          <FormInput
            label="What is their nap/rest routine?"
            name="napRoutine"
            value={formData.napRoutine}
            onChange={(e) => handleInputChange('napRoutine', e.target.value)}
            placeholder="Describe the child's nap or rest routine."
          />

          <RadioGroup
            label="Is your child toilet trained?"
            name="isToiletTrained"
            options={[{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }]}
            selectedValue={formData.isToiletTrained}
            onChange={(field, value) => handleInputChange(field, value)}
          />

          <FormInput
            label='Explain (Type "NA" if not applicable)'
            name="toiletTrainedExplanation"
            value={formData.toiletTrainedExplanation}
            onChange={(e) => handleInputChange('toiletTrainedExplanation', e.target.value)}
            placeholder="Indicate if the child is toilet trained."
          />

          <div className="flex justify-center">
            <button
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
