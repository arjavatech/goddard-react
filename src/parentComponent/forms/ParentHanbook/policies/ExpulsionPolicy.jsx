
import React, { useState, useEffect } from 'react';
import { DownIcon,UpIcon } from '../../../../components/common/Arrows';
const ExpulsionPolicy = ({fieldValue, openSection, setOpenSection, handleChange: parentHandleChange }) => {
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
          name: 'expulsion_policy_agreement',
          value: checked ? 'on' : 'off'
        }
      });
    }
  };

    const isOpen = openSection === 'ExpulsionPolicy';

    const headerClasses = `
    border px-6 py-4 flex items-center justify-between cursor-pointer
    hover:bg-[#0F2D52] hover:text-white
    ${isOpen ? 'bg-[#0F2D52] text-white' : 'bg-blue-100 text-slate-700'}
  `;
  

    return (
        <>
  
            <div
                className={headerClasses}
                onClick={() =>
                    setOpenSection(isOpen ? '' : 'ExpulsionPolicy')
                }
            >
                <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-semibold">Expulsion Policy</h2>
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
                        className="w-full h-auto mx-auto p-6 text-left mt-5 text-justify text-gray-700 font-semibold"
                        style={{
                            height: '80%',
                            width: '100%',
                            textAlign: 'justify',
                        }}
                    >
                        {/* --- REST TIME --- */}
                       
                        <div>
          <h2 className="text-xl font-bold text-center mb-10  text-gray-800 max-sm:text-[17px]">
            EXPULSION POLICY
          </h2>
          
          <p className="text-base mb-6 max-sm:text-[11px] max-sm:-ml-5 max-sm:-mr-5 ">
            At The Goddard School, our primary concern is the safety and well-being of all children and staff members. In the rare event that a child's behavior poses a serious risk to themselves or others, expulsion from our childcare services may be necessary.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-8 text-gray-800 underline max-sm:text-[17px]">
            Criteria for Expulsion:
          </h3>
          
          <p className="text-base mb-4 max-sm:text-[11px] max-sm:-ml-5 max-sm:-mr-5 ">
            Expulsion may occur under the following circumstances, including but not limited to:
          </p>
          
          <ul className="list-disc ml-6 space-y-2 text-base max-sm:text-[11px] max-sm:-ml-5 max-sm:-mr-5 ">
            <li>Repeated and severe disruptive behavior that jeopardizes the safety of others.</li>
            <li>Physical aggression or violence towards other children or staff.</li>
            <li>Continuous refusal to adhere to childcare center rules and regulations.</li>
            <li>Engaging in behavior that compromises the overall welfare of individuals within the childcare setting.</li>
            <li>Any other behavior deemed unacceptable or harmful to the functioning of the childcare center.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-8 mt-9 text-gray-800 underline max-sm:text-[17px]">
            Procedure for Expulsion:
          </h3>
          
          <ul className="list-disc ml-6 space-y-3 text-base max-sm:text-[11px] max-sm:-ml-5 max-sm:-mr-5 ">
            <li><strong>Documentation:</strong> Incidents of concerning behavior will be thoroughly documented by staff members.</li>
            <li><strong>Parental Communication:</strong> Parents or guardians will be promptly notified of any incidents and involved in developing strategies to address the behavior.</li>
            <li><strong>Intervention and Support:</strong> The childcare center will offer appropriate interventions and support to help modify the behavior, including behavior management techniques and referrals to external resources if necessary.</li>
            <li><strong>Review:</strong> If the behavior persists despite interventions, a review will be conducted involving the management team, staff members, and parents or guardians.</li>
            <li><strong>Decision:</strong> If expulsion is deemed necessary to maintain the safety and well-being of all involved, the child may be expelled from the childcare services.</li>
            <li><strong>Notification:</strong> Parents or guardians will receive written notification of the decision to expel their child, along with the reasons and any further steps required.</li>
          </ul>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold text-center mb-8 mb-8 text-gray-800 max-sm:text-[17px]">
            Termination of Services
          </h2>
          
          <p className="text-base mb-8 max-sm:text-[11px] max-sm:-ml-5 max-sm:-mr-5 ">
            Termination of childcare services may occur under the following circumstances, but not limited to:
          </p>
          
          <ul className="list-disc ml-6 mt-8 space-y-2 text-base max-sm:text-[11px] max-sm:-ml-5 max-sm:-mr-5 ">
            <li>Continued non-payment of fees despite reminders and notifications.</li>
            <li>Failure to comply with the terms and conditions outlined in the childcare services agreement.</li>
            <li>Any other circumstances deemed unacceptable or detrimental to the overall functioning of the childcare center.</li>
            <li>Engaging in violent behavior or using foul language towards other children or staff members.</li>
            <li>Failure to follow the childcare center's rules and regulations despite interventions and support.</li>
            <li>Any behavior that compromises the safety or well-being of oneself or others.</li>
            <li>Any other circumstances deemed unacceptable or detrimental to the overall functioning of the childcare center.</li>
          </ul>
        </div>







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

export default ExpulsionPolicy;
