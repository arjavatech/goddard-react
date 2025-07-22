import { useState } from 'react';
import { ChevronUp, ChevronDown, Check, Clock } from 'lucide-react';
import ChildProfileDetails from './ChildProfileDetails';
import Nutrition from './Nutrition';
import ToiletLearning from './ToiletLearning';
import MedicalGeneral from './MedicalGeneral';
import Parent_Argeement from './Parent_Argeement';

export default function ChildProfileForm() {
    const [formData, setFormData] = useState({
        familyMembers: 'sscfg',
        traditions: 'esdrfty',
        hasChildcareExperience: 'Yes',
        interests: 'wserqty',
        dropOffTime: '06:17 PM',
        pickUpTime: '06:19 PM',
        hasSpecialDiet: 'Yes',
        specialDietExplanation: 'fgdfj',
        eatsOnOwn: 'No',
        eatsOnOwnExplanation: 'NA',
        favoriteFoods: 'sdfddf'
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