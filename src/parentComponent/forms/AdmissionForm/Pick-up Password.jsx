import React, { useState } from 'react';
import CheckboxWithLabel from './CheckboxWithLabel';

const PickUpPassword = () => {
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);

  const handleSave = () => {
    if (!password || !agree) {
      alert('Please enter the password and agree to the instructions.');
      return;
    }
    // console.log('Saved:', { password, agree });
  };

  return (
    <div className="flex justify-center px-4 py-6 sm:py-8 md:py-10 lg:py-14 bg-gray-100 min-h-screen">
      <div className="w-full max-w-4xl border-2 border-[#0F2D52] bg-white shadow-lg overflow-hidden">
        {/* Header */}
        <h4 className="text-center text-white bg-[#0F2D52] py-4 sm:py-5 text-xl sm:text-2xl font-semibold tracking-wide">
          Pick-up Password
        </h4>

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
  );
};

export default PickUpPassword;
