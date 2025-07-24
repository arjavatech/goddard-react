import React, { useState, useEffect } from 'react';

import { FormInput } from './InputComponent';
import { DownIcon,UpIcon } from '../../../../components/common/Arrows';
const EmergencyContact = ({ openSection, setOpenSection, initialFormData, handleInputChange, childId }) => {
    const [formData, setFormData] = useState({
              });
        
        
            const handleChange = (e) => {
            const { name, value } = e.target;
        
        
            
            // Update local state only - no API call
            setFormData(prevState => ({
              ...prevState,
              [name]: value
            }));
          };
        
            useEffect(() => {
              setFormData(prevState => ({
                
                ...prevState
              }));
            }, []);
          
            useEffect(() => {
              if (initialFormData && initialFormData.emergency_contact_info) {
                const emergencyContacts = initialFormData.emergency_contact_info;
                setFormData(prevState => ({
                  child_id: childId,
                  emergencyContact1Name: emergencyContacts[0]?.child_emergency_contact_name || '',
                  emergencyContact1Relationship: emergencyContacts[0]?.child_emergency_contact_relationship || '',
                  emergencyContact1Phone: emergencyContacts[0]?.child_emergency_contact_telephone_number || '',
                  emergencyContact1Street: emergencyContacts[0]?.child_emergency_contact_full_address || '',
                  emergencyContact1City: emergencyContacts[0]?.child_emergency_contact_city_address || '',
                  emergencyContact1State: emergencyContacts[0]?.child_emergency_contact_state_address || '',
                  emergencyContact1Zip: emergencyContacts[0]?.child_emergency_contact_zip_address || '',
                  emergencyContact2Name: emergencyContacts[1]?.child_emergency_contact_name || '',
                  emergencyContact2Relationship: emergencyContacts[1]?.child_emergency_contact_relationship || '',
                  emergencyContact2Phone: emergencyContacts[1]?.child_emergency_contact_telephone_number || '',
                  emergencyContact2Street: emergencyContacts[1]?.child_emergency_contact_full_address || '',
                  emergencyContact2City: emergencyContacts[1]?.child_emergency_contact_city_address || '',
                  emergencyContact2State: emergencyContacts[1]?.child_emergency_contact_state_address || '',
                  emergencyContact2Zip: emergencyContacts[1]?.child_emergency_contact_zip_address || '',
                  emergencyContact3Name: emergencyContacts[2]?.child_emergency_contact_name || '',
                  emergencyContact3Relationship: emergencyContacts[2]?.child_emergency_contact_relationship || '',
                  emergencyContact3Phone: emergencyContacts[2]?.child_emergency_contact_telephone_number || '',
                  emergencyContact3Street: emergencyContacts[2]?.child_emergency_contact_full_address || '',
                  emergencyContact3City: emergencyContacts[2]?.child_emergency_contact_city_address || '',
                  emergencyContact3State: emergencyContacts[2]?.child_emergency_contact_state_address || '',
                  emergencyContact3Zip: emergencyContacts[2]?.child_emergency_contact_zip_address || '',
                }));
              } else {
                setFormData(prevState => ({
                  child_id: childId,
                }));
              }
            }, [initialFormData, childId]);
        
            
        
              // API function to update admission form data
              const updateAdmissionData = async (fieldData) => {
                  if (!childId) {
                      console.error('Child ID is required for API update');
                      return;
                  }
          
                  try {
                      const response = await fetch(`https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/admission_segment/${childId}`, {
                          method: 'PUT',
                          headers: {
                              'Content-Type': 'application/json',
                          },
                          body: JSON.stringify(fieldData)
                      });
          
                      if (!response.ok) {
                          throw new Error(`Failed to update admission data: ${response.status}`);
                      }
          
                      const result = await response.json();
                      console.log('Admission data updated successfully:', result);
                      return result;
                  } catch (error) {
                      console.error('Error updating admission data:', error);
                      throw error;
                  }
              };
        
        const handleSave = async () => {
                if (!childId) {
                    alert('Error: Child ID is missing');
                    return;
                }
        
                try {
                    const emergency_contact_info = [
                        {
                            child_emergency_contact_name: formData.emergencyContact1Name || '',
                            child_emergency_contact_relationship: formData.emergencyContact1Relationship || '',
                            child_emergency_contact_telephone_number: formData.emergencyContact1Phone || '',
                            child_emergency_contact_full_address: formData.emergencyContact1Street || '',
                            child_emergency_contact_city_address: formData.emergencyContact1City || '',
                            child_emergency_contact_state_address: formData.emergencyContact1State || '',
                            child_emergency_contact_zip_address: formData.emergencyContact1Zip || ''
                        },
                        {
                            child_emergency_contact_name: formData.emergencyContact2Name || '',
                            child_emergency_contact_relationship: formData.emergencyContact2Relationship || '',
                            child_emergency_contact_telephone_number: formData.emergencyContact2Phone || '',
                            child_emergency_contact_full_address: formData.emergencyContact2Street || '',
                            child_emergency_contact_city_address: formData.emergencyContact2City || '',
                            child_emergency_contact_state_address: formData.emergencyContact2State || '',
                            child_emergency_contact_zip_address: formData.emergencyContact2Zip || ''
                        },
                        {
                            child_emergency_contact_name: formData.emergencyContact3Name || '',
                            child_emergency_contact_relationship: formData.emergencyContact3Relationship || '',
                            child_emergency_contact_telephone_number: formData.emergencyContact3Phone || '',
                            child_emergency_contact_full_address: formData.emergencyContact3Street || '',
                            child_emergency_contact_city_address: formData.emergencyContact3City || '',
                            child_emergency_contact_state_address: formData.emergencyContact3State || '',
                            child_emergency_contact_zip_address: formData.emergencyContact3Zip || ''
                        }
                    ];
                    const saveData = {
                        child_id: childId,
                        emergency_contact_info: emergency_contact_info
                    };
                    console.log(saveData); // Log the data being sent to the API for debugging purposes
                    await updateAdmissionData(saveData);
                    alert('Child details data saved successfully!');
                } catch (error) {
                    console.error('Failed to save Child details:', error);
                    alert('Error saving Child details data. Please try again.');
                }
            };
    return (
        <>
            <div
                className={`px-6 py-4 flex items-center justify-between cursor-pointer transition-colors ${openSection === 'emergencyContact' ? 'text-white' : 'text-slate-700'
                    }`}
                style={
                    openSection === 'emergencyContact'
                        ? { backgroundColor: '#0F2D52', color: 'white' }
                        : { backgroundColor: '#DBEAFE' }
                }
                onClick={() =>
                    setOpenSection(openSection === 'emergencyContact' ? '' : 'emergencyContact')
                }
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#0F2D52';
                     e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                    if (openSection !== 'emergencyContact') {
                        e.currentTarget.style.backgroundColor = '#DBEAFE';
                        e.currentTarget.style.color = '#374151'; // Tailwind's text-slate-700
                    }
                }}
            >
                <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-semibold">Emergency Contact</h2>
                </div>
                <div className="text-xl transform transition-transform duration-200">
                    {openSection === 'emergencyContact' ? <DownIcon className="h-5 w-5 text-gray-500" /> : <UpIcon className="h-5 w-5 text-black" />}
                </div>
            </div>


            {openSection === 'emergencyContact' && (
                <div className="p-6 space-y-6 bg-gray-50" style={{ border: '1px solid #314158' }} onClick={(e) => e.stopPropagation()}>
                    {/* Emergency Contact 1 */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-center text-gray-800">Emergency Contact 1:</h3>

                        <div className="grid md:grid-cols-3 gap-4">
                            <FormInput
                                label="NAME"
                                value={initialFormData.emergencyContact1Name || ''}
                                onChange={(e) => handleInputChange('emergencyContact1Name', e.target.value)}
                                name="emergencyContact1Name"
                            />
                            <FormInput
                                label="RELATIONSHIP"
                                value={initialFormData.emergencyContact1Relationship || ''}
                                onChange={(e) => handleInputChange('emergencyContact1Relationship', e.target.value)}
                                name="emergencyContact1Relationship"
                            />
                            <FormInput
                                label="TELEPHONE NUMBER"
                                type="tel"
                                value={initialFormData.emergencyContact1Phone || ''}
                                onChange={(e) => handleInputChange('emergencyContact1Phone', e.target.value)}
                                placeholder="e.g.+1(555) 555-1234"
                                name="emergencyContact1Phone"
                            />
                        </div>

                        <div className="grid md:grid-cols-4 gap-4">
                            <FormInput
                                label="STREET"
                                value={initialFormData.emergencyContact1Street || ''}
                                onChange={(e) => handleInputChange('emergencyContact1Street', e.target.value)}
                                name="emergencyContact1Street"
                            />
                            <FormInput
                                label="CITY"
                                value={initialFormData.emergencyContact1City || ''}
                                onChange={(e) => handleInputChange('emergencyContact1City', e.target.value)}
                                name="emergencyContact1City"
                            />
                            <FormInput
                                label="STATE"
                                value={initialFormData.emergencyContact1State || ''}
                                onChange={(e) => handleInputChange('emergencyContact1State', e.target.value)}
                                name="emergencyContact1State"
                            />
                            <FormInput
                                label="ZIP"
                                value={initialFormData.emergencyContact1Zip || ''}
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
                                value={initialFormData.emergencyContact2Name || ''}
                                onChange={(e) => handleInputChange('emergencyContact2Name', e.target.value)}
                                name="emergencyContact2Name"
                            />
                            <FormInput
                                label="RELATIONSHIP"
                                value={initialFormData.emergencyContact2Relationship || ''}
                                onChange={(e) => handleInputChange('emergencyContact2Relationship', e.target.value)}
                                name="emergencyContact2Relationship"
                            />
                            <FormInput
                                label="TELEPHONE NUMBER"
                                type="tel"
                                value={initialFormData.emergencyContact2Phone || ''}
                                onChange={(e) => handleInputChange('emergencyContact2Phone', e.target.value)}
                                placeholder="+1(555) 555-1234"
                                name="emergencyContact2Phone"
                            />
                        </div>

                        <div className="grid md:grid-cols-4 gap-4">
                            <FormInput
                                label="STREET"
                                value={initialFormData.emergencyContact2Street || ''}
                                onChange={(e) => handleInputChange('emergencyContact2Street', e.target.value)}
                                name="emergencyContact2Street"
                            />
                            <FormInput
                                label="CITY"
                                value={initialFormData.emergencyContact2City || ''}
                                onChange={(e) => handleInputChange('emergencyContact2City', e.target.value)}
                                name="emergencyContact2City"
                            />
                            <FormInput
                                label="STATE"
                                value={initialFormData.emergencyContact2State || ''}
                                onChange={(e) => handleInputChange('emergencyContact2State', e.target.value)}
                                name="emergencyContact2State"
                            />
                            <FormInput
                                label="ZIP"
                                value={initialFormData.emergencyContact2Zip || ''}
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
                                value={initialFormData.emergencyContact3Name || ''}
                                onChange={(e) => handleInputChange('emergencyContact3Name', e.target.value)}
                                name="emergencyContact3Name"
                            />
                            <FormInput
                                label="RELATIONSHIP"
                                value={initialFormData.emergencyContact3Relationship || ''}
                                onChange={(e) => handleInputChange('emergencyContact3Relationship', e.target.value)}
                                name="emergencyContact3Relationship"
                            />
                            <FormInput
                                label="TELEPHONE NUMBER"
                                type="tel"
                                value={initialFormData.emergencyContact3Phone || ''}
                                onChange={(e) => handleInputChange('emergencyContact3Phone', e.target.value)}
                                placeholder="+1(555) 555-1234"
                                name="emergencyContact3Phone"
                            />
                        </div>

                        <div className="grid md:grid-cols-4 gap-4">
                            <FormInput
                                label="STREET"
                                value={initialFormData.emergencyContact3Street || ''}
                                onChange={(e) => handleInputChange('emergencyContact3Street', e.target.value)}
                                name="emergencyContact3Street"
                            />
                            <FormInput
                                label="CITY"
                                value={initialFormData.emergencyContact3City || ''}
                                onChange={(e) => handleInputChange('emergencyContact3City', e.target.value)}
                                name="emergencyContact3City"
                            />
                            <FormInput
                                label="STATE"
                                value={initialFormData.emergencyContact3State || ''}
                                onChange={(e) => handleInputChange('emergencyContact3State', e.target.value)}
                                name="emergencyContact3State"
                            />
                            <FormInput
                                label="ZIP"
                                value={initialFormData.emergencyContact3Zip || ''}
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