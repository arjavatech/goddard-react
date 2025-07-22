import React, { useState, useEffect } from 'react';
import FormInput from '../../FormInput';
import FormLabel from '../../FormLabel';

const AuthorizationForm = ({ formData, childId, editID, onAlert }) => {
  const [formState, setFormState] = useState({
    bank_routing: '',
    bank_account: '',
    driver_license: '',
    state: '',
    i: '',
    parent_sign_ach: '',
    parent_sign_date_ach: ''
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
    <div className="p-6">
      <h3 className="text-2xl font-bold text-[#0F2D52] mb-6">Authorization Form</h3>
      
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        {/* Bank Information Section */}
        <div className="bg-gray-50 p-4 rounded mb-6">
          <h4 className="text-lg font-semibold mb-4 text-[#0F2D52]">Bank Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormLabel htmlFor="bank_routing" required>Bank Routing Number</FormLabel>
              <FormInput
                id="bank_routing"
                name="bank_routing"
                value={formState.bank_routing}
                onChange={(e) => handleInputChange('bank_routing', e.target.value)}
                required
              />
            </div>
            
            <div>
              <FormLabel htmlFor="bank_account" required>Bank Account Number</FormLabel>
              <FormInput
                id="bank_account"
                name="bank_account"
                value={formState.bank_account}
                onChange={(e) => handleInputChange('bank_account', e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Driver Information Section */}
        <div className="bg-gray-50 p-4 rounded mb-6">
          <h4 className="text-lg font-semibold mb-4 text-[#0F2D52]">Driver Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormLabel htmlFor="driver_license" required>Driver License Number</FormLabel>
              <FormInput
                id="driver_license"
                name="driver_license"
                value={formState.driver_license}
                onChange={(e) => handleInputChange('driver_license', e.target.value)}
                required
              />
            </div>
            
            <div>
              <FormLabel htmlFor="state" required>State</FormLabel>
              <select
                id="state"
                name="state"
                value={formState.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0F2D52]"
                required
              >
                <option value="">Select State</option>
                <option value="AL">Alabama</option>
                <option value="AK">Alaska</option>
                <option value="AZ">Arizona</option>
                <option value="AR">Arkansas</option>
                <option value="CA">California</option>
                <option value="CO">Colorado</option>
                <option value="CT">Connecticut</option>
                <option value="DE">Delaware</option>
                <option value="FL">Florida</option>
                <option value="GA">Georgia</option>
                <option value="HI">Hawaii</option>
                <option value="ID">Idaho</option>
                <option value="IL">Illinois</option>
                <option value="IN">Indiana</option>
                <option value="IA">Iowa</option>
                <option value="KS">Kansas</option>
                <option value="KY">Kentucky</option>
                <option value="LA">Louisiana</option>
                <option value="ME">Maine</option>
                <option value="MD">Maryland</option>
                <option value="MA">Massachusetts</option>
                <option value="MI">Michigan</option>
                <option value="MN">Minnesota</option>
                <option value="MS">Mississippi</option>
                <option value="MO">Missouri</option>
                <option value="MT">Montana</option>
                <option value="NE">Nebraska</option>
                <option value="NV">Nevada</option>
                <option value="NH">New Hampshire</option>
                <option value="NJ">New Jersey</option>
                <option value="NM">New Mexico</option>
                <option value="NY">New York</option>
                <option value="NC">North Carolina</option>
                <option value="ND">North Dakota</option>
                <option value="OH">Ohio</option>
                <option value="OK">Oklahoma</option>
                <option value="OR">Oregon</option>
                <option value="PA">Pennsylvania</option>
                <option value="RI">Rhode Island</option>
                <option value="SC">South Carolina</option>
                <option value="SD">South Dakota</option>
                <option value="TN">Tennessee</option>
                <option value="TX">Texas</option>
                <option value="UT">Utah</option>
                <option value="VT">Vermont</option>
                <option value="VA">Virginia</option>
                <option value="WA">Washington</option>
                <option value="WV">West Virginia</option>
                <option value="WI">Wisconsin</option>
                <option value="WY">Wyoming</option>
              </select>
            </div>
          </div>
        </div>

        {/* Signature Section */}
        <div className="bg-gray-50 p-4 rounded mb-6">
          <h4 className="text-lg font-semibold mb-4 text-[#0F2D52]">Parent Signature</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormLabel htmlFor="parent_sign_ach" required>Parent Signature</FormLabel>
              <FormInput
                id="parent_sign_ach"
                name="parent_sign_ach"
                value={formState.parent_sign_ach}
                onChange={(e) => handleInputChange('parent_sign_ach', e.target.value)}
                required
              />
            </div>
            
            <div>
              <FormLabel htmlFor="parent_sign_date_ach" required>Date</FormLabel>
              <FormInput
                id="parent_sign_date_ach"
                name="parent_sign_date_ach"
                type="date"
                value={formState.parent_sign_date_ach || new Date().toISOString().split('T')[0]}
                onChange={(e) => handleInputChange('parent_sign_date_ach', e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-[#0F2D52] text-white rounded hover:opacity-80"
          >
            Save & Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuthorizationForm;