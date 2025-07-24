import React, { useState, useEffect } from 'react';
import './ImmunizationInstructions.css'; // assuming you have this CSS

const ImmunizationInstructions = ({ initialFormData = null , childId}) => {
  const [isChecked, setIsChecked] = useState(false);

  // API function to update admission form data
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
        do_you_agree_this_immunization_instructions: isChecked ? 'on' : 'off'
      };

      await updateAdmissionData(saveData);
      alert('Medical transportation waiver saved successfully!');
    } catch (error) {
      console.error('Failed to save medical transportation waiver:', error);
      alert('Error saving medical transportation waiver. Please try again.');
    }
  };


  useEffect(() => {
    if (initialFormData) {
      setIsChecked(initialFormData.do_you_agree_this_immunization_instructions == 'on');
    }
  }, [initialFormData]);

  const handleChange = (e) => {
    setIsChecked(e.target.checked);
  };
  return (
    <div className="card bg-[#D8E9FF]">
        <div className="custom-header text-center">
          <h4 className="mb-0 text-white">Immunization Instructions</h4>
        </div>
        <div className="card-body p-4 bg-white">
          <p className='my-12 ml-7'>
            Please provide your children’s immunization records to the school on or before your
            children’s first day in our school.
          </p>
          

          <p className='mb-12 ml-7'>
            <strong>NOTE:</strong> If your child has a vaccination history with Washington State, we
            can directly download the immunization record from the Department of Health. You don't
            have to send us an immunization copy.
          </p>

          <ol className="instruction-list ml-3">
            <li className='mb-10'>
                <span className="number">1.</span>
    <span className="ms-6">
        If you have a soft copy, feel free to email it to us.
        </span></li>
            <li className='mb-10'>
                <span className="number">2.</span>
    <span className="ms-6">
        You can visit{' '}
        </span>
                  
              <a href="https://myirmobile.com" target="_blank" rel="noopener noreferrer" className='text-blue-600'>
                https://myirmobile.com
              </a>
              , register, and access the report for your child.
            </li>
            <li className='mb-10'>
                <span className="number">3.</span>
    <span className="ms-6">
        If you have a MyChart login for your child's profile, you can download the report
              directly or request it from your pediatrician.
        </span>    
            </li>
          </ol>

          <p>
            Once obtained, kindly email it to us at{' '}
            <a href="mailto:lynnwoodmanagementgroup@goddardsystems.onmicrosoft.com">
              lynnwoodmanagementgroup@goddardsystems.onmicrosoft.com
            </a>
            .
          </p>

          <p>
            If you have an exemption due to medical or religious reasons. Please let us know and we
            will help provide the proper form to fill out.
          </p>

          <div className="form-check mt-3 mb-4">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={handleChange}
              className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded"
              id="do_you_agree_this_immunization_instructions"
            />
            <label
              className="form-check-label ml-3"
              htmlFor="do_you_agree_this_immunization_instructions"
            >
              <strong>I agree immunization instructions.</strong>
            </label>
          </div>

          <div className="text-center">
            <button className="bg-slate-700 text-white px-8 py-3 rounded-md hover:bg-slate-800 transition-colors"
            onClick={handleSave}>
                            Save
                        </button>
          </div>
        </div>
      </div>
  );
};

export default ImmunizationInstructions;