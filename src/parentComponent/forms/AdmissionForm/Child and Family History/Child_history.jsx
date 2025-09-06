import React, { useState, useEffect } from 'react';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Save, User } from 'lucide-react';
import { toast } from 'sonner';
import { FormInput } from './InputComponent';
import { api_base_url, school_id } from '@/utils/const';


const Child_history = ({ openSection, setOpenSection, formData, handleInputChange, initialFormData, childId }) => {
    const [localFormData, setLocalFormData] = useState({
        DateOfLastPhysicalExam: '',
        DateOfLastDentalExam: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocalFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    useEffect(() => {
        setLocalFormData(prevState => ({
            ...prevState
        }));
    }, []);

    useEffect(() => {
        if (initialFormData) {
            setLocalFormData(prevState => ({
                child_id: childId,
                DateOfLastPhysicalExam: initialFormData.physical_exam_last_date || '',
                DateOfLastDentalExam: initialFormData.dental_exam_last_date || ''
            }));
        }
    }, [initialFormData, childId]);

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

    // Function to check if all required fields are filled
    const isFormComplete = () => {
        const requiredFields = [
            'DateOfLastPhysicalExam',
            'DateOfLastDentalExam'
        ];
        
        return requiredFields.every(field => 
            localFormData[field] && localFormData[field].toString().trim() !== ''
        );
    };

    const handleSave = async () => {
        if (!childId) {
            toast.error('Error: Child ID is missing');
            return;
        }

        try {
            const saveData = {
                child_id: childId,
                school_id: school_id,
                physical_exam_last_date: localFormData.DateOfLastPhysicalExam,
                dental_exam_last_date: localFormData.DateOfLastDentalExam
            };
            console.log(saveData);
            await updateAdmissionData(saveData);
            toast.success('Child history data saved successfully!');
        } catch (error) {
            console.error('Failed to save Child history data:', error);
            toast.error('Error saving Child history data. Please try again.');
        }
    };
    return (
        <AccordionItem value="childHistory">
            <AccordionTrigger className="px-6 py-4 hover:bg-[#0F2D52] hover:text-white data-[state=open]:bg-[#0F2D52] data-[state=open]:text-white">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3">
                        <User className="h-5 w-5" />
                        <span className="text-lg font-semibold">Child History</span>
                        {isFormComplete() && (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                    </div>
                    <Badge variant={isFormComplete() ? "default" : "secondary"}>
                        {isFormComplete() ? "Complete" : "Incomplete"}
                    </Badge>
                </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 py-6 space-y-6 bg-gray-50">
                <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                        <FormInput
                            label="Date of Last Physical Exam"
                            type="date"
                            value={localFormData.DateOfLastPhysicalExam}
                            onChange={handleChange}
                            name="DateOfLastPhysicalExam"
                        />
                        <FormInput
                            label="Date of Last Dental Exam"
                            type="date"
                            value={localFormData.DateOfLastDentalExam}
                            onChange={handleChange}
                            name="DateOfLastDentalExam"
                        />
                    </div>
                </div>

                <div className="flex justify-center pt-4">
                    <Button 
                        onClick={handleSave}
                        className="bg-[#0F2D52] hover:bg-[#0F2D52]/90 text-white px-8 py-3"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                    </Button>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
};

export default Child_history;
