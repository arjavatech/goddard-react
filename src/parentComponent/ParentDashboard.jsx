import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import DataTable from '../components/DataTable';
import { useAuth } from '../hooks/useAuth';
// import FormSidebar from './FormSidebar';
import FormSidebar from '../parent/utilComponents/FormSidebar/FormSidebar';
import { formSections } from '../parent/utilComponents/FormSidebar/formSections';
import AuthorizationForm from '../components/AuthorizationForm';
import ParentHandbbok from './forms/ParentHanbook/policies/All';
import EnrollmentForm from '../components/EnrollmentForm';
import AdmissionForm from './forms/AdmissionForm/AdmissionForm';


const ParentDashboard = () => {
  const { isAuthenticated, signOut } = useAuth();
  const [children, setChildren] = useState([]);
  const [activeChildId, setActiveChildId] = useState(null);
  const [parentName, setParentName] = useState('');
  const [incompleteForms, setIncompleteForms] = useState([]);
  const [showCompletedForms, setShowCompletedForms] = useState(true);
  const [completedForms, setCompletedForms] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [currentSection, setCurrentSection] = useState(null); // Track which section is currently active
  const [formStatus, setFormStatus] = useState({}); // Track form completion status
  const [selectedSubForm, setSelectedSubForm] = useState(null); // Track selected sub-form

  const urlParams = new URLSearchParams(window.location.search);
  const editID = urlParams.get('id') || '';

  useEffect(() => {
    if (isAuthenticated) {
      checkParentAuthentication();
    }
  }, [isAuthenticated]);

  // Debug current section changes
  useEffect(() => {
    // console.log('Current section changed to:', currentSection);
    // Hide completed forms when switching to a form section
    if (currentSection) {
      setShowCompletedForms(false);
    }
  }, [currentSection]);

  // Load incomplete forms and reset states when activeChildId changes
  useEffect(() => {
    if (activeChildId) {
      // Reset states when switching children
      setCurrentSection(null);
      setShowCompletedForms(true); // Show completed forms by default
      setSelectedSubForm(null);
      setCompletedForms([]); // Clear old child's completed forms immediately
      
      // Load data for the new child
      loadIncompletedForms();
      loadCompletedForms();
    }
  }, [activeChildId]);

  const checkParentAuthentication = async () => {
    const loggedInEmail = localStorage.getItem('logged_in_email');
    // console.log('Logged In Email:', loggedInEmail);
    if (editID === loggedInEmail || loggedInEmail === 'goddard01arjava@gmail.com' || editID === '') {
      try {
        const url = editID ? 
          `https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/admission_child_personal/parent_email/${editID}` :
          `https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/admission_child_personal/parent_email/${loggedInEmail}`;
        
        const response = await fetch(url);
        const data = await response.json();
        // console.log('Parent Data:', data);
        
        if (data.parent_name) {
          localStorage.setItem('parent_name', data.parent_name);
          setParentName(data.parent_name);
        }
        
        if (data.children) {
          setChildren(data.children);
          localStorage.setItem('number_of_children', data.children.length.toString());
          
          const putcallId = sessionStorage.getItem('putcallId');
          // console.log('putcallId:', putcallId);
          if (putcallId) {
            setActiveChildId(putcallId);
          } else if (data.children.length > 0) {
            setActiveChildId(data.children[0].child_id);
            localStorage.setItem('child_name', data.children[0].child_first_name);
            localStorage.setItem('child_id', data.children[0].child_id);
          }
        }
      } catch (error) {
        // console.error('Error loading parent data:', error);
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
    }
  };

  const toggleCompletedForms = () => {
    // If already showing completed forms, refresh them instead of hiding
    if (showCompletedForms) {
      // Stay on completed forms page but refresh the data
      loadCompletedForms();
      return;
    }
    
    // If not showing completed forms, show them
    setShowCompletedForms(true);
    setCurrentSection(null); // Hide current form
    loadCompletedForms();
  };

  const loadCompletedForms = async () => {
    if (!activeChildId) return;
    // console.log('Loading Completed Forms for Child ID:', activeChildId);
    
    try {
      const response = await fetch(
        `https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/admission_child_personal/completed_form_status_year/${activeChildId}/${selectedYear}`
      );
      const data = await response.json();
      // console.log('Completed Forms Data:', data);
      
      // Always set completedForms - either with data or empty array
      if (data.CompletedFormStatus) {
        setCompletedForms(data.CompletedFormStatus);
      } else {
        setCompletedForms([]); // Clear old data and set empty array
      }
    } catch (error) {
      // console.error('Error loading completed forms:', error);
      setCompletedForms([]); // Clear old data on error
    }
  };

  const loadIncompletedForms = async () => {
    if (!activeChildId) return;
    
    try {
      // Fetch incomplete form status using the same API as FormStatusLogic
      const incompleteResponse = await fetch(
        `https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/admission_child_personal/incomplete_form_status/${activeChildId}`
      );
      
      if (!incompleteResponse.ok) {
        throw new Error('Failed to fetch incomplete form data');
      }

      const incompleteResult = await incompleteResponse.json();
      console.log('Incomplete Forms API Response:', incompleteResult);
      
      // Extract incomplete forms list from API response (same logic as FormStatusLogic)
      const incompleteFormsList = [];
      if (incompleteResult?.InCompletedFormStatus) {
        for (let value of Object.values(incompleteResult.InCompletedFormStatus)) {
          incompleteFormsList.push(value.replace(/\s+/g, "_").toLowerCase());
        }
      }
      
      console.log('Processed Incomplete Forms List:', incompleteFormsList);
      setIncompleteForms(incompleteFormsList);
      
    } catch (error) {
      console.error('Error loading incomplete forms:', error);
      setIncompleteForms([]);
    }
  };

  const getWelcomeMessage = () => {
    const loggedInEmail = localStorage.getItem('logged_in_email');
    if (loggedInEmail === 'goddard01arjava@gmail.com') {
      return 'Welcome Admin';
    }
    return `Welcome ${parentName}`;
  };

  // Function to render the current active form section
  const renderCurrentFormSection = () => {
    // Don't show any form if completed forms are being shown
    if (showCompletedForms) {
      return null;
    }

    if (!currentSection) {
      return (
        <div className="p-4 bg-white rounded m-3">
          <h3 className="text-lg font-semibold text-[#0F2D52] mb-4">Welcome to Forms</h3>
          <p className="text-gray-600">Please select a form from the sidebar to get started, or view completed forms.</p>
        </div>
      );
    }
    // console.log(currentSection);
    
    switch (currentSection) {
    
      
      case 'authorization':
        return (
          <div className="m-3">
            <AuthorizationForm selectedSubForm={selectedSubForm} />
          </div>
        );
      case 'parentHandbook':
        return (
          <div className="m-3">
            <ParentHandbbok selectedSubForm={selectedSubForm} />
          </div>
        );
      case 'enrollment':
        return (
          <div className="m-3">
            <EnrollmentForm selectedSubForm={selectedSubForm} />
          </div>
        );
      case 'admission':
        return (
          <div className="p-4 bg-white rounded m-3">

           <AdmissionForm selectedSubForm={selectedSubForm}></AdmissionForm>
            {/* <h3 className="text-lg font-semibold text-[#0F2D52] mb-4">Admission Forms</h3>
            <p className="text-gray-600">Admission forms will be loaded here by another team...</p> */}
          </div>
        );
      default:
        return (
          <div className="p-4 bg-white rounded m-3">
            
            <h3 className="text-lg font-semibold text-[#0F2D52] mb-4">Form Not Found</h3>
            <p className="text-gray-600">The selected form section is not available.</p>
          </div>
        );
    }
  };

  

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
    <Header onSignOut={signOut}></Header>

      {/* Welcome Section */}
      <div className="p-3">
        <h2 className="text-[#0F2D52] text-2xl font-bold text-center pt-4">
          Parent Dashboard
        </h2>
        <h4 className="text-xl text-center pt-2" id="welcomeText">
          {getWelcomeMessage()}
        </h4>
      </div>

      {/* Success/Error Messages */}
      <div className="success-msg fixed top-1 left-2 w-[96%] z-20 p-4 bg-green-100 border border-green-500 text-green-700 rounded hidden">
        <strong>Success!</strong> Data saved successfully!
      </div>
      <div className="error-msg fixed top-1 left-2 w-[96%] z-20 p-4 bg-red-100 border border-red-500 text-red-700 rounded hidden">
        <strong>Oops!</strong> Failed to save admission form!
      </div>

      {/* Main Content */}
      <div className="bg-[#0F2D52] m-2 mt-1 min-h-screen">
        {/* Child Tabs */}
        <div className="bg-[#0F2D52] text-white  rounded  "> 
          <ul className="flex p-1 items-start list-none" role="tablist" id="dynamicChildCards">
            {children.map((child) => (
              <li key={child.child_id} className="">
                <button
                  className={`w-full py-2 px-6 text-center font-semibold transition-colors ${
                    activeChildId === child.child_id
                      ? 'bg-[#0F2D52] text-white border-2 border-[#D8E9FF]'
                      : 'bg-[#D8E9FF] text-[#0F2D52] hover:border-[#D8E9FF] border-2 border-[#0F2D52]'
                  }`}
                  onClick={() => handleChildSelect(child.child_id)}
                >
                  <div className="h-10 flex items-center justify-center">
                    <h6 className="text-center font-semibold">
                      {child.child_first_name}
                    </h6>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex m-1 bg-[#D8E9FF] h-full min-h-screen" id="formdiv">
          {/* Sidebar */}
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

          {/* Main Content Area */}
          <div className="w-3/4">
            {/* Form Content - Only show the selected section */}
            <div className="tab-content">
              <form id="childInfoAdmission">
                <div className="tab-content admission_form" id="admissionforms"></div>
              </form>
              <form id="childInfoAuthorization">
                <div className="tab-content authorization" id="authorization"></div>
              </form>
              <form id="childInfoEnrollment">
                <div className="tab-content enrollment_agreement" id="enrollmentagreement"></div>
              </form>
              <form id="childInfoHandbook">
                <div className="tab-content parent_handbook" id="parenthandbook"></div>
              </form>
            </div>

            {/* Conditionally render forms based on current section */}
            {renderCurrentFormSection()}
            
            {/* Completed Forms Table */}
            <div 
              id="completedFormDetails" 
              className={`container m-3 ${showCompletedForms ? 'block' : 'hidden'}`}
            >
              <div className="bg-white shadow-lg rounded">
                <h3 className="text-center bg-[#0F2D52] text-white p-3 rounded-t">Completed Forms</h3>
                <div className="flex">
                  <div className="flex-1 p-4">
                    <h4 className="text-lg font-semibold">
                      Child Name: <span id="childName">{localStorage.getItem('child_name')}</span>
                    </h4>
                  </div>
                  <div className="w-1/3 p-4">
                    <div className="float-right">
                      <div className="form-group">
                        <label htmlFor="year" className="block font-bold mb-2">Year</label>
                        <select
                          name="year"
                          id="year"
                          className="form-control border border-gray-300 rounded px-3 py-2"
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                          required
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
                </div>
                
                <div className="flex justify-center m-4">
                  <div className="container mt-5">
                    <div className="table-wrapper" id="tableview">
                      <DataTable
                        data={completedForms}
                        columns={[
                          {
                            key: 'formname',
                            title: 'Form Name'
                          },
                          {
                            key: 'completedTimestamp',
                            title: 'Time Stamp',
                            render: (value) => new Date(value).toLocaleString()
                          },
                          {
                            key: 'action',
                            title: 'Action',
                            render: (value, row) => (
                              <div className="flex gap-2">
                                <button className="text-[#0F2D52] hover:opacity-60">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="18" height="18">
                                    <path fill="#0F2D52" d="M256 0a256 256 0 1 0 0 512A256 256 0 1 0 256 0zM376.9 294.6L269.8 394.5c-3.8 3.5-8.7 5.5-13.8 5.5s-10.1-2-13.8-5.5L135.1 294.6c-4.5-4.2-7.1-10.1-7.1-16.3c0-12.3 10-22.3 22.3-22.3l57.7 0 0-96c0-17.7 14.3-32 32-32l32 0c17.7 0 32 14.3 32 32l0 96 57.7 0c12.3 0 22.3 10 22.3 22.3c0 6.2-2.6 12.1-7.1 16.3z"/>
                                  </svg>
                                </button>
                                <button className="text-[#0F2D52] hover:opacity-60 ml-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="18" height="18">
                                    <path fill="#0F2D52" d="M128 0C92.7 0 64 28.7 64 64v96h64V64H354.7L384 93.3V160h64V93.3c0-17-6.7-33.3-18.7-45.3L400 18.7C388 6.7 371.7 0 354.7 0H128zM384 352v32 64H128V384 368 352H384zm64 32h32c17.7 0 32-14.3 32-32V256c0-35.3-28.7-64-64-64H64c-35.3 0-64 28.7-64 64v96c0 17.7 14.3 32 32 32H64v64c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V384zM432 248a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/>
                                  </svg>
                                </button>
                              </div>
                            ),
                            sortable: false
                          }
                        ]}
                        tableId="example"
                        className="w-full border-collapse border border-gray-300"
                        headerClassName="bg-[#0F2D52] text-white"
                        cellClassName="border border-gray-300 p-3"
                      />
                    </div>
                  
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
