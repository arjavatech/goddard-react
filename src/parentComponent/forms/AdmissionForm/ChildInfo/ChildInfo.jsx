import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import Parent_details from './Parent_details';
import Child_details from './Child_details';
import Additional_Parent_details from './AdditionalParentDetails';
import EmergencyContact from './EmergencyContact';
import MedicalCareProvider from './MedicalCareProvider';
import ParentAgreement from './ParentAgreement';



const ChildInfo = ({ initialFormData = null, childId = null, onSubmitSuccess, sectionCompletionStatus = {}, onSubSectionSuccess }) => {

    

    const [openSection, setOpenSection] = useState('childDetails');



    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="bg-[#0F2D52] text-white">
                    <CardTitle className="text-2xl text-center">Child Information</CardTitle>
                </CardHeader>
            </Card>

            <Card className="overflow-hidden">
                <CardContent className="p-0">
                    {/* Child Details Section */}
                    <div className='border-b'>
                        <Child_details
                            openSection={openSection}
                            setOpenSection={setOpenSection}
                            initialFormData={initialFormData}
                            childId={childId}
                            onSubmitSuccess={() => onSubSectionSuccess && onSubSectionSuccess('Child Details')}
                            isCompleted={sectionCompletionStatus['Child Details'] || false}
                        />
                    </div>

                    {/* Parent Details Section */}
                    <div className='border-b'>
                        <Parent_details
                            openSection={openSection}
                            setOpenSection={setOpenSection}
                            initialFormData={initialFormData.primary_parent_info}
                            childId={childId}
                            onSubmitSuccess={() => onSubSectionSuccess && onSubSectionSuccess('Parent Details')}
                            isCompleted={sectionCompletionStatus['Parent Details'] || false}
                        />
                    </div>

                    <div className='border-b'>
                        <Additional_Parent_details
                            openSection={openSection}
                            setOpenSection={setOpenSection}
                            initialFormData={initialFormData.additional_parent_info}
                            childId={childId}
                            onSubmitSuccess={() => onSubSectionSuccess && onSubSectionSuccess('Additional Parent Details')}
                            isCompleted={sectionCompletionStatus['Additional Parent Details'] || false}
                        />
                    </div>

                    <div className='border-b'>
                        <EmergencyContact
                            openSection={openSection}
                            setOpenSection={setOpenSection}
                            initialFormData={initialFormData.emergency_contact_info}
                            childId={childId}
                            onSubmitSuccess={() => onSubSectionSuccess && onSubSectionSuccess('Emergency Contact')}
                            isCompleted={sectionCompletionStatus['Emergency Contact'] || false}
                        />
                    </div>
                    
                    <div className='border-b'>
                        <MedicalCareProvider
                            openSection={openSection}
                            setOpenSection={setOpenSection}
                            initialFormData={initialFormData}
                            charProviderData={initialFormData.child_care_provider_info}
                            childId={childId}
                            onSubmitSuccess={() => onSubSectionSuccess && onSubSectionSuccess('Medical Care Provider')}
                            isCompleted={sectionCompletionStatus['Medical Care Provider'] || false}
                        />
                    </div>

                    <div>
                        <ParentAgreement
                            openSection={openSection}
                            setOpenSection={setOpenSection}
                            formData={initialFormData}
                            childId={childId}
                            onSubmitSuccess={() => onSubSectionSuccess && onSubSectionSuccess('Parent Agreement')}
                            isCompleted={sectionCompletionStatus['Parent Agreement'] || false}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ChildInfo;