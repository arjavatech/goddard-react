import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { User, Send, CheckCircle } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { api_base_url, school_id } from '@/utils/const';
import { useAuth0 } from '@auth0/auth0-react';
import { getAuthHeaders } from '@/utils/auth';

const ParentSign = ({ initialFormData = null, formData, childId, editID, onAlert }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [formState, setFormState] = useState({
    parent_sign_admission: initialFormData.parent_sign_admission ?? '',
    parent_sign_date_admission: initialFormData.parent_sign_date_admission ?? '',
  });

  useEffect(() => {
    if (formData) {
      setFormState(prevState => ({
        ...prevState,
        ...formData
      }));
    }
  }, [formData]);

  const handleInputChange = (field, value) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
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

  const handleSubmit = async (type) => {
    // Handle submit functionality
    if (type === 'parent') {
      if (!childId) {
      toast.error('Error: Child ID is missing');
      return;
    }

    try {
      if(formState.parent_sign_admission == null || formState.parent_sign_admission == '')
      {
        toast.error('Error: Parent signature is missing');
        return;
      }
      // Prepare the complete form data for API call including child_id
      const saveData = {
        child_id: childId,
        school_id: school_id,
        parent_sign_admission: formState.parent_sign_admission,
        parent_sign_date_admission: Math.floor(Date.now())
      };

      // Call the API to save all form data
      await updateAdmissionData(saveData);
      
      // Show success alert
      toast.success('Parent signature submitted successfully!');
    } catch (error) {
      console.error('Failed to save Admission form:', error);
      toast.error('Error saving admission form data. Please try again.');
    }
    } 
  //   else if (type === 'admin') {
  //     if (!childId) {
  //     alert('Error: Child ID is missing');
  //     return;
  //   }

  //   try {
  //     if(formState.admin_sign_admission == null || formState.admin_sign_admission == '')
  //     {
  //       alert('Error: Parent Sign is missing');
  //       return;
  //     }
  //     const epochValue = new Date(formState.admin_sign_date_admission).getTime();
  //     // Prepare the complete form data for API call including child_id
  //     const saveData = {
  //       child_id: childId,
  //       admin_sign_admission: formState.admin_sign_admission,
  //       admin_sign_date_admission: epochValue
  //     };

  //     // Call the API to save all form data
  //     await updateAdmissionData(saveData);
      
  //     // Show success alert
  //     alert('Admission form data saved successfully!');
  //   } catch (error) {
  //     console.error('Failed to save Admission form:', error);
  //     alert('Error saving Admission form data. Please try again.');
  //   }
  
  // }
   
  };




  // Validation function
  const isParentSignatureComplete = () => {
    return formState.parent_sign_admission && 
           formState.parent_sign_admission.toString().trim() !== '';
  };

  return (
    <div className="space-y-6">
      <Toaster richColors position="top-center" />
      
      {/* Parent Signature Form */}
      <Card>
        <CardHeader className="bg-[#0F2D52] text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="h-6 w-6" />
              <div>
                <CardTitle className="text-2xl">Parent Signature</CardTitle>
                <CardDescription className="text-blue-100">
                  Parent authorization and agreement
                </CardDescription>
              </div>
            </div>
            {isParentSignatureComplete() && (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-4 w-4 mr-1" />
                Complete
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="parent_sign_admission">Parent Signature *</Label>
              <Input
                id="parent_sign_admission"
                name="parent_sign_admission"
                type="text"
                placeholder="Type your full name as signature"
                value={formState.parent_sign_admission}
                onChange={(e) => handleInputChange('parent_sign_admission', e.target.value)}
                className="w-full"
                required
              />
              <p className="text-sm text-gray-500">
                By typing your name above, you agree to the terms and authorize the admission process.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="parent_sign_date_admission">Signature Date</Label>
              <Input
                id="parent_sign_date_admission"
                name="parent_sign_date_admission"
                type="date"
                value={formState.parent_sign_date_admission}
                onChange={(e) => handleInputChange('parent_sign_date_admission', e.target.value)}
                className="w-full"
                readOnly
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={() => handleSubmit('parent')} 
              className="bg-[#0F2D52] hover:bg-[#0F2D52]/90"
              disabled={!formState.parent_sign_admission}
            >
              <Send className="h-4 w-4 mr-2" />
              Submit Signature
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParentSign;