
import React, { useState, useEffect } from 'react';



const ToysFromHome = ({fieldValue,  openSection, setOpenSection }) => {
  // Initialize the checkbox state based on fieldValue
  const [isChecked, setIsChecked] = useState(fieldValue == 'on');

  // Optional: convert back to "on"/"off" or boolean
  const handleChange = (e) => {
    setIsChecked(e.target.checked);
    console.log('Updated value:', e.target.checked ? 'on' : 'off');
  };
  const isOpen = openSection === 'ToysFromHome';

  const headerClasses = `border bg-blue-50 px-6 py-4 flex items-center justify-between cursor-pointer 
        hover:bg-slate-700 hover:text-white ${isOpen ? 'bg-slate-700 text-white' : 'text-slate-700'}`;

  return (
    <>
      <div
        className={headerClasses}
        onClick={() => setOpenSection(isOpen ? '' : 'ToysFromHome')}
      >
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-semibold">Toys From Home and Items to Bring to School</h2>
        </div>
        <div className="text-xl transform transition-transform duration-200">
          {isOpen ? '⌄' : '⌃'}
        </div>
      </div>

      {isOpen && (
        <div className="border p-6 space-y-6 bg-gray-50" onClick={(e) => e.stopPropagation()}>
          {/* Additional Parent/Legal Guardian Name */}
          <div
            className="w-full h-auto mx-auto p-6 text-left  text-justify text-gray-700 font-semibold"
            style={{ height: "80%", width: "100%", textAlign: "justify" }}
        >
            <h1 className="text-2xl font-bold mb-4 text-center">
            TOYS FROM HOME
            </h1>

            <p className="mt-4">
            It is recommended that all personal toys remain at home. It is very difficult for young children to share favorite possessions, and all toys that enter the school must be shared. In addition, many toys break easily and contain small parts. These types of toys may be inappropriate for our setting.
            </p>

            <p className="mt-4">
            Show and tell items may occasionally be requested by a child’s teacher. Suggested show and tell items include books, photographs, special treasures such as seashells, or theme related items. These should be discussed with the teacher and items will be shown at the teacher’s discretion. Anything pertaining to violence (guns, war toys, etc.) or having anything to do with religious beliefs cannot be utilized at The Goddard School®. Material deemed inappropriate for a preschool audience will not be used. All electronic devices from home are not permitted at school.
            </p>

            <h1 className="text-2xl font-bold mb-4 text-center mt-7">
            ITEMS TO BRING TO SCHOOL
            </h1>
            <p class="font-bold underline mt-5">Infants</p>

            <div className="mt-4">
            Each infant is provided with their own crib and mattress upon enrollment. The 
            parent must provide:
            </div>

            <div className="max-w-2xl mx-auto p-6 text-gray-800">
      <ul className="list-disc list-inside space-y-2">
        <li>2–3 crib sheets (port-a-crib or play yard size).</li>
        <li>A sleep sac when appropriate.</li>
        <li>2–3 complete changes of clothing for the appropriate season.</li>
        <li>Diapers and wipes, diaper cream if needed.</li>
        <li>All food, drink, and utensils required to serve food.</li>
        <li>Sweater or sweatshirt, mittens and hat.</li>
      </ul>
    </div>



    <div className="mt-5">
    If a child becomes ill during the day, a parent will be advised immediately. The child 
    will be given the opportunity to rest or have other activities in a separated, supervised 
    area until a designated release person can pick up the child. If the child is not picked
     up within one hour from the time of notification, the emergency contact person will be 
     called. Children who are sent home due to illness will not be readmitted to the school 
     until all signs of illness have been gone for 24 hours - this typically includes the day
      the child is sent home and the following full day. Therefore, a child who is sent home
       ill cannot return to school the following day. The exception to this requirement would
        be that a licensed physician has examined the child and has indicated in writing that
         the child does not present a health threat to him/her or others and is able to participate 
         in all school activities, including outdoor play.
    </div>

  <div className="mt-4">
  In cases of certain communicable diseases, The Goddard School® is required to file a report
   with the Department of Health within 24 hours, so control measures can be used. Parents 
   and staff are reminded to notify The Goddard School® within 24 hours if a child or family
    member has developed a known or suspected communicable disease. If a child has not been
     fully immunized for these diseases (due to the child’s age, medical condition, or religious
      belief) they will be excluded from the school during the outbreak of a vaccine-preventable
       disease, as directed by Washington State Department of Health.
  </div>

  <div className="mt-4">
  All parents will be informed in writing if a communicable disease is reported. The 
  Goddard School® follows the reporting guidelines as established by the Washington State
   Department of Health. A copy of the health policy is on file in the Director’s office and
    is available for your review.
  </div>

  <p class="font-bold underline mt-5">“No Nit” Policy</p>
  <div className="mt-4">The Goddard School has determined the best way to prevent head lice 
    is to institute a “no nit” policy at our school. We will periodically check the children 
    in our school for head lice. If a child is found to have head lice, they will need 
    to be picked up immediately. Before returning to class, the child should be brought
     to the office to be checked for nits. Once the child is determined to be free of 
     nits, they may rejoin their class.</div>
           







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



export default ToysFromHome;
