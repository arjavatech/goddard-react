import React, { useState, useEffect } from 'react';

import MissionStatement from './MissionStatement';
import TheGoddardSchool from './TheGoddardSchool';
import GeneralEnrollmentProcedure from './GeneralEnrollmentProcedure';
import StatementOfConfidentiality from './StatementOfConfidentiality';
import ParentAccess from './ParentAccess';
import ReleaseOfChildren from './ReleaseOfChildren';
import RegisterationTutionFees from './RegisterationTutionFees';
import OutsideEngagement from './OutsideEngagement';
import HealthPolicies from './HealthPolicies';
import MedicationProcedures from './MedicationProcedures';
import ToysFromHome from './ToysFromHome';
import RestTimeMealsSnacks from './RestTimeMealsSnacks';
import TransitionToiletTraining from './TransitionToiletTraining';
import EmergencyClosings from './EmergencyClosings';
import WebsiteAndBlog from './WebsiteAndBlogs';
import ExpulsionPolicy from './ExpulsionPolicy';
import AddressingIndividualChildConcern from './AddressingIndividualChildConcern';
import FinalWord from './FinalWord';

const ParentHandbook = ({ selectedSubForm = null, initialFormData = null }) => {
    const [openSection, setOpenSection] = useState('childDetails');
    const [formData, setFormData] = useState({
        welcome_goddard_agreement: '',
        mission_statement_agreement: '',
        general_information_agreement: '',
        medical_care_provider_agreement: '',
        parent_access_agreement: '',
        release_of_children_agreement: '',
        registration_fees_agreement: '',
        outside_engagements_agreement: '',
        health_policies_agreement: '',
        medication_procedures_agreement: '',
        bring_to_school_agreement: '',
        rest_time_agreement: '',
        training_philosophy_agreement: '',
        affiliation_policy_agreement: '',
        security_issue_agreement: '',
        expulsion_policy_agreement: '',
        addressing_individual_child_agreement: '',
        finalword_agreement: '',
        parent_sign_handbook: '',
        parent_sign_date_handbook: '',
        admin_sign_handbook: '',
        admin_sign_date_handbook: '',
        handbook_pointer: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (type) => {
        // console.log(`Submitting ${type} form data:`, formData);
    };

    useEffect(() => {
        setFormData(prevState => ({
            ...prevState,
            parent_sign_date_handbook: new Date().toISOString().split('T')[0]
        }));
    }, []);

    useEffect(() => {
        if (initialFormData) {
            setFormData(prevState => ({
                ...prevState,
                ...initialFormData
            }));
        }
    }, [initialFormData]);

    // Function to determine which sub-form to show
    const getSubFormToShow = () => {
        if (!selectedSubForm) {
            return 'policy'; // Show first form (Policy) by default
        }
        
        switch (selectedSubForm.toLowerCase()) {
            case 'policy':
                return 'policy';
            case 'parent signature':
                return 'parent';
            case 'admin signature':
                return 'admin';
            default:
                return 'policy'; // Default to first form
        }
    };

    const currentSubForm = getSubFormToShow();

    // Policy Form Component (all existing policy components)
    const renderPolicyForm = () => (
        <div className="rounded-lg shadow-sm overflow-hidden">
            <div>
                <TheGoddardSchool fieldValue={formData.welcome_goddard_agreement} openSection={openSection} setOpenSection={setOpenSection} />
                <MissionStatement fieldValue={formData.mission_statement_agreement} openSection={openSection} setOpenSection={setOpenSection} />
                <GeneralEnrollmentProcedure fieldValue={formData.general_information_agreement} openSection={openSection} setOpenSection={setOpenSection} />
                <StatementOfConfidentiality fieldValue={formData.medical_care_provider_agreement} openSection={openSection} setOpenSection={setOpenSection} />
                <ParentAccess fieldValue={formData.parent_access_agreement} openSection={openSection} setOpenSection={setOpenSection} />
                <ReleaseOfChildren fieldValue={formData.release_of_children_agreement} openSection={openSection} setOpenSection={setOpenSection} />
                <RegisterationTutionFees fieldValue={formData.registration_fees_agreement} openSection={openSection} setOpenSection={setOpenSection} />
                <OutsideEngagement fieldValue={formData.outside_engagements_agreement} openSection={openSection} setOpenSection={setOpenSection} />
                <HealthPolicies fieldValue={formData.health_policies_agreement} openSection={openSection} setOpenSection={setOpenSection} />
                <MedicationProcedures fieldValue={formData.medication_procedures_agreement} openSection={openSection} setOpenSection={setOpenSection} />
                <ToysFromHome fieldValue={formData.bring_to_school_agreement} openSection={openSection} setOpenSection={setOpenSection} />
                <RestTimeMealsSnacks fieldValue={formData.rest_time_agreement} openSection={openSection} setOpenSection={setOpenSection} />
                <TransitionToiletTraining fieldValue={formData.training_philosophy_agreement} openSection={openSection} setOpenSection={setOpenSection} />
                <EmergencyClosings fieldValue={formData.affiliation_policy_agreement} openSection={openSection} setOpenSection={setOpenSection} />
                <WebsiteAndBlog fieldValue={formData.security_issue_agreement} openSection={openSection} setOpenSection={setOpenSection} />
                <ExpulsionPolicy fieldValue={formData.expulsion_policy_agreement} openSection={openSection} setOpenSection={setOpenSection} />
                <AddressingIndividualChildConcern fieldValue={formData.addressing_individual_child_agreement} openSection={openSection} setOpenSection={setOpenSection} />
                <FinalWord fieldValue={formData.finalword_agreement} openSection={openSection} setOpenSection={setOpenSection} />
            </div>
        </div>
    ); 

    // Original Parent Signature Form Component
    const renderParentSignatureForm = () => (
        <div id="parenthbkparentsign" className="mt-4 container tab-pane bg-white shadow-lg rounded mb-4">
            <div className="card">
                <h2 className="text-center bg-[#0F2D52] text-white p-3 rounded-t">Parent Signature</h2>
                <div className="flex flex-wrap -mx-3 p-4">
                    <div className="w-full md:w-1/2 px-3 mb-4">
                        <div className="form-group">
                            <label htmlFor="parent_sign_handbook" className="block font-bold mb-2">Parent Signature</label>
                            <input 
                                type="text" 
                                className="form-control border border-gray-300 rounded px-3 py-2 w-full" 
                                id="parent_sign_handbook"
                                name="parent_sign_handbook"
                                value={formData.parent_sign_handbook}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="w-full md:w-1/2 px-3 mb-4">
                        <div className="form-group">
                            <label htmlFor="parent_sign_date_handbook" className="block font-bold mb-2">Date</label>
                            <input 
                                type="date" 
                                className="form-control border border-gray-300 rounded px-3 py-2 w-full" 
                                id="parent_sign_date_handbook"
                                name="parent_sign_date_handbook"
                                value={formData.parent_sign_date_handbook}
                                onChange={handleChange}
                                readOnly
                            />
                        </div>
                    </div>
                </div>
                <div className="text-center mb-4">
                    <button 
                        className="bg-[#0F2D52] text-white py-2 px-6 rounded hover:bg-opacity-90 transition-colors" 
                        onClick={() => handleSubmit('parent')}
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );

    // Original Admin Signature Form Component
    const renderAdminSignatureForm = () => (
        <div id="parenthbkadminsign" className="container tab-pane bg-white shadow-lg rounded mb-4">
            <div className="card">
                <h2 className="text-center bg-[#0F2D52] text-white p-3 rounded-t">Admin Signature</h2>
                <div className="flex flex-wrap -mx-3 p-4">
                    <div className="w-full md:w-1/2 px-3 mb-4">
                        <div className="form-group">
                            <label htmlFor="admin_sign_handbook" className="block font-bold mb-2">Admin Signature</label>
                            <input 
                                type="text" 
                                className="form-control border border-gray-300 rounded px-3 py-2 w-full" 
                                id="admin_sign_handbook"
                                name="admin_sign_handbook"
                                value={formData.admin_sign_handbook}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="w-full md:w-1/2 px-3 mb-4">
                        <div className="form-group">
                            <label htmlFor="admin_sign_date_handbook" className="block font-bold mb-2">Date</label>
                            <input 
                                type="datetime-local" 
                                className="form-control border border-gray-300 rounded px-3 py-2 w-full" 
                                id="admin_sign_date_handbook"
                                name="admin_sign_date_handbook"
                                value={formData.admin_sign_date_handbook}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>
                <div className="text-center mb-4">
                    <button 
                        className="bg-[#0F2D52] text-white py-2 px-6 rounded hover:bg-opacity-90 transition-colors" 
                        onClick={() => handleSubmit('admin')}
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );

    // Main render logic
    return (
        <div>
            {currentSubForm === 'policy' && renderPolicyForm()}
            {currentSubForm === 'parent' && renderParentSignatureForm()}
            {currentSubForm === 'admin' && renderAdminSignatureForm()}
        </div>
    );
};

export default ParentHandbook;
