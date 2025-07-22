import React from 'react';


const ReleaseOfChildren = ({ openSection, setOpenSection }) => {
    const isOpen = openSection === 'ReleaseOfChildren';

    const headerClasses = `border bg-blue-50 px-6 py-4 flex items-center justify-between cursor-pointer 
        hover:bg-slate-700 hover:text-white ${isOpen ? 'bg-slate-700 text-white' : 'text-slate-700'}`;

    return (
        <>
            <div
                className={headerClasses}
                onClick={() => setOpenSection(isOpen ? '' : 'ReleaseOfChildren')}
            >
                <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-semibold">Release Of Children</h2>
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
      RELEASE OF CHILDREN
      </h1>

      <p className="text-base leading-relaxed mt-4">
      Since the safety of the children is our utmost concern, The Goddard School® 
      maintains a strict policy regarding the individuals to whom we will release
       a child. The enrollment forms require a parent to specify at least two (2) 
       individuals to whom the child may be released on an on-going or emergency basis.
        In addition, parents are asked to specify a password for the release of the child.
      </p>

      <p className="mt-4">
      Advance written notice is required for an individual to be authorized to pick up a child.
       In the case of an emergency, the Director or Owner may be notified by phone as to the name,
        address, phone number, and brief description of the person picking up the child. 
        The Director or Owner will then call the parent back to verify the authorization.
         Once this individual arrives at the school, a staff member will verify the individual’s 
         identity by reviewing two forms of identification and the password before the child is
          released. After confirmation of identity, The Director or Owner will go pick up the 
          child from their designated classroom. The child must still be signed out.
      </p>
     
     <p className="mt-4">
     If a non-custodial parent is not included among those persons authorized by the custodial 
     parent to pick up the child, please inform the Director or Owner. A copy of the appropriate 
     documentation regarding visitation must be included in the child’s school record. This
      information will remain confidential and will be shared with staff as required, to meet
       the needs of the child.
     </p>

        <p className="mt-4">
        Should an unauthorized individual arrive to pick up a child, a parent or emergency 
        contact will be immediately notified by phone. If the Director is unable to contact 
        a parent or emergency contact, the child will not be released. Should an unauthorized 
        person become uncooperative with the school’s policy regarding the release of the child, 
        the local authorities will be notified.
        </p>

        <p className="mt-4">
        The Goddard School® will not release a child to any parent, 
        relative, or other authorized adult who appears to be impaired
         by the use of drugs or alcohol. In the event this situation occurs, 
         a phone call will be made to the parent, emergency contact person, and/or local authorities.
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

export default ReleaseOfChildren;
