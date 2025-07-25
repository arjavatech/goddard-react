import React, { useState, useEffect } from 'react';
import { FormInput } from './InputComponent';
import { UpIcon, DownIcon } from './Arrows';



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
            alert('Error: Child ID is missing');
            return;
        }

        try {
            const saveData = {
                child_id: childId,
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
            alert('Social behavior data saved successfully!');
        } catch (error) {
            console.error('Failed to save Social behavior data:', error);
            alert('Error saving Social behavior data. Please try again.');
        }
    };
    return (
        <>
            <div
                className={`px-6 py-4 flex items-center justify-between cursor-pointer transition-colors ${openSection === 'SocialBehavior' ? 'text-white' : 'text-slate-700'
                    }`}
                style={
                    openSection === 'SocialBehavior'
                        ? { backgroundColor: '#0F2D52', color: 'white' }
                        : { backgroundColor: '#DBEAFE' }
                }
                onClick={() =>
                    setOpenSection(openSection === 'SocialBehavior' ? '' : 'SocialBehavior')
                }
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#0F2D52';
                     e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                    if (openSection !== 'SocialBehavior') {
                        e.currentTarget.style.backgroundColor = '#DBEAFE';
                        e.currentTarget.style.color = '#374151'; // Tailwind's text-slate-700
                    }
                }}
            >
                <div className="flex items-center space-x-3">
                    <span className="text-lg font-semibold">Social Behavior</span>
                    <img 
                        src={isFormComplete() ? "/image/tick.png" : "/image/circle-with.png"} 
                        alt={isFormComplete() ? "Complete" : "Incomplete"} 
                        className="w-5 h-5"
                    />
                </div>
                <div className="text-xl transform transition-transform duration-200">
                    {openSection === 'SocialBehavior' ? (
                        <UpIcon className="h-5 w-5 text-white" />
                    ) : (
                        <DownIcon className="h-5 w-5 text-gray-500" />
                    )}
                </div>
            </div>


            {openSection === 'SocialBehavior' && (
                <div className="p-6 space-y-6" style={{ border: '1px solid #314158' }} onClick={(e) => e.stopPropagation()}>
                    <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">

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
                                label="Child’s response to frustration"
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
                        <button 
                            onClick={handleSave}
                            className="hover:bg-slate-700 text-white px-8 py-3 rounded-md bg-slate-800 transition-colors"
                        >
                            Save
                        </button>
                    </div>


                </div>
            )}
        </>
    );
};

export default SocialBehavior;
