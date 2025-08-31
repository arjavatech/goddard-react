import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CreditCard, 
  FileText, 
  User,
  Shield,
  CheckCircle,
  AlertCircle,
  Save,
  Send
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { useAuth0 } from '@auth0/auth0-react';
import { submitAndCompleteForm } from '@/utils/formSubmission';

const AuthorizationFormNew = ({ selectedSubForm = null, initialFormData = null, childId = null, onSubmitSuccess }) => {
  const [activeTab, setActiveTab] = useState(selectedSubForm ? getTabFromSubForm(selectedSubForm) : 'ach');
  const [formData, setFormData] = useState({
    child_id: '',
    bank_routing: '',
    bank_account: '',
    driver_license: '',
    state: '',
    i: '',
    parent_sign_ach: '',
    parent_sign_date_ach: '',
    admin_sign_ach: '',
    admin_sign_date_ach: ''
  });

  // Convert selectedSubForm to tab ID
  function getTabFromSubForm(subForm) {
    if (!subForm) return 'ach';
    
    switch (subForm.toLowerCase()) {
      case 'authorization ach':
        return 'ach';
      case 'parent signature':
        return 'parent';
      case 'admin signature':
        return 'admin';
      default:
        return 'ach';
    }
  }

  // US States array
  const states = [
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' },
    { value: 'DE', label: 'Delaware' },
    { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' },
    { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' },
    { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' },
    { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' },
    { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' },
    { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' },
    { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' },
    { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' },
    { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' },
    { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' },
    { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' },
    { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' },
    { value: 'ND', label: 'North Dakota' },
    { value: 'OH', label: 'Ohio' },
    { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' },
    { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' },
    { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' },
    { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' },
    { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' },
    { value: 'VA', label: 'Virginia' },
    { value: 'WA', label: 'Washington' },
    { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' },
    { value: 'WY', label: 'Wyoming' }
  ];

  // Use standardized form submission
  const { getAccessTokenSilently } = useAuth0();

  const handleChange = (name, value) => {
    if (name === 'admin_sign_date_ach') {
      const epochValue = new Date(value).getTime();
      formData.admin_sign_date_ach = epochValue;
      console.log('Epoch time in ms:', epochValue);
    }
    
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Validation functions
  const isACHFormComplete = () => {
    const requiredFields = ['bank_routing', 'bank_account', 'driver_license', 'state'];
    return requiredFields.every(field => 
      formData[field] && formData[field].toString().trim() !== ''
    );
  };

  const isParentSignatureComplete = () => {
    return formData.parent_sign_ach && formData.parent_sign_ach.toString().trim() !== '';
  };

  const isAdminSignatureComplete = () => {
    return formData.admin_sign_ach && formData.admin_sign_ach.toString().trim() !== '' &&
           formData.admin_sign_date_ach && formData.admin_sign_date_ach.toString().trim() !== '';
  };

  const handleSave = async () => {
    if (!childId) {
      toast.error('Error: Child ID is missing');
      return;
    }

    try {
      const saveData = {
        child_id: childId,
        bank_routing: formData.bank_routing,
        bank_account: formData.bank_account.toString(),
        driver_license: formData.driver_license,
        state: formData.state,
        i: formData.i
      };

      const success = await submitAndCompleteForm(
        childId, 
        saveData, 
        'authorization', 
        getAccessTokenSilently,
        onSubmitSuccess
      );
      
      if (success) {
        console.log('✅ Authorization form saved and dashboard will refresh');
      }
    } catch (error) {
      console.error('Failed to save authorization form:', error);
      toast.error('Error saving authorization form data. Please try again.');
    }
  };

  const handleSubmit = async (type) => {
    if (!childId) {
      toast.error('Error: Child ID is missing');
      return;
    }

    try {
      let saveData = {
        child_id: childId,
      };

      if (type === 'parent') {
        if (!formData.parent_sign_ach || formData.parent_sign_ach === '') {
          toast.error('Error: Parent signature is missing');
          return;
        }

        saveData = {
          ...saveData,
          parent_sign_ach: formData.parent_sign_ach,
          parent_sign_date_ach: new Date().toLocaleDateString('en-CA')
        };
      } else if (type === 'admin') {
        if (!formData.admin_sign_ach || formData.admin_sign_ach === '') {
          toast.error('Error: Admin signature is missing');
          return;
        }

        const epochValue = new Date(formData.admin_sign_date_ach).getTime();
        saveData = {
          ...saveData,
          bank_routing: formData.bank_routing.toString(),
          bank_account: formData.bank_account.toString(),
          driver_license: formData.driver_license,
          state: formData.state,
          i: formData.i,
          parent_sign_ach: formData.parent_sign_ach,
          parent_sign_date_ach: formData.parent_sign_date_ach,
          admin_sign_ach: formData.admin_sign_ach,
          admin_sign_date_ach: epochValue
        };
      }

      const success = await submitAndCompleteForm(
        childId, 
        saveData, 
        'authorization', 
        getAccessTokenSilently,
        onSubmitSuccess
      );
      
      if (success) {
        console.log(`✅ Authorization ${type} signature submitted and dashboard will refresh`);
      }
    } catch (error) {
      console.error('Failed to save authorization form:', error);
      toast.error('Error saving authorization form data. Please try again.');
    }
  };

  useEffect(() => {
    setFormData(prevState => ({
      ...prevState,
      parent_sign_date_ach: new Date().toISOString().split('T')[0]
    }));
  }, []);

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
    isACHFormComplete(),
    isParentSignatureComplete(),
    isAdminSignatureComplete()
  ].filter(Boolean).length;
  
  const totalSections = 3;
  const progress = (completedSections / totalSections) * 100;

  const formSections = [
    {
      id: 'ach',
      title: 'ACH Authorization',
      icon: <CreditCard className="h-5 w-5" />,
      description: 'Bank account and routing information',
      isComplete: isACHFormComplete()
    },
    {
      id: 'parent',
      title: 'Parent Signature',
      icon: <User className="h-5 w-5" />,
      description: 'Parent authorization signature',
      isComplete: isParentSignatureComplete()
    },
    {
      id: 'admin',
      title: 'Admin Signature',
      icon: <Shield className="h-5 w-5" />,
      description: 'Administrative approval signature',
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
            <CreditCard className="h-6 w-6" />
            Authorization Form
          </CardTitle>
          <CardDescription className="text-blue-100">
            Complete ACH authorization for automatic payments
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

        {/* ACH Form */}
        <TabsContent value="ach" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-[#0F2D52]" />
                  <div>
                    <CardTitle className="text-[#0F2D52]">ACH Authorization</CardTitle>
                    <CardDescription>Bank account information for automatic payments</CardDescription>
                  </div>
                </div>
                {isACHFormComplete() && (
                  <Badge className="bg-green-100 text-green-800">Complete</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bank_routing">Bank Routing Number *</Label>
                  <Input
                    id="bank_routing"
                    name="bank_routing"
                    type="text"
                    maxLength={20}
                    placeholder="Enter routing number"
                    value={formData.bank_routing}
                    onChange={(e) => handleChange('bank_routing', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bank_account">Bank Account Number *</Label>
                  <Input
                    id="bank_account"
                    name="bank_account"
                    type="text"
                    maxLength={20}
                    placeholder="Enter account number"
                    value={formData.bank_account}
                    onChange={(e) => handleChange('bank_account', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="driver_license">Driver's License *</Label>
                  <Input
                    id="driver_license"
                    name="driver_license"
                    type="text"
                    maxLength={20}
                    placeholder="Enter driver's license number"
                    value={formData.driver_license}
                    onChange={(e) => handleChange('driver_license', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Select value={formData.state} onValueChange={(value) => handleChange('state', value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state.value} value={state.value}>
                          {state.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additional_info">Additional Information</Label>
                <Input
                  id="additional_info"
                  name="i"
                  type="text"
                  placeholder="Any additional information"
                  value={formData.i}
                  onChange={(e) => handleChange('i', e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleSave} className="bg-[#0F2D52] hover:bg-[#0F2D52]/90">
                  <Save className="h-4 w-4 mr-2" />
                  Save Form
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
                    <CardDescription>Parent authorization and agreement</CardDescription>
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
                  name="parent_sign_ach"
                  type="text"
                  placeholder="Type your full name as signature"
                  value={formData.parent_sign_ach}
                  onChange={(e) => handleChange('parent_sign_ach', e.target.value)}
                  className="w-full"
                />
                <p className="text-sm text-gray-500">
                  By typing your name above, you agree to the terms and authorize ACH transactions.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => handleSubmit('parent')} 
                  className="bg-[#0F2D52] hover:bg-[#0F2D52]/90"
                  disabled={!formData.parent_sign_ach}
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
                    name="admin_sign_ach"
                    type="text"
                    placeholder="Type admin name as signature"
                    value={formData.admin_sign_ach}
                    onChange={(e) => handleChange('admin_sign_ach', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin_date">Signature Date *</Label>
                  <Input
                    id="admin_date"
                    name="admin_sign_date_ach"
                    type="date"
                    value={formData.admin_sign_date_ach}
                    onChange={(e) => handleChange('admin_sign_date_ach', e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => handleSubmit('admin')} 
                  className="bg-[#0F2D52] hover:bg-[#0F2D52]/90"
                  disabled={!formData.admin_sign_ach || !formData.admin_sign_date_ach}
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

export default AuthorizationFormNew;