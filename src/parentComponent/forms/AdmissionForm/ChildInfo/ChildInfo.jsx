import React, { useState, useEffect } from 'react';


import Parent_details from './parent_details';
import Child_details from './Child_details';
import Additional_Parent_details from './AdditionalParentDetails';
import EmergencyContact from './EmergencyContact';
import MedicalCareProvider from './MedicalCareProvider';
import ParentAgreement from './ParentAgreement';



const ChildInfo = ({ initialFormData = null, childId = null }) => {

    

    const [openSection, setOpenSection] = useState('childDetails');



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
                            initialFormData={initialFormData}
                            childId={childId}
                        />
                    </div>

                    {/* Parent Details Section */}
                    <div className='border mt-px'>
                        <Parent_details
                            openSection={openSection}
                            setOpenSection={setOpenSection}
                            initialFormData={initialFormData.primary_parent_info}
                            childId={childId}
                        />
                    </div>

                    <div className='border mt-px'>
                        <Additional_Parent_details
                            openSection={openSection}
                            setOpenSection={setOpenSection}
                            initialFormData={initialFormData.additional_parent_info}
                            childId={childId}
                        />
                    </div>

                    <div className='border mt-px'>
                        <EmergencyContact
                            openSection={openSection}
                            setOpenSection={setOpenSection}
                            initialFormData={initialFormData.emergency_contact_info}
                            childId={childId}
                        />
                    </div>
                    <div className='border mt-px'>
                        <MedicalCareProvider
                            openSection={openSection}
                            setOpenSection={setOpenSection}
                            initialFormData={initialFormData}
                            charProviderData={initialFormData.child_care_provider_info}
                            childId={childId}
                        />
                    </div>



                    <div>
                        <ParentAgreement
                            openSection={openSection}
                            setOpenSection={setOpenSection}
                            formData={initialFormData}
                           childId={childId}
                        />
                    </div>



                </div>
            </div>
        </>
    );
};

export default ChildInfo;