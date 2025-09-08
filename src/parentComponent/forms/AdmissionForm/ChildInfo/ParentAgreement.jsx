import React, { useState, useEffect } from 'react';
import { FormInput } from './InputComponent';

import { DownIcon,UpIcon } from '../../../../components/common/Arrows';
import { api_base_url, school_id } from '@/utils/const';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
// Note: Using regular textarea as Textarea component may not be available


const ParentAgreement = ({ openSection, setOpenSection, formData, handleInputChange, childId, onSubmitSuccess, isCompleted = false }) => {
    const [obtainText, setobtainText] = useState(formData.obtaining_emergency_medical_care ?? '');
      const [procedure, setprocedure] = useState(formData.administration_first_aid_procedures ?? '');
      const [submitted, setSubmitted] = useState(formData.agree_all_above_information_is_correct == 'on');
    
      // API function to update admission form data
      const updateAdmissionData = async (fieldData) => {
        if (!childId) {
          console.error('Child ID is required for API update');
          return;
        }
    
        try {
          const response = await fetch(`${api_base_url}/admission_segment/${school_id}/${childId}`, {
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
    
      // Initialize form data from props
      React.useEffect(() => {
        if (formData) {
          setobtainText(formData.obtaining_emergency_medical_care ?? '');
          setprocedure(formData.administration_first_aid_procedures ?? '');
          setSubmitted(formData.agree_all_above_information_is_correct == 'on');
        }
      }, [formData]);
    
      // Function to check if agreement is complete (for validation only)
      const isFormComplete = () => {
          return submitted && obtainText.trim() !== '' && procedure.trim() !== '';
      };

      const handleSave = async () => {
        if (!childId) {
          alert('Error: Child ID is missing');
          return;
        }
    
        try {
          const saveData = {
            child_id: childId,
            school_id: school_id,
            obtaining_emergency_medical_care: obtainText,
            administration_first_aid_procedures: procedure,
            agree_all_above_information_is_correct: submitted ? 'on' : 'off'
          };
    
          await updateAdmissionData(saveData);
          alert('Medical transportation waiver saved successfully!');
          
          // Call parent success handler to mark section as completed
          if (onSubmitSuccess) {
              onSubmitSuccess();
          }
        } catch (error) {
          console.error('Failed to save medical transportation waiver:', error);
          alert('Error saving medical transportation waiver. Please try again.');
        }
      };

    const getInputBorderClass = (value) => {
        if (value && value.trim() !== '') {
            return 'border-green-500 focus:ring-green-500';
        } else {
            return 'border-red-500 focus:ring-red-500';
        }
    };

    return (
        <>
            <div
                className={`px-6 py-4 flex items-center justify-between cursor-pointer transition-colors ${openSection === 'parentAgreement' ? 'text-white' : 'text-slate-700'
                    }`}
                style={
                    openSection === 'parentAgreement'
                        ? { backgroundColor: '#0F2D52', color: 'white' }
                        : { backgroundColor: '#DBEAFE' }
                }
                onClick={() =>
                    setOpenSection(openSection === 'parentAgreement' ? '' : 'parentAgreement')
                }
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#0F2D52';
                     e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                    if (openSection !== 'parentAgreement') {
                        e.currentTarget.style.backgroundColor = '#DBEAFE';
                        e.currentTarget.style.color = '#374151'; // Tailwind's text-slate-700
                    }
                }}
            >
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-3">
                        <h2 className="text-lg font-semibold">Parent Agreement</h2>
                        {isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                            <Circle className="w-5 h-5 text-gray-400" />
                        )}
                        <Badge variant={isCompleted ? "default" : "secondary"}>
                            {isCompleted ? "Complete" : "Incomplete"}
                        </Badge>
                    </div>
                </div>
                <div className="text-xl transform transition-transform duration-200">
                    {openSection === 'parentAgreement' ? <DownIcon className="h-5 w-5 text-gray-500" /> : <UpIcon className="h-5 w-5 text-black" />}
                </div>
            </div>


            {openSection === 'parentAgreement' && (
                <div className="p-6 space-y-6 bg-gray-50" style={{ border: '1px solid #314158' }} onClick={(e) => e.stopPropagation()}>
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-center text-gray-800">PARENT'S / LEGAL GUARDIAN'S AGREEMENT</h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="emergencyMedicalCare" className="text-sm font-medium text-gray-700">
                                    OBTAINING EMERGENCY MEDICAL CARE
                                </Label>
                                <textarea
                                    id="emergencyMedicalCare"
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 min-h-[60px] resize-none"
                                    value={obtainText}
                                    onChange={(e) => setobtainText(e.target.value)}
                                    name="emergencyMedicalCare"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="firstAidProcedures" className="text-sm font-medium text-gray-700">
                                    ADMINISTRATION OF MINOR FIRST-AID PROCEDURES
                                </Label>
                                <textarea
                                    id="firstAidProcedures"
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 min-h-[60px] resize-none"
                                    value={procedure}
                                    onChange={(e) => setprocedure(e.target.value)}
                                    name="firstAidProcedures"
                                />
                            </div>
                        </div>

                        <div className="bg-gray-100 p-4 rounded-md">
                            <p className="text-sm text-gray-700 leading-relaxed">
                                "In EMERGENCIES requiring immediate medical attention, your child will be taken to the NEAREST HOSPITAL EMERGENCY ROOM. Your signature authorizes the responsible person at the child care facility to have your child transported to that hospital."
                            </p>
                        </div>

                        <div className="flex items-start space-x-3">
                            <Checkbox
                                id="agreementCheck"
                                checked={submitted}
                                onCheckedChange={setSubmitted}
                            />
                            <Label htmlFor="agreementCheck" className="text-sm text-gray-700 cursor-pointer">
                                I agree all the above information is correct.
                            </Label>
                        </div>
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

export default ParentAgreement;