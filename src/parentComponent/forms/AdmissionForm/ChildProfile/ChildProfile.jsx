import { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Check, Clock } from 'lucide-react';
import ChildProfileDetails from './ChildProfileDetails';
import Nutrition from './Nutrition';
import ToiletLearning from './ToiletLearning';
import MedicalGeneral from './MedicalGeneral';
import Parent_Argeement from './Parent_Argeement';

export default function ChildProfileForm({ initialFormData = null }) {
    const [formData, setFormData] = useState({
        familyMembers: '',
        traditions: '',
        hasChildcareExperience: '',
        interests: '',
        dropOffTime: '',
        pickUpTime: '',
        hasSpecialDiet: '',
        specialDietExplanation: '',
        eatsOnOwn: '',
        eatsOnOwnExplanation: '',
        favoriteFoods: ''
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
                formData={formData}
                handleInputChange={handleInputChange}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
            />

            {/* Nutrition Section */}
            <Nutrition className='border mt-px'
                formData={formData}
                handleInputChange={handleInputChange}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
            />

            {/* Rest and Diapering/Toilet Learning Section */}
            <ToiletLearning className='border mt-px'
                formData={formData}
                handleInputChange={handleInputChange}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
            />




            {/* Medical/General Section */}


            <MedicalGeneral className='border mt-px'
                formData={formData}
                handleInputChange={handleInputChange}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
            />


            {/* {/* Medical/General Section */}

            <Parent_Argeement className='border mt-px'
                formData={formData}
                handleInputChange={handleInputChange}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
            />


        </div>
        </>
    );
}