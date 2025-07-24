import React, { useState } from 'react';
import CheckboxWithLabel from "./CheckboxWithLabel";

export default function SocialMediaReleaseForm({initialFormData = null, childId}) {
  const [approval, setApproval] = useState(initialFormData.approve_social_media_post);
  const [printedName, setPrintedName] = useState(initialFormData.printed_name_social_media_post);
  const [agreed, setAgreed] = useState(initialFormData.do_you_agree_this_social_media_post == 'on');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (approval && printedName && agreed) {
      alert('Form submitted successfully!');
    } else {
      alert('Please complete all fields.');
    }
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


    const handleSave = async () => {
    if (!childId) {
      alert('Error: Child ID is missing');
      return;
    }

    try {
      // Prepare the complete form data for API call including child_id
      const saveData = {
        child_id: childId,
        approve_social_media_post: approval,
        printed_name_social_media_post: printedName,
        do_you_agree_this_social_media_post: agreed ? 'on' : 'off'
      };

      // Call the API to save all form data
      await updateAdmissionData(saveData);
      
      // Show success alert
      alert('Admission form data saved successfully!');
    } catch (error) {
      console.error('Failed to save Admission form:', error);
      alert('Error saving Admission form data. Please try again.');
    }
  };

  return (
    <>
      <h1 className='text-center my-5 py-3 text-3xl text-white headerstyle' style={{ backgroundColor: '#0F2D52' }}>Photo Release For Social Media</h1>
      <div className="flex justify-center px-4 py-6 sm:py-10">
        <form
          onSubmit={handleSubmit}
          className="w-full bg-white "
        >
          {/* Header */}


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
                  checked={approval}
                  onChange={() => setApproval(!approval)}
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
                onClick={handleSave}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
