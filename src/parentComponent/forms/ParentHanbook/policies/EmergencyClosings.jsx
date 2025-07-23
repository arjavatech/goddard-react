import React, { useState, useEffect } from 'react';
import { DownIcon,UpIcon } from '../../../../components/common/Arrows';
const EmergencyClosings = ({fieldValue, openSection, setOpenSection, handleChange: parentHandleChange }) => {
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
          name: 'affiliation_policy_agreement',
          value: checked ? 'on' : 'off'
        }
      });
    }
  };

    const isOpen = openSection === 'EmergencyClosings';

    const headerClasses = `border bg-blue-50 px-6 py-4 flex items-center justify-between cursor-pointer 
      hover:bg-slate-700 hover:text-white ${isOpen ? 'bg-slate-700 text-white' : 'text-slate-700'}`;

    return (
        <>
            <div
                className={headerClasses}
                onClick={() =>
                    setOpenSection(isOpen ? '' : 'EmergencyClosings')
                }
            >
                <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-semibold">Emergency Closings , Religious Affiliation ans Policies</h2>
                </div>
                <div className="text-xl transform transition-transform duration-200">
                    {isOpen ? <DownIcon className="h-5 w-5 text-gray-500" /> : <UpIcon className="h-5 w-5 text-black" />}
                </div>
            </div>

            {isOpen && (
                <div
                    className="border p-6 space-y-6 bg-gray-50"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div
                        className="w-full h-auto mx-auto p-6 text-left  text-justify text-gray-700 font-semibold"
                        style={{
                            height: '80%',
                            width: '100%',
                            textAlign: 'justify',
                        }}
                    >
                        {/* --- REST TIME --- */}
                        <h1 className="text-2xl font-bold mb-4 text-center">
                        EMERGENCY CLOSINGS
                        </h1>

                        <p className="text-base leading-relaxed mt-4">
                        The Goddard School® will make every effort to open on time and remain open in the event of inclement weather. However, in the case of extremely dangerous road conditions or states of emergency, it may be necessary for the school to cancel school or delay the opening time or early dismissal. We will send Kaymbu, Emails and Text Messages out as soon as possible. Should parents be prevented by weather conditions from reaching the facility to pick up their children, please make plans for an alternate pick-up. Closing staff members will care for the children and maintain proper staff-child ratio, until such time as the parents can safely reach the school.
                        </p>


                        <p className="text-base leading-relaxed mt-6">Should the building require emergency evacuation, the staff-child ratios will be maintained, and the children will be evacuated to a nearby location. Each staff member responsible for a group of children will carry emergency contact information and class attendance records with them to the new site. Parents will be contacted by telephone as to the location of the children, or by radio broadcast if phone transmission is not possible, depending on circumstances, parents may be requested to pick up their children, or arrange for the emergency contact person to pick up their children.</p>

   <h1 className="text-2xl font-bold mb-4 text-center mt-6">
   RELIGIOUS AFFILIATION
                        </h1>

                        <p className="mt-4">
                        The Goddard School located in Lynnwood, WA claims to have no association with a church or religious affiliation. Our staff abides by The Goddard School guidelines for the separation of church and school.
                        </p>


 <h1 className="text-2xl font-bold mb-4 mt-6 text-center">
 POLICIES
                        </h1>

                        <p className="mt-4">This handbook of policies and procedures is reviewed by the Owner and Director annually or upon state regulatory changes. Should changes occur, you will be notified of the changes and the effective date of the changes.
                            </p>

                        <p className="mt-4">
                        Additionally, all policies are available in the Owner’s Office as well as on Goddard Family Connect, including the Bloodborne Pathogens Policy and the Pesticide Policy are included.</p>



                      


    






                        {/* Checkbox */}
                        <label className="flex items-center space-x-2 text-lg font-medium mt-6">
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

export default EmergencyClosings;
