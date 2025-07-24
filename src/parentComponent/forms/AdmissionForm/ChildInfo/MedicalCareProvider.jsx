import React, { useState, useEffect } from 'react';
import { FormInput } from './InputComponent';
import { DownIcon,UpIcon } from '../../../../components/common/Arrows';
const MedicalCareProvider = ({ openSection, setOpenSection, initialFormData, charProviderData, handleInputChange, childId }) => {
    
    const [formData, setFormData] = useState({
            child_care_provider_id: "",
            child_care_provider_name: "",
            child_hospital_affiliation: "",
            child_care_provider_zip_address: "",
            child_care_provider_city_address: "",
            child_care_provider_state_address: "",
            child_care_provider_street_address: "",
            child_care_provider_telephone_number: "",
            child_dentist_name: "",
            dentist_telephone_number: "",
            dentist_street_address: "",
            dentist_city_address: "",
            dentist_state_address: "",
            dentist_zip_address: "",
            special_diabilities: "",
            allergies_medication_reaction: "",
            additional_info: "",
            medication: "",
            health_insurance: "",
            policy_number: ""
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
          if (initialFormData) {
            setFormData(prevState => ({
              child_id: childId,
                    child_care_provider_id: charProviderData.child_care_provider_id,
                    child_care_provider_name: charProviderData.child_care_provider_name,
                    child_hospital_affiliation: charProviderData.child_hospital_affiliation,
                    child_care_provider_zip_address: charProviderData.child_care_provider_zip_address,
                    child_care_provider_city_address: charProviderData.child_care_provider_city_address,
                    child_care_provider_state_address: charProviderData.child_care_provider_state_address,
                    child_care_provider_street_address: charProviderData.child_care_provider_street_address,
                    child_care_provider_telephone_number: charProviderData.child_care_provider_telephone_number,
                    child_dentist_name: initialFormData.child_dentist_name,
                    dentist_telephone_number: initialFormData.dentist_telephone_number,
                    dentist_street_address: initialFormData.dentist_street_address,
                    dentist_city_address: initialFormData.dentist_city_address,
                    dentist_state_address: initialFormData.dentist_state_address,
                    dentist_zip_address: initialFormData.dentist_zip_address,
                    special_diabilities: initialFormData.special_diabilities,
                    allergies_medication_reaction: initialFormData.allergies_medication_reaction,
                    additional_info: initialFormData.additional_info,
                    medication: initialFormData.medication,
                    health_insurance: initialFormData.health_insurance,
                    policy_number: initialFormData.policy_number
            }));
          }
        }, [initialFormData]);
    
        
    
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
                const saveData = {
                    child_id: childId,
                    child_care_provider_info : {
                    child_care_provider_id: formData.child_care_provider_id,
                    child_care_provider_name: formData.child_care_provider_name,
                    child_hospital_affiliation: formData.child_hospital_affiliation,
                    child_care_provider_zip_address: formData.child_care_provider_zip_address,
                    child_care_provider_city_address: formData.child_care_provider_city_address,
                    child_care_provider_state_address: formData.child_care_provider_state_address,
                    child_care_provider_street_address: formData.child_care_provider_street_address,
                    child_care_provider_telephone_number: formData.child_care_provider_telephone_number,
                    },
                    child_dentist_name: formData.child_dentist_name,
                    dentist_telephone_number: formData.dentist_telephone_number,
                    dentist_street_address: formData.dentist_street_address,
                    dentist_city_address: formData.dentist_city_address,
                    dentist_state_address: formData.dentist_state_address,
                    dentist_zip_address: formData.dentist_zip_address,
                    special_diabilities: formData.special_diabilities,
                    allergies_medication_reaction: formData.allergies_medication_reaction,
                    additional_info: formData.additional_info,
                    medication: formData.medication,
                    health_insurance: formData.health_insurance,
                    policy_number: formData.policy_number
                };
                console.log(saveData) // Log the data being sent to the API for debugging pur)
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
                className={`px-6 py-4 flex items-center justify-between cursor-pointer transition-colors ${openSection === 'medicalCareProvider' ? 'text-white' : 'text-slate-700'
                    }`}
                style={
                    openSection === 'medicalCareProvider'
                        ? { backgroundColor: '#0F2D52', color: 'white' }
                        : { backgroundColor: '#DBEAFE' }
                }
                onClick={() =>
                    setOpenSection(openSection === 'medicalCareProvider' ? '' : 'medicalCareProvider')
                }
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#0F2D52';
                     e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                    if (openSection !== 'medicalCareProvider') {
                        e.currentTarget.style.backgroundColor = '#DBEAFE';
                        e.currentTarget.style.color = '#374151'; // Tailwind's text-slate-700
                    }
                }}
            >
                <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-semibold">Medical Care Provider Details</h2>
                </div>
                <div className="text-xl transform transition-transform duration-200">
                    {openSection === 'medicalCareProvider' ? <DownIcon className="h-5 w-5 text-gray-500" /> : <UpIcon className="h-5 w-5 text-black" />}
                </div>
            </div>

            {openSection === 'medicalCareProvider' && (
                <div className="p-6 space-y-6 bg-gray-50" style={{ border: '1px solid #314158' }} onClick={(e) => e.stopPropagation()}>
                    {/* Physician/Medical Care Provider Details Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-center text-gray-800">PHYSICIAN /MEDICAL CARE PROVIDER DETAILS</h3>

                        <div>
                            <FormInput
                                label="NAME OF CHILD'S PHYSICIAN /MEDICAL CARE PROVIDER"
                                value={formData.child_care_provider_name || ''}
                                onChange={handleChange}
                                name="child_care_provider_name"
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <FormInput
                                label="TELEPHONE NUMBER"
                                type="tel"
                                value={formData.child_care_provider_telephone_number || ''}
                                onChange={handleChange}
                                placeholder="+1(555) 555-1234"
                                name="child_care_provider_telephone_number"
                            />
                            <FormInput
                                label="HOSPITAL AFFILIATION"
                                value={formData.child_hospital_affiliation || ''}
                                onChange={handleChange}
                                name="child_hospital_affiliation"
                            />
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-md font-semibold text-center text-gray-800">ADDRESS</h4>
                            <div className="grid md:grid-cols-4 gap-4">
                                <FormInput
                                    label="STREET"
                                    value={formData.child_care_provider_street_address || ''}
                                    onChange={handleChange}
                                    name="child_care_provider_street_address"
                                />
                                <FormInput
                                    label="CITY"
                                    value={formData.child_care_provider_city_address || ''}
                                    onChange={handleChange}
                                    name="child_care_provider_city_address"
                                />
                                <FormInput
                                    label="STATE"
                                    value={formData.child_care_provider_state_address || ''}
                                    onChange={handleChange}
                                    name="child_care_provider_state_address"
                                />
                                <FormInput
                                    label="ZIP"
                                    value={formData.child_care_provider_zip_address || ''}
                                    onChange={handleChange}
                                    name="child_care_provider_zip_address"
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
                                value={formData.child_dentist_name || ''}
                                onChange={handleChange}
                                name="child_dentist_name"
                            />
                            <FormInput
                                label="DENTIST TELEPHONE NUMBER"
                                type="tel"
                                value={formData.dentist_telephone_number || ''}
                                onChange={handleChange}
                                placeholder="+1(555) 555-1234"
                                name="dentist_telephone_number"
                            />
                            <FormInput
                                label="STREET"
                                value={formData.dentist_street_address || ''}
                                onChange={handleChange}
                                name="dentist_street_address"
                            />
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                            <FormInput
                                label="CITY"
                                value={formData.dentist_city_address || ''}
                                onChange={handleChange}
                                name="dentist_city_address"
                            />
                            <FormInput
                                label="STATE"
                                value={formData.dentist_state_address || ''}
                                onChange={handleChange}
                                name="dentist_state_address"
                            />
                            <FormInput
                                label="ZIP"
                                value={formData.dentist_zip_address || ''}
                                onChange={handleChange}
                                name="dentist_zip_address"
                            />
                        </div>
                    </div>

                    {/* Medical Information Section */}
                    <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormInput
                                label="SPECIAL DISABILITIES (IF ANY)"
                                value={formData.special_diabilities || ''}
                                onChange={handleChange}
                                name="special_diabilities"
                            />
                            <FormInput
                                label="ALLERGIES (MEDICATION REACTION)"
                                value={formData.allergies_medication_reaction || ''}
                                onChange={handleChange}
                                name="allergies_medication_reaction"
                            />
                        </div>

                        <div>
                            <FormInput
                                label="ADDITIONAL INFORMATION REGARDING SPECIAL NEEDS"
                                value={formData.additional_info || ''}
                                onChange={handleChange}
                                name="additional_info"
                            />
                        </div>

                        <div>
                            <FormInput
                                label="MEDICATION, SPECIAL CONDITIONS NUMBER"
                                value={formData.medication || ''}
                                onChange={handleChange}
                                name="medication"
                            />
                        </div>

                        <div>
                            <FormInput
                                label="HEALTH INSURANCE COVERAGE FOR CHILD OR MEDICAL ASSISTANCE BENEFITS"
                                value={formData.health_insurance || ''}
                                onChange={handleChange}
                                name="health_insurance"
                            />
                        </div>

                        <div>
                            <FormInput
                                label="POLICY NUMBER"
                                value={formData.policy_number || ''}
                                onChange={handleChange}
                                name="policy_number"
                            />
                        </div>
                    </div>

                    <div className="flex justify-center pt-4">
                        <button className="bg-slate-700 text-white px-8 py-3 rounded-md hover:bg-slate-800 transition-colors"
                        onClick={handleSave}>
                            Save
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default MedicalCareProvider;