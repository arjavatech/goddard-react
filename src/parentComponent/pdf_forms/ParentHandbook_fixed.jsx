import React, { useState, useCallback, useImperativeHandle, forwardRef, useEffect } from 'react';
import logo from "/image/gs_logo_branch.png";
import '../../css/all_forms.css'

const ParentHandbook = forwardRef(({ initialFormData }, ref) => {
    console.log('ParentHandbook - initialFormData:', initialFormData);

    // Helper function to determine if checkbox should be checked
    const isChecked = (value) => {
        const result = value === 'on' || value === true || value === 'true';
        return result;
    };

    // State for all checkboxes
    const [checkboxStates, setCheckboxStates] = useState({
        welcome_goddard_agreement: false,
        mission_statement_agreement: false,
        general_information_agreement: false,
        medical_care_provider_agreement: false,
        parent_access_agreement: false,
        release_of_children_agreement: false,
        registration_fees_agreement: false,
        outside_engagements_agreement: false,
        health_policies_agreement: false,
        medication_procedures_agreement: false,
        bring_to_school_agreement: false,
        rest_time_agreement: false,
        training_philosophy_agreement: false,
        affiliation_policy_agreement: false,
        security_issue_agreement: false,
        expulsion_policy_agreement: false,
        addressing_individual_child_agreement: false,
        finalword_agreement: false
    });

    // Set initial checkbox states when initialFormData changes
    useEffect(() => {
        if (initialFormData) {
            const newStates = {};
            Object.keys(checkboxStates).forEach(key => {
                newStates[key] = isChecked(initialFormData[key]);
            });
            console.log('ParentHandbook - Setting checkbox states:', newStates);
            setCheckboxStates(newStates);
        }
    }, [initialFormData]);

    const loadScript = (src) => {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    };


    // Handle printing functionality
    const handlePrint = () => {
        const content = document.getElementById("parent-handbook-content");;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
      <html>
        <head>
          <title>Goddard Parent Handbook</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" />
          <style>
          p, ol li, ul li { font-weight: 500; text-align: justify; }
            .form-body { border: 2px solid #0F2D52; }
            .header-border { border-bottom: 2px solid #0F2D52; }
            .title_bg { background-color: #0F2D52; color: white;  }
            .logo-style { width: 100%; height: auto; max-width: 100%; object-fit: contain; }
            .flex { display: flex; }
            .items-center { align-items: center; }
            .justify-center { justify-content: center; }
            .w-\\[50\\%\\] { width: 50% !important; }
            .h-\\[180px\\] { height: 180px !important; }
            .bg-white { background-color: white !important; }
            .bg-\\[\\#0f2d52\\] { background-color: #0f2d52 !important; }
            .border-r-2 { border-right: 2px solid #0f2d52 !important; }
            .border-\\[\\#0f2d52\\] { border-color: #0f2d52 !important; }
            .px-4 { padding-left: 0.5rem !important; padding-right: 0.5rem !important; }
            .m-4 { margin: 1rem !important; }
            .text-white { color: white !important; }
            .max-h-\\[130px\\] { max-height: 130px !important; }
            .max-w-full { max-width: 100% !important; }
            .object-contain { object-fit: contain !important; }
            .logo-style { max-width: 85% !important; height: auto !important; object-fit: contain !important; display: block !important; margin: 0 auto !important; }
            .custom-checkbox { display: none; }
            @media print {
              .m-5 { margin: 0.5rem !important; }
              .card { margin-bottom: 0 !important; }
              .form-body { margin-bottom: 0 !important; }
              .m-5:not(:first-child) { page-break-before: always !important; }
            }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 750);
    };

    const handleGeneratePdf = useCallback(async () => {
        const elementsToRestore = [];
        const inputStylesToRestore = [];
        const checkboxStylesToRestore = [];
        let pdfStyle = null;
        let contentElement = null;

        try {
            await Promise.all([
                loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'),
                loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js')
            ]);
            console.log('PDF libraries loaded successfully');

            const { jsPDF } = window.jspdf;
            contentElement = document.getElementById("parent-handbook-content");

            if (!contentElement) {
                console.error('Error: The element with ID "parent-handbook-content" was not found.');
                return;
            }

            // Apply exact same CSS styles as print function
            pdfStyle = document.createElement('style');
            pdfStyle.innerHTML = `
                p, ol li, ul li { font-weight: 500; text-align: justify; }
                .form-body { border: 2px solid #0F2D52; }
                .header-border { border-bottom: 2px solid #0F2D52; }
                .title_bg { background-color: #0F2D52; color: white; }
                .logo-style { max-width: 85% !important; height: auto !important; object-fit: contain !important; display: block !important; margin: 0 auto !important; }
                .flex { display: flex; }
                .items-center { align-items: center; }
                .justify-center { justify-content: center; }
                .w-\\\\[50\\\\%\\\\] { width: 50% !important; }
                .h-\\\\[180px\\\\] { height: 180px !important; }
                .bg-white { background-color: white !important; }
                .bg-\\\\[\\\\#0f2d52\\\\] { background-color: #0f2d52 !important; }
                .border-r-2 { border-right: 2px solid #0f2d52 !important; }
                .border-\\\\[\\\\#0f2d52\\\\] { border-color: #0f2d52 !important; }
                .px-4 { padding-left: 0.5rem !important; padding-right: 0.5rem !important; }
                .m-4 { margin: 1rem !important; }
                .text-white { color: white !important; }
                .max-h-\\\\[130px\\\\] { max-height: 130px !important; }
                .max-w-full { max-width: 100% !important; }
                .object-contain { object-fit: contain !important; }
                .custom-checkbox { display: none; }
                .m-5:not(:first-child) { page-break-before: always !important; }
                .m-5 { margin: 0.5rem !important; }
                .card { margin-bottom: 0 !important; }
                .form-body { margin-bottom: 0 !important; }
            `;
            document.head.appendChild(pdfStyle);

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
            replaceOKLCHColors(contentElement);

            const inputs = contentElement.querySelectorAll('.underline-input, .text-box, input[type="text"], input[type="date"]');
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
                input.style.borderColor = ' #000';
                input.style.minHeight = '25px';
                input.style.borderWidth = '0 0 3px 0';
                input.style.padding = '2px 0';
            });

            const textElements = contentElement.querySelectorAll('p, h3, h4, h5, li, span, b, label');
            textElements.forEach(el => {
                const computedFontSize = window.getComputedStyle(el).fontSize;
                elementsToRestore.push({ element: el, property: 'fontSize', originalValue: el.style.fontSize });
                el.style.fontSize = computedFontSize;
            });
            const headingElements = contentElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
            headingElements.forEach(el => {
                const computedFontSize = window.getComputedStyle(el).fontSize;
                elementsToRestore.push({ element: el, property: 'fontSize', originalValue: el.style.fontSize });
                el.style.fontSize = computedFontSize;
            });

            const canvas = await html2canvas(contentElement, {
                scale: 2,
                useCORS: true,
                logging: false,
                height: contentElement.scrollHeight,
                width: contentElement.scrollWidth,
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
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const pageHeight = pdfHeight - (margins * 2);

            let currentY = 0;
            let pageIndex = 0;

            while (currentY < imgHeight) {
                if (pageIndex > 0) {
                    pdf.addPage();
                }

                const remainingHeight = imgHeight - currentY;
                const heightToAdd = Math.min(pageHeight, remainingHeight);

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

                pdf.setDrawColor(15, 45, 82);
                pdf.setLineWidth(borderWidth);
                pdf.line(margins, margins, pdfWidth - margins, margins);
                pdf.line(margins, pdfHeight - margins, pdfWidth - margins, pdfHeight - margins);
                pdf.line(pdfWidth - margins, margins, pdfWidth - margins, pdfHeight - margins);

                currentY += heightToAdd;
                pageIndex++;
            }

            pdf.save('ParentHandbook.pdf');

        } catch (error) {
            console.error('Error generating or downloading PDF:', error);
        } finally {
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

            if (pdfStyle && pdfStyle.parentNode) {
                pdfStyle.parentNode.removeChild(pdfStyle);
            }
        }
    }, []);

    useImperativeHandle(ref, () => ({
        generatePdf: handleGeneratePdf,
        handlePrint2: handlePrint,
    }));

    return (
        <div id="parent-handbook-content">
            <div className="m-5">
                <div className="card">
                    <div className="form-body">
                        <div className="bg-white  text-[#0f2d52] text-black text-[16px]">
                            {/* Page 1 */}
                            <div className="mb-0 ">
                                <div className=" border-[#0F2D52]">
                                    {/* Top Header Section */}
                                    <div className="w-full border-b-2 border-[#0f2d52]">
                                        <div className="flex w-full h-[180px]">
                                            {/* Left Side: Logo */}
                                            <div className="w-[50%]  flex items-center justify-center bg-white border-r-2 border-[#0f2d52] px-4">
                                                <img
                                                    src={logo}
                                                    alt="Goddard Logo"
                                                    className="max-h-[130px] max-w-full object-contain logo-style"
                                                />
                                            </div>
                                            {/* Right Side: Title */}
                                            <div className="w-[50%] bg-[#0f2d52] flex items-center justify-center">
                                                <h3 className="m-4 text-white">Parent Handbook</h3>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4">
                            <form id="formContent">
                                {/* Goddard Parent Handbook */}
                                <div className="row m-1 mb-4">
                                    <h5 className="text-center mb-4">
                                        <b>Welcome to The Goddard School®</b>
                                    </h5>
                                    <p>
                                        The early years are a very special time in your child's development. Great changes occur
                                        in this relatively short period of time as children learn to communicate, increase their
                                        intellectual awareness, and make great physical strides. In recognition of the crucial
                                        importance of
                                        these years, The Goddard School® has created a program tailored to meet the needs of
                                        your child at each stage of development.
                                    </p>
                                    <p>
                                        The Goddard School® philosophy is to provide an atmosphere suited to the development of
                                        selfesteem, confidence, and love of learning. By combining the best possible equipment
                                        and
                                        professionally educated staff in an environment specifically designed for young
                                        children, we offer
                                        an outstanding program.
                                    </p>
                                    <p>
                                        The educational goal of The Goddard School® is to utilize fun and creativity to foster a
                                        love
                                        of learning. We challenge our students by promoting inquiry and discovery through
                                        exploring
                                        the world around them. This instills a sense of confidence in their ability to master
                                        new
                                        situations and tasks through reasoning. Your child will be exposed to a variety of
                                        teaching
                                        methods so that he/she will be able to meet success in any elementary school system.
                                    </p>
                                    <p>You, the parent, are very important to The Goddard staff because you know your child
                                        best. We
                                        encourage you to contact the school about any questions or concerns you might have.
                                        Please
                                        review the daily reports highlighting your child's activities. If there is anything we
                                        can do to
                                        make your child's experiences more meaningful, please let us know. </p>
                                    <p>We are looking forward to working with you and your child and sharing in his/her growth
                                        and
                                        development.</p>
                                    <p>Many thanks for choosing The Goddard School® located in Redmond, WA.</p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <div className="m-5">
                <div className="card">
                    <div className="form-body">
                        <div className="bg-white  text-[#0f2d52] text-black text-[16px]">
                            <div className="mb-0 ">
                                <div className=" border-[#0F2D52]">
                                    <div className="w-full border-b-2 border-[#0f2d52]">
                                        <div className="flex w-full h-[180px]">
                                            <div className="w-[50%]  flex items-center justify-center bg-white border-r-2 
                          border-[#0f2d52] px-4">
                                                <img
                                                    src={logo}
                                                    alt="Goddard Logo"
                                                    className="max-h-[130px] max-w-full object-contain logo-style"
                                                />
                                            </div>
                                            <div className="w-[50%] bg-[#0f2d52] flex items-center justify-center">
                                                <h3 className="m-4 text-white">Parent Handbook</h3>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4">
                            <div className="row m-1 mb-3">
                                <p>Sincerely,</p>
                                <p>Maanu Muthu, Onsite Owner</p>
                                <i>*The term "parent" is used throughout to represent the primary
                                    individual(s) responsible for the child's care.</i>
                            </div>
                            <div className="row m-1 mb-3">
                                <div className="form-group d-flex align-items-center gap-1">
                                    <input
                                        type="checkbox"
                                        className="input-checkbox custom-checkbox"
                                        id="welcome_goddard_agreement"
                                        name="welcome_goddard_agreement"
                                        checked={checkboxStates.welcome_goddard_agreement}
                                        onChange={(e) => setCheckboxStates(prev => ({ ...prev, welcome_goddard_agreement: e.target.checked }))}
                                    />
                                    <label className="form-check-label" htmlFor="welcome_goddard_agreement">
                                        <span><b>I agree all the above information.</b></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ParentHandbook;