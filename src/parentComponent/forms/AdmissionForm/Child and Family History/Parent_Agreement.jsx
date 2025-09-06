import React, { useState, useEffect } from 'react';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Save, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { CheckboxGroup } from './InputComponent';
import { api_base_url, school_id } from '@/utils/const';
import { useAuth0 } from '@auth0/auth0-react';
import { getAuthHeaders } from '@/utils/auth';



const Parent_Agreement = ({ openSection, setOpenSection, formData, handleInputChange, initialFormData, childId }) => {
    const { getAccessTokenSilently } = useAuth0();
    const [localFormData, setLocalFormData] = useState({
        agree_all_above_info_is_correct: []
    });

    const handleCheckboxChange = (name, updatedValues) => {
        setLocalFormData(prevState => ({
            ...prevState,
            [name]: updatedValues
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
                agree_all_above_info_is_correct: initialFormData.agree_all_above_info_is_correct === 'on' ? ['I agree all the above information is correct.'] : []
            }));
        }
    }, [initialFormData, childId]);

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

    const isFormComplete = () => {
        return localFormData.agree_all_above_info_is_correct.includes('I agree all the above information is correct.');
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
                agree_all_above_info_is_correct: localFormData.agree_all_above_info_is_correct.includes('I agree all the above information is correct.') ? 'on' : ''
            };
            console.log(saveData);
            await updateAdmissionData(saveData);
            toast.success('Parent agreement data saved successfully!');
        } catch (error) {
            console.error('Failed to save Parent agreement data:', error);
            toast.error('Error saving Parent agreement data. Please try again.');
        }
    };
    return (
        <AccordionItem value="ParentAgreement">
            <AccordionTrigger className="px-6 py-4 hover:bg-[#0F2D52] hover:text-white data-[state=open]:bg-[#0F2D52] data-[state=open]:text-white">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5" />
                        <span className="text-lg font-semibold">Parent Agreement</span>
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
                    <p className="text-sm text-gray-600 mb-4">
                        Please review all the information provided above and confirm your agreement:
                    </p>
                    <div className="border rounded-lg p-4 bg-white">
                        <CheckboxGroup
                            label=""
                            name="agreement"
                            options={[
                                { label: 'I agree all the above information is correct.', value: 'I agree all the above information is correct.' },
                            ]}
                            selectedValues={localFormData.agree_all_above_info_is_correct}
                            onChange={(updatedValues) => handleCheckboxChange('agree_all_above_info_is_correct', updatedValues)}
                        />
                    </div>
                </div>

                <div className="flex justify-center pt-4">
                    <Button 
                        onClick={handleSave}
                        className="bg-[#0F2D52] hover:bg-[#0F2D52]/90 text-white px-8 py-3"
                        disabled={!isFormComplete()}
                    >
                        <Save className="h-4 w-4 mr-2" />
                        Save Agreement
                    </Button>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
};

export default Parent_Agreement;
