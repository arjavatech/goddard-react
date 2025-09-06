import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Camera, Save } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import CheckboxWithLabel from './CheckboxWithLabel';
import { api_base_url, school_id } from '@/utils/const';
import { useAuth0 } from '@auth0/auth0-react';
import { getAuthHeaders } from '@/utils/auth';

export default function VideoPermission({ initialFormData = null, childId = null }) {
  const { getAccessTokenSilently } = useAuth0();
  const [agreePhotos, setAgreePhotos] = useState(false);
  const [agreeGroup, setAgreeGroup] = useState(false);
  const [photoUsageType, setPhotoUsageType] = useState('');

  // API function to update admission form data
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

  useEffect(() => {
    if (initialFormData) {
      // Map API data to form fields using 'on'/'off' pattern
      setPhotoUsageType(initialFormData.photo_usage_photo_video_permission_form || '');
      setAgreePhotos(initialFormData.photo_permission_agree_group_photos_electronic == 'on');
      setAgreeGroup(initialFormData.do_you_agree_this_photo_video_permission_form == 'on');
    }
  }, [initialFormData]);

  const handleAgreePhotosChange = (checked) => {
    setAgreePhotos(checked);
  };

  const handleAgreeGroupChange = (checked) => {
    setAgreeGroup(checked);
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
        photo_usage_photo_video_permission_form: photoUsageType,
        photo_permission_agree_group_photos_electronic: agreePhotos ? 'on' : 'off',
        do_you_agree_this_photo_video_permission_form: agreeGroup ? 'on' : 'off'
      };

      await updateAdmissionData(saveData);
      toast.success('Video permission data saved successfully!');
    } catch (error) {
      console.error('Failed to save video permission:', error);
      toast.error('Error saving video permission data. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <Toaster richColors position="top-center" />
      
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="bg-[#0F2D52] text-white">
          <CardTitle className="text-2xl flex items-center gap-3 justify-center">
            <Camera className="h-6 w-6" />
            Consent to Photograph
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* Content Section */}
          <div className="space-y-6 text-base leading-relaxed font-medium text-gray-900">
            {/* Consent Section */}
            <div>
              <p className="text-justify font-semibold mb-6">
                I consent to The Goddard School® taking photographs and videos of my child, who are identified below.
                For value received and without additional consideration, I agree that all photographs and video footage
                of my child taken at The Goddard School may be used at any time by The Goddard School or Goddard Systems,
                Inc. for the purposes of illustration, advertising and publicity, in any manner or in any form,
                including in broadcast, print, electronic and social media.
              </p>

              {/* Dropdown */}
              <div className="mb-6 flex justify-center">
                <div className="w-full max-w-[280px] space-y-2">
                  <Label className="font-semibold">Select One</Label>
                  <Select value={photoUsageType} onValueChange={setPhotoUsageType}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose usage type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full Use">Full Use</SelectItem>
                      <SelectItem value="In-House Only">In-House Only*</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <p className="font-bold mb-6 text-justify">
                *In-house only includes photos used in the classroom or hallways and photos taken for and through
                electronic daily report tools, such as Kaymbu.
              </p>
            </div>

            {/* Group Photos Section */}
            <div>
              <h4 className="text-center text-lg font-bold mb-4 text-[#0F2D52]">Group Photos in Electronic Daily Activity Reports</h4>
              <p className="text-justify font-semibold mb-6">
                The Goddard School takes photos of individual children and groups of children for electronic daily
                activity reports. These photos will not be used for any other purpose by The Goddard School or Goddard
                Systems, Inc. Although we have a School policy against it, it is possible for individuals who receive
                group photos in an electronic daily activity report to share these group photos through their personal
                social media accounts. For this reason, we ask that you specifically authorize whether we can include
                your child in any group photos shared through the electronic daily activity reports.
              </p>

              <CheckboxWithLabel
                id="agreePhotos"
                checked={agreePhotos}
                onChange={handleAgreePhotosChange}
                label="I agree to have individual photos of my child and photos of group activities that include my child shared through the School's electronic daily activity reports."
              />
            </div>

            {/* Agreement Not to Post */}
            <div>
              <h4 className="text-center text-lg font-bold mb-4 mt-8 text-[#0F2D52]">Agreement Not to Post Photos of Other Children</h4>
              <CheckboxWithLabel
                id="agreeGroup"
                checked={agreeGroup}
                onChange={handleAgreeGroupChange}
                label="I agree that I will not post or use any photographs or videos that I receive from or take at The Goddard School that include children other than my own child in print, electronic or social media or any other form. This includes group photos that I receive as part of an electronic daily activity report. My agreement extends to photos or videos taken by any member of my family or any visitors that I bring to The Goddard School."
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-center pt-6">
              <Button 
                className="bg-[#0F2D52] hover:bg-[#0F2D52]/90 px-8"
                onClick={handleSave}
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
