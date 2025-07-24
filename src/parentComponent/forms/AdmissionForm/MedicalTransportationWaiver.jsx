import React, { useState } from "react";
import CheckboxWithLabel from "./CheckboxWithLabel";

export default function MedicalTransportationWaiver({initialFormData = null, childId = null}) {
  const [studentName, setStudentName] = useState(initialFormData.med_technicians_med_transportation_waiver ?? '');
  const [agreed, setAgreed] = useState(initialFormData.medical_transportation_waiver == 'on');
  const [submitted, setSubmitted] = useState(false);

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
      setStudentName(initialFormData.med_technicians_med_transportation_waiver ?? '');
      setAgreed(initialFormData.medical_transportation_waiver == 'on');
    }
  }, [initialFormData]);

  const handleSave = async () => {
    if (!childId) {
      alert('Error: Child ID is missing');
      return;
    }

    if (!studentName || !agreed) {
      alert('Please enter the student name and agree to the waiver.');
      return;
    }

    try {
      const saveData = {
        child_id: childId,
        med_technicians_med_transportation_waiver: studentName,
        medical_transportation_waiver: agreed ? 'on' : 'off'
      };

      await updateAdmissionData(saveData);
      alert('Medical transportation waiver saved successfully!');
    } catch (error) {
      console.error('Failed to save medical transportation waiver:', error);
      alert('Error saving medical transportation waiver. Please try again.');
    }
  };

  return (
    <>
      <h1 className='text-center my-5 py-3 text-3xl text-white headerstyle' style={{ backgroundColor: '#0F2D52' }}>Medical Transportation Waiver</h1>
      <div className="flex justify-center px-4 py-8 sm:py-8 md:py-6 lg:py-4">
        <div className="w-full overflow-hidden">


          {/* Content */}
          <div className="px-4 sm:px-6 md:px-10 py-6 space-y-6 text-justify text-base font-medium text-gray-800">
            <p>
              The undersigned authorizes representatives of The Goddard School® to contact Emergency Medical Technicians to transport{" "}
              <input
                type="text"
                className={`inline-block w-full sm:w-[220px] mt-2 sm:mt-0 sm:ml-2 border-2 px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F2D52] ${submitted && !studentName ? "border-red-500" : "border-red-500"
                  }`}
                placeholder="Student name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />{" "}
              (“Student”) to receive medical care, if such transportation/care is deemed necessary.
            </p>

            <p>
              The undersigned irrevocably releases any claims, demands, actions or causes of action against The Goddard School®, its franchisor,
              Goddard Systems, Inc., and their respective representatives and employees, which arise out of or relate to the transportation
              of Student and any medical care provided.
            </p>

            <p>
              This authorization and waiver shall remain effective until Student withdraws from The Goddard School®.
            </p>

            <CheckboxWithLabel
              id="agreeCheckbox"
              checked={agreed}
              onChange={setAgreed}
              label="I agree to the medical transportation waiver."
            />
          </div>

          {/* Save Button */}
          <div className="text-center pb-6">
            <button
              onClick={handleSave}
              className="bg-[#0F2D52] hover:bg-[#093567] text-white font-semibold px-8 py-2"
              disabled={!studentName || !agreed}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
