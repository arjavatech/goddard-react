import React, { useState, useEffect } from 'react';
import { Check, ChevronUp, ChevronDown, Clock } from 'lucide-react';

const ChildProfileDetails = ({ expandedSections, toggleSection, initialFormData, childId }) => {
    const [localFormData, setLocalFormData] = useState({
        important_fam_members: '',
        about_family_celebrations: '',
        childcare_before: '',
        what_child_interests: '',
        drop_off_time: '',
        pick_up_time: ''
    });
    console.log(initialFormData)
    const handleChange = (e) => {
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
                important_fam_members: initialFormData.important_fam_members || '',
                about_family_celebrations: initialFormData.about_family_celebrations || '',
                childcare_before: initialFormData.childcare_before === 1 ? 'Yes' : (initialFormData.childcare_before === 2 ? 'No' : ''),
                what_child_interests: initialFormData.what_child_interests || '',
                drop_off_time: initialFormData.drop_off_time || '',
                pick_up_time: initialFormData.pick_up_time || ''
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
            'important_fam_members',
            'childcare_before',
            'drop_off_time',
            'pick_up_time'
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
                important_fam_members: localFormData.important_fam_members,
                about_family_celebrations: localFormData.about_family_celebrations,
                childcare_before: localFormData.childcare_before === 'Yes' ? 1 : (localFormData.childcare_before === 'No' ? 2 : 2),
                what_child_interests: localFormData.what_child_interests,
                drop_off_time: localFormData.drop_off_time,
                pick_up_time: localFormData.pick_up_time
            };
            console.log(saveData);
            await updateAdmissionData(saveData);
            alert('Child profile details saved successfully!');
        } catch (error) {
            console.error('Failed to save Child profile details:', error);
            alert('Error saving Child profile details. Please try again.');
        }
    };
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
          <div className="flex items-center space-x-3">
            <span className="font-semibold">Child Profile Details</span>
            <img 
              src={isFormComplete() ? "/image/tick.png" : "/image/circle-with.png"} 
              alt={isFormComplete() ? "Complete" : "Incomplete"} 
              className="w-5 h-5"
            />
          </div>
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
                name="important_fam_members"
                value={localFormData.important_fam_members}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Family Traditions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tell us about your family about_family_celebrations or important celebrations
              </label>
              <input
                type="text"
                name="about_family_celebrations"
                value={localFormData.about_family_celebrations}
                onChange={handleChange}
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
                      name="childcare_before"
                      value={option}
                      checked={localFormData.childcare_before === option}
                      onChange={handleChange}
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
                name="what_child_interests"
                value={localFormData.what_child_interests}
                onChange={handleChange}
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
                  { label: 'Drop off time?', name: 'drop_off_time' },
                  { label: 'Pick up time?', name: 'pick_up_time' },
                ].map(({ label, name }) => (
                  <div key={name}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                    <div className="relative">
                      <input
                        type="text"
                        name={name}
                        value={localFormData[name]}
                        onChange={handleChange}
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
                onClick={handleSave}
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
