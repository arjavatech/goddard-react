import React from 'react';
import { FormInput } from './InputComponent';
import { UpIcon, DownIcon } from './Arrows';



const Child_history = ({ openSection, setOpenSection, formData, handleInputChange }) => {
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
                        Child History 
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
                                value={formData.DateOfLastPhysicalExam}
                                onChange={(e) => handleInputChange('DateOfLastPhysicalExam', e.target.value)}
                                name="DateOfLastPhysicalExam"
                            />
                            <FormInput
                                label="Date of Last Dental Exam"
                                type="date"
                                value={formData.DateOfLastDentalExam}
                                onChange={(e) => handleInputChange('DateOfLastDentalExam', e.target.value)}
                                name="DateOfLastDentalExam"
                            />

                        </div>
                    </div>

                    <div className="flex justify-center pt-4">
                        <button className="hover:bg-slate-700 text-white px-8 py-3 rounded-md bg-slate-800 transition-colors">
                            Save
                        </button>
                    </div>


                </div>
            )}
        </>
    );
};

export default Child_history;
