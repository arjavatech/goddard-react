
import React, { useState, useEffect } from 'react';

import { DownIcon,UpIcon } from '../../../../components/common/Arrows';
const StatementOfConfidentiality = ({fieldValue, openSection, setOpenSection, handleChange: parentHandleChange }) => {
  // Initialize the checkbox state based on fieldValue
  const [isChecked, setIsChecked] = useState(fieldValue == 'on');

  // Update checkbox state when fieldValue changes from parent
  useEffect(() => {
    setIsChecked(fieldValue == 'on');
  }, [fieldValue]);

  // Handle change and update parent state
  const handleChange = (e) => {
    const checked = e.target.checked;
    setIsChecked(checked);
    
    // Update parent form data
    if (parentHandleChange) {
      parentHandleChange({
        target: {
          name: 'medical_care_provider_agreement',
          value: checked ? 'on' : 'off'
        }
      });
    }
  };
    const isOpen = openSection === 'StatementOfConfidentiality';

    const headerClasses = `border bg-blue-50 px-6 py-4 flex items-center justify-between cursor-pointer 
        hover:bg-slate-700 hover:text-white ${isOpen ? 'bg-slate-700 text-white' : 'text-slate-700'}`;

    return (
        <>
            <div
                className={headerClasses}
                onClick={() => setOpenSection(isOpen ? '' : 'StatementOfConfidentiality')}
            >
                <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-semibold">Statement Of Confidentiality</h2>
                </div>
                <div className="text-xl transform transition-transform duration-200">
                    {isOpen ? <DownIcon className="h-5 w-5 text-gray-500" /> : <UpIcon className="h-5 w-5 text-black" />}
                </div>
            </div>

            {isOpen && (
                <div className="border p-6 space-y-6 bg-gray-50" onClick={(e) => e.stopPropagation()}>
                    {/* Additional Parent/Legal Guardian Name */}
                    <div
      className="w-full h-auto mx-auto p-6 text-left text-justify text-gray-700 font-semibold"
      style={{ height: "80%", width: "100%", textAlign: "justify" }}
    >
      <h1 className="text-2xl font-bold mb-4 text-center">
      STATEMENT OF CONFIDENTIALITY
      </h1>

      <p className="text-base leading-relaxed mt-4">
        As a professional organization you can be assured all information regarding your family’s 
        needs, file contents and handling, medical information, and conversations, will be handled 
        with the appropriate confidentiality. Information will be shared only with those people
         requiring the knowledge to better serve your family.
      </p>

    
      <h1 className="text-2xl font-bold mb-4 text-center mt-5">
      NON-DISCRIMINATION
      </h1>

      <p className="mt-5">
      The Goddard School <sup>®</sup> located in Lynnwood, WA will not discriminate against students, 
      parents, or staff. We believe that our students have the right to learn and play in 
      an environment that is free from all forms of discrimination. Consistent with applicable
       laws and The Goddard School’s philosophy, we make all decisions involving enrollment at
        The Goddard School® without regard to race, creed, religion, color, age, sex, national 
        origin, citizenship, disability, or any other characteristic protected under local, 
        state, or federal law. You are encouraged to raise any questions regarding your equal
         opportunity at The Goddard School.
      </p>


      <h1 className="text-2xl font-bold mb-4 text-center mt-5">
      ATTENDANCE
      </h1>

      <p className="mt-4">
      A parent should notify The Goddard School® by 9:00 AM by calling 425-882-1100 whenever
       a child is late or will not be attending on a scheduled day. Teachers attempt to wait 
       until everyone has arrived to begin circle time, so timely notification is appreciated.
        The school should be notified, as soon as possible, if a child is ill, which enables our 
        staff to track any illness that may occur at the school. We reserve the right to deny entry
         and attendance if a child arrives after 10am without informing and checking in with school admins.
      </p>

      <label className="flex items-center space-x-2 text-lg font-medium mt-5">
        <input
          type="checkbox"
                                checked={isChecked}
                                onChange={handleChange}
          className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded"
        />
        <span>
          I agree <strong>all the above information</strong>.
        </span>
      </label>
    </div>
                </div>
            )}
        </>
    );
};

export default StatementOfConfidentiality;
