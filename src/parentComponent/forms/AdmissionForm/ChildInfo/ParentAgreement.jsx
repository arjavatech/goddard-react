import React from 'react';
import { FormInput } from './InputComponent';




const ParentAgreement = ({ openSection, setOpenSection, formData, handleInputChange }) => {
    const getInputBorderClass = (value) => {
        if (value && value.trim() !== '') {
            return 'border-green-500 focus:ring-green-500';
        } else {
            return 'border-red-500 focus:ring-red-500';
        }
    };

    return (
        <>
            <div
                className={`px-6 py-4 flex items-center justify-between cursor-pointer transition-colors ${openSection === 'parentAgreement' ? 'text-white' : 'text-slate-700'
                    }`}
                style={
                    openSection === 'parentAgreement'
                        ? { backgroundColor: '#0F2D52', color: 'white' }
                        : { backgroundColor: '#DBEAFE' }
                }
                onClick={() =>
                    setOpenSection(openSection === 'parentAgreement' ? '' : 'parentAgreement')
                }
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#0F2D52';
                     e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                    if (openSection !== 'parentAgreement') {
                        e.currentTarget.style.backgroundColor = '#DBEAFE';
                        e.currentTarget.style.color = '#374151'; // Tailwind's text-slate-700
                    }
                }}
            >
                <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-semibold">Parent Agreement</h2>
                </div>
                <div className="text-xl transform transition-transform duration-200">
                    {openSection === 'parentAgreement' ? '⌄' : '⌃'}
                </div>
            </div>


            {openSection === 'parentAgreement' && (
                <div className="p-6 space-y-6 bg-gray-50" style={{ border: '1px solid #314158' }} onClick={(e) => e.stopPropagation()}>
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-center text-gray-800">PARENT'S / LEGAL GUARDIAN'S AGREEMENT</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    OBTAINING EMERGENCY MEDICAL CARE
                                </label>
                                <textarea
                                    className="w-full p-3 border border-gray-300 rounded-md  focus:ring-blue-500 focus:border-blue-500 min-h-[60px]"
                                    value={formData.emergencyMedicalCare}
                                    onChange={(e) => handleInputChange('emergencyMedicalCare', e.target.value)}
                                    name="emergencyMedicalCare"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ADMINISTRATION OF MINOR FIRST-AID PROCEDURES
                                </label>
                                <textarea
                                    className="w-full p-3 border border-gray-300 rounded-md  focus:ring-blue-500 focus:border-blue-500 min-h-[60px]"
                                    value={formData.firstAidProcedures}
                                    onChange={(e) => handleInputChange('firstAidProcedures', e.target.value)}
                                    name="firstAidProcedures"
                                />
                            </div>
                        </div>

                        <div className="bg-gray-100 p-4 rounded-md">
                            <p className="text-sm text-gray-700 leading-relaxed">
                                "In EMERGENCIES requiring immediate medical attention, your child will be taken to the NEAREST HOSPITAL EMERGENCY ROOM. Your signature authorizes the responsible person at the child care facility to have your child transported to that hospital."
                            </p>
                        </div>

                        <div className="flex items-start space-x-3">
                            <input
                                type="checkbox"
                                id="agreementCheck"
                                checked={formData.agreementConfirmed}
                                onChange={(e) => {
                                    const value = e.target.checked ? 'on' : 'off';
                                    handleInputChange('agreementConfirmed', e.target.checked);
                                }}
                                className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                            <label htmlFor="agreementCheck" className="text-sm text-gray-700">
                                I agree all the above information is correct.
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-center pt-4">
                        <button className="bg-slate-700 text-white px-8 py-3 rounded-md hover:bg-slate-800 transition-colors">
                            Save
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ParentAgreement;