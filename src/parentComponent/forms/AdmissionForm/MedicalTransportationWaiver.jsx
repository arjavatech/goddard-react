import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { api_base_url, school_id } from "@/utils/const";

export default function MedicalTransportationWaiver({initialFormData = null, childId = null}) {
  const [studentName, setStudentName] = useState(initialFormData.med_technicians_med_transportation_waiver ?? '');
  const [agreed, setAgreed] = useState(initialFormData.medical_transportation_waiver == 'on');
  const [submitted, setSubmitted] = useState(false);

  // API function to update admission form data
  const updateAdmissionData = async (fieldData) => {
    if (!childId) {
      console.error('Child ID is required for API update');
      return;
    }

    try {
      const response = await fetch(`${api_base_url}/admission_segment/${school_id}/${childId}`, {
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

  // Initialize form data from props
  React.useEffect(() => {
    if (initialFormData) {
      setStudentName(initialFormData.med_technicians_med_transportation_waiver ?? '');
      setAgreed(initialFormData.medical_transportation_waiver == 'on');
    }
  }, [initialFormData]);

  const handleSave = async () => {
    if (!childId) {
      toast.error('Error: Child ID is missing');
      return;
    }

    if (!studentName || !agreed) {
      toast.error('Please enter the student name and agree to the waiver.');
      return;
    }

    try {
      const saveData = {
        child_id: childId,
        school_id: school_id,
        med_technicians_med_transportation_waiver: studentName,
        medical_transportation_waiver: agreed ? 'on' : 'off'
      };

      await updateAdmissionData(saveData);
      toast.success('Medical transportation waiver saved successfully!');
    } catch (error) {
      console.error('Failed to save medical transportation waiver:', error);
      toast.error('Error saving medical transportation waiver. Please try again.');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="bg-[#0F2D52] text-white text-center">
        <CardTitle className="text-3xl">Medical Transportation Waiver</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6 text-justify text-base font-medium text-gray-800">
            <div className="space-y-4">
              <p>
                The undersigned authorizes representatives of The Goddard School® to contact Emergency Medical Technicians to transport{" "}
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <Input
                  type="text"
                  className={`w-full sm:w-[220px] ${
                    submitted && !studentName ? "border-red-500" : ""
                  }`}
                  placeholder="Student name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                />
              </div>
              <p>
                ("Student") to receive medical care, if such transportation/care is deemed necessary.
              </p>
            </div>

            <p>
              The undersigned irrevocably releases any claims, demands, actions or causes of action against The Goddard School®, its franchisor,
              Goddard Systems, Inc., and their respective representatives and employees, which arise out of or relate to the transportation
              of Student and any medical care provided.
            </p>

            <p>
              This authorization and waiver shall remain effective until Student withdraws from The Goddard School®.
            </p>

            <div className="flex items-center space-x-3 pt-4">
              <Checkbox
                id="agreeCheckbox"
                checked={agreed}
                onCheckedChange={setAgreed}
                className="data-[state=checked]:bg-[#0F2D52] data-[state=checked]:border-[#0F2D52]"
              />
              <Label htmlFor="agreeCheckbox" className="font-bold text-base cursor-pointer">
                I agree to the medical transportation waiver.
              </Label>
            </div>

            <div className="text-center pt-6">
              <Button
                onClick={handleSave}
                className="bg-[#0F2D52] hover:bg-[#093567] text-white font-semibold px-8 py-2"
                disabled={!studentName || !agreed}
              >
                Save
              </Button>
            </div>
      </CardContent>
    </Card>
  );
}
