import React, { useState } from 'react';
import CheckboxWithLabel from "./CheckboxWithLabel";

const SecurityPolicy = () => {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="flex justify-center px-4 py-6 sm:py-8 md:py-10 lg:py-12 bg-gray-100 min-h-screen">
      <div className="w-full max-w-4xl border-2 border-[#0F2D52] shadow-md bg-white overflow-hidden">
        
        {/* Header */}
        <h4 className="text-center text-white bg-[#0F2D52] py-4 sm:py-5 text-xl sm:text-2xl font-semibold tracking-wide">
          Security Release & Policy Acknowledgement
        </h4>

        {/* Policy Text */}
        <div className="px-4 sm:px-6 md:px-10 py-6 space-y-6 text-justify text-base font-medium text-gray-800">
          <p>
            I understand that The Goddard School® has installed security cameras in the foyer and around the outside perimeter of the building.
            I also understand that while attending The Goddard School®, my child may be videotaped by a security camera.
          </p>
          <p>
            I recognize that I may also be videotaped by a security camera while at or around the school premises. I will notify each person
            listed on the Application for Admission that he or she may be also videotaped while at or around the school premises.
          </p>
        </div>

        {/* Sign Off Header */}
        <h4 className="text-center font-bold text-lg sm:text-xl mt-4">
          Policy Sign Off
        </h4>

        {/* Final Statement */}
        <p className="px-4 sm:px-6 md:px-10 py-4 text-justify text-base font-medium text-gray-800">
          My signature below confirms my understanding of the Enrollment Agreement, school policies, my tuition obligation, my responsibility
          for the payment of fees, and confirms that I have received and read a copy of the parent handbook.
        </p>

        {/* Checkbox */}
        <div className="px-4 sm:px-6 md:px-10 pb-4">
          <CheckboxWithLabel
            id="agreeCheckbox"
            checked={agreed}
            onChange={setAgreed}
            label="I agree to the Security Release & Policy Acknowledgement."
          />
        </div>

        {/* Save Button */}
        <div className="text-center pb-6">
          <button
            className="bg-[#0F2D52] hover:bg-[#093567] text-white font-semibold px-8 py-2"
            disabled={!agreed}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecurityPolicy;
