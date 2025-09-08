import React, { useState, useEffect } from 'react';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Save, Baby } from 'lucide-react';
import { toast } from 'sonner';
import { FormInput, RadioGroup } from './InputComponent';
import { api_base_url, school_id } from '@/utils/const';
import { useAuth0 } from '@auth0/auth0-react';
import { getAuthHeaders } from '@/utils/auth';

const PregnancyAndInfantHistory = ({ openSection, setOpenSection, formData, handleInputChange, initialFormData, childId }) => {
    const [localFormData, setLocalFormData] = useState({
        IllnessDuringPregnancy: '',
        ConditionOfNewborn: '',
        DurationOfPregnancy: '',
        BirthWeight: '',
        Complications: '',
        BottleFed: '',
        BreastFed: '',
        Name: '',
        Age: ''
    });

    const { getAccessTokenSilently } = useAuth0();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocalFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleRadioChange = (e) => {
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
                IllnessDuringPregnancy: initialFormData.illness_during_pregnancy || '',
                ConditionOfNewborn: initialFormData.condition_of_newborn || '',
                DurationOfPregnancy: initialFormData.duration_of_pregnancy || '',
                BirthWeight: `${initialFormData.birth_weight_lbs || ''} lbs ${initialFormData.birth_weight_oz || ''} oz`,
                Complications: initialFormData.complications || '',
                BottleFed: initialFormData.bottle_fed === 1 ? 'yes' : (initialFormData.bottle_fed === 2 ? 'no' : ''),
                BreastFed: initialFormData.breast_fed === 1 ? 'yes' : (initialFormData.breast_fed === 2 ? 'no' : ''),
                Name: initialFormData.other_siblings_name || '',
                Age: initialFormData.other_siblings_age || ''
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
        const requiredFields = [
            localFormData.IllnessDuringPregnancy,
            localFormData.ConditionOfNewborn,
            localFormData.DurationOfPregnancy,
            localFormData.BirthWeight,
            localFormData.Complications,
            localFormData.BottleFed,
            localFormData.BreastFed
        ];
        return requiredFields.some(field => field && field.trim() !== '');
    };

    const handleSave = async () => {
        if (!childId) {
            toast.error('Error: Child ID is missing');
            return;
        }

        try {
            // Parse birth weight
            const birthWeightMatch = localFormData.BirthWeight.match(/(\d+)?\s*lbs?\s*(\d+)?\s*oz?/i);
            const lbs = birthWeightMatch?.[1] || '';
            const oz = birthWeightMatch?.[2] || '';

            const saveData = {
                child_id: childId,
                school_id: school_id,
                illness_during_pregnancy: localFormData.IllnessDuringPregnancy,
                condition_of_newborn: localFormData.ConditionOfNewborn,
                duration_of_pregnancy: localFormData.DurationOfPregnancy,
                birth_weight_lbs: lbs,
                birth_weight_oz: oz,
                complications: localFormData.Complications,
                bottle_fed: localFormData.BottleFed === 'yes' ? 1 : (localFormData.BottleFed === 'no' ? 2 : 2),
                breast_fed: localFormData.BreastFed === 'yes' ? 1 : (localFormData.BreastFed === 'no' ? 2 : 2),
                other_siblings_name: localFormData.Name,
                other_siblings_age: localFormData.Age
            };
            console.log(saveData);
            await updateAdmissionData(saveData);
            toast.success('Pregnancy and infant history data saved successfully!');
        } catch (error) {
            console.error('Failed to save Pregnancy and infant history data:', error);
            toast.error('Error saving Pregnancy and infant history data. Please try again.');
        }
    };
    return (
        <AccordionItem value="PregnancyAndInfantHistory">
            <AccordionTrigger className="px-6 py-4 hover:bg-[#0F2D52] hover:text-white data-[state=open]:bg-[#0F2D52] data-[state=open]:text-white">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3">
                        <Baby className="h-5 w-5" />
                        <span className="text-lg font-semibold">Pregnancy And Infant History</span>
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
                <div className="space-y-6">
                    {/* Pregnancy Information */}
                    <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-6">
                            <FormInput
                                label="Illness during pregnancy"
                                value={localFormData.IllnessDuringPregnancy}
                                onChange={handleChange}
                                name="IllnessDuringPregnancy"
                            />
                            <FormInput
                                label="Condition of Newborn"
                                value={localFormData.ConditionOfNewborn}
                                onChange={handleChange}
                                name="ConditionOfNewborn"
                            />
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-6">
                            <FormInput
                                label="Duration of pregnancy"
                                value={localFormData.DurationOfPregnancy}
                                onChange={handleChange}
                                name="DurationOfPregnancy"
                            />
                            <FormInput
                                label="Birth Weight"
                                value={localFormData.BirthWeight}
                                onChange={handleChange}
                                name="BirthWeight"
                            />
                            <FormInput
                                label="Complications"
                                value={localFormData.Complications}
                                onChange={handleChange}
                                name="Complications"
                            />
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <RadioGroup
                                label="Bottle Fed?"
                                name="BottleFed"
                                selectedValue={localFormData.BottleFed}
                                onChange={handleRadioChange}
                                options={[
                                    { label: 'Yes', value: 'yes' },
                                    { label: 'No', value: 'no' },
                                ]}
                            />
                            <RadioGroup
                                label="Breast Fed?"
                                name="BreastFed"
                                selectedValue={localFormData.BreastFed}
                                onChange={handleRadioChange}
                                options={[
                                    { label: 'Yes', value: 'yes' },
                                    { label: 'No', value: 'no' },
                                ]}
                            />
                        </div>
                    </div>

                    {/* Other Siblings Section */}
                    <div className="space-y-4">
                        <h3 className="text-center text-xl font-semibold text-[#0F2D52]">Other Siblings</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <FormInput
                                label="Name"
                                value={localFormData.Name}
                                onChange={handleChange}
                                name="Name"
                            />
                            <FormInput
                                label="Age"
                                value={localFormData.Age}
                                onChange={handleChange}
                                name="Age"
                            />
                        </div>
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

export default PregnancyAndInfantHistory;
