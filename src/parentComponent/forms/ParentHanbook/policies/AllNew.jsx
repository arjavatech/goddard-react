import React, { useState, useEffect } from 'react';
import { api_base_url, school_id } from '@/utils/const';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  BookOpen, 
  FileText, 
  User,
  Shield,
  CheckCircle,
  AlertCircle,
  Save,
  Send,
  Award,
  Heart,
  Users,
  Clock,
  Globe,
  Home,
  Phone
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
  const [activeSection, setActiveSection] = useState('policies');
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

  // Policy sections configuration
  const policySections = [
    {
      key: 'welcome_goddard_agreement',
      title: 'Welcome to The Goddard School',
      component: <TheGoddardSchool openSection={activeSection} setOpenSection={setActiveSection} />,
      icon: <Home className="h-4 w-4" />,
      category: 'welcome'
    },
    {
      key: 'mission_statement_agreement',
      title: 'Mission Statement',
      component: <MissionStatement openSection={activeSection} setOpenSection={setActiveSection} />,
      icon: <Award className="h-4 w-4" />,
      category: 'welcome'
    },
    {
      key: 'general_information_agreement',
      title: 'General Information',
      component: <GeneralEnrollmentProcedure openSection={activeSection} setOpenSection={setActiveSection} />,
      icon: <FileText className="h-4 w-4" />,
      category: 'general'
    },
    {
      key: 'medical_care_provider_agreement',
      title: 'Medical Care & Confidentiality',
      component: <StatementOfConfidentiality openSection={activeSection} setOpenSection={setActiveSection} />,
      icon: <Heart className="h-4 w-4" />,
      category: 'health'
    },
    {
      key: 'parent_access_agreement',
      title: 'Parent Access Policy',
      component: <ParentAccess openSection={activeSection} setOpenSection={setActiveSection} />,
      icon: <Users className="h-4 w-4" />,
      category: 'access'
    },
    {
      key: 'release_of_children_agreement',
      title: 'Release of Children',
      component: <ReleaseOfChildren openSection={activeSection} setOpenSection={setActiveSection} />,
      icon: <Shield className="h-4 w-4" />,
      category: 'safety'
    },
    {
      key: 'registration_fees_agreement',
      title: 'Registration & Tuition Fees',
      component: <RegisterationTutionFees openSection={activeSection} setOpenSection={setActiveSection} />,
      icon: <FileText className="h-4 w-4" />,
      category: 'financial'
    },
    {
      key: 'outside_engagements_agreement',
      title: 'Outside Engagements',
      component: <OutsideEngagement openSection={activeSection} setOpenSection={setActiveSection} />,
      icon: <Globe className="h-4 w-4" />,
      category: 'activities'
    },
    {
      key: 'health_policies_agreement',
      title: 'Health Policies',
      component: <HealthPolicies openSection={activeSection} setOpenSection={setActiveSection} />,
      icon: <Heart className="h-4 w-4" />,
      category: 'health'
    },
    {
      key: 'medication_procedures_agreement',
      title: 'Medication Procedures',
      component: <MedicationProcedures openSection={activeSection} setOpenSection={setActiveSection} />,
      icon: <Heart className="h-4 w-4" />,
      category: 'health'
    },
    {
      key: 'bring_to_school_agreement',
      title: 'Toys From Home',
      component: <ToysFromHome openSection={activeSection} setOpenSection={setActiveSection} />,
      icon: <Home className="h-4 w-4" />,
      category: 'general'
    },
    {
      key: 'rest_time_agreement',
      title: 'Rest Time, Meals & Snacks',
      component: <RestTimeMealsSnacks openSection={activeSection} setOpenSection={setActiveSection} />,
      icon: <Clock className="h-4 w-4" />,
      category: 'daily'
    },
    {
      key: 'training_philosophy_agreement',
      title: 'Toilet Training Philosophy',
      component: <TransitionToiletTraining openSection={activeSection} setOpenSection={setActiveSection} />,
      icon: <Users className="h-4 w-4" />,
      category: 'daily'
    },
    {
      key: 'affiliation_policy_agreement',
      title: 'Website & Social Media Policy',
      component: <WebsiteAndBlog openSection={activeSection} setOpenSection={setActiveSection} />,
      icon: <Globe className="h-4 w-4" />,
      category: 'media'
    },
    {
      key: 'security_issue_agreement',
      title: 'Emergency Closings',
      component: <EmergencyClosings openSection={activeSection} setOpenSection={setActiveSection} />,
      icon: <Phone className="h-4 w-4" />,
      category: 'safety'
    },
    {
      key: 'expulsion_policy_agreement',
      title: 'Expulsion Policy',
      component: <ExpulsionPolicy openSection={activeSection} setOpenSection={setActiveSection} />,
      icon: <Shield className="h-4 w-4" />,
      category: 'policy'
    },
    {
      key: 'addressing_individual_child_agreement',
      title: 'Addressing Individual Child Concerns',
      component: <AddressingIndividualChildConcern openSection={activeSection} setOpenSection={setActiveSection} />,
      icon: <Users className="h-4 w-4" />,
      category: 'support'
    },
    {
      key: 'finalword_agreement',
      title: 'Final Word',
      component: <FinalWord openSection={activeSection} setOpenSection={setActiveSection} />,
      icon: <BookOpen className="h-4 w-4" />,
      category: 'conclusion'
    }
  ];

  // API function to update parent handbook data
  const updateParentHandbookData = async (fieldData) => {
    if (!childId) {
      toast.error('Child ID is required for API update');
      return;
    }

    try {
      const response = await fetch(`${api_base_url}/parent_handbook/${school_id}/${childId}`, {
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

  const handleChange = (name, value) => {
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleAgreementChange = (policyKey, isChecked) => {
    setFormData(prevState => ({
      ...prevState,
      [policyKey]: isChecked ? 'on' : ''
    }));
  };

  // Validation functions
  const isPoliciesComplete = () => {
    return policySections.every(section => 
      formData[section.key] && formData[section.key] === 'on'
    );
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
        ...Object.fromEntries(
          policySections.map(section => [section.key, formData[section.key]])
        ),
        handbook_pointer: parseInt(formData.handbook_pointer)
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
      let saveData = { child_id: childId };

      if (type === 'parent') {
        if (!formData.parent_sign_handbook || formData.parent_sign_handbook === '') {
          toast.error('Error: Parent signature is missing');
          return;
        }

        saveData = {
          ...saveData,
          parent_sign_handbook: formData.parent_sign_handbook,
          parent_sign_date_handbook: new Date().toLocaleDateString('en-CA')
        };
      } else if (type === 'admin') {
        if (!formData.admin_sign_handbook || formData.admin_sign_handbook === '') {
          toast.error('Error: Admin signature is missing');
          return;
        }

        const epochValue = new Date(formData.admin_sign_date_handbook).getTime();
        saveData = {
          child_id: childId,
          ...Object.fromEntries(
            policySections.map(section => [section.key, formData[section.key]])
          ),
          handbook_pointer: parseInt(formData.handbook_pointer),
          parent_sign_handbook: formData.parent_sign_handbook,
          parent_sign_date_handbook: formData.parent_sign_date_handbook,
          admin_sign_handbook: formData.admin_sign_handbook,
          admin_sign_date_handbook: epochValue
        };
      }

      await updateParentHandbookData(saveData);
      toast.success('Parent handbook data saved successfully!');
    } catch (error) {
      console.error('Failed to save parent handbook:', error);
      toast.error('Error saving parent handbook data. Please try again.');
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
  const completedPolicies = policySections.filter(section => 
    formData[section.key] === 'on'
  ).length;
  const policyProgress = (completedPolicies / policySections.length) * 100;

  const completedSections = [
    isPoliciesComplete(),
    isParentSignatureComplete(),
    isAdminSignatureComplete()
  ].filter(Boolean).length;
  
  const totalSections = 3;
  const overallProgress = (completedSections / totalSections) * 100;

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
                  {completedPolicies} of {policySections.length}
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

      {/* Policies Section */}
      {activeSection === 'policies' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-[#0F2D52] flex items-center gap-3">
              <BookOpen className="h-5 w-5" />
              School Policies & Procedures
            </CardTitle>
            <CardDescription>
              Please review each policy section and check the box to acknowledge your agreement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="space-y-4">
              {policySections.map((section, index) => (
                <AccordionItem key={section.key} value={section.key} className="border rounded-lg">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex items-center gap-2">
                        {section.icon}
                        <span className="font-medium">{section.title}</span>
                      </div>
                      <div className="ml-auto flex items-center gap-2">
                        {formData[section.key] === 'on' && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                        <Badge variant="outline" className="text-xs">
                          {section.category}
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      <div className="prose prose-sm max-w-none">
                        {section.component}
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Checkbox 
                          id={section.key}
                          checked={formData[section.key] === 'on'}
                          onCheckedChange={(checked) => handleAgreementChange(section.key, checked)}
                        />
                        <Label htmlFor={section.key} className="text-sm font-medium cursor-pointer">
                          I have read and agree to the {section.title} policy
                        </Label>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="flex gap-3 pt-6 border-t mt-6">
              <Button onClick={handleSave} className="bg-[#0F2D52] hover:bg-[#0F2D52]/90">
                <Save className="h-4 w-4 mr-2" />
                Save Progress
              </Button>
              <Button 
                onClick={() => setActiveSection('signatures')} 
                variant="outline"
                disabled={!isPoliciesComplete()}
              >
                Continue to Signatures
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Signatures Section */}
      {activeSection === 'signatures' && (
        <div className="space-y-6">
          {/* Parent Signature */}
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
                  onChange={(e) => handleChange('parent_sign_handbook', e.target.value)}
                  className="w-full"
                />
                <p className="text-sm text-gray-500">
                  By signing above, I acknowledge that I have read and agree to all policies in this handbook.
                </p>
              </div>

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

          {/* Admin Signature */}
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
                    onChange={(e) => handleChange('admin_sign_handbook', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin_date">Signature Date *</Label>
                  <Input
                    id="admin_date"
                    name="admin_sign_date_handbook"
                    type="date"
                    value={formData.admin_sign_date_handbook}
                    onChange={(e) => handleChange('admin_sign_date_handbook', e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

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

          <div className="flex gap-3">
            <Button 
              onClick={() => setActiveSection('policies')} 
              variant="outline"
            >
              Back to Policies
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentHandbookNew;