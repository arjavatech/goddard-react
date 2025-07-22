import React from 'react';
import {FormInput} from './InputComponent';

const EmergencyContact = ({ openSection, setOpenSection, formData, handleInputChange }) => {
    return (
        <>
            <div
                className={`bg-blue-50 px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-700 hover:text-white ${openSection === 'emergencyContact' ? 'bg-slate-700 text-white' : 'text-slate-700'}`}
                onClick={() => setOpenSection(openSection === 'emergencyContact' ? '' : 'emergencyContact')}
            >
                <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-semibold">Emergency Contact</h2>
                </div>
                <div className="text-xl transform transition-transform duration-200">
                    {openSection === 'emergencyContact' ? '⌄' : '⌃'}
                </div>
            </div>

            {openSection === 'emergencyContact' && (
                <div className="p-6 space-y-6 bg-gray-50" style={{ border: '2px solid #314158' }} onClick={(e) => e.stopPropagation()}>
                    {/* Emergency Contact 1 */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-center text-gray-800">Emergency Contact 1:</h3>

                        <div className="grid md:grid-cols-3 gap-4">
                            <FormInput
                                label="NAME"
                                value={formData.emergencyContact1Name || ''}
                                onChange={(e) => handleInputChange('emergencyContact1Name', e.target.value)}
                                name="emergencyContact1Name"
                            />
                            <FormInput
                                label="RELATIONSHIP"
                                value={formData.emergencyContact1Relationship || ''}
                                onChange={(e) => handleInputChange('emergencyContact1Relationship', e.target.value)}
                                name="emergencyContact1Relationship"
                            />
                            <FormInput
                                label="TELEPHONE NUMBER"
                                type="tel"
                                value={formData.emergencyContact1Phone || ''}
                                onChange={(e) => handleInputChange('emergencyContact1Phone', e.target.value)}
                                placeholder="e.g.+1(555) 555-1234"
                                name="emergencyContact1Phone"
                            />
                        </div>

                        <div className="grid md:grid-cols-4 gap-4">
                            <FormInput
                                label="STREET"
                                value={formData.emergencyContact1Street || ''}
                                onChange={(e) => handleInputChange('emergencyContact1Street', e.target.value)}
                                name="emergencyContact1Street"
                            />
                            <FormInput
                                label="CITY"
                                value={formData.emergencyContact1City || ''}
                                onChange={(e) => handleInputChange('emergencyContact1City', e.target.value)}
                                name="emergencyContact1City"
                            />
                            <FormInput
                                label="STATE"
                                value={formData.emergencyContact1State || ''}
                                onChange={(e) => handleInputChange('emergencyContact1State', e.target.value)}
                                name="emergencyContact1State"
                            />
                            <FormInput
                                label="ZIP"
                                value={formData.emergencyContact1Zip || ''}
                                onChange={(e) => handleInputChange('emergencyContact1Zip', e.target.value)}
                                name="emergencyContact1Zip"
                            />
                        </div>
                    </div>

                    {/* Emergency Contact 2 */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-center text-gray-800">Emergency Contact 2:</h3>

                        <div className="grid md:grid-cols-3 gap-4">
                            <FormInput
                                label="NAME"
                                value={formData.emergencyContact2Name || ''}
                                onChange={(e) => handleInputChange('emergencyContact2Name', e.target.value)}
                                name="emergencyContact2Name"
                            />
                            <FormInput
                                label="RELATIONSHIP"
                                value={formData.emergencyContact2Relationship || ''}
                                onChange={(e) => handleInputChange('emergencyContact2Relationship', e.target.value)}
                                name="emergencyContact2Relationship"
                            />
                            <FormInput
                                label="TELEPHONE NUMBER"
                                type="tel"
                                value={formData.emergencyContact2Phone || ''}
                                onChange={(e) => handleInputChange('emergencyContact2Phone', e.target.value)}
                                placeholder="+1(555) 555-1234"
                                name="emergencyContact2Phone"
                            />
                        </div>

                        <div className="grid md:grid-cols-4 gap-4">
                            <FormInput
                                label="STREET"
                                value={formData.emergencyContact2Street || ''}
                                onChange={(e) => handleInputChange('emergencyContact2Street', e.target.value)}
                                name="emergencyContact2Street"
                            />
                            <FormInput
                                label="CITY"
                                value={formData.emergencyContact2City || ''}
                                onChange={(e) => handleInputChange('emergencyContact2City', e.target.value)}
                                name="emergencyContact2City"
                            />
                            <FormInput
                                label="STATE"
                                value={formData.emergencyContact2State || ''}
                                onChange={(e) => handleInputChange('emergencyContact2State', e.target.value)}
                                name="emergencyContact2State"
                            />
                            <FormInput
                                label="ZIP"
                                value={formData.emergencyContact2Zip || ''}
                                onChange={(e) => handleInputChange('emergencyContact2Zip', e.target.value)}
                                name="emergencyContact2Zip"
                            />
                        </div>
                    </div>

                    {/* Emergency Contact 3 */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-center text-gray-800">Emergency Contact 3:</h3>

                        <div className="grid md:grid-cols-3 gap-4">
                            <FormInput
                                label="NAME"
                                value={formData.emergencyContact3Name || ''}
                                onChange={(e) => handleInputChange('emergencyContact3Name', e.target.value)}
                                name="emergencyContact3Name"
                            />
                            <FormInput
                                label="RELATIONSHIP"
                                value={formData.emergencyContact3Relationship || ''}
                                onChange={(e) => handleInputChange('emergencyContact3Relationship', e.target.value)}
                                name="emergencyContact3Relationship"
                            />
                            <FormInput
                                label="TELEPHONE NUMBER"
                                type="tel"
                                value={formData.emergencyContact3Phone || ''}
                                onChange={(e) => handleInputChange('emergencyContact3Phone', e.target.value)}
                                placeholder="+1(555) 555-1234"
                                name="emergencyContact3Phone"
                            />
                        </div>

                        <div className="grid md:grid-cols-4 gap-4">
                            <FormInput
                                label="STREET"
                                value={formData.emergencyContact3Street || ''}
                                onChange={(e) => handleInputChange('emergencyContact3Street', e.target.value)}
                                name="emergencyContact3Street"
                            />
                            <FormInput
                                label="CITY"
                                value={formData.emergencyContact3City || ''}
                                onChange={(e) => handleInputChange('emergencyContact3City', e.target.value)}
                                name="emergencyContact3City"
                            />
                            <FormInput
                                label="STATE"
                                value={formData.emergencyContact3State || ''}
                                onChange={(e) => handleInputChange('emergencyContact3State', e.target.value)}
                                name="emergencyContact3State"
                            />
                            <FormInput
                                label="ZIP"
                                value={formData.emergencyContact3Zip || ''}
                                onChange={(e) => handleInputChange('emergencyContact3Zip', e.target.value)}
                                name="emergencyContact3Zip"
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

export default EmergencyContact;