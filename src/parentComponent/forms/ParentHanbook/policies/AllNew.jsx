import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BookOpen, 
  User,
  Shield,
  CheckCircle,
  AlertCircle,
  Save,
  Send,
  Info
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

// Import existing policy components
import MissionStatement from './MissionStatement';
import TheGoddardSchool from './TheGoddardSchool';
import GeneralEnrollmentProcedure from './GeneralEnrollmentProcedure';
import StatementOfConfidentiality from './StatementOfConfidentiality';
import ParentAccess from './ParentAccess';
import ReleaseOfChildren from './ReleaseOfChildren';
import RegisterationTutionFees from './RegisterationTutionFees';
import OutsideEngagement from './OutsideEngagement';
import HealthPolicies from './HealthPolicies';
import MedicationProcedures from './MedicationProcedures';
import ToysFromHome from './ToysFromHome';
import RestTimeMealsSnacks from './RestTimeMealsSnacks';
import TransitionToiletTraining from './TransitionToiletTraining';
import EmergencyClosings from './EmergencyClosings';
import WebsiteAndBlog from './WebsiteAndBlogs';
import ExpulsionPolicy from './ExpulsionPolicy';
import AddressingIndividualChildConcern from './AddressingIndividualChildConcern';
import FinalWord from './FinalWord';

const ParentHandbookNew = ({ selectedSubForm = null, initialFormData = null, childId = null }) => {
  const [activeTab, setActiveTab] = useState(selectedSubForm ? getTabFromSubForm(selectedSubForm) : 'policies');
  const [openSection, setOpenSection] = useState('');
  const [formData, setFormData] = useState({
    welcome_goddard_agreement: '',
    mission_statement_agreement: '',
    general_information_agreement: '',
    medical_care_provider_agreement: '',
    parent_access_agreement: '',
    release_of_children_agreement: '',
    registration_fees_agreement: '',
    outside_engagements_agreement: '',
    health_policies_agreement: '',
    medication_procedures_agreement: '',
    bring_to_school_agreement: '',
    rest_time_agreement: '',
    training_philosophy_agreement: '',
    affiliation_policy_agreement: '',
    security_issue_agreement: '',
    expulsion_policy_agreement: '',
    addressing_individual_child_agreement: '',
    finalword_agreement: '',
    parent_sign_handbook: '',
    parent_sign_date_handbook: '',
    admin_sign_handbook: '',
    admin_sign_date_handbook: '',
    handbook_pointer: ''
  });

  // Convert selectedSubForm to tab ID
  function getTabFromSubForm(subForm) {
    if (!subForm) return 'policies';
    
    switch (subForm.toLowerCase()) {
      case 'policy':
        return 'policies';
      case 'parent signature':
        return 'parent';
      case 'admin signature':
        return 'admin';
      default:
        return 'policies';
    }
  }

  // API function to update parent handbook data
  const updateParentHandbookData = async (fieldData) => {
    if (!childId) {
      toast.error('Child ID is required for API update');
      return;
    }

    try {
      const response = await fetch(`https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/parent_handbook/update/${childId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fieldData)
      });

      if (!response.ok) {
        throw new Error(`Failed to update parent handbook data: ${response.status}`);
      }

      const result = await response.json();
      console.log('Parent handbook data updated successfully:', result);
      return result;
    } catch (error) {
      console.error('Error updating parent handbook data:', error);
      throw error;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Validation functions
  const isPoliciesComplete = () => {
    return [
      formData.welcome_goddard_agreement,
      formData.mission_statement_agreement,
      formData.general_information_agreement,
      formData.medical_care_provider_agreement,
      formData.parent_access_agreement,
      formData.release_of_children_agreement,
      formData.registration_fees_agreement,
      formData.outside_engagements_agreement,
      formData.health_policies_agreement,
      formData.medication_procedures_agreement,
      formData.bring_to_school_agreement,
      formData.rest_time_agreement,
      formData.training_philosophy_agreement,
      formData.affiliation_policy_agreement,
      formData.security_issue_agreement,
      formData.expulsion_policy_agreement,
      formData.addressing_individual_child_agreement,
      formData.finalword_agreement
    ].every(agreement => agreement === 'on');
  };

  const isParentSignatureComplete = () => {
    return formData.parent_sign_handbook && formData.parent_sign_handbook.trim() !== '';
  };

  const isAdminSignatureComplete = () => {
    return formData.admin_sign_handbook && formData.admin_sign_handbook.trim() !== '' &&
           formData.admin_sign_date_handbook && formData.admin_sign_date_handbook.trim() !== '';
  };

  const handleSave = async () => {
    if (!childId) {
      toast.error('Error: Child ID is missing');
      return;
    }

    try {
      const saveData = {
        child_id: childId,
        welcome_goddard_agreement: formData.welcome_goddard_agreement,
        mission_statement_agreement: formData.mission_statement_agreement,
        general_information_agreement: formData.general_information_agreement,
        medical_care_provider_agreement: formData.medical_care_provider_agreement,
        parent_access_agreement: formData.parent_access_agreement,
        release_of_children_agreement: formData.release_of_children_agreement,
        registration_fees_agreement: formData.registration_fees_agreement,
        outside_engagements_agreement: formData.outside_engagements_agreement,
        health_policies_agreement: formData.health_policies_agreement,
        medication_procedures_agreement: formData.medication_procedures_agreement,
        bring_to_school_agreement: formData.bring_to_school_agreement,
        rest_time_agreement: formData.rest_time_agreement,
        training_philosophy_agreement: formData.training_philosophy_agreement,
        affiliation_policy_agreement: formData.affiliation_policy_agreement,
        security_issue_agreement: formData.security_issue_agreement,
        expulsion_policy_agreement: formData.expulsion_policy_agreement,
        addressing_individual_child_agreement: formData.addressing_individual_child_agreement,
        finalword_agreement: formData.finalword_agreement
      };

      await updateParentHandbookData(saveData);
      toast.success('Parent handbook data saved successfully!');
    } catch (error) {
      console.error('Failed to save parent handbook:', error);
      toast.error('Error saving parent handbook data. Please try again.');
    }
  };

  const handleSubmit = async (type) => {
    if (!childId) {
      toast.error('Error: Child ID is missing');
      return;
    }

    try {
      if (type === 'parent') {
        if (!formData.parent_sign_handbook || formData.parent_sign_handbook === '') {
          toast.error('Error: Parent signature is missing');
          return;
        }

        const saveData = {
          child_id: childId,
          parent_sign_handbook: formData.parent_sign_handbook,
          parent_sign_date_handbook: new Date().toLocaleDateString('en-CA')
        };

        await updateParentHandbookData(saveData);
        toast.success('Parent signature saved successfully!');
      } else if (type === 'admin') {
        if (!formData.admin_sign_handbook || formData.admin_sign_handbook === '') {
          toast.error('Error: Admin signature is missing');
          return;
        }

        const epochValue = new Date(formData.admin_sign_date_handbook).getTime();
        const saveData = {
          child_id: childId,
          welcome_goddard_agreement: formData.welcome_goddard_agreement,
          mission_statement_agreement: formData.mission_statement_agreement,
          general_information_agreement: formData.general_information_agreement,
          medical_care_provider_agreement: formData.medical_care_provider_agreement,
          parent_access_agreement: formData.parent_access_agreement,
          release_of_children_agreement: formData.release_of_children_agreement,
          registration_fees_agreement: formData.registration_fees_agreement,
          outside_engagements_agreement: formData.outside_engagements_agreement,
          health_policies_agreement: formData.health_policies_agreement,
          medication_procedures_agreement: formData.medication_procedures_agreement,
          bring_to_school_agreement: formData.bring_to_school_agreement,
          rest_time_agreement: formData.rest_time_agreement,
          training_philosophy_agreement: formData.training_philosophy_agreement,
          affiliation_policy_agreement: formData.affiliation_policy_agreement,
          security_issue_agreement: formData.security_issue_agreement,
          expulsion_policy_agreement: formData.expulsion_policy_agreement,
          addressing_individual_child_agreement: formData.addressing_individual_child_agreement,
          finalword_agreement: formData.finalword_agreement,
          parent_sign_handbook: formData.parent_sign_handbook,
          parent_sign_date_handbook: formData.parent_sign_date_handbook,
          admin_sign_handbook: formData.admin_sign_handbook,
          admin_sign_date_handbook: epochValue
        };

        await updateParentHandbookData(saveData);
        toast.success('Admin signature saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save parent handbook:', error);
      toast.error('Error saving parent handbook data. Please try again.');
    }
  };

  useEffect(() => {
    setFormData(prevState => ({
      ...prevState,
      parent_sign_date_handbook: new Date().toISOString().split('T')[0]
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
  const completedPolicies = [
    formData.welcome_goddard_agreement,
    formData.mission_statement_agreement,
    formData.general_information_agreement,
    formData.medical_care_provider_agreement,
    formData.parent_access_agreement,
    formData.release_of_children_agreement,
    formData.registration_fees_agreement,
    formData.outside_engagements_agreement,
    formData.health_policies_agreement,
    formData.medication_procedures_agreement,
    formData.bring_to_school_agreement,
    formData.rest_time_agreement,
    formData.training_philosophy_agreement,
    formData.affiliation_policy_agreement,
    formData.security_issue_agreement,
    formData.expulsion_policy_agreement,
    formData.addressing_individual_child_agreement,
    formData.finalword_agreement
  ].filter(agreement => agreement === 'on').length;

  const totalPolicies = 18;
  const policyProgress = (completedPolicies / totalPolicies) * 100;

  const completedSections = [
    isPoliciesComplete(),
    isParentSignatureComplete(),
    isAdminSignatureComplete()
  ].filter(Boolean).length;
  
  const totalSections = 3;
  const overallProgress = (completedSections / totalSections) * 100;

  const renderPoliciesTab = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-[#0F2D52] flex items-center gap-3">
          <BookOpen className="h-5 w-5" />
          School Policies & Procedures
        </CardTitle>
        <CardDescription>
          Please review each policy section carefully and check the agreement box for each section
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Policy Acknowledgments</div>
            <Badge variant={policyProgress === 100 ? "default" : "secondary"}>
              {completedPolicies} of {totalPolicies} completed
            </Badge>
          </div>
          <Progress value={policyProgress} className="mb-2" />
        </div>

        <div className="space-y-2">
          <TheGoddardSchool 
            fieldValue={formData.welcome_goddard_agreement} 
            openSection={openSection} 
            setOpenSection={setOpenSection}
            handleChange={handleChange}
          />
          <MissionStatement 
            fieldValue={formData.mission_statement_agreement} 
            openSection={openSection} 
            setOpenSection={setOpenSection}
            handleChange={handleChange}
          />
          <GeneralEnrollmentProcedure 
            fieldValue={formData.general_information_agreement} 
            openSection={openSection} 
            setOpenSection={setOpenSection}
            handleChange={handleChange}
          />
          <StatementOfConfidentiality 
            fieldValue={formData.medical_care_provider_agreement} 
            openSection={openSection} 
            setOpenSection={setOpenSection}
            handleChange={handleChange}
          />
          <ParentAccess 
            fieldValue={formData.parent_access_agreement} 
            openSection={openSection} 
            setOpenSection={setOpenSection}
            handleChange={handleChange}
          />
          <ReleaseOfChildren 
            fieldValue={formData.release_of_children_agreement} 
            openSection={openSection} 
            setOpenSection={setOpenSection}
            handleChange={handleChange}
          />
          <RegisterationTutionFees 
            fieldValue={formData.registration_fees_agreement} 
            openSection={openSection} 
            setOpenSection={setOpenSection}
            handleChange={handleChange}
          />
          <OutsideEngagement 
            fieldValue={formData.outside_engagements_agreement} 
            openSection={openSection} 
            setOpenSection={setOpenSection}
            handleChange={handleChange}
          />
          <HealthPolicies 
            fieldValue={formData.health_policies_agreement} 
            openSection={openSection} 
            setOpenSection={setOpenSection}
            handleChange={handleChange}
          />
          <MedicationProcedures 
            fieldValue={formData.medication_procedures_agreement} 
            openSection={openSection} 
            setOpenSection={setOpenSection}
            handleChange={handleChange}
          />
          <ToysFromHome 
            fieldValue={formData.bring_to_school_agreement} 
            openSection={openSection} 
            setOpenSection={setOpenSection}
            handleChange={handleChange}
          />
          <RestTimeMealsSnacks 
            fieldValue={formData.rest_time_agreement} 
            openSection={openSection} 
            setOpenSection={setOpenSection}
            handleChange={handleChange}
          />
          <TransitionToiletTraining 
            fieldValue={formData.training_philosophy_agreement} 
            openSection={openSection} 
            setOpenSection={setOpenSection}
            handleChange={handleChange}
          />
          <EmergencyClosings 
            fieldValue={formData.affiliation_policy_agreement} 
            openSection={openSection} 
            setOpenSection={setOpenSection}
            handleChange={handleChange}
          />
          <WebsiteAndBlog 
            fieldValue={formData.security_issue_agreement} 
            openSection={openSection} 
            setOpenSection={setOpenSection}
            handleChange={handleChange}
          />
          <ExpulsionPolicy 
            fieldValue={formData.expulsion_policy_agreement} 
            openSection={openSection} 
            setOpenSection={setOpenSection}
            handleChange={handleChange}
          />
          <AddressingIndividualChildConcern 
            fieldValue={formData.addressing_individual_child_agreement} 
            openSection={openSection} 
            setOpenSection={setOpenSection}
            handleChange={handleChange}
          />
          <FinalWord 
            fieldValue={formData.finalword_agreement} 
            openSection={openSection} 
            setOpenSection={setOpenSection}
            handleSave={handleSave}
            handleChange={handleChange}
          />
        </div>

        <div className="flex gap-3 pt-6 border-t mt-6">
          <Button onClick={handleSave} className="bg-[#0F2D52] hover:bg-[#0F2D52]/90">
            <Save className="h-4 w-4 mr-2" />
            Save Progress
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderParentSignatureTab = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-[#0F2D52]" />
            <div>
              <CardTitle className="text-[#0F2D52]">Parent Signature</CardTitle>
              <CardDescription>Acknowledge all policies and procedures</CardDescription>
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
            name="parent_sign_handbook"
            type="text"
            placeholder="Type your full name as signature"
            value={formData.parent_sign_handbook}
            onChange={handleChange}
            className="w-full"
          />
          <p className="text-sm text-gray-500">
            By signing above, I acknowledge that I have read and agree to all policies in this handbook.
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            By providing your signature above, you acknowledge that you have read, understood, and agree to all policies and procedures in this Parent Handbook.
          </AlertDescription>
        </Alert>

        <div className="flex gap-3">
          <Button 
            onClick={() => handleSubmit('parent')} 
            className="bg-[#0F2D52] hover:bg-[#0F2D52]/90"
            disabled={!formData.parent_sign_handbook}
          >
            <Send className="h-4 w-4 mr-2" />
            Submit Parent Signature
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderAdminSignatureTab = () => (
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
              name="admin_sign_handbook"
              type="text"
              placeholder="Type admin name as signature"
              value={formData.admin_sign_handbook}
              onChange={handleChange}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin_date">Signature Date *</Label>
            <Input
              id="admin_date"
              name="admin_sign_date_handbook"
              type="datetime-local"
              value={formData.admin_sign_date_handbook}
              onChange={handleChange}
              className="w-full"
            />
          </div>
        </div>

        <Alert variant="default">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            This signature confirms administrative review and approval of the parent handbook acknowledgment and all associated documentation.
          </AlertDescription>
        </Alert>

        <div className="flex gap-3">
          <Button 
            onClick={() => handleSubmit('admin')} 
            className="bg-[#0F2D52] hover:bg-[#0F2D52]/90"
            disabled={!formData.admin_sign_handbook || !formData.admin_sign_date_handbook}
          >
            <Send className="h-4 w-4 mr-2" />
            Submit Admin Approval
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Toaster richColors position="top-center" />
      
      {/* Header Section */}
      <Card>
        <CardHeader className="bg-[#0F2D52] text-white">
          <CardTitle className="text-2xl flex items-center gap-3">
            <BookOpen className="h-6 w-6" />
            Parent Handbook
          </CardTitle>
          <CardDescription className="text-blue-100">
            Review and acknowledge all school policies and procedures
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Policy Acknowledgments</div>
                <Badge variant={policyProgress === 100 ? "default" : "secondary"}>
                  {completedPolicies} of {totalPolicies}
                </Badge>
              </div>
              <Progress value={policyProgress} className="mb-2" />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Overall Progress</div>
                <Badge variant={overallProgress === 100 ? "default" : "secondary"}>
                  {overallProgress.toFixed(0)}% Complete
                </Badge>
              </div>
              <Progress value={overallProgress} className="mb-2" />
            </div>
          </div>
          
          {overallProgress < 100 && (
            <div className="flex items-center gap-2 text-sm text-amber-600">
              <AlertCircle className="h-4 w-4" />
              Please complete all policy acknowledgments and signatures
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="policies" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Policies</span>
            <span className="sm:hidden">Policies</span>
            {isPoliciesComplete() && (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
          </TabsTrigger>
          <TabsTrigger value="parent" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Parent Signature</span>
            <span className="sm:hidden">Parent</span>
            {isParentSignatureComplete() && (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
          </TabsTrigger>
          <TabsTrigger value="admin" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Admin Signature</span>
            <span className="sm:hidden">Admin</span>
            {isAdminSignatureComplete() && (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="policies">
          {renderPoliciesTab()}
        </TabsContent>
        
        <TabsContent value="parent">
          {renderParentSignatureTab()}
        </TabsContent>
        
        <TabsContent value="admin">
          {renderAdminSignatureTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ParentHandbookNew;