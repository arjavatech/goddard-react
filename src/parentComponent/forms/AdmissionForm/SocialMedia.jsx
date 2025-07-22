import React, { useState } from 'react';
import CheckboxWithLabel from "./CheckboxWithLabel";

export default function SocialMediaReleaseForm() {
  const [approval, setApproval] = useState('');
  const [printedName, setPrintedName] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (approval && printedName && agreed) {
      alert('Form submitted successfully!');
    } else {
      alert('Please complete all fields.');
    }
  };

  return (
    <div className="flex justify-center px-4 py-6 sm:py-10 bg-[#e6efff] min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl bg-white border-2 border-[#0F2D52] shadow-md"
      >
        {/* Header */}
        <div className="bg-[#0F2D52] text-white text-center py-4 text-xl sm:text-xl font-semibold">
          Photo Release For Social Media
        </div>

        {/* Social Media Labels */}
        <div className="flex justify-around mt-6 text-xl font-bold">
          <div>Facebook</div>
          <div>Instagram</div>
        </div>

        {/* Consent Text */}
        <div className="px-6 sm:px-10 py-6 text-gray-800 text-justify font-semibold text-[16px] leading-relaxed">
          <p>
            I hereby grant permission for The Goddard School to utilize any photographs and/or video footage of my child, whose name is provided below, for social media purposes. Neither the child's name nor any other identifying details will be mentioned.
          </p>
        </div>

        {/* Radio Options */}
        <div className="px-6 sm:px-10 mb-6">
          <label className="block font-bold mb-2 text-[16px]">Select One:</label>
          <div className="flex flex-col sm:flex-row gap-4 text-[15px]">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="approval"
                value="approve"
                checked={approval === 'approve'}
                onChange={() => setApproval('approve')}
               className="w-5 h-5 accent-[#0F2D52]  focus:ring-[#0F2D52] border-gray-300"


              />
              <span className="ml-2 font-semibold">Approve Social Media Postings</span>
            </label>

            <label className="inline-flex items-center">
              <input
                type="radio"
                name="approval"
                value="deny"
                checked={approval === 'deny'}
                onChange={() => setApproval('deny')}
               
                className="w-5 h-5 accent-[#0F2D52]  focus:ring-[#0F2D52] border-gray-300"


              />
              <span className="ml-2 font-semibold">Do NOT Approve Postings to Social Media</span>
            </label>
          </div>
        </div>

        {/* Printed Name */}
      <div className="px-6 sm:px-10 mb-6">
  <label className="block font-bold mb-2 text-[16px]">Printed Name</label>
  <input
    type="text"
    placeholder="Enter printed name"
    value={printedName}
    onChange={(e) => setPrintedName(e.target.value)}
    className={`w-full px-3 py-2 rounded outline-none transition-colors duration-200 
      ${printedName 
        ? 'border border-gray-300 hover:border-[#0F2D52] focus:border-[#0F2D52] focus:ring-5 focus:ring-[#0F2D52]' 
        : 'border border-red-500 hover:border-[#0F2D52] focus:border-[#0F2D52] focus:ring-5 focus:ring-[#0F2D52]'
      }`}
  />
</div>


        {/* Checkbox */}
        <div className="px-6 sm:px-10 mb-6">
          <CheckboxWithLabel
            id="agreeCheckbox"
            checked={agreed}
            onChange={setAgreed}
            label="I have read this agreement and understand its terms."
          />
        </div>

        {/* Submit Button */}
        <div className="text-center pb-6">
          <button
            type="submit"
            className="bg-[#0F2D52] hover:bg-[#093567] text-white font-semibold px-8 py-2 "
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
