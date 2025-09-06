import { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Check, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast, Toaster } from 'sonner';
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

    // Calculate progress
    const completedSections = [
        Object.keys(expandedSections).some(key => expandedSections[key])
    ].filter(Boolean).length;
    
    const totalSections = 5;
    const progress = (completedSections / totalSections) * 100;

    return (
        <div className="space-y-6">
            <Toaster richColors position="top-center" />
            {/* Header Section */}
            <Card>
                <CardHeader className="bg-[#0F2D52] text-white">
                    <CardTitle className="text-2xl flex items-center gap-3">
                        <Check className="h-6 w-6" />
                        Child Profile
                    </CardTitle>
                    <CardDescription className="text-blue-100">
                        Complete your child's profile information for enrollment
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-600">Progress</div>
                            <div className="text-sm font-medium text-[#0F2D52]">
                                {completedSections} of {totalSections} sections started
                            </div>
                        </div>
                        <Badge variant={progress === 100 ? "default" : "secondary"}>
                            {progress.toFixed(0)}% Started
                        </Badge>
                    </div>
                    <Progress value={progress} className="mb-4" />
                </CardContent>
            </Card>

            {/* Form Sections */}
            <div className="space-y-1">
                {/* Child Profile Details Section */}
                <ChildProfileDetails 
                    initialFormData={initialFormData}
                    handleInputChange={handleInputChange}
                    expandedSections={expandedSections}
                    toggleSection={toggleSection}
                    childId={childId}
                />

                {/* Nutrition Section */}
                <Nutrition 
                    initialFormData={initialFormData}
                    handleInputChange={handleInputChange}
                    expandedSections={expandedSections}
                    toggleSection={toggleSection}
                    childId={childId}
                />

                {/* Rest and Diapering/Toilet Learning Section */}
                <ToiletLearning 
                    initialFormData={initialFormData}
                    handleInputChange={handleInputChange}
                    expandedSections={expandedSections}
                    toggleSection={toggleSection}
                    childId={childId}
                />

                {/* Medical/General Section */}
                <MedicalGeneral 
                    initialFormData={initialFormData}
                    handleInputChange={handleInputChange}
                    expandedSections={expandedSections}
                    toggleSection={toggleSection}
                    childId={childId}
                />

                {/* Parent Agreement Section */}
                <Parent_Argeement 
                    initialFormData={initialFormData}
                    handleInputChange={handleInputChange}
                    expandedSections={expandedSections}
                    toggleSection={toggleSection}
                    childId={childId}
                />
            </div>
        </div>
    );
}