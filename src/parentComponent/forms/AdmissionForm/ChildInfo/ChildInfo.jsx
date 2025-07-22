import React, { useState } from 'react';


import Parent_details from './parent_details';
import Child_details from './Child_details';
import AdditionalParentDetails from './AdditionalParentDetails';
import EmergencyContact from './EmergencyContact';
import MedicalCareProvider from './MedicalCareProvider';
import ParentAgreement from './ParentAgreement';



const ChildInfo = () => {

    const [formData, setFormData] = useState({
        // Child Details
        firstName: 'Aarav',
        lastName: 'Kumar',
        nickname: 'Aaru',
        birthDate: '2018-06-15',
        primaryLanguage: 'Tamil',
        school: 'Sunrise Preschool',
        custodyPapers: 'no',
        gender: 'male',

        // Parent Details
        parentName: 'Priya Kumar',
        street: '123 MG Road',
        city: 'Chennai',
        state: 'Tamil Nadu',
        zip: '600001',
        telephoneNumber: '044-23456789',
        cellNumber: '9876543210',
        emailAddress: 'priya.kumar@example.com',
        businessName: 'Infosys',
        workHoursFrom: '09:00',
        workHoursTo: '17:00',
        businessTelephoneNumber: '044-87654321',

        // Additional Parent Details
        additionalParentName: 'Ravi Kumar',
        additionalStreet: '123 MG Road',
        additionalCity: 'Chennai',
        additionalState: 'Tamil Nadu',
        additionalZip: '600001',
        additionalTelephoneNumber: '044-12345678',
        additionalCellNumber: '9876512345',
        additionalEmailAddress: 'ravi.kumar@example.com',
        additionalBusinessName: 'TCS',
        additionalWorkHoursFrom: '10:00',
        additionalWorkHoursTo: '18:00',
        additionalBusinessTelephoneNumber: '044-76543210',

        // Emergency Contacts
        emergencyContact1Name: 'Anjali Sharma',
        emergencyContact1Relationship: 'Neighbor',
        emergencyContact1Phone: '9845123456',
        emergencyContact1Street: '45 Park Avenue',
        emergencyContact1City: 'Chennai',
        emergencyContact1State: 'Tamil Nadu',
        emergencyContact1Zip: '600002',

        emergencyContact2Name: 'Meera Raj',
        emergencyContact2Relationship: 'Aunt',
        emergencyContact2Phone: '9823456789',
        emergencyContact2Street: '12 Anna Nagar',
        emergencyContact2City: 'Chennai',
        emergencyContact2State: 'Tamil Nadu',
        emergencyContact2Zip: '600003',

        emergencyContact3Name: 'Rajiv Menon',
        emergencyContact3Relationship: 'Family Friend',
        emergencyContact3Phone: '9812345678',
        emergencyContact3Street: '5 Gandhi Street',
        emergencyContact3City: 'Chennai',
        emergencyContact3State: 'Tamil Nadu',
        emergencyContact3Zip: '600004',

        // Medical Care Provider
        physicianName: 'Dr. Suresh Iyer',
        physicianPhone: '9845078901',
        hospitalAffiliation: 'Apollo Hospitals',
        physicianStreet: '1 Health Lane',
        physicianCity: 'Chennai',
        physicianState: 'Tamil Nadu',
        physicianZip: '600005',

        dentistName: 'Dr. Lakshmi Nair',
        dentistPhone: '9845023456',
        dentistStreet: '2 Smile Street',
        dentistCity: 'Chennai',
        dentistState: 'Tamil Nadu',
        dentistZip: '600006',

        // Medical Info
        specialDisabilities: 'None',
        allergies: 'Peanuts',
        additionalSpecialNeeds: 'Speech therapy once a week',
        medicationConditions: 'Asthma - uses inhaler',
        healthInsurance: 'Star Health',
        policyNumber: 'STAR123456789',

        // Parent Agreement
        emergencyMedicalCare: 'Yes, I authorize',
        firstAidProcedures: 'Yes, I consent',
        agreementConfirmed: true,
    });

    const [openSection, setOpenSection] = useState('childDetails');

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };



    return (
        <div className="max-w-4xl mx-auto p-4 bg-white shadow-4xl">
            <h1 className='text-center bg-slate-700 mt-4 mb-4 py-3 text-3xl text-white'>Child Information</h1>

            <div className="bg-white rounded-lg border overflow-hidden">

                {/* Child Details Section */}
                <div className="border-b">
                    <Child_details
                        openSection={openSection}
                        setOpenSection={setOpenSection}
                        formData={formData}
                        handleInputChange={handleInputChange}
                    />
                </div>

                {/* Parent Details Section */}
                <div className="border-b">
                    <Parent_details
                        openSection={openSection}
                        setOpenSection={setOpenSection}
                        formData={formData}
                        handleInputChange={handleInputChange}
                    />
                </div>

                <div className="border-b">
                    <AdditionalParentDetails
                        openSection={openSection}
                        setOpenSection={setOpenSection}
                        formData={formData}
                        handleInputChange={handleInputChange}
                    />
                </div>

                <div className="border-b">
                    <EmergencyContact
                        openSection={openSection}
                        setOpenSection={setOpenSection}
                        formData={formData}
                        handleInputChange={handleInputChange}
                    />
                </div>
                <div className="border-b">
                    <MedicalCareProvider
                        openSection={openSection}
                        setOpenSection={setOpenSection}
                        formData={formData}
                        handleInputChange={handleInputChange}
                    />
                </div>



                <div>
                    <ParentAgreement
                        openSection={openSection}
                        setOpenSection={setOpenSection}
                        formData={formData}
                        handleInputChange={handleInputChange}
                    />
                </div>



            </div>
        </div>
    );
};

export default ChildInfo;