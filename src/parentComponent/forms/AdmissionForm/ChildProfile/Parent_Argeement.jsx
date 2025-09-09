import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, FileCheck, Check, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { api_base_url, school_id } from '@/utils/const';
import { toast } from 'sonner';
import { useAuth0 } from '@auth0/auth0-react';
import { getAuthHeaders } from '@/utils/auth';


const Parent_Argeement = ({ expandedSections, toggleSection, formData, handleInputChange, initialFormData, childId }) => {
  const [localFormData, setLocalFormData] = useState({
    agreementConfirmed: false
  });

  const { getAccessTokenSilently } = useAuth0();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLocalFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
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
        agreementConfirmed: initialFormData.do_you_agree_this === 'on' ? true : false
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

  // Function to check if agreement is confirmed
  const isFormComplete = () => {
    return localFormData.agreementConfirmed === true;
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
        do_you_agree_this: localFormData.agreementConfirmed ? 'on' : 'off'
      };
      console.log(saveData);
      await updateAdmissionData(saveData);
      toast.success('Parent Agreement data saved successfully!');
    } catch (error) {
      console.error('Failed to save Parent Agreement data:', error);
      toast.error('Error saving Parent Agreement data. Please try again.');
    }
  };
  const isOpen = expandedSections.parent;

  return (
    <Card className="border border-gray-300">
      <CardHeader 
        className={`p-3 cursor-pointer transition-colors ${
          isOpen ? 'bg-[#0F2D52] text-white' : 'bg-[#DBEAFE] text-[#0F2D52]'
        } hover:bg-[#0F2D52] hover:text-white`}
        onClick={() => toggleSection('parent')}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5" />
            <div>
              <CardTitle className="text-base font-semibold">Parent Agreement</CardTitle>
              <CardDescription className={`text-sm ${
                isOpen ? 'text-blue-100' : 'text-gray-600'
              }`}>
                Confirmation of accuracy and completeness
              </CardDescription>
            </div>
            {isFormComplete() && (
              <Badge className="bg-green-100 text-green-800 ml-2">
                <Check className="h-3 w-3 mr-1" />
                Complete
              </Badge>
            )}
          </div>
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent className="p-6 bg-gray-50 border-t space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center justify-center gap-2">
              <FileCheck className="h-5 w-5" />
              Correct and Complete Information
            </h2>
          </div>

          <div className="bg-white p-6 rounded-lg border-l-4 border-[#0F2D52] shadow-sm">
            <p className="text-gray-700 leading-relaxed">
              To the best of my knowledge, the information I have provided and the statements I have made in this profile are correct and complete.
              I understand that false information provided herein or in connection with the enrollment process may result in disenrollment of my child.
              I further agree to update the information in this Health and Social Record as circumstances may require at Goddard School's request.
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="agreementCheck"
                checked={localFormData.agreementConfirmed}
                onCheckedChange={(checked) => {
                  setLocalFormData(prevState => ({
                    ...prevState,
                    agreementConfirmed: checked
                  }));
                }}
              />
              <Label htmlFor="agreementCheck" className="text-sm font-medium text-gray-700 cursor-pointer leading-5">
                I agree that all the above information is correct and complete.
              </Label>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Button 
              type="button"
              onClick={handleSave}
              disabled={!localFormData.agreementConfirmed}
              className="bg-[#0F2D52] hover:bg-[#0F2D52]/90 px-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileCheck className="h-4 w-4 mr-2" />
              Save Agreement
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};


export default Parent_Argeement;