import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import logo from "/image/gs_logo_branch.png";
import '../../css/all_forms.css'

const ParentHandbook = forwardRef((props, ref) => {
    const loadScript = (src) => {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    };

    const handleGeneratePdf = useCallback(async () => {
        // setLoadingPdf(true);
        // setPdfError(null);

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
            const content = document.getElementById("parent-handbook-content");

            if (!content) {
                console.error('Error: The element with ID "parent-handbook-content" was not found.');
                // setPdfError('Failed to capture form content for PDF. Element not found.');
                return;
            }

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
                input.style.borderColor = ' #000';
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


            pdf.save('ParentHandbook.pdf');



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
        generatePdf: handleGeneratePdf
    }));

    return (
        // <div className="bg-white mx-auto text-[#0f2d52] text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[18px] p-4 sm:p-6 md:p-8 lg:p-10 text-black">

        //     <div id="enrollment-content">
        //         <div className="mb-8 ">
        //             <div className=" border-[#0F2D52]">
        //                 <div className="w-full border-b-2 border-[#0f2d52]">
        //                     <div className="flex flex-col sm:flex-row w-full h-auto sm:h-[180px]">
        //                         <div className="w-full sm:w-[50%] flex items-center justify-center bg-white border-b-2 sm:border-b-0 sm:border-r-2 border-[#0f2d52] p-4 sm:p-4">
        //                             <img
        //                                 src={logo}
        //                                 alt="Goddard Logo"
        //                                 className="h-20 sm:h-24 md:h-28 object-contain"
        //                             />
        //                         </div>

        //                         {/* Right Side: Title */}
        //                         <div className="w-full sm:w-[50%] bg-[#0f2d52] flex items-center justify-center p-4">
        //                             <span className="text-white text-xl sm:text-xl md:text-2xl font-bold tracking-wide text-center">
        //                                 Enrollment Agreement
        //                             </span>
        //                         </div>
        //                     </div>
        //                 </div>

        //                 <div className="p-2 sm:p-4 md:p-6">
        //                     <form id="formContent">
        //                         <div className="mx-1 mb-4">
        //                             <div className="container mx-auto p-0 text-sm sm:text-base">
        //                                 <ol className="list-decimal pt-5 sm:pt-10">
        //                                     <li style={{ paddingLeft: "25px" }} className="pb-2 sm:pb-4 pt-2 sm:pt-4 font-medium text-justify">
        //                                         This Enrollment Agreement (the “Agreement”), effective (today’s date)
        //                                         <input
        //                                             id="point_one_field_one"
        //                                             name="point_one_field_one"
        //                                             type="text"
        //                                             className="form-control text-box border-b-2 max-w-[150px] border-[#0F2D52] rounded-none w-full md:w-[30%] inline-block focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-sm sm:text-base"
        //                                         />{' '}
        //                                         is between Cool Kidz LLC dba The Goddard School, an independent franchisee operating The Goddard School® located at 4200 228th Ave NE, Redmond, WA pursuant to a license from Goddard Systems, Inc., and
        //                                         <input
        //                                             id="point_one_field_three"
        //                                             name="point_one_field_three"
        //                                             type="text"
        //                                             className="form-control text-box border-b-2 border-[#0F2D52] rounded-none w-full md:w-[30%] inline-block focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-sm sm:text-base"
        //                                         />{' '}
        //                                         (“Parents”).
        //                                     </li>
        //                                 </ol>
        //                                 <br className="my-2" /><br className="my-2" /><br className="my-2" />
        //                                 <span className="block mb-6 sm:mb-[50px] font-roboto text-right mr-2.5" id="initial">
        //                                     <b className="text-sm sm:text-[15px] md:text-base">Initial here &nbsp;</b>
        //                                     <input
        //                                         id="point_two_initial_here"
        //                                         name="point_two_initial_here"
        //                                         type="text"
        //                                         className="form-control text-box border-b-2 border-[#0F2D52] relative top-[10px] rounded-none w-48 sm:w-54 md:w-[30%] inline-block text-transparent caret-transparent placeholder-transparent focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-sm sm:text-base"
        //                                         placeholder="."
        //                                     />
        //                                 </span>

        //                                 <ol className="list-decimal pl-5" start="2">
        //                                     <li style={{ paddingLeft: "25px" }} className="pb-2 sm:pb-4 pt-2 sm:pt-4 font-medium text-justify">
        //                                         The School’s non-refundable registration fee of $300 shall be paid annually in March and at the time of initial application. The fee is $300 for each child.
        //                                     </li>
        //                                 </ol>
        //                                 <br className="my-2" /><br className="my-2" /><br className="my-2" />
        //                                 <span className="block mb-6 sm:mb-[50px] font-roboto text-right mr-2.5" id="initial">
        //                                     <b className="text-sm sm:text-[15px] md:text-base">Initial here &nbsp;</b>
        //                                     <input
        //                                         id="point_three_initial_here"
        //                                         name="point_three_initial_here"
        //                                         type="text"
        //                                         className="form-control text-box border-b-2 border-[#0F2D52] relative top-[10px] rounded-none w-48 sm:w-54 md:w-[30%] inline-block text-transparent caret-transparent placeholder-transparent focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-sm sm:text-base"
        //                                         placeholder="."
        //                                     />
        //                                 </span>
        //                                 <ol className="list-decimal pl-5" start="3">
        //                                     <li style={{ paddingLeft: "25px" }} className="pb-2 sm:pb-4 pt-2 sm:pt-4 font-medium text-justify">
        //                                         New Family Enrollment - One full month tuition and non-refundable registration fee are due at time of enrollment, along with this signed agreement. If the deposit is not paid, a place for your child cannot be guaranteed. The first month’s tuition is 100% refundable 90 days before the Goddard approved start date and non-refundable thereafter.
        //                                     </li>
        //                                 </ol>
        //                                 <br className="my-2" /><br className="my-2" /><br className="my-2" />
        //                                 <span className="block mb-6 sm:mb-[50px] font-roboto text-right mr-2.5" id="initial">
        //                                     <b className="text-sm sm:text-[15px] md:text-base">Initial here &nbsp;</b>
        //                                     <input
        //                                         id="point_four_initial_here"
        //                                         name="point_four_initial_here"
        //                                         type="text"
        //                                         className="form-control text-box border-b-2 border-[#0F2D52] relative top-[10px] rounded-none w-48 sm:w-54 md:w-[30%] inline-block text-transparent caret-transparent placeholder-transparent focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-sm sm:text-base"
        //                                         placeholder="."
        //                                     />
        //                                 </span>
        //                                 <ol className="list-decimal pl-5" start="4">
        //                                     <li style={{ paddingLeft: "25px" }} className="pb-2 sm:pb-4 pt-2 sm:pt-4 font-medium text-justify">
        //                                         Wait-listed Families - For being on our waitlist only the Registration fee is necessary, and it is fully refundable if we are unable to provide you with classroom placement for your desired start date.
        //                                     </li>
        //                                 </ol>
        //                                 <br className="my-2" /><br className="my-2" /><br className="my-2" />
        //                                 <span className="block mb-6 sm:mb-[50px] font-roboto text-right mr-2.5" id="initial">
        //                                     <b className="text-sm sm:text-[15px] md:text-base">Initial here &nbsp;</b>
        //                                     <input
        //                                         id="point_five_initial_here"
        //                                         name="point_five_initial_here"
        //                                         type="text"
        //                                         className="form-control text-box border-b-2 border-[#0F2D52] relative top-[10px] rounded-none w-48 sm:w-54 md:w-[30%] inline-block text-transparent caret-transparent placeholder-transparent focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-sm sm:text-base"
        //                                         placeholder="."
        //                                     />
        //                                 </span>
        //                                 <ol className="list-decimal pl-5" start="5">
        //                                     <li style={{ paddingLeft: "25px" }} className="pb-2 sm:pb-4 pt-2 sm:pt-4 font-medium text-justify">
        //                                         Monthly tuition is due on or before the 1<sup>st</sup> of each month. A $50 late fee shall be charged for any monthly tuition payments received after the 1st of the month. A fee of $75 will be charged for checks returned by the school's bank. If monthly tuition fees (including any applicable late fees) are not received at the School by the 15th of the month, the child will not be readmitted to the program. If the School is compelled to take legal action for tuition payments, Parents agree to pay the School’s reasonable attorneys’ fees and costs incurred.
        //                                     </li>
        //                                 </ol>
        //                                 <br className="my-2" /><br className="my-2" /><br className="my-2" />
        //                                 <span className="block mb-6 sm:mb-[50px] font-roboto text-right mr-2.5" id="initial">
        //                                     <b className="text-sm sm:text-[15px] md:text-base">Initial here &nbsp;</b>
        //                                     <input
        //                                         id="point_six_initial_here"
        //                                         name="point_six_initial_here"
        //                                         type="text"
        //                                         className="form-control text-box border-b-2 border-[#0F2D52] relative top-[10px] rounded-none w-48 sm:w-54 md:w-[30%] inline-block text-transparent caret-transparent placeholder-transparent focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-sm sm:text-base"
        //                                         placeholder="."
        //                                     />
        //                                 </span>
        //                                 <ol className="list-decimal pl-5" start="6">
        //                                     <li style={{ paddingLeft: "25px" }} className="pb-2 sm:pb-4 pt-2 sm:pt-4 font-medium text-justify">
        //                                         At the time of registration, tuition is quoted for the current rate of the classroom. Tuition is subject to change at the discretion of the school. You will receive notification of any proposed change.
        //                                     </li>
        //                                 </ol>
        //                                 <br className="my-2" /><br className="my-2" /><br className="my-2" />
        //                                 <span className="block mb-6 sm:mb-[50px] font-roboto text-right mr-2.5" id="initial">
        //                                     <b className="text-sm sm:text-[15px] md:text-base">Initial here &nbsp;</b>
        //                                     <input
        //                                         id="point_seven_initial_here"
        //                                         name="point_seven_initial_here"
        //                                         type="text"
        //                                         className="form-control text-box border-b-2 border-[#0F2D52] relative top-[10px] rounded-none w-48 sm:w-54 md:w-[30%] inline-block text-transparent caret-transparent placeholder-transparent focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-sm sm:text-base"
        //                                         placeholder="."
        //                                     />
        //                                 </span>
        //                                 <ol className="list-decimal pl-5" start="7">
        //                                     <li style={{ paddingLeft: "25px" }} className="pb-2 sm:pb-4 pt-2 sm:pt-4 font-medium text-justify">
        //                                         Monthly tuition fees are non-refundable regardless of holidays, illness, vacation, inclement weather days or School closures resulting from causes beyond the reasonable control of the School or its management including, but not limited to pandemics, government order, public health crisis, fire, floods, civil commotions, strikes, lockouts or other labor disturbances, “Acts of God” or acts, omissions, or delays in acting by any governmental authority. The School and its management will use reasonable efforts to avoid unscheduled closures and will resume operation as soon as feasible. The School will make reasonable efforts to open in inclement weather; however, the School may choose to close at the discretion of the School’s owner. Parents will be notified of any school closures via electronic communication.
        //                                     </li>
        //                                 </ol>
        //                                 <br className="my-2" /><br className="my-2" />
        //                                 <span className="block mb-6 sm:mb-[50px] font-roboto text-right mr-2.5" id="initial">
        //                                     <b className="text-sm sm:text-[15px] md:text-base">Initial here &nbsp;</b>
        //                                     <input
        //                                         id="point_eight_initial_here"
        //                                         name="point_eight_initial_here"
        //                                         type="text"
        //                                         className="form-control text-box border-b-2 border-[#0F2D52] relative top-[10px] rounded-none w-48 sm:w-54 md:w-[30%] inline-block text-transparent caret-transparent placeholder-transparent focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-sm sm:text-base"
        //                                         placeholder="."
        //                                     />
        //                                 </span>

        //                                 <ol className="list-decimal pl-5" start="8">
        //                                     <li style={{ paddingLeft: "25px" }} className="pb-2 sm:pb-4 pt-2 sm:pt-4 font-medium text-justify">This School is closed on the following days:</li>
        //                                 </ol>
        //                                 {/* Adjusted Table Section for better responsiveness at 886px */}
        //                                 <div className="flex flex-col md:flex-row pt-5 px-0 sm:px-4 justify-around"> {/* Added justify-around */}
        //                                     <div className="w-full md:w-1/2 lg:w-[48%] p-0 md:pr-2 lg:pr-4 overflow-x-auto mb-4 md:mb-0"> {/* Adjusted widths and padding */}
        //                                         <table className="w-full border-collapse min-w-[320px] md:min-w-0"> {/* Min-width for small screens */}
        //                                             <thead>
        //                                                 <tr>
        //                                                     <th className="text-left py-2 text-sm sm:text-base w-1/3">Leave Dates</th> {/* Set explicit width */}
        //                                                     <th className="text-left py-2 text-sm sm:text-base w-2/3">Leave Reasons</th> {/* Set explicit width */}
        //                                                 </tr>
        //                                             </thead>
        //                                             <tbody>
        //                                                 {holidayData2025.map((holiday, index) => (
        //                                                     <tr key={index}>
        //                                                         <td className="text-left p-2 text-xs sm:text-sm">{holiday.date}</td>
        //                                                         <td className="text-left p-2 text-xs sm:text-sm">{holiday.reason}</td>
        //                                                     </tr>
        //                                                 ))}
        //                                             </tbody>
        //                                         </table>
        //                                     </div>

        //                                     <div className="w-full md:w-1/2 lg:w-[48%] p-0 md:pl-2 lg:pl-4 mt-4 md:mt-0 overflow-x-auto"> {/* Adjusted widths and padding */}
        //                                         <table className="w-full border-collapse min-w-[320px] md:min-w-0"> {/* Min-width for small screens */}
        //                                             <thead>
        //                                                 <tr>
        //                                                     <th className="text-left py-2 text-sm sm:text-base w-1/3">Leave Dates</th> {/* Set explicit width */}
        //                                                     <th className="text-left py-2 text-sm sm:text-base w-2/3">Leave Reasons</th> {/* Set explicit width */}
        //                                                 </tr>
        //                                             </thead>
        //                                             <tbody>
        //                                                 {holidayData2026.map((holiday, index) => (
        //                                                     <tr key={index}>
        //                                                         <td className="text-left p-2 text-xs sm:text-sm">{holiday.date}</td>
        //                                                         <td className="text-left p-2 text-xs sm:text-sm">{holiday.reason}</td>
        //                                                     </tr>
        //                                                 ))}
        //                                             </tbody>
        //                                         </table>
        //                                     </div>
        //                                 </div>

        //                                 <p style={{ paddingLeft: "23px" }} className="font-medium text-justify text-sm sm:text-base mt-4">
        //                                     *We reserve the right to adjust hours and closures depending on the needs of the school. We will provide at least 24 hours’notice of changes, should anything be necessary.
        //                                 </p>
        //                                 <br className="my-2" /><br className="my-2" /><br className="my-2" />
        //                                 <span className="block mb-6 sm:mb-[50px] font-roboto text-right mr-2.5" id="initial">
        //                                     <b className="text-sm sm:text-[15px] md:text-base">Initial here &nbsp;</b>
        //                                     <input
        //                                         id="point_nine_initial_here"
        //                                         name="point_nine_initial_here"
        //                                         type="text"
        //                                         className="form-control text-box border-b-2 border-[#0F2D52] relative top-[10px] rounded-none w-48 sm:w-54 md:w-[30%] inline-block text-transparent caret-transparent placeholder-transparent focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-sm sm:text-base"
        //                                         placeholder="."
        //                                     />
        //                                 </span>
        //                             </div>
        //                         </div>
        //                     </form>
        //                 </div>
        //             </div>
        //         </div>

        //         {/* Page 2 */}
        //         <div className="pages mt-8"> {/* Added margin-top for separation */}
        //             <div className=" border-[#0F2D52]"> {/* Keep this for screen display */}
        //                 <div className="w-full border-b-2 border-[#0f2d52]">
        //                     <div className="flex flex-col sm:flex-row w-full h-auto sm:h-[180px]">
        //                         {/* Left Side: Logo */}
        //                         <div className="w-full sm:w-[50%] flex items-center justify-center bg-white border-b-2 sm:border-b-0 sm:border-r-2 border-[#0f2d52] p-4">
        //                             <img
        //                                 src={logo}
        //                                 alt="Goddard Logo"
        //                                 className="h-20 sm:h-24 md:h-28 object-contain"
        //                             />
        //                         </div>

        //                         {/* Right Side: Title */}
        //                         <div className="w-full sm:w-[50%] bg-[#0f2d52] flex items-center justify-center p-4">
        //                             <span className="text-white text-xl sm:text-xl md:text-2xl font-bold tracking-wide text-center">
        //                                 Enrollment Agreement
        //                             </span>
        //                         </div>
        //                     </div>
        //                 </div>
        //                 <div className="p-3 sm:p-5">
        //                     <div className="mx-1 mb-4">
        //                         <div className="container mx-auto p-0 text-sm sm:text-base">
        //                             <ol className="list-decimal pl-5 pt-5 sm:pt-10" start="9">
        //                                 <li style={{ paddingLeft: "25px" }} className="pb-2 sm:pb-4 pt-2 sm:pt-4 font-medium text-justify">
        //                                     The Goddard School is a year-round program. Tuition is payable for all 12 months unless withdrawing from enrollment.
        //                                 </li>
        //                             </ol>

        //                             <span className="block mb-6 sm:mb-[50px] font-roboto pt-5 sm:pt-10 text-right mr-2.5" id="initial">
        //                                 <b className="text-sm sm:text-[15px] md:text-base">Initial here &nbsp;</b>
        //                                 <input
        //                                     id="point_ten_initial_here"
        //                                     name="point_ten_initial_here"
        //                                     type="text"
        //                                     className="form-control text-box border-b-2 border-[#0F2D52] relative top-[10px] rounded-none w-48 sm:w-54 md:w-[30%] inline-block text-transparent caret-transparent placeholder-transparent focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-sm sm:text-base"
        //                                     placeholder="."
        //                                 />
        //                             </span>
        //                             <ol className="list-decimal pl-5" start="10">
        //                                 <li style={{ paddingLeft: "25px" }} className="pb-2 sm:pb-4 pt-2 sm:pt-4 font-medium text-justify">
        //                                     The School will open at 7:00am and close at 6:00pm (from September), however modified school hours may apply in case of any unforeseen circumstances. A fee will be charged for any child not picked up before the School’s regular closing time. Full day student late fees begin at 6:01pm. Half Day student late fees begin at 12:46pm. This charge shall be $35 per child for the first 5 minutes and an additional $25 per child per 5-minute period thereafter. Fees for late pick-up are added to tuition; if not paid, the child will not be readmitted to the program. Consistent lateness will be cause for the child’s dismissal from the School. Arrival time at school should be no later than 10am without prior approval or notification.
        //                                 </li>
        //                             </ol>
        //                             <br className="my-2" /><br className="my-2" />
        //                             <span className="block mb-6 sm:mb-[50px] font-roboto text-right mr-2.5" id="initial">
        //                                 <b className="text-sm sm:text-[15px] md:text-base">Initial here &nbsp;</b>
        //                                 <input
        //                                     id="point_eleven_initial_here"
        //                                     name="point_eleven_initial_here"
        //                                     type="text"
        //                                     className="form-control text-box border-b-2 border-[#0F2D52] relative top-[10px] rounded-none w-48 sm:w-54 md:w-[30%] inline-block text-transparent caret-transparent placeholder-transparent focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-sm sm:text-base"
        //                                     placeholder="."
        //                                 />
        //                             </span>
        //                             <ol className="list-decimal pl-5" start="11">
        //                                 <li style={{ paddingLeft: "25px" }} className="pb-2 sm:pb-4 pt-2 sm:pt-4 font-medium text-justify">
        //                                     Our School limits each students day to a maximum of 10 hours. If this 10-hour limit is exceeded a fee of $50 will be charged.
        //                                 </li>
        //                             </ol>
        //                             <br className="my-2" /><br className="my-2" />
        //                             <span className="block mb-6 sm:mb-[50px] font-roboto text-right mr-2.5" id="initial">
        //                                 <b className="text-sm sm:text-[15px] md:text-base">Initial here &nbsp;</b>
        //                                 <input
        //                                     id="point_twelven_initial_here"
        //                                     name="point_twelven_initial_here"
        //                                     type="text"
        //                                     className="form-control text-box border-b-2 border-[#0F2D52] relative top-[10px] rounded-none w-48 sm:w-54 md:w-[30%] inline-block text-transparent caret-transparent placeholder-transparent focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-sm sm:text-base"
        //                                     placeholder="."
        //                                 />
        //                             </span>
        //                             <ol className="list-decimal pl-5" start="12">
        //                                 <li style={{ paddingLeft: "25px" }} className="pb-2 sm:pb-4 pt-2 sm:pt-4 font-medium text-justify">
        //                                     For children over the age of one year, the School requires a minimum of 30-day written notice of withdrawal, and for infants, a minimum of 60-day written notice. Furthermore, the last day must be the end of the month. If no advance notice of withdrawal is provided, the regular tuition fee for that term will be charged.
        //                                 </li>
        //                             </ol>
        //                             <br className="my-2" /><br className="my-2" />
        //                             <span className="block mb-6 sm:mb-[50px] font-roboto text-right mr-2.5" id="initial">
        //                                 <b className="text-sm sm:text-[15px] md:text-base">Initial here &nbsp;</b>
        //                                 <input
        //                                     id="point_thirteen_initial_here"
        //                                     name="point_thirteen_initial_here"
        //                                     type="text"
        //                                     className="form-control text-box border-b-2 border-[#0F2D52] relative top-[10px] rounded-none w-48 sm:w-54 md:w-[30%] inline-block text-transparent caret-transparent placeholder-transparent focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-sm sm:text-base"
        //                                     placeholder="."
        //                                 />
        //                             </span>
        //                             <ol className="list-decimal pl-5" start="13">
        //                                 <li style={{ paddingLeft: "25px" }} className="pb-2 sm:pb-4 pt-2 sm:pt-4 font-medium text-justify">
        //                                     The School reserves the right to deny, cancel, sever, or suspend a child’s enrollment at any time if the School, in its sole discretion, deems such action to be in the best interest of the child or the School. This should be recorded in an email and in such an event, any unused tuition will be refunded, and no notice period required.
        //                                 </li>
        //                             </ol>
        //                             <br className="my-2" /><br className="my-2" />
        //                             <span className="block mb-6 sm:mb-[50px] font-roboto text-right mr-2.5" id="initial">
        //                                 <b className="text-sm sm:text-[15px] md:text-base">Initial here &nbsp;</b>
        //                                 <input
        //                                     id="point_fourteen_initial_here"
        //                                     name="point_fourteen_initial_here"
        //                                     type="text"
        //                                     className="form-control text-box border-b-2 border-[#0F2D52] relative top-[10px] rounded-none w-48 sm:w-54 md:w-[30%] inline-block text-transparent caret-transparent placeholder-transparent focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-sm sm:text-base"
        //                                     placeholder="."
        //                                 />
        //                             </span>
        //                             <ol className="list-decimal pl-5" start="14">
        //                                 <li style={{ paddingLeft: "25px" }} className="pb-2 sm:pb-4 pt-2 sm:pt-4 font-medium text-justify">
        //                                     Children may not attend School while ill. Children who become ill at school must be picked up immediately – refer to the Parent Handbook health policy and King County Department of Health requirements. If the child will be absent, the absence should be reported to the School by 9 am.
        //                                 </li>
        //                             </ol>
        //                             <br className="my-2" /><br className="my-2" />
        //                             <span className="block mb-6 sm:mb-[50px] font-roboto text-right mr-2.5" id="initial">
        //                                 <b className="text-sm sm:text-[15px] md:text-base">Initial here &nbsp;</b>
        //                                 <input
        //                                     id="point_fifteen_initial_here"
        //                                     name="point_fifteen_initial_here"
        //                                     type="text"
        //                                     className="form-control text-box border-b-2 border-[#0F2D52] relative top-[10px] rounded-none w-48 sm:w-54 md:w-[30%] inline-block text-transparent caret-transparent placeholder-transparent focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-sm sm:text-base"
        //                                     placeholder="."
        //                                 />
        //                             </span><br />
        //                             <ol className="list-decimal pl-5" start="15">
        //                                 <li style={{ paddingLeft: "25px" }} className="pb-2 sm:pb-4 pt-2 sm:pt-4 font-medium text-justify">
        //                                     Each child in our childcare facility will be required to have current and up to date immunizations throughout their time in our facility.
        //                                 </li>
        //                             </ol>
        //                             <br className="my-2" /><br className="my-2" /><br className="my-2" />
        //                             <span className="block mb-6 sm:mb-[50px] font-roboto text-right mr-2.5" id="initial">
        //                                 <b className="text-sm sm:text-[15px] md:text-base">Initial here &nbsp;</b>
        //                                 <input
        //                                     id="point_sixteen_initial_here"
        //                                     name="point_sixteen_initial_here"
        //                                     type="text"
        //                                     className="form-control text-box border-b-2 border-[#0F2D52] relative top-[10px] rounded-none w-48 sm:w-54 md:w-[30%] inline-block text-transparent caret-transparent placeholder-transparent focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-sm sm:text-base"
        //                                     placeholder="."
        //                                 />
        //                             </span>
        //                             <ol className="list-decimal pl-5" start="16">
        //                                 <li style={{ paddingLeft: "25px" }} className="pb-2 sm:pb-4 pt-2 sm:pt-4 font-medium text-justify">
        //                                     If your student has an allergy, asthma or a medical condition that requires medication, we are required to meet state licensing standards regarding the medication and paperwork. All paperwork MUST be complete prior to enrollment. This includes maintaining unexpired medications and paperwork while enrolled at The Goddard School.
        //                                 </li>
        //                             </ol>
        //                             <br className="my-2" /><br className="my-2" /><br className="my-2" />
        //                             <span className="block mb-6 sm:mb-[50px] font-roboto text-right mr-2.5" id="initial">
        //                                 <b className="text-sm sm:text-[15px] md:text-base">Initial here &nbsp;</b>
        //                                 <input
        //                                     id="point_seventeen_initial_here"
        //                                     name="point_seventeen_initial_here"
        //                                     type="text"
        //                                     className="form-control text-box border-b-2 border-[#0F2D52] relative top-[10px] rounded-none w-48 sm:w-54 md:w-[30%] inline-block text-transparent caret-transparent placeholder-transparent focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-sm sm:text-base"
        //                                     placeholder="."
        //                                 />
        //                             </span>
        //                             <ol className="list-decimal pl-5" start="17">
        //                                 <li style={{ paddingLeft: "25px" }} className="pb-2 sm:pb-4 pt-2 sm:pt-4 font-medium text-justify">
        //                                     Parents acknowledge and agree that representatives of the School’s franchisor, Goddard Systems, Inc. (“GSI”) will have access to information in children’s files as part of GSI’s Quality Assurance reviews and otherwise.
        //                                 </li>
        //                             </ol>
        //                             <br className="my-2" /><br className="my-2" />
        //                             <span className="block mb-6 sm:mb-[50px] font-roboto text-right mr-2.5" id="initial">
        //                                 <b className="text-sm sm:text-[15px] md:text-base">Initial here &nbsp;</b>
        //                                 <input
        //                                     id="point_eighteen_initial_here"
        //                                     name="point_eighteen_initial_here"
        //                                     type="text"
        //                                     className="form-control text-box border-b-2 border-[#0F2D52] relative top-[10px] rounded-none w-48 sm:w-54 md:w-[30%] inline-block text-transparent caret-transparent placeholder-transparent focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-sm sm:text-base"
        //                                     placeholder="."
        //                                 />
        //                             </span>
        //                             <ol className="list-decimal pl-5" start="18">
        //                                 <li style={{ paddingLeft: "25px" }} className="pb-2 sm:pb-4 pt-2 sm:pt-4 font-medium text-justify">
        //                                     The School’s employees are its most important assets. If Parents hire an employee of the School or a former employee (within 6 months of his/her employment at the School) for at least 20 hours per week, Parents agree to pay the School a placement fee of $10,000, payable upon hiring.
        //                                 </li>
        //                             </ol>
        //                             <br className="my-2" /><br className="my-2" /><br className="my-2" />
        //                             <span className="block mb-6 sm:mb-[50px] font-roboto text-right mr-2.5" id="initial">
        //                                 <b className="text-sm sm:text-[15px] md:text-base">Initial here &nbsp;</b>
        //                                 <input
        //                                     id="point_ninteen_initial_here"
        //                                     name="point_ninteen_initial_here"
        //                                     type="text"
        //                                     className="form-control text-box border-b-2 border-[#0F2D52] relative top-[10px] rounded-none w-48 sm:w-54 md:w-[30%] inline-block text-transparent caret-transparent placeholder-transparent focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] text-sm sm:text-base"
        //                                     placeholder="."
        //                                 />
        //                             </span>
        //                             <ol className="list-decimal pl-5" start="19">
        //                                 <li style={{ paddingLeft: "25px" }} className="pb-2 sm:pb-4 pt-2 sm:pt-4 font-medium text-justify">
        //                                     Parents agree that Outside Engagements are not for the benefit or convenience of the School, its owners or GSI, and Parents hereby irrevocably release and discharge the School, GSI, and their respective present or former owners, employees, officers, directors, agents, parents, subsidiaries, affiliates, heirs, successors and assigns, in their individual and corporate capacities from all claims, demands, liabilities, actions or causes of action whatsoever, arising in law or equity, whether known or unknown, which Parents have, may have or claim to have at any time in the future against the Releases based in whole or in part on, arising out of or related to any Outside Engagements.
        //                                 </li>
        //                             </ol>
        //                             <br className="my-2" />
        //                             <p className="font-medium pl-5 text-justify text-sm sm:text-base">
        //                                 The undersigned Parents have received an executed copy of this Agreement and a copy of the Parent Handbook, which includes the school policies and health policy referenced in paragraph 14 and 15. Parents acknowledge that this Agreement is by and between Parents and Cool Kidz LLC d/b/a The Goddard School; GSI is not a party to this Agreement. The undersigned Parents understand the terms of this Agreement and agree to be bound by them.
        //                             </p>
        //                             <div className="flex flex-wrap mt-5 pl-0 sm:pl-5 -mx-2">
        //                                 <div className="w-full sm:w-1/2 px-2 mb-4">
        //                                     <div className="mb-4">
        //                                         <label htmlFor="child_first_name" className="block text-sm sm:text-base font-bold mb-1">
        //                                             Child’s Name
        //                                         </label>
        //                                         <input type="text" className="w-full border-b-2 border-[#0F2D52] rounded-none focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] p-2 text-sm sm:text-base" id="child_first_name" name="child_first_name" />
        //                                     </div>
        //                                 </div>
        //                                 <div className="w-full sm:w-1/2 px-2 mb-4">
        //                                     <div className="mb-4">
        //                                         <label htmlFor="dob" className="block text-sm sm:text-base font-bold mb-1">
        //                                             Date of Birth
        //                                         </label>
        //                                         <input type="date" className="w-full border-b-2 border-[#0F2D52] rounded-none focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] p-2 text-sm sm:text-base" id="dob" name="dob" />
        //                                     </div>
        //                                 </div>
        //                                 <div className="w-full sm:w-1/2 px-2 mb-4">
        //                                     <div className="mb-4">
        //                                         <label htmlFor="preferred_start_date" className="block text-sm sm:text-base font-bold mb-1">
        //                                             Preferred Start Date
        //                                         </label>
        //                                         <input type="date" className="w-full border-b-2 border-[#0F2D52] rounded-none focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] p-2 text-sm sm:text-base" id="preferred_start_date" name="preferred_start_date" />
        //                                     </div>
        //                                 </div>
        //                             </div>
        //                         </div>
        //                     </div>
        //                 </div>
        //             </div>
        //             <br />
        //         </div>
        //         {/* Page 3 - (This was the last section of the HTML, repeated header) */}
        //         <div className="pages mt-8"> {/* Added margin-top for separation */}
        //             <div className=" border-[#0F2D52]">
        //                 <div className="w-full border-b-2 border-[#0f2d52]">
        //                     <div className="flex flex-col sm:flex-row w-full h-auto sm:h-[180px]">
        //                         {/* Left Side: Logo */}
        //                         <div className="w-full sm:w-[50%] flex items-center justify-center bg-white border-b-2 sm:border-b-0 sm:border-r-2 border-[#0f2d52] p-4">
        //                             <img
        //                                 src={logo}
        //                                 alt="Goddard Logo"
        //                                 className="h-20 sm:h-24 md:h-28 object-contain"
        //                             />
        //                         </div>

        //                         {/* Right Side: Title */}
        //                         <div className="w-full sm:w-[50%] bg-[#0f2d52] flex items-center justify-center p-4">
        //                             <span className="text-white text-xl sm:text-xl md:text-2xl font-bold tracking-wide text-center">
        //                                 Enrollment Agreement
        //                             </span>
        //                         </div>
        //                     </div>
        //                 </div>
        //                 <div className="p-3 sm:p-5">
        //                     <div className="flex flex-wrap -mx-2">
        //                         <div className="w-full sm:w-1/2 px-2 mb-4 flex items-center gap-2">
        //                             <input type="checkbox" className="custom-checkbox h-4 w-4 sm:h-5 sm:w-5 appearance-none bg-white  border-gray-700 rounded-md cursor-pointer outline-none transition-all duration-300 ease-in-out checked:bg-[#0F2D52] checked:border-[#0F2D52] checked:after:content-['✓'] checked:after:text-white checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:opacity-100 after:opacity-0 after:transition-opacity after:duration-1000 after:ease-in-out" id="full_day" name="full_day" />
        //                             <label className="text-sm sm:text-base" htmlFor="full_day">
        //                                 <span><b>Full-Day</b></span>
        //                             </label>
        //                             <input type="checkbox" className="custom-checkbox h-4 w-4 sm:h-5 sm:w-5 appearance-none bg-white  border-gray-700 rounded-md cursor-pointer outline-none transition-all duration-300 ease-in-out checked:bg-[#0F2D52] checked:border-[#0F2D52] checked:after:content-['✓'] checked:after:text-white checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:opacity-100 after:opacity-0 after:transition-opacity after:duration-1000 after:ease-in-out" id="half_day" name="half_day" />
        //                             <label className="text-sm sm:text-base" htmlFor="half_day">
        //                                 <span><b>Half-Day</b></span>
        //                             </label>
        //                         </div>
        //                         <div className="w-full sm:w-1/2 px-2 mb-4">
        //                             <div className="mb-4">
        //                                 <label htmlFor="preferred_schedule" className="block text-sm sm:text-base font-bold mb-1">
        //                                     Preferred Schedule
        //                                 </label>
        //                                 <input type="text" className="w-full border-b-2 border-[#0F2D52] rounded-none focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] p-2 text-sm sm:text-base" id="preferred_schedule" name="preferred_schedule" />
        //                             </div>
        //                         </div>
        //                         <div className="w-full sm:w-1/2 px-2 mb-4">
        //                             <div className="mb-4">
        //                                 <label htmlFor="primary_parent_email" className="block text-sm sm:text-base font-bold mb-1">
        //                                     Email
        //                                 </label>
        //                                 <input type="email" className="w-full border-b-2 border-[#0F2D52] rounded-none focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] p-2 text-sm sm:text-base" id="primary_parent_email" name="primary_parent_email" />
        //                             </div>
        //                         </div>
        //                         <div className="w-full sm:w-1/2 px-2 mb-4">
        //                             <div className="mb-4">
        //                                 <label htmlFor="preferred_home_addr" className="block text-sm sm:text-base font-bold mb-1">
        //                                     Home Address
        //                                 </label>
        //                                 <input type="text" className="w-full border-b-2 border-[#0F2D52] rounded-none focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] p-2 text-sm sm:text-base" id="preferred_home_addr" name="preferred_home_addr" />
        //                             </div>
        //                         </div>
        //                     </div>
        //                     <br />
        //                     <h4 className="text-center mb-2 text-lg sm:text-xl font-bold">Parent Agreement</h4>
        //                     <div className="flex flex-wrap -mx-2">
        //                         <div className="w-full sm:w-1/2 px-2 mb-4">
        //                             <div className="mb-4">
        //                                 <label htmlFor="parent_sign_enroll" className="block text-sm sm:text-base font-bold mb-1">
        //                                     Parent Signature
        //                                 </label>
        //                                 <input type="text" className="w-full border-b-2 border-[#0F2D52] rounded-none focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] p-2 text-sm sm:text-base" id="parent_sign_enroll" name="parent_sign_enroll" />
        //                             </div>
        //                         </div>
        //                         <div className="w-full sm:w-1/2 px-2 mb-4">
        //                             <div className="mb-4">
        //                                 <label htmlFor="parent_sign_date_enroll" className="block text-sm sm:text-base font-bold mb-1">
        //                                     Date
        //                                 </label>
        //                                 <input type="date" className="w-full border-b-2 border-[#0F2D52] rounded-none focus:outline-none focus:border-[#0F2D52] focus:shadow-[0_0_8px_rgba(15,45,82,0.6)] p-2 text-sm sm:text-base" id="parent_sign_date_enroll" name="parent_sign_date_enroll" /* onClick={() => dateValidation('parent_sign_date_enroll')} */ />
        //                             </div>
        //                         </div>
        //                     </div>
        //                 </div>
        //             </div>
        //         </div>
        //     </div>
        // </div>

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
                                                    className="max-h-[130px] max-w-full object-contain"
                                                />
                                            </div>
                                            {/* Right Side: Title */}
                                            <div className="w-[50%] bg-[#0f2d52] flex items-center justify-center">

                                                <h3 className="m-4 text-white">Parent Handbook</h3>

                                            </div>
                                        </div>
                                    </div>

                                    {/* Add more sections below if needed */}

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
                                                    className="max-h-[130px] max-w-full object-contain"
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
                                <i>*The term “parent” is used throughout to represent the primary
                                    individual(s) responsible for the child’s care.</i>
                            </div>
                            <div className="row m-1 mb-3">
                                <div className="form-group d-flex align-items-center gap-1">
                                    <input type="checkbox" className="input-checkbox custom-checkbox" id="welcome_goddard_agreement"
                                        name="welcome_goddard_agreement" />
                                    <label className="form-check-label" htmlFor="welcome_goddard_agreement">
                                        <span><b>I agree all the above information.</b></span>
                                    </label>
                                </div>
                            </div>
                            <div className="row m-1 mb-3">
                                <h5 className="text-center mb-3"><b>Mission Statement</b></h5>
                                <p>
                                    We are dedicated to giving children a love of learning in a safe and secure environment. Our
                                    teachers design and individualize their own lesson plans to help children learn and explore
                                    the
                                    world at their own pace.
                                </p>
                                <p>
                                    Our teachers are loving, nurturing, trained professionals committed to maintaining the
                                    highest
                                    quality in early childhood education. Through onsite training provided by the Director, as
                                    well as
                                    Goddard University, our teachers receive ongoing training in order to learn the latest
                                    developments within the field of Early Childhood Education.
                                </p>
                                <p>
                                    Our school is a safe, secure, clean, and happy environment for
                                    children to grow and learn. We will make the transition from
                                    home to school a positive experience.
                                </p>
                                <p>
                                    Each child is treated as a unique individual. Each child is given individual attention
                                    within a
                                    group allowing him/her to progress according to his/her own needs and rate of development.
                                </p>
                                <p>
                                    Communication with parents is the key. It is based upon being open, honest, and respectful -
                                    encouraging both involvement and support. Parents are informed daily of their child’s
                                    progress
                                    and development.
                                </p>
                                <p>
                                    We strive to provide the best in child care and development. We are committed to Goddard’s
                                    standards of excellence and are continually seeking to improve.
                                </p>
                            </div>
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
                                                    className="max-h-[130px] max-w-full object-contain"
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
                            <div className="row m-1 mb-5">
                                <p>
                                    Our number one priority is providing every child with a loving and caring atmosphere
                                    conducive
                                    to the development of self-esteem, confidence, creativity, and a love of learning.
                                </p>
                                <h5 className="text-center mb-5"><b>Children’s Bill of Rights</b></h5>
                                <p>
                                    We, the faculty, and staff of The Goddard School®, pledge to
                                    honor this Children’s Bill of Rights.
                                </p>
                                <p>
                                    Every child in our program has the right to be respected as an
                                    individual with concern for his or her own interests,
                                    challenges, talents, and pace of learning.
                                </p>
                                <br />
                                <p>
                                    Every child has the right to a calm, warm, loving, and nurturing
                                    environment where affection is freely given so that a child
                                    feels valued and secure and is thus able to develop
                                    self-confidence.
                                </p>
                                <p>
                                    Every child has the right to personal attention, a relaxed
                                    atmosphere, and freedom of choice in daily activities that can
                                    only be provided in a small group setting.
                                </p>
                                <p>
                                    Every child has the right to have all physical needs met,
                                    including the need for rest and relaxation throughout the day.
                                </p>
                                <p>
                                    Every child has the right to a clean, safe environment in which
                                    to spend their day.
                                </p>
                                <p>
                                    Every child has the right to experience a variety of activities
                                    throughout the day that help them develop a feeling of
                                    independence and confidence. These activities provide
                                    opportunities for creativity, exploration, and a lifelong love
                                    of learning.
                                </p>
                            </div>
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
                                                    className="max-h-[130px] max-w-full object-contain"
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
                            <h5 className="text-center mb-2"><b>General Information</b></h5>
                            <p>
                                The Goddard School® located in Lynnwood, WA is part of a
                                multi-state organization of specialized preschool centers founded
                                in 1984. We are licensed by the State of Washington Department of
                                Early Learning.<br />
                                The Goddard School® is open 12 months a year from 7:00 AM to 6:00
                                PM Monday through Friday. You will be asked to designate your
                                child’s hours of attendance at the time of enrollment. Please
                                note, Washington State mandates the maximum length of time a child
                                can be in a childcare center at 10 hours per day. Our school
                                policy follows the 10-hour maximum rule and will apply fees to
                                ensure adherence to this rule. A school-closing schedule including
                                holidays, parent- teacher conferences and teacher in-service days
                                will be provided at the time of enrollment.
                            </p>
                            <h5 className="text-center mb-4">
                                <b>Enrollment Procedure - Class Placement</b>
                            </h5>
                            <p>
                                Enrollment is open to any child six (6) weeks to six (6) years of
                                age, provided The Goddard School® can meet his/her needs.
                                Enrollment is granted without discrimination with regard to sex,
                                race, color, religion, or political belief.<br /><br />
                                Interested families are invited to tour the center, meet the
                                staff, review, and complete all paperwork prior to enrollment.
                                Upon receipt of the completed application and registration fee,
                                placement will occur on a first-come, first-serve basis. Prior to
                                a child’s attendance, a school visit with the parent and child is
                                requested to acquaint each new family with the environment, staff,
                                and schedule for the child. Children are grouped by both age and
                                developmental abilities.
                            </p>
                        </div>
                        <div className="row m-1 mb-4">
                            <div className="form-group d-flex align-items-center gap-1">
                                <input type="checkbox" className="input-checkbox custom-checkbox" id="mission_statement_agreement"
                                    name="mission_statement_agreement" />
                                <label className="form-check-label" htmlFor="mission_statement_agreement">
                                    <span><b>I agree all the above information.</b></span>
                                </label>
                            </div>
                        </div>
                        <div className="row m-1 mb-4">
                            <h5 className="text-center mb-4"><b>Student Records</b></h5>
                            <p>
                                Each child enrolled in The Goddard School® must have an updated
                                school record with all Washington State and Goddard required
                                forms. This file is confidential, and will be shared with staff
                                members only, as required to meet the needs of the child.<br />
                            </p>
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
                                                    className="max-h-[130px] max-w-full object-contain"
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
                            <div className="row">
                                <p>
                                    Emergency contact information must be reviewed by the parent at
                                    least once per calendar year at or before the time the annual
                                    enrollment agreement is signed to ensure accuracy. Medical
                                    records are required to be updated annually, or whenever the
                                    child’s immunization status changes.<br /><br />
                                    Upon graduation or withdrawal of a child, a copy of your child’s
                                    complete file may be requested in writing. School Districts
                                    requests for documents will require written permission for
                                    release by the parent.
                                </p>
                            </div>
                            <div className="row m-1 mb-5">
                                <div className="form-group d-flex align-items-center gap-1">
                                    <input type="checkbox" className="input-checkbox custom-checkbox" id="general_information_agreement"
                                        name="general_information_agreement" />
                                    <label className="form-check-label" htmlFor="general_information_agreement">
                                        <span><b>I agree all the above information.</b></span>
                                    </label>
                                </div>
                                <h5 className="text-center mb-5">
                                    <b>Statement Of Confidentiality</b>
                                </h5>
                                <p>
                                    As a professional organization you can be assured all
                                    information regarding your family’s needs, file contents and
                                    handling, medical information, and conversations, will be
                                    handled with the appropriate confidentiality. Information will
                                    be shared only with those people requiring the knowledge to
                                    better serve your family.
                                </p>
                                <h5 className="text-center mb-5"><b>Non-Discrimination</b></h5>
                                <p>
                                    The Goddard School® located in Lynnwood, WA will not
                                    discriminate against students, parents, or staff. We believe
                                    that our students have the right to learn and play in an
                                    environment that is free from all forms of discrimination.
                                    Consistent with applicable laws and The Goddard School’s
                                    philosophy, we make all decisions involving enrollment at The
                                    Goddard School® without regard to race, creed, religion, color,
                                    age, sex, national origin, citizenship, disability, or any other
                                    characteristic protected under local, state, or federal law. You
                                    are encouraged to raise any questions regarding your equal
                                    opportunity at The Goddard School.
                                </p>
                                <br />
                            </div>
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
                                                    className="max-h-[130px] max-w-full object-contain"
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
                            <div className="row m-1">
                                <h5 className="text-center mb-2"><b>Attendance</b></h5>
                                <p>
                                    A parent should notify The Goddard School® by 9:00 AM by calling 425-882-1100 whenever a
                                    child is late or will not be attending on a scheduled day. Teachers attempt to wait until
                                    everyone
                                    has arrived to begin circle time, so timely notification is appreciated. The school should
                                    be
                                    notified, as soon as possible, if a child is ill, which enables our staff to track any
                                    illness that may
                                    occur at the school. We reserve the right to deny entry and attendance if a child arrives
                                    after
                                    10am without informing and checking in with school admins.
                                </p>
                            </div>
                            <div className="row m-1 mb-2">
                                <div className="form-group d-flex align-items-center gap-1">
                                    <input type="checkbox" className="input-checkbox custom-checkbox" id="medical_care_provider_agreement"
                                        name="medical_care_provider_agreement" />
                                    <label className="form-check-label" htmlFor="medical_care_provider_agreement">
                                        <span><b>I agree all the above information.</b></span>
                                    </label>
                                </div>
                            </div>
                            <h5 className="text-center mb-3"><b>Parent Access</b></h5>
                            <p>
                                A parent of a child enrolled in The Goddard School®, shall be
                                permitted free access, without prior notice, throughout the school
                                whenever the child is in attendance. In cases where the Family
                                Court or other legal entities have established visitation or
                                custody rights, a copy of the orders must be provided to The
                                Goddard School®. The orders of the court will be strictly followed
                                unless the custodial parent requests a more liberal variation of
                                the court order, which must be in writing. Visitors when
                                accompanied by a student’s parent are asked to schedule
                                appointments and are allowed in the childcare areas only at the
                                discretion of the Director and/or Owner. Visitors will be
                                accompanied by a staff member at all times.
                            </p>
                            <h5 className="text-center mb-3"><b>Parking and Speed Limit</b></h5>
                            <p>
                                The speed limit through the parking area is 5 mph. Parent parking
                                is in front of the building. Parents should not park in the fire
                                lane, as this is reserved for emergency vehicles. Handicap spaces,
                                by Washington State law, must be reserved for vehicles displaying
                                an approved handicap placard. It is unlawful to park in a
                                handicapped designated parking space without a state issued
                                placard. For the safety of all, children must be accompanied by a
                                parent into the building, using the front door. Children should be
                                held by the hand when walking to or from the building while in the
                                parking lot. Please do not leave any child in your vehicle
                                unattended when dropping off or picking up siblings. Doing so is
                                unsafe and should never happen per RCW 10.52.215.
                            </p>
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
                                                    className="max-h-[130px] max-w-full object-contain"
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
                            <div className="row m-1 mb-5">
                                <h5 className="text-center mb-5"><b>Arrival and Departure</b></h5>
                                <p>
                                    Upon arrival each morning, children must be signed in using the
                                    electronic devices in the foyer. Children are to be escorted to
                                    their designated classroom area and delivered to the supervising
                                    staff member. Children are required by law to be under adult
                                    supervision at all times. Do not leave any child in a classroom,
                                    playground, or common area unattended at any time. Parental
                                    involvement will help the child settle quickly into the morning
                                    routine. The staff will do anything that they can to assist in a
                                    smooth transition. The Goddard School® discourages parents from
                                    “sneaking out” of the school.<br />
                                    Children attending our program should be settled and ready to
                                    begin no later than 10:00 AM. Late arrivals may make a child
                                    feel left out since their classmates will already be involved in
                                    the day’s activities. Late arrivals also cause a disruption to
                                    the other children already in attendance. All late arrivals
                                    require preapproval from the administrative staff. We reserve
                                    the right not to accept late arrivals without proper
                                    notification.<br />
                                    When picking up individual children at the end of the day,
                                    parents must sign their children out on the appropriate
                                    electronic device in the foyer. Attendance is reviewed by
                                    Washington State licensing personnel and is used to determine
                                    staffing requirements.<br />
                                    At pickup/drop off times, please ensure that you are with your
                                    child at all times on school property. For example, running
                                    through the hallway, parking lots, adult bathrooms, etc. will
                                    not be allowed. Once a child is removed from the supervising
                                    staff member it becomes the responsibility of the person picking
                                    up your child to provide supervision. We advise all parents and
                                    guardians to guide your child by hand while in the parking lot
                                    for the safety of all.
                                </p>
                            </div>
                            <div className="row m-1 mb-2">
                                <div className="form-group d-flex align-items-center gap-1">
                                    <input type="checkbox" className="input-checkbox custom-checkbox" id="parent_access_agreement"
                                        name="parent_access_agreement" />
                                    <label className="form-check-label" htmlFor="parent_access_agreement">
                                        <span><b>I agree all the above information.</b></span>
                                    </label>
                                </div>
                            </div>
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
                                                    className="max-h-[130px] max-w-full object-contain"
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
                            <div className="row m-1 mb-2">
                                <h5 className="text-center mb-2"><b>Release of Children</b></h5>
                                <p>
                                    Since the safety of the children is our utmost concern, The
                                    Goddard School® maintains a strict policy regarding the
                                    individuals to whom we will release a child. The enrollment
                                    forms require a parent to specify at least two (2) individuals
                                    to whom the child may be released on an on-going or emergency
                                    basis. In addition, parents are asked to specify a password for
                                    the release of the child.
                                </p>
                                <p>
                                    Advance written notice is required for an individual to be
                                    authorized to pick up a child. In the case of an emergency, the
                                    Director or Owner may be notified by phone as to the name,
                                    address, phone number, and brief description of the person
                                    picking up the child. The Director or Owner will then call the
                                    parent back to verify the authorization. Once this individual
                                    arrives at the school, a staff member will verify the
                                    individual’s identity by reviewing two forms of identification
                                    and the password before the child is released. After
                                    confirmation of identity, The Director or Owner will go pick up
                                    the child from their designated classroom. The child must still
                                    be signed out.
                                </p>
                                <p>
                                    If a non-custodial parent is not included among those persons
                                    authorized by the custodial parent to pick up the child, please
                                    inform the Director or Owner. A copy of the appropriate
                                    documentation regarding visitation must be included in the
                                    child’s school record. This information will remain confidential
                                    and will be shared with staff as required, to meet the needs of
                                    the child.
                                </p>

                                <p>
                                    Should an unauthorized individual arrive to pick up a child, a
                                    parent or emergency contact will be immediately notified by
                                    phone. If the Director is unable to contact a parent or
                                    emergency contact, the child will not be released. Should an
                                    unauthorized person become uncooperative with the school’s
                                    policy regarding the release of the child, the local authorities
                                    will be notified.
                                </p>
                            </div>
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
                                                    className="max-h-[130px] max-w-full object-contain"
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
                            <p>
                                The Goddard School® will not release a child to any parent,
                                relative, or other authorized adult who appears to be impaired by
                                the use of drugs or alcohol. In the event this situation occurs, a
                                phone call will be made to the parent, emergency contact person,
                                and/or local authorities.
                            </p>
                            <div className="row m-1 mb-1">
                                <div className="form-group d-flex align-items-center gap-1">
                                    <input type="checkbox" className="input-checkbox custom-checkbox" id="release_of_children_agreement"
                                        name="release_of_children_agreement" />
                                    <label className="form-check-label" htmlFor="release_of_children_agreement">
                                        <span><b>I agree all the above information.</b></span>
                                    </label>
                                </div>
                            </div>
                            <div className="row m-1 mb-2">
                                <h5 className="text-center mb-2"><b>Registration Fee</b></h5>
                                <p>
                                    A non-refundable registration fee is payable upon enrollment,
                                    and due annually when the child is re-enrolled for each new
                                    school year.
                                </p>
                                <h5 className="text-center mb-4"><b>Tuition Payments and Fees</b></h5>
                                <p>
                                    Tuition is paid on a monthly basis. Monthly tuition is due on or before the first of each
                                    month.A
                                    payment box is located outside the office. There will be a service fee of $50 for each check
                                    returned by the bank. This fee is due at the time of notification. We offer ACH in order to
                                    streamline the process for you, please see the office for paperwork. ACH is run on the 1st
                                    of every
                                    month.
                                    Any tuition that is not paid by the close of business on the first day of each month will
                                    incur a
                                    $50 late fee. An additional notice will then be given to the parent. After the fifteenth
                                    (15th)
                                    day, the child may not return to the program until the full tuition and late fee charges
                                    incurred
                                    are paid in full. All unpaid accounts must be rectified immediately or be subject to third
                                    party
                                    remediation. Please contact the owner if payment difficulties are anticipated so alternative
                                    arrangements can be made.
                                </p>
                                <p>
                                    Monthly tuition fees are non-refundable regardless of holidays, vacation, inclement weather
                                    days
                                    or School closures resulting from causes beyond the reasonable control of the School or its
                                    management including, but not limited to fire, floods, civil commotions, strikes, lockouts
                                    or
                                    other labor disturbances, “Acts of God” or acts, omissions or delays in acting by any
                                    governmental authority. The School and its management will use reasonable efforts to avoid
                                    unscheduled closures and will resume operation as soon as feasible.
                                </p>
                            </div>
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
                                                    className="max-h-[130px] max-w-full object-contain"
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
                            <div className="row m-1 mb-2">
                                <p>
                                    The School will make
                                    reasonable efforts to open in inclement weather; however, the School may choose to close at
                                    the
                                    discretion of the School’s owner. Parents will be notified of any school closures via
                                    electronic
                                    communication.
                                </p>
                                <p>
                                    Monthly tuition fees are non-refundable regardless of illness, pandemics, Covid19, public
                                    health crises, government order, closures mandated by Washington State Department of
                                    Health and/or King County Department of Health, closures mandated by Department of
                                    Child, Youth and Families. Parents will be notified of any school closures via electronic
                                    communication.
                                </p>
                                <p>
                                    The School will open at 7:00am and close at 6:00pm, however modified school hours may
                                    apply in case of any unforeseen circumstances. A fee will be charged for any child not
                                    picked up before the School’s regular closing time. Full day student late fees begin at
                                    6:31pm. Half day student late fees begin at 12:46pm. This charge shall be $35 per child for
                                    the first 5 minutes and an additional $25 per child per 5 minute period thereafter. Fees for
                                    late
                                    pick-up are added to tuition; if not paid, the child will not be readmitted to the program.
                                    Consistent lateness will be cause for the child’s dismissal from the School. We will provide
                                    a written notice for the first infraction prior to applying a late fee. If a parent or
                                    guardian has
                                    not contacted us by 6:30 PM, we are required to inform the proper authorities. Two staff
                                    members are required to stay with your child until you arrive.
                                </p>
                            </div>
                            <div className="row m-1 mb-4">
                                <div className="form-group d-flex align-items-center gap-1">
                                    <input type="checkbox" className="input-checkbox custom-checkbox" id="registration_fees_agreement"
                                        name="registration_fees_agreement" />
                                    <label className="form-check-label" htmlFor="registration_fees_agreement">
                                        <span><b>I agree all the above information.</b></span>
                                    </label>
                                </div>
                            </div>
                            <div className="row m-1">
                                <h5 className="text-center mb-4"><b>Outside Engagements</b></h5>
                                <p>
                                    In the event Parents engage employees of the School from time to time for outside child
                                    care services (“Outside Engagements”), Parents agree that Outside Engagements are not
                                    related
                                    to the School, its Owner or Goddard Systems, Inc. With respect to Outside Engagements,
                                    Parents release and discharge the School, its Owner and the franchisor of Goddard Schools,
                                    Goddard Systems, Inc.,
                                </p>

                            </div>

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
                                                    className="max-h-[130px] max-w-full object-contain"
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
                            <p>
                                a Pennsylvania corporation, and their present or former officers,
                                employees, shareholders, directors, affiliates, heirs, successors and assigns, in their
                                individual
                                and corporate capacities (the “Owner Releases”), from all claims, demands, liabilities, actions
                                or
                                causes of action whatsoever, whether known or unknown, which Parents have, may have or
                                claim to have at any time in the future against the Owner Releases based in whole or in part on
                                or arising out of or related to any Outside Engagements.
                            </p>
                            <h5 className="text-center mb-2"><b>Additional Days/Hours</b></h5>
                            <p>
                                Switching of scheduled days is not allowed. Additional days may be added based on the rates
                                quoted in the enrollment agreement. Parents are required to let the Director or Owner know at
                                least 48 hours in advance, if planning to bring a child for an additional day. Additional days
                                are
                                offered based on current enrollment and may not always be available.
                            </p>
                            <div className="row m-1 mb-2">
                                <div className="form-group d-flex align-items-center gap-1">
                                    <input type="checkbox" className="input-checkbox custom-checkbox" id="outside_engagements_agreement"
                                        name="outside_engagements_agreement" />
                                    <label className="form-check-label" htmlFor="outside_engagements_agreement">
                                        <span><b>I agree all the above information.</b></span>
                                    </label>
                                </div>
                                <br />
                                <h5 className="text-center mb-2"><b>Health Policies</b></h5>
                                <p>
                                    The owners and staff at The Goddard School® do all we can to
                                    promote a healthy environment for your children. Our teachers
                                    make sure children wash their hands when arriving at school,
                                    before meals, after art projects, after toileting and diapering,
                                    after coming in from outside, and after wiping one’s nose. Our
                                    teachers are required to wash their hands before serving meals
                                    or snacks and always wear latex gloves while diapering or
                                    assisting a child with toileting and when coming into contact
                                    with any bodily fluids. In addition, we disinfect infant and
                                    toddler toys on a daily basis. Our preschool toys are
                                    disinfected weekly.
                                </p>
                                <p>
                                    The health of the children is very important to the staff at The Goddard School®. Children
                                    who
                                    are ill cannot be appropriately cared for in a childcare setting. A child who is unable to
                                    participate
                                    due to illness should not be in attendance. The Goddard School® staff understands that it
                                    may be
                                    difficult to make alternate arrangements when a child may be too ill to attend the program.
                                </p>

                            </div>
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
                                                    className="max-h-[130px] max-w-full object-contain"
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
                            <p>However, cooperation in keeping a child home when they are showing symptoms of illness will
                                be greatly appreciated by the teachers and the children who would normally be in contact with
                                that child. By establishing and maintaining a healthy environment and reasonable health
                                policies,
                                all of our children and families will benefit. Please help us in keeping everyone healthy by
                                assisting with washing your child’s hands upon arrival at school (Per WA
                                Licensing Requirements). Goddard reserves right to decline a child's attendance during times of
                                illness where multiple children and/or staff are out with similar symptoms to contain the
                                illness
                                and reduce the spread.
                                If a child does arrive in the morning showing signs of ill health, we will be unable to accept
                                him/
                                her. The exception to this requirement would be that a licensed physician has
                                examined thechild and indicated, in writing, that there would be no health risk to your child
                                or others, and the child is capable of participating in all activities, including outdoor play.
                                Fever is an indication that the body is fighting something, and we need to be sure that children
                                are
                                not attending school who have been medicated to reduce the fever. Children continue to
                                be contagious even when a fever is controlled by a fever reducing medication.
                            </p>
                            <p>
                                Examples of health symptoms that require exclusion from the
                                program include, but are not limited to:
                            </p>
                            <ul className="p-5 pt-0 pb-1 mb-0">
                                <li>
                                    Severe pain or discomfort particularly in joints, abdomen, or
                                    ears
                                </li>
                                <li>Vomiting (2 or more incidents within a 24-hour period)</li>
                                <li>Diarrhea (3 or more within a 24-hour period)</li>
                                <li>Severe coughing or sore throat</li>
                                <li>
                                    Temperature of 100° or more and/or accompanied by other
                                    behavior changes/symptoms
                                </li>
                                <li>Jaundice (yellow) skin or eyes</li>
                                <li>
                                    Eye discharge or conjunctivitis (pink eye) until clear or
                                    until 24 hours of antibiotic treatment
                                </li>
                                <li>
                                    Infected, untreated skin patches/lesions or severe itching of
                                    body/scalp
                                </li>
                                <li>Difficult or rapid breathing</li>
                                <li>
                                    Skin rashes (excluding diaper rash) especially with fever or
                                    itching
                                </li>
                            </ul>
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
                                                    className="max-h-[130px] max-w-full object-contain"
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
                            <div className="row m-1 mb-2">
                                <ul>
                                    <li>
                                        Swollen joints visibly enlarged lymph nodes, or stiff neck
                                    </li>
                                    <li>Blood/pus from ears, skin, urine, stool</li>
                                    <li>
                                        Unusual behavior characterized by listlessness, loss of normal
                                        appetite, or confusion
                                    </li>
                                    <li>
                                        Symptoms of chicken pox, impetigo, lice, scabies, or strep
                                        throat
                                    </li>
                                </ul>
                                <p>
                                    If a child becomes ill during the day, a parent will be advised immediately. The child will
                                    be given
                                    the opportunity to rest or have other activities in a separated, supervised area until a
                                    designated
                                    release person can pick up the child. If the child is not picked up within one hour from the
                                    time of
                                    notification, the emergency contact person will be called.
                                    Children who are sent home due to illness will not be readmitted to the school until all
                                    signs of
                                    illness have been gone for 24 hours - this typically includes the day the child is sent home
                                    and the
                                    following full day. Therefore, a child who is sent home ill cannot return to school the
                                    following
                                    day.
                                    The exception to this requirement would be that a licensed physician has examined the child
                                    and
                                    has indicated in writing that the child does not present a health threat to him/her or
                                    others and is
                                    able to participate in all school activities, including outdoor play.
                                </p>
                                <p>
                                    In cases of certain communicable diseases, The Goddard School®
                                    is required to file a report with the Department of Health
                                    within 24 hours, so control measures can be used. Parents and
                                    staff are reminded to notify The Goddard School® within 24 hours
                                    if a child or family member has developed a known or suspected
                                    communicable disease. If a child has not been fully immunized
                                    for these diseases (due to the child’s age, medical condition,
                                    or religious belief) they will be excluded from the school
                                    during the outbreak of a vaccine-preventable disease, as
                                    directed by Washington State Department of Health.
                                </p>
                                <p>
                                    All parents will be informed in writing if a communicable
                                    disease is reported. The Goddard School® follows the reporting
                                    guidelines as established by the Washington State Department of
                                    Health. A copy of the health policy is on file in the Director’s
                                    office and is available for your review.
                                </p>

                            </div>

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
                                                    className="max-h-[130px] max-w-full object-contain"
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
                            <h6><b>“No Nit” Policy</b></h6>
                            <p>
                                The Goddard School has determined the best way to prevent head
                                lice is to institute a “no nit” policy at our school. We will
                                periodically check the children in our school for head lice. If
                                a child is found to have head lice, they will need to be picked
                                up immediately. Before returning to class, the child should be
                                brought to the office to be checked for nits. Once the child is
                                determined to be free of nits, they may rejoin their class.
                            </p>
                            <div className="row m-1">
                                <div className="form-group d-flex align-items-center gap-1">
                                    <input type="checkbox" className="input-checkbox custom-checkbox" id="health_policies_agreement"
                                        name="health_policies_agreement" />
                                    <label className="form-check-label" htmlFor="health_policies_agreement">
                                        <span><b>I agree all the above information.</b></span>
                                    </label>
                                </div>
                                <br />
                                <h5 className="text-center mb-5"><b>Medication Procedures</b></h5>
                                <h6><b>General Information on Medications</b></h6>
                                <p>
                                    The Goddard School in Lynnwood administers only life-saving
                                    medication such as EPI-Pen’s, Benadryl, Inhalers, etc.<br /><br />
                                    The medication logs and authorization forms are located in the
                                    Director’s office. Authorization forms must be completed by the
                                    parent or guardian and given to the Director prior to any
                                    medication being administered. This will serve as a second
                                    method to ensure that your child receives his/her medication.<br /><br />
                                    Check expiration dates on all medications. We will not be able
                                    to administer expired medications even if the log and form are
                                    completed.<br /><br />
                                    Every medication needs to have a pharmacy label with the child’s
                                    first and last name printed on the bottle. Only one bottle may
                                    be used for each child. Siblings may not share containers of
                                    medication.<br /><br />
                                    Over-the-counter medications will not be given even with a
                                    doctor’s note.
                                </p>
                            </div>
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
                                                    className="max-h-[130px] max-w-full object-contain"
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
                            <div className="row m-1 mb-5">
                                <h6><b>Request for Medication to be Dispensed</b></h6>

                                <p>
                                    No over-the-counter medication will be dispensed. All medication
                                    must be a prescription prescribed by doctor and have a pharmacy
                                    label and medication number. When a child needs medication, 2
                                    forms must be completed. The first form is the medication log. The
                                    log needs to be completed each day the child is to receive
                                    medication. A parent must indicate a specific time and dosage of
                                    medication to be dispensed. Medication will not be dispensed on an
                                    “as needed” basis. The second form is the authorization for
                                    dispensing medication. Medication will only be dispensed for the
                                    dates indicated on the form. The authorization form should be
                                    given directly to the Director.
                                </p>
                                <h6><b>Allergies That May Require Medication</b></h6>

                                <p>
                                    If a child requires over-the-counter diaper ointments, lotions,
                                    lip balm, or sunscreen, these must be labeled with the child’s
                                    first and last name. The parent must complete an authorization
                                    form for each type of ointment or lotion. This authorization is
                                    good for one year. If diaper ointments are applied, it will be
                                    noted on the child’s daily report. These ointments and lotions
                                    must be placed in a designated container in the teacher closet or
                                    cabinet and remain at school overnight.
                                </p>
                                <h6>
                                    <b>Topical Medications (Diaper Creams, Sun Screens, Etc.)</b>
                                </h6>
                                <p>
                                    If a child requires over-the-counter diaper ointments, lotions,
                                    lip balm, or sun screen, these must be labeled with the child’s
                                    first and last name. The parent must complete an authorization
                                    form for each type of ointment or lotion. This authorization is
                                    good for one year. If diaper ointment s are applied it will be
                                    noted on the child’s daily report. These ointments and lotions
                                    must be placed in a designated container in the teacher closet or
                                    cabinet and remain at school overnight.
                                </p>

                            </div>

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
                                                    className="max-h-[130px] max-w-full object-contain"
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
                            <h5 className="text-center mb-4"><b>Accidents and Injury</b></h5>
                            <p>
                                Should a child become injured at school, the parent will be
                                notified via an accident report form. In the event of an injury
                                above the shoulders, an email notification or phone call will be
                                made. The parents will be asked to sign this form indicating that
                                they have been notified, and a copy of the form will be included
                                in the child’s school record. If the injury is of a serious
                                nature, a parent will receive a phone call from the school at the
                                time the accident occurs.
                            </p>
                            <p>
                                In the event of an emergency, the child will be transported via
                                ambulance to the nearest hospital or emergency room facility and a
                                parent will be contacted to meet an accompanying staff member at
                                the facility. It is extremely important that emergency contact
                                information for your child is up to date. A child cannot be
                                transported for care, or receive any emergency care at school,
                                unless the waivers for emergency care have been signed. These
                                waivers are included in the enrollment packet.
                            </p>
                            <div className="row m-1 mb-2">
                                <div className="form-group d-flex align-items-center gap-1">
                                    <input type="checkbox" className="input-checkbox custom-checkbox" id="medication_procedures_agreement"
                                        name="medication_procedures_agreement" />
                                    <label className="form-check-label" htmlFor="medication_procedures_agreement">
                                        <span><b>I agree all the above information.</b></span>
                                    </label>
                                </div>
                            </div>
                            <div className="row m-1 mb-2">
                                <h5 className="text-center mb-4"><b>Toys From Home</b></h5>
                                <p>
                                    It is recommended that all personal toys remain at home. It is
                                    very difficult for young children to share favorite possessions,
                                    and all toys that enter the school must be shared. In addition,
                                    many toys break easily and contain small parts. These types of
                                    toys may be inappropriate for our setting.
                                </p>
                                <p>
                                    Show and tell items may occasionally be requested by a child’s
                                    teacher. Suggested show and tell items include books, photographs,
                                    special treasures such as seashells, or theme related items. These
                                    should be discussed with the teacher and items will be shown at
                                    the teacher’s discretion. Anything pertaining to violence (guns,
                                    war toys, etc.) or having anything to do with religious beliefs
                                    cannot be utilized at The Goddard School®. Material deemed
                                    inappropriate for a preschool audience will not be used. All
                                    electronic devices from home are not permitted at school.
                                </p>

                            </div>
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
                                                    className="max-h-[130px] max-w-full object-contain"
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
                            <h5 className="text-center mb-2"><b>Items to Bring to School</b></h5>
                            <h6><b>Infants</b></h6>
                            <p>
                                Each infant is provided with their own crib and mattress upon
                                enrollment. The parent must provide:
                            </p>
                            <br />
                            <ul className="p-5 pt-0 pb-0 mb-0">
                                <li>2-3 crib sheets (port-a-crib or play yard size)</li>
                                <li>A sleep sac when appropriate</li>
                                <li>
                                    2-3 complete changes of clothing for the appropriate season
                                </li>
                                <li>Diapers and wipes, diaper cream if needed</li>
                                <li>All food, drink, and utensils required to serve food</li>
                                <li>Sweater or sweatshirt, mittens and hat</li>
                            </ul>
                            <p>
                                Parents are responsible for washing the crib linens at least once
                                a week. Diaper creams and lotions are considered medication and
                                therefore must be accompanied by Goddard’s authorization form. All
                                food, bottles, and clothing must be labeled with the child’s first
                                and last name. Bottles and caps will need to be re-labeled
                                frequently. Any items required for serving food such as spoons,
                                bowls, cups, etc. must also be provided and labeled by the parent.
                                Bottles must be filled at home and brought to school ready to
                                serve. We ask that you not send anything in glass jars or bottles.
                                Refrigeration is provided for storing bottles and food.
                            </p>
                            <h6><b>Toddlers and Preschoolers</b></h6>
                            <p>
                                The parent must provide the following items for each toddler
                                and/or preschooler:
                            </p>
                            <ul className="p-5 pt-0 mb-0">
                                <li>Two full changes of clothing including socks and shoes</li>
                                <li>Meals must be provided daily in a labeled lunch box</li>
                                <li>Water cup daily, labeled with first and last name - No bottles/silicone nipples or
                                    pacifiers please</li>
                                <li>
                                    Diapers and wipes, and/or extra sets of underwear if child is
                                    “in training”
                                </li>
                                <li>
                                    A small blanket and sheet is requested for nap time and a
                                    favorite sleep toy may alsobe provided
                                </li>
                            </ul>
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
                                                    className="max-h-[130px] max-w-full object-contain"
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
                            <div className="row m-1 mb-4">

                                <p>
                                    All items brought to school should be conspicuously labeled with
                                    the child’s first and last name. Extra clothing should be provided
                                    as seasons change and as the child grows. Rubber soled, closed-toe
                                    shoes, such as sneakers, are the most appropriate shoes for daily
                                    activities, such as climbing, running, and playing outside.
                                    Appropriate outdoor apparel is needed daily, as every effort is
                                    made to have some outdoor play time, even in the winter months.
                                    Please label detachable clothing where possible (hoods on coats,
                                    clips on mittens); this will lessen missing items. Additional sets
                                    of clothing and appropriate underwear will be required when the
                                    child is “potty- training.” Blankets are sent home weekly to be
                                    laundered.
                                </p>
                            </div>
                            <div className="row m-1 mb-4">
                                <div className="form-group d-flex align-items-center gap-1">
                                    <input type="checkbox" className="input-checkbox custom-checkbox" id="bring_to_school_agreement"
                                        name="bring_to_school_agreement" />
                                    <label className="form-check-label" htmlFor="bring_to_school_agreement">
                                        <span><b>I agree all the above information.</b></span>
                                    </label>
                                </div>
                            </div>
                            <div className="row m-1 mb-4">
                                <h5 className="text-center mb-2"><b>Rest Time</b></h5>
                                <p>
                                    Children in the Toddler and Preschool classes are required to lie
                                    quietly on their sleeping mats for approximately 30 – 45 minutes
                                    daily. This allows those children who do wish to sleep a quiet
                                    length of time in which they may rest. Quiet music is played, the
                                    lights are dimmed, and it is a period of relaxation for both
                                    nappers and non-nappers. Those children who do not fall asleep
                                    during the initial quiet time are given the opportunity to select
                                    quiet activities such as books or puzzles to occupy themselves
                                    while their classmates rest. The Pre-Kindergarten classrooms are
                                    non-napping classes.
                                </p>
                                <p>
                                    Although we make every effort to meet each child’s rest needs, it
                                    is difficult to guarantee a specific length of nap time, or
                                    wake-up time, as a child’s rest needs vary with activity level,
                                    sleep patterns the night before, etc. It is equally difficult, and
                                    in opposition to our child-centered program, to keep a child awake
                                    if he/she wants to rest.

                                    Infants will rest on an individual schedule of time and length.
                                    Infants who cannot turn over on their own will be placed in the
                                    crib lying on their backs only unless a medical reason supported
                                    by a written physician’s note states otherwise.
                                </p>

                                <br />
                            </div>
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
                                                    className="max-h-[130px] max-w-full object-contain"
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
                            <h5 className="text-center mb-4"><b>Meals and Snacks</b></h5>
                            <p>
                                The Goddard School® has found that parents prefer to provide lunch
                                for their children. This way a parent can send a meal that meets
                                their child’s individual needs and preferences. Children enrolled
                                in the morning preschool program are encouraged to join their
                                classmates for lunch and socialization. After lunch there is a
                                natural break in the day for the morning children to depart, as
                                the full day children prepare for rest time.
                            </p>
                            <p>
                                The Goddard School® provides morning and afternoon snacks on a
                                daily basis. These may include items such as crackers, Cheerios,
                                pretzels, and graham crackers. Fresh fruits and vegetables will
                                also be served on a weekly basis. Beverages may include water,
                                milk or 100% fruit juice. The snack menu is posted in the kitchen
                                and emailed out to parents at the beginning of each month.
                            </p>
                            <p>
                                Parents of infants must send prepared bottles of breast milk or
                                formula that is clearly labeled with the child’s first and last
                                name, contents, and date. Arrangements may be made for mothers who
                                wish to come to the school to breast feed their infant.
                                Instructions regarding a feeding schedule that has been
                                established by the parents must be provided, and these schedules
                                should be updated as necessary when new foods are introduced.
                                Infant bottles will be reheated in a bottle warmer, shaken, and
                                temperature tested before feeding. Any contents remaining in a
                                bottle after a feeding will be discarded after 45minutes for
                                breastmilk and 1 hour for formula, therefore it is suggested that
                                bottles be filled with the amount the child will drink at each
                                feeding. Small (4oz.) bottles may be more appropriate for a young
                                infant.
                                As solid foods are introduced, parents are requested to bring
                                labeled containers or small containers of food. For the safety and
                                protection of all our infants, no glass jars are allowed. Please
                                send only plastic containers. All food should be portioned out in
                                clean and sanitized containers. The date should also appear on the
                                label, along with the child’s first and last name.
                            </p>
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
                                                    className="max-h-[130px] max-w-full object-contain"
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
                            <div className="row m-1 mb-4">
                                <p>
                                    All Infant food
                                    should be placed in the refrigerator in the individual box upon
                                    arrival. In warm weather, it is recommended that perishable food
                                    be transported in an insulated cooler. Any food or beverage not
                                    eaten at scheduled mealtimes must be discarded and noted in the
                                    child’s daily report. In the case of extra bottles/food for
                                    infants, any item that has not been opened will be saved until the
                                    end of the day. These bottles and/or food must be taken home at
                                    the end of each day.
                                </p>
                                <p>
                                    Breakfast from home may be provided for children who arrive prior
                                    to 8:00 AM. All food should be sent ready to serve. If any
                                    preparation is required, parents should plan to spend several
                                    minutes assisting their children, as the staff will be supervising
                                    both eating and play time. Children who arrive after 8:00 AM
                                    should eat breakfast at home, as school activities at this point
                                    in the day do not allow for the supervision of children who are
                                    eating breakfast. A mid-morning snack is served between 9:00 AM
                                    and 10:00 AM daily.
                                </p>
                                <p>
                                    For lunch, sandwiches, yogurt, soup, fruit, crackers, cheese, etc.
                                    are recommended so that the children receive a serving from each
                                    food group. Please try to avoid foods that contain excessive
                                    amounts of sugar, preservatives, artificial flavorings, colors, or
                                    caffeine. Lunches should be ready to serve (fruit peeled, soup in
                                    a microwave-safe container, etc.). Items that require
                                    refrigeration must be labeled with the child’s first and last name
                                    and placed in the appropriate tray in the classroom. The trays
                                    will then be placed in the refrigerator in the kitchen.All bibs,
                                    bottles, cups, bowls, spoons, etc., must be taken home daily.
                                    Washington State Department of Health requirements do not allow us
                                    to wash and store these items. All items must be labeled with
                                    first and last names (no initials). Your child will be encouraged
                                    to eat the balanced meal that you have provided. However, if a
                                    child refuses certain foods, those choices will be respected and
                                    will remain in the child’s lunch box if unopened. Please review
                                    your child’s daily report for an indication of appetite and food
                                    consumption. We are unable to save open food, our teachers do take
                                    a picture of their lunch after they are completed so that you can
                                    see what was eaten.
                                </p>

                            </div>


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
                                                    className="max-h-[130px] max-w-full object-contain"
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
                            <p>
                                Children grow so fast and before you know, they are ready to move
                                to the next classroom. The Goddard School® staff is trained to
                                transfer the trust your child has in his/her current teachers and
                                classrooms, on to the next. Prior to any transition, you will be
                                notified in writing of your child’s successes and the need to
                                graduate to the next level. When transitions take place,
                                particularly in summer and fall, your child will likely be in the
                                same class for approximately 9 months if they are Get Set,
                                Toddler, Pre-Toddler or First Steps.
                            </p>
                            <div className="row m-1">
                                <div className="form-group d-flex align-items-center gap-1">
                                    <input type="checkbox" className="input-checkbox custom-checkbox" id="rest_time_agreement"
                                        name="rest_time_agreement" />
                                    <label className="form-check-label" htmlFor="rest_time_agreement">
                                        <span><b>I agree all the above information.</b></span>
                                    </label>
                                </div>
                            </div>
                            <div className="row m-1 mb-2">
                                <h5 className="text-center mb-3"><b>Transition</b></h5>
                                <p>
                                    Preschool and Prekindergarten
                                    classes are typically a full year. Periodically there will be a
                                    change that takes place in those classes, based on the needs of
                                    the building and you will be notified through a transition letter
                                    if that takes place. You are welcome to schedule a conference with
                                    either your current teacher(s) or the next classroom’s staff to
                                    discuss your child’s needs. The letter will inform you of how a
                                    transition works and how you can lend us a hand in making the
                                    experience a successful one. As children transition, their
                                    attendance is tracked in both classrooms to assure adult
                                    supervision.
                                </p>
                                <h5 className="text-center mb-4"><b>Toilet Training Philosophy</b></h5>
                                <p>
                                    Toilet training is one of the many developmental skills children
                                    acquire between the ages of 2½ and 3. As a developmental skill, it
                                    will be reached in a child’s own time.The Goddard School’s® “Get
                                    Set” program has been designed and scheduled to provide ample
                                    opportunities to foster this skill. While focus remains on this
                                    developmental milestone, academic activities for older 2’s and
                                    young 3’s are presented and reinforced daily. Children will not
                                    transition into the Preschool classroom until they are
                                    potty-trained and wearing underwear “not a pull-up” throughout the
                                    whole length of the day. Potty-training includes the ability to
                                    fully dress/undress themselves, proper wiping, communication of
                                    bathroom needs to teachers, and control during transitions of the
                                    day.
                                </p>


                            </div>
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
                                                    className="max-h-[130px] max-w-full object-contain"
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
                            <h5 className="text-center mb-4"><b>Potty Training Policy</b></h5>
                            <p>Once your child has entered our older toddler classroom, we will begin the potty training
                                process when:
                                1) Your child begins to show interest typically around the age of 2 1/2 years old. This
                                typically looks like the child wanting to go into the bathroom, using potty works such as
                                "I'm wet", "I'm poopy" being able to dress/undress, indicating a need to eliminate.
                                2) Parents are ready to consistently potty train at home.
                            </p>
                            <p>
                                It is essential that parents and the teacher work as a team to create a fun, engaging atmosphere
                                for the potty-training process. We use positive reinforcement by giving big praise, singing
                                songs
                                and other silly rituals such as princess twirls and superhero high fives. We do not use food or
                                physical rewards during the process. It is important that if potty training is happening that
                                communication is consistent.
                            </p>
                            <p>
                                Potty training begins with a child being interested in going into the bathroom and learning to
                                pull
                                up and down their pants typically around 2 1/2 years old. Most children are not yet ready at 2,
                                however, some exceptions may occur and we will support this only if the child shows the
                                indicators on their own. We then begin asking questions “Are you wet?” and “Are you poopy?”
                                so that they can begin identifying the feeling of each in their diaper. We begin stand up diaper
                                changing at this time, and we encourage the children to sit on the potty every two hours. We do
                                not force children in any way but encourage them with clapping, high-fives and so on.
                            </p>
                            <p>
                                It is important that parents model using the potty with the child and encourage the child to try
                                each time the parent goes, before leaving home and reminding children to tell the teacher when
                                they need to use the bathroom. Once potty training begins, it is important that parents are
                                consistent even though it may be difficult at times.
                            </p>

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
                                                    className="max-h-[130px] max-w-full object-contain"
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
                            <h5 className="text-center mb-4">Moving from Diapers to Underwear </h5>
                            <p>We reserve the right to require a child stay in diapers/pull-ups until they can go multiple hours
                                with a dry diaper and are able to tell us that they need to use the bathroom via clear gestures
                                or
                                verbal interaction. If a child begins wearing underwear, and consistently has 2
                                or more accidents a day, they are not ready for underwear yet. Some children may choose to
                                wear underwear over their diaper which is acceptable. </p>
                            <p>
                                During the potty-training process, it is important that families bring in 2-3 sets of extra
                                clothes
                                including a pair of extra shoes/sneakers. Families are encouraged to take their child to the
                                potty
                                before leaving the classroom for the day. The definition of being fully potty trained includes
                                pulling up and down their own
                                pants/underwear, wiping independently, washing hands independently and being able to let a
                                teacher know they need the bathroom for a minimum period of 2 weeks with no accidents.
                            </p>
                            <p>
                                During this process, diapers should be replaced by training pants
                                or pull-ups, and then by regular underwear. As accidents are
                                inevitable, a sufficient supply should be on hand, along with
                                season appropriate clothing changes.
                            </p>
                            <h5 className="text-center mb-3"><b>Field Trips</b></h5>
                            <p>
                                As part of The Goddard School® program, periodic walking field
                                trips will be planned to provide the children with exposure to
                                learning experiences in our local community. Prior to each trip,
                                information will be sent home outlining the date, time, cost,
                                location, chaperones, etc. A permission slip is required and must
                                be signed by a parent and returned to the supervising teacher by
                                the date requested on the form. No child will be permitted to
                                attend a field trip if the required permission slip is not on
                                file. Children must be four (4) years of age or older to
                                participate in walking field trips. Ratios for field trips are 1
                                teacher/staff member or chaperone per 5 children.
                            </p>
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
                                                    className="max-h-[130px] max-w-full object-contain"
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

                            <div className="row m-1 mb-2">
                                <h5 className="text-center mb-2">
                                    <b>Celebration of a Child’s Birthday</b>
                                </h5>
                                <p>
                                    The celebration of a child’s birthday at school with their friends
                                    can be a wonderful lifetime memory. In planning these moments,
                                    please consider the nutritional needs and requirements of all the
                                    children in the class. Special treats must be store purchased and
                                    arrive at the school in their original store container. Please
                                    provide the teacher with advance notice of what will be brought
                                    and coordinate the date and time with the teacher. We have a
                                    wonderful list of suggestions, please ask the Director or Owner
                                    for a copy.
                                </p>
                                <p>
                                    Please contact the Director or Owner for assistance in any special
                                    event planning at the school.
                                </p>
                                <h5 className="text-center mb-2"><b>Smoking</b></h5>
                                <p>
                                    It is our desire that the environment around the children be as
                                    safe and healthy as possible. Therefore, The Goddard School® is a
                                    smoke-free environment, both inside the building and on school
                                    grounds. Parents, faculty, staff, and visitors are asked to comply
                                    with this request.
                                </p>
                                <div className="row m-1 mb-3">
                                    <div className="form-group d-flex align-items-center gap-1">
                                        <input type="checkbox" className="input-checkbox custom-checkbox" id="training_philosophy_agreement"
                                            name="training_philosophy_agreement" />
                                        <label className="form-check-label" htmlFor="training_philosophy_agreement">
                                            <span><b>I agree all the above information.</b></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <h5 className="text-center mb-4"><b>Emergency Closings</b></h5>
                            <p>
                                The Goddard School® will make every effort to open on time and
                                remain open in the event of inclement weather. However, in the
                                case of extremely dangerous road conditions or states of
                                emergency, it may be necessary for the school to cancel school or
                                delay the opening time or early dismissal. We will send Kaymbu,
                                Emails and Text Messages out as soon as possible. Should parents
                                be prevented by weather conditions from reaching the facility to
                                pick up their children, please make plans for an alternate
                                pick-up. Closing staff members will care for the children and
                                maintain proper staff-child ratio, until such time as the parents
                                can safely reach the school.
                            </p>
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
                                                    className="max-h-[130px] max-w-full object-contain"
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

                            <div className="row m-1 mb-2">

                                <p>
                                    Should the building require emergency evacuation, the staff-child
                                    ratios will be maintained, and the children will be evacuated to a
                                    nearby location. Each staff member responsible for a group of
                                    children will carry emergency contact information and class
                                    attendance records with them to the new site. Parents will be
                                    contacted by telephone as to the location of the children, or by
                                    radio broadcast if phone transmission is not possible, depending
                                    on circumstances, parents may be requested to pick up their
                                    children, or arrange for the emergency contact person to pick up
                                    their children.
                                </p>
                                <h5 className="text-center mb-4"><b>Religious Affiliation</b></h5>
                                <p>
                                    The Goddard School located in Lynnwood, WA claims to have no
                                    association with a church or religious affiliation. Our staff
                                    abides by The Goddard School guidelines for the separation of
                                    church and school.
                                </p>
                            </div>
                            <div className="row m-1 mb-2">
                                <h5 className="text-center mb-2"><b>Policies</b></h5>
                                <p>
                                    This handbook of policies and procedures is reviewed by the Owner
                                    and Director annually or upon state regulatory changes. Should
                                    changes occur, you will be notified of the changes and the
                                    effective date of the changes.
                                </p>
                                <p>
                                    Additionally, all policies are available in the Owner’s Office as
                                    well as on Goddard Family Connect, including the Bloodborne
                                    Pathogens Policy and the Pesticide Policy are included.
                                </p>
                                <div className="row m-1 mb-2">
                                    <div className="form-group d-flex align-items-center gap-1">
                                        <input type="checkbox" className="input-checkbox custom-checkbox" id="affiliation_policy_agreement"
                                            name="affiliation_policy_agreement" />
                                        <label className="form-check-label" htmlFor="affiliation_policy_agreement">
                                            <span><b>I agree all the above information.</b></span>
                                        </label>
                                    </div>
                                </div>

                            </div>

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
                                                    className="max-h-[130px] max-w-full object-contain"
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

                            <h5 className="text-center mb-4">
                                <b>Websites, Blogs and Security Issues</b>
                            </h5>
                            <p>
                                Out of concern for child safety, we do not permit the use of The
                                Goddard School name or service mark, including logos, photographs of
                                school grounds, and photographs of any child, parent, or employee of
                                the school, to be posted on a web site, blog, or online social
                                network without written permission from The Goddard School. If you
                                wish to share information about The Goddard School in this manner,
                                please check with your on-site owner or school director. We also
                                have a Social Media Policy if you would like a copy for your
                                information.
                            </p>
                            <h5 className="text-center mb-4">
                                <b>Reporting of Suspected Child Abuse or Neglect</b>
                            </h5>
                            <p>
                                Every school is required by law to notify state authorities if
                                there is knowledge or suspicion of physical or sexual abuse of
                                children in or outside of school. The Goddard School located in
                                Lynnwood, WA complies with this law and cooperates with
                                authorities in investigations.
                            </p>

                            <h5 className="text-center mb-4"><b>Behavior Policy</b></h5>
                            <p>
                                It is the policy of The Goddard School® to keep disciplinary
                                issues minimized and to help children monitor their own behavior.
                                The staff of The Goddard School® present and model age-appropriate
                                behavioral guidelines and use reflective communication to
                                encourage children to express their emotions. The staff encourages
                                self-control, self-direction, responsibility, and cooperation. At
                                this time practical and safe, logical, or natural consequences
                                will be presented to the child. The Goddard School® staff are
                                trained in the process of positive discipline.</p>

                            <p> Positive discipline
                                instructs children as to what they should do. For example: “We
                                walk inside the building” vs. “No running!” This philosophy of
                                behavior is in accordance with The Goddard School® belief that
                                children learn best in an environment where love, guidance, and
                                encouragement promote the development of self-esteem.
                            </p>
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
                                                    className="max-h-[130px] max-w-full object-contain"
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
                            <div>
                                <p>
                                    “Quiet time” may be used selectively for children over 18 months
                                    of age who are at risk of harming themselves or others. “Quiet
                                    time” is used as a last resort after several attempts of
                                    redirection have been made. The period of “quiet time” will be
                                    just long enough to enable the child to regain control of him or
                                    herself and will never be longer than 1-2 minutes per year of age.
                                    During the “quiet time” period, the child will be in an area where
                                    they may be visually observed by a teacher/Director.
                                </p>
                                <p>
                                    Aggressive physical behavior (fighting, hitting, biting, etc.) by
                                    a child toward another child or staff member is unacceptable.
                                    Staff members will intervene immediately should this type of
                                    situation occur, in order to protect all of the children and
                                    encourage more acceptable behavior. Physical restraint (a teacher
                                    holding a child) will not be used except as necessary to ensure a
                                    child’s safety or that of others, and then only for as long as is
                                    necessary for control of the situation. Children will be shown
                                    positive alternatives rather than just being told “no”. Parents
                                    will be informed if such an incident occurs, and a conference may
                                    be requested at any time to discuss an acceptable behavioral plan.
                                    If at the discretion of The Goddard School® staff, a child’s
                                    behavior is determined to be uncontrollable, extremely disruptive,
                                    and/or harmful to themselves or others, the parent will be called
                                    to come and remove the child from school for the day.<br />
                                    Parents will be required to make arrangements for the child to be
                                    picked up within 45 minutes of the call. Failure to do so may
                                    result in termination of services. The Goddard School® reserves
                                    the right to terminate enrollment of children who exhibit
                                    behavioral patterns, which are deemed to be harmful to themselves
                                    or others. The determination of what is harmful and/or appropriate
                                    is at the sole discretion of The Goddard School® staff. Open
                                    communication between home and school is considered key to
                                    effective discipline.
                                </p>

                            </div>
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
                                                    className="max-h-[130px] max-w-full object-contain"
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
                            <div className="row m-1 mb-4">

                                <p>
                                    At no time, at The Goddard School® will a child be subjected to
                                    physical corporal punishment (shaking, hitting, biting, pinching,
                                    etc.), humiliated, frightened, or verbally abused by our staff.
                                    Children will never be disciplined for sleep habits, toileting
                                    accidents, food consumption, or lack of participation in scheduled
                                    activities. At all times, a child’s age, emotional state, and past
                                    experiences will be considered in discipline matters. Any
                                    violation of the school’s discipline policy should be brought to
                                    the Director or Owner’s attention immediately.
                                </p>
                            </div>
                            <div className="row m-1 mb-2">
                                <div className="form-group d-flex align-items-center gap-1">
                                    <input type="checkbox" className="input-checkbox custom-checkbox" id="security_issue_agreement"
                                        name="security_issue_agreement" />
                                    <label className="form-check-label" htmlFor="security_issue_agreement">
                                        <span><b>I agree all the above information.</b></span>
                                    </label>
                                </div>
                            </div>
                            <h5 className="text-center mb-4"><b>Expulsion Policy</b></h5>
                            <p>
                                At The Goddard School, our primary concern is the safety and
                                well-being of all children and staff members. In the rare event that
                                a child's behavior poses a serious risk to themselves or others,
                                expulsion from our childcare services may be necessary.
                            </p>
                            <h6><b>Criteria for Expulsion:</b></h6>
                            <p>
                                Expulsion may occur under the following circumstances, including but
                                not limited to:
                            </p>
                            <ul className="p-5 pt-0 mb-0">
                                <li>
                                    Repeated and severe disruptive behavior that jeopardizes the
                                    safety of others.
                                </li>
                                <li>
                                    Physical aggression or violence towards other children or staff.
                                </li>
                                <li>
                                    Continuous refusal to adhere to childcare center rules and
                                    regulations.
                                </li>
                                <li>
                                    Engaging in behavior that compromises the overall welfare of
                                    individuals within the childcare setting.
                                </li>
                                <li>
                                    Any other behavior deemed unacceptable or harmful to the
                                    functioning of the childcare center.
                                </li>
                            </ul>
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
                                                    className="max-h-[130px] max-w-full object-contain"
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
                            <div className="row m-1 mb-2">
                                <h6><b>Procedure for Expulsion:</b></h6>
                                <ul className="p-5 pt-0 pb-2 mb-0">
                                    <li>
                                        Documentation: Incidents of concerning behavior will be
                                        thoroughly documented by staff members.
                                    </li>
                                    <li>
                                        Parental Communication: Parents or guardians will be promptly
                                        notified of any incidents and involved in developing strategies
                                        to address the behavior.
                                    </li>
                                    <li>
                                        Intervention and Support: The childcare center will offer
                                        appropriate interventions and support to help modify the
                                        behavior, including behavior management techniques and referrals
                                        to external resources if necessary.
                                    </li>
                                    <li>
                                        Review: If the behavior persists despite interventions, a review
                                        will be conducted involving the management team, staff members,
                                        and parents or guardians.
                                    </li>
                                    <li>
                                        Decision: If expulsion is deemed necessary to maintain the
                                        safety and well-being of all involved, the child may be expelled
                                        from the childcare services.
                                    </li>
                                    <li>
                                        Notification: Parents or guardians will receive written
                                        notification of the decision to expel their child, along with
                                        the reasons and any further steps required.
                                    </li>
                                </ul>
                                <h5 className="text-center mb-2"><b>Termination of Services</b></h5>
                                <p>
                                    Termination of childcare services may occur under the following
                                    circumstances, but not limited to:
                                </p>
                                <ul className="p-5 pt-0 pb-2 mb-0">
                                    <li>
                                        Continued non-payment of fees despite reminders and
                                        notifications.
                                    </li>
                                    <li>
                                        Failure to comply with the terms and conditions outlined in the
                                        childcare services agreement.
                                    </li>
                                    <li>
                                        Persistent disruptive behavior that poses a risk to the safety
                                        and well-being of other children and staff members.
                                    </li>
                                    <li>
                                        Engaging in violent behavior or using foul language towards
                                        other children or staff members.
                                    </li>
                                </ul>
                            </div>

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
                                                    className="max-h-[130px] max-w-full object-contain"
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
                            <div>
                                <ul>
                                    <li>
                                        Failure to follow the childcare center's rules and regulations
                                        despite interventions and support.
                                    </li>
                                    <li>
                                        Any behavior that compromises the safety or well-being of
                                        oneself or others.
                                    </li>
                                    <li>
                                        Any other circumstances deemed unacceptable or detrimental to
                                        the overall functioning of the childcare center.
                                    </li>
                                </ul>
                                <div className="row m-1 mb-2">
                                    <div className="form-group d-flex align-items-center gap-1">
                                        <input type="checkbox" className="input-checkbox custom-checkbox" id="expulsion_policy_agreement"
                                            name="expulsion_policy_agreement" />
                                        <label className="form-check-label" htmlFor="expulsion_policy_agreement">
                                            <span><b>I agree all the above information.</b></span>
                                        </label>
                                    </div>
                                </div>
                                <br />
                                <h5 className="text-center mb-2">
                                    <b>Addressing Individual Child Concerns</b>
                                </h5>
                                <p>
                                    The Goddard School® has developed a strong working relationship with
                                    Kindering, an early intervention center serving urban East King
                                    County. Kindering is the largest intervention center in Washington,
                                    one of the three largest in the nation, and notably the most
                                    comprehensive. The Educational Consultants at Kindering are
                                    committed to providing superior, individualized, family-centered
                                    services for children throughout the Eastside.
                                </p>
                                <p>
                                    Whenever there is a question about a child’s development or
                                    behavior, our first question is to ask if the environment can be
                                    modified to better accommodate the child’s needs. Kindering has been
                                    very helpful to our staff in making adjustments to our classrooms to
                                    better meet children’s needs. When the environmental changes are not
                                    enough, we then explore individual concerns. If the assessment
                                    process informs us of a specific need, the parents meet with the
                                    Educational Consultant, as well as the Director and classroom
                                    teachers. Our conversation is designed to build a strong partnership
                                    between home, school and outside services that may benefit the
                                    child. Kindering can become a strong support for the family and
                                    provide referral services when appropriate. This is a free service,
                                    and we are appreciative of the input that Kindering provides and the
                                    support they give to our program.
                                </p>
                                <h5 className="text-center mb-2"><b>Parent Code of Conduct</b></h5>
                                <p>
                                    The Goddard School® expects parents to observe a certain standard of
                                    conduct at the center and on its grounds. The following behaviors
                                    are not acceptable in the facility or on the grounds:
                                </p>

                            </div>
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
                                                    className="max-h-[130px] max-w-full object-contain"
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
                            <div className="row m-1 mb-2">
                                <ul className="p-5 pt-0 pb-0 mb-0">
                                    <li>Physical or verbal punishment of their children</li>
                                    <li>Physical or verbal punishment of other children</li>
                                    <li>
                                        Threatening or intimidating staff, other parents, or other
                                        children
                                    </li>
                                    <li>Swearing/cursing or threatening/obscene gestures</li>
                                    <li>Quarreling with other parents or staff</li>
                                    <li>
                                        Not following policies designated to protect the safety and
                                        security of everyone in the center.
                                    </li>
                                </ul>
                                <h5 className="text-center mb-2"><b>Parent Communication</b></h5>
                                <p>
                                    The Goddard School® provides many opportunities for parents to
                                    receive information on the progress of their children, as well as
                                    details on other general activities occurring from time to time at
                                    the school. Examples of the types of communication that parents
                                    will receive include:
                                </p>
                                <h6><b>Kaymbu/The Goddard Family App</b></h6>
                                <p>
                                    A written daily report for each child in The Goddard School®
                                    provides a parent with an overview of the activities in which the
                                    child participated, as well as information on meals, sleep, and
                                    toileting will be emailed to you via KAYMBU (you can also download
                                    the App).
                                </p>
                                <h6><b>Parent Conferences</b></h6>
                                <p>
                                    At least twice a year, or more often by parent (or staff) request,
                                    a formal parent/teacher conference time is scheduled. Our school
                                    is closed for the two scheduled conference dates, sign ups occur
                                    for families with siblings first and then open to the remaining
                                    classmates. These meetings serve to summarize each child’s
                                    progress in detail. The parents will be given a written
                                    developmental report, which summarizes the teacher’s evaluation.
                                </p>
                                <h6><b>Information Boards</b></h6>
                                <p>
                                    Boards are located outside each classroom or inside the classroom
                                    by the door for your convenience. Information is provided about
                                    upcoming school and community events, as well as miscellaneous
                                    points of interest.
                                </p>
                            </div>
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
                                                    className="max-h-[130px] max-w-full object-contain"
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
                            <p> Individual classroom boards will contain
                                lesson plans, class schedules, and staff hours. It is recommended
                                that parents check the boards regularly for updates and new
                                information.</p>
                            <h6><b>Daily Feedback</b></h6>
                            <p>
                                Daily communication will occur between staff and parents in the
                                morning and evening to provide updates on the children’s health,
                                disposition, etc. A long dialogue may not be possible at the drop-
                                off or pick-up time, as these are particularly busy times when
                                staff are responsible for supervising all of the children in their
                                care. If you have a concern, a special appointment is advised, or
                                telephone conferences may be arranged.
                            </p>
                            <h6><b>Newsletters and Monthly Calendars</b></h6>
                            <p>
                                Monthly newsletters are emailed out to keep parents posted on all
                                school activities. Monthly calendars will be available on or
                                before the first of each month. These will be emailed out to all
                                families a few days before the new month begins.
                            </p>
                        </div>
                        <div className="row m-1 mb-2">
                            <div className="form-group d-flex align-items-center gap-1">
                                <input type="checkbox" className="input-checkbox custom-checkbox" id="addressing_individual_child_agreement"
                                    name="addressing_individual_child_agreement" />
                                <label className="form-check-label" htmlFor="addressing_individual_child_agreement">
                                    <span><b>I agree all the above information.</b></span>
                                </label>
                            </div>
                        </div>
                        <div className="row m-1 mb-2">
                            <h5 className="text-center mb-4"><b>A Final Word</b></h5>
                            <p>
                                The Owner and/or Director reserve the right to deny, cancel,
                                sever, suspend, or terminate the services of any child, without
                                notice, for any reason, so long as the determination in not based
                                on whole or part on the race, color, creed, religion, sexual
                                preference, age, gender, national origin, or disability or any
                                other protected characteristic of the child or the child’s
                                parents. At all times we strive to provide quality care for all
                                children. If that quality is diminished by one child, the Director
                                and/or Owner may ask for the dismissal of that child for the
                                well-being of the other children in the room. Any unused tuition
                                will be refunded minus any outstanding charges.<br /><br />

                            </p>
                            <br />
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
                                                    className="max-h-[130px] max-w-full object-contain"
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
                            <p> The Goddard School® will not release a child to any parent,
                                relative, or other authorized adult who appears to be impaired. In
                                the event this situation is suspected, a telephone call will be
                                made to the other parent, emergency contact person, local
                                authorities and the Washington State Department of Child
                                Protective Services in Washington and notify them of our
                                suspicions.<br /><br />
                                In the event that child abuse is suspected, we are required by the
                                State of Washington to report any and all instances of suspected
                                child abuse or neglect. When a staff member has information or
                                evidence of suspected child abuse, the Director and/or Owner will
                                be informed, and the Department of Child Protective Services is
                                contacted and given this information.<br /><br />
                                The Goddard School® reserves the right to edit any of the
                                information contained in this manual at any time, and the material
                                contained herein should not be considered as sole determination of
                                policy.<br /><br />
                                If, after reviewing this parent’s handbook, there are any
                                questions or comments regarding The Goddard School® and its
                                policies, parents should feel free to speak with the Owner and/or
                                Director.</p>
                            <h5 className="text-center mb-4"><b>Chain of Command</b></h5>
                            <p>
                                We are all part of the team working to support your family. The
                                Goddard School® strives to meet all of your family’s needs. If you
                                have a concern, please go directly to the source to handle the
                                concern most efficiently. If your concern is not resolved, please
                                continue up the ladder until we have reached mutual understanding.
                            </p>
                            <p className="text-center">
                                The Goddard School® of Lynnwood Maanu Muthu, On-site Owner<br />
                                Kat Shield, Director<br />
                                Bailey Ellis, Assistant Director<br />
                                Josh Koczman, ____________<br />
                                Matt Redman, _____________<br />
                            </p>
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
                                                    className="max-h-[130px] max-w-full object-contain"
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
                            <div className="row m-1 mb-4">

                                <p className="text-center">

                                    Lead Teacher: See Bio Board for Your Child’s <br />
                                    Assistant Teacher: See Bio Board for Your Child’s Classroom<br />
                                    425-510-7055, 425-616-1993<br />
                                    LynnwoodWA@goddardschools.com
                                </p>
                                <p className="text-center">
                                    Goddard Systems, Inc.<br />
                                    1016 West Ninth Street, King of Prussia, PA 19406<br />
                                    Franchise Relations: 610-265-8510 Extension 530
                                </p>
                                <p className="text-center">
                                    Department of Children, Youth and Family<br />
                                    State of Washington, Northwest Offices<br />
                                    (425) 590-3103
                                </p>
                                <h5 className="text-center mb-2"><b>Emergency Operations Plan</b></h5>
                                <p>
                                    Our primary concern is for the safety and welfare of the children
                                    attending The Goddard School® in Lynnwood, WA. Our Emergency
                                    Operations Plan provides for response to all types of emergencies.
                                    Depending on the circumstances of the emergency, we will use one
                                    of the following protective actions:
                                </p>
                                <ul className="p-5 pt-0 mb-0">
                                    <li>
                                        Immediate evacuation: Students are evacuated to a safe area on
                                        the grounds of the facility in the event of a fire, etc.
                                    </li>
                                    <li>
                                        In-place sheltering: Sudden occurrences may dictate that taking
                                        cover inside the building is the best immediate response.
                                    </li>
                                    <li>
                                        Evacuation: In certain emergency situations, total evacuation of
                                        the facility may become necessary. In this case, the children
                                        will be taken to a safe relocation facility. Parents will be
                                        contacted by telephone as to the location of the children, or by
                                        radio broadcast if phone transmission is not possible.
                                    </li>

                                </ul>

                            </div>
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
                                                    className="max-h-[130px] max-w-full object-contain"
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
                            <ul>
                                <li>
                                    Modified Operation: This may include cancellation, postponement,
                                    or rescheduling of normal activities. These actions are normally
                                    taken in the event of a winter storm or facility problems that
                                    make it unsafe for students (such as utility disruptions).
                                    However, this action may be necessary in a variety of
                                    situations.
                                </li>
                            </ul>

                            <p>
                                In the event of a local or regional emergency, please tune into
                                your local news and radio stations for updated announcements.
                                You may also go to goddardschool.com and click on the Lynnwood,
                                WA location for announcements relating to any of the emergency
                                actions listed above.
                            </p>
                            <p>
                                We ask that you do not call the school during an emergency. This
                                will keep the main telephone line free to make emergency calls
                                and relay information. We will call you and let you know that
                                we’ve taken one of these protective actions. We will also call
                                you when we have resolved the situation, and it is safe for you
                                to pick up your child(ren).
                            </p>
                            <p>
                                The Owner and/or Directors may provide an alternative phone
                                number (i.e. cell phone number) to call in the event of an
                                emergency via group email or posting on our school’s website.
                            </p>
                            <p>
                                Our emergency preparedness plan is reviewed on a semi-annual
                                basis with all staff and is located in each classroom binder as
                                well as in the Director and Owner offices.
                            </p>

                            <h4 className="text-center">Parent Agreement</h4>
                            <div className="row m-1 mb-4">
                                <div className="form-group d-flex align-items-center gap-1">
                                    <input type="checkbox" className="input-checkbox custom-checkbox" id="finalword_agreement"
                                        name="finalword_agreement" />
                                    <label className="form-check-label" htmlFor="finalword_agreement">
                                        <span><b>I agree all the above information.</b></span>
                                    </label>
                                </div>
                            </div>
                            <div className="row m-3">
                                <div className="col-sm">
                                    <div className="form-group">
                                        <label htmlFor="parent_sign_handbook" className="form-label"><b>Parent Signature</b>
                                        </label>
                                        <input type="text" className="form-control text-box" id="parent_sign_handbook"
                                            name="parent_sign_handbook" />
                                    </div>
                                </div>
                                <div className="col-sm">
                                    <div className="form-group">
                                        <label htmlFor="parent_sign_date_handbook" className="form-label"><b>Date</b>
                                        </label>
                                        <input
                                            type="date"
                                            className="form-control text-box"
                                            id="parent_sign_date_handbook"
                                            name="parent_sign_date_handbook"
                                            onClick={() => dateValidation('parent_sign_date_handbook')}
                                        />

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

export default ParentHandbook;