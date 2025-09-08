import React, { useState, useEffect } from 'react';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Save, Home } from 'lucide-react';
import { toast } from 'sonner';
import { FormInput } from './InputComponent';
import { api_base_url, school_id } from '@/utils/const';
import { useAuth0 } from '@auth0/auth0-react';
import { getAuthHeaders } from '@/utils/auth';

const EnvironmentalFactors = ({ openSection, setOpenSection, formData, handleInputChange, initialFormData, childId }) => {
    const [localFormData, setLocalFormData] = useState({
        HowManyTimesHaveYouMovedInTheLastFiveYears: '',
        EducationalToysGamesBooksUsedAtHome: '',
        HowManyHoursOfTelevisionDaily: '',
        LanguageUsedInTheHome: '',
        HaveThereBeenAnyChangesInTheHomeSituationRecently: '',
        WhatAreYourEducationalExpectationsOfYourChild: ''
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
                HowManyTimesHaveYouMovedInTheLastFiveYears: initialFormData.last_five_years_moved || '',
                EducationalToysGamesBooksUsedAtHome: initialFormData.things_used_at_home || '',
                HowManyHoursOfTelevisionDaily: initialFormData.hours_of_television_daily || '',
                LanguageUsedInTheHome: initialFormData.language_used_at_home || '',
                HaveThereBeenAnyChangesInTheHomeSituationRecently: initialFormData.changes_at_home_situation || '',
                WhatAreYourEducationalExpectationsOfYourChild: initialFormData.educational_expectations_of_child || ''
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
            localFormData.HowManyTimesHaveYouMovedInTheLastFiveYears,
            localFormData.EducationalToysGamesBooksUsedAtHome,
            localFormData.HowManyHoursOfTelevisionDaily,
            localFormData.LanguageUsedInTheHome,
            localFormData.HaveThereBeenAnyChangesInTheHomeSituationRecently,
            localFormData.WhatAreYourEducationalExpectationsOfYourChild
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
                last_five_years_moved: localFormData.HowManyTimesHaveYouMovedInTheLastFiveYears,
                things_used_at_home: localFormData.EducationalToysGamesBooksUsedAtHome,
                hours_of_television_daily: localFormData.HowManyHoursOfTelevisionDaily,
                language_used_at_home: localFormData.LanguageUsedInTheHome,
                changes_at_home_situation: localFormData.HaveThereBeenAnyChangesInTheHomeSituationRecently,
                educational_expectations_of_child: localFormData.WhatAreYourEducationalExpectationsOfYourChild
            };
            console.log(saveData);
            await updateAdmissionData(saveData);
            toast.success('Environmental factors data saved successfully!');
        } catch (error) {
            console.error('Failed to save Environmental factors data:', error);
            toast.error('Error saving Environmental factors data. Please try again.');
        }
    };
    return (
        <AccordionItem value="EnvironmentalFactors">
            <AccordionTrigger className="px-6 py-4 hover:bg-[#0F2D52] hover:text-white data-[state=open]:bg-[#0F2D52] data-[state=open]:text-white">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3">
                        <Home className="h-5 w-5" />
                        <span className="text-lg font-semibold">Environmental Factors</span>
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
                    <div className="grid md:grid-cols-1 gap-6">
                        <FormInput
                            label="How many times have you moved in the last five years?"
                            value={localFormData.HowManyTimesHaveYouMovedInTheLastFiveYears}
                            onChange={handleChange}
                            name="HowManyTimesHaveYouMovedInTheLastFiveYears"
                        />
                        <FormInput
                            label="Educational toys, games, books used at home?"
                            value={localFormData.EducationalToysGamesBooksUsedAtHome}
                            onChange={handleChange}
                            name="EducationalToysGamesBooksUsedAtHome"
                        />
                        <FormInput
                            label="How many hours of television daily?"
                            value={localFormData.HowManyHoursOfTelevisionDaily}
                            onChange={handleChange}
                            name="HowManyHoursOfTelevisionDaily"
                        />
                        <FormInput
                            label="Language used in the home?"
                            value={localFormData.LanguageUsedInTheHome}
                            onChange={handleChange}
                            name="LanguageUsedInTheHome"
                        />
                        <FormInput
                            label="Have there been any changes in the home situation recently, i.e. addition/loss/death/divorce."
                            value={localFormData.HaveThereBeenAnyChangesInTheHomeSituationRecently}
                            onChange={handleChange}
                            name="HaveThereBeenAnyChangesInTheHomeSituationRecently"
                        />
                        <FormInput
                            label="What are your educational expectations of your child?"
                            value={localFormData.WhatAreYourEducationalExpectationsOfYourChild}
                            onChange={handleChange}
                            name="WhatAreYourEducationalExpectationsOfYourChild"
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

export default EnvironmentalFactors;
