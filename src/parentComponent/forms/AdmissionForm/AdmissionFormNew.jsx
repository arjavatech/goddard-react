import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Users, 
  Shield, 
  Heart, 
  Camera, 
  Lock,
  Car,
  Globe,
  FileText,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  BookOpen,
  Baby
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { useAuth0 } from '@auth0/auth0-react';

// Import existing form components
import ImmunizationInstructions from './ImmunizationInstructions';
import ChildInfo from './ChildInfo/ChildInfo';
import ChildandFamilyHistory from './Child and Family History/ChildandFamilyHistory';
import PickUpPassword from './Pick-up Password';
import VideoPermission from './VideoPermission';
import SecurityPolicy from './SecurityPolicy';
import SocialMediaReleaseForm from './SocialMedia';
import OutsideEngagements from './OutsideEngagements';
import HealthPolicies from './HealthPolicies';
import MedicalTransportationWaiver from './MedicalTransportationWaiver';
import ChildProfileForm from './ChildProfile/ChildProfile';
import AdminSign from './AdminSign';
import ParentSign from './ParentSign';

const AdmissionFormNew = ({ selectedSubForm, initialFormData = null, childId = null, onSubmitSuccess, onProgressUpdate }) => {
  const [activeTab, setActiveTab] = useState(selectedSubForm || 'Child Information');
  const { user } = useAuth0();
  
  // List of admin emails that should have access to admin signatures
  const ADMIN_EMAILS = [
    'goddard01arjava@gmail.com',
    'admin@goddard.com',
    // Add more admin emails here as needed
  ];
  
  // Check if user is admin - using email-based check like the sidebar
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase());
  
  // Track form completion status for each section
  const [sectionCompletionStatus, setSectionCompletionStatus] = useState({});
  
  // Handle when a section is SAVED (not just filled)
  const handleSectionSaveSuccess = (sectionId) => {
    console.log(`✅ Section ${sectionId} saved successfully`);
    
    setSectionCompletionStatus(prev => ({
      ...prev,
      [sectionId]: true  // Only set to true when actually saved
    }));
    
    // Map section IDs to admission item keys and notify parent
    if (onProgressUpdate) {
      const sectionKeyMapping = {
        'Child Information': 'childinformation',
        'Child and Family History': 'childandfamilyhistory', 
        'Immunization': 'immunization',
        'Child Profile': 'child_profile',
        'Pick-up Password': 'childpickup_password',
        'Photo/Video Permission': 'photo_permission',
        'Security & Policy': 'security',
        'Medical Transportation': 'medical_transportation',
        'Health Policies': 'health_policies',
        'Outside Engagements': 'outside_engagements',
        'Social Media Approval': 'social_media',
        'Parent Signature': 'parentsignature',
        'Admin Signature': 'adminsignature'
      };
      
      const itemKey = sectionKeyMapping[sectionId];
      if (itemKey) {
        onProgressUpdate('admission', itemKey, true);  // true only when saved
      }
    }
  };
  
  // Handle when an individual sub-section within Child Information is saved
  const handleSubSectionSaveSuccess = (subSectionId) => {
    setSectionCompletionStatus(prev => ({
      ...prev,
      [subSectionId]: true
    }));
  };
  
  // Define form sections in the correct order
  const allFormSections = [
    {
      id: 'Child Information',
      title: 'Child Information',
      icon: <Baby className="h-5 w-5" />,
      description: 'Basic child details and information',
      category: 'personal'
    },
    {
      id: 'Child and Family History',
      title: 'Child & Family History',
      icon: <Users className="h-5 w-5" />,
      description: 'Family background and history',
      category: 'personal'
    },
    {
      id: 'Immunization',
      title: 'Immunization',
      icon: <Heart className="h-5 w-5" />,
      description: 'Vaccination and health records',
      category: 'health'
    },
    {
      id: 'Child Profile',
      title: 'Child Profile',
      icon: <User className="h-5 w-5" />,
      description: 'Detailed child profile information',
      category: 'personal'
    },
    {
      id: 'Pick-up Password',
      title: 'Pick-up Password',
      icon: <Lock className="h-5 w-5" />,
      description: 'Security password for child pickup',
      category: 'security'
    },
    {
      id: 'Photo/Video Permission',
      title: 'Photo/Video Permission',
      icon: <Camera className="h-5 w-5" />,
      description: 'Media permissions and releases',
      category: 'permissions'
    },
    {
      id: 'Security & Policy',
      title: 'Security & Policy',
      icon: <Shield className="h-5 w-5" />,
      description: 'Security policies and agreements',
      category: 'security'
    },
    {
      id: 'Medical Transportation',
      title: 'Medical Transportation',
      icon: <Car className="h-5 w-5" />,
      description: 'Emergency transport waivers',
      category: 'health'
    },
    {
      id: 'Health Policies',
      title: 'Health Policies',
      icon: <Heart className="h-5 w-5" />,
      description: 'Health and safety policies',
      category: 'health'
    },
    {
      id: 'Outside Engagements',
      title: 'Outside Engagements',
      icon: <Globe className="h-5 w-5" />,
      description: 'External activities and field trips',
      category: 'permissions'
    },
    {
      id: 'Social Media Approval',
      title: 'Social Media Approval',
      icon: <Camera className="h-5 w-5" />,
      description: 'Social media posting permissions',
      category: 'permissions'
    },
    {
      id: 'Parent Signature',
      title: 'Parent Signature',
      icon: <User className="h-5 w-5" />,
      description: 'Parent signature and agreement',
      category: 'signature'
    },
    {
      id: 'Admin Signature',
      title: 'Admin Signature',
      icon: <FileText className="h-5 w-5" />,
      description: 'Administrative signature section',
      category: 'signature',
      adminOnly: true
    }
  ];
  
  // Use all sections without filtering
  const formSections = allFormSections;

  const getCategoryColor = (category) => {
    const colors = {
      personal: 'bg-blue-100 text-blue-800',
      health: 'bg-green-100 text-green-800',
      permissions: 'bg-purple-100 text-purple-800',
      security: 'bg-red-100 text-red-800',
      signature: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryTitle = (category) => {
    const titles = {
      personal: 'Personal Information',
      health: 'Health & Medical',
      permissions: 'Permissions & Media',
      security: 'Security & Safety',
      signature: 'Signatures'
    };
    return titles[category] || 'Other';
  };

  const renderFormContent = () => {
    // Enhanced submit success handler that also tracks section completion
    const enhancedOnSubmitSuccess = (...args) => {
      // Call the original onSubmitSuccess first
      if (onSubmitSuccess) {
        onSubmitSuccess(...args);
      }
      
      // Then mark this section as completed (saved)
      handleSectionSaveSuccess(activeTab);
    };

    // Common props for all form components
    const commonFormProps = {
      initialFormData,
      childId,
      onSubmitSuccess: enhancedOnSubmitSuccess,  // Use enhanced handler that tracks saves
      onSubSectionSuccess: handleSubSectionSaveSuccess  // For individual sub-sections within forms
    };

    switch (activeTab) {
      case 'Child Information':
        return <ChildInfo 
          {...commonFormProps} 
          sectionCompletionStatus={{
            'Child Details': sectionCompletionStatus['Child Details'] || false,
            'Parent Details': sectionCompletionStatus['Parent Details'] || false,
            'Additional Parent Details': sectionCompletionStatus['Additional Parent Details'] || false,
            'Emergency Contact': sectionCompletionStatus['Emergency Contact'] || false,
            'Medical Care Provider': sectionCompletionStatus['Medical Care Provider'] || false,
            'Parent Agreement': sectionCompletionStatus['Parent Agreement'] || false
          }}
        />;
      case 'Child and Family History':
        return <ChildandFamilyHistory {...commonFormProps} />;
      case 'Immunization':
        return <ImmunizationInstructions {...commonFormProps} />;
      case 'Child Profile':
        return <ChildProfileForm {...commonFormProps} />;
      case 'Photo/Video Permission':
        return <VideoPermission {...commonFormProps} />;
      case 'Pick-up Password':
        return <PickUpPassword {...commonFormProps} />;
      case 'Security & Policy':
        return <SecurityPolicy {...commonFormProps} />;
      case 'Medical Transportation':
        return <MedicalTransportationWaiver {...commonFormProps} />;
      case 'Health Policies':
        return <HealthPolicies {...commonFormProps} />;
      case 'Outside Engagements':
        return <OutsideEngagements {...commonFormProps} />;
      case 'Social Media Approval':
        return <SocialMediaReleaseForm {...commonFormProps} />;
      case 'Parent Signature':
        return <ParentSign {...commonFormProps} />;
      case 'Admin Signature':
        if (!isAdmin) {
          return (
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Lock className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Admin Access Required</h3>
                  <p className="text-gray-500">This section is only accessible to administrators.</p>
                </div>
              </CardContent>
            </Card>
          );
        }
        return <AdminSign {...commonFormProps} />;
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-[#0F2D52] flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Admission Form
              </CardTitle>
              <CardDescription>
                Complete all sections of the admission form to enroll your child.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {formSections.slice(0, 6).map((section) => (
                  <div
                    key={section.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setActiveTab(section.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-[#0F2D52] mt-1">
                        {section.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-[#0F2D52] mb-1">
                          {section.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {section.description}
                        </p>
                        <Badge className={getCategoryColor(section.category)} variant="secondary">
                          {getCategoryTitle(section.category)}
                        </Badge>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium text-blue-900">Getting Started</h4>
                </div>
                <p className="text-sm text-blue-700">
                  Please complete all sections of the admission form. You can navigate between sections using the tabs above or by selecting a section from this overview.
                </p>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  // Calculate progress based on actual section completion
  const completedSections = Object.values(sectionCompletionStatus).filter(Boolean).length;
  const totalSections = formSections.length;
  const progress = (completedSections / totalSections) * 100;

  return (
    <div className="space-y-6">
      <Toaster richColors position="top-center" />
      
      {/* Header Section */}
      <Card>
        <CardHeader className="bg-[#0F2D52] text-white">
          <CardTitle className="text-2xl flex items-center gap-3">
            <FileText className="h-6 w-6" />
            Admission Form
          </CardTitle>
          <CardDescription className="text-blue-100">
            Complete all sections to finalize your child's enrollment
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
                className={`flex items-center gap-2 whitespace-nowrap px-3 py-2 data-[state=active]:bg-white data-[state=active]:text-[#0F2D52] ${
                  section.adminOnly && !isAdmin ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={section.adminOnly && !isAdmin}
              >
                {section.icon}
                <span className="hidden sm:inline">{section.title}</span>
                <span className="sm:hidden">{section.title.split(' ')[0]}</span>
                {section.adminOnly && !isAdmin && (
                  <Lock className="h-3 w-3 text-gray-500" />
                )}
                {sectionCompletionStatus[section.id] === true && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Form Content */}
        <div className="mt-6">
          {formSections.map((section) => (
            <TabsContent key={section.id} value={section.id} className="mt-0">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-[#0F2D52]">
                        {section.icon}
                      </div>
                      <div>
                        <CardTitle className="text-[#0F2D52]">{section.title}</CardTitle>
                        <CardDescription>{section.description}</CardDescription>
                      </div>
                    </div>
                    <Badge className={getCategoryColor(section.category)} variant="secondary">
                      {getCategoryTitle(section.category)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {renderFormContent()}
                </CardContent>
              </Card>
            </TabsContent>
          ))}

          {/* Default overview content when no specific tab is selected */}
          <TabsContent value="" className="mt-0">
            {renderFormContent()}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default AdmissionFormNew;