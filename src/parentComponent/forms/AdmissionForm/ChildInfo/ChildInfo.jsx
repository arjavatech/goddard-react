import React, { useState, useEffect } from 'react';


import Parent_details from './parent_details';
import Child_details from './Child_details';
import AdditionalParentDetails from './AdditionalParentDetails';
import EmergencyContact from './EmergencyContact';
import MedicalCareProvider from './MedicalCareProvider';
import ParentAgreement from './ParentAgreement';



const ChildInfo = ({ initialFormData = null, childId = null }) => {

    // API function to update admission form data
    const updateAdmissionData = async (fieldData) => {
        if (!childId) {
            console.error('Child ID is required for API update');
            return;
        }

        try {
            const response = await fetch(`https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/admission_form/update/${childId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(fieldData)
            });

            if (!response.ok) {
                throw new Error(`Failed to update admission data: ${response.status}`);
            }

            const result = await response.json();
            console.log('Admission data updated successfully:', result);
            return result;
        } catch (error) {
            console.error('Error updating admission data:', error);
            throw error;
        }
    };

    const [formData, setFormData] = useState({
        // Child Details
        firstName: '',
        lastName: '',
        nickname: '',
        birthDate: '',
        primaryLanguage: '',
        school: '',
        custodyPapers: '',
        gender: '',

        // Parent Details
        parentName: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        telephoneNumber: '',
        cellNumber: '',
        emailAddress: '',
        businessName: '',
        workHoursFrom: '',
        workHoursTo: '',
        businessTelephoneNumber: '',

        // Additional Parent Details
        additionalParentName: '',
        additionalStreet: '',
        additionalCity: '',
        additionalState: '',
        additionalZip: '',
        additionalTelephoneNumber: '',
        additionalCellNumber: '',
        additionalEmailAddress: '',
        additionalBusinessName: '',
        additionalWorkHoursFrom: '',
        additionalWorkHoursTo: '',
        additionalBusinessTelephoneNumber: '',

        // Emergency Contacts
        emergencyContact1Name: '',
        emergencyContact1Relationship: '',
        emergencyContact1Phone: '',
        emergencyContact1Street: '',
        emergencyContact1City: '',
        emergencyContact1State: '',
        emergencyContact1Zip: '',

        emergencyContact2Name: '',
        emergencyContact2Relationship: '',
        emergencyContact2Phone: '',
        emergencyContact2Street: '',
        emergencyContact2City: '',
        emergencyContact2State: '',
        emergencyContact2Zip: '',

        emergencyContact3Name: '',
        emergencyContact3Relationship: '',
        emergencyContact3Phone: '',
        emergencyContact3Street: '',
        emergencyContact3City: '',
        emergencyContact3State: '',
        emergencyContact3Zip: '',

        // Medical Care Provider
        physicianName: '',
        physicianPhone: '',
        hospitalAffiliation: '',
        physicianStreet: '',
        physicianCity: '',
        physicianState: '',
        physicianZip: '',

        dentistName: '',
        dentistPhone: '',
        dentistStreet: '',
        dentistCity: '',
        dentistState: '',
        dentistZip: '',

        // Medical Info
        specialDisabilities: '',
        allergies: '',
        additionalSpecialNeeds: '',
        medicationConditions: '',
        healthInsurance: '',
        policyNumber: '',

        // Parent Agreement
        emergencyMedicalCare: '',
        firstAidProcedures: '',
        agreementConfirmed: false,
    });

    const [openSection, setOpenSection] = useState('childDetails');

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    useEffect(() => {
        if (initialFormData) {
            // Map API data to form fields
            const mappedData = {
                // Child Details
                firstName: initialFormData.child_first_name || '',
                lastName: initialFormData.child_last_name || '',
                nickname: initialFormData.nick_name || '',
                birthDate: initialFormData.dob || '',
                primaryLanguage: initialFormData.primary_language || '',
                school: initialFormData.school_age_child_school || '',
                custodyPapers: initialFormData.do_relevant_custody_papers_apply === 1 ? 'yes' : 'no',
                gender: initialFormData.gender === 1 ? 'male' : 'female',

                // Primary Parent Details
                parentName: initialFormData.primary_parent_info?.parent_name || '',
                street: initialFormData.primary_parent_info?.parent_street_address || '',
                city: initialFormData.primary_parent_info?.parent_city_address || '',
                state: initialFormData.primary_parent_info?.parent_state_address || '',
                zip: initialFormData.primary_parent_info?.parent_zip_address || '',
                telephoneNumber: initialFormData.primary_parent_info?.parent_home_telephone_number || '',
                cellNumber: initialFormData.primary_parent_info?.parent_home_cell_number || '',
                emailAddress: initialFormData.primary_parent_info?.parent_email || '',
                businessName: initialFormData.primary_parent_info?.parent_business_name || '',
                workHoursFrom: initialFormData.primary_parent_info?.parent_work_hours_from || '',
                workHoursTo: initialFormData.primary_parent_info?.parent_work_hours_to || '',
                businessTelephoneNumber: initialFormData.primary_parent_info?.parent_business_telephone_number || '',

                // Additional Parent Details
                additionalParentName: initialFormData.additional_parent_info?.parent_name || '',
                additionalStreet: initialFormData.additional_parent_info?.parent_street_address || '',
                additionalCity: initialFormData.additional_parent_info?.parent_city_address || '',
                additionalState: initialFormData.additional_parent_info?.parent_state_address || '',
                additionalZip: initialFormData.additional_parent_info?.parent_zip_address || '',
                additionalTelephoneNumber: initialFormData.additional_parent_info?.parent_home_telephone_number || '',
                additionalCellNumber: initialFormData.additional_parent_info?.parent_home_cell_number || '',
                additionalEmailAddress: initialFormData.additional_parent_info?.parent_email || '',
                additionalBusinessName: initialFormData.additional_parent_info?.parent_business_name || '',
                additionalWorkHoursFrom: initialFormData.additional_parent_info?.parent_work_hours_from || '',
                additionalWorkHoursTo: initialFormData.additional_parent_info?.parent_work_hours_to || '',
                additionalBusinessTelephoneNumber: initialFormData.additional_parent_info?.parent_business_telephone_number || '',

                // Emergency Contacts
                emergencyContact1Name: initialFormData.emergency_contact_info?.[0]?.child_emergency_contact_name || '',
                emergencyContact1Relationship: initialFormData.emergency_contact_info?.[0]?.child_emergency_contact_relationship || '',
                emergencyContact1Phone: initialFormData.emergency_contact_info?.[0]?.child_emergency_contact_telephone_number || '',
                emergencyContact1Street: initialFormData.emergency_contact_info?.[0]?.child_emergency_contact_full_address || '',
                emergencyContact1City: initialFormData.emergency_contact_info?.[0]?.child_emergency_contact_city_address || '',
                emergencyContact1State: initialFormData.emergency_contact_info?.[0]?.child_emergency_contact_state_address || '',
                emergencyContact1Zip: initialFormData.emergency_contact_info?.[0]?.child_emergency_contact_zip_address || '',

                emergencyContact2Name: initialFormData.emergency_contact_info?.[1]?.child_emergency_contact_name || '',
                emergencyContact2Relationship: initialFormData.emergency_contact_info?.[1]?.child_emergency_contact_relationship || '',
                emergencyContact2Phone: initialFormData.emergency_contact_info?.[1]?.child_emergency_contact_telephone_number || '',
                emergencyContact2Street: initialFormData.emergency_contact_info?.[1]?.child_emergency_contact_full_address || '',
                emergencyContact2City: initialFormData.emergency_contact_info?.[1]?.child_emergency_contact_city_address || '',
                emergencyContact2State: initialFormData.emergency_contact_info?.[1]?.child_emergency_contact_state_address || '',
                emergencyContact2Zip: initialFormData.emergency_contact_info?.[1]?.child_emergency_contact_zip_address || '',

                emergencyContact3Name: initialFormData.emergency_contact_info?.[2]?.child_emergency_contact_name || '',
                emergencyContact3Relationship: initialFormData.emergency_contact_info?.[2]?.child_emergency_contact_relationship || '',
                emergencyContact3Phone: initialFormData.emergency_contact_info?.[2]?.child_emergency_contact_telephone_number || '',
                emergencyContact3Street: initialFormData.emergency_contact_info?.[2]?.child_emergency_contact_full_address || '',
                emergencyContact3City: initialFormData.emergency_contact_info?.[2]?.child_emergency_contact_city_address || '',
                emergencyContact3State: initialFormData.emergency_contact_info?.[2]?.child_emergency_contact_state_address || '',
                emergencyContact3Zip: initialFormData.emergency_contact_info?.[2]?.child_emergency_contact_zip_address || '',

                // Medical Care Provider
                physicianName: initialFormData.child_care_provider_info?.child_care_provider_name || '',
                physicianPhone: initialFormData.child_care_provider_info?.child_care_provider_telephone_number || '',
                hospitalAffiliation: initialFormData.child_care_provider_info?.child_hospital_affiliation || '',
                physicianStreet: initialFormData.child_care_provider_info?.child_care_provider_street_address || '',
                physicianCity: initialFormData.child_care_provider_info?.child_care_provider_city_address || '',
                physicianState: initialFormData.child_care_provider_info?.child_care_provider_state_address || '',
                physicianZip: initialFormData.child_care_provider_info?.child_care_provider_zip_address || '',

                dentistName: initialFormData.child_dentist_name || '',
                dentistPhone: initialFormData.dentist_telephone_number || '',
                dentistStreet: initialFormData.dentist_street_address || '',
                dentistCity: initialFormData.dentist_city_address || '',
                dentistState: initialFormData.dentist_state_address || '',
                dentistZip: initialFormData.dentist_zip_address || '',

                // Medical Info
                specialDisabilities: initialFormData.special_diabilities || '',
                allergies: initialFormData.allergies || '',
                additionalSpecialNeeds: initialFormData.additional_info || '',
                medicationConditions: initialFormData.medication || '',
                healthInsurance: initialFormData.health_insurance || '',
                policyNumber: initialFormData.policy_number || '',

                // Parent Agreement
                emergencyMedicalCare: initialFormData.obtaining_emergency_medical_care || '',
                firstAidProcedures: initialFormData.administration_first_aid_procedures || '',
                agreementConfirmed: initialFormData.agree_all_above_information_is_correct == 'on',
            };

            setFormData(prevState => ({
                ...prevState,
                ...mappedData
            }));
        }
    }, [initialFormData]);



    return (
        <>
        <h1 className='text-center bg-[#0F2D52]  mb-4 py-3 text-3xl text-white headerstyle'>Child Information</h1>
            <div className="mx-auto  bg-white shadow-4xl">
                

                <div className="bg-white rounded-lg  overflow-hidden">

                    {/* Child Details Section */}
                    <div className='border mt-px'>
                        <Child_details
                            openSection={openSection}
                            setOpenSection={setOpenSection}
                            formData={formData}
                            handleInputChange={handleInputChange}
                        />
                    </div>

                    {/* Parent Details Section */}
                    <div className='border mt-px'>
                        <Parent_details
                            openSection={openSection}
                            setOpenSection={setOpenSection}
                            formData={formData}
                            handleInputChange={handleInputChange}
                        />
                    </div>

                    <div className='border mt-px'>
                        <AdditionalParentDetails
                            openSection={openSection}
                            setOpenSection={setOpenSection}
                            formData={formData}
                            handleInputChange={handleInputChange}
                        />
                    </div>

                    <div className='border mt-px'>
                        <EmergencyContact
                            openSection={openSection}
                            setOpenSection={setOpenSection}
                            formData={formData}
                            handleInputChange={handleInputChange}
                        />
                    </div>
                    <div className='border mt-px'>
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
        </>
    );
};

export default ChildInfo;