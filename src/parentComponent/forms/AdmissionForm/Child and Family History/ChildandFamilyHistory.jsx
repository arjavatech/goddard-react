import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle, AlertCircle, Save, User, FileText } from 'lucide-react';
import { toast, Toaster } from 'sonner';

import Child_history from './Child_history';
import ParentAgreement from './Parent_argeement_history';
import PregnancyAndInfantHistory from './PregnancyAndInfantHistory';
import FamilyHistory from './FamilyHistory';
import SocialBehavior from './SocialBehavior';
import EnvironmentalFactors from './EnvironmentalFactors';
import Parent_Agreement from './Parent_Agreement'
import { api_base_url, school_id } from '@/utils/const';
import { useAuth0 } from '@auth0/auth0-react';
import { getAuthHeaders } from '@/utils/auth';
import { submitAndCompleteForm } from '@/utils/formSubmission';


const ChildandFamilyHistory = ({ initialFormData = null, childId = null }) => {

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

    const [formData, setFormData] = useState({
        physical_exam_last_date: '',
        dental_exam_last_date: '',
        allergies: '',
        asthma: '',
        bleeding_problems: '',
        diabetes: '',
        epilepsy: '',
        frequent_ear_infections: '',
        frequent_illnesses: '',
        hearing_problems: '',
        high_fevers: '',
        hospitalization: '',
        rheumatic_fever: '',
        seizures_convulsions: '',
        serious_injuries_accidents: '',
        surgeries: '',
        vision_problems: '',
        medical_other: '',
        illness_during_pregnancy: '',
        condition_of_newborn: '',
        duration_of_pregnancy: '',
        birth_weight_lbs: '',
        birth_weight_oz: '',
        complications: '',
        bottle_fed: '',
        breast_fed: '',
        other_siblings_name: '',
        other_siblings_age: '',
        family_history_allergies: '',
        family_history_heart_problems: '',
        family_history_tuberculosis: '',
        family_history_asthma: '',
        family_history_high_blood_pressure: '',
        family_history_vision_problems: '',
        family_history_diabetes: '',
        family_history_hyperactivity: '',
        family_history_epilepsy: '',
        no_illnesses_for_this_child: '',
        age_group_friends: '',
        neighborhood_friends: '',
        relationship_with_mother: '',
        relationship_with_father: '',
        relationship_with_siblings: '',
        relationship_with_extended_family: '',
        fears_conflicts: '',
        child_response_frustration: '',
        favorite_activities: '',
        last_five_years_moved: '',
        things_used_at_home: '',
        hours_of_television_daily: '',
        language_used_at_home: '',
        changes_at_home_situation: '',
        educational_expectations_of_child: '',
        fam_his_instructions: '',
        agree_all_above_info_is_correct: ""
    });



    const [openSection, setOpenSection] = useState('childDetails');

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!childId) {
            toast.error('Error: Child ID is missing');
            return;
        }

        try {
            // Map form data back to API field names
            const saveData = {
                child_id: childId,
                school_id: school_id,
                // General Info
                physical_exam_last_date: formData.DateOfLastPhysicalExam,
                dental_exam_last_date: formData.DateOfLastDentalExam,
                last_five_years_moved: formData.HowManyTimesHaveYouMovedInTheLastFiveYears,
                things_used_at_home: formData.EducationalToysGamesBooksUsedAtHome,
                hours_of_television_daily: formData.HowManyHoursOfTelevisionDaily,
                language_used_at_home: formData.LanguageUsedInTheHome,
                changes_at_home_situation: formData.HaveThereBeenAnyChangesInTheHomeSituationRecently,
                educational_expectations_of_child: formData.WhatAreYourEducationalExpectationsOfYourChild,

                // Medical History
                allergies: formData.AllergiesFoodDrug,
                asthma: formData.Asthma,
                bleeding_problems: formData.BleedingProblems,
                diabetes: formData.Diabetes,
                epilepsy: formData.Epilepsy,
                frequent_ear_infections: formData.FrequentEarInfections,
                frequent_illnesses: formData.FrequentIllnesses,
                hearing_problems: formData.HearingProblems,
                high_fevers: formData.HighFevers,
                hospitalization: formData.Hospitialization,
                rheumatic_fever: formData.RheumaticFever,
                seizures_convulsions: formData.SeizuresConvulsions,
                serious_injuries_accidents: formData.SeriousInjuriesAccidents,
                surgeries: formData.Surgeries,
                vision_problems: formData.VisionProblems,
                medical_other: formData.Other,

                // Family History
                family_history_heart_problems: formData.HeartProblems,
                family_history_tuberculosis: formData.Tuberculosis,
                family_history_hyperactivity: formData.Hyperactivity,
                no_illnesses_for_this_child: formData.NoIllnesses,

                // Pregnancy And Infant History
                illness_during_pregnancy: formData.IllnessDuringPregnancy,
                condition_of_newborn: formData.ConditionOfNewborn,
                duration_of_pregnancy: formData.DurationOfPregnancy,
                birth_weight: formData.BirthWeight,
                complications: formData.Complications,
                bottle_fed: formData.BottleFed,
                breast_fed: formData.BreastFed,

                // Social Behavior
                age_group_of_friends: formData.AgeGroupOfFriends,
                neighborhood_friends: formData.NeighborhoodFriends,
                relationship_with_mother: formData.RelationshipWithMother,
                relationship_with_father: formData.RelationshipWithFather,
                relationship_with_siblings: formData.RelationshipWithSiblings,
                relationship_with_extended_family: formData.RelationshipWithExtendedFamily,
                fears_and_conflicts: formData.FearsAndConflicts,
                childs_response_to_frustration: formData.ChildsResponseToFrustration,
                favorite_activities: formData.FavoriteActivities
            };

            await updateAdmissionData(saveData);
            toast.success('Child and Family History saved successfully!');
        } catch (error) {
            console.error('Failed to save child and family history:', error);
            toast.error('Error saving child and family history. Please try again.');
        }
    };

    useEffect(() => {
        if (initialFormData) {
            // Map API data to form fields
            const mappedData = {
                // General Info
                DateOfLastPhysicalExam: initialFormData.physical_exam_last_date || '',
                DateOfLastDentalExam: initialFormData.dental_exam_last_date || '',
                HowManyTimesHaveYouMovedInTheLastFiveYears: initialFormData.last_five_years_moved || '',
                EducationalToysGamesBooksUsedAtHome: initialFormData.things_used_at_home || '',
                HowManyHoursOfTelevisionDaily: initialFormData.hours_of_television_daily || '',
                LanguageUsedInTheHome: initialFormData.language_used_at_home || '',
                HaveThereBeenAnyChangesInTheHomeSituationRecently: initialFormData.changes_at_home_situation || '',
                WhatAreYourEducationalExpectationsOfYourChild: initialFormData.educational_expectations_of_child || '',

                // Medical History
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
                Other: initialFormData.medical_other || '',

                // Family History
                HeartProblems: initialFormData.family_history_heart_problems || '',
                Tuberculosis: initialFormData.family_history_tuberculosis || '',
                Hyperactivity: initialFormData.family_history_hyperactivity || '',
                NoIllnesses: initialFormData.no_illnesses_for_this_child || '',

                // Pregnancy And Infant History
                IllnessDuringPregnancy: initialFormData.illness_during_pregnancy || '',
                ConditionOfNewborn: initialFormData.condition_of_newborn || '',
                DurationOfPregnancy: initialFormData.duration_of_pregnancy || '',
                BirthWeight: `${initialFormData.birth_weight_lbs || ''} lbs ${initialFormData.birth_weight_oz || ''} oz`,
                Complications: initialFormData.complications || '',
                BottleFed: initialFormData.bottle_fed === 1 ? 'yes' : (initialFormData.bottle_fed === 2 ? 'no' : ''),
                BreastFed: initialFormData.breast_fed === 1 ? 'yes' : (initialFormData.breast_fed === 2 ? 'no' : ''),

                // Siblings
                Name: initialFormData.other_siblings_name || '',
                Age: initialFormData.other_siblings_age || '',

                // Social Behavior
                AgeGroupOfFriends: initialFormData.age_group_friends || '',
                NeighborhoodFriends: initialFormData.neighborhood_friends || '',
                RelationshipWithMother: initialFormData.relationship_with_mother || '',
                RelationshipWithFather: initialFormData.relationship_with_father || '',
                RelationshipWithSiblings: initialFormData.relationship_with_siblings || '',
                RelationshipWithExtendedFamily: initialFormData.relationship_with_extended_family || '',
                FearsAndConflicts: initialFormData.fears_conflicts || '',
                ChildsResponseToFrustration: initialFormData.child_response_frustration || '',
                FavoriteActivities: initialFormData.favorite_activities || '',
            };

            setFormData(prevState => ({
                ...prevState,
                ...mappedData
            }));
        }
    }, [initialFormData]);



    // Calculate completion status
    const sections = [
        'childHistory',
        'parentArgeement', 
        'PregnancyAndInfantHistory',
        'FamilyHistory',
        'SocialBehavior',
        'EnvironmentalFactors',
        'ParentAgreement'
    ];
    
    const completedSections = sections.filter(section => {
        // Simple completion check - you can make this more sophisticated
        return openSection === section;
    }).length;
    
    const progress = (completedSections / sections.length) * 100;

    return (
        <div className="space-y-6">
            <Toaster richColors position="top-center" />
            
            {/* Header Section */}
            <Card>
                <CardHeader className="bg-[#0F2D52] text-white">
                    <CardTitle className="text-2xl flex items-center gap-3">
                        <User className="h-6 w-6" />
                        Child and Family History
                    </CardTitle>
                    <CardDescription className="text-blue-100">
                        Complete comprehensive child and family history information
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-600">Progress</div>
                            <div className="text-sm font-medium text-[#0F2D52]">
                                {completedSections} of {sections.length} sections viewed
                            </div>
                        </div>
                        <Badge variant={progress === 100 ? "default" : "secondary"}>
                            {progress.toFixed(0)}% Viewed
                        </Badge>
                    </div>
                    <Progress value={progress} className="mb-4" />
                </CardContent>
            </Card>

            {/* Form Sections */}
            <Card>
                <CardContent className="p-0">
                    <Accordion type="single" collapsible value={openSection} onValueChange={setOpenSection}>

                        <Child_history
                            openSection={openSection}
                            setOpenSection={setOpenSection}
                            formData={formData}
                            handleInputChange={handleInputChange}
                            initialFormData={initialFormData}
                            childId={childId}
                        />

                        <ParentAgreement
                            openSection={openSection}
                            setOpenSection={setOpenSection}
                            formData={formData}
                            handleInputChange={handleInputChange}
                            initialFormData={initialFormData}
                            childId={childId}
                        />

                        <PregnancyAndInfantHistory
                            openSection={openSection}
                            setOpenSection={setOpenSection}
                            formData={formData}
                            handleInputChange={handleInputChange}
                            initialFormData={initialFormData}
                            childId={childId}
                        />

                        <FamilyHistory
                            openSection={openSection}
                            setOpenSection={setOpenSection}
                            formData={formData}
                            handleInputChange={handleInputChange}
                            initialFormData={initialFormData}
                            childId={childId}
                        />

                        <SocialBehavior
                            openSection={openSection}
                            setOpenSection={setOpenSection}
                            formData={formData}
                            handleInputChange={handleInputChange}
                            initialFormData={initialFormData}
                            childId={childId}
                        />

                        <EnvironmentalFactors
                            openSection={openSection}
                            setOpenSection={setOpenSection}
                            formData={formData}
                            handleInputChange={handleInputChange}
                            initialFormData={initialFormData}
                            childId={childId}
                        />

                        <Parent_Agreement
                            openSection={openSection}
                            setOpenSection={setOpenSection}
                            formData={formData}
                            handleInputChange={handleInputChange}
                            initialFormData={initialFormData}
                            childId={childId}
                        />
                    </Accordion>
                </CardContent>
            </Card>

            {/* Save Button */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex justify-center">
                        <Button 
                            onClick={handleSave}
                            className="bg-[#0F2D52] hover:bg-[#0F2D52]/90 text-white px-8 py-3"
                            size="lg"
                        >
                            <Save className="h-5 w-5 mr-2" />
                            Save Child and Family History
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ChildandFamilyHistory;