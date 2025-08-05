
import React, { useRef, forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import logo from "/image/gs_logo_branch.png";
import "./index.css";
import PDFHeader from "./PDFHeader";

const ACHForm = forwardRef(({ initialFormData }, ref) => {

    const section1Ref = useRef();

    const enhanceElementForPDF = (element) => {
        const wrapper = document.getElementById("pdf-wrapper");
        if (wrapper) {
            wrapper.style.width = "960px";
            wrapper.style.maxWidth = "960px";
            wrapper.style.padding = "0 24px";
        }

        const allElements = element.querySelectorAll("*");
        allElements.forEach((el) => {
            const style = window.getComputedStyle(el);
            if (style.backgroundColor === "transparent") {
                el.style.backgroundColor = "#ffffff";
            }
            if (style.color === "transparent") {
                el.style.color = "#000000";
            }

            if (el.tagName === "INPUT" && (el.type === "text" || el.type === "date")) {
                el.style.paddingBottom = "25px";
                el.style.paddingTop = "5px";
                el.style.lineHeight = "1.8";
                el.style.minHeight = "50px";
                el.style.fontSize = "18px";
                el.style.borderBottom = "2px solid #000";
                el.style.color = "#000";
                el.style.background = "transparent";
            }
        });
    };

    const captureSection = async (element) => {
        await new Promise((resolve) => setTimeout(resolve, 20));
        enhanceElementForPDF(element);
        return await html2canvas(element, {
            scale: 1,
            useCORS: true,
            backgroundColor: "#ffffff",
        });
    };

    const generatePDF = async (action = "download") => {
        try {
            const pdf = new jsPDF("p", "pt", "a4");
            const pageWidth = pdf.internal.pageSize.getWidth();
            const margin = 20;

            const canvas = await captureSection(section1Ref.current);
            const imgData = canvas.toDataURL("image/jpeg", 0.9);
            const imgWidth = pageWidth - margin * 2;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, "JPEG", margin, margin, imgWidth, imgHeight);

            if (action === "download") {
                pdf.save("admission-form.pdf");
            } else {
                const pdfBlobUrl = pdf.output("bloburl");
                const newWindow = window.open(pdfBlobUrl);
                if (newWindow) {
                    newWindow.onload = () => newWindow.print();
                }
            }

            const wrapper = document.getElementById("pdf-wrapper");
            if (wrapper) {
                wrapper.style.width = "";
                wrapper.style.maxWidth = "";
                wrapper.style.padding = "";
            }
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("An error occurred while generating PDF.");
        }
    };

    const handleDownload2 = () => generatePDF("download");
    const handlePrint2 = () => generatePDF("print");

    useImperativeHandle(ref, () => ({
        handleDownload2,
        section1Ref,
        handlePrint2
    }));

    return (
        <>
            <style>
                {`
                    #pdf-wrapper {
                        width: 100%;
                        max-width: 100%;
                    }
                `}
            </style>
            <div id="pdf-wrapper" className="w-full">
                <div className="p-6">
                    <div ref={section1Ref} className="bg-white border border-2 mx-auto text-[15px] border-[#0f2d52]">
                        {/* Header Section */}
                        <PDFHeader heading={"Authorization ACH"} />

                        {/* Form Fields */}
                        <div className="px-4 sm:px-6">
                            <div className="grid grid-cols-2 gap-6 px-4 sm:px-6 py-6">
                                <div>
                                    <label htmlFor="bank_routing" className="form-label font-bold block">Bank Routing</label>
                                    <input
                                        name="bank_routing"
                                        type="text"
                                        maxLength={40}
                                        className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent"
                                        style={{ lineHeight: "1.5", minHeight: "40px" }}
                                        id="bank_routing"
                                        defaultValue={initialFormData?.bank_routing || ''}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="bank_account" className="form-label font-bold block">Bank Account</label>
                                    <input
                                        name="bank_account"
                                        type="text"
                                        maxLength={20}
                                        className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent"
                                        style={{ lineHeight: "1.5", minHeight: "40px" }}
                                        id="bank_account"
                                        defaultValue={initialFormData?.bank_account || ''}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="driver_license" className="form-label font-bold block">Driver’s License</label>
                                    <input
                                        name="driver_license"
                                        type="text"
                                        maxLength={50}
                                        className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent"
                                        style={{ lineHeight: "1.5", minHeight: "40px" }}
                                        id="driver_license"
                                        defaultValue={initialFormData?.driver_license || ''}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="state" className="form-label font-bold block">State</label>
                                    <input
                                        name="state"
                                        type="text"
                                        className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent"
                                        style={{ lineHeight: "1.5", minHeight: "40px" }}
                                        id="state"
                                        defaultValue={initialFormData?.state || ''}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 px-4 sm:px-6 py-6">
                                <div className="text-center font-bold text-xl mb-2">
                                    Statement of authorization
                                </div>
                                <p className="font-semibold mb-3 leading-relaxed text-justify text-[15px]">
                                    I{" "}
                                    <input
                                        id="i"
                                        type="text"
                                        className="underline-input inline-block w-60 align-baseline text-[15px]"
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
                                <p className="font-bold leading-snug text-justify text-[15px]">
                                    Please provide us 10 days advance notice should you wish to put a stop
                                    to this authorization. An automatic electronic authorization of the
                                    monthly transaction will take place and an email-generated receipt
                                    will be automatically sent to the email address provided to us above.
                                    A copy of this document will be scanned and saved in an electronic
                                    file, the original will be shredded for your protection.
                                </p>
                            </div>

                            <div className="text-center font-bold text-xl mb-2">
                                Parent Agreement
                            </div>
                            <div className="grid grid-cols-2 gap-6 px-4 sm:px-6 py-6">
                                <div>
                                    <label className="font-bold block mb-1 text-[15px]">Parent Signature</label>
                                    <input id="parent_sign_ach" type="text" className="underline-input w-full text-[15px]" defaultValue={initialFormData?.parent_sign_ach || ''} />
                                </div>
                                <div>
                                    <label className="font-bold block mb-1 text-[15px]">Date</label>
                                    <input id="parent_sign_date_ach" type="date" className="underline-input w-full text-[15px]" defaultValue={initialFormData?.parent_sign_date_ach || ''} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
});

export default ACHForm;
