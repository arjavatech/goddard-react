import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import DataTable from '../components/DataTable';
import { useAuth } from '../hooks/useAuth';
// import FormSidebar from './FormSidebar';
import FormSidebar from '../parent/utilComponents/FormSidebar/FormSidebar';
import { formSections } from '../parent/utilComponents/FormSidebar/formSections';
import AuthorizationForm from './forms/AuthorizationForm';
import ParentHandbbok from './forms/ParentHanbook/policies/All';
import EnrollmentForm from './forms/EnrollmentForm';
import AdmissionForm from './forms/AdmissionForm/AdmissionForm';
import ParentHandbook from './pdf_forms/ParentHandbook';
import AdmissionSection from './pdf_forms/AdmissionForm';
import ACHForm from './pdf_forms/AuthorizationForm';
import EnrollmentAgreementPDF from './pdf_forms/EnrollmentAgreement';


const ParentDashboard = () => {


  console.log('ParentDashboard component loaded');
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
  const [childFormData, setChildFormData] = useState(null); // Store child form data from API
  const [isDownloading, setIsDownloading] = useState(false); // Loading state for downloads
  const handbookContentRef = useRef(null); // Ref for ParentHandbook content
  const admissionFormRef = useRef(null); // Ref for AdmissionForm content
  const authorizationFormRef = useRef(null); // Ref for AuthorizationForm content
  const enrollmentFormRef = useRef(null); // Ref for EnrollmentForm content

  const urlParams = new URLSearchParams(window.location.search);
  const editID = urlParams.get('id') || '';

  const admissionRef = useRef();
  const achFormRef = useRef();
  const phbFormRef = useRef();
  const enrollFormRef = useRef();


  const handleDownload1 = async (mode) => {

    try {
      console.log("function")
      if (mode == "download") {
        await admissionRef.current?.generateDownload();
      }
      else {
        console.log("print funtion start")
        await admissionRef.current?.generatePrint();
        console.log("print funtion end")
      }

      console.log("function end")
    } catch (error) {
      console.error("Error in download:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      // setIsGenerating(false);
    }
  };



  // Function to handle the download button click
  const handleDownload2 = async (mode) => {
    try {
      if (mode == "download") {
        await achFormRef.current?.handleDownload2();
      }
      else {
        await achFormRef.current?.handlePrint2();
      }
      // Call the handleGeneratePdf method directly on the ACHForm component via its ref

    } catch (error) {
      console.error("Error in download:", error);

    }
  };

  const handleDownload3 = async (mode) => {
    try {
      // Call the handleGeneratePdf method directly on the ACHForm component via its ref
      if (mode == "download") {
        await phbFormRef.current?.generateDownload();
      }
      else {
        await phbFormRef.current?.generatePrint();
      }

    } catch (error) {
      console.error("Error in download:", error);

    }
  };

  const handleDownload4 = async (mode) => {
    try {
      console.log("enrollment form")
      if (mode == "download") {
        console.log("enrollment form pdf")
        await enrollFormRef.current?.generatePdf();
      }
      else {
        await enrollFormRef.current?.print()
      }

    } catch (error) {
      console.error("Error in download:", error);

    }
  };

  // Function to download form from S3 for Lynnwood school
  const downloadFromS3 = async (formName) => {
    try {
      const school_name = "lynnwood"; // Hardcoded as per requirement  
      const child_id = activeChildId; // Use activeChildId instead of childFormData?.id
      
      if (!child_id) {
        console.error("Child ID not found");
        alert("Child ID not found. Please select a child and try again.");
        return;
      }

      // Map form names to API endpoint format
      const formMapping = {
        'authorization_form': 'authorization_form',
        'parent_handbook': 'parent_handbook', 
        'enrollment_agreement': 'enrollment_agreement',
        'admission_form': 'admission_form'
      };

      const item = formMapping[formName];
      if (!item) {
        console.error("Unknown form name:", formName);
        alert("Unknown form type. Please try again.");
        return;
      }

      // Use the existing API endpoint to get file metadata
      const apiUrl = `https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/get-s3-file/${school_name}/${child_id}/${item}`;
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Verify file exists
      if (!data.s3_location || !data.filename) {
        alert("File not found. Please contact support.");
        return;
      }

      // Check if we have a working download URL
      if (data.download_url) {
        console.log(`Found download URL with ${data.download_url.includes('X-Amz-Algorithm=AWS4-HMAC-SHA256') ? 'AWS4 signature (good!)' : 'old signature'}`);
        
        try {
          // Try to download the file using the corrected URL
          const response = await fetch(data.download_url, {
            method: 'GET',
            mode: 'cors',
            credentials: 'omit'
          });
          
          if (response.ok) {
            const blob = await response.blob();
            console.log(`Successfully fetched file: ${blob.size} bytes`);
            
            // Create download link
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = data.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(link.href);
            
            console.log(`${formName} downloaded successfully: ${data.filename} (${Math.round(data.file_size / 1024)} KB)`);
          } else {
            throw new Error(`Download failed: ${response.status} ${response.statusText}`);
          }
        } catch (downloadError) {
          console.error("Download error:", downloadError);
          
          // If it's a CORS error, try alternative download method
          if (downloadError.name === 'TypeError' || downloadError.message.includes('CORS')) {
            console.log("CORS error detected, trying direct URL method...");
            
            try {
              // Method 1: Direct window location (bypasses CORS for downloads)
              window.location.href = data.download_url;
              console.log(`${formName} download initiated via window.location`);
              
            } catch (locationError) {
              // Method 2: Hidden iframe approach
              console.log("Window.location failed, trying iframe...");
              const iframe = document.createElement('iframe');
              iframe.style.display = 'none';
              iframe.style.position = 'absolute';
              iframe.style.left = '-9999px';
              iframe.src = data.download_url;
              document.body.appendChild(iframe);
              
              setTimeout(() => {
                if (document.body.contains(iframe)) {
                  document.body.removeChild(iframe);
                }
              }, 5000);
              
              console.log(`${formName} download initiated via iframe`);
            }
          } else {
            // Other types of errors
            const fileSize = data.file_size ? `${Math.round(data.file_size / 1024)} KB` : 'Unknown size';
            alert(`Download failed for ${data.filename} (${fileSize})\n\nError: ${downloadError.message}\n\nPlease try again or contact support.`);
          }
        }
      } else {
        alert("Download URL not available. Please contact support.");
      }
      
    } catch (error) {
      console.error(`Error accessing ${formName}:`, error);
      alert(`Unable to access file. Please try again later.\n\nError: ${error.message}`);
    }
  };

  // Function to print form from S3 for Lynnwood school (same logic as download but for print)
  const printFromS3 = async (formName) => {
    try {
      const school_name = "lynnwood"; // Hardcoded as per requirement  
      const child_id = activeChildId; // Use activeChildId instead of childFormData?.id
      
      if (!child_id) {
        console.error("Child ID not found");
        alert("Child ID not found. Please select a child and try again.");
        return;
      }

      // Map form names to API endpoint format
      const formMapping = {
        'authorization_form': 'authorization_form',
        'parent_handbook': 'parent_handbook', 
        'enrollment_agreement': 'enrollment_agreement',
        'admission_form': 'admission_form'
      };

      const item = formMapping[formName];
      if (!item) {
        console.error("Unknown form name:", formName);
        alert("Unknown form type. Please try again.");
        return;
      }

      // Use the existing API endpoint to get file metadata
      const apiUrl = `https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/get-s3-file/${school_name}/${child_id}/${item}`;
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Verify file exists
      if (!data.s3_location || !data.filename) {
        alert("File not found. Please contact support.");
        return;
      }

      // Check if we have a working download URL
      if (data.download_url) {
        console.log(`Found print URL with ${data.download_url.includes('X-Amz-Algorithm=AWS4-HMAC-SHA256') ? 'AWS4 signature (good!)' : 'old signature'}`);
        
        try {
          // Try to fetch the file for printing
          const response = await fetch(data.download_url, {
            method: 'GET',
            mode: 'cors',
            credentials: 'omit'
          });
          
          if (response.ok) {
            const blob = await response.blob();
            console.log(`Successfully fetched file for printing: ${blob.size} bytes`);
            
            // Create blob URL and open print dialog
            const blobUrl = window.URL.createObjectURL(blob);
            
            // Open in new window for printing
            const printWindow = window.open(blobUrl, '_blank');
            if (printWindow) {
              printWindow.onload = () => {
                setTimeout(() => {
                  printWindow.print();
                }, 500);
              };
              
              // Clean up blob URL after delay
              setTimeout(() => {
                window.URL.revokeObjectURL(blobUrl);
              }, 5000);
            }
            
            console.log(`${formName} opened for printing: ${data.filename} (${Math.round(data.file_size / 1024)} KB)`);
          } else {
            throw new Error(`Print fetch failed: ${response.status} ${response.statusText}`);
          }
        } catch (printError) {
          console.error("Print error:", printError);
          
          // If it's a CORS error, try alternative print method
          if (printError.name === 'TypeError' || printError.message.includes('CORS')) {
            console.log("CORS error detected, trying direct print method...");
            
            // Direct window.open for print (bypasses CORS)
            const printWindow = window.open(data.download_url, '_blank');
            if (printWindow) {
              printWindow.onload = () => {
                setTimeout(() => {
                  printWindow.print();
                }, 500);
              };
            }
            
            console.log(`${formName} print initiated via direct URL`);
          } else {
            // Other types of errors
            const fileSize = data.file_size ? `${Math.round(data.file_size / 1024)} KB` : 'Unknown size';
            alert(`Print failed for ${data.filename} (${fileSize})\n\nError: ${printError.message}\n\nPlease try again or contact support.`);
          }
        }
      } else {
        alert("Print URL not available. Please contact support.");
      }
      
    } catch (error) {
      console.error(`Error printing ${formName}:`, error);
      alert(`Unable to print file. Please try again later.\n\nError: ${error.message}`);
    }
  };

  const handleAuthorizationFormAPI = async () => {
    console.log("=== handleAuthorizationFormAPI function called ===");
    console.log("Loading should already be true, current state:", isDownloading);
    
    try {
      await downloadFromS3('authorization_form');
      
      // Ensure loading modal shows for at least 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error("Error in authorization form download:", error);
      
      // Ensure loading modal shows for at least 1 second even on error
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setIsDownloading(false); // Stop loading
      console.log("Loading state set to:", false);
    }
  };

  const handleAuthorizationFormPrintAPI = async () => {
    console.log("=== handleAuthorizationFormPrintAPI function called ===");
    console.log("Loading should already be true, current state:", isDownloading);
    
    try {
      // For now, we'll use the same API as download but handle the response differently for printing
      // In the future, you might want to create a separate print API endpoint
      
      // Prepare the request body with form data
      const requestBody = {
        bank_routing: childFormData?.bank_routing || "",
        bank_account: childFormData?.bank_account || "", 
        driver_license: childFormData?.driver_license || "",
        state: childFormData?.state || "",
        authorized_name: childFormData?.i || "",
        parent_signature: childFormData?.parent_sign_ach || "",
        signature_date: childFormData?.parent_sign_date_ach || ""
      };

      console.log("Request body:", requestBody);

      const response = await fetch('https://27nssk4mg6.execute-api.ap-south-1.amazonaws.com/test/generate-authorization-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("API response:", result);
      
      // Check if the response has base64 encoded PDF
      if (result.isBase64Encoded && result.body) {
        // Decode base64 to binary
        const binaryString = atob(result.body);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Create blob and open print dialog instead of downloading
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        
        // Open in new window and trigger print
        const printWindow = window.open(url, '_blank');
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
          };
        }
        
        // Clean up the object URL after a delay
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);
        
        console.log("Authorization form opened for printing successfully");
      } else {
        alert("Authorization form generated successfully for printing!");
      }
      
      // Ensure loading modal shows for at least 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error("Error in authorization form print API call:", error);
      alert("Failed to generate authorization form for printing. Please try again.");
      
      // Ensure loading modal shows for at least 1 second even on error
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setIsDownloading(false); // Stop loading
      console.log("Loading state set to:", false);
    }
  };

  const handleParentHandbookAPI = async () => {
    console.log("=== handleParentHandbookAPI function called ===");
    console.log("Loading should already be true, current state:", isDownloading);
    console.log("activeChildId:", activeChildId);
    console.log("childFormData available:", !!childFormData);
    
    try {
      await downloadFromS3('parent_handbook');
      
      // Ensure loading modal shows for at least 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error("Error in parent handbook download:", error);
      
      // Ensure loading modal shows for at least 1 second even on error
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setIsDownloading(false); // Stop loading
      console.log("Loading state set to:", false);
    }
  };

  const handleEnrollmentAgreementAPI = async () => {
    console.log("=== handleEnrollmentAgreementAPI function called ===");
    console.log("Loading should already be true, current state:", isDownloading);
    
    try {
      await downloadFromS3('enrollment_agreement');
      
      // Ensure loading modal shows for at least 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error("Error in enrollment agreement download:", error);
      
      // Ensure loading modal shows for at least 1 second even on error
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setIsDownloading(false); // Stop loading
      console.log("Loading state set to:", false);
    }
  };

  const handleAdmissionFormAPI = async () => {
    console.log("=== handleAdmissionFormAPI function called ===");
    console.log("Loading should already be true, current state:", isDownloading);
    
    try {
      await downloadFromS3('admission_form');
      
      // Ensure loading modal shows for at least 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error("Error in admission form download:", error);
      
      // Ensure loading modal shows for at least 1 second even on error
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setIsDownloading(false); // Stop loading
      console.log("Loading state set to:", false);
    }
  };

  const handleEnrollmentAgreementPrintAPI = async () => {
    console.log("=== handleEnrollmentAgreementPrintAPI function called ===");
    console.log("Loading should already be true, current state:", isDownloading);
    
    try {
      // Get current child name from children array
      const currentChild = children.find(child => child.child_id === activeChildId);
      const childName = currentChild ? `${currentChild.child_first_name} ${currentChild.child_last_name || ''}`.trim() : '';
      
      // Get parent names from childFormData
      const parentNames = childFormData?.parent_name || childFormData?.primary_parent_name || '';
      
      // Prepare the request body with form data (same as download)
      const requestBody = {
        effective_date: childFormData?.point_one_field_three || "",
        parent_names: parentNames,
        child_name: childName,
        child_dob: childFormData?.dob || "",
        preferred_start_date: childFormData?.preferred_start_date || "",
        preferred_schedule: childFormData?.preferred_schedule || "",
        parent_email: childFormData?.primary_parent_email || "",
        home_address: childFormData?.preferred_home_addr || "",
        parent_signature: childFormData?.parent_sign_enroll || "",
        signature_date: childFormData?.parent_sign_date_enroll || "",
        
        full_day: childFormData?.full_day === 'on' || childFormData?.full_day === true || false,
        half_day: childFormData?.half_day === 'on' || childFormData?.half_day === true || false,
        
        initial_2: childFormData?.point_two_initial_here || "",
        initial_3: childFormData?.point_three_initial_here || "",
        initial_4: childFormData?.point_four_initial_here || "",
        initial_5: childFormData?.point_five_initial_here || "",
        initial_6: childFormData?.point_six_initial_here || "",
        initial_7: childFormData?.point_seven_initial_here || "",
        initial_8: childFormData?.point_eight_initial_here || "",
        initial_9: childFormData?.point_nine_initial_here || "",
        initial_10: childFormData?.point_ten_initial_here || "",
        initial_11: childFormData?.point_eleven_initial_here || "",
        initial_12: childFormData?.point_twelve_initial_here || "",
        initial_13: childFormData?.point_thirteen_initial_here || "",
        initial_14: childFormData?.point_fourteen_initial_here || "",
        initial_15: childFormData?.point_fifteen_initial_here || "",
        initial_16: childFormData?.point_sixteen_initial_here || "",
        initial_17: childFormData?.point_seventeen_initial_here || "",
        initial_18: childFormData?.point_eighteen_initial_here || "",
        initial_19: childFormData?.point_ninteen_initial_here || ""
      };

      console.log("Request body:", requestBody);

      const response = await fetch('https://27nssk4mg6.execute-api.ap-south-1.amazonaws.com/test/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("API response:", result);
      
      // Check if the response has base64 encoded PDF
      if (result.isBase64Encoded && result.body) {
        // Decode base64 to binary
        const binaryString = atob(result.body);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Create blob and open print dialog instead of downloading
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        
        // Open in new window and trigger print
        const printWindow = window.open(url, '_blank');
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
          };
        }
        
        // Clean up the object URL after a delay
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);
        
        console.log("Enrollment agreement opened for printing successfully");
      } else {
        alert("Enrollment agreement generated successfully for printing!");
      }
      
      // Ensure loading modal shows for at least 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error("Error in enrollment agreement print API call:", error);
      alert("Failed to generate enrollment agreement for printing. Please try again.");
      
      // Ensure loading modal shows for at least 1 second even on error
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setIsDownloading(false); // Stop loading
      console.log("Loading state set to:", false);
    }
  };

  const handleParentHandbookPrintAPI = async () => {
    console.log("=== handleParentHandbookPrintAPI function called ===");
    console.log("Loading should already be true, current state:", isDownloading);
    
    try {
      // Prepare the request body with the required format (same as download)
      const requestBody = {
        welcome_goddard_agreement: childFormData?.welcome_goddard_agreement === 'on' ? true : false,
        mission_statement_agreement: childFormData?.mission_statement_agreement === 'on' ? true : false,
        general_information_agreement: childFormData?.general_information_agreement === 'on' ? true : false,
        parent_access_agreement: childFormData?.parent_access_agreement === 'on' ? true : false,
        release_of_children_agreement: childFormData?.release_of_children_agreement === 'on' ? true : false,
        registration_fees_agreement: childFormData?.registration_fees_agreement === 'on' ? true : false,
        outside_engagements_agreement: childFormData?.outside_engagements_agreement === 'on' ? true : false,
        health_policies_agreement: childFormData?.health_policies_agreement === 'on' ? true : false,
        medication_procedures_agreement: childFormData?.medication_procedures_agreement === 'on' ? true : false,
        rest_time_agreement: childFormData?.rest_time_agreement === 'on' ? true : false,
        training_philosophy_agreement: childFormData?.training_philosophy_agreement === 'on' ? true : false,
        bring_to_school_agreement: childFormData?.bring_to_school_agreement === 'on' ? true : false,
        affiliation_policy_agreement: childFormData?.affiliation_policy_agreement === 'on' ? true : false,
        emergency_procedures_agreement: childFormData?.emergency_procedures_agreement === 'on' ? true : false,
        expulsion_policy_agreement: childFormData?.expulsion_policy_agreement === 'on' ? true : false,
        addressing_individual_child_agreement: childFormData?.addressing_individual_child_agreement === 'on' ? true : false,
        security_issue_agreement: childFormData?.security_issue_agreement === 'on' ? true : false,
        finalword_agreement: childFormData?.finalword_agreement === 'on' ? true : false,
        parent_signature: childFormData?.parent_sign_handbook || "Sarah Johnson",
        signature_date: childFormData?.parent_sign_date_handbook || "2025-08-14"
      };

      console.log("Request body:", requestBody);

      const response = await fetch('https://27nssk4mg6.execute-api.ap-south-1.amazonaws.com/test/generate-handbook-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("API response:", result);
      
      // Check if the response has base64 encoded PDF
      if (result.isBase64Encoded && result.body) {
        // Decode base64 to binary
        const binaryString = atob(result.body);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Create blob and open print dialog instead of downloading
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        
        // Open in new window and trigger print
        const printWindow = window.open(url, '_blank');
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
          };
        }
        
        // Clean up the object URL after a delay
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);
        
        console.log("Parent handbook opened for printing successfully");
      } else {
        alert("Parent handbook generated successfully for printing!");
      }
      
      // Ensure loading modal shows for at least 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error("Error in parent handbook print API call:", error);
      alert("Failed to generate parent handbook for printing. Please try again.");
      
      // Ensure loading modal shows for at least 1 second even on error
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setIsDownloading(false); // Stop loading
      console.log("Loading state set to:", false);
    }
  };

  const handleAdmissionFormPrintAPI = async () => {
    console.log("=== handleAdmissionFormPrintAPI function called ===");
    console.log("Loading should already be true, current state:", isDownloading);
    
    try {
      // Get current child name from children array
      const currentChild = children.find(child => child.child_id === activeChildId);
      const childName = currentChild ? `${currentChild.child_first_name} ${currentChild.child_last_name || ''}`.trim() : '';
      
      // Get parent names from childFormData
      const parentNames = childFormData?.parent_name || childFormData?.primary_parent_name || '';
      
      // Prepare the request body with form data (same as download)
      const requestBody = {
        // Child Information
        child_first_name: childFormData?.child_first_name || "",
        child_last_name: childFormData?.child_last_name || "",
        nick_name: childFormData?.nick_name || "",
        dob: childFormData?.dob || "",
        primary_language: childFormData?.primary_language || "",
        gender: childFormData?.gender === 1 ? "Male" : childFormData?.gender === 2 ? "Female" : (childFormData?.gender || ""),
        school_age_child_school: childFormData?.school_age_child_school || "",

        // Primary Parent/Guardian
        parent_name: childFormData?.primary_parent_info?.parent_name || "",
        do_relevant_custody_papers_apply: childFormData?.primary_parent_info?.do_relevant_custody_papers_apply === 1 ? "Yes" : childFormData?.primary_parent_info?.do_relevant_custody_papers_apply === 2 ? "No" : (childFormData?.primary_parent_info?.do_relevant_custody_papers_apply || ""),
        parent_street_address: childFormData?.primary_parent_info?.parent_street_address || "",
        parent_city_address: childFormData?.primary_parent_info?.parent_city_address || "",
        parent_state_address: childFormData?.primary_parent_info?.parent_state_address || "",
        parent_zip_address: childFormData?.primary_parent_info?.parent_zip_address || "",
        business_name: childFormData?.primary_parent_info?.parent_business_name || "",
        work_hours_from: childFormData?.primary_parent_info?.parent_work_hours_from || "",
        work_hours_to: childFormData?.primary_parent_info?.parent_work_hours_to || "",
        business_telephone_number: childFormData?.primary_parent_info?.parent_business_telephone_number || "",
        business_cell_number: childFormData?.primary_parent_info?.parent_business_cell_number || "",
        primary_parent_email: childFormData?.primary_parent_email || "",
        home_telephone_number: childFormData?.primary_parent_info?.parent_home_telephone_number || "",

        // Second Parent/Guardian
        parent_two_name: childFormData?.additional_parent_info?.parent_two_name || "",
        parent_two_home_telephone_number: childFormData?.additional_parent_info?.parent_two_home_telephone_number || "",
        parent_two_street_address: childFormData?.additional_parent_info?.parent_two_street_address || "",
        parent_two_city_address: childFormData?.additional_parent_info?.parent_two_city_address || "",
        parent_two_state_address: childFormData?.additional_parent_info?.parent_two_state_address || "",
        parent_two_zip_address: childFormData?.additional_parent_info?.parent_two_zip_address || "",
        parent_two_business_name: childFormData?.additional_parent_info?.parent_two_business_name || "",
        parent_two_work_hours_from: childFormData?.additional_parent_info?.parent_two_work_hours_from || "",
        parent_two_work_hours_to: childFormData?.additional_parent_info?.parent_two_work_hours_to || "",
        parent_two_business_telephone_number: childFormData?.additional_parent_info?.parent_two_business_telephone_number || "",
        parent_two_business_cell_number: childFormData?.additional_parent_info?.parent_two_business_cell_number || "",
        parent_email: childFormData?.additional_parent_info?.parent_email || "",

        // Emergency Contacts (3 contacts)
        child_emergency_contact_name0: childFormData?.emergency_contact_info?.[0]?.child_emergency_contact_name || "",
        child_emergency_contact_relationship0: childFormData?.emergency_contact_info?.[0]?.child_emergency_contact_relationship || "",
        child_emergency_contact_full_address0: childFormData?.emergency_contact_info?.[0]?.child_emergency_contact_full_address || "",
        child_emergency_contact_city_address0: childFormData?.emergency_contact_info?.[0]?.child_emergency_contact_city_address || "",
        child_emergency_contact_state_address0: childFormData?.emergency_contact_info?.[0]?.child_emergency_contact_state_address || "",
        child_emergency_contact_zip_address0: childFormData?.emergency_contact_info?.[0]?.child_emergency_contact_zip_address || "",
        child_emergency_contact_telephone_number0: childFormData?.emergency_contact_info?.[0]?.child_emergency_contact_telephone_number || "",

        child_emergency_contact_name1: childFormData?.emergency_contact_info?.[1]?.child_emergency_contact_name || "",
        child_emergency_contact_relationship1: childFormData?.emergency_contact_info?.[1]?.child_emergency_contact_relationship || "",
        child_emergency_contact_full_address1: childFormData?.emergency_contact_info?.[1]?.child_emergency_contact_full_address || "",
        child_emergency_contact_city_address1: childFormData?.emergency_contact_info?.[1]?.child_emergency_contact_city_address || "",
        child_emergency_contact_state_address1: childFormData?.emergency_contact_info?.[1]?.child_emergency_contact_state_address || "",
        child_emergency_contact_zip_address1: childFormData?.emergency_contact_info?.[1]?.child_emergency_contact_zip_address || "",
        child_emergency_contact_telephone_number1: childFormData?.emergency_contact_info?.[1]?.child_emergency_contact_telephone_number || "",

        child_emergency_contact_name2: childFormData?.emergency_contact_info?.[2]?.child_emergency_contact_name || "",
        child_emergency_contact_relationship2: childFormData?.emergency_contact_info?.[2]?.child_emergency_contact_relationship || "",
        child_emergency_contact_full_address2: childFormData?.emergency_contact_info?.[2]?.child_emergency_contact_full_address || "",
        child_emergency_contact_city_address2: childFormData?.emergency_contact_info?.[2]?.child_emergency_contact_city_address || "",
        child_emergency_contact_state_address2: childFormData?.emergency_contact_info?.[2]?.child_emergency_contact_state_address || "",
        child_emergency_contact_zip_address2: childFormData?.emergency_contact_info?.[2]?.child_emergency_contact_zip_address || "",
        child_emergency_contact_telephone_number2: childFormData?.emergency_contact_info?.[2]?.child_emergency_contact_telephone_number || "",

        // Healthcare Provider
        child_care_provider_name: childFormData?.child_care_provider_info?.child_care_provider_name || "",
        child_hospital_affiliation: childFormData?.child_care_provider_info?.child_hospital_affiliation || "",
        child_care_provider_street_address: childFormData?.child_care_provider_info?.child_care_provider_street_address || "",
        child_care_provider_city_address: childFormData?.child_care_provider_info?.child_care_provider_city_address || "",
        child_care_provider_state_address: childFormData?.child_care_provider_info?.child_care_provider_state_address || "",
        child_care_provider_zip_address: childFormData?.child_care_provider_info?.child_care_provider_zip_address || "",
        child_care_provider_telephone_number: childFormData?.child_care_provider_info?.child_care_provider_telephone_number || "",

        // Additional fields for completeness
        parent_signature: childFormData?.parent_sign_admission || "",
        signature_date: childFormData?.parent_sign_date_admission || ""
      };

      console.log("Request body:", requestBody);

      const response = await fetch('https://27nssk4mg6.execute-api.ap-south-1.amazonaws.com/test/generate-admission-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("API response:", result);
      
      // Check if the response has base64 encoded PDF
      if (result.isBase64Encoded && result.body) {
        // Decode base64 to binary
        const binaryString = atob(result.body);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Create blob and open print dialog instead of downloading
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        
        // Open in new window and trigger print
        const printWindow = window.open(url, '_blank');
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
          };
        }
        
        // Clean up the object URL after a delay
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);
        
        console.log("Admission form opened for printing successfully");
      } else {
        alert("Admission form generated successfully for printing!");
      }
      
      // Ensure loading modal shows for at least 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error("Error in admission form print API call:", error);
      alert("Failed to generate admission form for printing. Please try again.");
      
      // Ensure loading modal shows for at least 1 second even on error
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setIsDownloading(false); // Stop loading
      console.log("Loading state set to:", false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      checkParentAuthentication();
    }
  }, [isAuthenticated]);

  // Debug current section changes
  useEffect(() => {
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
      setChildFormData(null); // Clear old child's form data immediately

      // Load data for the new child
      loadIncompletedForms();
      loadCompletedForms();
      loadChildFormDetails();
    }
  }, [activeChildId]);

  const checkParentAuthentication = async () => {
    const loggedInEmail = localStorage.getItem('logged_in_email');
    if (editID === loggedInEmail || loggedInEmail === 'goddard01arjava@gmail.com' || editID === '') {
      try {
        const url = editID ?
          `https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/admission_child_personal/parent_email/${editID}` :
          `https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/admission_child_personal/parent_email/${loggedInEmail}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.parent_name) {
          localStorage.setItem('parent_name', data.parent_name);
          setParentName(data.parent_name);
        }

        if (data.children) {
          setChildren(data.children);
          localStorage.setItem('number_of_children', data.children.length.toString());

          const putcallId = sessionStorage.getItem('putcallId');
          if (putcallId) {
            setActiveChildId(putcallId);
          } else if (data.children.length > 0) {
            setActiveChildId(data.children[0].child_id);
            localStorage.setItem('child_name', data.children[0].child_first_name);
            localStorage.setItem('child_id', data.children[0].child_id);
          }
        }
      } catch (error) {
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

    try {
      const response = await fetch(
        `https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/admission_child_personal/completed_form_status_year/${activeChildId}/${selectedYear}`
      );
      const data = await response.json();

      // Always set completedForms - either with data or empty array
      if (data.CompletedFormStatus) {
        setCompletedForms(data.CompletedFormStatus);
      } else {
        setCompletedForms([]); // Clear old data and set empty array
      }
    } catch (error) {
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

      // Extract incomplete forms list from API response (same logic as FormStatusLogic)
      const incompleteFormsList = [];
      if (incompleteResult?.InCompletedFormStatus) {
        for (let value of Object.values(incompleteResult.InCompletedFormStatus)) {
          incompleteFormsList.push(value.replace(/\s+/g, "_").toLowerCase());
        }
      }

      setIncompleteForms(incompleteFormsList);

    } catch (error) {
      setIncompleteForms([]);
    }
  };

  const loadChildFormDetails = async () => {
    if (!activeChildId) return;

    try {
      const response = await fetch(
        `https://v2bvjzsgrk.execute-api.ap-south-1.amazonaws.com/test/child_all_form_details/fetch/${activeChildId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch child form details');
      }

      const formData = await response.json();
      setChildFormData(formData);

    } catch (error) {
      setChildFormData(null);
    }
  };

  const getWelcomeMessage = () => {
    const loggedInEmail = localStorage.getItem('logged_in_email');
    if (loggedInEmail === 'goddard01arjava@gmail.com') {
      return 'Welcome Admin';
    }
    return `Welcome ${parentName}`;
  };

  // Get form ref based on form name
  const getFormRef = (formName) => {
    switch (formName) {
      case 'parent_handbook':
        return handbookContentRef;
      case 'admission_form':
        return admissionFormRef;
      case 'authorization_form':
        return authorizationFormRef;
      case 'enrollment_form':
        return enrollmentFormRef;
      default:
        return null;
    }
  };

  // Handle download functionality
  const handleDownload = async (formName, url) => {
    console.log('Download button clicked for:', formName, 'URL:', url);

    const formRef = getFormRef(formName);
    if (formRef) {
      console.log(`Processing ${formName} download from PDF component...`);
      // Handle PDF form download directly from component
      const loadScript = (src) => {
        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = src;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      };

      // Load required libraries
      Promise.all([
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'),
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js')
      ])
        .then(() => {
          console.log('PDF libraries loaded successfully');
          // Add a small delay to ensure component is fully rendered
          setTimeout(() => {
            const { jsPDF } = window.jspdf;
            const content = formRef.current;

            if (!content) {
              console.error(`${formName} content not found`);
              return;
            }
            console.log(`${formName} content found:`, content);
            console.log('Content innerHTML length:', content.innerHTML.length);
            console.log('Content HTML preview:', content.innerHTML.substring(0, 500));
            console.log('Generating PDF...');

            // Hide checkboxes for PDF
            const checkboxes = content.querySelectorAll('.custom-checkbox');
            checkboxes.forEach(checkbox => {
              checkbox.style.display = 'none';
            });

            // Fix OKLCH color issue for html2canvas compatibility
            const replaceOKLCHColors = (element) => {
              const allElements = element.querySelectorAll('*');
              allElements.forEach((el) => {
                const style = window.getComputedStyle(el);
                ['color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor'].forEach((prop) => {
                  if (style[prop]?.includes('oklch')) {
                    // Convert oklch to appropriate fallback colors
                    if (prop.includes('background') || prop.includes('Background')) {
                      el.style[prop] = style[prop].includes('0.15') ? '#0f2d52' : '#ffffff';
                    } else if (prop.includes('border') || prop.includes('Border')) {
                      el.style[prop] = '#0f2d52';
                    } else {
                      el.style[prop] = '#000000';
                    }
                  }
                });
              });
            };

            // Apply OKLCH color fixes
            replaceOKLCHColors(content);

            // Enhance input styling for PDF - handle all input types
            const inputs = content.querySelectorAll('.underline-input, .text-box, input[type="text"], input[type="date"]');
            const originalInputStyles = {};
            inputs.forEach((input, index) => {
              originalInputStyles[index] = {
                borderBottom: input.style.borderBottom,
                borderColor: input.style.borderColor,
                minHeight: input.style.minHeight,
                borderWidth: input.style.borderWidth
              };
              // Force visible borders for PDF
              input.style.borderBottom = '3px solid #000 !important';
              input.style.borderColor = '#000 !important';
              input.style.minHeight = '25px';
              input.style.borderWidth = '0 0 3px 0';
            });

            // Create PDF
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const margins = 10;

            // Apply larger font styles for PDF generation
            const originalFontSizes = {};
            const elements = content.querySelectorAll('p, h3, h4, h5, li');

            // Store original font sizes and set larger ones
            elements.forEach(el => {
              originalFontSizes[el] = el.style.fontSize;
              el.style.fontSize = el.tagName === 'P' || el.tagName === 'LI' ? '34px' :
                el.tagName === 'H5' ? '38px' :
                  el.tagName === 'H4' ? '40px' :
                    el.tagName === 'H3' ? '42px' : '34px';
            });

            // Function to add pages with proper multi-page support
            const addMultiPage = (element) => {
              return html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                height: element.scrollHeight,
                width: element.scrollWidth,
                allowTaint: true,
                backgroundColor: '#ffffff',
                removeContainer: false,
                foreignObjectRendering: false
              }).then(canvas => {
                const imgData = canvas.toDataURL('image/jpeg', 0.8);

                // Calculate dimensions
                const imgWidth = pdfWidth - (margins * 2);
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                const pageHeight = pdfHeight - (margins * 2);

                // If content fits on one page
                if (imgHeight <= pageHeight) {
                  pdf.addImage(imgData, 'JPEG', margins, margins, imgWidth, imgHeight);
                } else {
                  // Split content across multiple pages
                  let currentY = 0;
                  let pageIndex = 0;

                  while (currentY < imgHeight) {
                    if (pageIndex > 0) pdf.addPage();

                    const remainingHeight = imgHeight - currentY;
                    const heightToAdd = Math.min(pageHeight, remainingHeight);

                    // Create a temporary canvas for this page section
                    const pageCanvas = document.createElement('canvas');
                    const pageCtx = pageCanvas.getContext('2d');

                    pageCanvas.width = canvas.width;
                    pageCanvas.height = (heightToAdd * canvas.width) / imgWidth;

                    // Draw the portion of the original canvas onto the page canvas
                    pageCtx.drawImage(
                      canvas,
                      0, (currentY * canvas.width) / imgWidth,
                      canvas.width, pageCanvas.height,
                      0, 0,
                      canvas.width, pageCanvas.height
                    );

                    const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.8);
                    pdf.addImage(pageImgData, 'JPEG', margins, margins, imgWidth, heightToAdd);

                    currentY += heightToAdd;
                    pageIndex++;
                  }
                }
              });
            };

            // Process content with multi-page support
            addMultiPage(content).then(() => {
              pdf.save(`${formName}.pdf`);

              // Restore original font sizes
              elements.forEach(el => {
                el.style.fontSize = originalFontSizes[el] || '';
              });

              // Restore original input styles
              inputs.forEach((input, index) => {
                if (originalInputStyles[index]) {
                  input.style.borderBottom = originalInputStyles[index].borderBottom || '';
                  input.style.borderColor = originalInputStyles[index].borderColor || '';
                  input.style.minHeight = originalInputStyles[index].minHeight || '';
                  input.style.borderWidth = originalInputStyles[index].borderWidth || '';
                }
              });

              console.log('Download completed successfully');
            }).catch(error => {
              console.error('Error during PDF generation:', error);

              // Restore styles even if PDF generation fails
              elements.forEach(el => {
                el.style.fontSize = originalFontSizes[el] || '';
              });
              inputs.forEach((input, index) => {
                if (originalInputStyles[index]) {
                  input.style.borderBottom = originalInputStyles[index].borderBottom || '';
                  input.style.borderColor = originalInputStyles[index].borderColor || '';
                  input.style.minHeight = originalInputStyles[index].minHeight || '';
                  input.style.borderWidth = originalInputStyles[index].borderWidth || '';
                }
              });
            });
          }, 1000); // 1 second delay to ensure rendering
        })
        .catch(error => {
          console.error('Error loading PDF libraries:', error);
        });
      return;
    }
    try {
      const response = await fetch(url);
      const text = await response.text();

      // Create hidden div for PDF generation
      const hiddenDiv = document.createElement('div');
      hiddenDiv.id = 'formContent';
      hiddenDiv.style.display = 'none';
      hiddenDiv.innerHTML = text;
      document.body.appendChild(hiddenDiv);

      // Generate PDF using jsPDF
      if (window.jspdf) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', [1500, 1400]);

        doc.html(hiddenDiv, {
          callback: function () {

            doc.save(`${formName}.pdf`);
            document.body.removeChild(hiddenDiv);
          },
          x: 12,
          y: 12,
          autoPaging: 'slice',
          html2canvas: { scale: 0.75 },
          pagesplit: true,
        });
      }
    } catch (error) {
      console.error('Error downloading form:', error);
    }
  };

  // Get form URLs for download/print (now all forms use direct component approach)
  const getFormUrls = (formName) => {
    // All forms now use direct component approach, no HTML files needed
    return {
      download: '',
      print: ''
    };
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

    switch (currentSection) {


      case 'authorization':
        return (
          <div className="m-3">
            <AuthorizationForm
              selectedSubForm={selectedSubForm}
              childId={activeChildId}
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
          <div className="m-3">
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
          <div className="m-3">
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
          <div className="p-4 bg-white rounded m-3">

            <AdmissionForm
              selectedSubForm={selectedSubForm}
              initialFormData={childFormData}
              childId={activeChildId}
            />
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
    <>
      {/* Add spinner animation CSS */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <Header onSignOut={signOut}></Header>

      {/* Welcome Section */}
      <div className="p-3">
        <h2 className="text-[#0F2D52] text-xl sm:text-2xl font-bold text-center pt-4">
          Parent Dashboard
        </h2>
        <h4 className="text-lg sm:text-xl text-center pt-2" id="welcomeText">
          {getWelcomeMessage()}
        </h4>
      </div>

      {/* Success/Error Messages - Responsive positioning */}
      <div className="success-msg fixed top-16 sm:top-4 left-1/2 transform -translate-x-1/2 w-[95%] sm:w-auto sm:left-4 z-20 p-4 bg-green-100 border border-green-500 text-green-700 rounded hidden">
        <strong>Success!</strong> Data saved successfully!
      </div>
      <div className="error-msg fixed top-16 sm:top-4 left-1/2 transform -translate-x-1/2 w-[95%] sm:w-auto sm:left-4 z-20 p-4 bg-red-100 border border-red-500 text-red-700 rounded hidden">
        <strong>Oops!</strong> Failed to save admission form!
      </div>

      {/* Main Content */}
      <div className="bg-[#0F2D52] mx-0 sm:mx-2 mt-1 min-h-screen">
        {/* Child Tabs - Responsive */}
        <div className="bg-[#0F2D52] text-white rounded overflow-x-auto">
          <ul className="flex p-1 items-start list-none min-w-max" role="tablist" id="dynamicChildCards">
            {children.map((child) => (
              <li key={child.child_id} className="flex-none min-w-[100px]">
                <button
                  className={`w-full py-2 px-3 sm:px-6 text-center font-semibold transition-colors text-sm sm:text-base ${activeChildId === child.child_id
                    ? 'bg-[#0F2D52] text-white border-2 border-[#D8E9FF]'
                    : 'bg-[#D8E9FF] text-[#0F2D52] hover:border-[#D8E9FF] border-2 border-[#0F2D52]'
                    }`}
                  onClick={() => handleChildSelect(child.child_id)}
                >
                  <div className="h-10 flex items-center justify-center">
                    <h6 className="text-center font-semibold truncate">
                      {child.child_first_name}
                    </h6>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Main Content Area - Responsive Layout */}
        <div className="flex flex-col lg:flex-row m-0 sm:m-1 bg-[#D8E9FF] h-full min-h-screen">
          {/* Sidebar - Your existing responsive sidebar */}
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

          {/* Main Content - Full width on mobile, 3/4 on desktop */}
          <div className="w-full lg:w-3/4 p-1 sm:p-2 overflow-x-hidden">
            {/* Form Content */}
            {renderCurrentFormSection()}

            {/* Completed Forms Table - Responsive */}
            <div
              id="completedFormDetails"
              className={`container mx-auto m-1 sm:m-3 ${showCompletedForms ? 'block' : 'hidden'}`}
            >
              <div className="bg-white shadow-lg rounded overflow-hidden">
                <h3 className="text-center bg-[#0F2D52] text-white p-2 sm:p-3 text-sm sm:text-base rounded-t">
                  Completed Forms
                </h3>

                <div className="flex flex-col sm:flex-row p-2 sm:p-4">
                  <div className="flex-1 mb-2 sm:mb-0">
                    <h4 className="text-sm sm:text-lg font-semibold">
                      Child: <span className="font-normal">{localStorage.getItem('child_name')}</span>
                    </h4>
                  </div>
                  <div className="w-full sm:w-1/3">
                    <div className="sm:float-right">
                      <label htmlFor="year" className="block font-bold mb-1 sm:mb-2 text-sm sm:text-base">Year</label>
                      <select
                        name="year"
                        id="year"
                        className="form-control border border-gray-300 rounded px-2 py-1 sm:px-3 sm:py-2 w-full text-sm sm:text-base"
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

                <div className="flex justify-center m-1 sm:m-4">
                  <div className="w-full overflow-x-auto">
                    <DataTable
                      data={completedForms}
                      columns={[
                        {
                          key: 'formname',
                          title: 'Form Name',
                          className: 'min-w-[120px]'
                        },
                        {
                          key: 'completedTimestamp',
                          title: 'Time Stamp',
                          render: (value) => new Date(value).toLocaleString(),
                          className: 'min-w-[150px]'
                        },
                        {
                          key: 'action',
                          title: 'Action',
                          render: (value, row) => {
                            const urls = getFormUrls(row.formname);
                            const formName = row.formname
                            return (
                              <div className="flex gap-1 sm:gap-2">
                                <button
                                  className="text-[#0F2D52] hover:opacity-60 p-1"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (formName == 'admission_form') {
                                      console.log("Download button clicked for admission_form");
                                      // Set loading immediately and use setTimeout to handle async
                                      setIsDownloading(true);
                                      setTimeout(() => {
                                        handleAdmissionFormAPI();
                                      }, 100);
                                    }
                                    else if (formName == 'authorization_form') {
                                      console.log("Download button clicked for authorization_form");
                                      setIsDownloading(true);
                                      setTimeout(() => {
                                        handleAuthorizationFormAPI();
                                      }, 100);
                                    }
                                    else if (formName == 'parent_handbook') {
                                      console.log("Download button clicked for parent_handbook");
                                      setIsDownloading(true);
                                      setTimeout(() => {
                                        handleParentHandbookAPI();
                                      }, 100);
                                    }
                                    else if (formName == 'enrollment_form' || formName == 'enrollment_agreement') {
                                      console.log("Download button clicked for enrollment_form");
                                      setIsDownloading(true);
                                      setTimeout(() => {
                                        handleEnrollmentAgreementAPI();
                                      }, 100);
                                    }
                                    else {
                                      console.log('Unknown form name:', formName);
                                      handleDownload4(); // Default to enrollment download
                                    }
                                  }}
                                  title="Download"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16">
                                    <path fill="#0F2D52" d="M256 0a256 256 0 1 0 0 512A256 256 0 1 0 256 0zM376.9 294.6L269.8 394.5c-3.8 3.5-8.7 5.5-13.8 5.5s-10.1-2-13.8-5.5L135.1 294.6c-4.5-4.2-7.1-10.1-7.1-16.3c0-12.3 10-22.3 22.3-22.3l57.7 0 0-96c0-17.7 14.3-32 32-32l32 0c17.7 0 32 14.3 32 32l0 96 57.7 0c12.3 0 22.3 10 22.3 22.3c0 6.2-2.6 12.1-7.1 16.3z" />
                                  </svg>
                                </button>
                                <div style={{
                                  position: 'fixed',
                                  left: '-100vw',
                                  top: '0',
                                  width: '100vw',
                                  height: '100vh',
                                  overflow: 'hidden',
                                  pointerEvents: 'none',
                                  zIndex: -1000
                                }}>
                                  {/* The admission form sections */}
                                  <AdmissionSection ref={admissionRef} initialFormData={childFormData} />
                                </div>

                                <button
                                  className="text-[#0F2D52] hover:opacity-60 p-1"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('Print button clicked - immediate log');

                                    if (formName == 'admission_form') {
                                      console.log("Print button clicked for admission_form");
                                      setIsDownloading(true);
                                      setTimeout(() => {
                                        printFromS3('admission_form');
                                        setIsDownloading(false);
                                      }, 100);
                                    }
                                    else if (formName == 'authorization_form') {
                                      console.log("Print button clicked for authorization_form");
                                      setIsDownloading(true);
                                      setTimeout(() => {
                                        printFromS3('authorization_form');
                                        setIsDownloading(false);
                                      }, 100);
                                    }
                                    else if (formName == 'parent_handbook') {
                                      console.log("Print button clicked for parent_handbook");
                                      setIsDownloading(true);
                                      setTimeout(() => {
                                        printFromS3('parent_handbook');
                                        setIsDownloading(false);
                                      }, 100);
                                    }
                                    else if (formName == 'enrollment_form' || formName == 'enrollment_agreement') {
                                      console.log("Print button clicked for enrollment_form");
                                      setIsDownloading(true);
                                      setTimeout(() => {
                                        printFromS3('enrollment_agreement');
                                        setIsDownloading(false);
                                      }, 100);
                                    }
                                    else {
                                      console.log('Unknown form name:', formName);
                                      setIsDownloading(false);
                                    }
                                  }}
                                  title="Print"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16">
                                    <path fill="#0F2D52" d="M128 0C92.7 0 64 28.7 64 64v96h64V64H354.7L384 93.3V160h64V93.3c0-17-6.7-33.3-18.7-45.3L400 18.7C388 6.7 371.7 0 354.7 0H128zM384 352v32 64H128V384 368 352H384zm64 32h32c17.7 0 32-14.3 32-32V256c0-35.3-28.7-64-64-64H64c-35.3 0-64 28.7-64 64v96c0 17.7 14.3 32 32 32H64v64c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V384zM432 248a24 24 0 1 1 0 48 24 24 0 1 1 0-48z" />
                                  </svg>
                                </button>
                              </div>
                            );
                          },
                          sortable: false,
                          className: 'min-w-[80px]'
                        }
                      ]}
                      tableId="example"
                      className="w-full border-collapse border border-gray-300 text-sm sm:text-base"
                      headerClassName="bg-[#0F2D52] text-white p-2 sm:p-3"
                      cellClassName="border border-gray-300 p-1 sm:p-2 sm:p-3"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      
      {/* Loading Modal */}
      {isDownloading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            minWidth: '300px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #0F2D52',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px auto'
            }}></div>
            <h3 style={{
              margin: '0 0 10px 0',
              color: '#0F2D52',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              Processing...
            </h3>
            <p style={{
              margin: 0,
              color: '#666',
              fontSize: '14px'
            }}>
              Processing your request. Please wait...
            </p>
          </div>
        </div>
      )}

      <div style={{
        position: 'fixed',
        left: '-100vw',
        top: '0',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: -1000
      }}>
        <div ref={admissionFormRef} id="admission-content" style={{

        }}>
          <AdmissionSection ref={admissionFormRef} initialFormData={childFormData} />
        </div>


        <ParentHandbook ref={phbFormRef} initialFormData={childFormData ? (() => {
          console.log('ParentDashboard - ParentHandbook sample checkbox values:');
          console.log('welcome_goddard_agreement:', childFormData.welcome_goddard_agreement);
          console.log('finalword_agreement:', childFormData.finalword_agreement);
          return {
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
          };
        })() : null} />


        <ACHForm ref={achFormRef} initialFormData={childFormData ? {
          bank_routing: childFormData.bank_routing || '',
          bank_account: childFormData.bank_account || '',
          driver_license: childFormData.driver_license || '',
          state: childFormData.state || '',
          i: childFormData.i || '',
          parent_sign_ach: childFormData.parent_sign_ach || '',
          parent_sign_date_ach: childFormData.parent_sign_date_ach || '',
          admin_sign_ach: childFormData.admin_sign_ach || '',
          admin_sign_date_ach: childFormData.admin_sign_date_ach || ''
        } : null} />


        <EnrollmentAgreementPDF ref={enrollFormRef} initialFormData={childFormData ? (() => {
          console.log('ParentDashboard - childFormData.full_day:', childFormData.full_day);
          console.log('ParentDashboard - childFormData.half_day:', childFormData.half_day);
          const formData = {
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
          };
          console.log('ParentDashboard - transformed formData.full_day:', formData.full_day);
          console.log('ParentDashboard - transformed formData.half_day:', formData.half_day);
          return formData;
        })() : null} />
      </div>
    </div>
    </>
  );
};

export default ParentDashboard;
