import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, Save } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import CheckboxWithLabel from './CheckboxWithLabel';
import { api_base_url, school_id } from '@/utils/const';
import { useAuth0 } from '@auth0/auth0-react';
import { getAuthHeaders } from '@/utils/auth';

const PickUpPassword = ({initialFormData = null, childId = null}) => {
  const { getAccessTokenSilently } = useAuth0();
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);

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

  // Initialize form data from props
  React.useEffect(() => {
    if (initialFormData) {
      setPassword(initialFormData.child_password_pick_up_password_form ?? '');
      setAgree(initialFormData.do_you_agree_this_pick_up_password_form == 'on');
    }
  }, [initialFormData]);

  const handleSave = async () => {
    if (!childId) {
      toast.error('Error: Child ID is missing');
      return;
    }

    if (!password || !agree) {
      toast.error('Please enter the password and agree to the instructions.');
      return;
    }

    try {
      const saveData = {
        child_id: childId,
        school_id: school_id,
        child_password_pick_up_password_form: password,
        do_you_agree_this_pick_up_password_form: agree ? 'on' : 'off'
      };

      await updateAdmissionData(saveData);
      toast.success('Pick-up password saved successfully!');
    } catch (error) {
      console.error('Failed to save pick-up password:', error);
      toast.error('Error saving pick-up password. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <Toaster richColors position="top-center" />
      
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="bg-[#0F2D52] text-white">
          <CardTitle className="text-2xl flex items-center gap-3 justify-center">
            <KeyRound className="h-6 w-6" />
            Pick-up Password
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* Content */}
          <div className="space-y-6 text-base leading-relaxed font-medium text-gray-900">
            <p className="text-justify">
              It is part of The Goddard School® security policy to have a password that is given to anyone
              whom you designate as an authorized pick-up for your child. Your child will be released to
              this authorized person only if the following conditions have been met:
            </p>

            <ol className="list-decimal pl-6 space-y-4 text-justify">
              <li>
                The Director must be notified in writing, either at the time of enrollment, or in advance of
                the pick-up, that you are authorizing someone other than yourself to pick up your child. If
                you telephone the school to authorize a pick-up, be prepared to receive a return phone call
                to verify the information.
              </li>
              <li>
                At the time of notification, you will need to give us the authorized individual's full name
                and his/her approximate time of arrival so we can then notify the staff.
              </li>
              <li>
                The authorized individual must show two forms of identification (one must be a photo ID) and
                tell the Owner or Director the password you have designated below.
              </li>
            </ol>

            <p className="text-justify">
              The password is an added measure of security for your family and will be kept with your child's
              emergency information.
            </p>

            {/* Password Field */}
            <div className="flex justify-center pt-4">
              <div className="w-full sm:w-4/5 md:w-2/3 space-y-2">
                <Label htmlFor="pickupPassword" className="text-md font-bold">
                  Password
                </Label>
                <Input
                  id="pickupPassword"
                  name="pickupPassword"
                  type="text"
                  maxLength={5}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="(5 digits, alphanumeric)"
                  className="w-full focus:ring-2 focus:ring-[#0F2D52] focus:border-[#0F2D52]"
                />
              </div>
            </div>

            {/* Checkbox */}
            <CheckboxWithLabel
              id="agreeCheckbox"
              checked={agree}
              onChange={setAgree}
              label="I agree pick-up password instructions."
            />

            {/* Save Button */}
            <div className="flex justify-center pt-6">
              <Button
                onClick={handleSave}
                className="bg-[#0F2D52] hover:bg-[#0F2D52]/90 px-8"
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
};

export default PickUpPassword;
