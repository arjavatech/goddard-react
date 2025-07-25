import React, { useState, useEffect } from 'react';
import { FormInput, RadioGroup } from './InputComponent';
import { UpIcon, DownIcon } from './Arrows';

const PregnancyAndInfantHistory = ({ openSection, setOpenSection, formData, handleInputChange, initialFormData, childId }) => {
    const [localFormData, setLocalFormData] = useState({
        IllnessDuringPregnancy: '',
        ConditionOfNewborn: '',
        DurationOfPregnancy: '',
        BirthWeight: '',
        Complications: '',
        BottleFed: '',
        BreastFed: '',
        Name: '',
        Age: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocalFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleRadioChange = (e) => {
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
                IllnessDuringPregnancy: initialFormData.illness_during_pregnancy || '',
                ConditionOfNewborn: initialFormData.condition_of_newborn || '',
                DurationOfPregnancy: initialFormData.duration_of_pregnancy || '',
                BirthWeight: `${initialFormData.birth_weight_lbs || ''} lbs ${initialFormData.birth_weight_oz || ''} oz`,
                Complications: initialFormData.complications || '',
                BottleFed: initialFormData.bottle_fed === 1 ? 'yes' : (initialFormData.bottle_fed === 2 ? 'no' : ''),
                BreastFed: initialFormData.breast_fed === 1 ? 'yes' : (initialFormData.breast_fed === 2 ? 'no' : ''),
                Name: initialFormData.other_siblings_name || '',
                Age: initialFormData.other_siblings_age || ''
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
            localFormData.IllnessDuringPregnancy,
            localFormData.ConditionOfNewborn,
            localFormData.DurationOfPregnancy,
            localFormData.BirthWeight,
            localFormData.Complications,
            localFormData.BottleFed,
            localFormData.BreastFed
        ];
        return requiredFields.some(field => field && field.trim() !== '');
    };

    const handleSave = async () => {
        if (!childId) {
            alert('Error: Child ID is missing');
            return;
        }

        try {
            // Parse birth weight
            const birthWeightMatch = localFormData.BirthWeight.match(/(\d+)?\s*lbs?\s*(\d+)?\s*oz?/i);
            const lbs = birthWeightMatch?.[1] || '';
            const oz = birthWeightMatch?.[2] || '';

            const saveData = {
                child_id: childId,
                illness_during_pregnancy: localFormData.IllnessDuringPregnancy,
                condition_of_newborn: localFormData.ConditionOfNewborn,
                duration_of_pregnancy: localFormData.DurationOfPregnancy,
                birth_weight_lbs: lbs,
                birth_weight_oz: oz,
                complications: localFormData.Complications,
                bottle_fed: localFormData.BottleFed === 'yes' ? 1 : (localFormData.BottleFed === 'no' ? 2 : 2),
                breast_fed: localFormData.BreastFed === 'yes' ? 1 : (localFormData.BreastFed === 'no' ? 2 : 2),
                other_siblings_name: localFormData.Name,
                other_siblings_age: localFormData.Age
            };
            console.log(saveData);
            await updateAdmissionData(saveData);
            alert('Pregnancy and infant history data saved successfully!');
        } catch (error) {
            console.error('Failed to save Pregnancy and infant history data:', error);
            alert('Error saving Pregnancy and infant history data. Please try again.');
        }
    };
    return (
        <>
            <div
                className={`px-6 border-b py-4 flex items-center justify-between cursor-pointer transition-colors ${openSection === 'PregnancyAndInfantHistory' ? 'text-white' : 'text-slate-700'
                    }`}
                style={
                    openSection === 'PregnancyAndInfantHistory'
                        ? { backgroundColor: '#0F2D52', color: 'white' }
                        : { backgroundColor: '#DBEAFE' }
                }
                onClick={() =>
                    setOpenSection(
                        openSection === 'PregnancyAndInfantHistory' ? '' : 'PregnancyAndInfantHistory'
                    )
                }
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#0F2D52';
                     e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                    if (openSection !== 'PregnancyAndInfantHistory') {
                        e.currentTarget.style.backgroundColor = '#DBEAFE';
                        e.currentTarget.style.color = '#374151'; // Tailwind text-slate-700
                    }
                }}
            >
                <div className="flex items-center space-x-3">
                    <span className="text-lg font-medium">Pregnancy And Infant History</span>
                    <img 
                        src={isFormComplete() ? "/image/tick.png" : "/image/circle-with.png"} 
                        alt={isFormComplete() ? "Complete" : "Incomplete"} 
                        className="w-5 h-5"
                    />
                </div>
                <div className="text-xl transform transition-transform duration-200">
                    {openSection === 'PregnancyAndInfantHistory' ? (
                        <UpIcon className="h-5 w-5 text-white" />
                    ) : (
                        <DownIcon className="h-5 w-5 text-gray-500" />
                    )}
                </div>
            </div>


            {openSection === 'PregnancyAndInfantHistory' && (
                <div className="p-6 space-y-6 bg-gray-50" style={{ border: '1px solid #314158' }} onClick={(e) => e.stopPropagation()}>


                    {/* Home Address Section */}
                    <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">

                            <FormInput
                                label="Illness during pregnancy"
                                value={localFormData.IllnessDuringPregnancy}
                                onChange={handleChange}
                                name="IllnessDuringPregnancy"
                            />
                            <FormInput
                                label="Condition of Newborn"
                                value={localFormData.ConditionOfNewborn}
                                onChange={handleChange}
                                name="ConditionOfNewborn"
                            />


                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                            <FormInput
                                label="Duration of pregnancy"
                                value={localFormData.DurationOfPregnancy}
                                onChange={handleChange}
                                name="DurationOfPregnancy"
                            />
                            <FormInput
                                label="Birth Weight"
                                value={localFormData.BirthWeight}
                                onChange={handleChange}
                                name="BirthWeight"
                            />

                            <FormInput
                                label="Complications"
                                value={localFormData.Complications}
                                onChange={handleChange}
                                name="Complications"
                            />

                            <RadioGroup
                                label="Bottle Fed?"
                                name="BottleFed"
                                selectedValue={localFormData.BottleFed}
                                onChange={handleRadioChange}
                                options={[
                                    { label: 'Yes', value: 'yes' },
                                    { label: 'No', value: 'no' },
                                ]}
                            />

                            <RadioGroup
                                label="Breast Fed?"
                                name="BreastFed"
                                selectedValue={localFormData.BreastFed}
                                onChange={handleRadioChange}
                                options={[
                                    { label: 'Yes', value: 'yes' },
                                    { label: 'No', value: 'no' },
                                ]}
                            />


                        </div>
                    </div>

                    <div className="space-y-4">

                        <h1 className="text-center text-[25px] font-medium">Other Siblings</h1>

                        <div className="grid md:grid-cols-2 gap-4">

                            <FormInput
                                label="Name"
                                value={localFormData.Name}
                                onChange={handleChange}
                                name="Name"
                            />
                            <FormInput
                                label="Age"
                                value={localFormData.Age}
                                onChange={handleChange}
                                name="Age"
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

export default PregnancyAndInfantHistory;
