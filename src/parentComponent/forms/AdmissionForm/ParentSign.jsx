import React, { useState, useEffect } from 'react';
import FormInput from '../../../components/FormInput';
import FormLabel from '../../../components/FormLabel';

const ParentSign = ({ formData, childId, editID, onAlert }) => {
  const [formState, setFormState] = useState({
    parent_sign_admission: '',
    parent_sign_date_admission: '',
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

  const handleSubmit = async (pointer = 27) => {
    try {
      const outputObject = {
        primary_parent_email: editID || localStorage.getItem('logged_in_email'),
        child_id: childId,
        pointer,
        form_year_ach: new Date().getFullYear().toString(),
        admin_sign_date_ach: formState.admin_sign_date_ach ? 
          new Date(formState.admin_sign_date_ach).getTime() : 
          new Date().getTime(),
        ...formState
      };

      const apiResponse = await fetch(
        `https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/authorization_form/update/${childId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(outputObject)
        }
      );

      if (apiResponse.ok) {
        onAlert('success', 'Authorization form saved successfully!');
        setTimeout(() => {
          sessionStorage.setItem('putcallId', childId);
          window.location.href = `./parent_dashboard.html?id=${editID}`;
        }, 3000);
      } else {
        onAlert('error', 'Failed to save authorization form!');
      }
    } catch (error) {
      // console.error('Error submitting authorization form:', error);
      onAlert('error', 'Failed to save authorization form!');
    }
  };

  return (      
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        
        {/* Signature Section */}
        <div className="rounded">
          <h2 className="headerstyle text-center bg-[#0F2D52] text-white p-3 rounded-t mb-6">Parent Signature</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormLabel htmlFor="parent_sign_admission" required>Parent Signature</FormLabel>
              <FormInput
                id="parent_sign_admission"
                name="parent_sign_admission"
                value={formState.parent_sign_admission}
                onChange={(e) => handleInputChange('parent_sign_admission', e.target.value)}
                required
              />
            </div>
            
            <div className="w-full md:w-1/2 px-3 mb-4">
            <div className="form-group">
              <label htmlFor="parent_sign_date_admission" className="block font-bold mb-2">Date</label>
              <input 
                type="date" 
                className="form-control border border-gray-300 rounded px-3 py-2 w-full" 
                id="parent_sign_date_admission"
                name="parent_sign_date_admission"
                value={formState.parent_sign_date_admission}
                onChange={(e) => handleInputChange('parent_sign_date_admission', e.target.value)}
                readOnly
              />
            </div>
          </div>
            
          </div>
        </div>

        <div className="text-center mb-4">
          <button 
            className="bg-[#0F2D52] text-white py-2 px-6 rounded hover:bg-opacity-90 transition-colors" 
            onClick={() => handleSubmit('parent')}
          >
            Submit
          </button>
        </div>

        
      </form>
  );
};

export default ParentSign;