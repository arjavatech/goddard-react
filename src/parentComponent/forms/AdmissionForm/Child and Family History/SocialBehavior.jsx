import React, { useState, useEffect } from 'react';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Save, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { FormInput } from './InputComponent';
import { api_base_url, school_id } from '@/utils/const';
import { useAuth0 } from '@auth0/auth0-react';
import { getAuthHeaders } from '@/utils/auth';


const SocialBehavior = ({ openSection, setOpenSection, formData, handleInputChange, initialFormData, childId }) => {
    const [localFormData, setLocalFormData] = useState({
        AgeGroupOfFriends: '',
        NeighborhoodFriends: '',
        RelationshipWithMother: '',
        RelationshipWithFather: '',
        RelationshipWithSiblings: '',
        RelationshipWithExtendedFamily: '',
        FearsAndConflicts: '',
        ChildsResponseToFrustration: '',
        FavoriteActivities: ''
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
                AgeGroupOfFriends: initialFormData.age_group_friends || '',
                NeighborhoodFriends: initialFormData.neighborhood_friends || '',
                RelationshipWithMother: initialFormData.relationship_with_mother || '',
                RelationshipWithFather: initialFormData.relationship_with_father || '',
                RelationshipWithSiblings: initialFormData.relationship_with_siblings || '',
                RelationshipWithExtendedFamily: initialFormData.relationship_with_extended_family || '',
                FearsAndConflicts: initialFormData.fears_conflicts || '',
                ChildsResponseToFrustration: initialFormData.child_response_frustration || '',
                FavoriteActivities: initialFormData.favorite_activities || ''
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
            localFormData.AgeGroupOfFriends,
            localFormData.NeighborhoodFriends,
            localFormData.RelationshipWithMother,
            localFormData.RelationshipWithFather,
            localFormData.RelationshipWithSiblings,
            localFormData.RelationshipWithExtendedFamily,
            localFormData.FearsAndConflicts,
            localFormData.ChildsResponseToFrustration,
            localFormData.FavoriteActivities
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
                age_group_friends: localFormData.AgeGroupOfFriends,
                neighborhood_friends: localFormData.NeighborhoodFriends,
                relationship_with_mother: localFormData.RelationshipWithMother,
                relationship_with_father: localFormData.RelationshipWithFather,
                relationship_with_siblings: localFormData.RelationshipWithSiblings,
                relationship_with_extended_family: localFormData.RelationshipWithExtendedFamily,
                fears_conflicts: localFormData.FearsAndConflicts,
                child_response_frustration: localFormData.ChildsResponseToFrustration,
                favorite_activities: localFormData.FavoriteActivities
            };
            console.log(saveData);
            await updateAdmissionData(saveData);
            toast.success('Social behavior data saved successfully!');
        } catch (error) {
            console.error('Failed to save Social behavior data:', error);
            toast.error('Error saving Social behavior data. Please try again.');
        }
    };
    return (
        <AccordionItem value="SocialBehavior">
            <AccordionTrigger className="px-6 py-4 hover:bg-[#0F2D52] hover:text-white data-[state=open]:bg-[#0F2D52] data-[state=open]:text-white">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3">
                        <UserCheck className="h-5 w-5" />
                        <span className="text-lg font-semibold">Social Behavior</span>
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
                            label="Age group of friends"
                            value={localFormData.AgeGroupOfFriends}
                            onChange={handleChange}
                            name="AgeGroupOfFriends"
                        />
                        <FormInput
                            label="Neighborhood friends"
                            value={localFormData.NeighborhoodFriends}
                            onChange={handleChange}
                            name="NeighborhoodFriends"
                        />
                        <FormInput
                            label="Relationship with mother"
                            value={localFormData.RelationshipWithMother}
                            onChange={handleChange}
                            name="RelationshipWithMother"
                        />
                        <FormInput
                            label="Relationship with father"
                            value={localFormData.RelationshipWithFather}
                            onChange={handleChange}
                            name="RelationshipWithFather"
                        />
                        <FormInput
                            label="Relationship with siblings"
                            value={localFormData.RelationshipWithSiblings}
                            onChange={handleChange}
                            name="RelationshipWithSiblings"
                        />
                        <FormInput
                            label="Relationship with extended family"
                            value={localFormData.RelationshipWithExtendedFamily}
                            onChange={handleChange}
                            name="RelationshipWithExtendedFamily"
                        />
                        <FormInput
                            label="Fears and Conflicts"
                            value={localFormData.FearsAndConflicts}
                            onChange={handleChange}
                            name="FearsAndConflicts"
                        />
                        <FormInput
                            label="Child's response to frustration"
                            value={localFormData.ChildsResponseToFrustration}
                            onChange={handleChange}
                            name="ChildsResponseToFrustration"
                        />
                    </div>
                    
                    <FormInput
                        label="Favorite activities"
                        value={localFormData.FavoriteActivities}
                        onChange={handleChange}
                        name="FavoriteActivities"
                    />
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

export default SocialBehavior;
