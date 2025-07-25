import React, { useState, useEffect } from 'react';
import { FormInput } from './InputComponent';
import { UpIcon, DownIcon } from './Arrows';


const Parent_argeement = ({ openSection, setOpenSection, formData, handleInputChange, initialFormData, childId }) => {
    const [localFormData, setLocalFormData] = useState({
        AllergiesFoodDrug: '',
        Asthma: '',
        BleedingProblems: '',
        Diabetes: '',
        Epilepsy: '',
        FrequentEarInfections: '',
        FrequentIllnesses: '',
        HearingProblems: '',
        HighFevers: '',
        Hospitialization: '',
        RheumaticFever: '',
        SeizuresConvulsions: '',
        SeriousInjuriesAccidents: '',
        Surgeries: '',
        VisionProblems: '',
        Other: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocalFormData(prevState => ({
            ...prevState,
            [name]: value
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
                AllergiesFoodDrug: initialFormData.allergies || '',
                Asthma: initialFormData.asthma || '',
                BleedingProblems: initialFormData.bleeding_problems || '',
                Diabetes: initialFormData.diabetes || '',
                Epilepsy: initialFormData.epilepsy || '',
                FrequentEarInfections: initialFormData.frequent_ear_infections || '',
                FrequentIllnesses: initialFormData.frequent_illnesses || '',
                HearingProblems: initialFormData.hearing_problems || '',
                HighFevers: initialFormData.high_fevers || '',
                Hospitialization: initialFormData.hospitalization || '',
                RheumaticFever: initialFormData.rheumatic_fever || '',
                SeizuresConvulsions: initialFormData.seizures_convulsions || '',
                SeriousInjuriesAccidents: initialFormData.serious_injuries_accidents || '',
                Surgeries: initialFormData.surgeries || '',
                VisionProblems: initialFormData.vision_problems || '',
                Other: initialFormData.medical_other || ''
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

    const isFormComplete = () => {
        const requiredFields = [
            localFormData.AllergiesFoodDrug,
            localFormData.Asthma,
            localFormData.BleedingProblems,
            localFormData.Diabetes,
            localFormData.Epilepsy,
            localFormData.FrequentEarInfections,
            localFormData.FrequentIllnesses,
            localFormData.HearingProblems,
            localFormData.HighFevers,
            localFormData.Hospitialization,
            localFormData.RheumaticFever,
            localFormData.SeizuresConvulsions,
            localFormData.SeriousInjuriesAccidents,
            localFormData.Surgeries,
            localFormData.VisionProblems
        ];
        return requiredFields.some(field => field && field.trim() !== '');
    };

    const handleSave = async () => {
        if (!childId) {
            alert('Error: Child ID is missing');
            return;
        }

        try {
            const saveData = {
                child_id: childId,
                allergies: localFormData.AllergiesFoodDrug,
                asthma: localFormData.Asthma,
                bleeding_problems: localFormData.BleedingProblems,
                diabetes: localFormData.Diabetes,
                epilepsy: localFormData.Epilepsy,
                frequent_ear_infections: localFormData.FrequentEarInfections,
                frequent_illnesses: localFormData.FrequentIllnesses,
                hearing_problems: localFormData.HearingProblems,
                high_fevers: localFormData.HighFevers,
                hospitalization: localFormData.Hospitialization,
                rheumatic_fever: localFormData.RheumaticFever,
                seizures_convulsions: localFormData.SeizuresConvulsions,
                serious_injuries_accidents: localFormData.SeriousInjuriesAccidents,
                surgeries: localFormData.Surgeries,
                vision_problems: localFormData.VisionProblems,
                medical_other: localFormData.Other
            };
            console.log(saveData);
            await updateAdmissionData(saveData);
            alert('Medical history data saved successfully!');
        } catch (error) {
            console.error('Failed to save Medical history data:', error);
            alert('Error saving Medical history data. Please try again.');
        }
    };
    return (
        <>
            <div
                className={`px-6 border-b py-4 flex items-center justify-between cursor-pointer transition-colors ${openSection === 'parentArgeement' ? 'text-white' : 'text-slate-700'
                    }`}
                style={
                    openSection === 'parentArgeement'
                        ? { backgroundColor: '#0F2D52', color: 'white' }
                        : { backgroundColor: '#DBEAFE' }
                }
                onClick={() =>
                    setOpenSection(openSection === 'parentArgeement' ? '' : 'parentArgeement')
                }
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#0F2D52';
                     e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                    if (openSection !== 'parentArgeement') {
                        e.currentTarget.style.backgroundColor = '#DBEAFE';
                        e.currentTarget.style.color = '#374151';
                    }
                }}
            >
                <div className="flex items-center space-x-3">
                    <span className="text-lg font-semibold">Medical History And Illnesses</span>
                    <img 
                        src={isFormComplete() ? "/image/tick.png" : "/image/circle-with.png"} 
                        alt={isFormComplete() ? "Complete" : "Incomplete"} 
                        className="w-5 h-5"
                    />
                </div>
                <div className="text-xl transform transition-transform duration-200">
                    {openSection === 'parentArgeement' ? (
                        <UpIcon className="h-5 w-5 text-white" />
                    ) : (
                        <DownIcon className="h-5 w-5 text-gray-500" />
                    )}
                </div>
            </div>

            {openSection === 'parentArgeement' && (
                <div className="p-6 space-y-6 bg-gray-50" style={{ border: '1px solid #314158' }} onClick={(e) => e.stopPropagation()}>


                    {/* Home Address Section */}
                    <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">

                            <FormInput
                                label="Allergies (food/drug)"
                                value={localFormData.AllergiesFoodDrug}
                                onChange={handleChange}
                                name="AllergiesFoodDrug"
                            />
                            <FormInput
                                label="Asthma"
                                value={localFormData.Asthma}
                                onChange={handleChange}
                                name="Asthma"
                            />

                            <FormInput
                                label="Bleeding Problems"
                                value={localFormData.BleedingProblems}
                                onChange={handleChange}
                                name="BleedingProblems"
                            />
                            <FormInput
                                label="Diabetes"
                                value={localFormData.Diabetes}
                                onChange={handleChange}
                                name="Diabetes"
                            />

                            <FormInput
                                label="Epilepsy"
                                value={localFormData.Epilepsy}
                                onChange={handleChange}
                                name="Epilepsy"
                            />

                            <FormInput
                                label="Frequent Ear Infections"
                                value={localFormData.FrequentEarInfections}
                                onChange={handleChange}
                                name="FrequentEarInfections"
                            />

                            <FormInput
                                label="Frequent Illnesses"
                                value={localFormData.FrequentIllnesses}
                                onChange={handleChange}
                                name="FrequentIllnesses"
                            />


                            <FormInput
                                label="Hearing Problems"
                                value={localFormData.HearingProblems}
                                onChange={handleChange}
                                name="HearingProblems"
                            />

                            <FormInput
                                label="High Fevers"
                                value={localFormData.HighFevers}
                                onChange={handleChange}
                                name="HighFevers"
                            />

                            <FormInput
                                label="Hospitialization"
                                value={localFormData.Hospitialization}
                                onChange={handleChange}
                                name="Hospitialization"
                            />

                            <FormInput
                                label="Rheumatic Fever"
                                value={localFormData.RheumaticFever}
                                onChange={handleChange}
                                name="RheumaticFever"
                            />

                            <FormInput
                                label="Seizures/Convulsions"
                                value={localFormData.SeizuresConvulsions}
                                onChange={handleChange}
                                name="SeizuresConvulsions"
                            />
                            <FormInput
                                label="Serious Injuries/Accidents"
                                value={localFormData.SeriousInjuriesAccidents}
                                onChange={handleChange}
                                name="SeriousInjuriesAccidents"
                            />

                            <FormInput
                                label="Surgeries"
                                value={localFormData.Surgeries}
                                onChange={handleChange}
                                name="Surgeries"
                            />
                            <FormInput
                                label="Vision Problems"
                                value={localFormData.VisionProblems}
                                onChange={handleChange}
                                name="VisionProblems"
                            />

                            <FormInput
                                label="Other"
                                value={localFormData.Other}
                                onChange={handleChange}
                                name="Other"
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

export default Parent_argeement;
