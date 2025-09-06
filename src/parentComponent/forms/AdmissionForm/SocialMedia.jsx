import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Share2, Save } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import CheckboxWithLabel from "./CheckboxWithLabel";
import { api_base_url, school_id } from '@/utils/const';
import { useAuth0 } from '@auth0/auth0-react';
import { getAuthHeaders } from '@/utils/auth';

export default function SocialMediaReleaseForm({initialFormData = null, childId}) {
  const { getAccessTokenSilently } = useAuth0();
  const [approval, setApproval] = useState(initialFormData.approve_social_media_post);
  const [printedName, setPrintedName] = useState(initialFormData.printed_name_social_media_post);
  const [agreed, setAgreed] = useState(initialFormData.do_you_agree_this_social_media_post == 'on');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (approval && printedName && agreed) {
      toast.success('Form submitted successfully!');
    } else {
      toast.error('Please complete all fields.');
    }
  };

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
        throw new Error(`Failed to update Admission data: ${response.status}`);
      }

      const result = await response.json();
      console.log('Admission data updated successfully:', result);
      return result;
    } catch (error) {
      console.error('Error updating Admission data:', error);
      throw error;
    }
  };


    const handleSave = async () => {
    if (!childId) {
      toast.error('Error: Child ID is missing');
      return;
    }

    try {
      // Prepare the complete form data for API call including child_id
      const saveData = {
        child_id: childId,
        school_id: school_id,
        approve_social_media_post: approval,
        printed_name_social_media_post: printedName,
        do_you_agree_this_social_media_post: agreed ? 'on' : 'off'
      };

      // Call the API to save all form data
      await updateAdmissionData(saveData);
      
      // Show success alert
      toast.success('Admission form data saved successfully!');
    } catch (error) {
      console.error('Failed to save Admission form:', error);
      toast.error('Error saving Admission form data. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <Toaster richColors position="top-center" />
      
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="bg-[#0F2D52] text-white">
          <CardTitle className="text-2xl flex items-center gap-3 justify-center">
            <Share2 className="h-6 w-6" />
            Photo Release For Social Media
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Social Media Labels */}
            <div className="flex justify-around text-xl font-bold text-[#0F2D52]">
              <div>Facebook</div>
              <div>Instagram</div>
            </div>

            {/* Consent Text */}
            <div className="text-gray-800 text-justify font-semibold text-[16px] leading-relaxed">
              <p>
                I hereby grant permission for The Goddard School to utilize any photographs and/or video footage of my child, whose name is provided below, for social media purposes. Neither the child's name nor any other identifying details will be mentioned.
              </p>
            </div>

            {/* Radio Options */}
            <div className="space-y-4">
              <Label className="block font-bold text-[16px]">Select One:</Label>
              <RadioGroup value={approval} onValueChange={setApproval}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="approve" id="approve" />
                  <Label htmlFor="approve" className="font-semibold">Approve Social Media Postings</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="deny" id="deny" />
                  <Label htmlFor="deny" className="font-semibold">Do NOT Approve Postings to Social Media</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Printed Name */}
            <div className="space-y-2">
              <Label htmlFor="printedName" className="font-bold text-[16px]">Printed Name</Label>
              <Input
                id="printedName"
                type="text"
                placeholder="Enter printed name"
                value={printedName}
                onChange={(e) => setPrintedName(e.target.value)}
                className="w-full focus:ring-2 focus:ring-[#0F2D52] focus:border-[#0F2D52]"
              />
            </div>

            {/* Checkbox */}
            <CheckboxWithLabel
              id="agreeCheckbox"
              checked={agreed}
              onChange={setAgreed}
              label="I have read this agreement and understand its terms."
            />

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <Button
                type="submit"
                className="bg-[#0F2D52] hover:bg-[#0F2D52]/90 px-8"
                onClick={handleSave}
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
