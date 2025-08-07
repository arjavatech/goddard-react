import React, { useCallback, useImperativeHandle, forwardRef } from 'react';
import PDFHeader from './PDFHeader';

const EnrollmentAgreementForm = forwardRef(({ initialFormData }, ref) => {

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

    const handleGeneratePdf = useCallback(async (isPrint = false) => {
        try {
            await Promise.all([
                loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'),
                loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js')
            ]);


            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'legal');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const margins = 10;
            const imgWidth = pdfWidth - (margins * 2);
            const borderWidth = 0.5;

            const headerElement = document.getElementById('header-container');
            const headerCanvas = await html2canvas(headerElement, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
            });
            const headerImage = headerCanvas.toDataURL('image/jpeg', 0.9);
            const headerHeight = (headerCanvas.height * imgWidth) / headerCanvas.width;
            headerElement.style.display = 'none';

            const contentForPdf = document.getElementById('content-for-pdf');
            if (!contentForPdf) {
                console.error('Error: The element with ID "content-for-pdf" was not found.');
                return;
            }

            const contentElements = Array.from(contentForPdf.querySelectorAll('.content-section'));
            let yPosition = margins;


            const drawBorder = (yEnd) => {
                pdf.setDrawColor(15, 45, 82);
                pdf.setLineWidth(borderWidth);
                pdf.line(margins, margins, pdfWidth - margins, margins);
                pdf.line(pdfWidth - margins, margins, pdfWidth - margins, yEnd);
                pdf.line(pdfWidth - margins, yEnd, margins, yEnd);
                pdf.line(margins, yEnd, margins, margins);
            };


            const drawHeaderBorder = (yStart, yEnd) => {
                pdf.setDrawColor(15, 45, 82);
                pdf.setLineWidth(1.5);
                pdf.line(margins, yEnd, pdfWidth - margins, yEnd);
            };


            pdf.addImage(headerImage, 'JPEG', margins, yPosition, imgWidth, headerHeight);
            yPosition += headerHeight;


            const sectionsPerPages = [];
            let currentPageSections = [];
            let currentHeight = yPosition;

            for (const element of contentElements) {
                const elementCanvas = await html2canvas(element, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff',
                    logging: false,
                    allowTaint: true,
                });
                const elementImage = elementCanvas.toDataURL('image/jpeg', 0.9);
                const elementHeight = (elementCanvas.height * imgWidth) / elementCanvas.width;

                const remainingPageSpace = pdfHeight - currentHeight - margins;

                if (elementHeight > remainingPageSpace) {
                    sectionsPerPages.push({ sections: currentPageSections, height: currentHeight });
                    currentPageSections = [];
                    currentHeight = margins + headerHeight;
                }
                currentPageSections.push({ image: elementImage, height: elementHeight });
                currentHeight += elementHeight;
            }


            sectionsPerPages.push({ sections: currentPageSections, height: currentHeight });


            yPosition = margins;


            if (sectionsPerPages.length > 0) {
                const firstPage = sectionsPerPages[0];
                yPosition = margins;
                pdf.addImage(headerImage, 'JPEG', margins, yPosition, imgWidth, headerHeight);
                drawHeaderBorder(yPosition, yPosition + headerHeight);
                yPosition += headerHeight;

                for (const section of firstPage.sections) {
                    pdf.addImage(section.image, 'JPEG', margins, yPosition, imgWidth, section.height);
                    yPosition += section.height;
                }
                yPosition += 10;
                drawBorder(yPosition);
            }


            for (let i = 1; i < sectionsPerPages.length; i++) {
                pdf.addPage();
                yPosition = margins;
                const page = sectionsPerPages[i];

                pdf.addImage(headerImage, 'JPEG', margins, yPosition, imgWidth, headerHeight);
                drawHeaderBorder(yPosition, yPosition + headerHeight);
                yPosition += headerHeight;

                for (const section of page.sections) {
                    pdf.addImage(section.image, 'JPEG', margins, yPosition, imgWidth, section.height);
                    yPosition += section.height;
                }
                yPosition += 10;
                drawBorder(yPosition);
            }


            if (headerElement) {
                headerElement.style.display = 'block';
            }

            if (isPrint) {
                const pdfBlob = pdf.output('blob');
                const blobUrl = URL.createObjectURL(pdfBlob);
                const printWindow = window.open(blobUrl, '_blank');

                if (printWindow) {
                    printWindow.addEventListener('load', () => {
                        setTimeout(() => {
                            printWindow.print();


                            const checkClosed = setInterval(() => {
                                if (printWindow.closed) {
                                    clearInterval(checkClosed);
                                    URL.revokeObjectURL(blobUrl);
                                }
                            }, 500);
                        }, 1000);
                    });
                } else {
                    alert('Please allow popups to enable printing');
                    URL.revokeObjectURL(blobUrl);
                }
            } else {
                pdf.save('EnrollmentAgreement.pdf');
            }
        } catch (error) {
            console.error('Error generating or downloading PDF:', error);
        }
    }, []);

    const handlePrint = useCallback(() => {
        handleGeneratePdf(true);
    }, [handleGeneratePdf]);

    useImperativeHandle(ref, () => ({
        generatePdf: () => handleGeneratePdf(false),
        print: handlePrint
    }));

    return (
        <div className="bg-white mx-auto text-[#0f2d52] text-[20px] py-12 text-black">
            <style>
                {`
                .pdf-mode .content-section {
                    page-break-inside: avoid;
                    break-inside: avoid-page;
                }
                ol {
                    padding: 5%;
                }
                .pdf-border-container {
                    /* This container is for visual representation in the browser. */
                    border: 1px solid #0f2d52;
                    padding: 10px;
                }
                .form-control.text-box {
                    border-bottom-width: 3px !important;
                }
                #enrollment-agreement-content {
                    width: 100% ;
                    max-width: 100%;
                }

                @media (max-width: 768px) {
                    #enrollment-agreement-content {
                        display: block;
                    }
                    #enrollment-agreement-content {
                        width: 1440px !important;
                        max-width: 1440px !important;
                    }
                }
                
                `}
            </style>

            <div id="enrollment-agreement-content" className="pdf-border-container">
                <div id="header-container" className="mb-[12%] mx-5">
                    <PDFHeader heading={"Enrollment Agreement"} />
                </div>

                <div id="content-for-pdf" className="px-16">
                    <div className="p-10 sm:p-4 md:p-6">
                        <form id="formContent">
                            <div className="mx-1 mb-4">
                                <div className="container mx-auto p-0 text-base">
                                    {/* Content section 1 */}
                                    <div className="content-section">
                                        <ol className="list-decimal pt-10">
                                            <li style={{ paddingLeft: "25px" }} className="pb-4 pt-4 font-medium text-justify">
                                                This Enrollment Agreement (the “Agreement”), effective (today’s date) {' '}
                                                <input
                                                    id="point_one_field_one"
                                                    name="point_one_field_one"
                                                    type="text"
                                                    className="form-control text-box border-b-2 max-w-[150px] border-[#0F2D52] rounded-none w-[30%] inline-block focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-base"
                                                    defaultValue={initialFormData?.point_one_field_one || ''}
                                                />{' '}
                                                is between Cool Kidz LLC dba The Goddard School, an independent franchisee operating The Goddard School® located at 4200 228th Ave NE, Redmond, WA pursuant to a license from Goddard Systems, Inc., and {' '}
                                                <input
                                                    id="point_one_field_three"
                                                    name="point_one_field_three"
                                                    type="text"
                                                    className="form-control text-box border-b-2 border-[#0F2D52] rounded-none w-[30%] inline-block focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-base"
                                                    defaultValue={initialFormData?.point_one_field_three || ''}
                                                />{' '}
                                                (“Parents”).
                                            </li>
                                        </ol>
                                        <br className="my-2" /><br className="my-2" /><br className="my-2" />
                                        <span className="block mb-[50px] font-roboto text-right mr-2.5 initial-section" id="initial">
                                            <b className="text-base">Initial here &nbsp;</b>
                                            <input
                                                id="point_two_initial_here"
                                                name="point_two_initial_here"
                                                type="text"
                                                className="form-control text-box border-b-2 border-[#0F2D52] rounded-none w-48 sm:w-54 md:w-[30%] inline-block focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-base"
                                                placeholder=" "
                                                defaultValue={initialFormData?.point_two_initial_here || ''}
                                            />
                                        </span>
                                    </div>

                                    {/* Content section 2 */}
                                    <div className="content-section">
                                        <ol className="list-decimal pl-5" start="2">
                                            <li style={{ paddingLeft: "25px" }} className="pb-4 pt-4 font-medium text-justify">
                                                The School’s non-refundable registration fee of $300 shall be paid annually in March and at the time of initial application. The fee is $300 for each child.
                                            </li>
                                        </ol>
                                        <br className="my-2" /><br className="my-2" /><br className="my-2" />
                                        <span className="block mb-[50px] font-roboto text-right mr-2.5 initial-section" id="initial">
                                            <b className="text-base">Initial here &nbsp;</b>
                                            <input
                                                id="point_three_initial_here"
                                                name="point_three_initial_here"
                                                type="text"
                                                className="form-control text-box border-b-2 border-[#0F2D52] rounded-none w-48 sm:w-54 md:w-[30%] inline-block focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-base"
                                                placeholder=" "
                                                defaultValue={initialFormData?.point_three_initial_here || ''}
                                            />
                                        </span>
                                    </div>

                                    {/* Content section 3 */}
                                    <div className="content-section">
                                        <ol className="list-decimal pl-5" start="3">
                                            <li style={{ paddingLeft: "25px" }} className="pb-4 pt-4 font-medium text-justify">
                                                New Family Enrollment - One full month tuition and non-refundable registration fee are due at time of enrollment, along with this signed agreement. If the deposit is not paid, a place for your child cannot be guaranteed. The first month’s tuition is 100% refundable 90 days before the Goddard approved start date and non-refundable thereafter.
                                            </li>
                                        </ol>
                                        <br className="my-2" /><br className="my-2" /><br className="my-2" />
                                        <span className="block mb-[50px] font-roboto text-right mr-2.5 initial-section" id="initial">
                                            <b className="text-base">Initial here &nbsp;</b>
                                            <input
                                                id="point_four_initial_here"
                                                name="point_four_initial_here"
                                                type="text"
                                                className="form-control text-box border-b-2 border-[#0F2D52] rounded-none w-48 sm:w-54 md:w-[30%] inline-block focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-base"
                                                placeholder=" "
                                                defaultValue={initialFormData?.point_four_initial_here || ''}
                                            />
                                        </span>
                                    </div>

                                    {/* Content section 4 */}
                                    <div className="content-section">
                                        <ol className="list-decimal pl-5" start="4">
                                            <li style={{ paddingLeft: "25px" }} className="pb-4 pt-4 font-medium text-justify">
                                                Wait-listed Families - For being on our waitlist only the Registration fee is necessary, and it is fully refundable if we are unable to provide you with classroom placement for your desired start date.
                                            </li>
                                        </ol>
                                        <br className="my-2" /><br className="my-2" /><br className="my-2" />

                                        <span className="block mb-[50px] font-roboto text-right mr-2.5 initial-section" id="initial">
                                            <b className="text-base">Initial here &nbsp;</b>
                                            <input
                                                id="point_five_initial_here"
                                                name="point_five_initial_here"
                                                type="text"
                                                className="form-control text-box border-b-2 border-[#0F2D52] rounded-none w-48 sm:w-54 md:w-[30%] inline-block focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-base"
                                                placeholder=" "
                                                defaultValue={initialFormData?.point_five_initial_here || ''}
                                            />
                                        </span>

                                    </div>

                                    {/* Content section 5 */}
                                    <div className="content-section">
                                        <ol className="list-decimal pl-5" start="5">
                                            <li style={{ paddingLeft: "25px" }} className="pb-4 pt-4 font-medium text-justify">
                                                Monthly tuition is due on or before the 1<sup>st</sup> of each month. A $50 late fee shall be charged for any monthly tuition payments received after the 1st of the month. A fee of $75 will be charged for checks returned by the school's bank. If monthly tuition fees (including any applicable late fees) are not received at the School by the 15th of the month, the child will not be readmitted to the program. If the School is compelled to take legal action for tuition payments, Parents agree to pay the School’s reasonable attorneys’ fees and costs incurred.
                                            </li>
                                        </ol>
                                        <br className="my-2" /><br className="my-2" /><br className="my-2" />
                                        <span className="block mb-[50px] font-roboto text-right mr-2.5 initial-section" id="initial">
                                            <b className="text-base">Initial here &nbsp;</b>
                                            <input
                                                id="point_six_initial_here"
                                                name="point_six_initial_here"
                                                type="text"
                                                className="form-control text-box border-b-2 border-[#0F2D52] rounded-none w-48 sm:w-54 md:w-[30%] inline-block focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-base"
                                                placeholder=" "
                                                defaultValue={initialFormData?.point_six_initial_here || ''}
                                            />
                                        </span>
                                    </div>

                                    {/* Content section 6 */}
                                    <div className="content-section">
                                        <ol className="list-decimal pl-5" start="6">
                                            <li style={{ paddingLeft: "25px" }} className="pb-4 pt-4 font-medium text-justify">
                                                At the time of registration, tuition is quoted for the current rate of the classroom. Tuition is subject to change at the discretion of the school. You will receive notification of any proposed change.
                                            </li>
                                        </ol>
                                        <br className="my-2" /><br className="my-2" /><br className="my-2" />
                                        <span className="block mb-[50px] font-roboto text-right mr-2.5 initial-section" id="initial">
                                            <b className="text-base">Initial here &nbsp;</b>
                                            <input
                                                id="point_seven_initial_here"
                                                name="point_seven_initial_here"
                                                type="text"
                                                className="form-control text-box border-b-2 border-[#0F2D52] rounded-none w-48 sm:w-54 md:w-[30%] inline-block focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-base"
                                                placeholder=" "
                                                defaultValue={initialFormData?.point_seven_initial_here || ''}
                                            />
                                        </span>
                                    </div>

                                    {/* Content section 7 */}
                                    <div className="content-section">
                                        <ol className="list-decimal pl-5" start="7">
                                            <li style={{ paddingLeft: "25px" }} className="pb-4 pt-4 font-medium text-justify">
                                                Monthly tuition fees are non-refundable regardless of holidays, illness, vacation, inclement weather days or School closures resulting from causes beyond the reasonable control of the School or its management including, but not limited to pandemics, government order, public health crisis, fire, floods, civil commotions, strikes, lockouts or other labor disturbances, “Acts of God” or acts, omissions, or delays in acting by any governmental authority. The School and its management will use reasonable efforts to avoid unscheduled closures and will resume operation as soon as feasible. The School will make reasonable efforts to open in inclement weather; however, the School may choose to close at the discretion of the School’s owner. Parents will be notified of any school closures via electronic communication.
                                            </li>
                                        </ol>
                                        <br className="my-2" /><br className="my-2" />
                                        <span className="block mb-[50px] font-roboto text-right mr-2.5 initial-section" id="initial">
                                            <b className="text-base">Initial here &nbsp;</b>
                                            <input
                                                id="point_eight_initial_here"
                                                name="point_eight_initial_here"
                                                type="text"
                                                className="form-control text-box border-b-2 border-[#0F2D52] rounded-none w-48 sm:w-54 md:w-[30%] inline-block focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-base"
                                                placeholder=" "
                                                defaultValue={initialFormData?.point_eight_initial_here || ''}
                                            />
                                        </span>
                                    </div>

                                    {/* Content section 8 */}
                                    <div className="content-section">
                                        <ol className="list-decimal pl-5" start="8">
                                            <li style={{ paddingLeft: "25px" }} className="pb-4 pt-4 font-medium text-justify">This School is closed on the following days:</li>
                                        </ol>
                                        <div className="flex flex-row pt-5 px-4 justify-around">
                                            <div className="w-1/2 lg:w-[48%] pr-4 overflow-x-auto mb-0">
                                                <table className="w-full border-collapse min-w-0">
                                                    <thead>
                                                        <tr>
                                                            <th className="text-left py-2 text-base w-1/3">Leave Dates</th>
                                                            <th className="text-left py-2 text-base w-2/3">Leave Reasons</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {holidayData2025.map((holiday, index) => (
                                                            <tr key={index}>
                                                                <td className="text-left p-2 text-sm">{holiday.date}</td>
                                                                <td className="text-left p-2 text-sm">{holiday.reason}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="w-1/2 lg:w-[48%] p-0 md:pl-2 lg:pl-4 mt-4 md:mt-0 overflow-x-auto">
                                                <table className="w-full border-collapse min-w-[320px] md:min-w-0">
                                                    <thead>
                                                        <tr>
                                                            <th className="text-left py-2 text-base w-1/3">Leave Dates</th>
                                                            <th className="text-left py-2 text-base w-2/3">Leave Reasons</th>
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
                                        <p style={{ paddingLeft: "23px" }} className="font-medium text-justify text-base mt-4 pr-5">
                                            *We reserve the right to adjust hours and closures depending on the needs of the school. We will provide at least 24 hours’notice of changes, should anything be necessary.
                                        </p>
                                        <br className="my-2" /><br className="my-2" /><br className="my-2" />
                                        <span className="block mb-[50px] font-roboto text-right mr-2.5 initial-section" id="initial">
                                            <b className="text-base">Initial here &nbsp;</b>
                                            <input
                                                id="point_nine_initial_here"
                                                name="point_nine_initial_here"
                                                type="text"
                                                className="form-control text-box border-b-2 border-[#0F2D52] rounded-none w-48 sm:w-54 md:w-[30%] inline-block focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-base"
                                                placeholder=" "
                                                defaultValue={initialFormData?.point_nine_initial_here || ''}
                                            />
                                        </span>
                                    </div>

                                    {/* Content section 9 */}
                                    <div className="content-section">
                                        <ol className="list-decimal pl-5" start="9">
                                            <li style={{ paddingLeft: "25px" }} className="pb-4 pt-4 font-medium text-justify">
                                                The Goddard School is a year-round program. Tuition is payable for all 12 months unless withdrawing from enrollment.
                                            </li>
                                        </ol>
                                        <span className="block mb-[50px] font-roboto pt-10 text-right mr-2.5 initial-section" id="initial">
                                            <b className="text-base">Initial here &nbsp;</b>
                                            <input
                                                id="point_ten_initial_here"
                                                name="point_ten_initial_here"
                                                type="text"
                                                className="form-control text-box border-b-2 border-[#0F2D52] rounded-none w-48 sm:w-54 md:w-[30%] inline-block focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-base"
                                                placeholder=" "
                                                defaultValue={initialFormData?.point_ten_initial_here || ''}
                                            />
                                        </span>
                                    </div>

                                    {/* Content section 10 */}
                                    <div className="content-section">
                                        <ol className="list-decimal pl-5" start="10">
                                            <li style={{ paddingLeft: "25px" }} className="pb-4 pt-4 font-medium text-justify">
                                                The School will open at 7:00am and close at 6:00pm (from September), however modified school hours may apply in case of any unforeseen circumstances. A fee will be charged for any child not picked up before the School’s regular closing time. Full day student late fees begin at 6:01pm. Half Day student late fees begin at 12:46pm. This charge shall be $35 per child for the first 5 minutes and an additional $25 per child per 5-minute period thereafter. Fees for late pick-up are added to tuition; if not paid, the child will not be readmitted to the program. Consistent lateness will be cause for the child’s dismissal from the School. Arrival time at school should be no later than 10am without prior approval or notification.
                                            </li>
                                        </ol>
                                        <br className="my-2" /><br className="my-2" />
                                        <span className="block mb-[50px] font-roboto text-right mr-2.5 initial-section" id="initial">
                                            <b className="text-base">Initial here &nbsp;</b>
                                            <input
                                                id="point_eleven_initial_here"
                                                name="point_eleven_initial_here"
                                                type="text"
                                                className="form-control text-box border-b-2 border-[#0F2D52] rounded-none w-48 sm:w-54 md:w-[30%] inline-block focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-base"
                                                placeholder=" "
                                                defaultValue={initialFormData?.point_eleven_initial_here || ''}
                                            />
                                        </span>
                                    </div>

                                    {/* Content section 11 */}
                                    <div className="content-section">
                                        <ol className="list-decimal pl-5" start="11">
                                            <li style={{ paddingLeft: "25px" }} className="pb-4 pt-4 font-medium text-justify">
                                                Our School limits each students day to a maximum of 10 hours. If this 10-hour limit is exceeded a fee of $50 will be charged.
                                            </li>
                                        </ol>
                                        <br className="my-2" /><br className="my-2" />
                                        <span className="block mb-[50px] font-roboto text-right mr-2.5 initial-section" id="initial">
                                            <b className="text-base">Initial here &nbsp;</b>
                                            <input
                                                id="point_twelven_initial_here"
                                                name="point_twelven_initial_here"
                                                type="text"
                                                className="form-control text-box border-b-2 border-[#0F2D52] rounded-none w-48 sm:w-54 md:w-[30%] inline-block focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-base"
                                                placeholder=" "
                                                defaultValue={initialFormData?.point_twelve_initial_here || ''}
                                            />
                                        </span>
                                    </div>

                                    {/* Content section 12 */}
                                    <div className="content-section">
                                        <ol className="list-decimal pl-5" start="12">
                                            <li style={{ paddingLeft: "25px" }} className="pb-4 pt-4 font-medium text-justify">
                                                For children over the age of one year, the School requires a minimum of 30-day written notice of withdrawal, and for infants, a minimum of 60-day written notice. Furthermore, the last day must be the end of the month. If no advance notice of withdrawal is provided, the regular tuition fee for that term will be charged.
                                            </li>
                                        </ol>
                                        <br className="my-2" /><br className="my-2" />
                                        <span className="block mb-[50px] font-roboto text-right mr-2.5 initial-section" id="initial">
                                            <b className="text-base">Initial here &nbsp;</b>
                                            <input
                                                id="point_thirteen_initial_here"
                                                name="point_thirteen_initial_here"
                                                type="text"
                                                className="form-control text-box border-b-2 border-[#0F2D52] rounded-none w-48 sm:w-54 md:w-[30%] inline-block focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-base"
                                                placeholder=" "
                                                defaultValue={initialFormData?.point_thirteen_initial_here || ''}
                                            />
                                        </span>
                                    </div>

                                    {/* Content section 13 */}
                                    <div className="content-section">
                                        <ol className="list-decimal pl-5" start="13">
                                            <li style={{ paddingLeft: "25px" }} className="pb-4 pt-4 font-medium text-justify">
                                                The School reserves the right to deny, cancel, sever, or suspend a child’s enrollment at any time if the School, in its sole discretion, deems such action to be in the best interest of the child or the School. This should be recorded in an email and in such an event, any unused tuition will be refunded, and no notice period required.
                                            </li>
                                        </ol>
                                        <br className="my-2" /><br className="my-2" />
                                        <span className="block mb-[50px] font-roboto text-right mr-2.5 initial-section" id="initial">
                                            <b className="text-base">Initial here &nbsp;</b>
                                            <input
                                                id="point_fourteen_initial_here"
                                                name="point_fourteen_initial_here"
                                                type="text"
                                                className="form-control text-box border-b-2 border-[#0F2D52] rounded-none w-48 sm:w-54 md:w-[30%] inline-block focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-base"
                                                placeholder=" "
                                                defaultValue={initialFormData?.point_fourteen_initial_here || ''}
                                            />
                                        </span>
                                    </div>

                                    {/* Content section 14 */}
                                    <div className="content-section">
                                        <ol className="list-decimal pl-5" start="14">
                                            <li style={{ paddingLeft: "25px" }} className="pb-4 pt-4 font-medium text-justify">
                                                Children may not attend School while ill. Children who become ill at school must be picked up immediately – refer to the Parent Handbook health policy and King County Department of Health requirements. If the child will be absent, the absence should be reported to the School by 9 am.
                                            </li>
                                        </ol>
                                        <br className="my-2" /><br className="my-2" />
                                        <span className="block mb-[50px] font-roboto text-right mr-2.5 initial-section" id="initial">
                                            <b className="text-base">Initial here &nbsp;</b>
                                            <input
                                                id="point_fifteen_initial_here"
                                                name="point_fifteen_initial_here"
                                                type="text"
                                                className="form-control text-box border-b-2 border-[#0F2D52] rounded-none w-48 sm:w-54 md:w-[30%] inline-block focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-base"
                                                placeholder=" "
                                                defaultValue={initialFormData?.point_fifteen_initial_here || ''}
                                            />
                                        </span>
                                    </div>

                                    {/* Content section 15 */}
                                    <div className="content-section">
                                        <ol className="list-decimal pl-5" start="15">
                                            <li style={{ paddingLeft: "25px" }} className="pb-4 pt-4 font-medium text-justify">
                                                Each child in our childcare facility will be required to have current and up to date immunizations throughout their time in our facility.
                                            </li>
                                        </ol>
                                        <br className="my-2" /><br className="my-2" /><br className="my-2" />
                                        <span className="block mb-[50px] font-roboto text-right mr-2.5 initial-section" id="initial">
                                            <b className="text-base">Initial here &nbsp;</b>
                                            <input
                                                id="point_sixteen_initial_here"
                                                name="point_sixteen_initial_here"
                                                type="text"
                                                className="form-control text-box border-b-2 border-[#0F2D52] rounded-none w-48 sm:w-54 md:w-[30%] inline-block focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-base"
                                                placeholder=" "
                                                defaultValue={initialFormData?.point_sixteen_initial_here || ''}
                                            />
                                        </span>
                                    </div>

                                    {/* Content section 16 */}
                                    <div className="content-section">
                                        <ol className="list-decimal pl-5" start="16">
                                            <li style={{ paddingLeft: "25px" }} className="pb-4 pt-4 font-medium text-justify">
                                                If your student has an allergy, asthma or a medical condition that requires medication, we are required to meet state licensing standards regarding the medication and paperwork. All paperwork MUST be complete prior to enrollment. This includes maintaining unexpired medications and paperwork while enrolled at The Goddard School.
                                            </li>
                                        </ol>
                                        <br className="my-2" /><br className="my-2" /><br className="my-2" />
                                        <span className="block mb-[50px] font-roboto text-right mr-2.5 initial-section" id="initial">
                                            <b className="text-base">Initial here &nbsp;</b>
                                            <input
                                                id="point_seventeen_initial_here"
                                                name="point_seventeen_initial_here"
                                                type="text"
                                                className="form-control text-box border-b-2 border-[#0F2D52] rounded-none w-48 sm:w-54 md:w-[30%] inline-block focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-base"
                                                placeholder=" "
                                                defaultValue={initialFormData?.point_seventeen_initial_here || ''}
                                            />
                                        </span>
                                    </div>

                                    {/* Content section 17 */}
                                    <div className="content-section">
                                        <ol className="list-decimal pl-5" start="17">
                                            <li style={{ paddingLeft: "25px" }} className="pb-4 pt-4 font-medium text-justify">
                                                Parents acknowledge and agree that representatives of the School’s franchisor, Goddard Systems, Inc. (“GSI”) will have access to information in children’s files as part of GSI’s Quality Assurance reviews and otherwise.
                                            </li>
                                        </ol>
                                        <br className="my-2" /><br className="my-2" />
                                        <span className="block mb-[50px] font-roboto text-right mr-2.5 initial-section" id="initial">
                                            <b className="text-base">Initial here &nbsp;</b>
                                            <input
                                                id="point_eighteen_initial_here"
                                                name="point_eighteen_initial_here"
                                                type="text"
                                                className="form-control text-box border-b-2 border-[#0F2D52] rounded-none w-48 sm:w-54 md:w-[30%] inline-block focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-base"
                                                placeholder=" "
                                                defaultValue={initialFormData?.point_eighteen_initial_here || ''}
                                            />
                                        </span>
                                    </div>

                                    {/* Content section 18 */}
                                    <div className="content-section">
                                        <ol className="list-decimal pl-5" start="18">
                                            <li style={{ paddingLeft: "25px" }} className="pb-4 pt-4 font-medium text-justify">
                                                The School’s employees are its most important assets. If Parents hire an employee of the School or a former employee (within 6 months of his/her employment at the School) for at least 20 hours per week, Parents agree to pay the School a placement fee of $10,000, payable upon hiring.
                                            </li>
                                        </ol>
                                        <br className="my-2" /><br className="my-2" /><br className="my-2" />
                                        <span className="block mb-[50px] font-roboto text-right mr-2.5 initial-section" id="initial">
                                            <b className="text-base">Initial here &nbsp;</b>
                                            <input
                                                id="point_ninteen_initial_here"
                                                name="point_ninteen_initial_here"
                                                type="text"
                                                className="form-control text-box border-b-2 border-[#0F2D52] rounded-none w-48 sm:w-54 md:w-[30%] inline-block focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-base"
                                                placeholder=" "
                                                defaultValue={initialFormData?.point_ninteen_initial_here || ''}
                                            />
                                        </span>
                                    </div>

                                    {/* Content section 19 */}
                                    <div className="content-section">
                                        <ol className="list-decimal pl-5" start="19">
                                            <li style={{ paddingLeft: "25px" }} className="pb-4 pt-4 font-medium text-justify">
                                                Parents agree that Outside Engagements are not for the benefit or convenience of the School, its owners or GSI, and Parents hereby irrevocably release and discharge the School, GSI, and their respective present or former owners, employees, officers, directors, agents, parents, subsidiaries, affiliates, heirs, successors and assigns, in their individual and corporate capacities from all claims, demands, liabilities, actions or causes of action whatsoever, arising in law or equity, whether known or unknown, which Parents have, may have or claim to have at any time in the future against the Releases based in whole or in part on, arising out of or related to any Outside Engagements.
                                            </li>
                                        </ol>
                                    </div>

                                    {/* Final Agreement and Signatures */}
                                    <div className="content-section">
                                        <p className="font-medium pl-5 pr-5 text-justify text-base">
                                            The undersigned Parents have received an executed copy of this Agreement and a copy of the Parent Handbook, which includes the school policies and health policy referenced in paragraph 14 and 15. Parents acknowledge that this Agreement is by and between Parents and Cool Kidz LLC d/b/a The Goddard School; GSI is not a party to this Agreement. The undersigned Parents understand the terms of this Agreement and agree to be bound by them.
                                        </p>
                                        <div className="flex flex-wrap mt-5 pl-0 sm:pl-5 mx-2">
                                            <div className="w-1/2 px-2 mb-4">
                                                <div className="mb-4">
                                                    <label htmlFor="child_first_name" className="block text-base font-bold mb-1">
                                                        Child’s Name
                                                    </label>
                                                    <input type="text" className="w-full border-b-2 border-[#0F2D52] rounded-none focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] p-2 text-base" id="child_first_name" name="child_first_name" defaultValue={initialFormData?.child_first_name || ''} />
                                                </div>
                                            </div>
                                            <div className="w-1/2 px-2 mb-4">
                                                <div className="mb-4">
                                                    <label htmlFor="dob" className="block text-base font-bold mb-1">
                                                        Date of Birth
                                                    </label>
                                                    <input type="date" className="w-full border-b-2 border-[#0F2D52] rounded-none focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] p-2 text-base" id="dob" name="dob" defaultValue={initialFormData?.dob || ''} />
                                                </div>
                                            </div>
                                            <div className="w-1/2 px-2 mb-4">
                                                <div className="mb-4">
                                                    <label htmlFor="preferred_start_date" className="block text-base font-bold mb-1">
                                                        Preferred Start Date
                                                    </label>
                                                    <input type="date" className="w-full border-b-2 border-[#0F2D52] rounded-none focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] p-2 text-base" id="preferred_start_date" name="preferred_start_date" defaultValue={initialFormData?.preferred_start_date || ''} />
                                                </div>
                                            </div>
                                            <div className="w-1/2 px-2 mb-4">
                                                <div className="mb-4">
                                                    <label htmlFor="primary_parent_email" className="block text-base font-bold mb-1">
                                                        Email
                                                    </label>
                                                    <input type="email" className="w-full border-b-2 border-[#0F2D52] rounded-none focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] p-2 text-base" id="primary_parent_email" name="primary_parent_email" defaultValue={initialFormData?.primary_parent_email || ''} />
                                                </div>
                                            </div>
                                            <div className="w-1/2 px-2 mb-4">
                                                <div className="mb-4">
                                                    <label htmlFor="preferred_home_addr" className="block text-base font-bold mb-1">
                                                        Home Address
                                                    </label>
                                                    <input type="text" className="w-full border-b-2 border-[#0F2D52] rounded-none focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] p-2 text-base" id="preferred_home_addr" name="preferred_home_addr" defaultValue={initialFormData?.preferred_home_addr || ''} />
                                                </div>
                                            </div>
                                        </div>
                                        <br />
                                        <h4 className="text-center mb-2 text-xl font-bold">Parent Agreement</h4>
                                        <div className="flex flex-wrap mx-2">
                                            <div className="w-1/2 px-2 mb-4">
                                                <div className="mb-4">
                                                    <label htmlFor="parent_sign_enroll" className="block text-base font-bold mb-1">
                                                        Parent Signature
                                                    </label>
                                                    <input type="text" className="w-full border-b-2 border-[#0F2D52] rounded-none focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] p-2 text-base" id="parent_sign_enroll" name="parent_sign_enroll" defaultValue={initialFormData?.parent_sign_enroll || ''} />
                                                </div>
                                            </div>
                                            <div className="w-1/2 px-2 mb-4">
                                                <div className="mb-4">
                                                    <label htmlFor="parent_sign_date_enroll" className="block text-base font-bold mb-1">
                                                        Date
                                                    </label>
                                                    <input type="date" className="w-full border-b-2 border-[#0F2D52] rounded-none focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] p-2 text-base" id="parent_sign_date_enroll" name="parent_sign_date_enroll" defaultValue={initialFormData?.parent_sign_date_enroll || ''} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default EnrollmentAgreementForm;