import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ScrollText, 
  FileText, 
  User,
  Shield,
  CheckCircle,
  AlertCircle,
  Save,
  Send,
  Clock,
  Calendar,
  Edit3
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

const EnrollmentFormNew = ({ selectedSubForm = null, initialFormData = null, childId = null }) => {
  const [activeTab, setActiveTab] = useState(selectedSubForm ? getTabFromSubForm(selectedSubForm) : 'terms');
  const [formData, setFormData] = useState({
    point_one_field_one: new Date().toISOString().split('T')[0],
    point_one_field_three: '',
    point_two_initial_here: '',
    point_three_initial_here: '',
    point_four_initial_here: '',
    point_five_initial_here: '',
    point_six_initial_here: '',
    point_seven_initial_here: '',
    point_eight_initial_here: '',
    point_nine_initial_here: '',
    point_ten_initial_here: '',
    point_eleven_initial_here: '',
    point_twelve_initial_here: '',
    point_thirteen_initial_here: '',
    point_fourteen_initial_here: '',
    point_fifteen_initial_here: '',
    point_sixteen_initial_here: '',
    point_seventeen_initial_here: '',
    point_eighteen_initial_here: '',
    point_ninteen_initial_here: '',
    preferred_start_date: '',
    preferred_schedule: '',
    full_day: false,
    half_day: false,
    parent_sign_enroll: '',
    parent_sign_date_enroll: '',
    admin_sign_enroll: '',
    admin_sign_date_enroll: ''
  });

  // Convert selectedSubForm to tab ID
  function getTabFromSubForm(subForm) {
    if (!subForm) return 'terms';
    
    switch (subForm.toLowerCase()) {
      case 'enrollment agreement':
      case 'terms and conditions':
        return 'terms';
      case 'schedule preferences':
        return 'schedule';
      case 'parent signature':
        return 'parent';
      case 'admin signature':
        return 'admin';
      default:
        return 'terms';
    }
  }

  // API function to update enrollment form data
  const updateEnrollmentData = async (fieldData) => {
    if (!childId) {
      toast.error('Child ID is required for API update');
      return;
    }

    try {
      const response = await fetch(`https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/enrollment_form/update/${childId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fieldData)
      });

      if (!response.ok) {
        throw new Error(`Failed to update enrollment data: ${response.status}`);
      }

      const result = await response.json();
      console.log('Enrollment data updated successfully:', result);
      return result;
    } catch (error) {
      console.error('Error updating enrollment data:', error);
      throw error;
    }
  };

  const handleChange = (name, value, type = 'text') => {
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? value : value
    }));
  };

  // Terms and conditions data
  const termsPoints = [
    { key: 'point_two_initial_here', title: 'Terms of Service Agreement', description: 'I agree to the terms of service and enrollment policies.' },
    { key: 'point_three_initial_here', title: 'Financial Responsibility', description: 'I understand and accept financial responsibility for tuition and fees.' },
    { key: 'point_four_initial_here', title: 'Health and Safety Policies', description: 'I acknowledge health and safety requirements and procedures.' },
    { key: 'point_five_initial_here', title: 'Pickup and Drop-off Procedures', description: 'I understand authorized pickup and drop-off procedures.' },
    { key: 'point_six_initial_here', title: 'Emergency Contact Information', description: 'I will maintain current emergency contact information.' },
    { key: 'point_seven_initial_here', title: 'Medical Authorization', description: 'I authorize emergency medical care if needed.' },
    { key: 'point_eight_initial_here', title: 'Behavior and Discipline Policy', description: 'I understand the behavior expectations and discipline policies.' },
    { key: 'point_nine_initial_here', title: 'Nutrition and Meal Policies', description: 'I understand meal and nutrition requirements.' },
    { key: 'point_ten_initial_here', title: 'Communication Policies', description: 'I agree to maintain open communication with staff.' },
    { key: 'point_eleven_initial_here', title: 'Holiday and Closure Policies', description: 'I understand holiday schedules and closure policies.' },
    { key: 'point_twelve_initial_here', title: 'Termination and Withdrawal', description: 'I understand termination and withdrawal procedures.' },
    { key: 'point_thirteen_initial_here', title: 'Privacy and Confidentiality', description: 'I understand privacy and confidentiality policies.' },
    { key: 'point_fourteen_initial_here', title: 'Photo and Media Release', description: 'I consent to photography and media use policies.' },
    { key: 'point_fifteen_initial_here', title: 'Technology and Device Policy', description: 'I understand technology and personal device policies.' },
    { key: 'point_sixteen_initial_here', title: 'Transportation Policy', description: 'I understand transportation and field trip policies.' },
    { key: 'point_seventeen_initial_here', title: 'Grievance and Complaint Process', description: 'I understand the process for addressing concerns.' },
    { key: 'point_eighteen_initial_here', title: 'Parent Participation', description: 'I understand expectations for parent involvement.' },
    { key: 'point_ninteen_initial_here', title: 'Additional Terms', description: 'I agree to any additional terms and modifications.' }
  ];

  // Validation functions
  const isTermsComplete = () => {
    return termsPoints.every(point => formData[point.key] && formData[point.key].trim() !== '');
  };

  const isScheduleComplete = () => {
    return formData.preferred_start_date && 
           formData.preferred_schedule && 
           (formData.full_day || formData.half_day);
  };

  const isParentSignatureComplete = () => {
    return formData.parent_sign_enroll && formData.parent_sign_enroll.trim() !== '';
  };

  const isAdminSignatureComplete = () => {
    return formData.admin_sign_enroll && formData.admin_sign_enroll.trim() !== '' &&
           formData.admin_sign_date_enroll && formData.admin_sign_date_enroll.trim() !== '';
  };

  const handleSave = async () => {
    if (!childId) {
      toast.error('Error: Child ID is missing');
      return;
    }

    try {
      const saveData = {
        child_id: childId,
        point_one_field_one: formData.point_one_field_one,
        point_one_field_three: formData.point_one_field_three,
        ...Object.fromEntries(
          termsPoints.map(point => [point.key, formData[point.key]])
        ),
        preferred_start_date: formData.preferred_start_date,
        preferred_schedule: formData.preferred_schedule,
        full_day: formData.full_day.toString(),
        half_day: formData.half_day.toString()
      };

      await updateEnrollmentData(saveData);
      toast.success('Enrollment form data saved successfully!');
    } catch (error) {
      console.error('Failed to save enrollment form:', error);
      toast.error('Error saving enrollment form data. Please try again.');
    }
  };

  const handleSubmit = async (type) => {
    if (!childId) {
      toast.error('Error: Child ID is missing');
      return;
    }

    try {
      let saveData = { child_id: childId };

      if (type === 'parent') {
        if (!formData.parent_sign_enroll || formData.parent_sign_enroll === '') {
          toast.error('Error: Parent signature is missing');
          return;
        }

        saveData = {
          ...saveData,
          parent_sign_enroll: formData.parent_sign_enroll,
          parent_sign_date_enroll: new Date().toLocaleDateString('en-CA')
        };
      } else if (type === 'admin') {
        if (!formData.admin_sign_enroll || formData.admin_sign_enroll === '') {
          toast.error('Error: Admin signature is missing');
          return;
        }

        const epochValue = new Date(formData.admin_sign_date_enroll).getTime();
        saveData = {
          child_id: childId,
          point_one_field_one: formData.point_one_field_one,
          point_one_field_three: formData.point_one_field_three,
          ...Object.fromEntries(
            termsPoints.map(point => [point.key, formData[point.key]])
          ),
          preferred_start_date: formData.preferred_start_date,
          preferred_schedule: formData.preferred_schedule,
          full_day: formData.full_day.toString(),
          half_day: formData.half_day.toString(),
          parent_sign_enroll: formData.parent_sign_enroll,
          parent_sign_date_enroll: formData.parent_sign_date_enroll,
          admin_sign_enroll: formData.admin_sign_enroll,
          admin_sign_date_enroll: epochValue
        };
      }

      await updateEnrollmentData(saveData);
      toast.success('Enrollment form data saved successfully!');
    } catch (error) {
      console.error('Failed to save enrollment form:', error);
      toast.error('Error saving enrollment form data. Please try again.');
    }
  };

  useEffect(() => {
    if (initialFormData) {
      setFormData(prevState => ({
        ...prevState,
        ...initialFormData
      }));
    }
  }, [initialFormData]);

  // Calculate progress
  const completedSections = [
    isTermsComplete(),
    isScheduleComplete(),
    isParentSignatureComplete(),
    isAdminSignatureComplete()
  ].filter(Boolean).length;
  
  const totalSections = 4;
  const progress = (completedSections / totalSections) * 100;

  const formSections = [
    {
      id: 'terms',
      title: 'Terms & Conditions',
      icon: <ScrollText className="h-5 w-5" />,
      description: 'Review and initial all terms and conditions',
      isComplete: isTermsComplete()
    },
    {
      id: 'schedule',
      title: 'Schedule Preferences',
      icon: <Calendar className="h-5 w-5" />,
      description: 'Set preferred schedule and start date',
      isComplete: isScheduleComplete()
    },
    {
      id: 'parent',
      title: 'Parent Signature',
      icon: <User className="h-5 w-5" />,
      description: 'Parent agreement and signature',
      isComplete: isParentSignatureComplete()
    },
    {
      id: 'admin',
      title: 'Admin Signature',
      icon: <Shield className="h-5 w-5" />,
      description: 'Administrative approval and signature',
      isComplete: isAdminSignatureComplete()
    }
  ];

  return (
    <div className="space-y-6">
      <Toaster richColors position="top-center" />
      
      {/* Header Section */}
      <Card>
        <CardHeader className="bg-[#0F2D52] text-white">
          <CardTitle className="text-2xl flex items-center gap-3">
            <ScrollText className="h-6 w-6" />
            Enrollment Agreement
          </CardTitle>
          <CardDescription className="text-blue-100">
            Complete enrollment agreement and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">Progress</div>
              <div className="text-sm font-medium text-[#0F2D52]">
                {completedSections} of {totalSections} sections completed
              </div>
            </div>
            <Badge variant={progress === 100 ? "default" : "secondary"}>
              {progress.toFixed(0)}% Complete
            </Badge>
          </div>
          <Progress value={progress} className="mb-4" />
          
          {progress < 100 && (
            <div className="flex items-center gap-2 text-sm text-amber-600">
              <AlertCircle className="h-4 w-4" />
              Please complete all sections before submitting the form
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="inline-flex h-auto min-w-full w-max p-1 bg-gray-100">
            {formSections.map((section) => (
              <TabsTrigger 
                key={section.id} 
                value={section.id}
                className="flex items-center gap-2 whitespace-nowrap px-4 py-3 data-[state=active]:bg-white data-[state=active]:text-[#0F2D52]"
              >
                {section.icon}
                <span className="hidden sm:inline">{section.title}</span>
                <span className="sm:hidden">{section.title.split(' ')[0]}</span>
                {section.isComplete && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Terms and Conditions */}
        <TabsContent value="terms" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ScrollText className="h-5 w-5 text-[#0F2D52]" />
                  <div>
                    <CardTitle className="text-[#0F2D52]">Terms & Conditions</CardTitle>
                    <CardDescription>Please initial each section to acknowledge agreement</CardDescription>
                  </div>
                </div>
                {isTermsComplete() && (
                  <Badge className="bg-green-100 text-green-800">Complete</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="effective_date">Effective Date</Label>
                  <Input
                    id="effective_date"
                    name="point_one_field_one"
                    type="date"
                    value={formData.point_one_field_one}
                    onChange={(e) => handleChange('point_one_field_one', e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="agreement_version">Agreement Version</Label>
                  <Input
                    id="agreement_version"
                    name="point_one_field_three"
                    type="text"
                    placeholder="Enter agreement version"
                    value={formData.point_one_field_three}
                    onChange={(e) => handleChange('point_one_field_three', e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {termsPoints.map((point, index) => (
                  <div key={point.key} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {index + 2}. {point.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {point.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={point.key} className="text-sm font-medium">
                        Initial:
                      </Label>
                      <Input
                        id={point.key}
                        name={point.key}
                        type="text"
                        maxLength={5}
                        placeholder="Initial"
                        value={formData[point.key]}
                        onChange={(e) => handleChange(point.key, e.target.value)}
                        className="w-16 text-center"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleSave} className="bg-[#0F2D52] hover:bg-[#0F2D52]/90">
                  <Save className="h-4 w-4 mr-2" />
                  Save Progress
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Preferences */}
        <TabsContent value="schedule" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-[#0F2D52]" />
                  <div>
                    <CardTitle className="text-[#0F2D52]">Schedule Preferences</CardTitle>
                    <CardDescription>Set your preferred start date and schedule options</CardDescription>
                  </div>
                </div>
                {isScheduleComplete() && (
                  <Badge className="bg-green-100 text-green-800">Complete</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="preferred_start_date">Preferred Start Date *</Label>
                  <Input
                    id="preferred_start_date"
                    name="preferred_start_date"
                    type="date"
                    value={formData.preferred_start_date}
                    onChange={(e) => handleChange('preferred_start_date', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferred_schedule">Preferred Schedule *</Label>
                  <Input
                    id="preferred_schedule"
                    name="preferred_schedule"
                    type="text"
                    placeholder="e.g., Monday-Friday 8AM-5PM"
                    value={formData.preferred_schedule}
                    onChange={(e) => handleChange('preferred_schedule', e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Schedule Type *</Label>
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="full_day"
                      checked={formData.full_day}
                      onCheckedChange={(checked) => handleChange('full_day', checked, 'checkbox')}
                    />
                    <Label htmlFor="full_day" className="text-sm font-normal">
                      Full Day Program
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="half_day"
                      checked={formData.half_day}
                      onCheckedChange={(checked) => handleChange('half_day', checked, 'checkbox')}
                    />
                    <Label htmlFor="half_day" className="text-sm font-normal">
                      Half Day Program
                    </Label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleSave} className="bg-[#0F2D52] hover:bg-[#0F2D52]/90">
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Parent Signature */}
        <TabsContent value="parent" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-[#0F2D52]" />
                  <div>
                    <CardTitle className="text-[#0F2D52]">Parent Signature</CardTitle>
                    <CardDescription>Parent agreement and authorization</CardDescription>
                  </div>
                </div>
                {isParentSignatureComplete() && (
                  <Badge className="bg-green-100 text-green-800">Complete</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="parent_signature">Parent Signature *</Label>
                <Input
                  id="parent_signature"
                  name="parent_sign_enroll"
                  type="text"
                  placeholder="Type your full name as signature"
                  value={formData.parent_sign_enroll}
                  onChange={(e) => handleChange('parent_sign_enroll', e.target.value)}
                  className="w-full"
                />
                <p className="text-sm text-gray-500">
                  By typing your name above, you agree to all terms and conditions in this enrollment agreement.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => handleSubmit('parent')} 
                  className="bg-[#0F2D52] hover:bg-[#0F2D52]/90"
                  disabled={!formData.parent_sign_enroll}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Signature
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admin Signature */}
        <TabsContent value="admin" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-[#0F2D52]" />
                  <div>
                    <CardTitle className="text-[#0F2D52]">Admin Signature</CardTitle>
                    <CardDescription>Administrative approval and verification</CardDescription>
                  </div>
                </div>
                {isAdminSignatureComplete() && (
                  <Badge className="bg-green-100 text-green-800">Complete</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="admin_signature">Admin Signature *</Label>
                  <Input
                    id="admin_signature"
                    name="admin_sign_enroll"
                    type="text"
                    placeholder="Type admin name as signature"
                    value={formData.admin_sign_enroll}
                    onChange={(e) => handleChange('admin_sign_enroll', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin_date">Signature Date *</Label>
                  <Input
                    id="admin_date"
                    name="admin_sign_date_enroll"
                    type="date"
                    value={formData.admin_sign_date_enroll}
                    onChange={(e) => handleChange('admin_sign_date_enroll', e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => handleSubmit('admin')} 
                  className="bg-[#0F2D52] hover:bg-[#0F2D52]/90"
                  disabled={!formData.admin_sign_enroll || !formData.admin_sign_date_enroll}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Admin Approval
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnrollmentFormNew;