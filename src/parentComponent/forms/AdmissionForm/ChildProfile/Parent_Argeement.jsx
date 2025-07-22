import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';


const Parent_Argeement = ({ expandedSections, toggleSection, formData, handleInputChange }) => {
  const isOpen = expandedSections.parent;

  return (
    <div className="border border-gray-300 border-t-0">
      <div
        className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${isOpen ? 'text-white' : 'text-gray-700'}`}
        style={isOpen ? { backgroundColor: '#0F2D52',color :'text-gray-700' } : {backgroundColor: '#DBEAFE'}}
        onClick={() => toggleSection('parent')}
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
        <span className="font-semibold">Parent Agreement</span>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </div>

      {isOpen && (
        <div className="p-6 space-y-6 bg-gray-50 border-2" style={{ borderColor: '#0F2D52' }}>
          <h1 className="text-2xl font-semibold text-center font-weigth-600 text-gray-800">Correct and Complete Information</h1>

          <div className="p-4 rounded-md text-x text-gray-700">
            To the best of my knowledge, the information I have provided and the statements I have made in this profile are correct and complete.
            I understand that false information provided herein or in connection with the enrollment process may result in disenrollment of my child.
            I further agree to update the information in this Health and Social Record as circumstances may require at Goddard School’s request.
          </div>

          <div className="flex items-start align-item-center space-x-3">
            <input
              type="checkbox"
              id="agreementCheck"
              checked={formData.do_you_agree_this}
              onChange={(e) => {
                const value = e.target.checked ? 'on' : 'off';
                handleInputChange('agreementConfirmed', e.target.checked);
              }}
              className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="agreementCheck" className="text-lg text-gray-700">
              I agree all the above information is correct.
            </label>
          </div>

          <div className="flex justify-center pt-4">
            <button
              className="text-white px-8 py-3 rounded-md transition-colors"
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


export default Parent_Argeement;