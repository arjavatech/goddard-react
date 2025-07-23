import React from 'react';
import { FormInput } from './InputComponent';
import { DownIcon,UpIcon } from '../../../../components/common/Arrows';
const Child_details = ({ openSection, setOpenSection, formData, handleInputChange }) => {
    return (
        <>
            <div
                className={`px-6 py-4 flex items-center justify-between cursor-pointer transition-colors ${openSection === 'childDetails' ? 'text-white' : 'text-slate-700'
                    }`}
                style={
                    openSection === 'childDetails'
                        ? { backgroundColor: '#0F2D52', color: 'white' }
                        : { backgroundColor: '#DBEAFE' }
                }
                onClick={() =>
                    setOpenSection(openSection === 'childDetails' ? '' : 'childDetails')
                }
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#0F2D52';
                     e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                    if (openSection !== 'childDetails') {
                        e.currentTarget.style.backgroundColor = '#DBEAFE';
                        e.currentTarget.style.color = '#374151'; // Tailwind text-slate-700
                    }
                }}
            >
                <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-semibold">Child Details</h2>
                </div>
                <div className="text-xl transform transition-transform duration-200">
                    {openSection === 'childDetails' ? <DownIcon className="h-5 w-5 text-gray-500" /> : <UpIcon className="h-5 w-5 text-black" />}
                </div>
            </div>



            {openSection === 'childDetails' && (
                <div className="p-6 space-y-6" style={{ border: '1px solid #314158' }} onClick={(e) => e.stopPropagation()}>
                    <div className="grid md:grid-cols-2 gap-6">
                        <FormInput
                            label="FIRST NAME"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            name="firstName"
                        />
                        <FormInput
                            label="LAST NAME"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            name="lastName"
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <FormInput
                            label="NICKNAME"
                            value={formData.nickname}
                            onChange={(e) => handleInputChange('nickname', e.target.value)}
                            placeholder="e.g. John"
                            name="nickname"
                        />
                        <FormInput
                            label="BIRTH DATE"
                            type="date"
                            value={formData.birthDate}
                            onChange={(e) => handleInputChange('birthDate', e.target.value)}
                            name="birthDate"
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <FormInput
                            label="PRIMARY LANGUAGE"
                            value={formData.primaryLanguage}
                            onChange={(e) => handleInputChange('primaryLanguage', e.target.value)}
                            placeholder="e.g. English"
                            name="primaryLanguage"
                        />
                        <FormInput
                            label="SCHOOL-AGE CHILD'S SCHOOL"
                            value={formData.school}
                            onChange={(e) => handleInputChange('school', e.target.value)}
                            placeholder="e.g. Willowbrook School"
                            name="school"
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">DO RELEVANT CUSTODY PAPERS APPLY?</label>
                            <div className="flex space-x-6">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="custodyPapers"
                                        value="yes"
                                        checked={formData.custodyPapers === 'yes'}
                                        onChange={(e) => handleInputChange('custodyPapers', e.target.value)}
                                        className="mr-2 text-green-500 focus:ring-green-500"
                                    />
                                    Yes
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="custodyPapers"
                                        value="no"
                                        checked={formData.custodyPapers === 'no'}
                                        onChange={(e) => handleInputChange('custodyPapers', e.target.value)}
                                        className="mr-2 text-green-500 focus:ring-green-500"
                                    />
                                    No
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">GENDER</label>
                            <div className="flex space-x-6">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="male"
                                        checked={formData.gender === 'male'}
                                        onChange={(e) => handleInputChange('gender', e.target.value)}
                                        className="mr-2 text-green-500 focus:ring-green-500"
                                    />
                                    Male
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="female"
                                        checked={formData.gender === 'female'}
                                        onChange={(e) => handleInputChange('gender', e.target.value)}
                                        className="mr-2 text-green-500 focus:ring-green-500"
                                    />
                                    Female
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="others"
                                        checked={formData.gender === 'others'}
                                        onChange={(e) => handleInputChange('gender', e.target.value)}
                                        className="mr-2 text-green-500 focus:ring-green-500"
                                    />
                                    Others
                                </label>
                            </div>
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

export default Child_details;
