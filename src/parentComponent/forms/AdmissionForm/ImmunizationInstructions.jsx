import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { api_base_url, school_id } from '@/utils/const';
import { useAuth0 } from '@auth0/auth0-react';
import { getAuthHeaders } from '@/utils/auth';

const ImmunizationInstructions = ({ initialFormData = null , childId}) => {
  const { getAccessTokenSilently } = useAuth0();
  const [isChecked, setIsChecked] = useState(false);

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


  const handleSave = async () => {
    if (!childId) {
      toast.error('Error: Child ID is missing');
      return;
    }

    try {
      const saveData = {
        child_id: childId,
        school_id: school_id,
        do_you_agree_this_immunization_instructions: isChecked ? 'on' : 'off'
      };

      await updateAdmissionData(saveData);
      toast.success('Immunization instructions saved successfully!');
    } catch (error) {
      console.error('Failed to save medical transportation waiver:', error);
      toast.error('Error saving immunization instructions. Please try again.');
    }
  };


  useEffect(() => {
    if (initialFormData) {
      setIsChecked(initialFormData.do_you_agree_this_immunization_instructions == 'on');
    }
  }, [initialFormData]);

  return (
    <Card className="bg-[#D8E9FF]">
      <CardHeader className="bg-[#0F2D52] text-white text-center">
        <CardTitle className="text-2xl">Immunization Instructions</CardTitle>
      </CardHeader>
      <CardContent className="p-6 bg-white space-y-6">
        <div className="text-base text-gray-800 space-y-6">
          <p>
            Please provide your children's immunization records to the school on or before your
            children's first day in our school.
          </p>
          
          <p>
            <strong>NOTE:</strong> If your child has a vaccination history with Washington State, we
            can directly download the immunization record from the Department of Health. You don't
            have to send us an immunization copy.
          </p>

          <ol className="space-y-4 pl-4">
            <li className="flex gap-3">
              <span className="bg-[#0F2D52] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0">1</span>
              <span>If you have a soft copy, feel free to email it to us.</span>
            </li>
            <li className="flex gap-3">
              <span className="bg-[#0F2D52] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0">2</span>
              <span>
                You can visit{' '}
                <a href="https://myirmobile.com" target="_blank" rel="noopener noreferrer" className='text-blue-600 underline hover:text-blue-800'>
                  https://myirmobile.com
                </a>
                , register, and access the report for your child.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="bg-[#0F2D52] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0">3</span>
              <span>
                If you have a MyChart login for your child's profile, you can download the report
                directly or request it from your pediatrician.
              </span>    
            </li>
          </ol>
        </div>

        <div className="space-y-4">
          <p>
            Once obtained, kindly email it to us at{' '}
            <a href="mailto:lynnwoodmanagementgroup@goddardsystems.onmicrosoft.com" className="text-blue-600 underline hover:text-blue-800">
              lynnwoodmanagementgroup@goddardsystems.onmicrosoft.com
            </a>
            .
          </p>

          <p>
            If you have an exemption due to medical or religious reasons. Please let us know and we
            will help provide the proper form to fill out.
          </p>

          <div className="flex items-center space-x-3 pt-4">
            <Checkbox
              id="do_you_agree_this_immunization_instructions"
              checked={isChecked}
              onCheckedChange={setIsChecked}
              className="data-[state=checked]:bg-[#0F2D52] data-[state=checked]:border-[#0F2D52]"
            />
            <Label
              htmlFor="do_you_agree_this_immunization_instructions"
              className="font-bold text-base cursor-pointer"
            >
              I agree immunization instructions.
            </Label>
          </div>
        </div>

        <div className="text-center pt-6">
          <Button 
            onClick={handleSave} 
            className="bg-[#0F2D52] hover:bg-[#093567] px-8 py-3"
          >
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImmunizationInstructions;