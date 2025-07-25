import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';


const Parent_Argeement = ({ expandedSections, toggleSection, formData, handleInputChange, initialFormData, childId }) => {
  const [localFormData, setLocalFormData] = useState({
    agreementConfirmed: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLocalFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
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
        agreementConfirmed: initialFormData.do_you_agree_this === 'on' ? true : false
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

  // Function to check if agreement is confirmed
  const isFormComplete = () => {
    return localFormData.agreementConfirmed === true;
  };

  const handleSave = async () => {
    if (!childId) {
      alert('Error: Child ID is missing');
      return;
    }

    try {
      const saveData = {
        child_id: childId,
        do_you_agree_this: localFormData.agreementConfirmed ? 'on' : 'off'
      };
      console.log(saveData);
      await updateAdmissionData(saveData);
      alert('Parent Agreement data saved successfully!');
    } catch (error) {
      console.error('Failed to save Parent Agreement data:', error);
      alert('Error saving Parent Agreement data. Please try again.');
    }
  };
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
        <div className="flex items-center space-x-3">
          <span className="font-semibold">Parent Agreement</span>
          <img 
            src={isFormComplete() ? "/image/tick.png" : "/image/circle-with.png"} 
            alt={isFormComplete() ? "Complete" : "Incomplete"} 
            className="w-5 h-5"
          />
        </div>
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
              name="agreementConfirmed"
              checked={localFormData.agreementConfirmed}
              onChange={handleChange}
              className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="agreementCheck" className="text-lg text-gray-700">
              I agree all the above information is correct.
            </label>
          </div>

          <div className="flex justify-center pt-4">
            <button
              onClick={handleSave}
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