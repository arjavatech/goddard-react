import React from 'react';
import { FormInput } from './InputComponent';
import { UpIcon, DownIcon } from './Arrows';

const EnvironmentalFactors = ({ openSection, setOpenSection, formData, handleInputChange }) => {
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
                    <h2 className="text-lg font-semibold">Environmental Factors</h2>
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
                                value={formData.HowManyTimesHaveYouMovedInTheLastFiveYears}
                                onChange={(e) => handleInputChange('HowManyTimesHaveYouMovedInTheLastFiveYears', e.target.value)}
                                name="HowManyTimesHaveYouMovedInTheLastFiveYears"
                            />
                            <FormInput
                                label="Educational toys, games, books used at home?"
                                value={formData.EducationalToysGamesBooksUsedAtHome}
                                onChange={(e) => handleInputChange('EducationalToysGamesBooksUsedAtHome', e.target.value)}
                                name="EducationalToysGamesBooksUsedAtHome"
                            />

                            <FormInput
                                label="How many hours of television daily?"
                                value={formData.HowManyHoursOfTelevisionDaily}
                                onChange={(e) => handleInputChange('HowManyHoursOfTelevisionDaily', e.target.value)}
                                name="HowManyHoursOfTelevisionDaily"
                            />
                            <FormInput
                                label="Language used in the home?"
                                value={formData.LanguageUsedInTheHome}
                                onChange={(e) => handleInputChange('LanguageUsedInTheHome', e.target.value)}
                                name="LanguageUsedInTheHome"
                            />

                            <FormInput
                                label="Have there been any changes in the home situation recently, i.e. addition/loss/death/divorce."
                                value={formData.HaveThereBeenAnyChangesInTheHomeSituationRecently}
                                onChange={(e) => handleInputChange('HaveThereBeenAnyChangesInTheHomeSituationRecently', e.target.value)}
                                name="HaveThereBeenAnyChangesInTheHomeSituationRecently"
                            />

                            <FormInput
                                label="What are your educational expectations of your child?"
                                value={formData.WhatAreYourEducationalExpectationsOfYourChild}
                                onChange={(e) => handleInputChange('WhatAreYourEducationalExpectationsOfYourChild', e.target.value)}
                                name="WhatAreYourEducationalExpectationsOfYourChild"
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

export default EnvironmentalFactors;
