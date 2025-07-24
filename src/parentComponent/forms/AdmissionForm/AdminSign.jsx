import React, { useState, useEffect } from 'react';
import FormInput from '../../../components/FormInput';
import FormLabel from '../../../components/FormLabel';

const adminSign = ({ initialFormData = null, formData, childId, editID, onAlert }) => {
  const [formState, setFormState] = useState({
    admin_sign_admission: initialFormData.admin_sign_admission ?? '',
    admin_sign_date_admission: initialFormData.admin_sign_date_admission ?? '',
  });

  useEffect(() => {
    if (formData) {
      setFormState(prevState => ({
        ...prevState,
        ...formData
      }));
    }
  }, [formData]);

  const handleInputChange = (field, value) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
        throw new Error(`Failed to update Admission data: ${response.status}`);
      }

      const result = await response.json();
      console.log('Admission data updated successfully:', result);
      return result;
    } catch (error) {
      console.error('Error updating Admission data:', error);
      throw error;
    }
  };

  const handleSubmit = async (type) => {
    
    if (type === 'admin') {
      if (!childId) {
      alert('Error: Child ID is missing');
      return;
    }

    try {
      if(formState.admin_sign_admission == null || formState.admin_sign_admission == '')
      {
        alert('Error: Parent Sign is missing');
        return;
      }
      const epochValue = new Date(formState.admin_sign_date_admission).getTime();
      // Prepare the complete form data for API call including child_id
      const saveData = {
        child_id: childId,
        admin_sign_admission: formState.admin_sign_admission,
        admin_sign_date_admission: epochValue
      };

      // Call the API to save all form data
      await updateAdmissionData(saveData);
      
      // Show success alert
      alert('Admission form data saved successfully!');
    } catch (error) {
      console.error('Failed to save Admission form:', error);
      alert('Error saving Admission form data. Please try again.');
    }
  
  }
   
  };

  return (      
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        
        {/* Signature Section */}
        <div className="rounded">
          <h2 className="headerstyle text-center bg-[#0F2D52] text-white p-3 text-3xl rounded-t mb-6">Admin Signature</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormLabel htmlFor="admin_sign_admission" required>Admin Signature</FormLabel>
              <FormInput
                id="admin_sign_admission"
                name="admin_sign_admission"
                value={formState.admin_sign_admission}
                onChange={(e) => handleInputChange('admin_sign_admission', e.target.value)}
                required
              />
            </div>
            
            <div className="w-full md:w-1/2 px-3 mb-4">
            <div className="form-group">
              <label htmlFor="admin_sign_date_admission" className="block font-bold mb-2">Date</label>
              <input 
                type="datetime-local" 
                className="form-control border border-gray-300 rounded px-3 py-2 w-full" 
                id="admin_sign_date_admission"
                name="admin_sign_date_admission"
                value={formState.admin_sign_date_admission}
                onChange={(e) => handleInputChange('admin_sign_date_admission', e.target.value)}
              />
            </div>
          </div>
            
          </div>
        </div>

        <div className="text-center mb-4">
          <button 
            className="bg-[#0F2D52] text-white py-2 px-6 rounded hover:bg-opacity-90 transition-colors" 
            onClick={() => handleSubmit('admin')}
          >
            Submit
          </button>
        </div>

        
      </form>
  );
};

export default adminSign;