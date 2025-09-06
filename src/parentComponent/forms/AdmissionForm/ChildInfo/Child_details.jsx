import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { FormInput, RadioGroup } from './InputComponent';
import { DownIcon,UpIcon } from '../../../../components/common/Arrows';
import { api_base_url, school_id } from '@/utils/const';
import { useAuth0 } from '@auth0/auth0-react';
import { getAuthHeaders } from '@/utils/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle } from 'lucide-react';

const Child_details = ({ openSection, setOpenSection, initialFormData, childId }) => {
    const { getAccessTokenSilently } = useAuth0();

    
    const [formData, setFormData] = useState({
        child_first_name: '',
        child_last_name: '',
        nick_name: '',
        dob: '',
        primary_language: '',
        school_age_child_school: '',
        do_relevant_custody_papers_apply: '',
        gender: '',
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

    // Function to check if all required fields are filled
    const isFormComplete = () => {
        const requiredFields = [
            'child_first_name',
            'child_last_name', 
            'dob',
            'gender',
            'primary_language'
        ];
        
        return requiredFields.every(field => 
            formData[field] && formData[field].toString().trim() !== ''
        );
    };

    

      // API function to update admission form data
      const updateAdmissionData = async (fieldData) => {
          if (!childId) {
              console.error('Child ID is required for API update');
              return;
          }
  
          try {
              const headers = await getAuthHeaders(getAccessTokenSilently);
              const response = await fetch(`${api_base_url}/admission_segment/${school_id}/${childId}`, {
                  method: 'PUT',
                  headers,
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
            toast.error('Error: Child ID is missing');
            return;
        }

        try {
            let genderVal = formData.gender == "1" ? 1 : formData.gender == "2" ? 2 : formData.gender == "3" ? 3 : 0;
            
            const saveData = {
                child_id: childId,
                school_id: school_id,
                child_first_name: formData.child_first_name,
                child_last_name: formData.child_last_name,
                nick_name: formData.nick_name,
                dob: formData.dob,
                primary_language: formData.primary_language,
                school_age_child_school: formData.school_age_child_school,
                do_relevant_custody_papers_apply: formData.do_relevant_custody_papers_apply == null ? 0 : parseInt(formData.do_relevant_custody_papers_apply),
                gender: genderVal
            };
            console.log(saveData) // Log the data being sent to the API for debugging pur)
            await updateAdmissionData(saveData);
            toast.success('Child details data saved successfully!');
        } catch (error) {
            console.error('Failed to save Child details:', error);
            toast.error('Error saving Child details data. Please try again.');
        }
    };

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
                    {isFormComplete() ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                        <Circle className="w-5 h-5 text-gray-400" />
                    )}
                    <Badge variant={isFormComplete() ? "default" : "secondary"}>
                        {isFormComplete() ? "Complete" : "Incomplete"}
                    </Badge>
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
                            value={formData.child_first_name}
                            onChange={handleChange}
                            name="child_first_name"
                        />
                        <FormInput
                            label="LAST NAME"
                            value={formData.child_last_name}
                            onChange={handleChange}
                            name="child_last_name"
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <FormInput
                            label="NICKNAME"
                            value={formData.nick_name}
                            onChange={handleChange}
                            placeholder="e.g. John"
                            name="nick_name"
                        />
                        <FormInput
                            label="BIRTH DATE"
                            type="date"
                            value={formData.dob}
                            onChange={handleChange}
                            name="dob"
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <FormInput
                            label="PRIMARY LANGUAGE"
                            value={formData.primary_language}
                            onChange={handleChange}
                            placeholder="e.g. English"
                            name="primary_language"
                        />
                        <FormInput
                            label="SCHOOL-AGE CHILD'S SCHOOL"
                            value={formData.school_age_child_school}
                            onChange={handleChange}
                            placeholder="e.g. Willowbrook School"
                            name="school_age_child_school"
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <RadioGroup
                            label="DO RELEVANT CUSTODY PAPERS APPLY?"
                            name="do_relevant_custody_papers_apply"
                            options={[
                                { value: '1', label: 'Yes' },
                                { value: '2', label: 'No' }
                            ]}
                            selectedValue={formData.do_relevant_custody_papers_apply?.toString()}
                            onChange={handleChange}
                        />
                        <RadioGroup
                            label="GENDER"
                            name="gender"
                            options={[
                                { value: '1', label: 'Male' },
                                { value: '2', label: 'Female' },
                                { value: '3', label: 'Others' }
                            ]}
                            selectedValue={formData.gender?.toString()}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="flex justify-center pt-4">
                        <Button onClick={handleSave} className="bg-[#0F2D52] hover:bg-[#0F2D52]/90 px-8 py-3">
                            Save
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Child_details;
