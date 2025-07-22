import React from 'react';
import { Check, ChevronUp, ChevronDown, Clock } from 'lucide-react';

const ChildProfileDetails = ({ expandedSections, toggleSection, formData, handleInputChange }) => {
    const isOpen = expandedSections.profile;
  return (
    <div className="border border-gray-300 border mt-px">
      <div
        className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
          expandedSections.profile ? 'text-white' : 'text-gray-700'
        }`}
        style={isOpen ? { backgroundColor: '#0F2D52',color :'text-gray-700' } : {backgroundColor: '#DBEAFE'}}
        
        onClick={() => toggleSection('profile')}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#0F2D52';
          e.currentTarget.style.color = '#DBEAFE';
        }}
        onMouseLeave={(e) => {
          if (!expandedSections.profile) {
            e.currentTarget.style.backgroundColor = '#DBEAFE';
            e.currentTarget.style.color = '#374151'; // Tailwind's text-gray-700
          }
        }}
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold">Child Profile Details</span>
        </div>
        {expandedSections.profile ? (
          <ChevronUp className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
        )}
      </div>

      {expandedSections.profile && (
        <div className="p-6 bg-gray-50" style={{ border: '1px solid #314158' }}>
          <div className="space-y-6">
            {/* Family Members */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Other important Family Members (Siblings, Grandparent, Pets, etc)
              </label>
              <input
                type="text"
                value={formData.familyMembers}
                onChange={(e) => handleInputChange('familyMembers', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Family Traditions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tell us about your family traditions or important celebrations
              </label>
              <input
                type="text"
                value={formData.traditions}
                onChange={(e) => handleInputChange('traditions', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Childcare Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Has your child been in childcare before?
              </label>
              <div className="flex gap-4">
                {['Yes', 'No'].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="childcareExperience"
                      value={option}
                      checked={formData.hasChildcareExperience === option}
                      onChange={(e) => handleInputChange('hasChildcareExperience', e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Child's Interests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What are your child's interests
              </label>
              <input
                type="text"
                value={formData.interests}
                onChange={(e) => handleInputChange('interests', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Typical Time Section */}
            <div>
              <h3 className="text-center text-sm font-medium text-gray-700 mb-4">
                What will be your child's typical time?
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Drop off time?', name: 'dropOffTime' },
                  { label: 'Pick up time?', name: 'pickUpTime' },
                ].map(({ label, name }) => (
                  <div key={name}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData[name]}
                        onChange={(e) => handleInputChange(name, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                      />
                      <Clock className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
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
        </div>
      )}
    </div>
  );
};

export default ChildProfileDetails;
