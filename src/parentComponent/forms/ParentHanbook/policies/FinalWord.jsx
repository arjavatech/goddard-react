import React from 'react';
import { useState } from 'react';
const FinalWord = ({ openSection, setOpenSection }) => {
    const [isAgreed, setIsAgreed] = useState(false);

    const handleSave = () => {
      if (isAgreed) {
        alert('Information saved successfully!');
      } else {
        alert('Please agree to the information before saving.');
      }
    };
    const isOpen = openSection === 'FinalWord';

    const headerClasses = `rounded-b-lg  border bg-blue-50 px-6 py-4 flex items-center justify-between cursor-pointer 
      hover:bg-slate-700 hover:text-white ${isOpen ? 'bg-slate-700 text-white' : 'text-slate-700'}`;

    return (
        <>
            <div
                className={headerClasses}
                onClick={() =>
                    setOpenSection(isOpen ? '' : 'FinalWord')
                }
            >
                <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-semibold">Final Word</h2>
                </div>
                <div className="text-xl transform transition-transform duration-200">
                    {isOpen ? '⌄' : '⌃'}
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
                        <h1 className="text-2xl font-bold text-center mb-8">A Final Word</h1>
        
        <div className="space-y-6 text-md leading-relaxed">
          <p>
            The Owner and/or Director reserve the right to deny, cancel, sever, suspend, or terminate the services of any child, 
            without notice, for any reason, so long as the determination is not based on whole or part on the race, color, creed, 
            religion, sexual preference, age, gender, national origin, or disability or any other protected characteristic of the 
            child or the child's parents. At all times we strive to provide quality care for all children. If that quality is diminished 
            by one child, the Director and/or Owner may ask for the dismissal of that child for the well-being of the other 
            children in the room. Any unused tuition will be refunded minus any outstanding charges.
          </p>
          
          <p>
            The Goddard School® will not release a child to any parent, relative, or other authorized adult who appears to be 
            impaired. In the event this situation is suspected, a telephone call will be made to the other parent, emergency 
            contact person, local authorities and the Washington State Department of Child Protective Services in Washington 
            and notify them of our suspicions.
          </p>
          
          <p>
            In the event that child abuse is suspected, we are required by the State of Washington to report any and all 
            instances of suspected child abuse or neglect. When a staff member has information or evidence of suspected child 
            abuse, the Director and/or Owner will be informed, and the Department of Child Protective Services is contacted 
            and given this information.
          </p>
          
          <p>
            The Goddard School® reserves the right to edit any of the information contained in this manual at any time, and 
            the material contained herein should not be considered as sole determination of policy.
          </p>
          
          <p>
            If, after reviewing this parent's handbook, there are any questions or comments regarding The Goddard School® 
            and its policies, parents should feel free to speak with the Owner and/or Director.
          </p>
        </div>
        
       
      </div>

   

      {/* Page 3 - Chain of Command */}
      <div className="p-8 min-h-screen">
        <h1 className="text-2xl font-bold text-center mb-8">CHAIN OF COMMAND</h1>
        
        <p className="text-md leading-relaxed mb-8">
          We are all part of the team working to support your family. The Goddard School® strives to meet all of your 
          family's needs. If you have a concern, please go directly to the source to handle the concern most efficiently. If your 
          concern is not resolved, please continue up the ladder until we have reached mutual understanding.
        </p>
        
        <div className="text-center space-y-4 text-md">
          <div className="mb-6">
            <h2 className="font-bold underline text-base mb-2">The Goddard School® of Lynnwood</h2>
            <div className="space-y-1">
              <p><span className="font-semibold">Maanu Muthu</span>, On-site Owner</p>
              <p><span className="font-semibold">Kat Shield</span>, Director</p>
              <p><span className="font-semibold">Bailey Ellis</span>, Assistant Director</p>
              <p><span className="font-semibold">Josh Koczman</span>, ____________</p>
              <p><span className="font-semibold">Matt Redman</span>, ____________</p>
              <p>Lead Teacher – See Bio Board for Your Child's Classroom</p>
              <p>Assistant Teacher - See Bio Board for Your Child's Classroom</p>
              <p className="font-semibold mt-4">425-510-7055, 425-616-1993</p>
              <p className="font-semibold">LynnwoodWA@goddardschools.com</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-bold underline text-base mb-2">Goddard Systems, Inc.</h3>
            <p>1016 West Ninth Street, King of Prussia, PA 19406</p>
            <p>Franchise Relations, 610-265-8510 Extension 530</p>
          </div>
          
          <div>
            <h3 className="font-bold underline text-base mb-2">Department of Child, Youth and Family,</h3>
            <p>State of Washington, Northwest Offices</p>
            <p>(425) 603-3132</p>
            </div>
          </div>
        </div>

        <div className="p-8 border-b-2 border-gray-300 min-h-screen">
        <h1 className="text-2xl font-bold text-center mb-8">EMERGENCY OPERATIONS PLAN</h1>
        
        <p className="text-md leading-relaxed mb-8">
          Our primary concern is for the safety and welfare of the children attending The Goddard School® in Lynnwood, 
          WA. Our Emergency Operations Plan provides for response to all types of emergencies. Depending on the 
          circumstances of the emergency, we will use one of the following protective actions:
        </p>
        
        <ul className="space-y-4 text-md leading-relaxed mb-8 ml-4">
          <li className="flex">
            <span className="mr-2">•</span>
            <div>
              <strong>Immediate evacuation:</strong> Students are evacuated to a safe area on the grounds of the facility in the event of 
              a fire, etc.
            </div>
          </li>
          <li className="flex">
            <span className="mr-2">•</span>
            <div>
              <strong>In-place sheltering:</strong> Sudden occurrences may dictate that taking cover inside the building is the best 
              immediate response.
            </div>
          </li>
          <li className="flex">
            <span className="mr-2">•</span>
            <div>
              <strong>Evacuation:</strong> In certain emergency situations, total evacuation of the facility may become necessary. In this 
              case, the children will be taken to a safe relocation facility. Parents will be contacted by telephone as to 
              the location of the children, or by radio broadcast if phone transmission is not possible.
            </div>
          </li>
          <li className="flex">
            <span className="mr-2">•</span>
            <div>
              <strong>Modified Operation:</strong> This may include cancellation, postponement, or rescheduling of normal activities. 
              These actions are normally taken in the event of a winter storm or facility problems that make it unsafe 
              for students (such as utility disruptions). However, this action may be necessary in a variety of situations.
            </div>
          </li>
        </ul>
        
        <p className="text-md leading-relaxed mb-8">
          In the event of a local or regional emergency, please tune into your local news and radio stations for updated 
          announcements. You may also go to goddardschool.com and click on the Lynnwood, WA location for 
          announcements relating to any of the emergency actions listed above.
        </p>
        
        <p className="text-md leading-relaxed mb-8">
          We ask that you do not call the school during an emergency. This will keep the main telephone line free to make 
          emergency calls and relay information. We will call you and let you know that we've taken one of these protective 
          actions. We will also call you when we have resolved the situation, and it is safe for you to pick up your child(ren).
        </p>
        
        <p className="text-md leading-relaxed mb-8">
          The Owner and/or Directors may provide an alternative phone number (i.e. cell phone number) to call in the event 
          of an emergency via group email or posting on our school's website.
        </p>
        
        <p className="text-md leading-relaxed mb-8">
          Our emergency preparedness plan is reviewed on a semi-annual basis with all staff and is located in each classroom 
          binder as well as in the Director and Owner offices.
        </p>
        
           {/* Checkbox */}
           <label className="flex items-center space-x-2 text-lg font-medium mt-6">
                            <input
                                type="checkbox"
                                className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                            <span>
                                I agree <strong>all the above information</strong>.
                            </span>
                        </label>
        
        <div className="text-center mt-6">
          <button 
            onClick={handleSave}
            className="bg-blue-900 text-white px-8 py-2 text-md font-semibold hover:bg-blue-800 transition-colors"
          >
            Save
          </button>
        </div>
      </div>




                   
                    </div>
                </div>
            )}
        </>
    );
};

export default FinalWord;
