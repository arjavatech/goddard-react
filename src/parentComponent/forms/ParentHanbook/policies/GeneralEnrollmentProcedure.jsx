
import React, { useState, useEffect } from 'react';


const GeneralEnrollmentProcedure = ({fieldValue,  openSection, setOpenSection }) => {
    // Initialize the checkbox state based on fieldValue
  const [isChecked, setIsChecked] = useState(fieldValue == 'on');

  // Optional: convert back to "on"/"off" or boolean
  const handleChange = (e) => {
    setIsChecked(e.target.checked);
    console.log('Updated value:', e.target.checked ? 'on' : 'off');
  };
  
    const isOpen = openSection === 'GeneralEnrollmentProcedure';

    const headerClasses = `border bg-blue-50 px-6 py-4 flex items-center justify-between cursor-pointer 
        hover:bg-slate-700 hover:text-white ${isOpen ? 'bg-slate-700 text-white' : 'text-slate-700'}`;

    return (
        <>
            <div
                className={headerClasses}
                onClick={() => setOpenSection(isOpen ? '' : 'GeneralEnrollmentProcedure')}
            >
                <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-semibold">General & Enrollment Procedure</h2>
                </div>
                <div className="text-xl transform transition-transform duration-200">
                    {isOpen ? '⌄' : '⌃'}
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
                            GENERAL INFORMATION
                        </h1>

                        <p className="text-base leading-relaxed mt-4">
                            The Goddard School<sup>®</sup> located in Lynnwood, WA is part of a multi-state organization of
                            specialized preschool centers founded in 1984. We are licensed by the State of Washington
                            Department of Early Learning.
                        </p>

                        <p className="mt-4">
                            The Goddard School<sup>®</sup> is open 12 months a year from 7:00 AM to 6:00 PM Monday through Friday.
                            You will be asked to designate your child’s hours of attendance at the time of enrollment.
                            Please note, Washington State mandates the maximum length of time a child can be in a childcare
                            center at 10 hours per day. Our school policy follows the 10-hour maximum rule and will apply
                            fees to ensure adherence to this rule. A school-closing schedule including holidays, parent-teacher
                            conferences and teacher in-service days will be provided at the time of enrollment.
                        </p>

                        <h1 className="text-2xl font-bold mb-4 text-center mt-5">
                            ENROLLMENT PROCEDURE - CLASS PLACEMENT
                        </h1>

                        <p className="mt-5">
                            Enrollment is open to any child six (6) weeks to six (6) years of age, provided The Goddard
                            School<sup>®</sup> can meet his/her needs. Enrollment is granted without discrimination with
                            regard to sex, race, color, religion, or political belief.
                        </p>

                        <p className="mt-4">
                            Interested families are invited to tour the center, meet the staff, review, and complete all
                            paperwork prior to enrollment. Upon receipt of the completed application and registration
                            fee, placement will occur on a first-come, first-serve basis. Prior to a child’s attendance,
                            a school visit with the parent and child is requested to acquaint each new family with the
                            environment, staff, and schedule for the child. Children are grouped by both age and
                            developmental abilities.
                        </p>

                        <h1 className="text-2xl font-bold mb-4 text-center mt-5">
                            STUDENT RECORDS
                        </h1>

                        <p className="mt-4">
                            Each child enrolled in The Goddard School<sup>®</sup> must have an updated school record
                            with all Washington State and Goddard required forms. This file is confidential, and will
                            be shared with staff members only, as required to meet the needs of the child.
                        </p>

                        <p className="mt-4">
                            Emergency contact information must be reviewed by the parent at least once per calendar year
                            at or before the time the annual enrollment agreement is signed to ensure accuracy. Medical
                            records are required to be updated annually, or whenever the child’s immunization status changes.
                        </p>

                        <p className="mt-4">
                            Upon graduation or withdrawal of a child, a copy of your child’s complete file may be requested
                            in writing. School Districts requests for documents will require written permission for release
                            by the parent.
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

export default GeneralEnrollmentProcedure;
