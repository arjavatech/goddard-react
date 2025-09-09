import React, { useState, useEffect, useRef } from 'react';
import { api_base_url, school_id } from '@/utils/const';
import { useAuth0 } from '@auth0/auth0-react';
import { getAuthHeaders } from '../utils/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Download,
  FileText,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  BookOpen,
  CreditCard,
  ScrollText,
  FileCheck,
  Calendar,
  Search
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import HeaderNew from '../components/HeaderNew';
import DataTable from '../components/DataTable';
import { useAuth } from '../hooks/useAuth';
import FormSidebar from '../parent/utilComponents/FormSidebar/FormSidebar';
import { formSections } from '../parent/utilComponents/FormSidebar/formSections';
import AuthorizationForm from './forms/AuthorizationFormNew';
import ParentHandbbok from './forms/ParentHanbook/policies/AllNew';
import EnrollmentForm from './forms/EnrollmentFormNew';
import AdmissionForm from './forms/AdmissionForm/AdmissionFormNew';
import ParentHandbook from './pdf_forms/ParentHandbook';
import AdmissionSection from './pdf_forms/AdmissionForm';
import ACHForm from './pdf_forms/AuthorizationForm';
import EnrollmentAgreementPDF from './pdf_forms/EnrollmentAgreement';

const ParentDashboard = () => {
  const { isAuthenticated, signOut } = useAuth();
  const { getAccessTokenSilently } = useAuth0();
  const [children, setChildren] = useState([]);
  const [activeChildId, setActiveChildId] = useState(null);
  const [parentName, setParentName] = useState('');
  const [incompleteForms, setIncompleteForms] = useState([]);
  const [showCompletedForms, setShowCompletedForms] = useState(true);
  const [completedForms, setCompletedForms] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [currentSection, setCurrentSection] = useState(null);
  const [formStatus, setFormStatus] = useState({});
  const [selectedSubForm, setSelectedSubForm] = useState(null);
  const [childFormData, setChildFormData] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Refs for PDF components
  const handbookContentRef = useRef(null);
  const admissionFormRef = useRef(null);
  const authorizationFormRef = useRef(null);
  const enrollmentFormRef = useRef(null);
  const admissionRef = useRef();
  const achFormRef = useRef();
  const phbFormRef = useRef();
  const enrollFormRef = useRef();

  const urlParams = new URLSearchParams(window.location.search);
  const editID = urlParams.get('id') || '';

  // Existing handlers (preserved functionality)
  const handleDownload1 = async (mode) => {
    try {
      if (mode === "download") {
        await admissionRef.current?.generateDownload();
      } else {
        await admissionRef.current?.generatePrint();
      }
    } catch (error) {
      console.error("Error in download:", error);
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  const handleDownload2 = async (mode) => {
    try {
      if (mode === "download") {
        await achFormRef.current?.handleDownload2();
      } else {
        await achFormRef.current?.handlePrint2();
      }
    } catch (error) {
      console.error("Error in download:", error);
      toast.error("Failed to process authorization form.");
    }
  };

  const handleDownload3 = async (mode) => {
    try {
      if (mode === "download") {
        await phbFormRef.current?.generateDownload();
      } else {
        await phbFormRef.current?.generatePrint();
      }
    } catch (error) {
      console.error("Error in download:", error);
      toast.error("Failed to process parent handbook.");
    }
  };

  const handleDownload4 = async (mode) => {
    try {
      if (mode === "download") {
        await enrollFormRef.current?.generatePdf();
      } else {
        await enrollFormRef.current?.print();
      }
    } catch (error) {
      console.error("Error in download:", error);
      toast.error("Failed to process enrollment form.");
    }
  };

  // S3 download and print functions (preserved)
  const downloadFromS3 = async (formName) => {
    try {
      const school_name = "lynnwood";
      const child_id = activeChildId;

      if (!child_id) {
        toast.error("Child ID not found. Please select a child and try again.");
        return;
      }

      const formMapping = {
        'authorization_form': 'authorization_form',
        'parent_handbook': 'parent_handbook',
        'enrollment_agreement': 'enrollment_agreement',
        'admission_form': 'admission_form'
      };

      const item = formMapping[formName];
      if (!item) {
        toast.error("Unknown form type. Please try again.");
        return;
      }

      const apiUrl = `${api_base_url}/get-s3-file/${school_name}/${child_id}/${item}/${false}`;

      const headers = await getAuthHeaders(getAccessTokenSilently);
      const response = await fetch(apiUrl, { headers });
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.s3_location || !data.filename) {
        toast.error("File not found. Please contact support.");
        return;
      }

      if (data.download_url) {
        try {
          const response = await fetch(data.download_url, {
            method: 'GET',
            mode: 'cors',
            credentials: 'omit'
          });

          if (response.ok) {
            const blob = await response.blob();

            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = data.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(link.href);

            toast.success(`${formName} downloaded successfully`);
          } else {
            throw new Error(`Download failed: ${response.status} ${response.statusText}`);
          }
        } catch (downloadError) {
          console.error("Download error:", downloadError);

          if (downloadError.name === 'TypeError' || downloadError.message.includes('CORS')) {
            try {
              window.location.href = data.download_url;
            } catch (locationError) {
              const iframe = document.createElement('iframe');
              iframe.style.display = 'none';
              iframe.src = data.download_url;
              document.body.appendChild(iframe);

              setTimeout(() => {
                if (document.body.contains(iframe)) {
                  document.body.removeChild(iframe);
                }
              }, 5000);
            }
          } else {
            toast.error(`Download failed: ${downloadError.message}`);
          }
        }
      } else {
        toast.error("Download URL not available. Please contact support.");
      }

    } catch (error) {
      console.error(`Error accessing ${formName}:`, error);
      toast.error(`Unable to access file: ${error.message}`);
    }
  };

  const printFromS3 = async (formName) => {
    try {
      const school_name = "lynnwood";
      const child_id = activeChildId;
      
      if (!child_id) {
        toast.error("Child ID not found. Please select a child and try again.");
        return;
      }

      const formMapping = {
        'authorization_form': 'authorization_form',
        'parent_handbook': 'parent_handbook', 
        'enrollment_agreement': 'enrollment_agreement',
        'admission_form': 'admission_form'
      };

      const item = formMapping[formName];
      if (!item) {
        toast.error("Unknown form type. Please try again.");
        return;
      }

      const apiUrl = `${api_base_url}/get-s3-file/${school_name}/${child_id}/${item}/${true}`;
      
      const headers = await getAuthHeaders(getAccessTokenSilently);
      const response = await fetch(apiUrl, { headers });
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.s3_location || !data.filename) {
        toast.error("File not found. Please contact support.");
        return;
      }

      if (data.download_url) {
        try {
          const response = await fetch(data.download_url, {
            method: 'GET',
            mode: 'cors',
            credentials: 'omit'
          });
          
          if (response.ok) {
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            
            const printWindow = window.open(blobUrl, '_blank');
            if (printWindow) {
              printWindow.onload = () => {
                setTimeout(() => {
                  printWindow.print();
                }, 500);
              };
              
              setTimeout(() => {
                window.URL.revokeObjectURL(blobUrl);
              }, 5000);
            }
            
            toast.success(`${formName} opened for printing`);
          } else {
            throw new Error(`Print fetch failed: ${response.status} ${response.statusText}`);
          }
        } catch (printError) {
          console.error("Print error:", printError);
          
          if (printError.name === 'TypeError' || printError.message.includes('CORS')) {
            const printWindow = window.open(data.download_url, '_blank');
            if (printWindow) {
              printWindow.onload = () => {
                setTimeout(() => {
                  printWindow.print();
                }, 500);
              };
            }
          } else {
            toast.error(`Print failed: ${printError.message}`);
          }
        }
      } else {
        toast.error("Print URL not available. Please contact support.");
      }
      
    } catch (error) {
      console.error(`Error printing ${formName}:`, error);
      toast.error(`Unable to print file: ${error.message}`);
    }
  };

  // Form API handlers (preserved functionality)
  const handleAuthorizationFormAPI = async () => {
    try {
      await downloadFromS3('authorization_form');
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Error in authorization form download:", error);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setIsDownloading(false);
    }
  };

  const handleParentHandbookAPI = async () => {
    try {
      await downloadFromS3('parent_handbook');
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Error in parent handbook download:", error);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEnrollmentAgreementAPI = async () => {
    try {
      await downloadFromS3('enrollment_agreement');
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Error in enrollment agreement download:", error);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setIsDownloading(false);
    }
  };

  const handleAdmissionFormAPI = async () => {
    try {
      await downloadFromS3('admission_form');
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Error in admission form download:", error);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      checkParentAuthentication();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (currentSection) {
      setShowCompletedForms(false);
    }
  }, [currentSection]);

  useEffect(() => {
    if (activeChildId) {
      setCurrentSection(null);
      setShowCompletedForms(true);
      setSelectedSubForm(null);
      setCompletedForms([]);
      setChildFormData(null);

      loadAllFormData();
    }
  }, [activeChildId]);

  const checkParentAuthentication = async () => {
    const loggedInEmail = localStorage.getItem('logged_in_email');
    if (editID === loggedInEmail || loggedInEmail === 'goddard01arjava@gmail.com' || editID === '') {
      try {
        const emailToUse = editID || loggedInEmail;
        const headers = await getAuthHeaders(getAccessTokenSilently);
        const response = await fetch(
          `${api_base_url}/admission_child_personal/parent_email/${school_id}/${emailToUse}`,
          { headers }
        );
        const data = await response.json();

        if (data.length > 0) {
          const firstChild = data[0];

          if (firstChild.parent_name) {
            localStorage.setItem('parent_name', firstChild.parent_name);
            setParentName(firstChild.parent_name);
          }

          const childrenList = data.map(child => ({
            child_id: child.child_id,
            child_first_name: child.child_first_name,
            child_last_name: child.child_last_name
          }));

          setChildren(childrenList);
          localStorage.setItem('number_of_children', childrenList.length.toString());

          const putcallId = sessionStorage.getItem('putcallId');
          if (putcallId) {
            setActiveChildId(parseInt(putcallId));
          } else if (childrenList.length > 0) {
            setActiveChildId(childrenList[0].child_id);
            localStorage.setItem('child_name', childrenList[0].child_first_name);
            localStorage.setItem('child_id', childrenList[0].child_id);
          }
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        toast.error('Failed to load parent data');
      }
    } else {
      window.location.href = '/login';
    }
  };

  const handleChildSelect = (childId) => {
    setActiveChildId(childId);
    const selectedChild = children.find(child => child.child_id === childId);
    if (selectedChild) {
      localStorage.setItem('child_name', selectedChild.child_first_name);
      localStorage.setItem('child_id', childId);
      toast.success(`Selected child: ${selectedChild.child_first_name}`);
    }
  };

  const toggleCompletedForms = () => {
    setShowCompletedForms(!showCompletedForms);
    setCurrentSection(null);
    if (!showCompletedForms) {
      loadAllFormData();
    }
  };

  const loadAllFormData = async () => {
    if (!activeChildId) return;

    const loggedInEmail = localStorage.getItem('logged_in_email');
    const emailToUse = editID || loggedInEmail;

    try {
      const headers = await getAuthHeaders(getAccessTokenSilently);
      const response = await fetch(
        `${api_base_url}/admission_child_personal/parent_email/${school_id}/${emailToUse}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch form data');
      }

      const data = await response.json();
      const currentChildData = data.find(child => child.child_id === activeChildId);

      if (currentChildData) {
        setCompletedForms(currentChildData.CompletedFormStatus || []);
        setIncompleteForms(currentChildData.InCompletedFormStatus || []);
        setChildFormData(currentChildData.child_information || null);
      } else {
        setCompletedForms([]);
        setIncompleteForms([]);
        setChildFormData(null);
      }

    } catch (error) {
      setCompletedForms([]);
      setIncompleteForms([]);
      setChildFormData(null);
      toast.error('Failed to load form data');
    }
  };

  const getWelcomeMessage = () => {
    const loggedInEmail = localStorage.getItem('logged_in_email');
    if (loggedInEmail === 'goddard01arjava@gmail.com') {
      return 'Welcome Admin';
    }
    return `Welcome ${parentName}`;
  };

  // Form statistics
  const getFormStatistics = () => {
    const totalForms = 4; // admission, authorization, handbook, enrollment
    const completedCount = completedForms.length;
    const incompleteCount = incompleteForms.length;

    return {
      total: totalForms,
      completed: completedCount,
      incomplete: incompleteCount,
      progress: totalForms > 0 ? Math.round((completedCount / totalForms) * 100) : 0
    };
  };

  const renderFormIcon = (formName) => {
    switch (formName) {
      case 'admission_form':
        return <FileText className="h-5 w-5" />;
      case 'authorization_form':
        return <CreditCard className="h-5 w-5" />;
      case 'parent_handbook':
        return <BookOpen className="h-5 w-5" />;
      case 'enrollment_form':
      case 'enrollment_agreement':
        return <ScrollText className="h-5 w-5" />;
      default:
        return <FileCheck className="h-5 w-5" />;
    }
  };

  const renderCurrentFormSection = () => {
    if (showCompletedForms) {
      return null;
    }

    if (!currentSection) {
      return (
        <Card className="m-6">
          <CardHeader>
            <CardTitle className="text-[#0F2D52] flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Welcome to Forms
            </CardTitle>
            <CardDescription>
              Please select a form from the sidebar to get started, or view completed forms.
            </CardDescription>
          </CardHeader>
        </Card>
      );
    }

    switch (currentSection) {
      case 'authorization':
        return (
          <div className="m-6">
            <AuthorizationForm
              selectedSubForm={selectedSubForm}
              childId={activeChildId}
              onSubFormChange={setSelectedSubForm}
              formStatus={formStatus}
              initialFormData={childFormData ? {
                bank_routing: childFormData.bank_routing || '',
                bank_account: childFormData.bank_account || '',
                driver_license: childFormData.driver_license || '',
                state: childFormData.state || '',
                i: childFormData.i || '',
                parent_sign_ach: childFormData.parent_sign_ach || '',
                parent_sign_date_ach: childFormData.parent_sign_date_ach || '',
                admin_sign_ach: childFormData.admin_sign_ach || '',
                admin_sign_date_ach: childFormData.admin_sign_date_ach || ''
              } : null}
            />
          </div>
        );
      case 'parentHandbook':
        return (
          <div className="m-6">
            <ParentHandbbok
              selectedSubForm={selectedSubForm}
              childId={activeChildId}
              initialFormData={childFormData ? {
                welcome_goddard_agreement: childFormData.welcome_goddard_agreement || '',
                mission_statement_agreement: childFormData.mission_statement_agreement || '',
                general_information_agreement: childFormData.general_information_agreement || '',
                medical_care_provider_agreement: childFormData.medical_care_provider_agreement || '',
                parent_access_agreement: childFormData.parent_access_agreement || '',
                release_of_children_agreement: childFormData.release_of_children_agreement || '',
                registration_fees_agreement: childFormData.registration_fees_agreement || '',
                outside_engagements_agreement: childFormData.outside_engagements_agreement || '',
                health_policies_agreement: childFormData.health_policies_agreement || '',
                medication_procedures_agreement: childFormData.medication_procedures_agreement || '',
                bring_to_school_agreement: childFormData.bring_to_school_agreement || '',
                rest_time_agreement: childFormData.rest_time_agreement || '',
                training_philosophy_agreement: childFormData.training_philosophy_agreement || '',
                affiliation_policy_agreement: childFormData.affiliation_policy_agreement || '',
                security_issue_agreement: childFormData.security_issue_agreement || '',
                expulsion_policy_agreement: childFormData.expulsion_policy_agreement || '',
                addressing_individual_child_agreement: childFormData.addressing_individual_child_agreement || '',
                finalword_agreement: childFormData.finalword_agreement || '',
                parent_sign_handbook: childFormData.parent_sign_handbook || '',
                parent_sign_date_handbook: childFormData.parent_sign_date_handbook || '',
                admin_sign_handbook: childFormData.admin_sign_handbook || '',
                admin_sign_date_handbook: childFormData.admin_sign_date_handbook || '',
                handbook_pointer: childFormData.handbook_pointer || ''
              } : null}
            />
          </div>
        );
      case 'enrollment':
        return (
          <div className="m-6">
            <EnrollmentForm
              selectedSubForm={selectedSubForm}
              childId={activeChildId}
              initialFormData={childFormData ? {
                point_one_field_three: childFormData.point_one_field_three || '',
                point_two_initial_here: childFormData.point_two_initial_here || '',
                point_three_initial_here: childFormData.point_three_initial_here || '',
                point_four_initial_here: childFormData.point_four_initial_here || '',
                point_five_initial_here: childFormData.point_five_initial_here || '',
                point_six_initial_here: childFormData.point_six_initial_here || '',
                point_seven_initial_here: childFormData.point_seven_initial_here || '',
                point_eight_initial_here: childFormData.point_eight_initial_here || '',
                point_nine_initial_here: childFormData.point_nine_initial_here || '',
                point_ten_initial_here: childFormData.point_ten_initial_here || '',
                point_eleven_initial_here: childFormData.point_eleven_initial_here || '',
                point_twelve_initial_here: childFormData.point_twelve_initial_here || '',
                point_thirteen_initial_here: childFormData.point_thirteen_initial_here || '',
                point_fourteen_initial_here: childFormData.point_fourteen_initial_here || '',
                point_fifteen_initial_here: childFormData.point_fifteen_initial_here || '',
                point_sixteen_initial_here: childFormData.point_sixteen_initial_here || '',
                point_seventeen_initial_here: childFormData.point_seventeen_initial_here || '',
                point_eighteen_initial_here: childFormData.point_eighteen_initial_here || '',
                point_ninteen_initial_here: childFormData.point_ninteen_initial_here || '',
                preferred_start_date: childFormData.preferred_start_date || '',
                preferred_schedule: childFormData.preferred_schedule || '',
                full_day: childFormData.full_day || false,
                half_day: childFormData.half_day || false,
                parent_sign_enroll: childFormData.parent_sign_enroll || '',
                parent_sign_date_enroll: childFormData.parent_sign_date_enroll || '',
                admin_sign_enroll: childFormData.admin_sign_enroll || '',
                admin_sign_date_enroll: childFormData.admin_sign_date_enroll || ''
              } : null}
            />
          </div>
        );
      case 'admission':
        return (
          <div className="m-6">
            <AdmissionForm
              selectedSubForm={selectedSubForm}
              initialFormData={childFormData}
              childId={activeChildId}
              onSubFormChange={setSelectedSubForm}
              formStatus={formStatus}
            />
          </div>
        );
      default:
        return (
          <Card className="m-6">
            <CardHeader>
              <CardTitle className="text-[#0F2D52] flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Form Not Found
              </CardTitle>
              <CardDescription>
                The selected form section is not available.
              </CardDescription>
            </CardHeader>
          </Card>
        );
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const stats = getFormStatistics();

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster richColors position="top-center" />

      {/* Navigation Bar */}
      <HeaderNew onSignOut={signOut} sidebar={false} />

      {/* Welcome Section */}
      <div className="bg-white border-b">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#0F2D52] mb-2">
              Parent Dashboard
            </h1>
            <p className="text-lg text-gray-600 mb-6" id="welcomeText">
              {getWelcomeMessage()}
            </p>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Forms</p>
                      <p className="text-2xl font-bold text-[#0F2D52]">{stats.total}</p>
                    </div>
                    <FileText className="h-8 w-8 text-[#0F2D52]" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completed</p>
                      <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Incomplete</p>
                      <p className="text-2xl font-bold text-orange-600">{stats.incomplete}</p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Progress</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.progress}%</p>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600">{stats.progress}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Child Tabs */}
      <div className="bg-[#0F2D52] border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto py-4">
            {children.map((child) => (
              <Button
                key={child.child_id}
                variant={activeChildId === child.child_id ? "secondary" : "ghost"}
                className={`min-w-fit whitespace-nowrap ${activeChildId === child.child_id
                    ? 'bg-white text-[#0F2D52] hover:bg-gray-100'
                    : 'text-white hover:bg-[#0F2D52]/80'
                  }`}
                onClick={() => handleChildSelect(child.child_id)}
              >
                <Users className="h-4 w-4 mr-2" />
                {child.child_first_name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-1/4">
            <FormSidebar
              activeChildId={activeChildId}
              onSectionChange={setCurrentSection}
              currentSection={currentSection}
              onHideCompleted={() => setShowCompletedForms(false)}
              onToggleCompleted={toggleCompletedForms}
              onSubFormChange={setSelectedSubForm}
              selectedSubForm={selectedSubForm}
              incompleteForms={incompleteForms}
            />
          </div>

          {/* Main Content Area */}
          <div className="w-full lg:w-3/4">
            {renderCurrentFormSection()}

            {/* Completed Forms */}
            {showCompletedForms && (
              <Card className="mt-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-[#0F2D52] flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Completed Forms
                      </CardTitle>
                      <CardDescription>
                        Child: {localStorage.getItem('child_name')}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <label htmlFor="year" className="text-sm font-medium text-gray-700">Year:</label>
                        <select
                          name="year"
                          id="year"
                          className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2D52] focus:border-transparent"
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        >
                          {[...Array(11)].map((_, i) => {
                            const year = new Date().getFullYear() - 10 + i;
                            return (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="overflow-x-auto">
                    <DataTable
                      data={completedForms}
                      columns={[
                        {
                          key: 'formname',
                          title: 'Form Name',
                          render: (value) => (
                            <div className="flex items-center gap-2">
                              {renderFormIcon(value)}
                              <span className="font-medium">{value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                            </div>
                          )
                        },
                        {
                          key: 'completedTimestamp',
                          title: 'Completed Date',
                          render: (value) => (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              {new Date(value).toLocaleDateString()}
                            </div>
                          )
                        },
                        {
                          key: 'action',
                          title: 'Actions',
                          render: (value, row) => {
                            const formName = row.formname;
                            return (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();

                                    setIsDownloading(true);
                                    setTimeout(() => {
                                      switch (formName) {
                                        case 'admission_form':
                                          handleAdmissionFormAPI();
                                          break;
                                        case 'authorization_form':
                                          handleAuthorizationFormAPI();
                                          break;
                                        case 'parent_handbook':
                                          handleParentHandbookAPI();
                                          break;
                                        case 'enrollment_form':
                                        case 'enrollment_agreement':
                                          handleEnrollmentAgreementAPI();
                                          break;
                                        default:
                                          toast.error('Unknown form type');
                                          setIsDownloading(false);
                                      }
                                    }, 100);
                                  }}
                                  disabled={isDownloading}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>

                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();

                                    setIsDownloading(true);
                                    setTimeout(() => {
                                      switch (formName) {
                                        case 'admission_form':
                                          printFromS3('admission_form');
                                          break;
                                        case 'authorization_form':
                                          printFromS3('authorization_form');
                                          break;
                                        case 'parent_handbook':
                                          printFromS3('parent_handbook');
                                          break;
                                        case 'enrollment_form':
                                        case 'enrollment_agreement':
                                          printFromS3('enrollment_agreement');
                                          break;
                                        default:
                                          toast.error('Unknown form type');
                                      }
                                      setIsDownloading(false);
                                    }, 100);
                                  }}
                                  disabled={isDownloading}
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </div>
                            );
                          },
                          sortable: false
                        }
                      ]}
                      tableId="completedForms"
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Loading Modal */}
      {isDownloading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-sm mx-4">
            <CardContent className="p-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F2D52] mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-[#0F2D52] mb-2">
                Processing...
              </h3>
              <p className="text-sm text-gray-600">
                Processing your request. Please wait...
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hidden PDF Components */}
      <div className="hidden">
        <AdmissionSection ref={admissionRef} initialFormData={childFormData} />
        <ParentHandbook
          ref={phbFormRef}
          initialFormData={childFormData ? {
            welcome_goddard_agreement: childFormData.welcome_goddard_agreement || '',
            mission_statement_agreement: childFormData.mission_statement_agreement || '',
            general_information_agreement: childFormData.general_information_agreement || '',
            medical_care_provider_agreement: childFormData.medical_care_provider_agreement || '',
            parent_access_agreement: childFormData.parent_access_agreement || '',
            release_of_children_agreement: childFormData.release_of_children_agreement || '',
            registration_fees_agreement: childFormData.registration_fees_agreement || '',
            outside_engagements_agreement: childFormData.outside_engagements_agreement || '',
            health_policies_agreement: childFormData.health_policies_agreement || '',
            medication_procedures_agreement: childFormData.medication_procedures_agreement || '',
            bring_to_school_agreement: childFormData.bring_to_school_agreement || '',
            rest_time_agreement: childFormData.rest_time_agreement || '',
            training_philosophy_agreement: childFormData.training_philosophy_agreement || '',
            affiliation_policy_agreement: childFormData.affiliation_policy_agreement || '',
            security_issue_agreement: childFormData.security_issue_agreement || '',
            expulsion_policy_agreement: childFormData.expulsion_policy_agreement || '',
            addressing_individual_child_agreement: childFormData.addressing_individual_child_agreement || '',
            finalword_agreement: childFormData.finalword_agreement || '',
            parent_sign_handbook: childFormData.parent_sign_handbook || '',
            parent_sign_date_handbook: childFormData.parent_sign_date_handbook || '',
            admin_sign_handbook: childFormData.admin_sign_handbook || '',
            admin_sign_date_handbook: childFormData.admin_sign_date_handbook || '',
            handbook_pointer: childFormData.handbook_pointer || ''
          } : null}
        />
        <ACHForm
          ref={achFormRef}
          initialFormData={childFormData ? {
            bank_routing: childFormData.bank_routing || '',
            bank_account: childFormData.bank_account || '',
            driver_license: childFormData.driver_license || '',
            state: childFormData.state || '',
            i: childFormData.i || '',
            parent_sign_ach: childFormData.parent_sign_ach || '',
            parent_sign_date_ach: childFormData.parent_sign_date_ach || '',
            admin_sign_ach: childFormData.admin_sign_ach || '',
            admin_sign_date_ach: childFormData.admin_sign_date_ach || ''
          } : null}
        />
        <EnrollmentAgreementPDF
          ref={enrollFormRef}
          initialFormData={childFormData ? {
            point_one_field_one: childFormData.point_one_field_one || '',
            point_one_field_three: childFormData.point_one_field_three || '',
            point_two_initial_here: childFormData.point_two_initial_here || '',
            point_three_initial_here: childFormData.point_three_initial_here || '',
            point_four_initial_here: childFormData.point_four_initial_here || '',
            point_five_initial_here: childFormData.point_five_initial_here || '',
            point_six_initial_here: childFormData.point_six_initial_here || '',
            point_seven_initial_here: childFormData.point_seven_initial_here || '',
            point_eight_initial_here: childFormData.point_eight_initial_here || '',
            point_nine_initial_here: childFormData.point_nine_initial_here || '',
            point_ten_initial_here: childFormData.point_ten_initial_here || '',
            point_eleven_initial_here: childFormData.point_eleven_initial_here || '',
            point_twelve_initial_here: childFormData.point_twelve_initial_here || '',
            point_thirteen_initial_here: childFormData.point_thirteen_initial_here || '',
            point_fourteen_initial_here: childFormData.point_fourteen_initial_here || '',
            point_fifteen_initial_here: childFormData.point_fifteen_initial_here || '',
            point_sixteen_initial_here: childFormData.point_sixteen_initial_here || '',
            point_seventeen_initial_here: childFormData.point_seventeen_initial_here || '',
            point_eighteen_initial_here: childFormData.point_eighteen_initial_here || '',
            point_ninteen_initial_here: childFormData.point_ninteen_initial_here || '',
            child_first_name: childFormData.child_first_name || '',
            dob: childFormData.dob || '',
            preferred_start_date: childFormData.preferred_start_date || '',
            full_day: childFormData.full_day === 'on' || childFormData.full_day === true,
            half_day: childFormData.half_day === 'on' || childFormData.half_day === true,
            preferred_schedule: childFormData.preferred_schedule || '',
            primary_parent_email: childFormData.primary_parent_email || '',
            preferred_home_addr: childFormData.preferred_home_addr || '',
            parent_sign_enroll: childFormData.parent_sign_enroll || '',
            parent_sign_date_enroll: childFormData.parent_sign_date_enroll || ''
          } : null}
        />
      </div>
    </div>
  );
};

export default ParentDashboard;