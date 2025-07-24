import React, { useState, useEffect } from 'react';
import { FormInput } from './InputComponent';
import { DownIcon,UpIcon } from '../../../../components/common/Arrows';
const Parent_details = ({ openSection, setOpenSection, initialFormData, handleInputChange, childId }) => {



    const [formData, setFormData] = useState({
            parent_name: '',
            parent_email: '',
            parent_zip_address: '',
            parent_city_address: '',
            parent_business_name: "",
            parent_state_address: "",
            parent_work_hours_to: "",
            parent_street_address: "",
            parent_work_hours_from: "",
            parent_home_cell_number: "",
            parent_business_cell_number: "",
            parent_business_zip_address: "",
            parent_business_city_address: "",
            parent_home_telephone_number: "",
            parent_business_state_address: "",
            parent_business_street_address: "",
            parent_business_telephone_number: ""
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
              ...prevState,
              ...initialFormData
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
                
                const saveData ={ 
                    child_id: childId,
                    primary_parent_info : {
                    parent_id: initialFormData.parent_id,
                    parent_name: formData.parent_name,
                    parent_email: formData.parent_email,
                    parent_zip_address: formData.parent_zip_address,
                    parent_city_address: formData.parent_city_address,
                    business_name: formData.parent_business_name,
                    parent_state_address: formData.parent_state_address,
                    work_hours_to: formData.parent_work_hours_to,
                    parent_street_address: formData.parent_street_address,
                    work_hours_from: formData.parent_work_hours_from.toString(),
                    home_cell_number: formData.parent_home_cell_number,
                    business_cell_number: formData.parent_business_cell_number,
                    business_zip_address: formData.parent_business_zip_address,
                    business_city_address: formData.parent_business_city_address,
                    home_telephone_number: formData.parent_home_telephone_number,
                    business_state_address: formData.parent_business_state_address,
                    business_street_address: formData.parent_business_street_address,
                    business_telephone_number: formData.parent_business_telephone_number
                }};
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
                    {openSection === 'parentDetails' ? <DownIcon className="h-5 w-5 text-gray-500" /> : <UpIcon className="h-5 w-5 text-black" />}
                </div>
            </div>


            {openSection === 'parentDetails' && (
                <div className="p-6 space-y-6 bg-gray-50" style={{ border: '1px solid #314158' }} onClick={(e) => e.stopPropagation()}>
                    {/* Parent/Legal Guardian Name */}
                    <div>
                        <FormInput
                            label="PARENT'S / LEGAL GUARDIAN'S NAME"
                            value={formData.parent_name}
                            onChange={handleChange}
                            name="parent_name"
                        />
                    </div>

                    {/* Home Address Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-center text-gray-800">HOME ADDRESS</h3>
                        <div className="grid md:grid-cols-4 gap-4">
                            <FormInput label="STREET" value={formData.parent_street_address} onChange={handleChange} name="parent_street_address" />
                            <FormInput label="CITY" value={formData.parent_city_address} onChange={handleChange} name="parent_city_address" />
                            <FormInput label="STATE" value={formData.parent_state_address} onChange={handleChange} name="parent_state_address" />
                            <FormInput label="ZIP" value={formData.parent_zip_address} onChange={handleChange} name="parent_zip_address" />
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="grid md:grid-cols-3 gap-6">
                        <FormInput label="TELEPHONE NUMBER" type="tel" value={formData.parent_home_telephone_number} onChange={handleChange} placeholder="+1(555) 555-1234" name="parent_home_telephone_number" />
                        <FormInput label="CELL NUMBER" type="tel" value={formData.parent_business_cell_number} onChange={handleChange} placeholder="+1(555) 555-1234" name="parent_business_cell_number" />
                        <FormInput label="EMAIL ADDRESS" type="email" value={formData.parent_email} onChange={handleChange} name="parent_email" />
                    </div>

                    {/* Business Details Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-center text-gray-800">BUSINESS DETAILS</h3>
                        <div className="grid md:grid-cols-4 gap-4">
                            <FormInput label="NAME" value={formData.parent_business_name} onChange={handleChange} name="parent_business_name" />
                            <FormInput label="WORK HOURS FROM" type="number" value={formData.parent_work_hours_from} onChange={handleChange} name="parent_work_hours_from" />
                            <FormInput label="WORK HOURS TO" type="number" value={formData.parent_work_hours_to} onChange={handleChange} name="parent_work_hours_to" />
                            <FormInput label="TELEPHONE NUMBER" type="tel" value={formData.parent_business_telephone_number} onChange={handleChange} placeholder="+1(555) 555-1234" name="parent_business_telephone_number" />
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

export default Parent_details;
