import React, { useState, useEffect } from 'react';
import { FormInput } from './InputComponent';
import { DownIcon,UpIcon } from '../../../../components/common/Arrows';

const Child_details = ({ openSection, setOpenSection, initialFormData, childId }) => {

    
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
            let genderVal = formData.gender == "1" ? 1 : formData.gender == "2" ? 2 : formData.gender == "3" ? 3 : 0;
            
            const saveData = {
                child_id: childId,
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
            alert('Child details data saved successfully!');
        } catch (error) {
            console.error('Failed to save Child details:', error);
            alert('Error saving Child details data. Please try again.');
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">DO RELEVANT CUSTODY PAPERS APPLY?</label>
                            <div className="flex space-x-6">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="do_relevant_custody_papers_apply"
                                        value= '1'
                                        checked={formData.do_relevant_custody_papers_apply == 1}
                                        onChange={handleChange}
                                        className="mr-2 text-green-500 focus:ring-green-500"
                                    />
                                    Yes
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="do_relevant_custody_papers_apply"
                                        value="2"
                                        checked={formData.do_relevant_custody_papers_apply == 2}
                                        onChange={handleChange}
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
                                        value="1"
                                        checked={formData.gender == 1}
                                        onChange={handleChange}
                                        className="mr-2 text-green-500 focus:ring-green-500"
                                    />
                                    Male
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="2"
                                        checked={formData.gender == 2}
                                        onChange={handleChange}
                                        className="mr-2 text-green-500 focus:ring-green-500"
                                    />
                                    Female
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value= "3"
                                        checked={formData.gender == 3}
                                        onChange={handleChange}
                                        className="mr-2 text-green-500 focus:ring-green-500"
                                    />
                                    Others
                                </label>
                            </div>
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

export default Child_details;
