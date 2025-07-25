import React, { useState, useEffect } from 'react';
import { CheckboxGroup } from './InputComponent';
import { UpIcon, DownIcon } from './Arrows';

const FamilyHistory = ({ openSection, setOpenSection, formData, handleInputChange, initialFormData, childId }) => {
    const [localFormData, setLocalFormData] = useState({
        hobbies: [],
        HeartProblems: [], 
        Tuberculosis: [],
        Asthma: [],
        HighBloodPressure: [],
        VisionProblems: [],
        Diabetes: [],
        Hyperactivity: [],
        Epilepsy: [],
        NoIllnesses: []
    });

    const handleCheckboxChange = (name, updatedValues) => {
        setLocalFormData(prevState => ({
            ...prevState,
            [name]: updatedValues
        }));
    };

    useEffect(() => {
        setLocalFormData(prevState => ({
            ...prevState
        }));
    }, []);

    useEffect(() => {
        if (initialFormData) {
            setLocalFormData(prevState => ({
                child_id: childId,
                hobbies: initialFormData.family_history_allergies === 'on' ? ['allergies'] : [],
                HeartProblems: initialFormData.family_history_heart_problems === 'on' ? ['HeartProblems'] : [],
                Tuberculosis: initialFormData.family_history_tuberculosis === 'on' ? ['Tuberculosis'] : [],
                Asthma: initialFormData.family_history_asthma === 'on' ? ['Asthma'] : [],
                HighBloodPressure: initialFormData.family_history_high_blood_pressure === 'on' ? ['HighBloodPressure'] : [],
                VisionProblems: initialFormData.family_history_vision_problems === 'on' ? ['VisionProblems'] : [],
                Diabetes: initialFormData.family_history_diabetes === 'on' ? ['Diabetes'] : [],
                Hyperactivity: initialFormData.family_history_hyperactivity === 'on' ? ['Hyperactivity'] : [],
                Epilepsy: initialFormData.family_history_epilepsy === 'on' ? ['Epilepsy'] : [],
                NoIllnesses: initialFormData.no_illnesses_for_this_child === 'on' ? ['NoIllnesses'] : []
            }));
        }
    }, [initialFormData, childId]);

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

    // Function to check if any required field is filled (at least one checkbox)
    const isFormComplete = () => {
        const allCheckboxGroups = [
            'hobbies', 'HeartProblems', 'Tuberculosis', 'Asthma', 
            'HighBloodPressure', 'VisionProblems', 'Diabetes', 
            'Hyperactivity', 'Epilepsy', 'NoIllnesses'
        ];
        
        return allCheckboxGroups.some(group => 
            localFormData[group] && localFormData[group].length > 0
        );
    };

    const handleSave = async () => {
        if (!childId) {
            alert('Error: Child ID is missing');
            return;
        }

        try {
            const saveData = {
                child_id: childId,
                family_history_allergies: localFormData.hobbies.includes('allergies') ? 'on' : '',
                family_history_heart_problems: localFormData.HeartProblems.includes('HeartProblems') ? 'on' : '',
                family_history_tuberculosis: localFormData.Tuberculosis.includes('Tuberculosis') ? 'on' : '',
                family_history_asthma: localFormData.Asthma.includes('Asthma') ? 'on' : '',
                family_history_high_blood_pressure: localFormData.HighBloodPressure.includes('HighBloodPressure') ? 'on' : '',
                family_history_vision_problems: localFormData.VisionProblems.includes('VisionProblems') ? 'on' : '',
                family_history_diabetes: localFormData.Diabetes.includes('Diabetes') ? 'on' : '',
                family_history_hyperactivity: localFormData.Hyperactivity.includes('Hyperactivity') ? 'on' : '',
                family_history_epilepsy: localFormData.Epilepsy.includes('Epilepsy') ? 'on' : '',
                no_illnesses_for_this_child: localFormData.NoIllnesses.includes('NoIllnesses') ? 'on' : ''
            };
            console.log(saveData);
            await updateAdmissionData(saveData);
            alert('Family history data saved successfully!');
        } catch (error) {
            console.error('Failed to save Family history data:', error);
            alert('Error saving Family history data. Please try again.');
        }
    };
    return (
        <>
            <div
                className={`px-6 border-b py-4 flex items-center justify-between cursor-pointer transition-colors ${openSection === 'FamilyHistory' ? 'text-white' : 'text-slate-700'
                    }`}
                style={
                    openSection === 'FamilyHistory'
                        ? { backgroundColor: '#0F2D52', color: 'white' }
                        : { backgroundColor: '#DBEAFE' }
                }
                onClick={() =>
                    setOpenSection(openSection === 'FamilyHistory' ? '' : 'FamilyHistory')
                }
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#0F2D52';
                     e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                    if (openSection !== 'FamilyHistory') {
                        e.currentTarget.style.backgroundColor = '#DBEAFE';
                        e.currentTarget.style.color = '#374151'; // Tailwind's text-slate-700
                    }
                }}
            >
                <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-semibold">Family History</h2>
                    <img 
                        src={isFormComplete() ? "/image/tick.png" : "/image/circle-with.png"} 
                        alt={isFormComplete() ? "Complete" : "Incomplete"} 
                        className="w-5 h-5"
                    />
                </div>
                <div className="text-xl transform transition-transform duration-200">
                    {openSection === 'FamilyHistory' ? (
                        <UpIcon className="h-5 w-5 text-white" />
                    ) : (
                        <DownIcon className="h-5 w-5 text-gray-500" />
                    )}
                </div>
            </div>


            {openSection === 'FamilyHistory' && (
                <div className="p-6 space-y-6 bg-gray-50" style={{ border: '1px solid #314158' }} onClick={(e) => e.stopPropagation()}>


                    {/* Home Address Section */}
                    <div className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-5 ps-10 pe-10">

                            <CheckboxGroup
                                label=""
                                name="hobbies"
                                options={[
                                    { label: 'Allergies', value: 'allergies' },

                                ]}
                                selectedValues={localFormData.hobbies}
                                onChange={(updatedValues) => handleCheckboxChange('hobbies', updatedValues)}
                            />


                            <CheckboxGroup
                                label=""
                                name="Heart Problems"
                                options={[
                                    { label: 'Heart Problems', value: 'HeartProblems' },

                                ]}
                                selectedValues={localFormData.HeartProblems}
                                onChange={(updatedValues) => handleCheckboxChange('HeartProblems', updatedValues)}
                            />

                            <CheckboxGroup
                                label=""
                                name="Tuberculosis"
                                options={[
                                    { label: 'Tuberculosis', value: 'Tuberculosis' },

                                ]}
                                selectedValues={localFormData.Tuberculosis}
                                onChange={(updatedValues) => handleCheckboxChange('Tuberculosis', updatedValues)}
                            />

                            <CheckboxGroup
                                label=""
                                name="Asthma"
                                options={[
                                    { label: 'Asthma', value: 'Asthma' },

                                ]}
                                selectedValues={localFormData.Asthma}
                                onChange={(updatedValues) => handleCheckboxChange('Asthma', updatedValues)}
                            />

                            <CheckboxGroup
                                label=""
                                name="High Blood Pressure"
                                options={[
                                    { label: 'High Blood Pressure', value: 'HighBloodPressure' },

                                ]}
                                selectedValues={localFormData.HighBloodPressure}
                                onChange={(updatedValues) => handleCheckboxChange('HighBloodPressure', updatedValues)}
                            />
                            <CheckboxGroup
                                label=""
                                name="Vision Problems"
                                options={[
                                    { label: 'Vision Problems', value: 'VisionProblems' },

                                ]}
                                selectedValues={localFormData.VisionProblems}
                                onChange={(updatedValues) => handleCheckboxChange('VisionProblems', updatedValues)}
                            />

                            <CheckboxGroup
                                label=""
                                name="Diabetes"
                                options={[
                                    { label: 'Diabetes', value: 'Diabetes' },

                                ]}
                                selectedValues={localFormData.Diabetes}
                                onChange={(updatedValues) => handleCheckboxChange('Diabetes', updatedValues)}
                            />

                            <CheckboxGroup
                                label=""
                                name="Hyperactivity"
                                options={[
                                    { label: 'Hyperactivity', value: 'Hyperactivity' },

                                ]}
                                selectedValues={localFormData.Hyperactivity}
                                onChange={(updatedValues) => handleCheckboxChange('Hyperactivity', updatedValues)}
                            />

                            <CheckboxGroup
                                label=""
                                name="Epilepsy"
                                options={[
                                    { label: 'Epilepsy', value: 'Epilepsy' },

                                ]}
                                selectedValues={localFormData.Epilepsy}
                                onChange={(updatedValues) => handleCheckboxChange('Epilepsy', updatedValues)}
                            />
                            <CheckboxGroup
                                label=""
                                name="No Illnesses"
                                options={[
                                    { label: 'No Illnesses', value: 'NoIllnesses' },

                                ]}
                                selectedValues={localFormData.NoIllnesses}
                                onChange={(updatedValues) => handleCheckboxChange('NoIllnesses', updatedValues)}
                            />
                        </div>
                    </div>

                    <div className="flex justify-center pt-4">
                        <button 
                            onClick={handleSave}
                            className="hover:bg-slate-700 text-white px-8 py-3 rounded-md bg-slate-800 transition-colors"
                        >
                            Save
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default FamilyHistory;
