import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Shield, Send, CheckCircle } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { api_base_url, school_id } from '@/utils/const';
import { useAuth0 } from '@auth0/auth0-react';
import { getAuthHeaders } from '@/utils/auth';

const adminSign = ({ initialFormData = null, formData, childId, editID, onAlert }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [formState, setFormState] = useState({
    admin_sign_admission: initialFormData.admin_sign_admission ?? '',
    admin_sign_date_admission: initialFormData.admin_sign_date_admission ?? '',
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
    
    if (type === 'admin') {
      if (!childId) {
      toast.error('Error: Child ID is missing');
      return;
    }

    try {
      if(formState.admin_sign_admission == null || formState.admin_sign_admission == '')
      {
        toast.error('Error: Admin signature is missing');
        return;
      }
      const epochValue = new Date(formState.admin_sign_date_admission).getTime();

      // Prepare the complete form data for API call including child_id
      // Create a copy to avoid mutating the original initialFormData
      let saveData = { ...initialFormData ,
        child_id: childId,
        important_fam_members: initialFormData.important_fam_members || '',
        about_family_celebrations: initialFormData.about_family_celebrations || '',
        what_child_interests: initialFormData.what_child_interests || '',
        drop_off_time: initialFormData.drop_off_time || '',
        pick_up_time: initialFormData.pick_up_time || '',
        hasExistingCondition: initialFormData.existing_illness_allergy === 1 ? 'Yes' : (initialFormData.existing_illness_allergy === 2 ? 'No' : ''),
        existingConditionExplanation: initialFormData.explain_for_existing_illness_allergy || '',
        functioningAtAge: initialFormData.functioning_at_age === 1 ? 'Yes' : (initialFormData.functioning_at_age === 2 ? 'No' : ''),
        functioningAtAgeExplanation: initialFormData.explain_for_functioning_at_age || '',
        canWalk: initialFormData.able_to_walk === 1 ? 'Yes' : (initialFormData.able_to_walk === 2 ? 'No' : ''),
        canWalkExplanation: initialFormData.explain_for_able_to_walk || '',
        canCommunicate: initialFormData.communicate_their_needs === 1 ? 'Yes' : (initialFormData.communicate_their_needs === 2 ? 'No' : ''),
        canCommunicateExplanation: initialFormData.explain_for_communicate_their_needs || '',
        needsTreatment: initialFormData.any_medication === 1 ? 'Yes' : (initialFormData.any_medication === 2 ? 'No' : ''),
        treatmentExplanation: initialFormData.explain_for_any_medication || '',
        usesEquipment: initialFormData.utilize_special_equipment === 1 ? 'Yes' : (initialFormData.utilize_special_equipment === 2 ? 'No' : ''),
        equipmentExplanation: initialFormData.explain_for_utilize_special_equipment || '',
        needsSupervision: initialFormData.significant_periods === 1 ? 'Yes' : (initialFormData.significant_periods === 2 ? 'No' : ''),
        supervisionExplanation: initialFormData.explain_for_significant_periods || '',
        needsAccommodation: initialFormData.desire_any_accommodations === 1 ? 'Yes' : (initialFormData.desire_any_accommodations === 2 ? 'No' : ''),
        accommodationExplanation: initialFormData.explain_for_desire_any_accommodations || '',
        comments: initialFormData.additional_information || '',
        hasSpecialDiet: initialFormData.restricted_diet === 1 ? 'Yes' : (initialFormData.restricted_diet === 2 ? 'No' : ''),
        specialDietExplanation: initialFormData.restricted_diet_reason || '',
        eatsOnOwn: initialFormData.eat_own === 1 ? 'Yes' : (initialFormData.eat_own === 2 ? 'No' : ''),
        eatsOnOwnExplanation: initialFormData.eat_own_reason || '',
        favoriteFoods: initialFormData.favorite_foods || '',
        agreementConfirmed: initialFormData.do_you_agree_this === 'on' ? true : false,
        restsInMiddleOfDay: initialFormData.rest_in_the_middle_day === 1 ? 'Yes' : (initialFormData.rest_in_the_middle_day === 2 ? 'No' : ''),
        restExplanation: initialFormData.reason_for_rest_in_the_middle_day || '',
        napRoutine: initialFormData.rest_routine || '',
        isToiletTrained: initialFormData.toilet_trained === 1 ? 'Yes' : (initialFormData.toilet_trained === 2 ? 'No' : ''),
        toiletTrainedExplanation: initialFormData.reason_for_toilet_trained || '',
        child_first_name: initialFormData.child_first_name,
        child_last_name: initialFormData.child_last_name,
        nick_name: initialFormData.nick_name,
        dob: initialFormData.dob,
        primary_language: initialFormData.primary_language,
        school_age_child_school: initialFormData.school_age_child_school,
        gender: initialFormData.gender,
        primary_parent_info: initialFormData.primary_parent_info,
        additional_parent_info: initialFormData.additional_parent_info,
        emergency_contact_info: initialFormData.emergency_contact_info,
        child_care_provider_info: initialFormData.child_care_provider_info,
        dentist_info: initialFormData.dentist_info ? JSON.parse(initialFormData.dentist_info) : {},
  emergency_contacts: initialFormData.emergency_contacts ? JSON.parse(initialFormData.emergency_contacts) : [],
  care_provider_info: initialFormData.care_provider_info ? JSON.parse(initialFormData.care_provider_info) : {},
      };


      // Convert values to proper types for API expectations
      Object.keys(saveData).forEach(key => {
        if (saveData[key] === null || saveData[key] === undefined) {
          saveData[key] = '';
        } else if (Array.isArray(saveData[key])) {
          // Keep arrays as arrays - don't convert to string
          saveData[key] = saveData[key];
        } else if (typeof saveData[key] === 'object' && saveData[key] !== null) {
          // Keep objects as objects - don't convert to string
          saveData[key] = saveData[key];
        } else if (typeof saveData[key] === 'number') {
          // Convert numbers to strings for simple fields
          saveData[key] = String(saveData[key]);
        } else if (typeof saveData[key] === 'boolean') {
          // Convert booleans to strings
          saveData[key] = String(saveData[key]);
        }
        // Leave strings as strings
      });
      
      // Set the required fields
      saveData['child_id'] = childId;
      saveData['school_id'] = school_id;
      saveData['pointer'] = 22;
      saveData['admin_sign_date_admission'] = Math.floor(new Date(formState.admin_sign_date_admission).getTime())
      saveData['admin_sign_admission'] = formState.admin_sign_admission;


      // Call the API to save all form data
      await updateAdmissionData(saveData);
      
      // Show success alert
      toast.success('Admin signature submitted successfully!');
    } catch (error) {
      console.error('Failed to save Admission form:', error);
      toast.error('Error saving admission form data. Please try again.');
    }
  
  }
   
  };

  // Validation function
  const isAdminSignatureComplete = () => {
    return formState.admin_sign_admission && 
           formState.admin_sign_admission.toString().trim() !== '' &&
           formState.admin_sign_date_admission && 
           formState.admin_sign_date_admission.toString().trim() !== '';
  };

  return (
    <div className="space-y-6">
      <Toaster richColors position="top-center" />
      
      {/* Admin Signature Form */}
      <Card>
        <CardHeader className="bg-[#0F2D52] text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6" />
              <div>
                <CardTitle className="text-2xl">Admin Signature</CardTitle>
                <CardDescription className="text-blue-100">
                  Administrative approval and verification
                </CardDescription>
              </div>
            </div>
            {isAdminSignatureComplete() && (
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
              <Label htmlFor="admin_sign_admission">Admin Signature *</Label>
              <Input
                id="admin_sign_admission"
                name="admin_sign_admission"
                type="text"
                placeholder="Type admin name as signature"
                value={formState.admin_sign_admission}
                onChange={(e) => handleInputChange('admin_sign_admission', e.target.value)}
                className="w-full"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="admin_sign_date_admission">Signature Date *</Label>
              <Input
                id="admin_sign_date_admission"
                name="admin_sign_date_admission"
                type="datetime-local"
                value={formState.admin_sign_date_admission}
                onChange={(e) => handleInputChange('admin_sign_date_admission', e.target.value)}
                className="w-full"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={() => handleSubmit('admin')} 
              className="bg-[#0F2D52] hover:bg-[#0F2D52]/90"
              disabled={!formState.admin_sign_admission || !formState.admin_sign_date_admission}
            >
              <Send className="h-4 w-4 mr-2" />
              Submit Admin Approval
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default adminSign;