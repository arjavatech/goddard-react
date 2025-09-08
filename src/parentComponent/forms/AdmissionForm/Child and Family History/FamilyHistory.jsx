import React, { useState, useEffect } from 'react';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Save, Users } from 'lucide-react';
import { toast } from 'sonner';
import { CheckboxGroup } from './InputComponent';
import { api_base_url, school_id } from '@/utils/const';
import { useAuth0 } from '@auth0/auth0-react';
import { getAuthHeaders } from '@/utils/auth';

const FamilyHistory = ({ openSection, setOpenSection, formData, handleInputChange, initialFormData, childId }) => {
    const [localFormData, setLocalFormData] = useState({
        hobbies: [],
        HeartProblems: [], 
        Tuberculosis: [],
        Asthma: [],
        HighBloodPressure: [],
        VisionProblems: [],
        Diabetes: [],
        Hyperactivity: [],
        Epilepsy: [],
        NoIllnesses: []
    });

    const { getAccessTokenSilently } = useAuth0();

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
                hobbies: initialFormData.family_history_allergies === 'on' ? ['allergies'] : [],
                HeartProblems: initialFormData.family_history_heart_problems === 'on' ? ['HeartProblems'] : [],
                Tuberculosis: initialFormData.family_history_tuberculosis === 'on' ? ['Tuberculosis'] : [],
                Asthma: initialFormData.family_history_asthma === 'on' ? ['Asthma'] : [],
                HighBloodPressure: initialFormData.family_history_high_blood_pressure === 'on' ? ['HighBloodPressure'] : [],
                VisionProblems: initialFormData.family_history_vision_problems === 'on' ? ['VisionProblems'] : [],
                Diabetes: initialFormData.family_history_diabetes === 'on' ? ['Diabetes'] : [],
                Hyperactivity: initialFormData.family_history_hyperactivity === 'on' ? ['Hyperactivity'] : [],
                Epilepsy: initialFormData.family_history_epilepsy === 'on' ? ['Epilepsy'] : [],
                NoIllnesses: initialFormData.no_illnesses_for_this_child === 'on' ? ['NoIllnesses'] : []
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

    // Function to check if any required field is filled (at least one checkbox)
    const isFormComplete = () => {
        const allCheckboxGroups = [
            'hobbies', 'HeartProblems', 'Tuberculosis', 'Asthma', 
            'HighBloodPressure', 'VisionProblems', 'Diabetes', 
            'Hyperactivity', 'Epilepsy', 'NoIllnesses'
        ];
        
        return allCheckboxGroups.some(group => 
            localFormData[group] && localFormData[group].length > 0
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
                family_history_allergies: localFormData.hobbies.includes('allergies') ? 'on' : '',
                family_history_heart_problems: localFormData.HeartProblems.includes('HeartProblems') ? 'on' : '',
                family_history_tuberculosis: localFormData.Tuberculosis.includes('Tuberculosis') ? 'on' : '',
                family_history_asthma: localFormData.Asthma.includes('Asthma') ? 'on' : '',
                family_history_high_blood_pressure: localFormData.HighBloodPressure.includes('HighBloodPressure') ? 'on' : '',
                family_history_vision_problems: localFormData.VisionProblems.includes('VisionProblems') ? 'on' : '',
                family_history_diabetes: localFormData.Diabetes.includes('Diabetes') ? 'on' : '',
                family_history_hyperactivity: localFormData.Hyperactivity.includes('Hyperactivity') ? 'on' : '',
                family_history_epilepsy: localFormData.Epilepsy.includes('Epilepsy') ? 'on' : '',
                no_illnesses_for_this_child: localFormData.NoIllnesses.includes('NoIllnesses') ? 'on' : ''
            };
            console.log(saveData);
            await updateAdmissionData(saveData);
            toast.success('Family history data saved successfully!');
        } catch (error) {
            console.error('Failed to save Family history data:', error);
            toast.error('Error saving Family history data. Please try again.');
        }
    };
    return (
        <AccordionItem value="FamilyHistory">
            <AccordionTrigger className="px-6 py-4 hover:bg-[#0F2D52] hover:text-white data-[state=open]:bg-[#0F2D52] data-[state=open]:text-white">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3">
                        <Users className="h-5 w-5" />
                        <span className="text-lg font-semibold">Family History</span>
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
                    <p className="text-sm text-gray-600 mb-4">Select any conditions that apply to your family history:</p>
                    <div className="grid md:grid-cols-3 gap-6">
                        <CheckboxGroup
                            label=""
                            name="hobbies"
                            options={[
                                { label: 'Allergies', value: 'allergies' },
                            ]}
                            selectedValues={localFormData.hobbies}
                            onChange={(updatedValues) => handleCheckboxChange('hobbies', updatedValues)}
                        />
                        <CheckboxGroup
                            label=""
                            name="Heart Problems"
                            options={[
                                { label: 'Heart Problems', value: 'HeartProblems' },
                            ]}
                            selectedValues={localFormData.HeartProblems}
                            onChange={(updatedValues) => handleCheckboxChange('HeartProblems', updatedValues)}
                        />
                        <CheckboxGroup
                            label=""
                            name="Tuberculosis"
                            options={[
                                { label: 'Tuberculosis', value: 'Tuberculosis' },
                            ]}
                            selectedValues={localFormData.Tuberculosis}
                            onChange={(updatedValues) => handleCheckboxChange('Tuberculosis', updatedValues)}
                        />
                        <CheckboxGroup
                            label=""
                            name="Asthma"
                            options={[
                                { label: 'Asthma', value: 'Asthma' },
                            ]}
                            selectedValues={localFormData.Asthma}
                            onChange={(updatedValues) => handleCheckboxChange('Asthma', updatedValues)}
                        />
                        <CheckboxGroup
                            label=""
                            name="High Blood Pressure"
                            options={[
                                { label: 'High Blood Pressure', value: 'HighBloodPressure' },
                            ]}
                            selectedValues={localFormData.HighBloodPressure}
                            onChange={(updatedValues) => handleCheckboxChange('HighBloodPressure', updatedValues)}
                        />
                        <CheckboxGroup
                            label=""
                            name="Vision Problems"
                            options={[
                                { label: 'Vision Problems', value: 'VisionProblems' },
                            ]}
                            selectedValues={localFormData.VisionProblems}
                            onChange={(updatedValues) => handleCheckboxChange('VisionProblems', updatedValues)}
                        />
                        <CheckboxGroup
                            label=""
                            name="Diabetes"
                            options={[
                                { label: 'Diabetes', value: 'Diabetes' },
                            ]}
                            selectedValues={localFormData.Diabetes}
                            onChange={(updatedValues) => handleCheckboxChange('Diabetes', updatedValues)}
                        />
                        <CheckboxGroup
                            label=""
                            name="Hyperactivity"
                            options={[
                                { label: 'Hyperactivity', value: 'Hyperactivity' },
                            ]}
                            selectedValues={localFormData.Hyperactivity}
                            onChange={(updatedValues) => handleCheckboxChange('Hyperactivity', updatedValues)}
                        />
                        <CheckboxGroup
                            label=""
                            name="Epilepsy"
                            options={[
                                { label: 'Epilepsy', value: 'Epilepsy' },
                            ]}
                            selectedValues={localFormData.Epilepsy}
                            onChange={(updatedValues) => handleCheckboxChange('Epilepsy', updatedValues)}
                        />
                        <CheckboxGroup
                            label=""
                            name="No Illnesses"
                            options={[
                                { label: 'No Illnesses', value: 'NoIllnesses' },
                            ]}
                            selectedValues={localFormData.NoIllnesses}
                            onChange={(updatedValues) => handleCheckboxChange('NoIllnesses', updatedValues)}
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

export default FamilyHistory;
