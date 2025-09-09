import React, { useState, useEffect } from 'react';
import { Check, ChevronUp, ChevronDown, Clock, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup as ShadcnRadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { api_base_url, school_id } from '@/utils/const';
import { toast } from 'sonner';
import { RadioGroup } from './InputComponent';
import { useAuth0 } from '@auth0/auth0-react';
import { getAuthHeaders } from '@/utils/auth';

const ChildProfileDetails = ({ expandedSections, toggleSection, initialFormData, childId, onSubmitSuccess }) => {
  const { getAccessTokenSilently } = useAuth0();
    const [localFormData, setLocalFormData] = useState({
        important_fam_members: '',
        about_family_celebrations: '',
        childcare_before: '',
        what_child_interests: '',
        drop_off_time: '',
        pick_up_time: ''
    });
    console.log(initialFormData)
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
                important_fam_members: initialFormData.important_fam_members || '',
                about_family_celebrations: initialFormData.about_family_celebrations || '',
                childcare_before: initialFormData.childcare_before === 1 ? 'Yes' : (initialFormData.childcare_before === 2 ? 'No' : ''),
                what_child_interests: initialFormData.what_child_interests || '',
                drop_off_time: initialFormData.drop_off_time || '',
                pick_up_time: initialFormData.pick_up_time || ''
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

    // Function to check if all required fields are filled
    const isFormComplete = () => {
        const requiredFields = [
            'important_fam_members',
            'childcare_before',
            'drop_off_time',
            'pick_up_time'
        ];
        
        return requiredFields.every(field => 
            localFormData[field] && localFormData[field].toString().trim() !== ''
        );
    };

    const handleSave = async () => {
        if (!childId) {
            alert('Error: Child ID is missing');
            return;
        }

        try {
            const saveData = {
                child_id: childId,
                school_id: school_id,
                important_fam_members: localFormData.important_fam_members,
                about_family_celebrations: localFormData.about_family_celebrations,
                childcare_before: localFormData.childcare_before === 'Yes' ? 1 : (localFormData.childcare_before === 'No' ? 2 : 2),
                what_child_interests: localFormData.what_child_interests,
                drop_off_time: localFormData.drop_off_time,
                pick_up_time: localFormData.pick_up_time
            };
            console.log(saveData);
            await updateAdmissionData(saveData);
            toast.success('Child profile details saved successfully!');
            
            // Call the parent's onSubmitSuccess to mark Child Profile as complete
            if (onSubmitSuccess) {
                onSubmitSuccess();
            }
        } catch (error) {
            console.error('Failed to save Child profile details:', error);
            toast.error('Error saving Child profile details. Please try again.');
        }
    };
    const isOpen = expandedSections.profile;
  return (
    <Card className="border border-gray-300">
      <CardHeader 
        className={`p-3 cursor-pointer transition-colors ${
          isOpen ? 'bg-[#0F2D52] text-white' : 'bg-[#DBEAFE] text-[#0F2D52]'
        } hover:bg-[#0F2D52] hover:text-white`}
        onClick={() => toggleSection('profile')}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5" />
            <div>
              <CardTitle className="text-base font-semibold">Child Profile Details</CardTitle>
            </div>
            {isFormComplete() && (
              <Badge className="bg-green-100 text-green-800 ml-2">
                <Check className="h-3 w-3 mr-1" />
                Complete
              </Badge>
            )}
          </div>
          {isOpen ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent className="p-6 bg-gray-50 border-t">
          <div className="space-y-6">
            {/* Family Members */}
            <div className="space-y-2">
              <Label htmlFor="important_fam_members" className="text-sm font-medium text-gray-700">
                Other important Family Members (Siblings, Grandparent, Pets, etc)
              </Label>
              <Input
                id="important_fam_members"
                name="important_fam_members"
                value={localFormData.important_fam_members}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            {/* Family Traditions */}
            <div className="space-y-2">
              <Label htmlFor="about_family_celebrations" className="text-sm font-medium text-gray-700">
                Tell us about your family traditions or important celebrations
              </Label>
              <Input
                id="about_family_celebrations"
                name="about_family_celebrations"
                value={localFormData.about_family_celebrations}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            {/* Childcare Experience */}
            <RadioGroup
              label="Has your child been in childcare before?"
              name="childcare_before"
              options={[
                { label: 'Yes', value: 'Yes' },
                { label: 'No', value: 'No' }
              ]}
              selectedValue={localFormData.childcare_before}
              onChange={handleChange}
            />

            {/* Child's Interests */}
            <div className="space-y-2">
              <Label htmlFor="what_child_interests" className="text-sm font-medium text-gray-700">
                What are your child's interests?
              </Label>
              <Input
                id="what_child_interests"
                name="what_child_interests"
                value={localFormData.what_child_interests}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            {/* Typical Time Section */}
            <div className="space-y-4">
              <h3 className="text-center text-sm font-medium text-gray-700">
                What will be your child's typical time?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="drop_off_time" className="text-sm font-medium text-gray-700">
                    Drop off time?
                  </Label>
                  <div className="relative">
                    <Input
                      id="drop_off_time"
                      name="drop_off_time"
                      value={localFormData.drop_off_time}
                      onChange={handleChange}
                      className="pr-10"
                      placeholder="e.g., 8:00 AM"
                    />
                    <Clock className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pick_up_time" className="text-sm font-medium text-gray-700">
                    Pick up time?
                  </Label>
                  <div className="relative">
                    <Input
                      id="pick_up_time"
                      name="pick_up_time"
                      value={localFormData.pick_up_time}
                      onChange={handleChange}
                      className="pr-10"
                      placeholder="e.g., 5:00 PM"
                    />
                    <Clock className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-center pt-4">
              <Button 
                type="button"
                onClick={handleSave}
                className="bg-[#0F2D52] hover:bg-[#0F2D52]/90 px-8"
              >
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ChildProfileDetails;
