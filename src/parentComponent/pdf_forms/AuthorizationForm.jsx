import React, { useRef, useCallback, useState, forwardRef, useImperativeHandle } from "react";
import "./index.css"; // Ensure your Tailwind CSS is correctly imported in index.css

// Use forwardRef to allow parent components (like App.jsx) to get a ref to this component
const ACHForm = forwardRef(({ initialFormData }, ref) => {
  const contentRef = useRef(); // Ref for the content to be converted to PDF
  const [loadingPdf, setLoadingPdf] = useState(false); // State to indicate if PDF is being generated (internal to ACHForm, can be removed if App.jsx handles all loading visuals)
  const [pdfError, setPdfError] = useState(null); // State to store any PDF generation errors

  // Expose the handleGeneratePdf function to the parent component via the ref
  useImperativeHandle(ref, () => ({
    handleGeneratePdf: handleGeneratePdf, // Make this function callable from the parent ref
  }));

  // Function to dynamically load external scripts (jsPDF and html2canvas)
  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve; // Resolve the promise when the script loads successfully
      script.onerror = reject; // Reject the promise if there's an error loading the script
      document.head.appendChild(script); // Append the script to the document's head
    });
  };

  // PDF generation and download logic using useCallback for memoization
  const handleGeneratePdf = useCallback(async () => {
    setLoadingPdf(true); 
    setPdfError(null);    

    const elementsToRestore = [];
    const inputStylesToRestore = [];
    const checkboxStylesToRestore = [];

    try {
      await Promise.all([
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'),
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js')
      ]);
      console.log('PDF libraries loaded successfully');

      const { jsPDF } = window.jspdf;
      const content = contentRef.current;

      if (!content) {
        console.error('Error: The content element (ref=contentRef) was not found.');
        setPdfError('Failed to capture form content for PDF. Element not found.');
        return; 
      }
      console.log('Content element found:', content);

      // --- Temporarily modify styles before PDF generation for optimal rendering ---
      const checkboxes = content.querySelectorAll('.custom-checkbox');
      checkboxes.forEach(checkbox => {
        checkboxStylesToRestore.push({ element: checkbox, originalDisplay: checkbox.style.display });
        checkbox.style.display = 'none'; 
      });

      const replaceOKLCHColors = (element) => {
        const allElements = element.querySelectorAll('*'); 
        allElements.forEach((el) => {
          const style = window.getComputedStyle(el); 
          ['color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor'].forEach((prop) => {
            if (style[prop]?.includes('oklch')) {
              elementsToRestore.push({ element: el, property: prop, originalValue: el.style[prop] }); 
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
      replaceOKLCHColors(content); 

      const inputs = content.querySelectorAll('.underline-input, .text-box, input[type="text"], input[type="date"]');
      inputs.forEach((input) => {
        inputStylesToRestore.push({
          element: input,
          originalBorderBottom: input.style.borderBottom,
          originalBorderColor: input.style.borderColor,
          originalMinHeight: input.style.minHeight,
          originalBorderWidth: input.style.borderWidth,
          originalPadding: input.style.padding
        });
        input.style.borderBottom = '3px solid #000'; 
        input.style.borderColor = '#000';
        input.style.minHeight = '25px'; 
        input.style.borderWidth = '0 0 3px 0'; 
        input.style.padding = '2px 0'; 
      });

      const textElements = content.querySelectorAll('p, h3, h4, h5, li, span, b, label');
      textElements.forEach(el => {
        const computedFontSize = window.getComputedStyle(el).fontSize; 
        elementsToRestore.push({ element: el, property: 'fontSize', originalValue: el.style.fontSize });
        el.style.fontSize = computedFontSize; 
      });
      const headingElements = content.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headingElements.forEach(el => {
        const computedFontSize = window.getComputedStyle(el).fontSize;
        elementsToRestore.push({ element: el, property: 'fontSize', originalValue: el.style.fontSize });
        el.style.fontSize = computedFontSize;
      });

      // --- Important adjustment for html2canvas height: ---
      // Get the bounding rect to find the exact height of the content.
      const contentRect = content.getBoundingClientRect();
      const actualContentHeight = contentRect.height; // Use the actual rendered height

      const canvas = await html2canvas(content, {
        scale: 2, 
        useCORS: true, 
        logging: false, 
        height: actualContentHeight, // Set height to actual content height
        width: content.scrollWidth,     
        allowTaint: true, 
        backgroundColor: '#ffffff', 
        removeContainer: false, 
        foreignObjectRendering: false 
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.9); 

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth(); 
      const pdfHeight = pdf.internal.pageSize.getHeight(); 
      const margins = 10; 
      const borderWidth = 0.5; 

      const imgWidth = pdfWidth - (margins * 2); 
      // Calculate imgHeight based on the actual captured content's aspect ratio
      const imgHeight = (canvas.height * imgWidth) / canvas.width; 
      
      // The effective page height for content within margins
      const contentPageHeight = pdfHeight - (margins * 2); 

      let currentY = 0; 
      let pageIndex = 0; 

      while (currentY < imgHeight) {
        if (pageIndex > 0) {
          pdf.addPage(); 
        }

        const remainingHeight = imgHeight - currentY; 
        const heightToAdd = Math.min(contentPageHeight, remainingHeight); 

        const pageCanvas = document.createElement('canvas');
        const pageCtx = pageCanvas.getContext('2d');
        pageCanvas.width = canvas.width;
        pageCanvas.height = (heightToAdd * canvas.width) / imgWidth; 

        pageCtx.drawImage(
          canvas,
          0, (currentY * canvas.width) / imgWidth, 
          canvas.width, (heightToAdd * canvas.width) / imgWidth, 
          0, 0, 
          canvas.width, (heightToAdd * canvas.width) / imgWidth 
        );

        const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.9); 
        pdf.addImage(pageImgData, 'JPEG', margins, margins, imgWidth, heightToAdd); 

        // --- Border drawing logic adjustment ---
        pdf.setDrawColor(15, 45, 82); 
        pdf.setLineWidth(borderWidth); 

        // Draw border only up to the actual height of content on THIS page
        const currentPageContentBottom = margins + heightToAdd;
        
        pdf.line(margins, margins, pdfWidth - margins, margins); // Top border
        pdf.line(pdfWidth - margins, margins, pdfWidth - margins, currentPageContentBottom); // Right border
        pdf.line(margins, margins, margins, currentPageContentBottom); // Left border
        
        // Only draw the bottom border if it's the last page or the content exactly fills the page
        if (currentY + heightToAdd >= imgHeight - 1 || heightToAdd < contentPageHeight) { // -1 to account for floating point inaccuracies
            pdf.line(margins, currentPageContentBottom, pdfWidth - margins, currentPageContentBottom); // Bottom border
        }


        currentY += heightToAdd; 
        pageIndex++; 
      }

      pdf.save('AuthorizationForm.pdf');

    } catch (error) {
      console.error('Error generating or downloading PDF:', error);
      setPdfError('Failed to generate PDF. Please try again.'); 
    } finally {
      // --- Restore original styles to the DOM elements ---
      checkboxes.forEach(checkbox => {
        checkbox.style.display = checkboxStylesToRestore.find(item => item.element === checkbox)?.originalDisplay || '';
      });
      inputStylesToRestore.forEach(item => {
        item.element.style.borderBottom = item.originalBorderBottom || '';
        item.element.style.borderColor = item.originalBorderColor || '';
        item.element.style.minHeight = item.originalMinHeight || '';
        item.element.style.borderWidth = item.originalBorderWidth || '';
        item.element.style.padding = item.originalPadding || '';
      });
      elementsToRestore.forEach(item => {
        item.element.style[item.property] = item.originalValue || '';
      });

      setLoadingPdf(false); 
    }
  }, []); 

  return (
    <div className="min-h-screen my-5 sm:my-10 px-2 sm:px-4">
      {pdfError && <p style={{ color: 'red', marginTop: '10px' }}>{pdfError}</p>}

      {/* The main content div that will be captured for PDF generation */}
      <div
        id="enrollment-content" 
        ref={contentRef}
        className="bg-white border-2 border-[#0f2d52] max-w-full lg:max-w-6xl mx-auto text-[#0f2d52] text-xs sm:text-sm md:text-[15px] text-black overflow-hidden"
      >
        {/* Top Header Section */}
        <div className="w-full border-b-2 border-[#0f2d52]">
          <div className="flex flex-col sm:flex-row w-full h-auto sm:h-[180px]">
            {/* Left Side: Logo */}
            <div className="w-full sm:w-[50%] flex items-center justify-center bg-white border-b-2 sm:border-b-0 sm:border-r-2 border-[#0f2d52] py-3 sm:py-0 px-2 sm:px-4">
              <img
                src="image/gs_logo_lynnwood.png"
                alt="Goddard Logo"
                className="h-16 sm:h-24 md:h-28 object-contain"
              />
            </div>

            {/* Right Side: Title */}
            <div className="w-full sm:w-[50%] bg-[#0f2d52] flex items-center justify-center py-3 sm:py-0">
              <span className="text-white text-xl sm:text-xl md:text-2xl font-bold tracking-wide text-center">
                Authorization ACH
              </span>
            </div>
          </div>
        </div>

        <div className="px-3 sm:px-4 md:px-6">
          {/* Form Fields Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 px-0 py-6 sm:py-8 md:py-10 lg:py-15">
            <div>
              <label className="font-bold block mb-1 text-xs sm:text-sm md:text-[15px]">Bank Routing</label>
              <input id="bank_routing" type="text" className="underline-input w-full text-sm sm:text-base md:text-[15px]" defaultValue={initialFormData?.bank_routing || ''} />
            </div>
            <div>
              <label className="font-bold block mb-1 text-xs sm:text-sm md:text-[15px]">Bank Account</label>
              <input id="bank_account" type="text" className="underline-input w-full text-sm sm:text-base md:text-[15px]" defaultValue={initialFormData?.bank_account || ''} />
            </div>
            <div>
              <label className="font-bold block mb-1 text-xs sm:text-sm md:text-[15px]">Driver’s License</label>
              <input id="driver_license" type="text" className="underline-input w-full text-sm sm:text-base md:text-[15px]" defaultValue={initialFormData?.driver_license || ''} />
            </div>
            <div>
              <label className="font-bold block mb-1 text-xs sm:text-sm md:text-[15px]">State</label>
              <input id="state" type="text" className="underline-input w-full text-sm sm:text-base md:text-[15px]" defaultValue={initialFormData?.state || ''} />
            </div>
          </div>

          {/* Statement of Authorization Section */}
          <div className="px-0 pb-3 sm:pb-4">
            <div className="text-center font-bold text-base sm:text-lg md:text-xl mb-2">
              Statement of authorization
            </div>
            <p className="font-semibold mb-2 sm:mb-3 leading-relaxed text-justify text-xs sm:text-sm md:text-[15px]">
              I{" "}
              <input
                id="i" 
                type="text"
                className="underline-input inline-block w-24 sm:w-40 md:w-60 align-baseline text-xs sm:text-sm md:text-[15px]"
                defaultValue={initialFormData?.i || ''}
              />{" "}
              hereby authorize (Alphabetz Corp, dba The Goddard School) to charge
              my above referenced bank account for the invoiced amount once each
              month on the 1st day of the month until changed by me in writing in
              the future. This will constitute the paid tuition for my child(ren)
              during the period designated. For wait-listed/newly enrolled
              families this is a one-time charge and not a recurring one until
              they start the school.
            </p>
            <p className="font-bold leading-snug text-justify text-xs sm:text-sm md:text-[15px]">
              Please provide us 10 days advance notice should you wish to put a stop
              to this authorization. An automatic electronic authorization of the
              monthly transaction will take place and an email-generated receipt
              will be automatically sent to the email address provided to us above.
              A copy of this document will be scanned and saved in an electronic
              file, the original will be shredded for your protection.
            </p>
          </div>

          {/* Parent Agreement Section */}
          <div className="text-center font-semibold text-lg sm:text-xl md:text-2xl mb-2 sm:mb-3 mt-3 sm:mt-4">
            Parent Agreement
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 px-0 pb-5 sm:pb-6 md:pb-8">
            <div>
              <label className="font-bold block mb-1 text-xs sm:text-sm md:text-[15px]">Parent Signature</label>
              <input id="parent_sign_ach" type="text" className="underline-input w-full text-sm sm:text-base md:text-[15px]" defaultValue={initialFormData?.parent_sign_ach || ''} />
            </div>
            <div>
              <label className="font-bold block mb-1 text-xs sm:text-sm md:text-[15px]">Date</label>
              <input id="parent_sign_date_ach" type="date" className="underline-input w-full text-sm sm:text-base md:text-[15px]" defaultValue={initialFormData?.parent_sign_date_ach || ''} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ACHForm;