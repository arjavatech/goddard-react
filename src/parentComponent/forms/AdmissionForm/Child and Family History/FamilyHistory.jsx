import React from 'react';
import { CheckboxGroup } from './InputComponent';
import { UpIcon, DownIcon } from './Arrows';

const FamilyHistory = ({ openSection, setOpenSection, formData, handleInputChange }) => {
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
                                selectedValues={formData.hobbies}
                                onChange={(updatedValues) => handleInputChange('hobbies', updatedValues)}
                            />


                            <CheckboxGroup
                                label=""
                                name="Heart Problems"
                                options={[
                                    { label: 'Heart Problems', value: 'HeartProblems' },

                                ]}
                                selectedValues={formData.HeartProblems}
                                onChange={(updatedValues) => handleInputChange('HeartProblems', updatedValues)}
                            />

                            <CheckboxGroup
                                label=""
                                name="Tuberculosis"
                                options={[
                                    { label: 'Tuberculosis', value: 'Tuberculosis' },

                                ]}
                                selectedValues={formData.Tuberculosis}
                                onChange={(updatedValues) => handleInputChange('Tuberculosis', updatedValues)}
                            />

                            <CheckboxGroup
                                label=""
                                name="Asthma"
                                options={[
                                    { label: 'Asthma', value: 'Asthma' },

                                ]}
                                selectedValues={formData.Asthma}
                                onChange={(updatedValues) => handleInputChange('Asthma', updatedValues)}
                            />

                            <CheckboxGroup
                                label=""
                                name="High Blood Pressure"
                                options={[
                                    { label: 'High Blood Pressure', value: 'HighBloodPressure' },

                                ]}
                                selectedValues={formData.HighBloodPressure}
                                onChange={(updatedValues) => handleInputChange('HighBloodPressure', updatedValues)}
                            />
                            <CheckboxGroup
                                label=""
                                name="Vision Problems"
                                options={[
                                    { label: 'Vision Problems', value: 'VisionProblems' },

                                ]}
                                selectedValues={formData.VisionProblems}
                                onChange={(updatedValues) => handleInputChange('VisionProblems', updatedValues)}
                            />

                            <CheckboxGroup
                                label=""
                                name="Diabetes"
                                options={[
                                    { label: 'Diabetes', value: 'Diabetes' },

                                ]}
                                selectedValues={formData.Diabetes}
                                onChange={(updatedValues) => handleInputChange('Diabetes', updatedValues)}
                            />

                            <CheckboxGroup
                                label=""
                                name="Hyperactivity"
                                options={[
                                    { label: 'Hyperactivity', value: 'Hyperactivity' },

                                ]}
                                selectedValues={formData.Hyperactivity}
                                onChange={(updatedValues) => handleInputChange('Hyperactivity', updatedValues)}
                            />

                            <CheckboxGroup
                                label=""
                                name="Epilepsy"
                                options={[
                                    { label: 'Epilepsy', value: 'Epilepsy' },

                                ]}
                                selectedValues={formData.Epilepsy}
                                onChange={(updatedValues) => handleInputChange('Epilepsy', updatedValues)}
                            />
                            <CheckboxGroup
                                label=""
                                name="No Illnesses"
                                options={[
                                    { label: 'No Illnesses', value: 'NoIllnesses' },

                                ]}
                                selectedValues={formData.NoIllnesses}
                                onChange={(updatedValues) => handleInputChange('NoIllnesses', updatedValues)}
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

export default FamilyHistory;
