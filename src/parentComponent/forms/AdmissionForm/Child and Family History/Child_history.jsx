import React, { useState, useEffect } from 'react';
import { FormInput } from './InputComponent';
import { UpIcon, DownIcon } from './Arrows';



const Child_history = ({ openSection, setOpenSection, formData, handleInputChange, initialFormData, childId }) => {
    const [localFormData, setLocalFormData] = useState({
        DateOfLastPhysicalExam: '',
        DateOfLastDentalExam: ''
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
                DateOfLastPhysicalExam: initialFormData.physical_exam_last_date || '',
                DateOfLastDentalExam: initialFormData.dental_exam_last_date || ''
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

    // Function to check if all required fields are filled
    const isFormComplete = () => {
        const requiredFields = [
            'DateOfLastPhysicalExam',
            'DateOfLastDentalExam'
        ];
        
        return requiredFields.every(field => 
            localFormData[field] && localFormData[field].toString().trim() !== ''
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
                physical_exam_last_date: localFormData.DateOfLastPhysicalExam,
                dental_exam_last_date: localFormData.DateOfLastDentalExam
            };
            console.log(saveData);
            await updateAdmissionData(saveData);
            alert('Child history data saved successfully!');
        } catch (error) {
            console.error('Failed to save Child history data:', error);
            alert('Error saving Child history data. Please try again.');
        }
    };
    return (
        <>
            <div
                className={`px-6 py-4 flex items-center justify-between cursor-pointer transition-colors ${openSection === 'childHistory' ? 'text-white' : 'text-slate-700'
                    }`}
                style={
                    openSection === 'childHistory'
                        ? { backgroundColor: '#0F2D52', color: 'white' }
                        : { backgroundColor: '#DBEAFE' }
                }
                onClick={() =>
                    setOpenSection(openSection === 'childHistory' ? '' : 'childHistory')
                }
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#0F2D52';
                     e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                    if (openSection !== 'childHistory') {
                        e.currentTarget.style.backgroundColor = '#DBEAFE';
                        e.currentTarget.style.color = '#374151'; // Tailwind's text-slate-700
                    }
                }}
            >
                <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-semibold">
                        <div className="flex items-center space-x-3">
                            <span>Child History</span>
                            <img 
                                src={isFormComplete() ? "/image/tick.png" : "/image/circle-with.png"} 
                                alt={isFormComplete() ? "Complete" : "Incomplete"} 
                                className="w-5 h-5"
                            />
                        </div> 
                    </h2>
                </div>
                <div className="text-xl transform transition-transform duration-200">
                    {openSection === 'childHistory' ? (
                        <UpIcon className="h-5 w-5 text-white" />
                    ) : (
                        <DownIcon className="h-5 w-5 text-gray-500" />
                    )}
                </div>
            </div>



            {openSection === 'childHistory' && (
                <div className="p-6 space-y-6" style={{ border: '1px solid #314158' }} onClick={(e) => e.stopPropagation()}>
                    <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">

                            <FormInput
                                label="Date of Last Physical Exam"
                                type="date"
                                value={localFormData.DateOfLastPhysicalExam}
                                onChange={handleChange}
                                name="DateOfLastPhysicalExam"
                            />
                            <FormInput
                                label="Date of Last Dental Exam"
                                type="date"
                                value={localFormData.DateOfLastDentalExam}
                                onChange={handleChange}
                                name="DateOfLastDentalExam"
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

export default Child_history;
