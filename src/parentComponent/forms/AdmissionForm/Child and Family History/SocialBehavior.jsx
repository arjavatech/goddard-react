import React from 'react';
import { FormInput } from './InputComponent';
import { UpIcon, DownIcon } from './Arrows';



const SocialBehavior = ({ openSection, setOpenSection, formData, handleInputChange }) => {
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
                    <h2 className="text-lg font-semibold">Social Behavior</h2>
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
                                value={formData.AgeGroupOfFriends}
                                onChange={(e) => handleInputChange('AgeGroupOfFriends', e.target.value)}
                                name="AgeGroupOfFriends"
                            />
                            <FormInput
                                label="Neighborhood friends"
                                value={formData.NeighborhoodFriends}
                                onChange={(e) => handleInputChange('NeighborhoodFriends', e.target.value)}
                                name="NeighborhoodFriends"
                            />


                            <FormInput
                                label="Relationship with mother"
                                value={formData.RelationshipWithMother}
                                onChange={(e) => handleInputChange('RelationshipWithMother', e.target.value)}
                                name="RelationshipWithMother"
                            />

                            <FormInput
                                label="Relationship with father"
                                value={formData.RelationshipWithFather}
                                onChange={(e) => handleInputChange('RelationshipWithFather', e.target.value)}
                                name="RelationshipWithFather"
                            />
                            <FormInput
                                label="Relationship with siblings"
                                value={formData.RelationshipWithSiblings}
                                onChange={(e) => handleInputChange('RelationshipWithSiblings', e.target.value)}
                                name="RelationshipWithSiblings"
                            />

                            <FormInput
                                label="Relationship with extended family"
                                value={formData.RelationshipWithExtendedFamily}
                                onChange={(e) => handleInputChange('RelationshipWithExtendedFamily', e.target.value)}
                                name="RelationshipWithExtendedFamily"
                            />
                            <FormInput
                                label="Fears and Conflicts"
                                value={formData.FearsAndConflicts}
                                onChange={(e) => handleInputChange('FearsAndConflicts', e.target.value)}
                                name="FearsAndConflicts"
                            />


                            <FormInput
                                label="Child’s response to frustration"
                                value={formData.ChildsResponseToFrustration}
                                onChange={(e) => handleInputChange('ChildsResponseToFrustration', e.target.value)}
                                name="ChildsResponseToFrustration"
                            />


                        </div>

                        <FormInput
                            label="Favorite activities"
                            value={formData.FavoriteActivities}
                            onChange={(e) => handleInputChange('FavoriteActivities', e.target.value)}
                            name="FavoriteActivities"
                        />
                    </div>

                    <div className="flex justify-center pt-4">
                        <button className="hover:bg-slate-700 text-white px-8 py-3 rounded-md bg-slate-800 transition-colors">
                            Save
                        </button>
                    </div>


                </div>
            )}
        </>
    );
};

export default SocialBehavior;
