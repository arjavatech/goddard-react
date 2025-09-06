import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { FileText, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { api_base_url, school_id } from "@/utils/const";
import { useAuth0 } from '@auth0/auth0-react';
import { getAuthHeaders } from '@/utils/auth';

export default function OutsideEngagements({initialFormData = null, childId }) {
    const { getAccessTokenSilently } = useAuth0();
    const [agreePhotos, setAgreePhotos] = useState(initialFormData.parent_sign_outside_waiver == 'on');
    const [submitted, setSubmitted] = useState(false);

    

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
        parent_sign_outside_waiver: agreePhotos ? 'on' : 'off'
      };

      // Call the API to save all form data
      await updateAdmissionData(saveData);
      
      // Show success alert
      toast.success('Outside engagements waiver saved successfully!');
    } catch (error) {
      console.error('Failed to save Admission form:', error);
      toast.error('Error saving outside engagements data. Please try again.');
    }
  };

    // Validation function
    const isAgreementComplete = () => {
        return agreePhotos;
    };

    return (
        <div className="space-y-6">
            <Toaster richColors position="top-center" />
            
            {/* Outside Engagements Release & Waiver Form */}
            <Card>
                <CardHeader className="bg-[#0F2D52] text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FileText className="h-6 w-6" />
                            <div>
                                <CardTitle className="text-2xl">Outside Engagements Release & Waiver</CardTitle>
                                <CardDescription className="text-blue-100">
                                    Agreement for outside childcare services
                                </CardDescription>
                            </div>
                        </div>
                        {isAgreementComplete() && (
                            <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Complete
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                    <div className="space-y-6 text-justify text-base font-medium text-gray-800">
                        <p>
                            Parent(s) of student(s) enrolled at The Goddard School, Lynnwood may request one or more employees of the The Goddard School, Lynnwood to provide childcare services (baby-sitting/transportation) outside of school premises and school hours.
                        </p>

                        <div className="space-y-4">
                            <h3 className="text-lg font-bold">
                                Parents and employees agree as follows:
                            </h3>
                            <ul className="list-disc list-inside space-y-2">
                                {[
                                    "Parents acknowledge that they have requested that Employee provide Babysitting Services/Transportation solely for Parents' convenience and benefit , and not for the convenience or benefit of the School.",
                                    "Parents acknowledge that, in providing Transportation and/or Babysitting Services, Employee is acting as an independent contractor and not as an employee of the School. Parents acknowledge that providing Transportation and Babysitting Services is not part of Employee's job with the School and that the School is not requesting that Employee provide these services.",
                                    "Parents acknowledge that the School has not reviewed Employee's driving record and makes no representations regarding Employee's driving history or ability or the existence or scope of Employee's insurance.",
                                    "Parents interested in hiring a teacher(s) for outside services must ask if the teacher is interested. The admin team will not aid in finding someone to facilitate before/after hour care.",
                                    "When hiring for outside engagements, parents ensure that staff work hours at school are not disturbed.",
                                    "If there is a matter of contention between the staff hired and the family, management is not liable to mediate or take disciplinary actions against the staff based on what happened outside the school.",
                                ].map((item, idx) => (
                                    <li key={idx} className="text-sm">{item}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="agreePhotos"
                                    checked={agreePhotos}
                                    onCheckedChange={setAgreePhotos}
                                />
                                <Label 
                                    htmlFor="agreePhotos" 
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    I have read this agreement and understand its terms.
                                </Label>
                            </div>
                            
                            {submitted && !agreePhotos && (
                                <div className="flex items-center gap-2 text-sm text-red-600">
                                    <AlertCircle className="h-4 w-4" />
                                    You must agree to continue.
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                onClick={handleSave}
                                className="bg-[#0F2D52] hover:bg-[#0F2D52]/90"
                                disabled={!agreePhotos}
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Save Agreement
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
