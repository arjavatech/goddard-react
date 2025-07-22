import React, { useState } from "react";
import CheckboxWithLabel from "./CheckboxWithLabel";

export default function MedicalTransportationWaiver() {
  const [studentName, setStudentName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSave = () => {
    setSubmitted(true);
    if (studentName && agreed) {
      alert("Form saved successfully!");
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
