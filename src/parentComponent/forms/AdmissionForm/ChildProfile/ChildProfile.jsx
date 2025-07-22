import { useState } from 'react';
import { ChevronUp, ChevronDown, Check, Clock } from 'lucide-react';
import ChildProfileDetails from './ChildProfileDetails';
import Nutrition from './Nutrition';
import ToiletLearning from './ToiletLearning';

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
            {/* Header */}
            <div className="headerstyle mb-10 bg-[#0F2D52] text-white text-center py-3 font-semibold text-lg">
                Child Profile
            </div>
            
             <div className="mx-auto bg-white ml-5 mr-5 mb-6">
            {/* Child Profile Details Section */}
            <ChildProfileDetails
                formData={formData}
                handleInputChange={handleInputChange}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
            />

            {/* Nutrition Section */}
            <Nutrition
                formData={formData}
                handleInputChange={handleInputChange}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
            />

            {/* Rest and Diapering/Toilet Learning Section */}
            <ToiletLearning
                formData={formData}
                handleInputChange={handleInputChange}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
            />

            {/* Medical/General Section */}
            <div className="border border-gray-300 border-t-0">
                <div
                    className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${expandedSections.medical
                        ? 'bg-blue-900 text-white hover:bg-blue-800'
                        : 'bg-blue-100 text-gray-700 hover:bg-blue-900 hover:text-white'
                        }`}
                    onClick={() => toggleSection('medical')}
                >
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">Medical/General</span>

                    </div>
                    {expandedSections.medical ? (
                        <ChevronUp className="w-5 h-5" />
                    ) : (
                        <ChevronDown className="w-5 h-5" />
                    )}
                </div>

                {expandedSections.medical && (
                    <div className="p-6 bg-gray-50">
                        <p className="text-gray-600">Medical/General information will be displayed here...</p>
                    </div>
                )}
            </div>

            {/* Parent Agreement Section */}
            <div className="border border-gray-300 border-t-0">
                <div
                    className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${expandedSections.parent
                        ? 'bg-blue-900 text-white hover:bg-blue-800'
                        : 'bg-blue-100 text-gray-700 hover:bg-blue-900 hover:text-white'
                        }`}
                    onClick={() => toggleSection('parent')}
                >
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">Parent Agreement</span>

                    </div>
                    {expandedSections.parent ? (
                        <ChevronUp className="w-5 h-5" />
                    ) : (
                        <ChevronDown className="w-5 h-5" />
                    )}
                </div>

                {expandedSections.parent && (
                    <div className="p-6 bg-gray-50">
                        <p className="text-gray-600">Parent Agreement information will be displayed here...</p>
                    </div>
                )}
            </div>
        </div>
        </>
    );
}