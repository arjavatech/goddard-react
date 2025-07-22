import React from 'react';
import { FormInput } from './InputComponent';

const Parent_details = ({ openSection, setOpenSection, formData, handleInputChange }) => {
    return (
        <>
            <div
                className={`px-6 py-4 flex items-center justify-between cursor-pointer transition-colors ${openSection === 'parentDetails' ? 'text-white' : 'text-slate-700'
                    }`}
                style={
                    openSection === 'parentDetails'
                        ? { backgroundColor: '#0F2D52', color: 'white' }
                        : { backgroundColor: '#DBEAFE' }
                }
                onClick={() =>
                    setOpenSection(openSection === 'parentDetails' ? '' : 'parentDetails')
                }
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#0F2D52';
                     e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                    if (openSection !== 'parentDetails') {
                        e.currentTarget.style.backgroundColor = '#DBEAFE';
                        e.currentTarget.style.color = '#374151'; // Tailwind text-slate-700
                    }
                }}
            >
                <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-semibold">Parent Details</h2>
                </div>
                <div className="text-xl transform transition-transform duration-200">
                    {openSection === 'parentDetails' ? '⌄' : '⌃'}
                </div>
            </div>


            {openSection === 'parentDetails' && (
                <div className="p-6 space-y-6 bg-gray-50" style={{ border: '1px solid #314158' }} onClick={(e) => e.stopPropagation()}>
                    {/* Parent/Legal Guardian Name */}
                    <div>
                        <FormInput
                            label="PARENT'S / LEGAL GUARDIAN'S NAME"
                            value={formData.parentName}
                            onChange={(e) => handleInputChange('parentName', e.target.value)}
                            name="parentName"
                        />
                    </div>

                    {/* Home Address Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-center text-gray-800">HOME ADDRESS</h3>
                        <div className="grid md:grid-cols-4 gap-4">
                            <FormInput label="STREET" value={formData.street} onChange={(e) => handleInputChange('street', e.target.value)} name="street" />
                            <FormInput label="CITY" value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} name="city" />
                            <FormInput label="STATE" value={formData.state} onChange={(e) => handleInputChange('state', e.target.value)} name="state" />
                            <FormInput label="ZIP" value={formData.zip} onChange={(e) => handleInputChange('zip', e.target.value)} name="zip" />
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="grid md:grid-cols-3 gap-6">
                        <FormInput label="TELEPHONE NUMBER" type="tel" value={formData.telephoneNumber} onChange={(e) => handleInputChange('telephoneNumber', e.target.value)} placeholder="+1(555) 555-1234" name="telephoneNumber" />
                        <FormInput label="CELL NUMBER" type="tel" value={formData.cellNumber} onChange={(e) => handleInputChange('cellNumber', e.target.value)} placeholder="+1(555) 555-1234" name="cellNumber" />
                        <FormInput label="EMAIL ADDRESS" type="email" value={formData.emailAddress} onChange={(e) => handleInputChange('emailAddress', e.target.value)} name="emailAddress" />
                    </div>

                    {/* Business Details Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-center text-gray-800">BUSINESS DETAILS</h3>
                        <div className="grid md:grid-cols-4 gap-4">
                            <FormInput label="NAME" value={formData.businessName} onChange={(e) => handleInputChange('businessName', e.target.value)} name="businessName" />
                            <FormInput label="WORK HOURS FROM" type="time" value={formData.workHoursFrom} onChange={(e) => handleInputChange('workHoursFrom', e.target.value)} name="workHoursFrom" />
                            <FormInput label="WORK HOURS TO" type="time" value={formData.workHoursTo} onChange={(e) => handleInputChange('workHoursTo', e.target.value)} name="workHoursTo" />
                            <FormInput label="TELEPHONE NUMBER" type="tel" value={formData.businessTelephoneNumber} onChange={(e) => handleInputChange('businessTelephoneNumber', e.target.value)} placeholder="+1(555) 555-1234" name="businessTelephoneNumber" />
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

export default Parent_details;
