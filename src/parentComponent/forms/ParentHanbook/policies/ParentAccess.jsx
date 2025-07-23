
import React, { useState, useEffect } from 'react';

import { DownIcon,UpIcon } from '../../../../components/common/Arrows';
const ParentAccess = ({fieldValue, openSection, setOpenSection, handleChange: parentHandleChange }) => {
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
          name: 'parent_access_agreement',
          value: checked ? 'on' : 'off'
        }
      });
    }
  };
  
    const isOpen = openSection === 'ParentAccess';

    const headerClasses = `border bg-blue-50 px-6 py-4 flex items-center justify-between cursor-pointer 
        hover:bg-slate-700 hover:text-white ${isOpen ? 'bg-slate-700 text-white' : 'text-slate-700'}`;

    return (
        <>
            <div
                className={headerClasses}
                onClick={() => setOpenSection(isOpen ? '' : 'ParentAccess')}
            >
                <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-semibold">Parent Access</h2>
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
      PARENT ACCESS
      </h1>

      <p className="text-base leading-relaxed mt-4">
      A parent of a child enrolled in The Goddard School®, shall be permitted free access, without prior
       notice, throughout the school whenever the child is in attendance. In cases where the Family 
       Court or other legal entities have established visitation or custody rights, a copy of the 
       orders must be provided to The Goddard School®. The orders of the court will be strictly
        followed unless the custodial parent requests a more liberal variation of the court order, 
        which must be in writing. Visitors when accompanied by a student’s parent are asked to schedule 
        appointments and are allowed in the childcare areas only at the discretion of the Director 
        and/or Owner. Visitors will be accompanied by a staff member at all times.
      </p>

    
      <h1 className="text-2xl font-bold mb-4 text-center mt-5">
      PARKING AND SPEED LIMIT

      </h1>

      <p className="mt-5">
      The speed limit through the parking area is 5 mph. Parent parking is in front of the building.
       Parents should not park in the fire lane, as this is reserved for emergency vehicles.
        Handicap spaces, by Washington State law, must be reserved for vehicles displaying an 
        approved handicap placard. It is unlawful to park in a handicapped designated parking 
        space without a state issued placard. For the safety of all, children must be accompanied
         by a parent into the building, using the front door. Children should be held by the hand
          when walking to or from the building while in the parking lot.
      </p>

      <p className="mt-4">Please do not leave any child in your vehicle unattended when dropping off or picking up 
      siblings. Doing so is unsafe and should never happen per RCW 10.52.215.</p>

      <h1 className="text-2xl font-bold mb-4 text-center mt-5">
   ARRIVAL AND DEPARTURE
      </h1>

      <p className="mt-4">
      Upon arrival each morning, children must be signed in using the electronic devices in the foyer.
       Children are to be escorted to their designated classroom area and delivered to the supervising
        staff member. Children are required by law to be under adult supervision at all times. Do not
         leave any child in a classroom, playground, or common area unattended at any time. Parental 
         involvement will help the child settle quickly into the morning routine. The staff will do 
         anything that they can to assist in a smooth transition. The Goddard School® discourages
          parents from “sneaking out” of the school.
      </p>

     <p className="mt-4">Children attending our program should be settled and ready to begin no later than 
        10:00 AM. Late arrivals may make a child feel left out since their classmates will already be 
        involved in the day’s activities. Late arrivals also cause a disruption to the other children 
        already in attendance. All late arrivals require preapproval from the administrative staff.
         We reserve the right not to accept late arrivals without proper notification.</p>


    <p className="mt-4">

    When picking up individual children at the end of the day, parents must sign their children out on 
    the appropriate electronic device in the foyer. Attendance is reviewed by Washington State licensing 
    personnel and is used to determine staffing requirements.
    </p>


    <p className="mt-4"> At pickup/drop off times, please ensure that you are with your child at all times 
        on school property. For example, running through the hallway, parking lots, adult bathrooms, etc. 
        will not be allowed. Once a child is removed from the supervising staff member it becomes the
         responsibility of the person picking up your child to provide supervision. We advise all parents
          and guardians to guide your child by hand while in the parking lot for the safety of all.</p>





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

export default ParentAccess;
