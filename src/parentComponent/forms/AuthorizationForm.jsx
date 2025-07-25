import React, { useState, useEffect } from 'react';

const AuthorizationForm = ({ selectedSubForm = null, initialFormData = null, childId = null }) => {
  
  // API function to update authorization form data
  const updateAuthorizationData = async (fieldData) => {
    if (!childId) {
      console.error('Child ID is required for API update');
      return;
    }

    try {
      const response = await fetch(`https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/authorization_form/update/${childId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fieldData)
      });

      if (!response.ok) {
        throw new Error(`Failed to update authorization data: ${response.status}`);
      }

      const result = await response.json();
      console.log('Authorization data updated successfully:', result);
      return result;
    } catch (error) {
      console.error('Error updating authorization data:', error);
      throw error;
    }
  };
  const [formData, setFormData] = useState({
    child_id: '',
    bank_routing: '',
    bank_account: '',
    driver_license: '',
    state: '',
    i: '',
    parent_sign_ach: '',
    parent_sign_date_ach: '',
    admin_sign_ach: '',
    admin_sign_date_ach: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

     if (name === 'admin_sign_date_ach') {
      const epochValue = new Date(value).getTime();
      formData.admin_sign_date_ach = epochValue;
      console.log('Epoch time in ms:', epochValue); // You can store or send this to backend
    }

    
    // Update local state only - no API call
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Completion validation functions for each sub-form
  const isACHFormComplete = () => {
    const requiredFields = ['bank_routing', 'bank_account', 'driver_license', 'state'];
    return requiredFields.every(field => 
      formData[field] && formData[field].toString().trim() !== ''
    );
  };

  const isParentSignatureComplete = () => {
    return formData.parent_sign_ach && formData.parent_sign_ach.toString().trim() !== '';
  };

  const isAdminSignatureComplete = () => {
    return formData.admin_sign_ach && formData.admin_sign_ach.toString().trim() !== '' &&
           formData.admin_sign_date_ach && formData.admin_sign_date_ach.toString().trim() !== '';
  };

  const handleSave = async () => {
    if (!childId) {
      alert('Error: Child ID is missing');
      return;
    }

    try {
      // Prepare the complete form data for API call including child_id
      const saveData = {
        child_id: childId,
        bank_routing: formData.bank_routing,
        bank_account: formData.bank_account.toString(),
        driver_license: formData.driver_license,
        state: formData.state,
        i: formData.i
      };

      // Call the API to save all form data
      await updateAuthorizationData(saveData);
      
      // Show success alert
      alert('Authorization form data saved successfully!');
    } catch (error) {
      console.error('Failed to save authorization form:', error);
      alert('Error saving authorization form data. Please try again.');
    }
  };

  const handleSubmit = async (type) => {
    // Handle submit functionality
    if (type === 'parent') {

      if (!childId) {
      alert('Error: Child ID is missing');
      return;
    }

    try {
      if(formData.parent_sign_ach == null || formData.parent_sign_ach == '')
      {
        alert('Error: Parent Sign is missing');
        return;
      }
      // Prepare the complete form data for API call including child_id
      const saveData = {
        child_id: childId,
        parent_sign_ach: formData.parent_sign_ach,
        parent_sign_date_ach: new Date().toLocaleDateString('en-CA')
      };

      // Call the API to save all form data
      await updateAuthorizationData(saveData);
      
      // Show success alert
      alert('Authorization form data saved successfully!');
    } catch (error) {
      console.error('Failed to save authorization form:', error);
      alert('Error saving authorization form data. Please try again.');
    }
    } else if (type === 'admin') {

      if (!childId) {
      alert('Error: Child ID is missing');
      return;
    }

    try {
      if(formData.admin_sign_ach == null || formData.admin_sign_ach == '')
      {
        alert('Error: Parent Sign is missing');
        return;
      }
      const epochValue = new Date(formData.admin_sign_date_ach).getTime();
      // Prepare the complete form data for API call including child_id
      const saveData = {
        child_id: childId,
        admin_sign_ach: formData.admin_sign_ach,
        admin_sign_date_ach: epochValue
      };

      // Call the API to save all form data
      await updateAuthorizationData(saveData);
      
      // Show success alert
      alert('Authorization form data saved successfully!');
    } catch (error) {
      console.error('Failed to save authorization form:', error);
      alert('Error saving authorization form data. Please try again.');
    }
  }
   
  };

  useEffect(() => {
    setFormData(prevState => ({
      ...prevState,
      parent_sign_date_ach: new Date().toISOString().split('T')[0]
    }));
  }, []);

  useEffect(() => {
    if (initialFormData) {
      setFormData(prevState => ({
        ...prevState,
        ...initialFormData
      }));
    }
  }, [initialFormData]);

  // Function to determine which sub-form to show
  const getSubFormToShow = () => {
    if (!selectedSubForm) {
      return 'ach'; // Show first form (ACH) by default instead of 'all'
    }
    
    switch (selectedSubForm.toLowerCase()) {
      case 'authorization ach':
        return 'ach';
      case 'parent signature':
        return 'parent';
      case 'admin signature':
        return 'admin';
      default:
        return 'ach'; // Default to first form
    }
  };

  const currentSubForm = getSubFormToShow();

  // Authorization ACH Form Component
  const renderACHForm = () => (
    <div id="authorizationach" className="container tab-pane bg-white shadow-lg rounded mb-4">
      <div className="card">
        <h4 className="flex items-center justify-center space-x-3 bg-[#0F2D52] text-white p-3 rounded-t">
          <span>Authorization ACH</span>
          <img 
            src={isACHFormComplete() ? "/image/tick.png" : "/image/circle-with.png"} 
            alt={isACHFormComplete() ? "Complete" : "Incomplete"} 
            className="w-5 h-5"
          />
        </h4>
        <div className="p-4">
          <div className="container" id="avf_form">
            <section className="wizard-section">
              <div className="row no-gutters">
                <div className="col-lg-12 col-md-12">
                  <div className="form-wizard">
                    <fieldset className="wizard-fieldset">
                      <div className="container">
                        <div className="panel panel-info">
                          <div className="panel-body">
                            <div className="flex flex-wrap -mx-3">
                              <div className="w-full md:w-1/2 px-3 mb-4">
                                <div className="form-group">
                                  <label htmlFor="bank_routing" className="block font-bold mb-2">Bank Routing</label>
                                  <input 
                                    name="bank_routing" 
                                    type="text" 
                                    maxLength="20"
                                    className="form-control border border-gray-300 rounded px-3 py-2 w-full" 
                                    id="bank_routing"
                                    value={formData.bank_routing}
                                    onChange={handleChange}
                                  />
                                </div>
                              </div>
                              <div className="w-full md:w-1/2 px-3 mb-4">
                                <div className="form-group">
                                  <label htmlFor="bank_account" className="block font-bold mb-2">Bank Account</label>
                                  <input 
                                    name="bank_account" 
                                    type="text" 
                                    maxLength="20"
                                    className="form-control border border-gray-300 rounded px-3 py-2 w-full" 
                                    id="bank_account"
                                    value={formData.bank_account}
                                    onChange={handleChange}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-wrap -mx-3">
                              <div className="w-full md:w-1/2 px-3 mb-4">
                                <div className="form-group">
                                  <label htmlFor="driver_license" className="block font-bold mb-2">Driver's License</label>
                                  <input 
                                    name="driver_license" 
                                    type="text" 
                                    maxLength="20"
                                    className="form-control border border-gray-300 rounded px-3 py-2 w-full" 
                                    id="driver_license"
                                    value={formData.driver_license}
                                    onChange={handleChange}
                                  />
                                </div>
                              </div>
                              <div className="w-full md:w-1/2 px-3 mb-4">
                                <div className="form-group">
                                  <label htmlFor="state" className="block font-bold mb-2">State</label>
                                  <select 
                                    className="form-control border border-gray-300 rounded px-3 py-2 w-full" 
                                    id="state" 
                                    name="state" 
                                    value={formData.state}
                                    onChange={handleChange}
                                  >
                                    <option value=""></option>
                                    <option value="AL">Alabama</option>
                                    <option value="AK">Alaska</option>
                                    <option value="AZ">Arizona</option>
                                    <option value="AR">Arkansas</option>
                                    <option value="CA">California</option>
                                    <option value="CO">Colorado</option>
                                    <option value="CT">Connecticut</option>
                                    <option value="DE">Delaware</option>
                                    <option value="DC">Dist of Columbia</option>
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
                            <h5 className="text-lg font-semibold text-center my-4">Statement of authorization</h5>
                            <div className="mb-4">
                              <p className="mb-2">I <input 
                                  type="text" 
                                  className="form-control border border-gray-300 rounded px-3 py-2 inline-block w-40" 
                                  id="i" 
                                  name="i"
                                  value={formData.i}
                                  onChange={handleChange}
                                />
                                hereby authorize (Alphabetz Corp, dba The Goddard School) to charge my above referenced bank account for the invoiced amount once each month on the 1st day of the month until changed by me in writing in the future. This will constitute the paid tuition for my child(ren) during the period designated. For wait-listed/newly enrolled families this is a one-time charge and not a recurring one until they start the school.</p>
                            </div>
                          </div>
                          <p className="font-bold px-3 mb-4">Please provide us 10 days advance notice should you wish to put a stop to this authorization. An automatic electronic authorization of the monthly transaction will take place and an email-generated receipt will be automatically sent to the email address provided to us above. A copy of this document will be scanned and saved in an electronic file, the original will be shredded for your protection.</p>
                          <div className="text-center mb-4">
                            <button 
                              className="bg-[#0F2D52] text-white py-2 px-6 rounded hover:bg-opacity-90 transition-colors" 
                              onClick={handleSave}
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    </fieldset>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );

  // Parent Signature Form Component
  const renderParentSignatureForm = () => (
    <div id="authorizationparentsign" className="container tab-pane bg-white shadow-lg rounded mb-4">
      <div className="card">
        <h2 className="flex items-center justify-center space-x-3 bg-[#0F2D52] text-white p-3 rounded-t">
          <span>Parent Signature</span>
          <img 
            src={isParentSignatureComplete() ? "/image/tick.png" : "/image/circle-with.png"} 
            alt={isParentSignatureComplete() ? "Complete" : "Incomplete"} 
            className="w-5 h-5"
          />
        </h2>
        <div className="flex flex-wrap -mx-3 p-4">
          <div className="w-full md:w-1/2 px-3 mb-4">
            <div className="form-group">
              <label htmlFor="parent_sign_ach" className="block font-bold mb-2">Parent Signature</label>
              <input 
                type="text" 
                className="form-control border border-gray-300 rounded px-3 py-2 w-full" 
                id="parent_sign_ach"
                name="parent_sign_ach"
                value={formData.parent_sign_ach}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="w-full md:w-1/2 px-3 mb-4">
            <div className="form-group">
              <label htmlFor="parent_sign_date_ach" className="block font-bold mb-2">Date</label>
              <input 
                type="date" 
                className="form-control border border-gray-300 rounded px-3 py-2 w-full" 
                id="parent_sign_date_ach"
                name="parent_sign_date_ach"
                value={formData.parent_sign_date_ach}
                onChange={handleChange}
                readOnly
              />
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
      </div>
    </div>
  );

  // Admin Signature Form Component
  const renderAdminSignatureForm = () => (
    <div id="authorizationadminsign" className="container tab-pane bg-white shadow-lg rounded mb-4">
      <div className="card">
        <h2 className="flex items-center justify-center space-x-3 bg-[#0F2D52] text-white p-3 rounded-t">
          <span>Admin Signature</span>
          <img 
            src={isAdminSignatureComplete() ? "/image/tick.png" : "/image/circle-with.png"} 
            alt={isAdminSignatureComplete() ? "Complete" : "Incomplete"} 
            className="w-5 h-5"
          />
        </h2>
        <div className="flex flex-wrap -mx-3 p-4">
          <div className="w-full md:w-1/2 px-3 mb-4">
            <div className="form-group">
              <label htmlFor="admin_sign_ach" className="block font-bold mb-2">Admin Signature</label>
              <input 
                type="text" 
                className="form-control border border-gray-300 rounded px-3 py-2 w-full" 
                id="admin_sign_ach"
                name="admin_sign_ach"
                value={formData.admin_sign_ach}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="w-full md:w-1/2 px-3 mb-4">
            <div className="form-group">
              <label htmlFor="admin_sign_date_ach" className="block font-bold mb-2">Date</label>
              <input 
                type="datetime-local" 
                className="form-control border border-gray-300 rounded px-3 py-2 w-full" 
                id="admin_sign_date_ach"
                name="admin_sign_date_ach"
                value={formData.admin_sign_date_ach}
                onChange={handleChange}
              />
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
      </div>
    </div>
  );

  // Main render logic
  return (
    <div>
      {currentSubForm === 'ach' && renderACHForm()}
      {currentSubForm === 'parent' && renderParentSignatureForm()}
      {currentSubForm === 'admin' && renderAdminSignatureForm()}
    </div>
  );
};

export default AuthorizationForm;
