import React, { useState, useEffect } from 'react';

import Child_history from './Child_history';
import ParentAgreement from './Parent_argeement_history';
import PregnancyAndInfantHistory from './PregnancyAndInfantHistory';
import FamilyHistory from './FamilyHistory';
import SocialBehavior from './SocialBehavior';
import EnvironmentalFactors from './EnvironmentalFactors';
import Parent_Agreement from './Parent_Agreement'


const ChildandFamilyHistory = ({ initialFormData = null, childId = null }) => {

    // API function to update admission form data
    const updateAdmissionData = async (fieldData) => {
        if (!childId) {
            console.error('Child ID is required for API update');
            return;
        }

        try {
            const response = await fetch(`https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/admission_form/update/${childId}`, {
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
        // General Info
        DateOfLastPhysicalExam: '',
        DateOfLastDentalExam: '',
        HowManyTimesHaveYouMovedInTheLastFiveYears: '',
        EducationalToysGamesBooksUsedAtHome: '',
        HowManyHoursOfTelevisionDaily: '',
        LanguageUsedInTheHome: '',
        HaveThereBeenAnyChangesInTheHomeSituationRecently: '',
        WhatAreYourEducationalExpectationsOfYourChild: '',

        // Parent Agreement / Medical History
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
        Other: '',

        // Additional legacy fields (if used elsewhere)
        allergies: '',
        HeartProblems: '',
        Tuberculosis: '',
        Hyperactivity: '',
        NoIllnesses: '',

        // Pregnancy And Infant History
        IllnessDuringPregnancy: '',
        ConditionOfNewborn: '',
        DurationOfPregnancy: '',
        BirthWeight: '',
        Complications: '',
        BottleFed: '',
        BreastFed: '',

        // Other Siblings
        Name: '',
        Age: '',

        // Social Behavior fields
        AgeGroupOfFriends: '',
        NeighborhoodFriends: '',
        RelationshipWithMother: '',
        RelationshipWithFather: '',
        RelationshipWithSiblings: '',
        RelationshipWithExtendedFamily: '',
        FearsAndConflicts: '',
        ChildsResponseToFrustration: '',
        FavoriteActivities: '',
    });



    const [openSection, setOpenSection] = useState('childDetails');

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!childId) {
            alert('Error: Child ID is missing');
            return;
        }

        try {
            // Map form data back to API field names
            const saveData = {
                child_id: childId,
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
            alert('Child and Family History saved successfully!');
        } catch (error) {
            console.error('Failed to save child and family history:', error);
            alert('Error saving child and family history. Please try again.');
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



    return (
        <>
        <h1 className='text-center my-5 py-3 text-3xl text-white headerstyle' style={{ backgroundColor: '#0F2D52' }}>Child and Family History</h1>

            <div className="mx-auto p-4 bg-white ">


                <div className="bg-white shadow-sm border overflow-hidden">

                    {/* Child Details Section */}
                    <div className='border'>
                        <Child_history
                            openSection={openSection}
                            setOpenSection={setOpenSection}
                            formData={formData}
                            handleInputChange={handleInputChange}
                        />
                    </div>

                    <div className='border mt-px'>
                        <ParentAgreement
                            openSection={openSection}
                            setOpenSection={setOpenSection}
                            formData={formData}
                            handleInputChange={handleInputChange}
                        />
                    </div>

                    <div className='border mt-px'>
                        <PregnancyAndInfantHistory
                            openSection={openSection}
                            setOpenSection={setOpenSection}
                            formData={formData}
                            handleInputChange={handleInputChange} />
                    </div>

                    <div className='border mt-px'>
                        <FamilyHistory
                            openSection={openSection}
                            setOpenSection={setOpenSection}
                            formData={formData}
                            handleInputChange={handleInputChange} />
                    </div>

                    <div className='border mt-px'>
                        <SocialBehavior
                            openSection={openSection}
                            setOpenSection={setOpenSection}
                            formData={formData}
                            handleInputChange={handleInputChange} />
                    </div>

                    <div className='border mt-px'>
                        <EnvironmentalFactors
                            openSection={openSection}
                            setOpenSection={setOpenSection}
                            formData={formData}
                            handleInputChange={handleInputChange} />
                    </div>

                    <div className='border mt-px'>
                        <Parent_Agreement
                            openSection={openSection}
                            setOpenSection={setOpenSection}
                            formData={formData}
                            handleInputChange={handleInputChange} />
                    </div>
                </div>

                {/* Save Button */}
                <div className="text-center mt-6 mb-4">
                    <button 
                        className="bg-[#0F2D52] hover:bg-[#093567] text-white font-semibold px-8 py-2 rounded"
                        onClick={handleSave}
                    >
                        Save Child and Family History
                    </button>
                </div>
            </div>
        </>
    );
};

export default ChildandFamilyHistory;