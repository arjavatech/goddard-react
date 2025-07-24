import React, { useState } from 'react';
import CheckboxWithLabel from './CheckboxWithLabel';

const PickUpPassword = ({initialFormData = null, childId = null}) => {
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);

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

  // Initialize form data from props
  React.useEffect(() => {
    if (initialFormData) {
      setPassword(initialFormData.child_password_pick_up_password_form ?? '');
      setAgree(initialFormData.do_you_agree_this_pick_up_password_form == 'on');
    }
  }, [initialFormData]);

  const handleSave = async () => {
    if (!childId) {
      alert('Error: Child ID is missing');
      return;
    }

    if (!password || !agree) {
      alert('Please enter the password and agree to the instructions.');
      return;
    }

    try {
      const saveData = {
        child_id: childId,
        child_password_pick_up_password_form: password,
        do_you_agree_this_pick_up_password_form: agree ? 'on' : 'off'
      };

      await updateAdmissionData(saveData);
      alert('Pick-up password saved successfully!');
    } catch (error) {
      console.error('Failed to save pick-up password:', error);
      alert('Error saving pick-up password. Please try again.');
    }
  };

  return (
    <>
      <h1 className='text-center my-5 py-3 text-3xl text-white headerstyle' style={{ backgroundColor: '#0F2D52' }}>Pick-up Password</h1>
      <div className="flex justify-center px-4 py-8 sm:py-8 md:py-6 lg:py-4">
        <div className="w-full overflow-hidden">
          {/* Header */}
         

          {/* Content */}
          <div className="px-4 sm:px-6 md:px-10 py-6 sm:py-8 space-y-6 text-base leading-relaxed font-medium text-gray-900">
            <p className="text-justify">
              It is part of The Goddard School® security policy to have a password that is given to anyone
              whom you designate as an authorized pick-up for your child. Your child will be released to
              this authorized person only if the following conditions have been met:
            </p>

            <ol className="list-decimal pl-6 space-y-4 text-justify">
              <li>
                The Director must be notified in writing, either at the time of enrollment, or in advance of
                the pick-up, that you are authorizing someone other than yourself to pick up your child. If
                you telephone the school to authorize a pick-up, be prepared to receive a return phone call
                to verify the information.
              </li>
              <li>
                At the time of notification, you will need to give us the authorized individual’s full name
                and his/her approximate time of arrival so we can then notify the staff.
              </li>
              <li>
                The authorized individual must show two forms of identification (one must be a photo ID) and
                tell the Owner or Director the password you have designated below.
              </li>
            </ol>

            <p className="text-justify">
              The password is an added measure of security for your family and will be kept with your child’s
              emergency information.
            </p>

            {/* Password Field */}
            <div className="flex justify-center pt-4">
              <div className="w-full sm:w-4/5 md:w-2/3">
                <label htmlFor="pickupPassword" className="block text-md font-bold mb-2">
                  Password
                </label>
                <input
                  id="pickupPassword"
                  name="pickupPassword"
                  type="text"
                  maxLength="5"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="(5 digits, alphanumeric)"
                  className="w-full border border-red-500 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F2D52] text-base"

                />
              </div>
            </div>

            {/* Checkbox */}
            <CheckboxWithLabel
              id="agreeCheckbox"
              checked={agree}
              onChange={setAgree}
              label="I agree pick-up password instructions."
            />

            {/* Save Button */}
            <div className="text-center pt-6">
              <button
                onClick={handleSave}
                className="bg-[#0F2D52] hover:bg-[#093567] text-white font-semibold px-8 py-2 "
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PickUpPassword;
