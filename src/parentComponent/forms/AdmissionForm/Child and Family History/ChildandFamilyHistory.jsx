import React, { useState } from 'react';


import Child_history from './Child_history';
import ParentAgreement from './Parent_argeement_history';
import PregnancyAndInfantHistory from './PregnancyAndInfantHistory';
import FamilyHistory from './FamilyHistory';
import SocialBehavior from './SocialBehavior';
import EnvironmentalFactors from './EnvironmentalFactors';


const ChildandFamilyHistory = () => {

    const [formData, setFormData] = useState({
        // General Info
        DateOfLastPhysicalExam: '2023-12-10',
        DateOfLastDentalExam: '2024-03-15',
        HowManyTimesHaveYouMovedInTheLastFiveYears: '2',
        EducationalToysGamesBooksUsedAtHome: 'Storybooks, puzzles, building blocks',
        HowManyHoursOfTelevisionDaily: '1-2',
        LanguageUsedInTheHome: 'Tamil, English',
        HaveThereBeenAnyChangesInTheHomeSituationRecently: 'Yes, recently moved house',
        WhatAreYourEducationalExpectationsOfYourChild: 'Complete higher education and become independent',

        // Parent Agreement / Medical History
        AllergiesFoodDrug: 'Peanuts, Penicillin',
        Asthma: 'Mild, under control',
        BleedingProblems: 'No',
        Diabetes: 'No family history',
        Epilepsy: 'None',
        FrequentEarInfections: 'Occasionally during winters',
        FrequentIllnesses: 'Cold and cough every season change',
        HearingProblems: 'Normal',
        HighFevers: 'Rare',
        Hospitialization: 'Admitted once for dehydration',
        RheumaticFever: 'No',
        SeizuresConvulsions: 'No',
        SeriousInjuriesAccidents: 'Minor fracture at age 3',
        Surgeries: 'Tonsil removal at age 5',
        VisionProblems: 'Wears glasses for reading',
        Other: 'None',

        // Additional legacy fields (if used elsewhere)
        allergies: 'Dust allergy',
        HeartProblems: 'No known issues',
        Tuberculosis: 'No',
        Hyperactivity: 'Sometimes overly active',
        NoIllnesses: 'No major illnesses',

        // Pregnancy And Infant History
        IllnessDuringPregnancy: 'Gestational diabetes',
        ConditionOfNewborn: 'Healthy, cried immediately',
        DurationOfPregnancy: '38 weeks',
        BirthWeight: '3.2 kg',
        Complications: 'Mild labor complications',
        BottleFed: 'yes',
        BreastFed: 'yes',

        // Other Siblings
        Name: 'Sanjay',
        Age: '10',

        // Social Behavior fields
        AgeGroupOfFriends: 'Same age group',
        NeighborhoodFriends: 'Plays with nearby kids every evening',
        RelationshipWithMother: 'Very close',
        RelationshipWithFather: 'Good, respectful',
        RelationshipWithSiblings: 'Friendly, sometimes fights',
        RelationshipWithExtendedFamily: 'Visits grandparents regularly',
        FearsAndConflicts: 'Scared of dark and loud noises',
        ChildsResponseToFrustration: 'Cries or withdraws silently',
        FavoriteActivities: 'Drawing, playing football, watching cartoons',
    });



    const [openSection, setOpenSection] = useState('childDetails');

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };



    return (
        <div className="max-w-4xl mx-auto p-4 bg-white ">

            <h1 className='text-center bg-slate-700 my-10 py-3 text-3xl text-white'>Child and Family History</h1>

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">

                {/* Child Details Section */}
                <div className='border-b'>
                    <Child_history
                        openSection={openSection}
                        setOpenSection={setOpenSection}
                        formData={formData}
                        handleInputChange={handleInputChange}
                    />
                </div>

                <div className='border-b'>
                    <ParentAgreement
                        openSection={openSection}
                        setOpenSection={setOpenSection}
                        formData={formData}
                        handleInputChange={handleInputChange}
                    />
                </div>

                <div className='border-b'>
                    <PregnancyAndInfantHistory
                        openSection={openSection}
                        setOpenSection={setOpenSection}
                        formData={formData}
                        handleInputChange={handleInputChange} />
                </div>

                <div className='border-b'>
                    <FamilyHistory
                        openSection={openSection}
                        setOpenSection={setOpenSection}
                        formData={formData}
                        handleInputChange={handleInputChange} />
                </div>

                <div className='border-b'>
                    <SocialBehavior
                        openSection={openSection}
                        setOpenSection={setOpenSection}
                        formData={formData}
                        handleInputChange={handleInputChange} />
                </div>

                <div>
                    <EnvironmentalFactors
                        openSection={openSection}
                        setOpenSection={setOpenSection}
                        formData={formData}
                        handleInputChange={handleInputChange} />
                </div>
            </div>
        </div>
    );
};

export default ChildandFamilyHistory;