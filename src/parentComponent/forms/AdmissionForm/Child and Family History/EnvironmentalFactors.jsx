import React, { useState, useEffect } from 'react';
import { FormInput } from './InputComponent';
import { UpIcon, DownIcon } from './Arrows';

const EnvironmentalFactors = ({ openSection, setOpenSection, formData, handleInputChange, initialFormData, childId }) => {
    const [localFormData, setLocalFormData] = useState({
        HowManyTimesHaveYouMovedInTheLastFiveYears: '',
        EducationalToysGamesBooksUsedAtHome: '',
        HowManyHoursOfTelevisionDaily: '',
        LanguageUsedInTheHome: '',
        HaveThereBeenAnyChangesInTheHomeSituationRecently: '',
        WhatAreYourEducationalExpectationsOfYourChild: ''
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
                HowManyTimesHaveYouMovedInTheLastFiveYears: initialFormData.last_five_years_moved || '',
                EducationalToysGamesBooksUsedAtHome: initialFormData.things_used_at_home || '',
                HowManyHoursOfTelevisionDaily: initialFormData.hours_of_television_daily || '',
                LanguageUsedInTheHome: initialFormData.language_used_at_home || '',
                HaveThereBeenAnyChangesInTheHomeSituationRecently: initialFormData.changes_at_home_situation || '',
                WhatAreYourEducationalExpectationsOfYourChild: initialFormData.educational_expectations_of_child || ''
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
            localFormData.HowManyTimesHaveYouMovedInTheLastFiveYears,
            localFormData.EducationalToysGamesBooksUsedAtHome,
            localFormData.HowManyHoursOfTelevisionDaily,
            localFormData.LanguageUsedInTheHome,
            localFormData.HaveThereBeenAnyChangesInTheHomeSituationRecently,
            localFormData.WhatAreYourEducationalExpectationsOfYourChild
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
                last_five_years_moved: localFormData.HowManyTimesHaveYouMovedInTheLastFiveYears,
                things_used_at_home: localFormData.EducationalToysGamesBooksUsedAtHome,
                hours_of_television_daily: localFormData.HowManyHoursOfTelevisionDaily,
                language_used_at_home: localFormData.LanguageUsedInTheHome,
                changes_at_home_situation: localFormData.HaveThereBeenAnyChangesInTheHomeSituationRecently,
                educational_expectations_of_child: localFormData.WhatAreYourEducationalExpectationsOfYourChild
            };
            console.log(saveData);
            await updateAdmissionData(saveData);
            alert('Environmental factors data saved successfully!');
        } catch (error) {
            console.error('Failed to save Environmental factors data:', error);
            alert('Error saving Environmental factors data. Please try again.');
        }
    };
    return (
        <>
            <div
                className={`px-6 border-b py-4 flex items-center justify-between cursor-pointer transition-colors ${openSection === 'EnvironmentalFactors' ? 'text-white' : 'text-slate-700'
                    }`}
                style={
                    openSection === 'EnvironmentalFactors'
                        ? { backgroundColor: '#0F2D52', color: 'white' }
                        : { backgroundColor: '#DBEAFE' }
                }
                onClick={() =>
                    setOpenSection(openSection === 'EnvironmentalFactors' ? '' : 'EnvironmentalFactors')
                }
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#0F2D52';
                     e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                    if (openSection !== 'EnvironmentalFactors') {
                        e.currentTarget.style.backgroundColor = '#DBEAFE';
                        e.currentTarget.style.color = '#374151'; // Tailwind's text-slate-700
                    }
                }}
            >
                <div className="flex items-center space-x-3">
                    <span className="text-lg font-semibold">Environmental Factors</span>
                    <img 
                        src={isFormComplete() ? "/image/tick.png" : "/image/circle-with.png"} 
                        alt={isFormComplete() ? "Complete" : "Incomplete"} 
                        className="w-5 h-5"
                    />
                </div>
                <div className="text-xl transform transition-transform duration-200">
                    {openSection === 'EnvironmentalFactors' ? (
                        <UpIcon className="h-5 w-5 text-white" />
                    ) : (
                        <DownIcon className="h-5 w-5 text-gray-500" />
                    )}
                </div>
            </div>


            {openSection === 'EnvironmentalFactors' && (
                <div className="p-6 space-y-6 bg-gray-50" style={{ border: '1px solid #314158' }} onClick={(e) => e.stopPropagation()}>


                    {/* Home Address Section */}
                    <div className="space-y-4">
                        <div className="grid md:grid-cols-1 gap-4">

                            <FormInput
                                label="How many times have you moved in the last five years?"
                                value={localFormData.HowManyTimesHaveYouMovedInTheLastFiveYears}
                                onChange={handleChange}
                                name="HowManyTimesHaveYouMovedInTheLastFiveYears"
                            />
                            <FormInput
                                label="Educational toys, games, books used at home?"
                                value={localFormData.EducationalToysGamesBooksUsedAtHome}
                                onChange={handleChange}
                                name="EducationalToysGamesBooksUsedAtHome"
                            />

                            <FormInput
                                label="How many hours of television daily?"
                                value={localFormData.HowManyHoursOfTelevisionDaily}
                                onChange={handleChange}
                                name="HowManyHoursOfTelevisionDaily"
                            />
                            <FormInput
                                label="Language used in the home?"
                                value={localFormData.LanguageUsedInTheHome}
                                onChange={handleChange}
                                name="LanguageUsedInTheHome"
                            />

                            <FormInput
                                label="Have there been any changes in the home situation recently, i.e. addition/loss/death/divorce."
                                value={localFormData.HaveThereBeenAnyChangesInTheHomeSituationRecently}
                                onChange={handleChange}
                                name="HaveThereBeenAnyChangesInTheHomeSituationRecently"
                            />

                            <FormInput
                                label="What are your educational expectations of your child?"
                                value={localFormData.WhatAreYourEducationalExpectationsOfYourChild}
                                onChange={handleChange}
                                name="WhatAreYourEducationalExpectationsOfYourChild"
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

export default EnvironmentalFactors;
