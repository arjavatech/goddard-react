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

const ParentHandbook = ({ selectedSubForm = null }) => {
    const [openSection, setOpenSection] = useState('childDetails');
    const [formData, setFormData] = useState({
        parent_sign_ach: '',
        parent_sign_date_ach: '',
        admin_sign_ach: '',
        admin_sign_date_ach: ''
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
            parent_sign_date_ach: new Date().toISOString().split('T')[0]
        }));
    }, []);

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
                <TheGoddardSchool openSection={openSection} setOpenSection={setOpenSection} />
                <MissionStatement openSection={openSection} setOpenSection={setOpenSection} />
                <GeneralEnrollmentProcedure openSection={openSection} setOpenSection={setOpenSection} />
                <StatementOfConfidentiality openSection={openSection} setOpenSection={setOpenSection} />
                <ParentAccess openSection={openSection} setOpenSection={setOpenSection} />
                <ReleaseOfChildren openSection={openSection} setOpenSection={setOpenSection} />
                <RegisterationTutionFees openSection={openSection} setOpenSection={setOpenSection} />
                <OutsideEngagement openSection={openSection} setOpenSection={setOpenSection} />
                <HealthPolicies openSection={openSection} setOpenSection={setOpenSection} />
                <MedicationProcedures openSection={openSection} setOpenSection={setOpenSection} />
                <ToysFromHome openSection={openSection} setOpenSection={setOpenSection} />
                <RestTimeMealsSnacks openSection={openSection} setOpenSection={setOpenSection} />
                <TransitionToiletTraining openSection={openSection} setOpenSection={setOpenSection} />
                <EmergencyClosings openSection={openSection} setOpenSection={setOpenSection} />
                <WebsiteAndBlog openSection={openSection} setOpenSection={setOpenSection} />
                <ExpulsionPolicy openSection={openSection} setOpenSection={setOpenSection} />
                <AddressingIndividualChildConcern openSection={openSection} setOpenSection={setOpenSection} />
                <FinalWord openSection={openSection} setOpenSection={setOpenSection} />
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
                            <label htmlFor="parent_sign_ach" className="block font-bold mb-2">Parent Signature</label>
                            <input 
                                type="text" 
                                className="form-control border border-gray-300 rounded px-3 py-2 w-full" 
                                id="parent_sign_ach"
                                name="parent_sign_ach"
                                value={formData.parent_sign_ach}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="w-full md:w-1/2 px-3 mb-4">
                        <div className="form-group">
                            <label htmlFor="parent_sign_date_ach" className="block font-bold mb-2">Date</label>
                            <input 
                                type="date" 
                                className="form-control border border-gray-300 rounded px-3 py-2 w-full" 
                                id="parent_sign_date_ach"
                                name="parent_sign_date_ach"
                                value={formData.parent_sign_date_ach}
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
                            <label htmlFor="admin_sign_ach" className="block font-bold mb-2">Admin Signature</label>
                            <input 
                                type="text" 
                                className="form-control border border-gray-300 rounded px-3 py-2 w-full" 
                                id="admin_sign_ach"
                                name="admin_sign_ach"
                                value={formData.admin_sign_ach}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="w-full md:w-1/2 px-3 mb-4">
                        <div className="form-group">
                            <label htmlFor="admin_sign_date_ach" className="block font-bold mb-2">Date</label>
                            <input 
                                type="datetime-local" 
                                className="form-control border border-gray-300 rounded px-3 py-2 w-full" 
                                id="admin_sign_date_ach"
                                name="admin_sign_date_ach"
                                value={formData.admin_sign_date_ach}
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
