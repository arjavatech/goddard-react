// Refactored Parent Dashboard - Using unified API architecture
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import { useParentDashboard } from '../hooks/useParentDashboard.js';
import { useFileOperations } from '../hooks/useFileOperations.js';
import { toast, Toaster } from 'sonner';

// Components
import HeaderNew from '../components/HeaderNew';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import WelcomeSection from '../components/WelcomeSection';
import ChildTabs from './ChildTabs';
import CompletedFormsTable from '../components/CompletedFormsTable';
import FormSidebar from '../parent/utilComponents/FormSidebar/FormSidebar';

// Form components
import AuthorizationForm from './forms/AuthorizationFormNew';
import ParentHandbook from './forms/ParentHanbook/policies/AllNew';
import EnrollmentForm from './forms/EnrollmentFormNew';
import AdmissionForm from './forms/AdmissionForm/AdmissionFormNew';

// PDF components (hidden)
import ParentHandbookPDF from './pdf_forms/ParentHandbook';
import AdmissionSectionPDF from './pdf_forms/AdmissionForm';
import ACHFormPDF from './pdf_forms/AuthorizationForm';
import EnrollmentAgreementPDF from './pdf_forms/EnrollmentAgreement';

const ParentDashboardRefactored = () => {
  const { user, signOut, isLoading } = useAuth();
  const { isParent, isAdmin, permissionsLoading } = usePermissions();
  
  // Get email from Auth0 user or URL params (for admin access)
  const urlParams = new URLSearchParams(window.location.search);
  const urlEmail = urlParams.get('id');
  
  // Use Auth0 user email by default, URL param for admin impersonation
  const email = urlEmail || user?.email;
  
  // Debug logging for email resolution
  React.useEffect(() => {
    console.log('Email Resolution Debug:', {
      auth0User: user?.email,
      urlParam: urlEmail,
      resolved: email,
      isAdmin,
      isParent,
      timestamp: new Date().toISOString()
    });
  }, [user?.email, urlEmail, email, isAdmin, isParent]);

  // Single hook manages all dashboard data
  const {
    loading,
    error,
    parentName,
    children,
    activeChildId,
    activeChild,
    overallStats,
    isStale,
    switchChild,
    refreshData,
    getWelcomeMessage,
    hasData
  } = useParentDashboard(email);

  // File operations hook
  const { 
    downloadForm, 
    printForm, 
    isProcessing: isDownloading,
    formatFormName 
  } = useFileOperations();

  // Local UI state
  const [currentSection, setCurrentSection] = useState(null);
  const [showCompletedForms, setShowCompletedForms] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedSubForm, setSelectedSubForm] = useState(null);

  // Loading state
  if (loading || isLoading || permissionsLoading) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  // Error state
  if (error) {
    return <ErrorDisplay error={error} onRetry={refreshData} />;
  }

  // Check permissions - either parent or admin can access
  if (!isParent && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-amber-500 text-6xl mb-4">👨‍👩‍👧‍👦</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Parent Access Required</h2>
          <p className="text-gray-600 mb-6">You need parent or admin privileges to access this dashboard.</p>
        </div>
      </div>
    );
  }

  // No email found
  if (!email) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No User Email</h2>
          <p className="text-gray-600 mb-6">Unable to determine user email for dashboard access.</p>
          <button
            onClick={signOut}
            className="bg-[#0F2D52] text-white font-semibold py-2 px-4 rounded-md hover:bg-[#002e4d] transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // No data available
  if (!hasData) {
    return (
      <ErrorDisplay 
        error="No children found for this parent account"
        onRetry={refreshData}
      />
    );
  }

  // Handle form section changes
  const handleSectionChange = (section) => {
    setCurrentSection(section);
    setShowCompletedForms(false);
    setSelectedSubForm(null);
  };

  // Toggle completed forms view
  const toggleCompletedForms = () => {
    setShowCompletedForms(!showCompletedForms);
    setCurrentSection(null);
    setSelectedSubForm(null);
  };

  // Handle file operations with active child
  const handleDownloadForm = async (formType) => {
    if (!activeChildId) {
      toast.error('Please select a child first');
      return;
    }
    
    await downloadForm(activeChildId, formType);
  };

  const handlePrintForm = async (formType) => {
    if (!activeChildId) {
      toast.error('Please select a child first');
      return;
    }
    
    await printForm(activeChildId, formType);
  };

  // Render current form section
  const renderCurrentFormSection = () => {
    if (showCompletedForms) {
      return null;
    }

    if (!currentSection) {
      return (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-2xl font-bold text-[#0F2D52] mb-4">
            Welcome to Forms
          </h2>
          <p className="text-gray-600">
            Please select a form from the sidebar to get started, or view completed forms.
          </p>
        </div>
      );
    }

    const commonProps = {
      selectedSubForm,
      childId: activeChildId,
      initialFormData: activeChild?.formData
    };

    switch (currentSection) {
      case 'authorization':
        return (
          <div className="space-y-6">
            <AuthorizationForm {...commonProps} />
          </div>
        );

      case 'parentHandbook':
        return (
          <div className="space-y-6">
            <ParentHandbook {...commonProps} />
          </div>
        );

      case 'enrollment':
        return (
          <div className="space-y-6">
            <EnrollmentForm {...commonProps} />
          </div>
        );

      case 'admission':
        return (
          <div className="space-y-6">
            <AdmissionForm 
              {...commonProps}
              initialFormData={activeChild?.formData}
            />
          </div>
        );

      default:
        return (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Form Not Found
            </h2>
            <p className="text-gray-600">
              The selected form section is not available.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster richColors position="top-center" />

      {/* Navigation Bar */}
      <HeaderNew onSignOut={signOut} sidebar={false} />

      {/* Stale data warning */}
      {isStale && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
          <div className="max-w-7xl mx-auto">
            <p className="text-sm text-yellow-800">
              ⚠️ Some data may be outdated. 
              <button 
                onClick={refreshData}
                className="ml-2 underline hover:no-underline"
              >
                Refresh now
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Welcome Section with Statistics */}
      <WelcomeSection 
        parentName={getWelcomeMessage()}
        stats={activeChild?.stats}
      />

      {/* Child Selection Tabs */}
      <ChildTabs 
        children={children}
        activeChildId={activeChildId}
        onChildSelect={switchChild}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-1/4">
            <FormSidebar
              activeChildId={activeChildId}
              onSectionChange={handleSectionChange}
              currentSection={currentSection}
              onHideCompleted={() => setShowCompletedForms(false)}
              onToggleCompleted={toggleCompletedForms}
              onSubFormChange={setSelectedSubForm}
              selectedSubForm={selectedSubForm}
              incompleteForms={activeChild?.incompleteForms || []}
            />
          </div>

          {/* Main Content Area */}
          <div className="w-full lg:w-3/4">
            {showCompletedForms ? (
              <CompletedFormsTable
                forms={activeChild?.completedForms || []}
                childName={activeChild?.firstName}
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
                onDownload={handleDownloadForm}
                onPrint={handlePrintForm}
                isProcessing={isDownloading}
              />
            ) : (
              renderCurrentFormSection()
            )}
          </div>
        </div>
      </div>

      {/* Loading Modal for File Operations */}
      {isDownloading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-sm mx-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F2D52] mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-[#0F2D52] mb-2">
              Processing...
            </h3>
            <p className="text-sm text-gray-600">
              Processing your request. Please wait...
            </p>
          </div>
        </div>
      )}

      {/* Hidden PDF Components for Legacy Support */}
      <div className="hidden">
        <AdmissionSectionPDF 
          ref={React.createRef()} 
          initialFormData={activeChild?.formData} 
        />
        <ParentHandbookPDF
          ref={React.createRef()}
          initialFormData={activeChild?.formData}
        />
        <ACHFormPDF
          ref={React.createRef()}
          initialFormData={activeChild?.formData}
        />
        <EnrollmentAgreementPDF
          ref={React.createRef()}
          initialFormData={activeChild?.formData}
        />
      </div>
    </div>
  );
};

export default ParentDashboardRefactored;