import PDFHeader from "./PDFHeader";
import React, { useRef, forwardRef, useImperativeHandle, useState, useEffect, useCallback } from "react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';




const ParentHandbook = forwardRef(({ initialFormData }, ref) => {
    console.log('ParentHandbook - initialFormData:', initialFormData);

    // Helper function to determine if checkbox should be checked
    const isChecked = (value) => {
        const result = value === 'on' || value === true || value === 'true';
        return result;
    };

    // State for all checkboxes
    const [checkboxStates, setCheckboxStates] = useState({
        welcome_goddard_agreement: false,
        mission_statement_agreement: false,
        general_information_agreement: false,
        medical_care_provider_agreement: false,
        parent_access_agreement: false,
        release_of_children_agreement: false,
        registration_fees_agreement: false,
        outside_engagements_agreement: false,
        health_policies_agreement: false,
        medication_procedures_agreement: false,
        bring_to_school_agreement: false,
        rest_time_agreement: false,
        training_philosophy_agreement: false,
        affiliation_policy_agreement: false,
        security_issue_agreement: false,
        expulsion_policy_agreement: false,
        addressing_individual_child_agreement: false,
        finalword_agreement: false
    });

    // Set initial checkbox states when initialFormData changes
    useEffect(() => {
        if (initialFormData) {
            const newStates = {};
            Object.keys(checkboxStates).forEach(key => {
                newStates[key] = isChecked(initialFormData[key]);
            });
            console.log('ParentHandbook - Setting checkbox states:', newStates);
            setCheckboxStates(newStates);
        }
    }, [initialFormData]);






    const generatePrint = async (isPrint = false) => {
        const elementsToRestore = [];

        try {
            // Fix unsupported color formats and increase font size
            const allElements = document.querySelectorAll('*');
            allElements.forEach(el => {
                const style = window.getComputedStyle(el);

                // Fix colors
                ['color', 'backgroundColor', 'borderColor'].forEach(prop => {
                    if (style[prop] && (style[prop].includes('oklch') || style[prop].includes('color('))) {
                        elementsToRestore.push({
                            element: el,
                            property: prop,
                            originalValue: el.style[prop]
                        });
                        el.style[prop] = '#000000';
                    }
                });

                // Increase font size for PDF
                if (style.fontSize) {
                    elementsToRestore.push({
                        element: el,
                        property: 'fontSize',
                        originalValue: el.style.fontSize
                    });
                    const currentSize = parseFloat(style.fontSize);
                    el.style.fontSize = (currentSize * 1.1) + 'px';
                }
            });

            await new Promise(resolve => setTimeout(resolve, 100));

            const pdf = new jsPDF("p", "pt", "a4");
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 20;

            const sections = document.querySelectorAll('.section-container');

            for (let i = 0; i < sections.length; i += 2) {
                if (i > 0) pdf.addPage();

                const section1 = sections[i];
                const section2 = sections[i + 1];

                const canvas1 = await html2canvas(section1, {
                    scale: 1.2,
                    useCORS: true,
                    backgroundColor: '#ffffff'
                });

                const imgData1 = canvas1.toDataURL('image/jpeg', 0.9);
                const imgWidth = pageWidth - margin * 2;
                const halfHeight = (pageHeight - margin * 3) / 2;

                pdf.addImage(imgData1, 'JPEG', margin, margin, imgWidth, halfHeight);

                if (section2) {
                    const canvas2 = await html2canvas(section2, {
                        scale: 1.2,
                        useCORS: true,
                        backgroundColor: '#ffffff'
                    });

                    const imgData2 = canvas2.toDataURL('image/jpeg', 0.9);
                    pdf.addImage(imgData2, 'JPEG', margin, margin * 2 + halfHeight, imgWidth, halfHeight);
                }
            }

            if (isPrint) {
                const pdfBlob = pdf.output('blob');
                const blobUrl = URL.createObjectURL(pdfBlob);
                const printWindow = window.open(blobUrl, '_blank');

                if (printWindow) {
                    printWindow.addEventListener('load', () => {
                        setTimeout(() => {
                            printWindow.print();
                            const checkClosed = setInterval(() => {
                                if (printWindow.closed) {
                                    clearInterval(checkClosed);
                                    URL.revokeObjectURL(blobUrl);
                                }
                            }, 500);
                        }, 1000);
                    });
                } else {
                    alert('Please allow popups to enable printing');
                    URL.revokeObjectURL(blobUrl);
                }
            } else {
                pdf.save("parent-handbook.pdf");
            }

        } catch (err) {
            console.error("❌ Error generating PDF:", err);
            alert("An error occurred while generating PDF.");
        } finally {
            // Restore original styles
            elementsToRestore.forEach(item => {
                item.element.style[item.property] = item.originalValue || '';
            });
        }
    };



    useImperativeHandle(ref, () => ({
        generatePrint: () => generatePrint(true),
        generateDownload: () => generatePrint(false)
    }));

    return (
        <div className="min-h-screen p-4 sm:p-6" id="pdf-wrapper">
            <style>
                {`
          #pdf-wrapper {
            width: 100% ;
            max-width: 100%;
          }

          @page {
            size: A4;
            margin: 0.5in;
          }

          @media print {
            body * {
              visibility: hidden;
            }
            #pdf-wrapper, #pdf-wrapper * {
              visibility: visible;
            }
            #pdf-wrapper {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .section-container {
              page-break-after: always;
              break-after: page;
              page-break-inside: avoid;
              break-inside: avoid;
            }

          }

          @media (max-width: 768px) {
            #pdf-wrapper {
              display: block;
            }
               #pdf-wrapper {
            width: 960px !important;
            max-width: 960px !important;
          }
          }
          
          /* Smaller font size for checkbox labels */
          input[type="checkbox"] + label {
            font-size: 12px !important;
          }
        `}
            </style>
            <div className="bg-white border border-2 mx-auto text-[15px] border-[#0f2d52] section-container">
                <PDFHeader heading="Parent Handbook" />

                <div className="p-4">
                    <form id="formContent">
                        {/* Goddard Parent Handbook */}
                        <div className="row m-1 mb-4">
                            <h5 className="text-center text-[1rem] mb-4">
                                <b className="text-[1rem]">Welcome to The Goddard School®</b>
                            </h5>
                            <p className="mx-4 mb-4">
                                The early years are a very special time in your child's development. Great changes occur
                                in this relatively short period of time as children learn to communicate, increase their
                                intellectual awareness, and make great physical strides. In recognition of the crucial
                                importance of
                                these years, The Goddard School® has created a program tailored to meet the needs of
                                your child at each stage of development.
                            </p>
                            <p className="mx-4 mb-4">
                                The Goddard School® philosophy is to provide an atmosphere suited to the development of
                                selfesteem, confidence, and love of learning. By combining the best possible equipment
                                and
                                professionally educated staff in an environment specifically designed for young
                                children, we offer
                                an outstanding program.
                            </p>
                            <p className="mx-4 mb-4">
                                The educational goal of The Goddard School® is to utilize fun and creativity to foster a
                                love
                                of learning. We challenge our students by promoting inquiry and discovery through
                                exploring
                                the world around them. This instills a sense of confidence in their ability to master
                                new
                                situations and tasks through reasoning. Your child will be exposed to a variety of
                                teaching
                                methods so that he/she will be able to meet success in any elementary school system.
                            </p>
                            <p className="mx-4 mb-4">You, the parent, are very important to The Goddard staff because you know your child
                                best. We
                                encourage you to contact the school about any questions or concerns you might have.
                                Please
                                review the daily reports highlighting your child's activities. If there is anything we
                                can do to
                                make your child's experiences more meaningful, please let us know. </p>
                            <p className="mx-4 mb-4">We are looking forward to working with you and your child and sharing in his/her growth
                                and
                                development.</p>
                            <p className="mx-4 mb-4">Many thanks for choosing The Goddard School® located in Redmond, WA.</p>
                        </div>
                    </form>
                </div>
            </div>

            <div className="bg-white border border-2 mx-auto text-[15px] mt-5 border-[#0f2d52] section-container">
                <PDFHeader heading="Parent Handbook" />

                <div className="p-4">
                    <div className="row m-1 mb-3">
                        <p className="mx-4 mb-4">Sincerely,</p>
                        <p className="mx-4 mb-4">Maanu Muthu, Onsite Owner</p>
                        <i className="mx-4 mb-4">*The term “parent” is used throughout to represent the primary
                            individual(s) responsible for the child’s care.</i>
                    </div>
                    <div className="row m-1 mb-3">
                        <div className="form-group d-flex align-items-center gap-1 mx-4 mb-4">
                            <input
                                type="checkbox"
                                className="input-checkbox custom-checkbox"
                                id="welcome_goddard_agreement"
                                name="welcome_goddard_agreement"
                                checked={checkboxStates.welcome_goddard_agreement}
                                onChange={(e) => setCheckboxStates(prev => ({ ...prev, welcome_goddard_agreement: e.target.checked }))}

                            />
                            <label className="form-check-label pl-3" htmlFor="welcome_goddard_agreement">
                                <span><b>I agree all the above information.</b></span>
                            </label>
                        </div>
                    </div>
                    <div className="row m-1 mb-3">
                        <h5 className="text-center mb-3 text-[1rem]"><b>Mission Statement</b></h5>
                        <p className="mx-4 mb-4">
                            We are dedicated to giving children a love of learning in a safe and secure environment. Our
                            teachers design and individualize their own lesson plans to help children learn and explore
                            the
                            world at their own pace.
                        </p>
                        <p className="mx-4 mb-4">
                            Our teachers are loving, nurturing, trained professionals committed to maintaining the
                            highest
                            quality in early childhood education. Through onsite training provided by the Director, as
                            well as
                            Goddard University, our teachers receive ongoing training in order to learn the latest
                            developments within the field of Early Childhood Education.
                        </p>
                        <p className="mx-4 mb-4">
                            Our school is a safe, secure, clean, and happy environment for
                            children to grow and learn. We will make the transition from
                            home to school a positive experience.
                        </p>
                        <p className="mx-4 mb-4">
                            Each child is treated as a unique individual. Each child is given individual attention
                            within a
                            group allowing him/her to progress according to his/her own needs and rate of development.
                        </p>
                        <p className="mx-4 mb-4">
                            Communication with parents is the key. It is based upon being open, honest, and respectful -
                            encouraging both involvement and support. Parents are informed daily of their child’s
                            progress
                            and development.
                        </p>
                        <p className="mx-4 mb-4">
                            We strive to provide the best in child care and development. We are committed to Goddard’s
                            standards of excellence and are continually seeking to improve.
                        </p>
                    </div>
                </div>

            </div>


            <div className="bg-white border border-2 mx-auto text-[15px] mt-5 border-[#0f2d52] section-container">
                <PDFHeader heading="Parent Handbook" />

                <div className="p-4">
                    <div className="flex flex-col space-y-4 mb-8">
                        <p className="text-base">
                            Our number one priority is providing every child with a loving and caring atmosphere
                            conducive to the development of self-esteem, confidence, creativity, and a love of learning.
                        </p>

                        <h5 className="text-center text-xl font-bold text-[#0f2d52] mb-5">
                            Children’s Bill of Rights
                        </h5>

                        <p className="text-base">
                            We, the faculty, and staff of The Goddard School®, pledge to
                            honor this Children’s Bill of Rights.
                        </p>

                        <p className="text-base">
                            Every child in our program has the right to be respected as an
                            individual with concern for his or her own interests,
                            challenges, talents, and pace of learning.
                        </p>

                        <p className="text-base mt-4">
                            Every child has the right to a calm, warm, loving, and nurturing
                            environment where affection is freely given so that a child
                            feels valued and secure and is thus able to develop
                            self-confidence.
                        </p>

                        <p className="text-base">
                            Every child has the right to personal attention, a relaxed
                            atmosphere, and freedom of choice in daily activities that can
                            only be provided in a small group setting.
                        </p>

                        <p className="text-base">
                            Every child has the right to have all physical needs met,
                            including the need for rest and relaxation throughout the day.
                        </p>

                        <p className="text-base">
                            Every child has the right to a clean, safe environment in which
                            to spend their day.
                        </p>

                        <p className="text-base">
                            Every child has the right to experience a variety of activities
                            throughout the day that help them develop a feeling of
                            independence and confidence. These activities provide
                            opportunities for creativity, exploration, and a lifelong love
                            of learning.
                        </p>
                    </div>
                </div>

            </div>

            <div
                className="bg-white border border-2 mx-auto text-[15px] mt-5 border-[#0f2d52] section-container">

                <PDFHeader heading="Parent Handbook" />

                <div className="p-4">
                    {/* General Information Section */}
                    <div className="mb-6 space-y-4">
                        <h5 className="text-center text-xl font-bold mb-2 text-[#0f2d52]">General Information</h5>
                        <p className="text-base">
                            The Goddard School® located in Lynnwood, WA is part of a multi-state organization of
                            specialized preschool centers founded in 1984. We are licensed by the State of Washington
                            Department of Early Learning. <br />
                            The Goddard School® is open 12 months a year from 7:00 AM to 6:00 PM Monday through Friday.
                            You will be asked to designate your child’s hours of attendance at the time of enrollment.
                            Please note, Washington State mandates the maximum length of time a child can be in a childcare
                            center at 10 hours per day. Our school policy follows the 10-hour maximum rule and will apply
                            fees to ensure adherence to this rule. A school-closing schedule including holidays, parent-teacher
                            conferences and teacher in-service days will be provided at the time of enrollment.
                        </p>
                    </div>

                    {/* Enrollment Section */}
                    <div className="mb-6 space-y-4">
                        <h5 className="text-center text-xl font-bold mb-2 text-[#0f2d52]">Enrollment Procedure - Class Placement</h5>
                        <p className="text-base">
                            Enrollment is open to any child six (6) weeks to six (6) years of age, provided The Goddard
                            School® can meet his/her needs. Enrollment is granted without discrimination with regard to
                            sex, race, color, religion, or political belief. <br /><br />
                            Interested families are invited to tour the center, meet the staff, review, and complete all
                            paperwork prior to enrollment. Upon receipt of the completed application and registration fee,
                            placement will occur on a first-come, first-serve basis. Prior to a child’s attendance, a school
                            visit with the parent and child is requested to acquaint each new family with the environment,
                            staff, and schedule for the child. Children are grouped by both age and developmental abilities.
                        </p>
                    </div>

                    {/* Agreement Checkbox */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="mission_statement_agreement"
                                name="mission_statement_agreement"
                                checked={checkboxStates.mission_statement_agreement}
                                onChange={(e) => setCheckboxStates(prev => ({ ...prev, mission_statement_agreement: e.target.checked }))}

                                className="w-5 h-5 text-[#0f2d52] border-gray-300 rounded focus:ring-[#0f2d52]"
                            />
                            <label htmlFor="mission_statement_agreement" className="text-base">
                                <strong>I agree all the above information.</strong>
                            </label>
                        </div>
                    </div>

                    {/* Student Records Section */}
                    <div className="mb-6 space-y-2">
                        <h5 className="text-center text-xl font-bold mb-2 text-[#0f2d52]">Student Records</h5>
                        <p className="text-base">
                            Each child enrolled in The Goddard School® must have an updated school record with all
                            Washington State and Goddard required forms. This file is confidential, and will be
                            shared with staff members only, as required to meet the needs of the child.
                        </p>
                    </div>
                </div>
            </div>


            <div
                className="bg-white border border-2 mx-auto text-[15px] mt-5 border-[#0f2d52] section-container">

                <PDFHeader heading="Parent Handbook" />

                <div className="p-4">
                    {/* Emergency Contact Info */}
                    <div className="mb-6 space-y-4">
                        <p className="text-base">
                            Emergency contact information must be reviewed by the parent at least once per calendar
                            year at or before the time the annual enrollment agreement is signed to ensure accuracy.
                            Medical records are required to be updated annually, or whenever the child’s immunization
                            status changes. <br /><br />
                            Upon graduation or withdrawal of a child, a copy of your child’s complete file may be
                            requested in writing. School Districts' requests for documents will require written
                            permission for release by the parent.
                        </p>
                    </div>

                    {/* Agreement Checkbox */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="general_information_agreement"
                                name="general_information_agreement"
                                checked={checkboxStates.general_information_agreement}
                                onChange={(e) => setCheckboxStates(prev => ({ ...prev, general_information_agreement: e.target.checked }))}
                                className="w-5 h-5 text-[#0f2d52] border-gray-300 rounded focus:ring-[#0f2d52]"
                            />
                            <label htmlFor="general_information_agreement" className="text-base">
                                <strong>I agree all the above information.</strong>
                            </label>
                        </div>
                    </div>

                    {/* Statement of Confidentiality */}
                    <div className="mb-6 space-y-4">
                        <h5 className="text-center text-xl font-bold text-[#0f2d52]">Statement Of Confidentiality</h5>
                        <p className="text-base">
                            As a professional organization you can be assured all information regarding your family’s
                            needs, file contents and handling, medical information, and conversations, will be
                            handled with the appropriate confidentiality. Information will be shared only with those
                            people requiring the knowledge to better serve your family.
                        </p>
                    </div>

                    {/* Non-Discrimination Policy */}
                    <div className="mb-6 space-y-4">
                        <h5 className="text-center text-xl font-bold text-[#0f2d52]">Non-Discrimination</h5>
                        <p className="text-base">
                            The Goddard School® located in Lynnwood, WA will not discriminate against students,
                            parents, or staff. We believe that our students have the right to learn and play in an
                            environment that is free from all forms of discrimination. Consistent with applicable
                            laws and The Goddard School’s philosophy, we make all decisions involving enrollment at
                            The Goddard School® without regard to race, creed, religion, color, age, sex, national
                            origin, citizenship, disability, or any other characteristic protected under local, state,
                            or federal law. You are encouraged to raise any questions regarding your equal
                            opportunity at The Goddard School.
                        </p>
                    </div>
                </div>
            </div>

            <div
                className="bg-white border border-2 mx-auto text-[15px] mt-5 border-[#0f2d52] section-container">

                <PDFHeader heading="Parent Handbook" />

                <div className="p-4">
                    {/* Attendance */}
                    <div className="mb-6 space-y-4">
                        <h5 className="text-center text-xl font-bold text-[#0f2d52] mb-2">Attendance</h5>
                        <p className="text-base">
                            A parent should notify The Goddard School® by 9:00 AM by calling 425-882-1100 whenever a
                            child is late or will not be attending on a scheduled day. Teachers attempt to wait until
                            everyone has arrived to begin circle time, so timely notification is appreciated. The school
                            should be notified, as soon as possible, if a child is ill, which enables our staff to track any
                            illness that may occur at the school. We reserve the right to deny entry and attendance if a
                            child arrives after 10am without informing and checking in with school admins.
                        </p>
                    </div>


                    <div className="mb-6">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="medical_care_provider_agreement"
                                name="medical_care_provider_agreement"
                                // checked={checkboxStates.medical_care_provider_agreement}
                                onChange={(e) =>
                                    setCheckboxStates((prev) => ({
                                        ...prev,
                                        medical_care_provider_agreement: e.target.checked,
                                    }))
                                }
                                className="w-5 h-5 text-[#0f2d52] border-gray-300 rounded focus:ring-[#0f2d52]"
                            />
                            <label htmlFor="medical_care_provider_agreement" className="text-base">
                                <strong>I agree all the above information.</strong>
                            </label>
                        </div>
                    </div>

                    {/* Parent Access */}
                    <div className="mb-6 space-y-4">
                        <h5 className="text-center text-xl font-bold text-[#0f2d52] mb-2">Parent Access</h5>
                        <p className="text-base">
                            A parent of a child enrolled in The Goddard School® shall be permitted free access, without
                            prior notice, throughout the school whenever the child is in attendance. In cases where the
                            Family Court or other legal entities have established visitation or custody rights, a copy of
                            the orders must be provided to The Goddard School®. The orders of the court will be strictly
                            followed unless the custodial parent requests a more liberal variation of the court order,
                            which must be in writing. Visitors when accompanied by a student’s parent are asked to
                            schedule appointments and are allowed in the childcare areas only at the discretion of the
                            Director and/or Owner. Visitors will be accompanied by a staff member at all times.
                        </p>
                    </div>

                    {/* Parking and Speed Limit */}
                    <div className="mb-6 space-y-4">
                        <h5 className="text-center text-xl font-bold text-[#0f2d52] mb-2">Parking and Speed Limit</h5>
                        <p className="text-base">
                            The speed limit through the parking area is 5 mph. Parent parking is in front of the building.
                            Parents should not park in the fire lane, as this is reserved for emergency vehicles. Handicap
                            spaces, by Washington State law, must be reserved for vehicles displaying an approved
                            handicap placard. It is unlawful to park in a handicapped designated parking space without
                            a state-issued placard. For the safety of all, children must be accompanied by a parent into
                            the building, using the front door. Children should be held by the hand when walking to or
                            from the building while in the parking lot. Please do not leave any child in your vehicle
                            unattended when dropping off or picking up siblings. Doing so is unsafe and should never
                            happen per RCW 10.52.215.
                        </p>
                    </div>
                </div>
            </div>

            <div
                className="bg-white border border-2 mx-auto text-[15px] mt-5 border-[#0f2d52] section-container">

                <PDFHeader heading="Parent Handbook" />

                <div className="p-4">
                    {/* Arrival and Departure Section */}
                    <div className="mb-6 space-y-4">
                        <h5 className="text-center text-xl font-bold text-[#0f2d52] mb-5">Arrival and Departure</h5>
                        <p className="text-base">
                            Upon arrival each morning, children must be signed in using the electronic devices in the foyer.
                            Children are to be escorted to their designated classroom area and delivered to the supervising
                            staff member. Children are required by law to be under adult supervision at all times. Do not leave
                            any child in a classroom, playground, or common area unattended at any time. Parental involvement
                            will help the child settle quickly into the morning routine. The staff will do anything that they
                            can to assist in a smooth transition. The Goddard School® discourages parents from “sneaking out”
                            of the school. <br /><br />
                            Children attending our program should be settled and ready to begin no later than 10:00 AM. Late
                            arrivals may make a child feel left out since their classmates will already be involved in the day’s
                            activities. Late arrivals also cause a disruption to the other children already in attendance. All
                            late arrivals require preapproval from the administrative staff. We reserve the right not to accept
                            late arrivals without proper notification. <br /><br />
                            When picking up individual children at the end of the day, parents must sign their children out on
                            the appropriate electronic device in the foyer. Attendance is reviewed by Washington State licensing
                            personnel and is used to determine staffing requirements. <br /><br />
                            At pickup/drop off times, please ensure that you are with your child at all times on school property.
                            For example, running through the hallway, parking lots, adult bathrooms, etc. will not be allowed.
                            Once a child is removed from the supervising staff member it becomes the responsibility of the person
                            picking up your child to provide supervision. We advise all parents and guardians to guide your child
                            by hand while in the parking lot for the safety of all.
                        </p>
                    </div>

                    {/* Agreement Checkbox */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="parent_access_agreement"
                                name="parent_access_agreement"
                                checked={checkboxStates.parent_access_agreement}
                                onChange={(e) =>
                                    setCheckboxStates((prev) => ({
                                        ...prev,
                                        parent_access_agreement: e.target.checked,
                                    }))
                                }
                                className="w-5 h-5 text-[#0f2d52] border-gray-300 rounded focus:ring-[#0f2d52]"
                            />
                            <label htmlFor="parent_access_agreement" className="text-base">
                                <strong>I agree all the above information.</strong>
                            </label>
                        </div>
                    </div>
                </div>

            </div>

            <div
                className="bg-white border border-2 mx-auto text-[15px] mt-5 border-[#0f2d52] section-container">

                <PDFHeader heading="Parent Handbook" />
                <div className="p-4">
                    <div className="mb-6 space-y-4">
                        <h5 className="text-center text-xl font-bold text-[#0f2d52] mb-2">Release of Children</h5>

                        <p className="text-base">
                            Since the safety of the children is our utmost concern, The Goddard School® maintains a
                            strict policy regarding the individuals to whom we will release a child. The enrollment
                            forms require a parent to specify at least two (2) individuals to whom the child may be
                            released on an on-going or emergency basis. In addition, parents are asked to specify a
                            password for the release of the child.
                        </p>

                        <p className="text-base">
                            Advance written notice is required for an individual to be authorized to pick up a child.
                            In the case of an emergency, the Director or Owner may be notified by phone as to the
                            name, address, phone number, and brief description of the person picking up the child.
                            The Director or Owner will then call the parent back to verify the authorization. Once this
                            individual arrives at the school, a staff member will verify the individual’s identity by
                            reviewing two forms of identification and the password before the child is released. After
                            confirmation of identity, The Director or Owner will go pick up the child from their
                            designated classroom. The child must still be signed out.
                        </p>

                        <p className="text-base">
                            If a non-custodial parent is not included among those persons authorized by the custodial
                            parent to pick up the child, please inform the Director or Owner. A copy of the appropriate
                            documentation regarding visitation must be included in the child’s school record. This
                            information will remain confidential and will be shared with staff as required, to meet the
                            needs of the child.
                        </p>

                        <p className="text-base">
                            Should an unauthorized individual arrive to pick up a child, a parent or emergency contact
                            will be immediately notified by phone. If the Director is unable to contact a parent or
                            emergency contact, the child will not be released. Should an unauthorized person become
                            uncooperative with the school’s policy regarding the release of the child, the local
                            authorities will be notified.
                        </p>
                    </div>
                </div>
            </div>


            <div
                className="bg-white border border-2 mx-auto text-[15px] mt-5 border-[#0f2d52] section-container">

                <PDFHeader heading="Parent Handbook" />

                <div className="p-4">
                    {/* Impaired Pickup Policy */}
                    <div className="mb-6 space-y-4">
                        <p className="text-base text-gray-800">
                            The Goddard School® will not release a child to any parent, relative, or other authorized
                            adult who appears to be impaired by the use of drugs or alcohol. In the event this
                            situation occurs, a phone call will be made to the parent, emergency contact person,
                            and/or local authorities.
                        </p>
                    </div>

                    {/* Agreement Checkbox */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="release_of_children_agreement"
                                name="release_of_children_agreement"
                                checked={checkboxStates.release_of_children_agreement}
                                onChange={(e) =>
                                    setCheckboxStates((prev) => ({
                                        ...prev,
                                        release_of_children_agreement: e.target.checked,
                                    }))
                                }
                                className="w-5 h-5 text-[#0f2d52] border-gray-300 rounded focus:ring-[#0f2d52]"
                            />
                            <label htmlFor="release_of_children_agreement" className="text-base text-gray-800">
                                <strong>I agree all the above information.</strong>
                            </label>
                        </div>
                    </div>

                    {/* Registration Fee Section */}
                    <div className="mb-6 space-y-4">
                        <h5 className="text-center text-xl font-bold text-[#0f2d52] mb-2">Registration Fee</h5>
                        <p className="text-base text-gray-800">
                            A non-refundable registration fee is payable upon enrollment, and due annually when the
                            child is re-enrolled for each new school year.
                        </p>
                    </div>

                    {/* Tuition Payments and Fees Section */}
                    <div className="mb-6 space-y-4">
                        <h5 className="text-center text-xl font-bold text-[#0f2d52] mb-2">Tuition Payments and Fees</h5>
                        <p className="text-base text-gray-800">
                            Tuition is paid on a monthly basis. Monthly tuition is due on or before the first of each
                            month. A payment box is located outside the office. There will be a service fee of $50 for
                            each check returned by the bank. This fee is due at the time of notification. We offer ACH
                            in order to streamline the process for you, please see the office for paperwork. ACH is run
                            on the 1st of every month.
                        </p>
                        <p className="text-base text-gray-800">
                            Any tuition that is not paid by the close of business on the first day of each month will
                            incur a $50 late fee. An additional notice will then be given to the parent. After the
                            fifteenth (15th) day, the child may not return to the program until the full tuition and
                            late fee charges incurred are paid in full. All unpaid accounts must be rectified
                            immediately or be subject to third party remediation. Please contact the owner if payment
                            difficulties are anticipated so alternative arrangements can be made.
                        </p>
                        <p className="text-base text-gray-800">
                            Monthly tuition fees are non-refundable regardless of holidays, vacation, inclement weather
                            days or School closures resulting from causes beyond the reasonable control of the School
                            or its management including, but not limited to fire, floods, civil commotions, strikes,
                            lockouts or other labor disturbances, “Acts of God” or acts, omissions or delays in acting
                            by any governmental authority. The School and its management will use reasonable efforts to
                            avoid unscheduled closures and will resume operation as soon as feasible.
                        </p>
                    </div>
                </div>



            </div>

            <div
                className="bg-white border border-2 mx-auto text-[15px] mt-5 border-[#0f2d52] section-container">

                <PDFHeader heading="Parent Handbook" />
                <div className="p-4">
                    {/* Weather, Closure, and Late Pick-up Policy */}
                    <div className="mb-6 space-y-4">
                        <p className="text-base text-gray-800">
                            The School will make reasonable efforts to open in inclement weather; however, the School
                            may choose to close at the discretion of the School’s owner. Parents will be notified of
                            any school closures via electronic communication.
                        </p>

                        <p className="text-base text-gray-800">
                            Monthly tuition fees are non-refundable regardless of illness, pandemics, Covid-19, public
                            health crises, government order, or closures mandated by Washington State Department of
                            Health and/or King County Department of Health, or Department of Child, Youth and Families.
                            Parents will be notified of any school closures via electronic communication.
                        </p>

                        <p className="text-base text-gray-800">
                            The School will open at 7:00 AM and close at 6:00 PM, however, modified school hours may
                            apply in case of unforeseen circumstances. A fee will be charged for any child not picked up
                            before the School’s regular closing time. Full-day student late fees begin at 6:31 PM. Half-day
                            student late fees begin at 12:46 PM. This charge shall be $35 per child for the first 5 minutes
                            and an additional $25 per child per 5-minute period thereafter. Fees for late pick-up are
                            added to tuition; if not paid, the child will not be readmitted to the program.
                            Consistent lateness will be cause for the child’s dismissal from the School. We will provide
                            a written notice for the first infraction prior to applying a late fee. If a parent or guardian
                            has not contacted us by 6:30 PM, we are required to inform the proper authorities. Two staff
                            members are required to stay with your child until you arrive.
                        </p>
                    </div>

                    {/* Agreement Checkbox */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="registration_fees_agreement"
                                name="registration_fees_agreement"
                                checked={checkboxStates.registration_fees_agreement}
                                onChange={(e) =>
                                    setCheckboxStates((prev) => ({
                                        ...prev,
                                        registration_fees_agreement: e.target.checked,
                                    }))
                                }
                                className="w-5 h-5 text-[#0f2d52] border-gray-300 rounded focus:ring-[#0f2d52]"
                            />
                            <label htmlFor="registration_fees_agreement" className="text-base text-gray-800">
                                <strong>I agree all the above information.</strong>
                            </label>
                        </div>
                    </div>

                    {/* Outside Engagements Section */}
                    <div className="mb-6 space-y-4">
                        <h5 className="text-center text-xl font-bold text-[#0f2d52] mb-2">Outside Engagements</h5>
                        <p className="text-base text-gray-800">
                            In the event Parents engage employees of the School from time to time for outside child care
                            services (“Outside Engagements”), Parents agree that Outside Engagements are not related to the
                            School, its Owner or Goddard Systems, Inc. With respect to Outside Engagements, Parents release
                            and discharge the School, its Owner and the franchisor of Goddard Schools, Goddard Systems, Inc.
                        </p>
                    </div>
                </div>
            </div>

            <div
                className="bg-white border border-2 mx-auto text-[15px] mt-5 border-[#0f2d52] section-container">

                <PDFHeader heading="Parent Handbook" />

                <div className="p-4">
                    {/* Legal Disclaimer for Outside Engagements */}
                    <div className="mb-6 space-y-4">
                        <p className="text-base text-gray-800">
                            a Pennsylvania corporation, and their present or former officers, employees, shareholders,
                            directors, affiliates, heirs, successors and assigns, in their individual and corporate
                            capacities (the “Owner Releases”), from all claims, demands, liabilities, actions or causes
                            of action whatsoever, whether known or unknown, which Parents have, may have or claim to
                            have at any time in the future against the Owner Releases based in whole or in part on or
                            arising out of or related to any Outside Engagements.
                        </p>

                        {/* Additional Days/Hours */}
                        <h5 className="text-center text-xl font-bold text-[#0f2d52] mb-2">Additional Days/Hours</h5>
                        <p className="text-base text-gray-800">
                            Switching of scheduled days is not allowed. Additional days may be added based on the rates
                            quoted in the enrollment agreement. Parents are required to let the Director or Owner know
                            at least 48 hours in advance if planning to bring a child for an additional day. Additional
                            days are offered based on current enrollment and may not always be available.
                        </p>
                    </div>

                    {/* Agreement Checkbox */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="outside_engagements_agreement"
                                name="outside_engagements_agreement"
                                checked={checkboxStates.outside_engagements_agreement}
                                onChange={(e) =>
                                    setCheckboxStates((prev) => ({
                                        ...prev,
                                        outside_engagements_agreement: e.target.checked,
                                    }))
                                }
                                className="w-5 h-5 text-[#0f2d52] border-gray-300 rounded focus:ring-[#0f2d52]"
                            />
                            <label htmlFor="outside_engagements_agreement" className="text-base text-gray-800">
                                <strong>I agree all the above information.</strong>
                            </label>
                        </div>
                    </div>

                    {/* Health Policies */}
                    <div className="mb-6 space-y-4">
                        <h5 className="text-center text-xl font-bold text-[#0f2d52] mb-2">Health Policies</h5>

                        <p className="text-base text-gray-800">
                            The owners and staff at The Goddard School® do all we can to promote a healthy environment
                            for your children. Our teachers make sure children wash their hands when arriving at school,
                            before meals, after art projects, after toileting and diapering, after coming in from outside,
                            and after wiping one’s nose. Our teachers are required to wash their hands before serving
                            meals or snacks and always wear latex gloves while diapering or assisting a child with
                            toileting and when coming into contact with any bodily fluids. In addition, we disinfect infant
                            and toddler toys on a daily basis. Our preschool toys are disinfected weekly.
                        </p>

                        <p className="text-base text-gray-800">
                            The health of the children is very important to the staff at The Goddard School®. Children
                            who are ill cannot be appropriately cared for in a childcare setting. A child who is unable
                            to participate due to illness should not be in attendance. The Goddard School® staff understands
                            that it may be difficult to make alternate arrangements when a child may be too ill to attend
                            the program.
                        </p>
                    </div>
                </div>
            </div>
            <div
                className="bg-white border border-2 mx-auto text-[15px] mt-5 border-[#0f2d52] section-container">

                <PDFHeader heading="Parent Handbook" />

                <div className="p-4">
                    {/* Health Policy Continuation */}
                    <div className="mb-6 space-y-4">
                        <p className="text-base text-gray-800">
                            However, cooperation in keeping a child home when they are showing symptoms of illness will
                            be greatly appreciated by the teachers and the children who would normally be in contact with
                            that child. By establishing and maintaining a healthy environment and reasonable health
                            policies, all of our children and families will benefit. Please help us in keeping everyone
                            healthy by assisting with washing your child’s hands upon arrival at school (Per WA Licensing
                            Requirements). Goddard reserves the right to decline a child's attendance during times of
                            illness where multiple children and/or staff are out with similar symptoms to contain the
                            illness and reduce the spread.
                        </p>

                        <p className="text-base text-gray-800">
                            If a child does arrive in the morning showing signs of ill health, we will be unable to accept
                            him/her. The exception to this requirement would be that a licensed physician has examined the
                            child and indicated, in writing, that there would be no health risk to your child or others,
                            and the child is capable of participating in all activities, including outdoor play. Fever is
                            an indication that the body is fighting something, and we need to be sure that children are not
                            attending school who have been medicated to reduce the fever. Children continue to be
                            contagious even when a fever is controlled by a fever-reducing medication.
                        </p>

                        <p className="text-base text-gray-800">
                            Examples of health symptoms that require exclusion from the program include, but are not
                            limited to:
                        </p>

                        <ul className="list-disc list-inside text-base text-gray-800 pl-4 space-y-1">
                            <li>Severe pain or discomfort particularly in joints, abdomen, or ears</li>
                            <li>Vomiting (2 or more incidents within a 24-hour period)</li>
                            <li>Diarrhea (3 or more within a 24-hour period)</li>
                            <li>Severe coughing or sore throat</li>
                            <li>
                                Temperature of 100° or more and/or accompanied by other behavior
                                changes/symptoms
                            </li>
                            <li>Jaundice (yellow) skin or eyes</li>
                            <li>
                                Eye discharge or conjunctivitis (pink eye) until clear or until 24 hours of antibiotic
                                treatment
                            </li>
                            <li>
                                Infected, untreated skin patches/lesions or severe itching of body/scalp
                            </li>
                            <li>Difficult or rapid breathing</li>
                            <li>
                                Skin rashes (excluding diaper rash) especially with fever or itching
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div
                className="bg-white border border-2 mx-auto text-[15px] mt-5 border-[#0f2d52] section-container">

                <PDFHeader heading="Parent Handbook" />

                <div className="p-4">
                    <div className="mb-6 space-y-4 text-base text-gray-800">
                        {/* Additional symptoms list */}
                        <ul className="list-disc list-inside pl-4 space-y-1">
                            <li>Swollen joints, visibly enlarged lymph nodes, or stiff neck</li>
                            <li>Blood/pus from ears, skin, urine, stool</li>
                            <li>
                                Unusual behavior characterized by listlessness, loss of normal appetite, or confusion
                            </li>
                            <li>
                                Symptoms of chicken pox, impetigo, lice, scabies, or strep throat
                            </li>
                        </ul>

                        {/* Ill child procedure */}
                        <p>
                            If a child becomes ill during the day, a parent will be advised immediately. The child will
                            be given the opportunity to rest or have other activities in a separated, supervised area
                            until a designated release person can pick up the child. If the child is not picked up within
                            one hour from the time of notification, the emergency contact person will be called.
                        </p>
                        <p>
                            Children who are sent home due to illness will not be readmitted to the school until all
                            signs of illness have been gone for 24 hours—this typically includes the day the child is sent
                            home and the following full day. Therefore, a child who is sent home ill cannot return to
                            school the following day.
                        </p>
                        <p>
                            The exception to this requirement would be that a licensed physician has examined the child
                            and has indicated in writing that the child does not present a health threat to him/her or
                            others and is able to participate in all school activities, including outdoor play.
                        </p>

                        {/* Communicable diseases */}
                        <p>
                            In cases of certain communicable diseases, The Goddard School® is required to file a report
                            with the Department of Health within 24 hours, so control measures can be used. Parents and
                            staff are reminded to notify The Goddard School® within 24 hours if a child or family member
                            has developed a known or suspected communicable disease. If a child has not been fully
                            immunized for these diseases (due to the child’s age, medical condition, or religious belief)
                            they will be excluded from the school during the outbreak of a vaccine-preventable disease, as
                            directed by Washington State Department of Health.
                        </p>

                        <p>
                            All parents will be informed in writing if a communicable disease is reported. The Goddard
                            School® follows the reporting guidelines as established by the Washington State Department of
                            Health. A copy of the health policy is on file in the Director’s office and is available for
                            your review.
                        </p>
                    </div>
                </div>

            </div>

            <div
                className="bg-white border border-2 mx-auto text-[15px] mt-5 border-[#0f2d52] section-container">

                <PDFHeader heading="Parent Handbook" />

                <div className="p-4 text-base text-gray-800">
                    {/* “No Nit” Policy */}
                    <h6 className="text-lg font-bold mb-2">“No Nit” Policy</h6>
                    <p className="mb-4">
                        The Goddard School has determined the best way to prevent head lice is to institute a “no nit” policy at our school. We
                        will periodically check the children in our school for head lice. If a child is found to have head lice, they will need
                        to be picked up immediately. Before returning to class, the child should be brought to the office to be checked for
                        nits. Once the child is determined to be free of nits, they may rejoin their class.
                    </p>

                    {/* Checkbox agreement */}
                    <div className="flex items-center gap-2 mb-6">
                        <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 text-blue-600"
                            id="health_policies_agreement"
                            name="health_policies_agreement"
                            checked={checkboxStates.health_policies_agreement}
                            onChange={(e) =>
                                setCheckboxStates((prev) => ({ ...prev, health_policies_agreement: e.target.checked }))
                            }
                        />
                        <label htmlFor="health_policies_agreement" className="font-semibold">
                            I agree all the above information.
                        </label>
                    </div>

                    {/* Medication Procedures */}
                    <h5 className="text-center text-xl font-bold mb-4">Medication Procedures</h5>
                    <h6 className="text-lg font-bold mb-2">General Information on Medications</h6>
                    <p className="mb-4">
                        The Goddard School in Lynnwood administers only life-saving medication such as EPI-Pen’s, Benadryl, Inhalers, etc.
                    </p>
                    <p className="mb-4">
                        The medication logs and authorization forms are located in the Director’s office. Authorization forms must be
                        completed by the parent or guardian and given to the Director prior to any medication being administered. This will
                        serve as a second method to ensure that your child receives his/her medication.
                    </p>
                    <p className="mb-4">
                        Check expiration dates on all medications. We will not be able to administer expired medications even if the log and
                        form are completed.
                    </p>
                    <p className="mb-4">
                        Every medication needs to have a pharmacy label with the child’s first and last name printed on the bottle. Only one
                        bottle may be used for each child. Siblings may not share containers of medication.
                    </p>
                    <p>
                        Over-the-counter medications will not be given even with a doctor’s note.
                    </p>
                </div>
            </div>

            <div
                className="bg-white border border-2 mx-auto text-[15px] mt-5 border-[#0f2d52] section-container">

                <PDFHeader heading="Parent Handbook" />

                <div className="p-4 text-base text-gray-800">
                    {/* Request for Medication to be Dispensed */}
                    <div className="mb-6">
                        <h6 className="text-lg font-bold mb-2">Request for Medication to be Dispensed</h6>
                        <p>
                            No over-the-counter medication will be dispensed. All medication must be a prescription prescribed by a doctor
                            and have a pharmacy label and medication number. When a child needs medication, 2 forms must be completed. The
                            first form is the medication log. The log needs to be completed each day the child is to receive medication. A
                            parent must indicate a specific time and dosage of medication to be dispensed. Medication will not be dispensed
                            on an “as needed” basis. The second form is the authorization for dispensing medication. Medication will only be
                            dispensed for the dates indicated on the form. The authorization form should be given directly to the Director.
                        </p>
                    </div>

                    {/* Allergies That May Require Medication */}
                    <div className="mb-6">
                        <h6 className="text-lg font-bold mb-2">Allergies That May Require Medication</h6>
                        <p>
                            If a child requires over-the-counter diaper ointments, lotions, lip balm, or sunscreen, these must be labeled
                            with the child’s first and last name. The parent must complete an authorization form for each type of ointment or
                            lotion. This authorization is good for one year. If diaper ointments are applied, it will be noted on the child’s
                            daily report. These ointments and lotions must be placed in a designated container in the teacher closet or
                            cabinet and remain at school overnight.
                        </p>
                    </div>

                    {/* Topical Medications */}
                    <div className="mb-6">
                        <h6 className="text-lg font-bold mb-2">Topical Medications (Diaper Creams, Sun Screens, Etc.)</h6>
                        <p>
                            If a child requires over-the-counter diaper ointments, lotions, lip balm, or sunscreen, these must be labeled
                            with the child’s first and last name. The parent must complete an authorization form for each type of ointment or
                            lotion. This authorization is good for one year. If diaper ointments are applied, it will be noted on the child’s
                            daily report. These ointments and lotions must be placed in a designated container in the teacher closet or
                            cabinet and remain at school overnight.
                        </p>
                    </div>
                </div>
            </div>

            <div
                className="bg-white border border-2 mx-auto text-[15px] mt-5 border-[#0f2d52] section-container">

                <PDFHeader heading="Parent Handbook" />
                <div className="p-4 text-base text-gray-800">
                    {/* Accidents and Injury */}
                    <div className="mb-6">
                        <h5 className="text-center text-xl font-bold mb-4">Accidents and Injury</h5>
                        <p className="mb-3">
                            Should a child become injured at school, the parent will be notified via an accident report form. In the event
                            of an injury above the shoulders, an email notification or phone call will be made. The parents will be asked
                            to sign this form indicating that they have been notified, and a copy of the form will be included in the
                            child’s school record. If the injury is of a serious nature, a parent will receive a phone call from the school
                            at the time the accident occurs.
                        </p>
                        <p>
                            In the event of an emergency, the child will be transported via ambulance to the nearest hospital or emergency
                            room facility and a parent will be contacted to meet an accompanying staff member at the facility. It is
                            extremely important that emergency contact information for your child is up to date. A child cannot be
                            transported for care, or receive any emergency care at school, unless the waivers for emergency care have been
                            signed. These waivers are included in the enrollment packet.
                        </p>

                        <div className="flex items-center gap-2 mt-4">
                            <input
                                type="checkbox"
                                className="custom-checkbox"
                                id="medication_procedures_agreement"
                                name="medication_procedures_agreement"
                                checked={checkboxStates.medication_procedures_agreement}
                                onChange={(e) =>
                                    setCheckboxStates((prev) => ({
                                        ...prev,
                                        medication_procedures_agreement: e.target.checked,
                                    }))
                                }
                            />
                            <label htmlFor="medication_procedures_agreement" className="font-semibold">
                                I agree all the above information.
                            </label>
                        </div>
                    </div>

                    {/* Toys From Home */}
                    <div className="mb-6">
                        <h5 className="text-center text-xl font-bold mb-4">Toys From Home</h5>
                        <p className="mb-3">
                            It is recommended that all personal toys remain at home. It is very difficult for young children to share
                            favorite possessions, and all toys that enter the school must be shared. In addition, many toys break easily and
                            contain small parts. These types of toys may be inappropriate for our setting.
                        </p>
                        <p>
                            Show and tell items may occasionally be requested by a child’s teacher. Suggested show and tell items include
                            books, photographs, special treasures such as seashells, or theme related items. These should be discussed with
                            the teacher and items will be shown at the teacher’s discretion. Anything pertaining to violence (guns, war toys,
                            etc.) or having anything to do with religious beliefs cannot be utilized at The Goddard School®. Material deemed
                            inappropriate for a preschool audience will not be used. All electronic devices from home are not permitted at
                            school.
                        </p>
                    </div>
                </div>
            </div>

            <div
                className="bg-white border border-2 mx-auto text-[15px] mt-5 border-[#0f2d52] section-container">

                <PDFHeader heading="Parent Handbook" />

                <div className="p-4 text-base text-gray-800">
                    <h5 className="text-center text-xl font-bold mb-2">Items to Bring to School</h5>

                    {/* Infants Section */}
                    <h6 className="text-lg font-semibold mb-1">Infants</h6>
                    <p className="mb-3">
                        Each infant is provided with their own crib and mattress upon enrollment. The parent must provide:
                    </p>
                    <ul className="list-disc pl-6 mb-3 space-y-1">
                        <li>2–3 crib sheets (port-a-crib or play yard size)</li>
                        <li>A sleep sac when appropriate</li>
                        <li>2–3 complete changes of clothing for the appropriate season</li>
                        <li>Diapers and wipes, diaper cream if needed</li>
                        <li>All food, drink, and utensils required to serve food</li>
                        <li>Sweater or sweatshirt, mittens and hat</li>
                    </ul>
                    <p className="mb-6">
                        Parents are responsible for washing the crib linens at least once a week. Diaper creams and lotions are
                        considered medication and therefore must be accompanied by Goddard’s authorization form.
                        <br />
                        All food, bottles, and clothing must be labeled with the child’s first and last name. Bottles and caps will
                        need to be re-labeled frequently. Any items required for serving food such as spoons, bowls, cups, etc. must
                        also be provided and labeled by the parent. Bottles must be filled at home and brought to school ready to
                        serve. Please do not send anything in glass jars or bottles. Refrigeration is provided for storing bottles and
                        food.
                    </p>

                    {/* Toddlers and Preschoolers Section */}
                    <h6 className="text-lg font-semibold mb-1">Toddlers and Preschoolers</h6>
                    <p className="mb-3">
                        The parent must provide the following items for each toddler and/or preschooler:
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Two full changes of clothing including socks and shoes</li>
                        <li>Meals must be provided daily in a labeled lunch box</li>
                        <li>
                            Water cup daily, labeled with first and last name – No bottles/silicone nipples or pacifiers please
                        </li>
                        <li>
                            Diapers and wipes, and/or extra sets of underwear if the child is “in training”
                        </li>
                        <li>
                            A small blanket and sheet is requested for nap time, and a favorite sleep toy may also be provided
                        </li>
                    </ul>
                </div>
            </div>

            <div
                className="bg-white border border-2 mx-auto text-[15px] mt-5 border-[#0f2d52] section-container">

                <PDFHeader heading="Parent Handbook" />

                <div className="p-4 text-base text-gray-800">

                    {/* Items to Bring Agreement */}
                    <div className="mb-6">
                        <p className="mb-4">
                            All items brought to school should be conspicuously labeled with the child’s first and last name.
                            Extra clothing should be provided as seasons change and as the child grows. Rubber-soled, closed-toe
                            shoes, such as sneakers, are the most appropriate shoes for daily activities like climbing, running,
                            and outdoor play. Appropriate outdoor apparel is needed daily, even during winter months.
                            Please label detachable clothing where possible (e.g., hoods, mittens), to reduce loss.
                            Additional sets of clothing and underwear will be required during potty training.
                            Blankets are sent home weekly for laundering.
                        </p>

                        <div className="form-group flex items-center gap-2">
                            <input
                                type="checkbox"
                                className="input-checkbox custom-checkbox"
                                id="bring_to_school_agreement"
                                name="bring_to_school_agreement"
                                checked={checkboxStates.bring_to_school_agreement}
                                onChange={(e) =>
                                    setCheckboxStates((prev) => ({
                                        ...prev,
                                        bring_to_school_agreement: e.target.checked,
                                    }))
                                }
                            />
                            <label className="form-check-label" htmlFor="bring_to_school_agreement">
                                <span className="font-bold">I agree all the above information.</span>
                            </label>
                        </div>
                    </div>

                    {/* Rest Time Section */}
                    <div className="mb-6">
                        <h5 className="text-center text-xl font-bold mb-2">Rest Time</h5>

                        <p className="mb-3">
                            Children in the Toddler and Preschool classes are required to lie quietly on their sleeping mats for
                            approximately 30–45 minutes daily. This allows children who wish to sleep a quiet space to rest.
                            During this period, lights are dimmed, soft music is played, and non-napping children can engage
                            in quiet activities like puzzles or books.
                        </p>
                        <p className="mb-3">
                            Pre-Kindergarten classrooms are non-napping. Although we do our best to meet individual rest needs,
                            we cannot guarantee exact nap or wake-up times, as they vary depending on the child’s activity level,
                            previous night’s sleep, and overall routine. Children who want to rest will not be kept awake, as
                            this goes against our child-centered philosophy.
                        </p>
                        <p>
                            Infants will nap according to their individual schedules. Those unable to roll over independently
                            will be placed on their backs unless a physician’s note provides alternate instructions.
                        </p>
                    </div>
                </div>

            </div>

            <div
                className="bg-white border border-2 mx-auto text-[15px] mt-5 border-[#0f2d52] section-container">

                <PDFHeader heading="Parent Handbook" />

                <div className="p-4 text-base text-gray-800">
                    <h5 className="text-center text-xl font-bold mb-4">Meals and Snacks</h5>

                    <p className="mb-4">
                        The Goddard School® has found that parents prefer to provide lunch for their children. This allows parents
                        to send meals that suit their child’s individual needs and preferences. Children enrolled in the morning
                        preschool program are encouraged to join their classmates for lunch and socialization. After lunch, there
                        is a natural break in the day for morning children to depart, as full-day children prepare for rest time.
                    </p>

                    <p className="mb-4">
                        The Goddard School® provides morning and afternoon snacks daily. These may include crackers, Cheerios,
                        pretzels, graham crackers, and occasionally fresh fruits and vegetables. Beverages may include water, milk,
                        or 100% fruit juice. The snack menu is posted in the kitchen and emailed to parents at the beginning of
                        each month.
                    </p>

                    <p className="mb-4">
                        Parents of infants must send **prepared bottles** of breast milk or formula, clearly labeled with the child’s
                        first and last name, contents, and date. Mothers may arrange to breastfeed at school. A written feeding
                        schedule must be provided and updated as needed when new foods are introduced.
                    </p>

                    <p className="mb-4">
                        Infant bottles will be reheated using a bottle warmer, shaken, and tested for temperature before feeding.
                        Any remaining contents will be discarded after:
                    </p>

                    <ul className="list-disc list-inside pl-5 mb-4">
                        <li>45 minutes for breast milk</li>
                        <li>1 hour for formula</li>
                    </ul>

                    <p className="mb-4">
                        Parents are advised to send bottles filled only with the amount their child typically drinks. For younger
                        infants, 4 oz. bottles may be more appropriate. Once solid foods are introduced, parents must provide
                        labeled plastic containers with portioned food. No glass jars are permitted. Each container should include:
                    </p>

                    <ul className="list-disc list-inside pl-5 mb-4">
                        <li>Child’s first and last name</li>
                        <li>Date</li>
                        <li>Clearly labeled contents</li>
                    </ul>
                </div>

            </div>

            <div
                className="bg-white border border-2 mx-auto text-[15px] mt-5 border-[#0f2d52] section-container">

                <PDFHeader heading="Parent Handbook" />

                <div className="p-4 text-base text-gray-800">
                    <div className="mb-4">
                        <p className="mb-4">
                            All infant food should be placed in the refrigerator in the child’s individual box upon arrival. In warm
                            weather, perishable food should be transported in an insulated cooler. Any food or drink not consumed during
                            scheduled mealtimes will be discarded and noted in the child’s daily report. Unopened items may be saved until
                            the end of the day, but all bottles and food must be taken home daily.
                        </p>

                        <p className="mb-4">
                            Breakfast from home may be provided for children arriving **before 8:00 AM**. All food must be ready to serve.
                            If any preparation is needed, parents must assist, as staff will be supervising both play and eating. Children
                            arriving **after 8:00 AM** should eat breakfast at home. A mid-morning snack is served daily between 9:00 AM
                            and 10:00 AM.
                        </p>

                        <p className="mb-4">
                            Recommended lunch items include sandwiches, yogurt, soup, fruit, crackers, and cheese—ensuring a serving from
                            each food group. Please avoid foods with excessive sugar, preservatives, artificial colors/flavorings, or
                            caffeine. Lunches must be **ready to serve** (e.g., fruit peeled, soup in microwave-safe containers).
                        </p>

                        <p className="mb-4">
                            Refrigerated items must be labeled with the child’s **first and last name** and placed in the designated tray
                            in the classroom. These trays are stored in the kitchen refrigerator. Bibs, bottles, cups, bowls, and spoons
                            **must be taken home daily** — per Washington State Department of Health guidelines, these items cannot be
                            washed or stored at school. Initials are not accepted for labeling.
                        </p>

                        <p className="mb-4">
                            Teachers encourage children to eat balanced meals. However, children’s food preferences are respected, and
                            unopened items will remain in the lunchbox. Opened food cannot be saved. To support parent awareness, teachers
                            may take pictures of children’s meals after eating to show what was consumed. Please refer to your child’s
                            daily report for details about appetite and meal intake.
                        </p>
                    </div>
                </div>

            </div>

            <div
                className="bg-white border border-2 mx-auto text-[15px] mt-5 border-[#0f2d52] section-container">

                <PDFHeader heading="Parent Handbook" />
                <div className="p-4 text-base text-gray-800">
                    <p className="mb-4">
                        Children grow so fast and before you know it, they are ready to move to the next classroom. The Goddard
                        School® staff is trained to transfer the trust your child has in their current teachers and classrooms to the
                        next. Prior to any transition, you will be notified in writing of your child’s progress and readiness to move
                        to the next level. When transitions take place, particularly in summer and fall, your child will likely remain
                        in the same class for approximately 9 months if they are in Get Set, Toddler, Pre-Toddler, or First Steps.
                    </p>

                    <div className="row m-1 mb-4">
                        <div className="form-group d-flex items-center gap-2">
                            <input
                                type="checkbox"
                                className="input-checkbox custom-checkbox"
                                id="rest_time_agreement"
                                name="rest_time_agreement"
                                checked={checkboxStates.rest_time_agreement}
                                onChange={(e) =>
                                    setCheckboxStates((prev) => ({
                                        ...prev,
                                        rest_time_agreement: e.target.checked,
                                    }))
                                }
                            />
                            <label className="form-check-label" htmlFor="rest_time_agreement">
                                <span>
                                    <b>I agree all the above information.</b>
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="row m-1 mb-6">
                        <h5 className="text-center mb-3 font-bold text-lg">Transition</h5>
                        <p className="mb-4">
                            Preschool and Pre-Kindergarten classes typically last a full year. Occasionally, changes occur based on
                            classroom needs, and you will be notified through a transition letter. You are welcome to schedule a
                            conference with either your child’s current or future teacher(s) to discuss needs. The transition letter will
                            explain the process and how you can support a smooth experience. During transitions, children’s attendance is
                            tracked in both classrooms to ensure proper adult supervision.
                        </p>

                        <h5 className="text-center mb-3 font-bold text-lg">Toilet Training Philosophy</h5>
                        <p>
                            Toilet training is one of many developmental milestones typically reached between the ages of 2½ and 3.
                            Goddard School®'s “Get Set” program provides consistent opportunities to foster toilet training. While this
                            skill is emphasized, academic activities for older 2’s and young 3’s continue daily. Children will not
                            transition into the Preschool class until they are fully potty-trained and wear underwear (not pull-ups)
                            throughout the day. Potty-training also includes the ability to independently dress and undress, properly
                            wipe, communicate bathroom needs, and maintain control during daily transitions.
                        </p>
                    </div>
                </div>


            </div>

            <div
                className="bg-white border border-2 mx-auto text-[15px] mt-5 border-[#0f2d52] section-container">

                <PDFHeader heading="Parent Handbook" />

                <div className="p-4 text-gray-800 text-base">
                    <h5 className="text-center mb-4 font-bold text-lg">Potty Training Policy</h5>

                    <p className="mb-4">
                        Once your child has entered our older toddler classroom, we will begin the potty training process when:
                    </p>
                    <ul className="list-decimal list-inside mb-4 ml-4">
                        <li>Your child begins to show interest, typically around the age of 2½ years old. This may look like the child wanting to go into the bathroom, using potty-related words such as "I'm wet", "I'm poopy", being able to dress/undress, or indicating a need to eliminate.</li>
                        <li>Parents are ready to consistently potty train at home.</li>
                    </ul>

                    <p className="mb-4">
                        It is essential that parents and teachers work as a team to create a fun, engaging atmosphere for the potty-training process. We use positive reinforcement like big praise, songs, and fun rituals such as princess twirls and superhero high-fives. We do not use food or physical rewards. Consistent communication between parents and teachers is key.
                    </p>

                    <p className="mb-4">
                        Potty training starts when a child shows interest in going to the bathroom and learning to pull up and down their pants—usually around 2½ years old. Some children may show readiness earlier, and we support them if they demonstrate the indicators naturally. We begin asking questions like “Are you wet?” or “Are you poopy?” to help them identify those feelings. Stand-up diaper changes are introduced, and children are encouraged to sit on the potty every two hours. We never force potty use but encourage participation with positive feedback.
                    </p>

                    <p className="mb-4">
                        Parents should model potty use and encourage their child to try before leaving home or when the parent uses the bathroom. Once potty training begins, consistency from both school and home is crucial—even if the process is challenging at times.
                    </p>

                    <div className="form-group d-flex items-center gap-2 mt-4">
                        <input
                            type="checkbox"
                            className="input-checkbox custom-checkbox"
                            id="potty_training_agreement"
                            name="potty_training_agreement"
                            checked={checkboxStates.potty_training_agreement}
                            onChange={(e) =>
                                setCheckboxStates((prev) => ({
                                    ...prev,
                                    potty_training_agreement: e.target.checked,
                                }))
                            }
                        />
                        <label className="form-check-label" htmlFor="potty_training_agreement">
                            <span>
                                <b>I agree all the above information.</b>
                            </span>
                        </label>
                    </div>
                </div>



            </div>

            <div
                className="bg-white border border-2 mx-auto text-[15px] mt-5 border-[#0f2d52] section-container">

                <PDFHeader heading="Parent Handbook" />

                <div className="p-4 text-gray-800 text-base">
                    <h5 className="text-center mb-4 font-bold text-lg">Moving from Diapers to Underwear</h5>

                    <p className="mb-4">
                        We reserve the right to require a child stay in diapers/pull-ups until they can go multiple hours with a dry diaper
                        and are able to tell us that they need to use the bathroom via clear gestures or verbal interaction. If a child begins
                        wearing underwear and consistently has 2 or more accidents a day, they are not ready for underwear yet. Some children
                        may choose to wear underwear over their diaper, which is acceptable.
                    </p>

                    <p className="mb-4">
                        During the potty-training process, it is important that families bring in 2–3 sets of extra clothes including an extra
                        pair of shoes/sneakers. Families are encouraged to take their child to the potty before leaving the classroom for the
                        day. The definition of being fully potty trained includes pulling up and down their own pants/underwear, wiping
                        independently, washing hands independently, and being able to let a teacher know they need the bathroom — for a
                        minimum period of 2 weeks with no accidents.
                    </p>

                    <p className="mb-6">
                        During this process, diapers should be replaced by training pants or pull-ups, and then by regular underwear. As
                        accidents are inevitable, a sufficient supply should be on hand, along with season-appropriate clothing changes.
                    </p>

                    <h5 className="text-center mb-3 font-bold text-lg">Field Trips</h5>

                    <p className="mb-4">
                        As part of The Goddard School® program, periodic walking field trips will be planned to provide the children with
                        exposure to learning experiences in our local community. Prior to each trip, information will be sent home outlining
                        the date, time, cost, location, chaperones, etc.
                    </p>

                    <p className="mb-4">
                        A permission slip is required and must be signed by a parent and returned to the supervising teacher by the date
                        requested on the form. No child will be permitted to attend a field trip if the required permission slip is not on file.
                        Children must be four (4) years of age or older to participate in walking field trips. Ratios for field trips are 1
                        teacher/staff member or chaperone per 5 children.
                    </p>

                    <div className="form-group d-flex items-center gap-2 mt-4">
                        <input
                            type="checkbox"
                            className="input-checkbox custom-checkbox"
                            id="field_trip_agreement"
                            name="field_trip_agreement"
                            checked={checkboxStates.field_trip_agreement}
                            onChange={(e) =>
                                setCheckboxStates((prev) => ({
                                    ...prev,
                                    field_trip_agreement: e.target.checked,
                                }))
                            }
                        />
                        <label className="form-check-label" htmlFor="field_trip_agreement">
                            <span>
                                <b>I agree all the above information.</b>
                            </span>
                        </label>
                    </div>
                </div>

            </div>

            <div
                className="bg-white border border-2 mx-auto text-[15px] mt-5 border-[#0f2d52] section-container">

                <PDFHeader heading="Parent Handbook" />

                <div className="p-4 text-gray-800 text-base">
                    {/* Birthday Celebration */}
                    <div className="mb-6">
                        <h5 className="text-center font-bold text-lg mb-2">Celebration of a Child’s Birthday</h5>
                        <p className="mb-3">
                            The celebration of a child’s birthday at school with their friends can be a wonderful lifetime memory.
                            In planning these moments, please consider the nutritional needs and requirements of all the children
                            in the class. Special treats must be store purchased and arrive at the school in their original store
                            container. Please provide the teacher with advance notice of what will be brought and coordinate the
                            date and time with the teacher. We have a wonderful list of suggestions — please ask the Director or
                            Owner for a copy.
                        </p>
                        <p className="mb-5">
                            Please contact the Director or Owner for assistance in any special event planning at the school.
                        </p>
                    </div>

                    {/* Smoking Policy */}
                    <div className="mb-6">
                        <h5 className="text-center font-bold text-lg mb-2">Smoking</h5>
                        <p>
                            It is our desire that the environment around the children be as safe and healthy as possible.
                            Therefore, The Goddard School® is a smoke-free environment — both inside the building and on school
                            grounds. Parents, faculty, staff, and visitors are asked to comply with this request.
                        </p>
                    </div>

                    {/* Checkbox Agreement */}
                    <div className="flex items-center gap-2 mb-6">
                        <input
                            type="checkbox"
                            className="w-5 h-5"
                            id="training_philosophy_agreement"
                            name="training_philosophy_agreement"
                            checked={checkboxStates.training_philosophy_agreement}
                            onChange={(e) =>
                                setCheckboxStates((prev) => ({
                                    ...prev,
                                    training_philosophy_agreement: e.target.checked,
                                }))
                            }
                        />
                        <label htmlFor="training_philosophy_agreement" className="font-semibold">
                            I agree all the above information.
                        </label>
                    </div>

                    {/* Emergency Closings */}
                    <div>
                        <h5 className="text-center font-bold text-lg mb-3">Emergency Closings</h5>
                        <p className="mb-2">
                            The Goddard School® will make every effort to open on time and remain open in the event of inclement weather.
                            However, in the case of extremely dangerous road conditions or declared states of emergency, it may be necessary
                            for the school to cancel, delay opening, or dismiss early.
                        </p>
                        <p>
                            We will send notifications via Kaymbu, Email, and Text Message as soon as possible. Should parents be prevented
                            by weather conditions from reaching the facility to pick up their children, please arrange for an alternate pickup.
                            Closing staff members will remain with the children and maintain proper staff-child ratios until parents can
                            safely arrive.
                        </p>
                    </div>
                </div>
            </div>

            <div
                className="bg-white border border-2 mx-auto text-[15px] mt-5 border-[#0f2d52] section-container">

                <PDFHeader heading="Parent Handbook" />
                <div className="p-4 text-gray-800 text-base">
                    {/* Emergency Evacuation */}
                    <div className="mb-6">
                        <p className="mb-4">
                            Should the building require emergency evacuation, the staff-child ratios will be maintained, and the children will
                            be evacuated to a nearby location. Each staff member responsible for a group of children will carry emergency contact
                            information and class attendance records with them to the new site. Parents will be contacted by telephone as to the
                            location of the children, or by radio broadcast if phone transmission is not possible. Depending on the circumstances,
                            parents may be requested to pick up their children, or arrange for the emergency contact person to pick them up.
                        </p>
                    </div>

                    {/* Religious Affiliation */}
                    <div className="mb-6">
                        <h5 className="text-center font-bold text-lg mb-2">Religious Affiliation</h5>
                        <p>
                            The Goddard School located in Lynnwood, WA claims to have no association with a church or religious affiliation.
                            Our staff abides by The Goddard School guidelines for the separation of church and school.
                        </p>
                    </div>

                    {/* Policies */}
                    <div className="mb-6">
                        <h5 className="text-center font-bold text-lg mb-2">Policies</h5>
                        <p className="mb-3">
                            This handbook of policies and procedures is reviewed by the Owner and Director annually or upon state regulatory changes.
                            Should changes occur, you will be notified of the changes and the effective date of the changes.
                        </p>
                        <p className="mb-4">
                            Additionally, all policies are available in the Owner’s Office as well as on Goddard Family Connect,
                            including the Bloodborne Pathogens Policy and the Pesticide Policy.
                        </p>

                        {/* Agreement Checkbox */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                className="w-5 h-5"
                                id="affiliation_policy_agreement"
                                name="affiliation_policy_agreement"
                                checked={checkboxStates.affiliation_policy_agreement}
                                onChange={(e) =>
                                    setCheckboxStates((prev) => ({
                                        ...prev,
                                        affiliation_policy_agreement: e.target.checked,
                                    }))
                                }
                            />
                            <label htmlFor="affiliation_policy_agreement" className="font-semibold">
                                I agree all the above information.
                            </label>
                        </div>
                    </div>
                </div>

            </div>

            <div
                className="bg-white border border-2 mx-auto text-[15px] mt-5 border-[#0f2d52] section-container">

                <PDFHeader heading="Parent Handbook" />

                <div className="p-4 text-gray-800 text-base">
                    {/* Websites, Blogs, and Security Issues */}
                    <h5 className="text-center font-bold text-lg mb-4">
                        Websites, Blogs and Security Issues
                    </h5>
                    <p className="mb-4">
                        Out of concern for child safety, we do not permit the use of The Goddard School name or service mark,
                        including logos, photographs of school grounds, and photographs of any child, parent, or employee of the school,
                        to be posted on a website, blog, or online social network without written permission from The Goddard School.
                        If you wish to share information about The Goddard School in this manner, please check with your on-site owner
                        or school director. We also have a Social Media Policy if you would like a copy for your information.
                    </p>

                    {/* Child Abuse or Neglect */}
                    <h5 className="text-center font-bold text-lg mb-4">
                        Reporting of Suspected Child Abuse or Neglect
                    </h5>
                    <p className="mb-4">
                        Every school is required by law to notify state authorities if there is knowledge or suspicion of physical or
                        sexual abuse of children in or outside of school. The Goddard School located in Lynnwood, WA complies with this
                        law and cooperates with authorities in investigations.
                    </p>

                    {/* Behavior Policy */}
                    <h5 className="text-center font-bold text-lg mb-4">Behavior Policy</h5>
                    <p className="mb-4">
                        It is the policy of The Goddard School® to keep disciplinary issues minimized and to help children monitor
                        their own behavior. The staff of The Goddard School® present and model age-appropriate behavioral guidelines and
                        use reflective communication to encourage children to express their emotions. The staff encourages self-control,
                        self-direction, responsibility, and cooperation. At this time practical and safe, logical, or natural consequences
                        will be presented to the child. The Goddard School® staff are trained in the process of positive discipline.
                    </p>
                    <p>
                        Positive discipline instructs children as to what they should do. For example: “We walk inside the building”
                        vs. “No running!” This philosophy of behavior is in accordance with The Goddard School® belief that children
                        learn best in an environment where love, guidance, and encouragement promote the development of self-esteem.
                    </p>
                </div>




            </div>

            <div
                className="bg-white border border-2 mx-auto text-[15px] mt-5 border-[#0f2d52] section-container">

                <PDFHeader heading="Parent Handbook" />

                <div className="p-4 text-gray-800 text-base">
                    <div>
                        <p className="mb-4">
                            “Quiet time” may be used selectively for children over 18 months of age who are at risk of harming themselves or others.
                            “Quiet time” is used as a last resort after several attempts of redirection have been made. The period of “quiet time”
                            will be just long enough to enable the child to regain control of him or herself and will never be longer than 1–2 minutes
                            per year of age. During the “quiet time” period, the child will be in an area where they may be visually observed by a
                            teacher or Director.
                        </p>

                        <p>
                            Aggressive physical behavior (fighting, hitting, biting, etc.) by a child toward another child or staff member is unacceptable.
                            Staff members will intervene immediately should this type of situation occur, in order to protect all of the children and
                            encourage more acceptable behavior. Physical restraint (a teacher holding a child) will not be used except as necessary to
                            ensure a child’s safety or that of others, and then only for as long as is necessary for control of the situation.
                            Children will be shown positive alternatives rather than just being told “no”.
                            <br /><br />
                            Parents will be informed if such an incident occurs, and a conference may be requested at any time to discuss an acceptable
                            behavioral plan. If at the discretion of The Goddard School® staff, a child’s behavior is determined to be uncontrollable,
                            extremely disruptive, and/or harmful to themselves or others, the parent will be called to come and remove the child from school
                            for the day.
                            <br /><br />
                            Parents will be required to make arrangements for the child to be picked up within 45 minutes of the call. Failure to do so
                            may result in termination of services. The Goddard School® reserves the right to terminate enrollment of children who exhibit
                            behavioral patterns that are deemed harmful to themselves or others. The determination of what is harmful and/or appropriate
                            is at the sole discretion of The Goddard School® staff. Open communication between home and school is considered key to
                            effective discipline.
                        </p>
                    </div>
                </div>
            </div>

            <div
                className="bg-white border border-2 mx-auto text-[15px] mt-5 border-[#0f2d52] section-container">

                <PDFHeader heading="Parent Handbook" />

                <div className="p-4 text-gray-800 text-base">
                    <div className="mb-4">
                        <p>
                            At no time, at The Goddard School® will a child be subjected to physical corporal punishment (shaking, hitting, biting, pinching, etc.),
                            humiliated, frightened, or verbally abused by our staff. Children will never be disciplined for sleep habits, toileting accidents,
                            food consumption, or lack of participation in scheduled activities. At all times, a child’s age, emotional state, and past experiences
                            will be considered in discipline matters. Any violation of the school’s discipline policy should be brought to the Director or
                            Owner’s attention immediately.
                        </p>
                    </div>

                    <div className="mb-4 flex items-center gap-2">
                        <input
                            type="checkbox"
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-400"
                            id="security_issue_agreement"
                            name="security_issue_agreement"
                            checked={checkboxStates.security_issue_agreement}
                            onChange={(e) =>
                                setCheckboxStates((prev) => ({
                                    ...prev,
                                    security_issue_agreement: e.target.checked,
                                }))
                            }
                        />
                        <label htmlFor="security_issue_agreement" className="text-sm">
                            <b>I agree all the above information.</b>
                        </label>
                    </div>

                    <h5 className="text-center text-xl font-bold mb-4">Expulsion Policy</h5>
                    <p className="mb-4">
                        At The Goddard School, our primary concern is the safety and well-being of all children and staff members. In the rare event
                        that a child's behavior poses a serious risk to themselves or others, expulsion from our childcare services may be necessary.
                    </p>

                    <h6 className="text-lg font-semibold mb-2">Criteria for Expulsion:</h6>
                    <p className="mb-2">
                        Expulsion may occur under the following circumstances, including but not limited to:
                    </p>

                    <ul className="list-disc list-inside space-y-1 pl-4">
                        <li>
                            Repeated and severe disruptive behavior that jeopardizes the safety of others.
                        </li>
                        <li>
                            Physical aggression or violence towards other children or staff.
                        </li>
                        <li>
                            Continuous refusal to adhere to childcare center rules and regulations.
                        </li>
                        <li>
                            Engaging in behavior that compromises the overall welfare of individuals within the childcare setting.
                        </li>
                        <li>
                            Any other behavior deemed unacceptable or harmful to the functioning of the childcare center.
                        </li>
                    </ul>
                </div>
            </div>

            <div
                className="bg-white border border-2 mx-auto text-[15px] mt-5 border-[#0f2d52] section-container">

                <PDFHeader heading="Parent Handbook" />

                <div className="p-4 text-gray-800 text-base">
                    <div className="mb-4">
                        <h6 className="text-lg font-semibold mb-2"><b>Procedure for Expulsion:</b></h6>
                        <ul className="list-disc list-inside space-y-2 pl-4">
                            <li>
                                <b>Documentation:</b> Incidents of concerning behavior will be thoroughly documented by staff members.
                            </li>
                            <li>
                                <b>Parental Communication:</b> Parents or guardians will be promptly notified of any incidents and involved in developing strategies to address the behavior.
                            </li>
                            <li>
                                <b>Intervention and Support:</b> The childcare center will offer appropriate interventions and support to help modify the behavior, including behavior management techniques and referrals to external resources if necessary.
                            </li>
                            <li>
                                <b>Review:</b> If the behavior persists despite interventions, a review will be conducted involving the management team, staff members, and parents or guardians.
                            </li>
                            <li>
                                <b>Decision:</b> If expulsion is deemed necessary to maintain the safety and well-being of all involved, the child may be expelled from the childcare services.
                            </li>
                            <li>
                                <b>Notification:</b> Parents or guardians will receive written notification of the decision to expel their child, along with the reasons and any further steps required.
                            </li>
                        </ul>
                    </div>

                    <div className="mb-4">
                        <h5 className="text-center text-xl font-bold mb-3"><b>Termination of Services</b></h5>
                        <p className="mb-3">
                            Termination of childcare services may occur under the following circumstances, but not limited to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 pl-4">
                            <li>Continued non-payment of fees despite reminders and notifications.</li>
                            <li>Failure to comply with the terms and conditions outlined in the childcare services agreement.</li>
                            <li>Persistent disruptive behavior that poses a risk to the safety and well-being of other children and staff members.</li>
                            <li>Engaging in violent behavior or using foul language towards other children or staff members.</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div
                className="bg-white border border-2 mx-auto text-[15px] mt-5 border-[#0f2d52] section-container">

                <PDFHeader heading="Parent Handbook" />

                <div className="p-4">
                    <div>
                        <ul>
                            <li>
                                Failure to follow the childcare center's rules and regulations
                                despite interventions and support.
                            </li>
                            <li>
                                Any behavior that compromises the safety or well-being of
                                oneself or others.
                            </li>
                            <li>
                                Any other circumstances deemed unacceptable or detrimental to
                                the overall functioning of the childcare center.
                            </li>
                        </ul>
                        <div className="row m-1 mb-2">
                            <div className="form-group d-flex align-items-center gap-1">
                                <input
                                    type="checkbox"
                                    className="input-checkbox custom-checkbox"
                                    id="expulsion_policy_agreement"
                                    name="expulsion_policy_agreement"
                                    checked={checkboxStates.expulsion_policy_agreement}
                                    onChange={(e) => setCheckboxStates(prev => ({ ...prev, expulsion_policy_agreement: e.target.checked }))}
                                />
                                <label className="form-check-label" htmlFor="expulsion_policy_agreement">
                                    <span><b>I agree all the above information.</b></span>
                                </label>
                            </div>
                        </div>
                        <br />
                        <h5 className="text-center mb-2">
                            <b>Addressing Individual Child Concerns</b>
                        </h5>
                        <p>
                            The Goddard School® has developed a strong working relationship with
                            Kindering, an early intervention center serving urban East King
                            County. Kindering is the largest intervention center in Washington,
                            one of the three largest in the nation, and notably the most
                            comprehensive. The Educational Consultants at Kindering are
                            committed to providing superior, individualized, family-centered
                            services for children throughout the Eastside.
                        </p>
                        <p>
                            Whenever there is a question about a child’s development or
                            behavior, our first question is to ask if the environment can be
                            modified to better accommodate the child’s needs. Kindering has been
                            very helpful to our staff in making adjustments to our classrooms to
                            better meet children’s needs. When the environmental changes are not
                            enough, we then explore individual concerns. If the assessment
                            process informs us of a specific need, the parents meet with the
                            Educational Consultant, as well as the Director and classroom
                            teachers. Our conversation is designed to build a strong partnership
                            between home, school and outside services that may benefit the
                            child. Kindering can become a strong support for the family and
                            provide referral services when appropriate. This is a free service,
                            and we are appreciative of the input that Kindering provides and the
                            support they give to our program.
                        </p>
                        <h5 className="text-center mb-2"><b>Parent Code of Conduct</b></h5>
                        <p>
                            The Goddard School® expects parents to observe a certain standard of
                            conduct at the center and on its grounds. The following behaviors
                            are not acceptable in the facility or on the grounds:
                        </p>

                    </div>
                </div>
            </div>

            <div
                className="bg-white border border-2 mx-auto text-[15px] mt-5 border-[#0f2d52] section-container">

                <PDFHeader heading="Parent Handbook" />

                <div className="p-4 text-gray-800 text-base">
                    <div className="mb-6">
                        <ul className="list-disc list-inside space-y-2 mb-6 pl-4">
                            <li>Physical or verbal punishment of their children</li>
                            <li>Physical or verbal punishment of other children</li>
                            <li>Threatening or intimidating staff, other parents, or other children</li>
                            <li>Swearing/cursing or threatening/obscene gestures</li>
                            <li>Quarreling with other parents or staff</li>
                            <li>Not following policies designated to protect the safety and security of everyone in the center.</li>
                        </ul>

                        <h5 className="text-center text-xl font-bold mb-3"><b>Parent Communication</b></h5>
                        <p className="mb-4">
                            The Goddard School® provides many opportunities for parents to receive information on the progress of their children,
                            as well as details on other general activities occurring from time to time at the school. Examples of the types of
                            communication that parents will receive include:
                        </p>

                        <h6 className="text-lg font-semibold mb-1"><b>Kaymbu/The Goddard Family App</b></h6>
                        <p className="mb-4">
                            A written daily report for each child in The Goddard School® provides a parent with an overview of the activities
                            in which the child participated, as well as information on meals, sleep, and toileting will be emailed to you via
                            KAYMBU (you can also download the App).
                        </p>

                        <h6 className="text-lg font-semibold mb-1"><b>Parent Conferences</b></h6>
                        <p className="mb-4">
                            At least twice a year, or more often by parent (or staff) request, a formal parent/teacher conference time is scheduled.
                            Our school is closed for the two scheduled conference dates, sign ups occur for families with siblings first and then
                            open to the remaining classmates. These meetings serve to summarize each child’s progress in detail. The parents will
                            be given a written developmental report, which summarizes the teacher’s evaluation.
                        </p>

                        <h6 className="text-lg font-semibold mb-1"><b>Information Boards</b></h6>
                        <p>
                            Boards are located outside each classroom or inside the classroom by the door for your convenience. Information is
                            provided about upcoming school and community events, as well as miscellaneous points of interest.
                        </p>
                    </div>
                </div>
            </div>

            <div
                className="bg-white border border-2 mx-auto text-[15px] mt-5 border-[#0f2d52] section-container">

                <PDFHeader heading="Parent Handbook" />
                <div className="p-4 text-gray-800 text-base">
                    <p className="mb-4">
                        Individual classroom boards will contain lesson plans, class schedules, and staff hours.
                        It is recommended that parents check the boards regularly for updates and new information.
                    </p>

                    <h6 className="text-lg font-semibold mb-1"><b>Daily Feedback</b></h6>
                    <p className="mb-4">
                        Daily communication will occur between staff and parents in the morning and evening to
                        provide updates on the children’s health, disposition, etc. A long dialogue may not be
                        possible at the drop-off or pick-up time, as these are particularly busy times when staff
                        are responsible for supervising all of the children in their care. If you have a concern,
                        a special appointment is advised, or telephone conferences may be arranged.
                    </p>

                    <h6 className="text-lg font-semibold mb-1"><b>Newsletters and Monthly Calendars</b></h6>
                    <p className="mb-6">
                        Monthly newsletters are emailed out to keep parents posted on all school activities.
                        Monthly calendars will be available on or before the first of each month. These will be
                        emailed out to all families a few days before the new month begins.
                    </p>

                    <div className="flex items-center gap-2 mb-6">
                        <input
                            type="checkbox"
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring focus:ring-blue-200"
                            id="addressing_individual_child_agreement"
                            name="addressing_individual_child_agreement"
                            checked={checkboxStates.addressing_individual_child_agreement}
                            onChange={(e) =>
                                setCheckboxStates((prev) => ({
                                    ...prev,
                                    addressing_individual_child_agreement: e.target.checked,
                                }))
                            }
                        />
                        <label htmlFor="addressing_individual_child_agreement" className="text-sm font-semibold">
                            I agree all the above information.
                        </label>
                    </div>

                    <div className="mb-4">
                        <h5 className="text-center text-xl font-bold mb-4"><b>A Final Word</b></h5>
                        <p>
                            The Owner and/or Director reserve the right to deny, cancel, sever, suspend, or terminate
                            the services of any child, without notice, for any reason, so long as the determination is
                            not based on whole or part on the race, color, creed, religion, sexual preference, age,
                            gender, national origin, or disability or any other protected characteristic of the child
                            or the child’s parents. At all times we strive to provide quality care for all children.
                            If that quality is diminished by one child, the Director and/or Owner may ask for the
                            dismissal of that child for the well-being of the other children in the room. Any unused
                            tuition will be refunded minus any outstanding charges.
                        </p>
                    </div>
                </div>
            </div>

            <div
                className="bg-white border border-2 mx-auto text-[15px] mt-5 border-[#0f2d52] section-container">

                <PDFHeader heading="Parent Handbook" />
                <div className="p-4 text-gray-800 text-base">
                    <p className="mb-6">
                        The Goddard School® will not release a child to any parent, relative, or other authorized adult who
                        appears to be impaired. In the event this situation is suspected, a telephone call will be made to the
                        other parent, emergency contact person, local authorities and the Washington State Department of Child
                        Protective Services in Washington and notify them of our suspicions.
                        <br /><br />
                        In the event that child abuse is suspected, we are required by the State of Washington to report any
                        and all instances of suspected child abuse or neglect. When a staff member has information or evidence
                        of suspected child abuse, the Director and/or Owner will be informed, and the Department of Child
                        Protective Services is contacted and given this information.
                        <br /><br />
                        The Goddard School® reserves the right to edit any of the information contained in this manual at any
                        time, and the material contained herein should not be considered as sole determination of policy.
                        <br /><br />
                        If, after reviewing this parent’s handbook, there are any questions or comments regarding The Goddard
                        School® and its policies, parents should feel free to speak with the Owner and/or Director.
                    </p>

                    <h5 className="text-center text-xl font-bold mb-4"><b>Chain of Command</b></h5>
                    <p className="mb-4">
                        We are all part of the team working to support your family. The Goddard School® strives to meet all of
                        your family’s needs. If you have a concern, please go directly to the source to handle the concern most
                        efficiently. If your concern is not resolved, please continue up the ladder until we have reached
                        mutual understanding.
                    </p>

                    <p className="text-center leading-relaxed">
                        The Goddard School® of Lynnwood<br />
                        Maanu Muthu, On-site Owner<br />
                        Kat Shield, Director<br />
                        Bailey Ellis, Assistant Director<br />
                        Josh Koczman, ____________<br />
                        Matt Redman, ____________<br />
                    </p>
                </div>
            </div>

            <div
                className="bg-white border border-2 mx-auto text-[15px] mt-5 border-[#0f2d52] section-container">

                <PDFHeader heading="Parent Handbook" />
                <div className="p-4 text-gray-800 text-base">
                    <div className="mb-6">
                        <p className="text-center leading-relaxed mb-4">
                            Lead Teacher: See Bio Board for Your Child’s <br />
                            Assistant Teacher: See Bio Board for Your Child’s Classroom<br />
                            425-510-7055, 425-616-1993<br />
                            LynnwoodWA@goddardschools.com
                        </p>

                        <p className="text-center leading-relaxed mb-4">
                            Goddard Systems, Inc.<br />
                            1016 West Ninth Street, King of Prussia, PA 19406<br />
                            Franchise Relations: 610-265-8510 Extension 530
                        </p>

                        <p className="text-center leading-relaxed mb-4">
                            Department of Children, Youth and Family<br />
                            State of Washington, Northwest Offices<br />
                            (425) 590-3103
                        </p>

                        <h5 className="text-center text-xl font-bold mb-3">
                            Emergency Operations Plan
                        </h5>

                        <p className="mb-4">
                            Our primary concern is for the safety and welfare of the children
                            attending The Goddard School® in Lynnwood, WA. Our Emergency
                            Operations Plan provides for response to all types of emergencies.
                            Depending on the circumstances of the emergency, we will use one
                            of the following protective actions:
                        </p>

                        <ul className="list-disc pl-6 space-y-2">
                            <li>
                                <strong>Immediate evacuation:</strong> Students are evacuated to a safe
                                area on the grounds of the facility in the event of a fire, etc.
                            </li>
                            <li>
                                <strong>In-place sheltering:</strong> Sudden occurrences may dictate that
                                taking cover inside the building is the best immediate response.
                            </li>
                            <li>
                                <strong>Evacuation:</strong> In certain emergency situations, total
                                evacuation of the facility may become necessary. In this case, the
                                children will be taken to a safe relocation facility. Parents will be
                                contacted by telephone as to the location of the children, or by
                                radio broadcast if phone transmission is not possible.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div
                className="bg-white border border-2 mx-auto text-[15px] mt-5 border-[#0f2d52] section-container">

                <PDFHeader heading="Parent Handbook" />

                <div className="p-4 text-gray-800 text-base">
                    <ul className="list-disc pl-6 mb-4">
                        <li>
                            <strong>Modified Operation:</strong> This may include cancellation,
                            postponement, or rescheduling of normal activities. These actions are
                            normally taken in the event of a winter storm or facility problems that
                            make it unsafe for students (such as utility disruptions). However, this
                            action may be necessary in a variety of situations.
                        </li>
                    </ul>

                    <p className="mb-3">
                        In the event of a local or regional emergency, please tune into your local
                        news and radio stations for updated announcements. You may also go to
                        goddardschool.com and click on the Lynnwood, WA location for announcements
                        relating to any of the emergency actions listed above.
                    </p>
                    <p className="mb-3">
                        We ask that you do not call the school during an emergency. This will keep
                        the main telephone line free to make emergency calls and relay information.
                        We will call you and let you know that we’ve taken one of these protective
                        actions. We will also call you when we have resolved the situation, and it
                        is safe for you to pick up your child(ren).
                    </p>
                    <p className="mb-3">
                        The Owner and/or Directors may provide an alternative phone number (i.e.
                        cell phone number) to call in the event of an emergency via group email or
                        posting on our school’s website.
                    </p>
                    <p className="mb-6">
                        Our emergency preparedness plan is reviewed on a semi-annual basis with all
                        staff and is located in each classroom binder as well as in the Director and
                        Owner offices.
                    </p>

                    <h4 className="text-center font-bold text-lg mb-4">Parent Agreement</h4>

                    <div className="flex items-center gap-2 mb-6">
                        <input
                            type="checkbox"
                            className="w-5 h-5 accent-blue-600"
                            id="finalword_agreement"
                            name="finalword_agreement"
                            checked={checkboxStates.finalword_agreement}
                            onChange={(e) =>
                                setCheckboxStates((prev) => ({
                                    ...prev,
                                    finalword_agreement: e.target.checked,
                                }))
                            }
                        />
                        <label htmlFor="finalword_agreement" className="text-base font-semibold">
                            I agree all the above information.
                        </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="parent_sign_handbook" className="block font-bold mb-1">
                                Parent Signature
                            </label>
                            <input
                                type="text"
                                id="parent_sign_handbook"
                                name="parent_sign_handbook"
                                defaultValue={initialFormData?.parent_sign_handbook || ""}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>

                        <div>
                            <label htmlFor="parent_sign_date_handbook" className="block font-bold mb-1">
                                Date
                            </label>
                            <input
                                type="date"
                                id="parent_sign_date_handbook"
                                name="parent_sign_date_handbook"
                                defaultValue={initialFormData?.parent_sign_date_handbook || ""}
                                onClick={() => dateValidation("parent_sign_date_handbook")}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
});

export default ParentHandbook;