import React, { useState, useEffect } from 'react';
import { CheckboxGroup } from './InputComponent';
import { UpIcon, DownIcon } from './Arrows';



const Parent_Agreement = ({ openSection, setOpenSection, formData, handleInputChange, initialFormData, childId }) => {
    const [localFormData, setLocalFormData] = useState({
        agree_all_above_info_is_correct: []
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
                agree_all_above_info_is_correct: initialFormData.agree_all_above_info_is_correct === 'on' ? ['I agree all the above information is correct.'] : []
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
        return localFormData.agree_all_above_info_is_correct.includes('I agree all the above information is correct.');
    };

    const handleSave = async () => {
        if (!childId) {
            alert('Error: Child ID is missing');
            return;
        }

        try {
            const saveData = {
                child_id: childId,
                agree_all_above_info_is_correct: localFormData.agree_all_above_info_is_correct.includes('I agree all the above information is correct.') ? 'on' : ''
            };
            console.log(saveData);
            await updateAdmissionData(saveData);
            alert('Parent agreement data saved successfully!');
        } catch (error) {
            console.error('Failed to save Parent agreement data:', error);
            alert('Error saving Parent agreement data. Please try again.');
        }
    };
    return (
        <>
            <div
                className={`px-6 py-4 flex items-center justify-between cursor-pointer transition-colors ${openSection === 'ParentAgreement' ? 'text-white' : 'text-slate-700'
                    }`}
                style={
                    openSection === 'ParentAgreement'
                        ? { backgroundColor: '#0F2D52', color: 'white' }
                        : { backgroundColor: '#DBEAFE' }
                }
                onClick={() =>
                    setOpenSection(openSection === 'ParentAgreement' ? '' : 'ParentAgreement')
                }
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#0F2D52';
                    e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                    if (openSection !== 'ParentAgreement') {
                        e.currentTarget.style.backgroundColor = '#DBEAFE';
                        e.currentTarget.style.color = '#374151'; // Tailwind's text-slate-700
                    }
                }}
            >
                <div className="flex items-center space-x-3">
                    <span className="text-lg font-semibold">Parent Agreement</span>
                    <img 
                        src={isFormComplete() ? "/image/tick.png" : "/image/circle-with.png"} 
                        alt={isFormComplete() ? "Complete" : "Incomplete"} 
                        className="w-5 h-5"
                    />
                </div>
                <div className="text-xl transform transition-transform duration-200">
                    {openSection === 'ParentAgreement' ? (
                        <UpIcon className="h-5 w-5 text-white" />
                    ) : (
                        <DownIcon className="h-5 w-5 text-gray-500" />
                    )}
                </div>
            </div>



            {openSection === 'ParentAgreement' && (
                <div className="p-6 space-y-6" style={{ border: '1px solid #314158' }} onClick={(e) => e.stopPropagation()}>
                    <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">

                            <CheckboxGroup
                                label=""
                                name="hobbies"
                                options={[
                                    { label: 'I agree all the above information is correct.', value: 'I agree all the above information is correct.' },

                                ]}
                                selectedValues={localFormData.agree_all_above_info_is_correct}
                                onChange={(updatedValues) => handleCheckboxChange('agree_all_above_info_is_correct', updatedValues)}
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

export default Parent_Agreement;
