import React from 'react';
import {FormInput} from './InputComponent';

const AdditionalParentDetails = ({ openSection, setOpenSection, formData, handleInputChange }) => {
    return (
        <>
            <div
                className={`bg-blue-50 px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-700 hover:text-white ${openSection === 'additionalParentDetails' ? 'bg-slate-700 text-white' : 'text-slate-700'}`}
                onClick={() => setOpenSection(openSection === 'additionalParentDetails' ? '' : 'additionalParentDetails')}
            >
                <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-semibold">Additional Parent Details</h2>
                </div>
                <div className="text-xl transform transition-transform duration-200">
                    {openSection === 'additionalParentDetails' ? '⌄' : '⌃'}
                </div>
            </div>

            {openSection === 'additionalParentDetails' && (
                <div className="p-6 space-y-6 bg-gray-50" onClick={(e) => e.stopPropagation()}>
                    {/* Additional Parent/Legal Guardian Name */}
                    <div>
                        <FormInput
                            label="PARENT'S / LEGAL GUARDIAN'S NAME"
                            value={formData.additionalParentName}
                            onChange={(e) => handleInputChange('additionalParentName', e.target.value)}
                            name="additionalParentName"
                        />
                    </div>

                    {/* Home Address Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-center text-gray-800">HOME ADDRESS</h3>

                        <div className="grid md:grid-cols-4 gap-4">
                            <FormInput
                                label="STREET"
                                value={formData.additionalStreet}
                                onChange={(e) => handleInputChange('additionalStreet', e.target.value)}
                                name="additionalStreet"
                            />
                            <FormInput
                                label="CITY"
                                value={formData.additionalCity}
                                onChange={(e) => handleInputChange('additionalCity', e.target.value)}
                                name="additionalCity"
                            />
                            <FormInput
                                label="STATE"
                                value={formData.additionalState}
                                onChange={(e) => handleInputChange('additionalState', e.target.value)}
                                name="additionalState"
                            />
                            <FormInput
                                label="ZIP"
                                value={formData.additionalZip}
                                onChange={(e) => handleInputChange('additionalZip', e.target.value)}
                                name="additionalZip"
                            />
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="grid md:grid-cols-3 gap-6">
                        <FormInput
                            label="TELEPHONE NUMBER"
                            type="tel"
                            value={formData.additionalTelephoneNumber}
                            onChange={(e) => handleInputChange('additionalTelephoneNumber', e.target.value)}
                            placeholder="+1(555) 555-1234"
                            name="additionalTelephoneNumber"
                        />
                        <FormInput
                            label="CELL NUMBER"
                            type="tel"
                            value={formData.additionalCellNumber}
                            onChange={(e) => handleInputChange('additionalCellNumber', e.target.value)}
                            placeholder="+1(555) 555-1234"
                            name="additionalCellNumber"
                        />
                        <FormInput
                            label="EMAIL ADDRESS"
                            type="email"
                            value={formData.additionalEmailAddress}
                            onChange={(e) => handleInputChange('additionalEmailAddress', e.target.value)}
                            name="additionalEmailAddress"
                        />
                    </div>

                    {/* Business Details Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-center text-gray-800">BUSINESS DETAILS</h3>

                        <div className="grid md:grid-cols-4 gap-4">
                            <FormInput
                                label="NAME"
                                value={formData.additionalBusinessName}
                                onChange={(e) => handleInputChange('additionalBusinessName', e.target.value)}
                                name="additionalBusinessName"
                            />
                            <FormInput
                                label="WORK HOURS FROM"
                                type="time"
                                value={formData.additionalWorkHoursFrom}
                                onChange={(e) => handleInputChange('additionalWorkHoursFrom', e.target.value)}
                                name="additionalWorkHoursFrom"
                            />
                            <FormInput
                                label="WORK HOURS TO"
                                type="time"
                                value={formData.additionalWorkHoursTo}
                                onChange={(e) => handleInputChange('additionalWorkHoursTo', e.target.value)}
                                name="additionalWorkHoursTo"
                            />
                            <FormInput
                                label="TELEPHONE NUMBER"
                                type="tel"
                                value={formData.additionalBusinessTelephoneNumber}
                                onChange={(e) => handleInputChange('additionalBusinessTelephoneNumber', e.target.value)}
                                placeholder="+1(555) 555-1234"
                                name="additionalBusinessTelephoneNumber"
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

export default AdditionalParentDetails;
