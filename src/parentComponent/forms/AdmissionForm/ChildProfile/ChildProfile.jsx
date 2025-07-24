import { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Check, Clock } from 'lucide-react';
import ChildProfileDetails from './ChildProfileDetails';
import Nutrition from './Nutrition';
import ToiletLearning from './ToiletLearning';
import MedicalGeneral from './MedicalGeneral';
import Parent_Argeement from './Parent_Argeement';

export default function ChildProfileForm({ initialFormData = null, childId }) {
    const [formData, setFormData] = useState({
        important_fam_members: '',
        about_family_celebrations: '',
        childcare_before: '',
        reason_for_childcare_before: '',
        what_child_interests: '',
        drop_off_time: '',
        pick_up_time: '',
        restricted_diet: '',
        restricted_diet_reason: '',
        eat_own: '',
        eat_own_reason: '',
        favorite_foods: '',
        rest_in_the_middle_day: '',
        reason_for_rest_in_the_middle_day: '',
        rest_routine: '',
        toilet_trained: '',
        reason_for_toilet_trained: '',
        explain_for_existing_illness_allergy: '',
        existing_illness_allergy: '',
        functioning_at_age: '',
        explain_for_functioning_at_age: '',
        explain_for_able_to_walk: '',
        able_to_walk: '',
        explain_for_communicate_their_needs: '',
        communicate_their_needs: '',
        any_medication: '',
        explain_for_any_medication: '',
        utilize_special_equipment: '',
        explain_for_utilize_special_equipment: '',
        significant_periods: '',
        explain_for_significant_periods: '',
        desire_any_accommodations: '',
        explain_for_desire_any_accommodations: '',
        additional_information: '',
        do_you_agree_this: '',
    });

    const [expandedSections, setExpandedSections] = useState({
        profile: true,
        nutrition: false,
        rest: false,
        medical: false,
        parent: false
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => {
            // If the clicked section is already open, close it
            if (prev[section]) {
                return {
                    ...prev,
                    [section]: false
                };
            }
            // Otherwise, close all sections and open the clicked one
            return {
                profile: false,
                nutrition: false,
                rest: false,
                medical: false,
                parent: false,
                [section]: true
            };
        });
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    useEffect(() => {
        if (initialFormData) {
            // Map API data to form fields
            const mappedData = {
                familyMembers: initialFormData.important_fam_members || '',
                traditions: initialFormData.about_family_celebrations || '',
                hasChildcareExperience: initialFormData.childcare_before === 1 ? 'Yes' : (initialFormData.childcare_before === 2 ? 'No' : ''),
                interests: initialFormData.what_child_interests || '',
                dropOffTime: initialFormData.drop_off_time || '',
                pickUpTime: initialFormData.pick_up_time || '',
                hasSpecialDiet: initialFormData.restricted_diet === 1 ? 'Yes' : (initialFormData.restricted_diet === 2 ? 'No' : ''),
                specialDietExplanation: initialFormData.restricted_diet_reason || '',
                eatsOnOwn: initialFormData.eat_own === 1 ? 'Yes' : (initialFormData.eat_own === 2 ? 'No' : ''),
                eatsOnOwnExplanation: initialFormData.eat_own_reason || '',
                favoriteFoods: initialFormData.favorite_foods || ''
            };

            setFormData(prevState => ({
                ...prevState,
                ...mappedData
            }));
        }
    }, [initialFormData]);

    return (
        <>
        <h1 className='text-center my-5 py-3 text-3xl text-white headerstyle' style={{ backgroundColor: '#0F2D52' }}>Child Profile</h1>
        <div className="mx-auto bg-white">


            {/* Child Profile Details Section */}
            <ChildProfileDetails 
                initialFormData={initialFormData}
                handleInputChange={handleInputChange}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
                childId={childId}
            />

            {/* Nutrition Section */}
            <Nutrition className='border mt-px'
                initialFormData={initialFormData}
                handleInputChange={handleInputChange}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
                childId={childId}
            />

            {/* Rest and Diapering/Toilet Learning Section */}
            <ToiletLearning className='border mt-px'
                initialFormData={initialFormData}
                handleInputChange={handleInputChange}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
                childId={childId}
            />




            {/* Medical/General Section */}


            <MedicalGeneral className='border mt-px'
                initialFormData={initialFormData}
                handleInputChange={handleInputChange}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
                childId={childId}
            />


            {/* {/* Medical/General Section */}

            <Parent_Argeement className='border mt-px'
                initialFormData={initialFormData}
                handleInputChange={handleInputChange}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
                childId={childId}
            />


        </div>
        </>
    );
}