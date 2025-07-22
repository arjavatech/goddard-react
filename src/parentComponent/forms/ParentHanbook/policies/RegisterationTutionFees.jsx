import React from 'react';


const RegisterationTutionFees = ({ openSection, setOpenSection }) => {
    const isOpen = openSection === 'RegisterationTutionFees';

    const headerClasses = `border bg-blue-50 px-6 py-4 flex items-center justify-between cursor-pointer 
        hover:bg-slate-700 hover:text-white ${isOpen ? 'bg-slate-700 text-white' : 'text-slate-700'}`;

    return (
        <>
            <div
                className={headerClasses}
                onClick={() => setOpenSection(isOpen ? '' : 'RegisterationTutionFees')}
            >
                <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-semibold">Registeration ,Tution payments and Fees</h2>
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
      REGISTRATION FEE
      </h1>

      <p className="text-base leading-relaxed mt-4">
      A non-refundable registration fee is payable upon enrollment, and due annually when the 
      child is re-enrolled for each new school year.
      </p>

      <h1 className="text-2xl font-bold mb-4 mt-6 text-center">
      TUITION PAYMENTS AND FEES
      </h1>

      <p className="mt-4">
      Tuition is paid on a monthly basis. Monthly tuition is due on or before the first of each month.A 
      payment box is located outside the office. There will be a service fee of $50 for each check 
      returned by the bank. This fee is due at the time of notification. We offer ACH in order to 
      streamline the process for you, please see the office for paperwork. ACH is run on the 1st 
      of every month. Any tuition that is not paid by the close of business on the first day of 
      each month will incur a $50 late fee. An additional notice will then be given to the parent.
       After the fifteenth (15th) day, the child may not return to the program until the full tuition
        and late fee charges incurred are paid in full. All unpaid accounts must be rectified immediately
         or be subject to third party remediation. Please contact the owner if payment difficulties are
          anticipated so alternative arrangements can be made.
      </p>
     
            <p className="mt-4">
        
        Monthly tuition fees are non-refundable regardless of holidays, vacation, inclement weather
        days or School closures resulting from causes beyond the reasonable control of the School 
        or its management including, but not limited to fire, floods, civil commotions, strikes, 
        lockouts or other labor disturbances, “Acts of God” or acts, omissions or delays in acting 
        by any governmental authority. The School and its management will use reasonable efforts to 
        avoid unscheduled closures and will resume operation as soon as feasible. The School will make
        reasonable efforts to open in inclement weather; however, the School may choose to close at 
        the discretion of the School’s owner. Parents will be notified of any school closures via 
        electronic communication.
            </p>


        <p className="mt-4">
    Monthly tuition fees are non-refundable regardless of holidays, vacation, inclement weather days 
    or School closures resulting from causes beyond the reasonable control of the School or its
     management including, but not limited to fire, floods, civil commotions, strikes, lockouts
      or other labor disturbances, “Acts of God” or acts, omissions or delays in acting by any 
      governmental authority. The School and its management will use reasonable efforts to avoid 
      unscheduled closures and will resume operation as soon as feasible. The School will make 
      reasonable efforts to open in inclement weather; however, the School may choose to close 
      at the discretion of the School’s owner. Parents will be notified of any school closures via
       electronic communication.
        </p>

        <p className="mt-4">
        Monthly tuition fees are non-refundable regardless of illness, pandemics, Covid19, public health 
        crises, government order, closures mandated by Washington State Department of Health and/or King 
        County Department of Health, closures mandated by Department of Child, Youth and Families. Parents
         will be notified of any school closures via electronic communication.
        </p>
        
        <p className="mt-4">
        The School will open at 7:00am and close at 6:00pm, however modified school hours
        may apply in case of any unforeseen circumstances. A fee will be charged for any child not picked
        up before the School’s regular closing time. Full day student late fees begin at 6:31pm. Half day 
        student late fees begin at 12:46pm. This charge shall be $35 per child for the first 5 minutes and 
        an additional $25 per child per 5 minute period thereafter. Fees for late pick-up are added to tuition;
        if not paid, the child will not be readmitted to the program. Consistent lateness will be cause for 
        the child’s dismissal from the School. We will provide a written notice for the first infraction prior
            to applying a late fee. If a parent or guardian has not contacted us by 6:30 PM, we are required to
            inform the proper authorities. Two staff members are required to stay with your child until you arrive.
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

export default RegisterationTutionFees;
