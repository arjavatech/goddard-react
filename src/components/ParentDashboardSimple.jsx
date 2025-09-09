// Simplified Parent Dashboard - Single API call architecture
// NO complex state management, NO page reloads, NO caching layers
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAuth0 } from '@auth0/auth0-react';
import { useParentData } from '../hooks/useParentData';
import { toast, Toaster } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';

// Dashboard components
import HeaderNew from '../components/HeaderNew';
import ChildTabsSimple from './dashboard/ChildTabsSimple';
import WelcomeSection from './dashboard/WelcomeSection';
import CompletedFormsTable from './dashboard/CompletedFormsTable';

// Form sidebar (reuse existing)
import FormSidebar from '../parent/utilComponents/FormSidebar/FormSidebar';

// Form components (reuse existing - unchanged)
import AuthorizationForm from '../parentComponent/forms/AuthorizationFormNew';
import ParentHandbook from '../parentComponent/forms/ParentHanbook/policies/AllNew';
import EnrollmentForm from '../parentComponent/forms/EnrollmentFormNew';
import AdmissionForm from '../parentComponent/forms/AdmissionForm/AdmissionFormNew';

const ParentDashboardSimple = () => {
  const { isAuthenticated, signOut } = useAuth();
  const { user } = useAuth0(); // Get the actual logged-in user from Auth0
  
  // Get the actual logged-in user's email from Auth0
  const loggedInUserEmail = user?.email;
  
  // Get parent email from URL parameter (for viewing specific parent's dashboard)
  const urlParams = new URLSearchParams(window.location.search);
  const parentEmailToView = urlParams.get('id') || localStorage.getItem('logged_in_email');
  
  // The logged-in user email is used for permissions (admin signature access)
  // The parentEmailToView is used for fetching the parent's data
  
  // Real-time form progress state for sidebar updates
  const [currentFormProgress, setCurrentFormProgress] = useState({});
  

  // Single hook manages ALL dashboard data with ONE API call
  // Use parentEmailToView for fetching parent's data
  const {
    loading,
    error,
    parentName,
    children,
    activeChild,
    completedForms,
    incompleteForms,
    formData,
    formStatus, // NEW: Form status for sidebar
    switchChild,
    refresh,
    getWelcomeMessage,
    hasData
  } = useParentData(parentEmailToView);

  // Simple UI state (no complex state management)
  const [currentSection, setCurrentSection] = useState(null);
  const [showCompletedForms, setShowCompletedForms] = useState(true);
  const [selectedSubForm, setSelectedSubForm] = useState(null);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F2D52] mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-[#0F2D52] mb-2">
            Loading your dashboard...
          </h3>
          <p className="text-sm text-gray-600">
            Fetching all your data in one request
          </p>
        </div>
      </div>
    );
  }

  // Error state with retry
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="text-red-600 mb-4">
              <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error Loading Dashboard
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-[#0F2D52] text-white px-4 py-2 rounded hover:bg-[#0F2D52]/90"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // No data available
  if (!hasData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Children Found
            </h3>
            <p className="text-gray-600 mb-4">
              No children found for this parent account. Please contact support.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-[#0F2D52] text-white px-4 py-2 rounded hover:bg-[#0F2D52]/90"
            >
              Refresh
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Form section handlers
  const handleSectionChange = (section) => {
    console.log('📝 Form section selected:', section);
    setCurrentSection(section);
    setShowCompletedForms(false);
    setSelectedSubForm(null);
  };

  const toggleCompletedForms = () => {
    console.log('📋 Toggling completed forms view');
    setShowCompletedForms(!showCompletedForms);
    setCurrentSection(null);
    setSelectedSubForm(null);
  };

  // Form submission success handler - refreshes all data
  const handleFormSubmissionSuccess = () => {
    console.log('✅ Form submitted successfully, refreshing dashboard data...');
    refresh(); // This triggers the single API call to refresh all data
    // toast.success('Form submitted and dashboard updated!');
  };

  // Render current form section
  const renderFormSection = () => {
    if (showCompletedForms) {
      return null;
    }

    if (!currentSection) {
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-[#0F2D52] mb-4">
              Welcome to Forms
            </h2>
            <p className="text-gray-600">
              Please select a form from the sidebar to get started, or view completed forms.
            </p>
          </CardContent>
        </Card>
      );
    }

    

    // Handler for real-time form progress updates
    const handleFormProgressUpdate = (formType, itemKey, isCompleted) => {
      setCurrentFormProgress(prev => ({
        ...prev,
        [`${formType}_${itemKey}`]: { completed: isCompleted }
      }));
    };

    // Common props for all forms
    const commonProps = {
      selectedSubForm,
      childId: activeChild?.id,
      initialFormData: formData,
      onSubmitSuccess: handleFormSubmissionSuccess, // This will refresh the dashboard
      onProgressUpdate: handleFormProgressUpdate, // NEW: Real-time progress tracking
      onSubFormChange: setSelectedSubForm, // For sidebar sync
      formStatus: formStatus // For prerequisite checks
    };

    console.log('🎨 Rendering form section:', currentSection, 'for child:', activeChild?.id);

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
              initialFormData={formData}
            />
          </div>
        );

      default:
        return (
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                Form Not Found
              </h2>
              <p className="text-gray-600">
                The selected form section is not available.
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  console.log(formData);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster richColors position="top-center" />

      {/* Navigation Bar */}
      <HeaderNew onSignOut={signOut} sidebar={false} />

      {/* Welcome Section with Statistics */}
      <WelcomeSection 
        parentName={getWelcomeMessage()}
        stats={activeChild?.stats}
      />

      {/* Child Selection Tabs - NO PAGE RELOAD! */}
      <ChildTabsSimple 
        children={children}
        activeChildId={activeChild?.id}
        onChildSelect={switchChild} // Pure state update!
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="w-full lg:w-1/4">
            <FormSidebar
              activeChildId={activeChild?.id}
              onSectionChange={handleSectionChange}
              currentSection={currentSection}
              onHideCompleted={() => setShowCompletedForms(false)}
              onToggleCompleted={toggleCompletedForms}
              onSubFormChange={setSelectedSubForm}
              selectedSubForm={selectedSubForm}
              incompleteForms={incompleteForms}
              // NEW: Pass form status to avoid duplicate API call
              externalFormStatus={formStatus}
              externalLoading={loading}
              // NEW: Pass real-time form progress for unsaved changes
              currentFormProgress={currentFormProgress}
              // Pass the ACTUAL logged-in user's email for admin signature access control
              userEmail={loggedInUserEmail}
            />
          </div>

          {/* Main Content Area */}
          <div className="w-full lg:w-3/4">
            {showCompletedForms ? (
              <CompletedFormsTable
                forms={completedForms}
                childName={activeChild?.firstName}
                childId={activeChild?.id}
              />
            ) : (
              renderFormSection()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboardSimple;