import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Save } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import CheckboxWithLabel from "./CheckboxWithLabel";
import { api_base_url, school_id } from '@/utils/const';
import { useAuth0 } from '@auth0/auth0-react';
import { getAuthHeaders } from '@/utils/auth';

const SecurityPolicy = ({ initialFormData = null, childId = null }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [agreed, setAgreed] = useState(false);

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
      setAgreed(initialFormData.security_release_policy_form == 'on');
    }
  }, [initialFormData]);

  const handleAgreedChange = (checked) => {
    setAgreed(checked);
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
        security_release_policy_form: agreed ? 'on' : 'off'
      };

      await updateAdmissionData(saveData);
      toast.success('Security policy data saved successfully!');
    } catch (error) {
      console.error('Failed to save security policy:', error);
      toast.error('Error saving security policy data. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <Toaster richColors position="top-center" />
      
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="bg-[#0F2D52] text-white">
          <CardTitle className="text-2xl flex items-center gap-3 justify-center">
            <Shield className="h-6 w-6" />
            Security Release & Policy Acknowledgement
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* Policy Text */}
          <div className="space-y-6 text-justify text-base font-medium text-gray-800 leading-relaxed">
            <p>
              I understand that The Goddard School® has installed security cameras in the foyer and around the outside perimeter of the building.
              I also understand that while attending The Goddard School®, my child may be videotaped by a security camera.
            </p>
            <p>
              I recognize that I may also be videotaped by a security camera while at or around the school premises. I will notify each person
              listed on the Application for Admission that he or she may be also videotaped while at or around the school premises.
            </p>
          </div>

          {/* Sign Off Header */}
          <div className="text-center">
            <h4 className="font-bold text-lg sm:text-xl text-[#0F2D52]">
              Policy Sign Off
            </h4>
          </div>

          {/* Final Statement */}
          <p className="text-justify text-base font-medium text-gray-800 leading-relaxed">
            My signature below confirms my understanding of the Enrollment Agreement, school policies, my tuition obligation, my responsibility
            for the payment of fees, and confirms that I have received and read a copy of the parent handbook.
          </p>

          {/* Checkbox */}
          <div className="py-4">
            <CheckboxWithLabel
              id="agreeCheckbox"
              checked={agreed}
              onChange={handleAgreedChange}
              label="I agree to the Security Release & Policy Acknowledgement."
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleSave}
              disabled={!agreed}
              className="bg-[#0F2D52] hover:bg-[#0F2D52]/90 px-8"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityPolicy;
