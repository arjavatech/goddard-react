import React from 'react';
import {FormInput} from './InputComponent';

const MedicalCareProvider = ({ openSection, setOpenSection, formData, handleInputChange }) => {
    return (
        <>
            <div
                className={`bg-blue-50 px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-700 hover:text-white ${openSection === 'medicalCareProvider' ? 'bg-slate-700 text-white' : 'text-slate-700'}`}
                onClick={() => setOpenSection(openSection === 'medicalCareProvider' ? '' : 'medicalCareProvider')}
            >
                <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-semibold">Medical Care Provider Details</h2>
                </div>
                <div className="text-xl transform transition-transform duration-200">
                    {openSection === 'medicalCareProvider' ? '⌄' : '⌃'}
                </div>
            </div>

            {openSection === 'medicalCareProvider' && (
                <div className="p-6 space-y-6 bg-gray-50" style={{ border: '2px solid #314158' }} onClick={(e) => e.stopPropagation()}>
                    {/* Physician/Medical Care Provider Details Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-center text-gray-800">PHYSICIAN /MEDICAL CARE PROVIDER DETAILS</h3>

                        <div>
                            <FormInput
                                label="NAME OF CHILD'S PHYSICIAN /MEDICAL CARE PROVIDER"
                                value={formData.physicianName || ''}
                                onChange={(e) => handleInputChange('physicianName', e.target.value)}
                                name="physicianName"
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <FormInput
                                label="TELEPHONE NUMBER"
                                type="tel"
                                value={formData.physicianPhone || ''}
                                onChange={(e) => handleInputChange('physicianPhone', e.target.value)}
                                placeholder="+1(555) 555-1234"
                                name="physicianPhone"
                            />
                            <FormInput
                                label="HOSPITAL AFFILIATION"
                                value={formData.hospitalAffiliation || ''}
                                onChange={(e) => handleInputChange('hospitalAffiliation', e.target.value)}
                                name="hospitalAffiliation"
                            />
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-md font-semibold text-center text-gray-800">ADDRESS</h4>
                            <div className="grid md:grid-cols-4 gap-4">
                                <FormInput
                                    label="STREET"
                                    value={formData.physicianStreet || ''}
                                    onChange={(e) => handleInputChange('physicianStreet', e.target.value)}
                                    name="physicianStreet"
                                />
                                <FormInput
                                    label="CITY"
                                    value={formData.physicianCity || ''}
                                    onChange={(e) => handleInputChange('physicianCity', e.target.value)}
                                    name="physicianCity"
                                />
                                <FormInput
                                    label="STATE"
                                    value={formData.physicianState || ''}
                                    onChange={(e) => handleInputChange('physicianState', e.target.value)}
                                    name="physicianState"
                                />
                                <FormInput
                                    label="ZIP"
                                    value={formData.physicianZip || ''}
                                    onChange={(e) => handleInputChange('physicianZip', e.target.value)}
                                    name="physicianZip"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Dentist Details Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-center text-gray-800">DENTIST DETAILS</h3>

                        <div className="grid md:grid-cols-3 gap-4">
                            <FormInput
                                label="NAME OF CHILD'S DENTIST"
                                value={formData.dentistName || ''}
                                onChange={(e) => handleInputChange('dentistName', e.target.value)}
                                name="dentistName"
                            />
                            <FormInput
                                label="DENTIST TELEPHONE NUMBER"
                                type="tel"
                                value={formData.dentistPhone || ''}
                                onChange={(e) => handleInputChange('dentistPhone', e.target.value)}
                                placeholder="+1(555) 555-1234"
                                name="dentistPhone"
                            />
                            <FormInput
                                label="STREET"
                                value={formData.dentistStreet || ''}
                                onChange={(e) => handleInputChange('dentistStreet', e.target.value)}
                                name="dentistStreet"
                            />
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                            <FormInput
                                label="CITY"
                                value={formData.dentistCity || ''}
                                onChange={(e) => handleInputChange('dentistCity', e.target.value)}
                                name="dentistCity"
                            />
                            <FormInput
                                label="STATE"
                                value={formData.dentistState || ''}
                                onChange={(e) => handleInputChange('dentistState', e.target.value)}
                                name="dentistState"
                            />
                            <FormInput
                                label="ZIP"
                                value={formData.dentistZip || ''}
                                onChange={(e) => handleInputChange('dentistZip', e.target.value)}
                                name="dentistZip"
                            />
                        </div>
                    </div>

                    {/* Medical Information Section */}
                    <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormInput
                                label="SPECIAL DISABILITIES (IF ANY)"
                                value={formData.specialDisabilities || ''}
                                onChange={(e) => handleInputChange('specialDisabilities', e.target.value)}
                                name="specialDisabilities"
                            />
                            <FormInput
                                label="ALLERGIES (MEDICATION REACTION)"
                                value={formData.allergies || ''}
                                onChange={(e) => handleInputChange('allergies', e.target.value)}
                                name="allergies"
                            />
                        </div>

                        <div>
                            <FormInput
                                label="ADDITIONAL INFORMATION REGARDING SPECIAL NEEDS"
                                value={formData.additionalSpecialNeeds || ''}
                                onChange={(e) => handleInputChange('additionalSpecialNeeds', e.target.value)}
                                name="additionalSpecialNeeds"
                            />
                        </div>

                        <div>
                            <FormInput
                                label="MEDICATION, SPECIAL CONDITIONS NUMBER"
                                value={formData.medicationConditions || ''}
                                onChange={(e) => handleInputChange('medicationConditions', e.target.value)}
                                name="medicationConditions"
                            />
                        </div>

                        <div>
                            <FormInput
                                label="HEALTH INSURANCE COVERAGE FOR CHILD OR MEDICAL ASSISTANCE BENEFITS"
                                value={formData.healthInsurance || ''}
                                onChange={(e) => handleInputChange('healthInsurance', e.target.value)}
                                name="healthInsurance"
                            />
                        </div>

                        <div>
                            <FormInput
                                label="POLICY NUMBER"
                                value={formData.policyNumber || ''}
                                onChange={(e) => handleInputChange('policyNumber', e.target.value)}
                                name="policyNumber"
                            />
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

export default MedicalCareProvider;