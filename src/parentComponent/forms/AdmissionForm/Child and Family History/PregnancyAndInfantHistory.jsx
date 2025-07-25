import React from 'react';
import { FormInput, RadioGroup } from './InputComponent';

const PregnancyAndInfantHistory = ({ openSection, setOpenSection, formData, handleInputChange }) => {
    return (
        <>
            <div
                className={`bg-blue-50 px-6 border-b py-4 flex items-center justify-between cursor-pointer hover:bg-slate-700 hover:text-white ${openSection === 'PregnancyAndInfantHistory' ? 'bg-slate-700 text-white' : 'text-slate-700'}`}
                onClick={() => setOpenSection(openSection === 'PregnancyAndInfantHistory' ? '' : 'PregnancyAndInfantHistory')}
            >
                <div className="flex items-center gap-3">
                    <h1 className="text-lg font-medium">Pregnancy And Infant History</h1>

                </div>
                <div className="text-xl transform transition-transform duration-200">
                    {openSection === 'parentArgeement' ? (
                       <h1>''</h1>
                    ) : (
                       <h2>""</h2>
                    )}
                </div>
            </div>

            {openSection === 'PregnancyAndInfantHistory' && (
                <div className="p-6 space-y-6 bg-gray-50" style={{ border: '2px solid #314158' }} onClick={(e) => e.stopPropagation()}>


                    {/* Home Address Section */}
                    <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">

                            <FormInput
                                label="Illness during pregnancy"
                                value={formData.IllnessDuringPregnancy}
                                onChange={(e) => handleInputChange('IllnessDuringPregnancy', e.target.value)}
                                name="IllnessDuringPregnancy"
                            />
                            <FormInput
                                label="Condition of Newborn"
                                value={formData.ConditionOfNewborn}
                                onChange={(e) => handleInputChange('ConditionOfNewborn', e.target.value)}
                                name="ConditionOfNewborn"
                            />


                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                            <FormInput
                                label="Duration of pregnancy"
                                value={formData.DurationOfPregnancy}
                                onChange={(e) => handleInputChange('DurationOfPregnancy', e.target.value)}
                                name="DurationOfPregnancy"
                            />
                            <FormInput
                                label="Birth Weight"
                                value={formData.BirthWeight}
                                onChange={(e) => handleInputChange('BirthWeight', e.target.value)}
                                name="Birth Weight"
                            />

                            <FormInput
                                label="Birth Weight"
                                value={formData.BirthWeight}
                                onChange={(e) => handleInputChange('BirthWeight', e.target.value)}
                                name="BirthWeight"
                            />
                            <FormInput
                                label="Complications"
                                value={formData.Complications}
                                onChange={(e) => handleInputChange('Complications', e.target.value)}
                                name="Complications"
                            />

                            <RadioGroup
                                label="Bottle Fed?"
                                name="BottleFed"
                                selectedValue={formData.BottleFed}
                                onChange={(e) => handleInputChange('BottleFed', e.target.value)}
                                options={[
                                    { label: 'Yes', value: 'yes' },
                                    { label: 'No', value: 'no' },
                                ]}
                            />

                            <RadioGroup
                                label="Breast Fed?"
                                name="BreastFed"
                                selectedValue={formData.BreastFed}
                                onChange={(e) => handleInputChange('BreastFed', e.target.value)}
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
                                value={formData.Name}
                                onChange={(e) => handleInputChange('Name', e.target.value)}
                                name="Name"
                            />
                            <FormInput
                                label="Age"
                                value={formData.Age}
                                onChange={(e) => handleInputChange('Age', e.target.value)}
                                name="Age"
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

export default PregnancyAndInfantHistory;
