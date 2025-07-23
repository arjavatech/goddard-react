
import React, { useState, useEffect } from 'react';

import { DownIcon,UpIcon } from '../../../../components/common/Arrows';

const MedicationProcedures = ({fieldValue,  openSection, setOpenSection }) => {
  // Initialize the checkbox state based on fieldValue
  const [isChecked, setIsChecked] = useState(fieldValue == 'on');

  // Optional: convert back to "on"/"off" or boolean
  const handleChange = (e) => {
    setIsChecked(e.target.checked);
  };
  
  const isOpen = openSection === 'MedicationProcedures';

  const headerClasses = `border bg-blue-50 px-6 py-4 flex items-center justify-between cursor-pointer 
        hover:bg-slate-700 hover:text-white ${isOpen ? 'bg-slate-700 text-white' : 'text-slate-700'}`;

  return (
    <>
      <div
        className={headerClasses}
        onClick={() => setOpenSection(isOpen ? '' : 'MedicationProcedures')}
      >
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-semibold">Medication Procedures</h2>
        </div>
        <div className="text-xl transform transition-transform duration-200">
          {isOpen ? <DownIcon className="h-5 w-5 text-gray-500" /> : <UpIcon className="h-5 w-5 text-black" />}
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
                MEDICATION PROCEDURES
            </h1>

            <p class="font-bold underline text-lg mt-5">General Information on Medications</p>
            <p className="mt-4">
                The Goddard School in Lynnwood administers only life-saving medication such as EPI-Pen’s,
                Benadryl, Inhalers, etc.
            </p>

            <p className="mt-4">
                The medication logs and authorization forms are located in the Director’s office.
                Authorization forms must be completed by the parent or guardian and given to the Director
                prior to any medication being administered. This will serve as a second method to ensure
                that your child receives his/her medication.
            </p>

            <div className="mt-4">
                Check expiration dates on all medications. We will not be able to administer expired
                medications even if the log and form are completed.
            </div>

            <div className="mt-4">
                Check expiration dates on all medications. We will not be able to administer expired
                medications even if the log and form are completed.
            </div>


            <p className="mt-4">
                Over-the-counter medications will not be given even with a doctor’s note.
            </p>

            <p class="font-bold underline text-lg mt-5">Request for Medication to be Dispensed</p>

            <div className="mt-4">No over-the-counter medication will be dispensed. All medication must be
                a prescription prescribed by doctor and have a pharmacy label and medication number.
                When a child needs medication, 2 forms must be completed. The first form is the medication
                log. The log needs to be completed each day the child is to receive medication. A parent
                must indicate a specific time and dosage of medication to be dispensed. Medication will
                not be dispensed on an “as needed” basis. The second form is the authorization for
                dispensing medication. Medication will only be dispensed for the dates indicated
                on the form. The authorization form should be given directly to the Director.</div>

            <p class="font-bold underline mt-5 text-lg">Allergies That May Require Medication</p>
            <div className="mt-4">If a child has an allergy which may require emergency medication,
                an authorization form must be on file. If it is determined that a child is in need of
                this emergency medication, a staff member will contact the parent, complete the medication
                log, and have the parent sign it upon their arrival at the school. A copy of the
                authorization form must be kept in the child’s file and with the medication.
                This medication may remain at school overnight. Authorization forms must be
                updated every six months.</div>


            <p class="font-bold underline mt-5 text-lg">Topical Medications (Diaper Creams, Sun Screens, Etc.)</p>
            <div className="mt-4">
                If a child requires over-the-counter diaper ointments, lotions, lip balm, or sunscreen, these
                must be labeled with the child’s first and last name. The parent must complete an authorization
                form for each type of ointment or lotion. This authorization is good for one year. If diaper
                ointments are applied, it will be noted on the child’s daily report. These ointments and
                lotions must be placed in a designated container in the teacher closet or cabinet and
                remain at school overnight.
            </div>


            <h1 className="text-2xl font-bold mb-4 text-center mt-5">
                ACCIDENTS AND INJURY
            </h1>

            <div className="mt-4">
                Should a child become injured at school, the parent will be notified via an accident report
                form. In the event of an injury above the shoulders, an email notification or phone
                call will be made. The parents will be asked to sign this form indicating that they
                have been notified, and a copy of the form will be included in the child’s school
                record. If the injury is of a serious nature, a parent will receive a phone
                call from the school at the time the accident occurs.
            </div>

            <div className="mt-4">
                In the event of an emergency, the child will be transported via ambulance to the nearest
                hospital or emergency room facility and a parent will be contacted to meet an accompanying
                staff member at the facility. It is extremely important that emergency contact information
                for your child is up to date. A child cannot be transported for care, or receive any
                emergency care at school, unless the waivers for emergency care have been signed.
                These waivers are included in the enrollment packet.
            </div>









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



export default MedicationProcedures;
