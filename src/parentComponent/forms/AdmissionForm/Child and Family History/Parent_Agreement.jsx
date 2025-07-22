import React from 'react';
import { CheckboxGroup } from './InputComponent';




const Parent_Agreement = ({ openSection, setOpenSection, formData, handleInputChange }) => {
    return (
        <>
            <div
                className={`bg-blue-50 px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-700 hover:text-white ${openSection === 'ParentAgreement' ? 'bg-slate-700 text-white' : 'text-slate-700'}`}
                onClick={() => setOpenSection(openSection === 'ParentAgreement' ? '' : 'ParentAgreement')}
            >
                <div className="flex items-center space-x-3"><h2 className="text-lg font-semibold">Additional Parent Details Child Details</h2>
                </div>
                <div className="text-xl transform transition-transform duration-200">
                    {openSection === 'parentArgeement' ? (
                       <h1>''</h1>
                    ) : (
                        <h1>''</h1>
                    )}
                </div>
            </div>


            {openSection === 'ParentAgreement' && (
                <div className="p-6 space-y-6"style={{ border: '2px solid #314158' }} onClick={(e) => e.stopPropagation()}>
                    <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">

                            <CheckboxGroup
                                label=""
                                name="hobbies"
                                options={[
                                    { label: 'I agree all the above information is correct.', value: 'I agree all the above information is correct.' },

                                ]}
                                selectedValues={formData.hobbies}
                                onChange={(updatedValues) => handleInputChange('hobbies', updatedValues)}
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

export default Parent_Agreement;
