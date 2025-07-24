import React, { useState, useEffect } from 'react';
import CheckboxWithLabel from './CheckboxWithLabel';

export default function VideoPermission({ initialFormData = null, childId = null }) {
  const [agreePhotos, setAgreePhotos] = useState(false);
  const [agreeGroup, setAgreeGroup] = useState(false);
  const [photoUsageType, setPhotoUsageType] = useState('');

  // API function to update admission form data
  const updateAdmissionData = async (fieldData) => {
    if (!childId) {
      console.error('Child ID is required for API update');
      return;
    }

    try {
      const response = await fetch(`https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/admission_form/update/${childId}`, {
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

  useEffect(() => {
    if (initialFormData) {
      // Map API data to form fields using 'on'/'off' pattern
      setPhotoUsageType(initialFormData.photo_usage_photo_video_permission_form || '');
      setAgreePhotos(initialFormData.photo_permission_agree_group_photos_electronic == 'on');
      setAgreeGroup(initialFormData.do_you_agree_this_photo_video_permission_form == 'on');
    }
  }, [initialFormData]);

  const handleAgreePhotosChange = (checked) => {
    setAgreePhotos(checked);
  };

  const handleAgreeGroupChange = (checked) => {
    setAgreeGroup(checked);
  };

  const handleSave = async () => {
    if (!childId) {
      alert('Error: Child ID is missing');
      return;
    }

    try {
      const saveData = {
        child_id: childId,
        photo_usage_photo_video_permission_form: photoUsageType,
        photo_permission_agree_group_photos_electronic: agreePhotos ? 'on' : 'off',
        do_you_agree_this_photo_video_permission_form: agreeGroup ? 'on' : 'off'
      };

      await updateAdmissionData(saveData);
      alert('Video permission data saved successfully!');
    } catch (error) {
      console.error('Failed to save video permission:', error);
      alert('Error saving video permission data. Please try again.');
    }
  };

  return (
    <>
      <h1 className='text-center my-5 py-3 text-3xl text-white headerstyle' style={{ backgroundColor: '#0F2D52' }}>Consent to Photograph</h1>
      <div className="flex justify-center ">
        <div className="w-full overflow-hidden">

          {/* Content Section */}
          <div className="px-4 sm:px-6 md:px-10 py-6 sm:py-8 space-y-6 text-base leading-relaxed font-medium text-gray-900">
            {/* Consent Section */}
            <div>
              <h4 className="text-center text-lg font-bold mb-4"></h4>
              <p className="text-justify font-semibold mb-6">
                I consent to The Goddard School® taking photographs and videos of my child, who are identified below.
                For value received and without additional consideration, I agree that all photographs and video footage
                of my child taken at The Goddard School may be used at any time by The Goddard School or Goddard Systems,
                Inc. for the purposes of illustration, advertising and publicity, in any manner or in any form,
                including in broadcast, print, electronic and social media.
              </p>

              {/* Dropdown */}
              <div className="mb-6 flex justify-center">
                <div className="w-full max-w-[280px]">
                  <label className="font-semibold block mb-2">Select One</label>
                  <div className="relative">
                    <select 
                      className="w-full border border-red-500 rounded px-4 py-2 appearance-none pr-10"
                      value={photoUsageType}
                      onChange={(e) => setPhotoUsageType(e.target.value)}
                    >
                      <option value="" disabled hidden></option>
                      <option value="Full Use">Full Use</option>
                      <option value="In-House Only">In-House Only*</option>
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <i className="fas fa-chevron-down text-gray-500"></i>
                    </div>
                  </div>
                </div>
              </div>

              <p className="font-bold mb-6 text-justify">
                *In-house only includes photos used in the classroom or hallways and photos taken for and through
                electronic daily report tools, such as Kaymbu.
              </p>
            </div>

            {/* Group Photos Section */}
            <div>
              <h4 className="text-center text-lg font-bold mb-4">Group Photos in Electronic Daily Activity Reports</h4>
              <p className="text-justify font-semibold mb-6">
                The Goddard School takes photos of individual children and groups of children for electronic daily
                activity reports. These photos will not be used for any other purpose by The Goddard School or Goddard
                Systems, Inc. Although we have a School policy against it, it is possible for individuals who receive
                group photos in an electronic daily activity report to share these group photos through their personal
                social media accounts. For this reason, we ask that you specifically authorize whether we can include
                your child in any group photos shared through the electronic daily activity reports.
              </p>

              <CheckboxWithLabel
                id="agreePhotos"
                checked={agreePhotos}
                onChange={handleAgreePhotosChange}
                label="I agree to have individual photos of my child and photos of group activities that include my child shared through the School's electronic daily activity reports."
              />
            </div>

            {/* Agreement Not to Post */}
            <div>
              <h4 className="text-center text-lg font-bold mb-4 mt-8">Agreement Not to Post Photos of Other Children</h4>
              <CheckboxWithLabel
                id="agreeGroup"
                checked={agreeGroup}
                onChange={handleAgreeGroupChange}
                label="I agree that I will not post or use any photographs or videos that I receive from or take at The Goddard School that include children other than my own child in print, electronic or social media or any other form. This includes group photos that I receive as part of an electronic daily activity report. My agreement extends to photos or videos taken by any member of my family or any visitors that I bring to The Goddard School."
              />
            </div>

            {/* Save Button */}
            <div className="text-center pt-6">
              <button 
                className="bg-[#0F2D52] hover:bg-[#093567] text-white font-semibold px-8 py-2"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
