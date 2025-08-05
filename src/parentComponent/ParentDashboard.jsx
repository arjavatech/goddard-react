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
        await admissionRef.current?.handleDownload2();
      }
      else {
        console.log("print funtion start")
        await admissionRef.current?.handlePrint2();
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
        await phbFormRef.current?.generatePdf();
      }
      else {
        await phbFormRef.current?.handlePrint2();
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
      else{
        await enrollFormRef.current?.generatePrint()
      }

    } catch (error) {
      console.error("Error in download:", error);

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
              console.log('PDF generated successfully, saving...');
              console.log(formName);
              console.log("----------------------------")
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

  // Handle print functionality
  // const handlePrint = async (formName, url) => {
  //   console.log('Print button clicked for:', formName, 'URL:', url);

  //   const formRef = getFormRef(formName);
  //   if (formRef) {
  //     console.log(`Processing ${formName} print from PDF component...`);
  //     // Handle PDF form print directly from component
  //     const content = formRef.current;
  //     if (!content) {
  //       console.error(`${formName} content not found for printing`);
  //       return;
  //     }

  //     console.log(`${formName} content found, opening print window...`);
  //     const printWindow = window.open('', '_blank');
  //     printWindow.document.write(`
  //       <html>
  //         <head>
  //           <title>Goddard ${formName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</title>
  //           <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" />
  //           <style>
  //           p, ol li, ul li { font-weight: 500; text-align: justify; }
  //             .form-body { border: 2px solid #0F2D52; }
  //             .header-border { border-bottom: 2px solid #0F2D52; }
  //             .title_bg { background-color: #0F2D52; color: white;  }
  //             .logo-style { display: flex; align-items: center; justify-content: center; }
  //             .custom-checkbox { display: none; }
  //           </style>
  //         </head>
  //         <body>
  //           ${content.innerHTML}
  //         </body>
  //       </html>
  //     `);
  //     printWindow.document.close();
  //     printWindow.focus();
  //     setTimeout(() => {
  //       console.log('Triggering print dialog...');
  //       printWindow.print();
  //       printWindow.close();
  //       console.log('Print completed successfully');
  //     }, 500);
  //     return;
  //   }

  //   // For other forms, use the existing HTML file approach
  //   console.log('Processing regular form print for:', formName);
  //   try {
  //     const response = await fetch(url);
  //     const text = await response.text();

  //     const printWindow = window.open('', '', 'height=1400,width=1500');
  //     printWindow.document.write('<html><head><title>Print Form</title>');
  //     printWindow.document.write('</head><body>');
  //     printWindow.document.write(text);
  //     printWindow.document.write('</body></html>');
  //     printWindow.document.close();

  //     printWindow.onload = function () {
  //       printWindow.focus();
  //       printWindow.print();
  //       printWindow.close();
  //     };
  //   } catch (error) {
  //     console.error('Error printing form:', error);
  //   }
  // };

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
                                      handleDownload1("download");
                                    }
                                    else if (formName == 'authorization_form') {
                                      handleDownload2("download");
                                    }
                                    else if (formName == 'parent_handbook') {
                                      handleDownload3("download");
                                    }
                                    else if (formName == 'enrollment_form' || formName == 'enrollment_agreement') {
                                      handleDownload4("download");
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
                                      handleDownload1("print");
                                    }
                                    else if (formName == 'authorization_form') {
                                      handleDownload2("print");
                                    }
                                    else if (formName == 'parent_handbook') {
                                      handleDownload3("print");
                                    }
                                    else if (formName == 'enrollment_form' || formName == 'enrollment_agreement') {
                                      handleDownload4("print");
                                    }
                                    else {
                                      console.log('Unknown form name:', formName);
                                      handleDownload4(); // Default to enrollment download
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
  );
};

export default ParentDashboard;
