import React, { useState, useCallback, useImperativeHandle, forwardRef, useEffect } from 'react';
import logo from "/image/gs_logo_branch.png";

const EnrollmentAgreementForm = forwardRef(({ initialFormData }, ref) => {

    console.log('EnrollmentAgreement - initialFormData:', initialFormData);
    console.log('full_day value:', initialFormData?.full_day);
    console.log('half_day value:', initialFormData?.half_day);
    console.log('full_day type:', typeof initialFormData?.full_day);
    console.log('half_day type:', typeof initialFormData?.half_day);
    console.log('full_day === "on":', initialFormData?.full_day === 'on');
    console.log('half_day === "on":', initialFormData?.half_day === 'on');

    // Helper function to determine if checkbox should be checked
    const isChecked = (value) => {
        const result = value === 'on' || value === true || value === 'true';
        console.log(`isChecked(${value}) = ${result}`);
        return result;
    };

    // State for checkboxes
    const [fullDayChecked, setFullDayChecked] = useState(false);
    const [halfDayChecked, setHalfDayChecked] = useState(false);

    // Set initial checkbox states when initialFormData changes
    useEffect(() => {
        if (initialFormData) {
            const fullDayValue = isChecked(initialFormData.full_day);
            const halfDayValue = isChecked(initialFormData.half_day);

            console.log('Setting fullDayChecked to:', fullDayValue);
            console.log('Setting halfDayChecked to:', halfDayValue);

            setFullDayChecked(fullDayValue);
            setHalfDayChecked(halfDayValue);
        }
    }, [initialFormData]);


    const holidayData2025 = [
        { date: 'January 1, 2025', reason: 'New Year’s Day' },
        { date: 'February 17, 2025', reason: 'Faculty Development Day' },
        { date: 'March 7, 2025', reason: 'Parent-Teacher Conferences' },
        { date: 'April 18, 2025', reason: 'Spring Break' },
        { date: 'May 26, 2025', reason: 'Memorial Day' },
        { date: 'June 20, 2025', reason: 'Faculty Development Day' },
        { date: 'July 4, 2025', reason: 'Independence Day' },
        { date: 'August 28 & 29, 2025', reason: '2-Day Faculty Development' },
        { date: 'September 1, 2025', reason: 'Labor Day' },
        { date: 'November 11, 2025', reason: 'Parent-Teacher Conferences' },
        { date: 'November 26, 2025', reason: 'Closing @12:30pm' },
        { date: 'November 27 & 28, 2025', reason: 'Thanksgiving Break' },
        { date: 'December 24 – 31, 2025', reason: 'Closed for Holidays' },
    ];

    const holidayData2026 = [
        { date: 'January 1, 2026', reason: "New Year's Day Observance" },
        { date: 'January 2, 2026', reason: 'Faculty Development Day' },
        { date: 'March 6, 2026', reason: 'Parent-Teacher Conferences' },
        { date: 'April 17, 2026', reason: 'Spring Break' },
        { date: 'May 25, 2026', reason: 'Memorial Day' },
        { date: 'June 19, 2026', reason: 'Faculty Development Day' },
        { date: 'July 3, 2026', reason: 'Independence Day' },
        { date: 'August 28 & 31, 2026', reason: '2-Day Faculty Development' },
        { date: 'September 7, 2026', reason: 'Labor Day' },
        { date: 'November 11, 2026', reason: 'Parent-Teacher Conferences' },
        { date: 'November 25, 2026', reason: 'Closing @12:30pm' },
        { date: 'November 26 & 27, 2026', reason: 'Thanksgiving Break' },
        { date: 'December 24 – 31, 2026', reason: 'Closed for Holidays' },
    ];

    const loadScript = (src) => {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    };


    const handlePrint = useCallback(() => {
        try {
            const content = document.getElementById("enrollment-agreement-content");

            if (!content) {
                console.error('Error: The element with ID "enrollment-agreement-content" was not found.');
                return;
            }

            // Clone the content to avoid modifying the original
            const printContent = content.cloneNode(true);

            // Apply inline styles for better print rendering (optional)
            const style = `
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    color: #000;
                }
                .underline-input, .text-box, input[type="text"], input[type="date"] {
                    border-bottom: 2px solid #000 !important;
                    padding: 2px 0;
                }
                @page {
                    margin: 20mm;
                }
            </style>
        `;

            // Create a new print window
            const printWindow = window.open('', '', 'width=900,height=650');

            printWindow.document.open();
            printWindow.document.write(`
            <html>
                <head>
                    <title>Print Enrollment Agreement</title>
                    ${style}
                </head>
                <body>
                    ${printContent.outerHTML}
                </body>
            </html>
        `);
            printWindow.document.close();

            // Wait for the content to load and then print
            printWindow.onload = () => {
                printWindow.focus();
                printWindow.print();
                printWindow.close();
            };

        } catch (error) {
            console.error('Error during print process:', error);
        }
    }, []);


    const handleGeneratePdf = useCallback(async () => {

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
            const content = document.getElementById("enrollment-agreement-content");

            if (!content) {
                console.error('Error: The element with ID "enrollment-agreement-content" was not found.');
                // setPdfError('Failed to capture form content for PDF. Element not found.');
                return;
            }
            console.log('Content element found:', content);





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



            const canvas = await html2canvas(content, {
                scale: 2,
                useCORS: true,
                logging: false,
                height: content.scrollHeight,
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
            const margins = 10; // பக்க ஓரங்கள் (mm இல்)
            const borderWidth = 0.5; // Border width in mm


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


            pdf.save('EnrollmentAgreement.pdf');



        } catch (error) {
            console.error('Error generating or downloading PDF:', error);
            // setPdfError('Failed to generate PDF. Please try again.');
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

            // setLoadingPdf(false);
        }
    }, []);

    useImperativeHandle(ref, () => ({
        generatePdf: handleGeneratePdf,
        generatePint: handlePrint
    }));

    return (
        <div className="bg-white mx-auto text-[#0f2d52] text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[18px] p-4 sm:p-6 md:p-8 lg:p-10 text-black">

            <div id="enrollment-agreement-content">
                <div className="mb-8 xl:mb-[12%]">
                    <div className="border-2 border-[#0F2D52]">
                        <div className="w-full border-b-2 border-[#0f2d52]">
                            <div className="flex flex-col sm:flex-row w-full h-auto sm:h-[180px]">
                                <div className="w-full sm:w-[50%] flex items-center justify-center bg-white border-b-2 sm:border-b-0 sm:border-r-2 border-[#0f2d52] p-4 sm:p-4">
                                    <img
                                        src={logo}
                                        alt="Goddard Logo"
                                        className="h-20 sm:h-24 md:h-28 object-contain"
                                    />
                                </div>

                                {/* Right Side: Title */}
                                <div className="w-full sm:w-[50%] bg-[#0f2d52] flex items-center justify-center p-4">
                                    <span className="text-white text-xl sm:text-xl md:text-2xl font-bold tracking-wide text-center">
                                        Enrollment Agreement
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-2 sm:p-4 md:p-6">
                            <form id="formContent">
                                <div className="mx-1 mb-4">
                                    <div className="container mx-auto p-0 text-sm sm:text-base">
                                        <ol className="list-decimal pt-5 sm:pt-10">
                                            <li style={{ paddingLeft: "25px" }} className="pb-2 sm:pb-4 pt-2 sm:pt-4 font-medium text-justify">
                                                This Enrollment Agreement (the “Agreement”), effective (today’s date)
                                                <input
                                                    id="point_one_field_one"
                                                    name="point_one_field_one"
                                                    type="text"
                                                    className="form-control text-box border-b-2 max-w-[150px] border-[#0F2D52] rounded-none w-full md:w-[30%] inline-block focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-sm sm:text-base"
                                                    defaultValue={initialFormData?.point_one_field_one || ''}
                                                />{' '}
                                                is between Cool Kidz LLC dba The Goddard School, an independent franchisee operating The Goddard School® located at 4200 228th Ave NE, Redmond, WA pursuant to a license from Goddard Systems, Inc., and
                                                <input
                                                    id="point_one_field_three"
                                                    name="point_one_field_three"
                                                    type="text"
                                                    className="form-control text-box border-b-2 border-[#0F2D52] rounded-none w-full md:w-[30%] inline-block focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-sm sm:text-base"
                                                    defaultValue={initialFormData?.point_one_field_three || ''}
                                                />{' '}
                                                (“Parents”).
                                            </li>
                                        </ol>
                                        <br className="my-2" /><br className="my-2" /><br className="my-2" />
                                        <span className="block mb-6 sm:mb-[50px] font-roboto text-right mr-2.5" id="initial">
                                            <b className="text-sm sm:text-[15px] md:text-base">Initial here &nbsp;</b>
                                            <input
                                                id="point_two_initial_here"
                                                name="point_two_initial_here"
                                                type="text"
                                                className="form-control text-box border-b-2 border-[#0F2D52] relative top-[10px] rounded-none w-48 sm:w-54 md:w-[30%] inline-block focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-sm sm:text-base"
                                                placeholder="."
                                                defaultValue={initialFormData?.point_two_initial_here || ''}
                                            />
                                        </span>

                                        <ol className="list-decimal pl-5" start="2">
                                            <li style={{ paddingLeft: "25px" }} className="pb-2 sm:pb-4 pt-2 sm:pt-4 font-medium text-justify">
                                                The School’s non-refundable registration fee of $300 shall be paid annually in March and at the time of initial application. The fee is $300 for each child.
                                            </li>
                                        </ol>
                                        <br className="my-2" /><br className="my-2" /><br className="my-2" />
                                        <span className="block mb-6 sm:mb-[50px] font-roboto text-right mr-2.5" id="initial">
                                            <b className="text-sm sm:text-[15px] md:text-base">Initial here &nbsp;</b>
                                            <input
                                                id="point_three_initial_here"
                                                name="point_three_initial_here"
                                                type="text"
                                                className="form-control text-box border-b-2 border-[#0F2D52] relative top-[10px] rounded-none w-48 sm:w-54 md:w-[30%] inline-block focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-sm sm:text-base"
                                                placeholder="."
                                                defaultValue={initialFormData?.point_three_initial_here || ''}
                                            />
                                        </span>
                                        <ol className="list-decimal pl-5" start="3">
                                            <li style={{ paddingLeft: "25px" }} className="pb-2 sm:pb-4 pt-2 sm:pt-4 font-medium text-justify">
                                                New Family Enrollment - One full month tuition and non-refundable registration fee are due at time of enrollment, along with this signed agreement. If the deposit is not paid, a place for your child cannot be guaranteed. The first month’s tuition is 100% refundable 90 days before the Goddard approved start date and non-refundable thereafter.
                                            </li>
                                        </ol>
                                        <br className="my-2" /><br className="my-2" /><br className="my-2" />
                                        <span className="block mb-6 sm:mb-[50px] font-roboto text-right mr-2.5" id="initial">
                                            <b className="text-sm sm:text-[15px] md:text-base">Initial here &nbsp;</b>
                                            <input
                                                id="point_four_initial_here"
                                                name="point_four_initial_here"
                                                type="text"
                                                className="form-control text-box border-b-2 border-[#0F2D52] relative top-[10px] rounded-none w-48 sm:w-54 md:w-[30%] inline-block focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-sm sm:text-base"
                                                placeholder="."
                                                defaultValue={initialFormData?.point_four_initial_here || ''}
                                            />
                                        </span>
                                        <ol className="list-decimal pl-5" start="4">
                                            <li style={{ paddingLeft: "25px" }} className="pb-2 sm:pb-4 pt-2 sm:pt-4 font-medium text-justify">
                                                Wait-listed Families - For being on our waitlist only the Registration fee is necessary, and it is fully refundable if we are unable to provide you with classroom placement for your desired start date.
                                            </li>
                                        </ol>
                                        <br className="my-2" /><br className="my-2" /><br className="my-2" />
                                        <span className="block mb-6 sm:mb-[50px] font-roboto text-right mr-2.5" id="initial">
                                            <b className="text-sm sm:text-[15px] md:text-base">Initial here &nbsp;</b>
                                            <input
                                                id="point_five_initial_here"
                                                name="point_five_initial_here"
                                                type="text"
                                                className="form-control text-box border-b-2 border-[#0F2D52] relative top-[10px] rounded-none w-48 sm:w-54 md:w-[30%] inline-block focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-sm sm:text-base"
                                                placeholder="."
                                                defaultValue={initialFormData?.point_five_initial_here || ''}
                                            />
                                        </span>
                                        <ol className="list-decimal pl-5" start="5">
                                            <li style={{ paddingLeft: "25px" }} className="pb-2 sm:pb-4 pt-2 sm:pt-4 font-medium text-justify">
                                                Monthly tuition is due on or before the 1<sup>st</sup> of each month. A $50 late fee shall be charged for any monthly tuition payments received after the 1st of the month. A fee of $75 will be charged for checks returned by the school's bank. If monthly tuition fees (including any applicable late fees) are not received at the School by the 15th of the month, the child will not be readmitted to the program. If the School is compelled to take legal action for tuition payments, Parents agree to pay the School’s reasonable attorneys’ fees and costs incurred.
                                            </li>
                                        </ol>
                                        <br className="my-2" /><br className="my-2" /><br className="my-2" />
                                        <span className="block mb-6 sm:mb-[50px] font-roboto text-right mr-2.5" id="initial">
                                            <b className="text-sm sm:text-[15px] md:text-base">Initial here &nbsp;</b>
                                            <input
                                                id="point_six_initial_here"
                                                name="point_six_initial_here"
                                                type="text"
                                                className="form-control text-box border-b-2 border-[#0F2D52] relative top-[10px] rounded-none w-48 sm:w-54 md:w-[30%] inline-block focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-sm sm:text-base"
                                                placeholder="."
                                                defaultValue={initialFormData?.point_six_initial_here || ''}
                                            />
                                        </span>
                                        <ol className="list-decimal pl-5" start="6">
                                            <li style={{ paddingLeft: "25px" }} className="pb-2 sm:pb-4 pt-2 sm:pt-4 font-medium text-justify">
                                                At the time of registration, tuition is quoted for the current rate of the classroom. Tuition is subject to change at the discretion of the school. You will receive notification of any proposed change.
                                            </li>
                                        </ol>
                                        <br className="my-2" /><br className="my-2" /><br className="my-2" />
                                        <span className="block mb-6 sm:mb-[50px] font-roboto text-right mr-2.5" id="initial">
                                            <b className="text-sm sm:text-[15px] md:text-base">Initial here &nbsp;</b>
                                            <input
                                                id="point_seven_initial_here"
                                                name="point_seven_initial_here"
                                                type="text"
                                                className="form-control text-box border-b-2 border-[#0F2D52] relative top-[10px] rounded-none w-48 sm:w-54 md:w-[30%] inline-block focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-sm sm:text-base"
                                                placeholder="."
                                                defaultValue={initialFormData?.point_seven_initial_here || ''}
                                            />
                                        </span>
                                        <ol className="list-decimal pl-5" start="7">
                                            <li style={{ paddingLeft: "25px" }} className="pb-2 sm:pb-4 pt-2 sm:pt-4 font-medium text-justify">
                                                Monthly tuition fees are non-refundable regardless of holidays, illness, vacation, inclement weather days or School closures resulting from causes beyond the reasonable control of the School or its management including, but not limited to pandemics, government order, public health crisis, fire, floods, civil commotions, strikes, lockouts or other labor disturbances, “Acts of God” or acts, omissions, or delays in acting by any governmental authority. The School and its management will use reasonable efforts to avoid unscheduled closures and will resume operation as soon as feasible. The School will make reasonable efforts to open in inclement weather; however, the School may choose to close at the discretion of the School’s owner. Parents will be notified of any school closures via electronic communication.
                                            </li>
                                        </ol>
                                        <br className="my-2" /><br className="my-2" />
                                        <span className="block mb-6 sm:mb-[50px] font-roboto text-right mr-2.5" id="initial">
                                            <b className="text-sm sm:text-[15px] md:text-base">Initial here &nbsp;</b>
                                            <input
                                                id="point_eight_initial_here"
                                                name="point_eight_initial_here"
                                                type="text"
                                                className="form-control text-box border-b-2 border-[#0F2D52] relative top-[10px] rounded-none w-48 sm:w-54 md:w-[30%] inline-block focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-sm sm:text-base"
                                                placeholder="."
                                                defaultValue={initialFormData?.point_eight_initial_here || ''}
                                            />
                                        </span>

                                        <ol className="list-decimal pl-5" start="8">
                                            <li style={{ paddingLeft: "25px" }} className="pb-2 sm:pb-4 pt-2 sm:pt-4 font-medium text-justify">This School is closed on the following days:</li>
                                        </ol>
                                        {/* Adjusted Table Section for better responsiveness at 886px */}
                                        <div className="flex flex-col md:flex-row pt-5 px-0 sm:px-4 justify-around"> {/* Added justify-around */}
                                            <div className="w-full md:w-1/2 lg:w-[48%] p-0 md:pr-2 lg:pr-4 overflow-x-auto mb-4 md:mb-0"> {/* Adjusted widths and padding */}
                                                <table className="w-full border-collapse min-w-[320px] md:min-w-0"> {/* Min-width for small screens */}
                                                    <thead>
                                                        <tr>
                                                            <th className="text-left py-2 text-sm sm:text-base w-1/3">Leave Dates</th> {/* Set explicit width */}
                                                            <th className="text-left py-2 text-sm sm:text-base w-2/3">Leave Reasons</th> {/* Set explicit width */}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {holidayData2025.map((holiday, index) => (
                                                            <tr key={index}>
                                                                <td className="text-left p-2 text-xs sm:text-sm">{holiday.date}</td>
                                                                <td className="text-left p-2 text-xs sm:text-sm">{holiday.reason}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div className="w-full md:w-1/2 lg:w-[48%] p-0 md:pl-2 lg:pl-4 mt-4 md:mt-0 overflow-x-auto"> {/* Adjusted widths and padding */}
                                                <table className="w-full border-collapse min-w-[320px] md:min-w-0"> {/* Min-width for small screens */}
                                                    <thead>
                                                        <tr>
                                                            <th className="text-left py-2 text-sm sm:text-base w-1/3">Leave Dates</th> {/* Set explicit width */}
                                                            <th className="text-left py-2 text-sm sm:text-base w-2/3">Leave Reasons</th> {/* Set explicit width */}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {holidayData2026.map((holiday, index) => (
                                                            <tr key={index}>
                                                                <td className="text-left p-2 text-xs sm:text-sm">{holiday.date}</td>
                                                                <td className="text-left p-2 text-xs sm:text-sm">{holiday.reason}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <p style={{ paddingLeft: "23px" }} className="font-medium text-justify text-sm sm:text-base mt-4">
                                            *We reserve the right to adjust hours and closures depending on the needs of the school. We will provide at least 24 hours’notice of changes, should anything be necessary.
                                        </p>
                                        <br className="my-2" /><br className="my-2" /><br className="my-2" />
                                        <span className="block mb-6 sm:mb-[50px] font-roboto text-right mr-2.5" id="initial">
                                            <b className="text-sm sm:text-[15px] md:text-base">Initial here &nbsp;</b>
                                            <input
                                                id="point_nine_initial_here"
                                                name="point_nine_initial_here"
                                                type="text"
                                                className="form-control text-box border-b-2 border-[#0F2D52] relative top-[10px] rounded-none w-48 sm:w-54 md:w-[30%] inline-block focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-sm sm:text-base"
                                                placeholder="."
                                                defaultValue={initialFormData?.point_nine_initial_here || ''}
                                            />
                                        </span>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Page 2 */}
                <div className="pages mt-8"> {/* Added margin-top for separation */}
                    <div className="border-2 border-[#0F2D52]"> {/* Keep this for screen display */}
                        <div className="w-full border-b-2 border-[#0f2d52]">
                            <div className="flex flex-col sm:flex-row w-full h-auto sm:h-[180px]">
                                {/* Left Side: Logo */}
                                <div className="w-full sm:w-[50%] flex items-center justify-center bg-white border-b-2 sm:border-b-0 sm:border-r-2 border-[#0f2d52] p-4">
                                    <img
                                        src={logo}
                                        alt="Goddard Logo"
                                        className="h-20 sm:h-24 md:h-28 object-contain"
                                    />
                                </div>

                                {/* Right Side: Title */}
                                <div className="w-full sm:w-[50%] bg-[#0f2d52] flex items-center justify-center p-4">
                                    <span className="text-white text-xl sm:text-xl md:text-2xl font-bold tracking-wide text-center">
                                        Enrollment Agreement
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 sm:p-5">
                            <div className="mx-1 mb-4">
                                <div className="container mx-auto p-0 text-sm sm:text-base">
                                    <ol className="list-decimal pl-5 pt-5 sm:pt-10" start="9">
                                        <li style={{ paddingLeft: "25px" }} className="pb-2 sm:pb-4 pt-2 sm:pt-4 font-medium text-justify">
                                            The Goddard School is a year-round program. Tuition is payable for all 12 months unless withdrawing from enrollment.
                                        </li>
                                    </ol>

                                    <span className="block mb-6 sm:mb-[50px] font-roboto pt-5 sm:pt-10 text-right mr-2.5" id="initial">
                                        <b className="text-sm sm:text-[15px] md:text-base">Initial here &nbsp;</b>
                                        <input
                                            id="point_ten_initial_here"
                                            name="point_ten_initial_here"
                                            type="text"
                                            className="form-control text-box border-b-2 border-[#0F2D52] relative top-[10px] rounded-none w-48 sm:w-54 md:w-[30%] inline-block focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-sm sm:text-base"
                                            placeholder="."
                                            defaultValue={initialFormData?.point_ten_initial_here || ''}
                                        />
                                    </span>
                                    <ol className="list-decimal pl-5" start="10">
                                        <li style={{ paddingLeft: "25px" }} className="pb-2 sm:pb-4 pt-2 sm:pt-4 font-medium text-justify">
                                            The School will open at 7:00am and close at 6:00pm (from September), however modified school hours may apply in case of any unforeseen circumstances. A fee will be charged for any child not picked up before the School’s regular closing time. Full day student late fees begin at 6:01pm. Half Day student late fees begin at 12:46pm. This charge shall be $35 per child for the first 5 minutes and an additional $25 per child per 5-minute period thereafter. Fees for late pick-up are added to tuition; if not paid, the child will not be readmitted to the program. Consistent lateness will be cause for the child’s dismissal from the School. Arrival time at school should be no later than 10am without prior approval or notification.
                                        </li>
                                    </ol>
                                    <br className="my-2" /><br className="my-2" />
                                    <span className="block mb-6 sm:mb-[50px] font-roboto text-right mr-2.5" id="initial">
                                        <b className="text-sm sm:text-[15px] md:text-base">Initial here &nbsp;</b>
                                        <input
                                            id="point_eleven_initial_here"
                                            name="point_eleven_initial_here"
                                            type="text"
                                            className="form-control text-box border-b-2 border-[#0F2D52] relative top-[10px] rounded-none w-48 sm:w-54 md:w-[30%] inline-block focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-sm sm:text-base"
                                            placeholder="."
                                            defaultValue={initialFormData?.point_eleven_initial_here || ''}
                                        />
                                    </span>
                                    <ol className="list-decimal pl-5" start="11">
                                        <li style={{ paddingLeft: "25px" }} className="pb-2 sm:pb-4 pt-2 sm:pt-4 font-medium text-justify">
                                            Our School limits each students day to a maximum of 10 hours. If this 10-hour limit is exceeded a fee of $50 will be charged.
                                        </li>
                                    </ol>
                                    <br className="my-2" /><br className="my-2" />
                                    <span className="block mb-6 sm:mb-[50px] font-roboto text-right mr-2.5" id="initial">
                                        <b className="text-sm sm:text-[15px] md:text-base">Initial here &nbsp;</b>
                                        <input
                                            id="point_twelven_initial_here"
                                            name="point_twelven_initial_here"
                                            type="text"
                                            className="form-control text-box border-b-2 border-[#0F2D52] relative top-[10px] rounded-none w-48 sm:w-54 md:w-[30%] inline-block focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-sm sm:text-base"
                                            placeholder="."
                                            defaultValue={initialFormData?.point_twelve_initial_here || ''}
                                        />
                                    </span>
                                    <ol className="list-decimal pl-5" start="12">
                                        <li style={{ paddingLeft: "25px" }} className="pb-2 sm:pb-4 pt-2 sm:pt-4 font-medium text-justify">
                                            For children over the age of one year, the School requires a minimum of 30-day written notice of withdrawal, and for infants, a minimum of 60-day written notice. Furthermore, the last day must be the end of the month. If no advance notice of withdrawal is provided, the regular tuition fee for that term will be charged.
                                        </li>
                                    </ol>
                                    <br className="my-2" /><br className="my-2" />
                                    <span className="block mb-6 sm:mb-[50px] font-roboto text-right mr-2.5" id="initial">
                                        <b className="text-sm sm:text-[15px] md:text-base">Initial here &nbsp;</b>
                                        <input
                                            id="point_thirteen_initial_here"
                                            name="point_thirteen_initial_here"
                                            type="text"
                                            className="form-control text-box border-b-2 border-[#0F2D52] relative top-[10px] rounded-none w-48 sm:w-54 md:w-[30%] inline-block focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-sm sm:text-base"
                                            placeholder="."
                                            defaultValue={initialFormData?.point_thirteen_initial_here || ''}
                                        />
                                    </span>
                                    <ol className="list-decimal pl-5" start="13">
                                        <li style={{ paddingLeft: "25px" }} className="pb-2 sm:pb-4 pt-2 sm:pt-4 font-medium text-justify">
                                            The School reserves the right to deny, cancel, sever, or suspend a child’s enrollment at any time if the School, in its sole discretion, deems such action to be in the best interest of the child or the School. This should be recorded in an email and in such an event, any unused tuition will be refunded, and no notice period required.
                                        </li>
                                    </ol>
                                    <br className="my-2" /><br className="my-2" />
                                    <span className="block mb-6 sm:mb-[50px] font-roboto text-right mr-2.5" id="initial">
                                        <b className="text-sm sm:text-[15px] md:text-base">Initial here &nbsp;</b>
                                        <input
                                            id="point_fourteen_initial_here"
                                            name="point_fourteen_initial_here"
                                            type="text"
                                            className="form-control text-box border-b-2 border-[#0F2D52] relative top-[10px] rounded-none w-48 sm:w-54 md:w-[30%] inline-block focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-sm sm:text-base"
                                            placeholder="."
                                            defaultValue={initialFormData?.point_fourteen_initial_here || ''}
                                        />
                                    </span>
                                    <ol className="list-decimal pl-5" start="14">
                                        <li style={{ paddingLeft: "25px" }} className="pb-2 sm:pb-4 pt-2 sm:pt-4 font-medium text-justify">
                                            Children may not attend School while ill. Children who become ill at school must be picked up immediately – refer to the Parent Handbook health policy and King County Department of Health requirements. If the child will be absent, the absence should be reported to the School by 9 am.
                                        </li>
                                    </ol>
                                    <br className="my-2" /><br className="my-2" />
                                    <span className="block mb-6 sm:mb-[50px] font-roboto text-right mr-2.5" id="initial">
                                        <b className="text-sm sm:text-[15px] md:text-base">Initial here &nbsp;</b>
                                        <input
                                            id="point_fifteen_initial_here"
                                            name="point_fifteen_initial_here"
                                            type="text"
                                            className="form-control text-box border-b-2 border-[#0F2D52] relative top-[10px] rounded-none w-48 sm:w-54 md:w-[30%] inline-block focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-sm sm:text-base"
                                            placeholder="."
                                            defaultValue={initialFormData?.point_fifteen_initial_here || ''}
                                        />
                                    </span><br />
                                    <ol className="list-decimal pl-5" start="15">
                                        <li style={{ paddingLeft: "25px" }} className="pb-2 sm:pb-4 pt-2 sm:pt-4 font-medium text-justify">
                                            Each child in our childcare facility will be required to have current and up to date immunizations throughout their time in our facility.
                                        </li>
                                    </ol>
                                    <br className="my-2" /><br className="my-2" /><br className="my-2" />
                                    <span className="block mb-6 sm:mb-[50px] font-roboto text-right mr-2.5" id="initial">
                                        <b className="text-sm sm:text-[15px] md:text-base">Initial here &nbsp;</b>
                                        <input
                                            id="point_sixteen_initial_here"
                                            name="point_sixteen_initial_here"
                                            type="text"
                                            className="form-control text-box border-b-2 border-[#0F2D52] relative top-[10px] rounded-none w-48 sm:w-54 md:w-[30%] inline-block focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-sm sm:text-base"
                                            placeholder="."
                                            defaultValue={initialFormData?.point_sixteen_initial_here || ''}
                                        />
                                    </span>
                                    <ol className="list-decimal pl-5" start="16">
                                        <li style={{ paddingLeft: "25px" }} className="pb-2 sm:pb-4 pt-2 sm:pt-4 font-medium text-justify">
                                            If your student has an allergy, asthma or a medical condition that requires medication, we are required to meet state licensing standards regarding the medication and paperwork. All paperwork MUST be complete prior to enrollment. This includes maintaining unexpired medications and paperwork while enrolled at The Goddard School.
                                        </li>
                                    </ol>
                                    <br className="my-2" /><br className="my-2" /><br className="my-2" />
                                    <span className="block mb-6 sm:mb-[50px] font-roboto text-right mr-2.5" id="initial">
                                        <b className="text-sm sm:text-[15px] md:text-base">Initial here &nbsp;</b>
                                        <input
                                            id="point_seventeen_initial_here"
                                            name="point_seventeen_initial_here"
                                            type="text"
                                            className="form-control text-box border-b-2 border-[#0F2D52] relative top-[10px] rounded-none w-48 sm:w-54 md:w-[30%] inline-block focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-sm sm:text-base"
                                            placeholder="."
                                            defaultValue={initialFormData?.point_seventeen_initial_here || ''}
                                        />
                                    </span>
                                    <ol className="list-decimal pl-5" start="17">
                                        <li style={{ paddingLeft: "25px" }} className="pb-2 sm:pb-4 pt-2 sm:pt-4 font-medium text-justify">
                                            Parents acknowledge and agree that representatives of the School’s franchisor, Goddard Systems, Inc. (“GSI”) will have access to information in children’s files as part of GSI’s Quality Assurance reviews and otherwise.
                                        </li>
                                    </ol>
                                    <br className="my-2" /><br className="my-2" />
                                    <span className="block mb-6 sm:mb-[50px] font-roboto text-right mr-2.5" id="initial">
                                        <b className="text-sm sm:text-[15px] md:text-base">Initial here &nbsp;</b>
                                        <input
                                            id="point_eighteen_initial_here"
                                            name="point_eighteen_initial_here"
                                            type="text"
                                            className="form-control text-box border-b-2 border-[#0F2D52] relative top-[10px] rounded-none w-48 sm:w-54 md:w-[30%] inline-block focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-sm sm:text-base"
                                            placeholder="."
                                            defaultValue={initialFormData?.point_eighteen_initial_here || ''}
                                        />
                                    </span>
                                    <ol className="list-decimal pl-5" start="18">
                                        <li style={{ paddingLeft: "25px" }} className="pb-2 sm:pb-4 pt-2 sm:pt-4 font-medium text-justify">
                                            The School’s employees are its most important assets. If Parents hire an employee of the School or a former employee (within 6 months of his/her employment at the School) for at least 20 hours per week, Parents agree to pay the School a placement fee of $10,000, payable upon hiring.
                                        </li>
                                    </ol>
                                    <br className="my-2" /><br className="my-2" /><br className="my-2" />
                                    <span className="block mb-6 sm:mb-[50px] font-roboto text-right mr-2.5" id="initial">
                                        <b className="text-sm sm:text-[15px] md:text-base">Initial here &nbsp;</b>
                                        <input
                                            id="point_ninteen_initial_here"
                                            name="point_ninteen_initial_here"
                                            type="text"
                                            className="form-control text-box border-b-2 border-[#0F2D52] relative top-[10px] rounded-none w-48 sm:w-54 md:w-[30%] inline-block focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-sm sm:text-base"
                                            placeholder="."
                                            defaultValue={initialFormData?.point_ninteen_initial_here || ''}
                                        />
                                    </span>
                                    <ol className="list-decimal pl-5" start="19">
                                        <li style={{ paddingLeft: "25px" }} className="pb-2 sm:pb-4 pt-2 sm:pt-4 font-medium text-justify">
                                            Parents agree that Outside Engagements are not for the benefit or convenience of the School, its owners or GSI, and Parents hereby irrevocably release and discharge the School, GSI, and their respective present or former owners, employees, officers, directors, agents, parents, subsidiaries, affiliates, heirs, successors and assigns, in their individual and corporate capacities from all claims, demands, liabilities, actions or causes of action whatsoever, arising in law or equity, whether known or unknown, which Parents have, may have or claim to have at any time in the future against the Releases based in whole or in part on, arising out of or related to any Outside Engagements.
                                        </li>
                                    </ol>
                                    <br className="my-2" />
                                    <p className="font-medium pl-5 text-justify text-sm sm:text-base">
                                        The undersigned Parents have received an executed copy of this Agreement and a copy of the Parent Handbook, which includes the school policies and health policy referenced in paragraph 14 and 15. Parents acknowledge that this Agreement is by and between Parents and Cool Kidz LLC d/b/a The Goddard School; GSI is not a party to this Agreement. The undersigned Parents understand the terms of this Agreement and agree to be bound by them.
                                    </p>
                                    <div className="flex flex-wrap mt-5 pl-0 sm:pl-5 -mx-2">
                                        <div className="w-full sm:w-1/2 px-2 mb-4">
                                            <div className="mb-4">
                                                <label htmlFor="child_first_name" className="block text-sm sm:text-base font-bold mb-1">
                                                    Child’s Name
                                                </label>
                                                <input type="text" className="w-full border-b-2 border-[#0F2D52] rounded-none focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] p-2 text-sm sm:text-base" id="child_first_name" name="child_first_name" defaultValue={initialFormData?.child_first_name || ''} />
                                            </div>
                                        </div>
                                        <div className="w-full sm:w-1/2 px-2 mb-4">
                                            <div className="mb-4">
                                                <label htmlFor="dob" className="block text-sm sm:text-base font-bold mb-1">
                                                    Date of Birth
                                                </label>
                                                <input type="date" className="w-full border-b-2 border-[#0F2D52] rounded-none focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] p-2 text-sm sm:text-base" id="dob" name="dob" defaultValue={initialFormData?.dob || ''} />
                                            </div>
                                        </div>
                                        <div className="w-full sm:w-1/2 px-2 mb-4">
                                            <div className="mb-4">
                                                <label htmlFor="preferred_start_date" className="block text-sm sm:text-base font-bold mb-1">
                                                    Preferred Start Date
                                                </label>
                                                <input type="date" className="w-full border-b-2 border-[#0F2D52] rounded-none focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] p-2 text-sm sm:text-base" id="preferred_start_date" name="preferred_start_date" defaultValue={initialFormData?.preferred_start_date || ''} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <br />
                </div>
                {/* Page 3 - (This was the last section of the HTML, repeated header) */}
                <div className="pages mt-8"> {/* Added margin-top for separation */}
                    <div className="border-2 border-[#0F2D52]">
                        <div className="w-full border-b-2 border-[#0f2d52]">
                            <div className="flex flex-col sm:flex-row w-full h-auto sm:h-[180px]">
                                {/* Left Side: Logo */}
                                <div className="w-full sm:w-[50%] flex items-center justify-center bg-white border-b-2 sm:border-b-0 sm:border-r-2 border-[#0f2d52] p-4">
                                    <img
                                        src={logo}
                                        alt="Goddard Logo"
                                        className="h-20 sm:h-24 md:h-28 object-contain"
                                    />
                                </div>

                                {/* Right Side: Title */}
                                <div className="w-full sm:w-[50%] bg-[#0f2d52] flex items-center justify-center p-4">
                                    <span className="text-white text-xl sm:text-xl md:text-2xl font-bold tracking-wide text-center">
                                        Enrollment Agreement
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 sm:p-5">
                            <div className="flex flex-wrap -mx-2">
                                <div className="w-full sm:w-1/2 px-2 mb-4 flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        className="custom-checkbox h-4 w-4 sm:h-5 sm:w-5 appearance-none bg-white border-2 border-gray-700 rounded-md cursor-pointer outline-none transition-all duration-300 ease-in-out checked:bg-[#0F2D52] checked:border-[#0F2D52] checked:after:content-['✓'] checked:after:text-white checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:opacity-100 after:opacity-0 after:transition-opacity after:duration-1000 after:ease-in-out"
                                        id="full_day"
                                        name="full_day"
                                        checked={fullDayChecked}
                                        onChange={(e) => setFullDayChecked(e.target.checked)}
                                    />
                                    <label className="text-sm sm:text-base" htmlFor="full_day">
                                        <span><b>Full-Day</b></span>
                                    </label>
                                    <input
                                        type="checkbox"
                                        className="custom-checkbox h-4 w-4 sm:h-5 sm:w-5 appearance-none bg-white border-2 border-gray-700 rounded-md cursor-pointer outline-none transition-all duration-300 ease-in-out checked:bg-[#0F2D52] checked:border-[#0F2D52] checked:after:content-['✓'] checked:after:text-white checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:opacity-100 after:opacity-0 after:transition-opacity after:duration-1000 after:ease-in-out"
                                        id="half_day"
                                        name="half_day"
                                        checked={halfDayChecked}
                                        onChange={(e) => setHalfDayChecked(e.target.checked)}
                                    />
                                    <label className="text-sm sm:text-base" htmlFor="half_day">
                                        <span><b>Half-Day</b></span>
                                    </label>
                                </div>
                                <div className="w-full sm:w-1/2 px-2 mb-4">
                                    <div className="mb-4">
                                        <label htmlFor="preferred_schedule" className="block text-sm sm:text-base font-bold mb-1">
                                            Preferred Schedule
                                        </label>
                                        <input type="text" className="w-full border-b-2 border-[#0F2D52] rounded-none focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] p-2 text-sm sm:text-base" id="preferred_schedule" name="preferred_schedule" defaultValue={initialFormData?.preferred_schedule || ''} />
                                    </div>
                                </div>
                                <div className="w-full sm:w-1/2 px-2 mb-4">
                                    <div className="mb-4">
                                        <label htmlFor="primary_parent_email" className="block text-sm sm:text-base font-bold mb-1">
                                            Email
                                        </label>
                                        <input type="email" className="w-full border-b-2 border-[#0F2D52] rounded-none focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] p-2 text-sm sm:text-base" id="primary_parent_email" name="primary_parent_email" defaultValue={initialFormData?.primary_parent_email || ''} />
                                    </div>
                                </div>
                                <div className="w-full sm:w-1/2 px-2 mb-4">
                                    <div className="mb-4">
                                        <label htmlFor="preferred_home_addr" className="block text-sm sm:text-base font-bold mb-1">
                                            Home Address
                                        </label>
                                        <input type="text" className="w-full border-b-2 border-[#0F2D52] rounded-none focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] p-2 text-sm sm:text-base" id="preferred_home_addr" name="preferred_home_addr" defaultValue={initialFormData?.preferred_home_addr || ''} />
                                    </div>
                                </div>
                            </div>
                            <br />
                            <h4 className="text-center mb-2 text-lg sm:text-xl font-bold">Parent Agreement</h4>
                            <div className="flex flex-wrap -mx-2">
                                <div className="w-full sm:w-1/2 px-2 mb-4">
                                    <div className="mb-4">
                                        <label htmlFor="parent_sign_enroll" className="block text-sm sm:text-base font-bold mb-1">
                                            Parent Signature
                                        </label>
                                        <input type="text" className="w-full border-b-2 border-[#0F2D52] rounded-none focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] p-2 text-sm sm:text-base" id="parent_sign_enroll" name="parent_sign_enroll" defaultValue={initialFormData?.parent_sign_enroll || ''} />
                                    </div>
                                </div>
                                <div className="w-full sm:w-1/2 px-2 mb-4">
                                    <div className="mb-4">
                                        <label htmlFor="parent_sign_date_enroll" className="block text-sm sm:text-base font-bold mb-1">
                                            Date
                                        </label>
                                        <input type="date" className="w-full border-b-2 border-[#0F2D52] rounded-none focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] p-2 text-sm sm:text-base" id="parent_sign_date_enroll" name="parent_sign_date_enroll" defaultValue={initialFormData?.parent_sign_date_enroll || ''} /* onClick={() => dateValidation('parent_sign_date_enroll')} */ />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
});

export default EnrollmentAgreementForm;