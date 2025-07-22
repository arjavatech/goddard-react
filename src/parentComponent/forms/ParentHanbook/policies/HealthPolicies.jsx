import React from 'react';



const HealthPolicies = ({ openSection, setOpenSection }) => {
  const isOpen = openSection === 'healthPolicies';

  const headerClasses = `border bg-blue-50 px-6 py-4 flex items-center justify-between cursor-pointer 
        hover:bg-slate-700 hover:text-white ${isOpen ? 'bg-slate-700 text-white' : 'text-slate-700'}`;

  return (
    <>
      <div
        className={headerClasses}
        onClick={() => setOpenSection(isOpen ? '' : 'healthPolicies')}
      >
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-semibold">Health Policies</h2>
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
              HEALTH POLICIES
            </h1>

            <p className="text-base leading-relaxed mt-4">
              The owners and staff at The Goddard School® do all we can to promote a healthy environment
              for your children. Our teachers make sure children wash their hands when arriving at school,
              before meals, after art projects, after toileting and diapering, after coming in from outside,
              and after wiping one’s nose. Our teachers are required to wash their hands before serving meals
              or snacks and always wear latex gloves while diapering or assisting a child with toileting and
              when coming into contact with any bodily fluids. In addition, we disinfect infant and toddler
              toys on a daily basis. Our preschool toys are disinfected weekly.
            </p>

            <p className="mt-4">The health of the children is very important to the staff at The Goddard School®.
              Children who are ill cannot be appropriately cared for in a childcare setting. A child who is
              unable to participate due to illness should not be in attendance. The Goddard School® staff
              understands that it may be difficult to make alternate arrangements when a child may be
              too ill to attend the program. However, cooperation in keeping a child home when they are
              showing symptoms of illness will be greatly appreciated by the teachers and the children who
              would normally be in contact with that child. By establishing and maintaining a healthy environment
              and reasonable health policies, all of our children and families will benefit. Please help us
              in keeping everyone healthy by assisting with washing your child’s hands upon arrival at
              school (Per WA Licensing Requirements). Goddard reserves right to decline a child's attendance
              during times of illness where multiple children and/or staff are out with similar symptoms
              to contain the illness and reduce the spread.</p>

            <p className="mt-4">
              If a child does arrive in the morning showing signs of ill health, we will be unable to accept
              him/ her. The exception to this requirement would be that a licensed physician has examined
              thechild and indicated, in writing, that there would be no health risk to your child or
              others, and the child is capable of participating in all activities, including outdoor play.
            </p>

            <p className="mt-4">
              Fever is an indication that the body is fighting something, and we need to be sure that
              children are not attending school who have been medicated to reduce the fever. Children
              continue to be contagious even when a fever is controlled by a fever reducing medication.
            </p>

            <p className="mt-4">Examples of health symptoms that require exclusion from the program include, but are not limited to:</p>

            <div
              className=" w-full h-auto mx-auto p-6 mt-5 text-gray-800 font-medium"
              style={{ width: "100%" }}
            >
              <ul className="list-disc pl-6 space-y-2">
                <li>Severe pain or discomfort particularly in joints, abdomen, or ears.</li>
                <li>Vomiting (2 or more incidents within a 24 hour period).</li>
                <li>Diarrhea (3 or more within a 24 hour period).</li>
                <li>Severe coughing or sore throat.</li>
                <li>Temperature of 100° or more and/or accompanied by other behavior changes/symptoms.</li>
                <li>Jaundice (yellow) skin or eyes.</li>
                <li>
                  Eye discharge or conjunctivitis (pink eye) until clear or until 24 hours of antibiotic
                  treatment.
                </li>
                <li>
                  Infected, untreated skin patches/lesions or severe itching of body/scalp.
                </li>
                <li>Difficult or rapid breathing.</li>
                <li>
                  Skin rashes (excluding diaper rash) especially with fever or itching.
                </li>
                <li>Swollen joints, visibly enlarged lymph nodes, or stiff neck.</li>
                <li>Blood/pus from ears, skin, urine, stool.</li>
                <li>
                  Unusual behavior characterized by listlessness, loss of normal appetite, or confusion.
                </li>
                <li>
                  Symptoms of chicken pox, impetigo, lice, scabies, or strep throat.
                </li>
              </ul>
            </div>



            <p className="mt-4">
              If a child becomes ill during the day, a parent will be advised immediately.
              The child will be given the opportunity to rest or have other activities in a separated,
              supervised area until a designated release person can pick up the child. If the child is
              not picked up within one hour from the time of notification, the emergency contact person
              will be called. Children who are sent home due to illness will not be readmitted to the
              school until all signs of illness have been gone for 24 hours - this typically includes
              the day the child is sent home and the following full day. Therefore, a child who is sent
              home ill cannot return to school the following day. The exception to this requirement
              would be that a licensed physician has examined the child and has indicated in writing
              that the child does not present a health threat to him/her or others and is able to
              participate in all school activities, including outdoor play.
            </p>

            <p className="mt-4">In cases of certain communicable diseases, The Goddard School® is required
              to file a report with the Department of Health within 24 hours, so control measures can
              be used. Parents and staff are reminded to notify The Goddard School® within 24 hours if
              a child or family member has developed a known or suspected communicable disease. If a
              child has not been fully immunized for these diseases (due to the child’s age, medical
              condition, or religious belief) they will be excluded from the school during the outbreak
              of a vaccine-preventable disease, as directed by Washington State Department of Health.</p>


            <p className="mt-4">
              In cases of certain communicable diseases, The Goddard School® is required to file a report
              with the Department of Health within 24 hours, so control measures can be used. Parents and
              staff are reminded to notify The Goddard School® within 24 hours if a child or family member
              has developed a known or suspected communicable disease. If a child has not been fully
              immunized for these diseases (due to the child’s age, medical condition, or religious belief)
              they will be excluded from the school during the outbreak of a vaccine-preventable disease,
              as directed by Washington State Department of Health.
            </p>

            <p className="mt-4">All parents will be informed in writing if a communicable disease is reported.
              The Goddard School® follows the reporting guidelines as established by the Washington State
              Department of Health. A copy of the health policy is on file in the Director’s office and
              is available for your review.</p>

            <p class="font-bold underline mt-5">“No Nit” Policy.</p>
            <p className="mt-1">
              The Goddard School has determined the best way to prevent head lice is to institute a “no nit”
              policy at our school. We will periodically check the children in our school for head lice.
              If a child is found to have head lice, they will need to be picked up immediately. Before
              returning to class, the child should be brought to the office to be checked for nits.
              Once the child is determined to be free of nits, they may rejoin their class.
            </p>














            <label className="flex items-center space-x-2 text-lg font-medium mt-5">
              <input
                type="checkbox"
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



export default HealthPolicies;
