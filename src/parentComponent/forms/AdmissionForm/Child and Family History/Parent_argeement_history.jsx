import React from 'react';
import { FormInput } from './InputComponent';
import { UpIcon, DownIcon } from './Arrows';


const Parent_argeement = ({ openSection, setOpenSection, formData, handleInputChange }) => {
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
                    <h2 className="text-lg font-semibold">Medical History And Illnesses</h2>
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
                                value={formData.AllergiesFoodDrug}
                                onChange={(e) => handleInputChange('DateOfLastPhysicalExam', e.target.value)}
                                name="AllergiesFoodDrug"
                            />
                            <FormInput
                                label="Asthma"
                                value={formData.Asthma}
                                onChange={(e) => handleInputChange('DateOfLastDentalExam', e.target.value)}
                                name="Asthma"
                            />

                            <FormInput
                                label="Bleeding Problems"
                                value={formData.BleedingProblems}
                                onChange={(e) => handleInputChange('DateOfLastPhysicalExam', e.target.value)}
                                name="BleedingProblems"
                            />
                            <FormInput
                                label="Diabetes"
                                value={formData.Diabetes}
                                onChange={(e) => handleInputChange('DateOfLastDentalExam', e.target.value)}
                                name="Diabetes"
                            />

                            <FormInput
                                label="Epilepsy"
                                value={formData.Epilepsy}
                                onChange={(e) => handleInputChange('DateOfLastDentalExam', e.target.value)}
                                name="Epilepsy"
                            />

                            <FormInput
                                label="Frequent Ear Infections"
                                value={formData.FrequentEarInfections}
                                onChange={(e) => handleInputChange('DateOfLastDentalExam', e.target.value)}
                                name="FrequentEarInfections"
                            />

                            <FormInput
                                label="Frequent Illnesses"
                                value={formData.FrequentIllnesses}
                                onChange={(e) => handleInputChange('DateOfLastDentalExam', e.target.value)}
                                name="FrequentIllnesses"
                            />


                            <FormInput
                                label="Hearing Problems"
                                value={formData.HearingProblems}
                                onChange={(e) => handleInputChange('DateOfLastDentalExam', e.target.value)}
                                name="HearingProblems"
                            />

                            <FormInput
                                label="High Fevers"
                                value={formData.HighFevers}
                                onChange={(e) => handleInputChange('DateOfLastDentalExam', e.target.value)}
                                name="HighFevers"
                            />

                            <FormInput
                                label="Hospitialization"
                                value={formData.Hospitialization}
                                onChange={(e) => handleInputChange('DateOfLastDentalExam', e.target.value)}
                                name="Hospitialization"
                            />

                            <FormInput
                                label="Rheumatic Fever"
                                value={formData.RheumaticFever}
                                onChange={(e) => handleInputChange('DateOfLastDentalExam', e.target.value)}
                                name="RheumaticFever"
                            />

                            <FormInput
                                label="Seizures/Convulsions"
                                value={formData.SeizuresConvulsions}
                                onChange={(e) => handleInputChange('DateOfLastDentalExam', e.target.value)}
                                name="Seizures/Convulsions"
                            />
                            <FormInput
                                label="Serious Injuries/Accidents"
                                value={formData.SeriousInjuriesAccidents}
                                onChange={(e) => handleInputChange('DateOfLastDentalExam', e.target.value)}
                                name="Serious Injuries/Accidents"
                            />

                            <FormInput
                                label="Surgeries"
                                value={formData.Surgeries}
                                onChange={(e) => handleInputChange('DateOfLastDentalExam', e.target.value)}
                                name="Surgeries"
                            />
                            <FormInput
                                label="Vision Problems"
                                value={formData.VisionProblems}
                                onChange={(e) => handleInputChange('DateOfLastDentalExam', e.target.value)}
                                name="VisionProblems"
                            />

                            <FormInput
                                label="Other"
                                value={formData.Other}
                                onChange={(e) => handleInputChange('DateOfLastDentalExam', e.target.value)}
                                name="Other"
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

export default Parent_argeement;
