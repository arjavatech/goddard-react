import React, { useState, useEffect } from 'react';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Save, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { FormInput } from './InputComponent';
import { api_base_url, school_id } from '@/utils/const';
import { useAuth0 } from '@auth0/auth0-react';
import { getAuthHeaders } from '@/utils/auth';

const Parent_argeement = ({ openSection, setOpenSection, formData, handleInputChange, initialFormData, childId }) => {
    const [localFormData, setLocalFormData] = useState({
        AllergiesFoodDrug: '',
        Asthma: '',
        BleedingProblems: '',
        Diabetes: '',
        Epilepsy: '',
        FrequentEarInfections: '',
        FrequentIllnesses: '',
        HearingProblems: '',
        HighFevers: '',
        Hospitialization: '',
        RheumaticFever: '',
        SeizuresConvulsions: '',
        SeriousInjuriesAccidents: '',
        Surgeries: '',
        VisionProblems: '',
        Other: ''
    });

    const { getAccessTokenSilently } = useAuth0();

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
                AllergiesFoodDrug: initialFormData.allergies || '',
                Asthma: initialFormData.asthma || '',
                BleedingProblems: initialFormData.bleeding_problems || '',
                Diabetes: initialFormData.diabetes || '',
                Epilepsy: initialFormData.epilepsy || '',
                FrequentEarInfections: initialFormData.frequent_ear_infections || '',
                FrequentIllnesses: initialFormData.frequent_illnesses || '',
                HearingProblems: initialFormData.hearing_problems || '',
                HighFevers: initialFormData.high_fevers || '',
                Hospitialization: initialFormData.hospitalization || '',
                RheumaticFever: initialFormData.rheumatic_fever || '',
                SeizuresConvulsions: initialFormData.seizures_convulsions || '',
                SeriousInjuriesAccidents: initialFormData.serious_injuries_accidents || '',
                Surgeries: initialFormData.surgeries || '',
                VisionProblems: initialFormData.vision_problems || '',
                Other: initialFormData.medical_other || ''
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
            localFormData.AllergiesFoodDrug,
            localFormData.Asthma,
            localFormData.BleedingProblems,
            localFormData.Diabetes,
            localFormData.Epilepsy,
            localFormData.FrequentEarInfections,
            localFormData.FrequentIllnesses,
            localFormData.HearingProblems,
            localFormData.HighFevers,
            localFormData.Hospitialization,
            localFormData.RheumaticFever,
            localFormData.SeizuresConvulsions,
            localFormData.SeriousInjuriesAccidents,
            localFormData.Surgeries,
            localFormData.VisionProblems
        ];
        return requiredFields.some(field => field && field.trim() !== '');
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
                allergies: localFormData.AllergiesFoodDrug,
                asthma: localFormData.Asthma,
                bleeding_problems: localFormData.BleedingProblems,
                diabetes: localFormData.Diabetes,
                epilepsy: localFormData.Epilepsy,
                frequent_ear_infections: localFormData.FrequentEarInfections,
                frequent_illnesses: localFormData.FrequentIllnesses,
                hearing_problems: localFormData.HearingProblems,
                high_fevers: localFormData.HighFevers,
                hospitalization: localFormData.Hospitialization,
                rheumatic_fever: localFormData.RheumaticFever,
                seizures_convulsions: localFormData.SeizuresConvulsions,
                serious_injuries_accidents: localFormData.SeriousInjuriesAccidents,
                surgeries: localFormData.Surgeries,
                vision_problems: localFormData.VisionProblems,
                medical_other: localFormData.Other
            };
            console.log(saveData);
            await updateAdmissionData(saveData);
            toast.success('Medical history data saved successfully!');
        } catch (error) {
            console.error('Failed to save Medical history data:', error);
            toast.error('Error saving Medical history data. Please try again.');
        }
    };
    return (
        <AccordionItem value="parentArgeement">
            <AccordionTrigger className="px-6 py-4 hover:bg-[#0F2D52] hover:text-white data-[state=open]:bg-[#0F2D52] data-[state=open]:text-white">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3">
                        <Heart className="h-5 w-5" />
                        <span className="text-lg font-semibold">Medical History And Illnesses</span>
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
                            label="Allergies (food/drug)"
                            value={localFormData.AllergiesFoodDrug}
                            onChange={handleChange}
                            name="AllergiesFoodDrug"
                        />
                        <FormInput
                            label="Asthma"
                            value={localFormData.Asthma}
                            onChange={handleChange}
                            name="Asthma"
                        />
                        <FormInput
                            label="Bleeding Problems"
                            value={localFormData.BleedingProblems}
                            onChange={handleChange}
                            name="BleedingProblems"
                        />
                        <FormInput
                            label="Diabetes"
                            value={localFormData.Diabetes}
                            onChange={handleChange}
                            name="Diabetes"
                        />
                        <FormInput
                            label="Epilepsy"
                            value={localFormData.Epilepsy}
                            onChange={handleChange}
                            name="Epilepsy"
                        />
                        <FormInput
                            label="Frequent Ear Infections"
                            value={localFormData.FrequentEarInfections}
                            onChange={handleChange}
                            name="FrequentEarInfections"
                        />
                        <FormInput
                            label="Frequent Illnesses"
                            value={localFormData.FrequentIllnesses}
                            onChange={handleChange}
                            name="FrequentIllnesses"
                        />
                        <FormInput
                            label="Hearing Problems"
                            value={localFormData.HearingProblems}
                            onChange={handleChange}
                            name="HearingProblems"
                        />
                        <FormInput
                            label="High Fevers"
                            value={localFormData.HighFevers}
                            onChange={handleChange}
                            name="HighFevers"
                        />
                        <FormInput
                            label="Hospitalization"
                            value={localFormData.Hospitialization}
                            onChange={handleChange}
                            name="Hospitialization"
                        />
                        <FormInput
                            label="Rheumatic Fever"
                            value={localFormData.RheumaticFever}
                            onChange={handleChange}
                            name="RheumaticFever"
                        />
                        <FormInput
                            label="Seizures/Convulsions"
                            value={localFormData.SeizuresConvulsions}
                            onChange={handleChange}
                            name="SeizuresConvulsions"
                        />
                        <FormInput
                            label="Serious Injuries/Accidents"
                            value={localFormData.SeriousInjuriesAccidents}
                            onChange={handleChange}
                            name="SeriousInjuriesAccidents"
                        />
                        <FormInput
                            label="Surgeries"
                            value={localFormData.Surgeries}
                            onChange={handleChange}
                            name="Surgeries"
                        />
                        <FormInput
                            label="Vision Problems"
                            value={localFormData.VisionProblems}
                            onChange={handleChange}
                            name="VisionProblems"
                        />
                        <FormInput
                            label="Other"
                            value={localFormData.Other}
                            onChange={handleChange}
                            name="Other"
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

export default Parent_argeement;
