// AdmissionSection.js
import React, {  useRef, forwardRef, useImperativeHandle } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import logo from "/image/gs_logo_branch.png";
import "./index.css"

const AdmissionSection = forwardRef((props, ref) => {
  // Define 19 individual refs

  const section1Ref = useRef();
  const section2Ref = useRef();
  const section3Ref = useRef();
  const section4Ref = useRef();
  const section5Ref = useRef();
  const section6Ref = useRef();
  const section7Ref = useRef();
  const section8Ref = useRef();
  const section9Ref = useRef();
  const section10Ref = useRef();
  const section11Ref = useRef();
  const section12Ref = useRef();
  const section13Ref = useRef();
  const section14Ref = useRef();
  const section15Ref = useRef();
  const section16Ref = useRef();
  const section17Ref = useRef();
  const section18Ref = useRef();
  const section19Ref = useRef();

  // ✅ Enhance styling for PDF rendering
  const enhanceElementForPDF = (element) => {
    const allElements = element.querySelectorAll("*");
    allElements.forEach((el) => {
      const style = window.getComputedStyle(el);

      // Fix OKLCH colors
      ["color", "backgroundColor", "borderColor"].forEach((prop) => {
        if (style[prop]?.includes("oklch")) {
          el.style[prop] = prop === "color" ? "red" : "#ffffff";
        }
      });

      // Ensure backgrounds are solid
      if (style.backgroundColor === "transparent") {
        el.style.backgroundColor = "#ffffff";
      }

      // Ensure text is visible
      if (style.color === "transparent") {
        el.style.color = "#000000";
      }
    });
  };

  // ✅ Capture each section as canvas
  const captureSection = async (element) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    enhanceElementForPDF(element);

    return await html2canvas(element, {
      scale: 1, // High resolution
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false,
      imageTimeout: 10000
    });
  };

  // ✅ Generate PDF with two sections per page
  const handleDownload2 = async () => {
    try {
      const pdf = new jsPDF("p", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;

      const sections = [
        section1Ref, section2Ref, section3Ref, section4Ref,
        section5Ref, section6Ref, section7Ref, section8Ref,
        section9Ref, section10Ref, section11Ref, section12Ref,
        section13Ref, section14Ref, section15Ref, section16Ref,
        section17Ref, section18Ref, section19Ref,
      ];

      for (let i = 0; i < sections.length; i += 2) {
        const s1 = sections[i];
        const s2 = sections[i + 1];

        if (!s1.current) break;

        // ✅ Capture first section
        const canvas1 = await captureSection(s1.current);
        const img1 = canvas1.toDataURL("image/jpeg", 0.9);

        // ✅ Capture second section if exists
        let img2 = null;
        if (s2?.current) {
          const canvas2 = await captureSection(s2.current);
          img2 = canvas2.toDataURL("image/jpeg", 0.9);
        }

        // ✅ Calculate dimensions
        const imgWidth = pageWidth - margin * 2;
        const halfHeight = (pageHeight - margin * 3) / 2;

        if (i !== 0) pdf.addPage();

        // Top section
        pdf.addImage(img1, "JPEG", margin, margin, imgWidth, halfHeight);

        // Bottom section
        if (img2) {
          pdf.addImage(img2, "JPEG", margin, margin * 2 + halfHeight, imgWidth, halfHeight);
        }
      }

      pdf.save("admission-form.pdf");
      console.log("✅ PDF with two sections per page created!");
    } catch (error) {
      console.error("❌ Error generating PDF:", error);
      alert("An error occurred while generating PDF.");
    }
  };

  // ✅ Expose refs and download handler
  useImperativeHandle(ref, () => ({
    handleDownload2,
    section1Ref, section2Ref, section3Ref, section4Ref,
    section5Ref, section6Ref, section7Ref, section8Ref,
    section9Ref, section10Ref, section11Ref, section12Ref,
    section13Ref, section14Ref, section15Ref, section16Ref,
    section17Ref, section18Ref, section19Ref,
  }));


  return (
    <>
      {/* Your 20 form sections here */}
      <div className="min-h-screen p-4 sm:p-6" >

        <div ref={section1Ref}
          className="bg-white border border-2 mx-auto text-[15px] border-[#0f2d52]"

        >
          {/* Header Section */}
          <div className="w-full border-b-2 border-[#0f2d52]" >
            <div className="flex flex-col md:flex-row w-full h-auto md:h-[180px]">
              {/* Left Logo */}
              <div
                className="w-full md:w-1/2 flex items-center justify-center border-b md:border-b-0 md:border-r-2 px-4 py-4 border-[#0f2d52]"

              >
                <img src={logo} alt="Goddard Logo" className="h-20 md:h-28 object-contain" />
              </div>

              {/* Right Title */}
              <div
                className="w-full md:w-1/2 flex items-center justify-center py-4 bg-[#0f2d52]"

              >
                <span className="text-white text-2xl md:text-3xl font-bold tracking-wide">
                  APPLICATION FOR ADMISSION
                </span>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 sm:px-6 py-6">
              <div>
                <label htmlFor="child_first_name" className="form-label font-bold block">
                  FIRST NAME
                </label>
                <input
                  name="child_first_name"
                  value=""
                  type="text"
                  maxLength={20}
                  className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent"
                  id="child_first_name"
                  style={{paddingBottom:"10px"}}
                  
                />
              </div>
              <div>
                <label htmlFor="child_last_name" className="form-label font-bold block">
                  LAST NAME
                </label>
                <input
                  name="child_last_name"
                  type="text"
                  maxLength={20}
                  className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                  id="child_last_name"
                />
              </div>
              <div>
                <label htmlFor="nick_name" className="form-label font-bold block">
                  NICKNAME
                </label>
                <input
                  name="nick_name"
                  type="text"
                  maxLength={50}
                  className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                  id="nick_name"
                />
              </div>
              <div>
                <label htmlFor="dob" className="form-label font-bold block">
                  BIRTH DATE
                </label>
                <input
                  name="dob"
                  type="date"
                  className="form-control text-box w-full border-b px-2 py-1 "
                  id="dob"

                />

              </div>

              <div>
                <label htmlFor="primary_language" className="form-label"><b>PRIMARY LANGUAGE</b></label><br />
                <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} aria-label="Telephone Number"
                  id="primary_language" name="primary_language" />
              </div>

              <div>
                <label htmlFor="gender1" className="form-label"><b>GENDER</b></label>
                <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} name="gender" id="gender1" />
              </div>

            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 sm:px-6 py-6">
              <div>
                <label htmlFor="school_age_child_school" className="form-label"><b>SCHOOL-AGE CHILD’S
                  SCHOOL</b>
                </label><br />
                <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} id="school_age_child_school"
                  name="school_age_child_school" />
              </div>
              <div>
                <label htmlFor="home_telephone_number" className="form-label"><b>TELEPHONE
                  NUMBER</b>
                </label><br />
                <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} aria-label="Telephone Number"
                  id="home_telephone_number" name="home_telephone_number"
                />
                <span id="home_telephone_number_span text-red-500" style={{ display: 'none' }}
                >
                  Enter valid input [only numbers,+,-,()].</span>
              </div>

              <div>
                <label htmlFor="parent_name" className="form-label"><b>PARENT’S / LEGAL
                  GUARDIAN’S NAME</b>
                </label><br />
                <input type="text" className="form-control text-box w-full border-b px-2 py-1  " id="parent_name"
                  name="parent_name"></input>
              </div>

              <div>
                <label htmlFor="do_relevant_custody_papers_apply1" className="form-label"><b>DO RELEVANT
                  CUSTODY PAPERS APPLY?</b></label><br />
                <input type="text" className="form-control text-box w-full border-b px-2 py-1 "
                  name="do_relevant_custody_papers_apply"
                  id="do_relevant_custody_papers_apply1"></input>
              </div>

              <div>
                <label htmlFor="parent_street_address" className="form-label"><b>STREET</b>
                </label><br />
                <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} id="parent_street_address"
                  name="parent_street_address"></input>
              </div>
              <div>
                <label htmlFor="parent_city_address" className="form-label"><b>CITY</b>
                </label><br />
                <input type="text" className="form-control text-box w-full border-b px-2 py-1 " id="parent_city_address"
                  name="parent_city_address"></input>
              </div>





            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 sm:px-6 py-6">
              <div> <label htmlFor="business_name" className="form-label"><b>NAME</b>
              </label><br></br>
                <input type="text" className="form-control text-box w-full border-b px-2 py-1 " id="business_name"
                  name="business_name" />

              </div>
              <div>
                <label htmlFor="parent_state_address" className="form-label"><b>STATE</b>
                </label><br />
                <input type="text" className="form-control text-box w-full border-b px-2 py-1 " id="parent_state_address"
                  name="parent_state_address"></input>
              </div>

              <div>
                <label htmlFor="parent_zip_address" className="form-label"><b>ZIP</b>
                </label><br />
                <input type="text" className="form-control text-box w-full border-b px-2 py-1 " id="parent_zip_address"
                  name="parent_zip_address"
                />
                <span id="parent_zip_address_span" style={{ display: 'none' }}>
                  Enter valid input [only numbers].</span>
              </div>

              <div>
                <label htmlFor="work_hours_from" className="form-label"><b>WORK HOURS FROM</b>
                </label><br />
                <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} id="work_hours_from"
                  name="work_hours_from"></input>
              </div>

              <div>
                <label htmlFor="work_hours_to" className="form-label"><b>WORK HOURS TO</b>
                </label><br />
                <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} id="work_hours_to"
                  name="work_hours_to"></input>
              </div>

              <div>
                <label htmlFor="business_telephone_number" className="form-label"><b>TELEPHONE
                  NUMBER</b>
                </label><br />
                <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} id="business_telephone_number"
                  name="business_telephone_number"
                />
                <span id="business_telephone_number_span" style={{ display: 'none' }}>
                  Enter valid input [only numbers,+,-,()].</span>
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 sm:px-6 py-6">
              <div>
                <label htmlFor="business_cell_number" className="form-label"><b>CELL NUMBER</b>
                </label><br></br>
                <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} aria-label="Telephone Number"
                  id="business_cell_number" name="business_cell_number"></input>
              </div>

              <div>
                <label htmlFor="primary_parent_email" className="form-label"><b>EMAIL ADDRESS</b>
                </label><br></br>
                <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} id="primary_parent_email"
                  name="primary_parent_email"></input>
              </div>

            </div>

          </div>
        </div>


        <div ref={section2Ref}
          className="bg-white border border-2 mx-auto mt-5 text-[15px] border-[#0f2d52]"

        >
          <div className="w-full border-b-2 border-[#0f2d52]">
            <div className="flex flex-col md:flex-row w-full h-auto md:h-[180px]">
              {/* Left Logo */}
              <div
                className="w-full md:w-1/2 flex items-center justify-center border-b md:border-b-0 md:border-r-2 px-4 py-4 border-[#0f2d52]"

              >
                <img src={logo} alt="Goddard Logo" className="h-20 md:h-28 object-contain" />
              </div>

              {/* Right Title */}
              <div
                className="w-full md:w-1/2 flex items-center justify-center py-4 bg-[#0f2d52]"

              >
                <span className="text-white text-2xl md:text-3xl font-bold tracking-wide">
                  APPLICATION FOR ADMISSION
                </span>
              </div>
            </div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 sm:px-6 py-6">
            <div>
              <label htmlFor="parent_two_name" className="form-label"><b>PARENT’S / LEGAL
                GUARDIAN’S NAME</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} id="parent_two_name"
                name="parent_two_name"></input>
            </div>
            <div>
              <label htmlFor="parent_two_home_telephone_number" className="form-label"><b>TELEPHONE
                NUMBER</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} aria-label="Telephone Number"
                id="parent_two_home_telephone_number" name="parent_two_home_telephone_number"
              />
              <span id="parent_two_home_telephone_number_span" style={{ display: 'none' }}>
                Enter valid input [only numbers,+,-,()].</span>
            </div>
            <div>
              <label htmlFor="child_care_provider_street_address" className="form-label"><b>STREET</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                id="child_care_provider_street_address"
                name="child_care_provider_street_address"></input>
            </div>

            <div>
              <label htmlFor="child_care_provider_city_address" className="form-label"><b>CITY</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                id="child_care_provider_city_address" name="child_care_provider_city_address"></input>
            </div>




          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 sm:px-6 py-6">
            <div>
              <label htmlFor="child_care_provider_state_address" className="form-label"><b>STATE</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                id="child_care_provider_state_address" name="child_care_provider_state_address"></input>
            </div>

            <div>
              <label htmlFor="child_care_provider_zip_address" className="form-label"><b>ZIP</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                id="child_care_provider_zip_address" name="child_care_provider_zip_address"
              />
              <span id="child_care_provider_zip_address_span" style={{ display: 'none' }}>
                Enter valid input [only numbers].</span>
            </div>

            <div>
              <label htmlFor="parent_two_business_name" className="form-label"><b>NAME</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} id="parent_two_business_name"
                name="parent_two_business_name"></input>
            </div>

            <div>
              <label htmlFor="parent_two_work_hours_from" className="form-label"><b>WORK HOURS
                FROM</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} id="parent_two_work_hours_from"
                name="parent_two_work_hours_from"></input>
            </div>

            <div>
              <label htmlFor="parent_two_work_hours_to" className="form-label"><b>WORK HOURS TO</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} id="parent_two_work_hours_to"
                name="parent_two_work_hours_to"></input>
            </div>

            <div>
              <label htmlFor="parent_two_business_telephone_number" className="form-label"><b>TELEPHONE
                NUMBER</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                id="parent_two_business_telephone_number"
                name="parent_two_business_telephone_number"
              />
              <span id="parent_two_business_telephone_number_span"
                style={{ display: 'none' }}>
                Enter valid input [only numbers,+,-,()].</span>
            </div>



          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 sm:px-6 py-6">
            <div>
              <label htmlFor="business_cell_number" className="form-label"><b>CELL NUMBER</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} aria-label="Telephone Number"
                id="business_cell_number" name="business_cell_number"></input>
            </div>

            <div>
              <label htmlFor="primary_parent_email" className="form-label"><b>EMAIL ADDRESS</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} id="primary_parent_email"
                name="primary_parent_email"></input>
            </div>

          </div>

          <h2 className="text-center text-black text-[1.5rem]"><b>TO WHOM THE CHILD MAY BE RELEASED IN THE EVENT OF AN EMERGENCY</b></h2><br />

          <h5 className="pl-5 text-black text-[1.25rem]">Emergency Contact 1:</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 sm:px-6 py-6">
            <div>

              <label htmlFor="child_emergency_contact_name0" className="form-label"><b>NAME</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} aria-label="Emergency Name"
                id="child_emergency_contact_name0" name="child_emergency_contact_name0"></input>
            </div>
            <div>
              <label htmlFor="child_emergency_contact_relationship0"
                className="form-label"><b>RELATIONSHIP</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                aria-label="Emergency Relationship"
                id="child_emergency_contact_relationship0"
                name="child_emergency_contact_relationship0"></input>
            </div>

            <div>
              <label htmlFor="child_emergency_contact_full_address0"
                className="form-label"><b>STREET</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                id="child_emergency_contact_full_address0"
                name="child_emergency_contact_full_address0"></input>
            </div>

            <div>
              <label htmlFor="child_emergency_contact_city_address0"
                className="form-label"><b>CITY</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                id="child_emergency_contact_city_address0"
                name="child_emergency_contact_city_address0"></input>
            </div>
          </div>

        </div>

        <div ref={section3Ref}
          className="bg-white border border-2 mx-auto mt-5 text-[15px] border-[#0f2d52]"
        >
          <div className="w-full border-b-2 border-[#0f2d52]">
            <div className="flex flex-col md:flex-row w-full h-auto md:h-[180px]">
              {/* Left Logo */}
              <div
                className="w-full md:w-1/2 flex items-center justify-center border-b md:border-b-0 md:border-r-2 px-4 py-4 border-[#0f2d52]"

              >
                <img src={logo} alt="Goddard Logo" className="h-20 md:h-28 object-contain" />
              </div>

              {/* Right Title */}
              <div
                className="w-full md:w-1/2 flex items-center justify-center py-4 bg-[#0f2d52]"

              >
                <span className="text-white text-2xl md:text-3xl font-bold tracking-wide">
                  APPLICATION FOR ADMISSION
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 sm:px-6 py-6">
            <div>
              <label htmlFor="child_emergency_contact_telephone_number0"
                className="form-label"><b>TELEPHONE NUMBER</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} aria-label="Emergency Relationship"
                id="child_emergency_contact_telephone_number0"
                name="child_emergency_contact_telephone_number0"
              />
              <span id="child_emergency_contact_telephone_number_span"
                style={{ display: 'none' }}>
                Enter valid input [only numbers,+,-,()].</span>
            </div>

            <div>
              <label htmlFor="child_emergency_contact_state_address0" className="form-label"><b>STATE</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                id="child_emergency_contact_state_address0"
                name="child_emergency_contact_state_address0"></input>
            </div>

            <div>
              <label htmlFor="child_emergency_contact_zip_address0" className="form-label"><b>ZIP</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} aria-label="emergency_address"
                id="child_emergency_contact_zip_address0"
                name="child_emergency_contact_zip_address0"></input>
            </div>
          </div>
          <h5 className="pl-5 text-black text-[1.25rem]">Emergency Contact 2:</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 sm:px-6 py-6">
            <div>
              <label htmlFor="child_emergency_contact_name1" className="form-label"><b>NAME</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} aria-label="Emergency Name"
                id="child_emergency_contact_name1" name="child_emergency_contact_name1"></input>
            </div>

            <div>
              <label htmlFor="child_emergency_contact_relationship1"
                className="form-label"><b>RELATIONSHIP</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                aria-label="Emergency Relationship"
                id="child_emergency_contact_relationship1"
                name="child_emergency_contact_relationship1"></input>
            </div>

            <div>
              <label htmlFor="child_emergency_contact_full_address1"
                className="form-label"><b>STREET</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                id="child_emergency_contact_full_address1"
                name="child_emergency_contact_full_address1"></input>
            </div>

            <div>
              <label htmlFor="child_emergency_contact_city_address1"
                className="form-label"><b>CITY</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                id="child_emergency_contact_city_address1"
                name="child_emergency_contact_city_address1"></input>
            </div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 sm:px-6 py-6">
            <div>
              <label htmlFor="child_emergency_contact_telephone_number1"
                className="form-label"><b>TELEPHONE NUMBER</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                aria-label="Emergency Relationship"
                id="child_emergency_contact_telephone_number1"
                name="child_emergency_contact_telephone_number1"
              ></input>
            </div>

            <div>
              <label htmlFor="child_emergency_contact_state_address1"
                className="form-label"><b>STATE</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                id="child_emergency_contact_state_address1"
                name="child_emergency_contact_state_address1"></input>
            </div>

            <div>
              <label htmlFor="child_emergency_contact_zip_address1" className="form-label"><b>ZIP</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} aria-label="emergency_address"
                id="child_emergency_contact_zip_address1"
                name="child_emergency_contact_zip_address1"></input>
            </div>
          </div>

          <h5 className="pl-5 text-black text-[1.25rem]">Emergency Contact 2:</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 sm:px-6 py-6">
            <div>
              <label htmlFor="child_emergency_contact_name2" className="form-label"><b>NAME</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} aria-label="Emergency Name"
                id="child_emergency_contact_name2" name="child_emergency_contact_name2"></input>
            </div>
            <div>
              <label htmlFor="child_emergency_contact_relationship2"
                className="form-label"><b>RELATIONSHIP</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                aria-label="Emergency Relationship"
                id="child_emergency_contact_relationship2"
                name="child_emergency_contact_relationship2"></input>
            </div>

            <div>
              <label htmlFor="child_emergency_contact_full_address2"
                className="form-label"><b>STREET</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                id="child_emergency_contact_full_address2"
                name="child_emergency_contact_full_address2"></input>
            </div>
            <div>
              <label htmlFor="child_emergency_contact_city_address2"
                className="form-label"><b>CITY</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                id="child_emergency_contact_city_address2"
                name="child_emergency_contact_city_address2"></input>
            </div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 pb-6 sm:px-6 ">
            <div>
              <label htmlFor="child_emergency_contact_telephone_number2"
                className="form-label"><b>TELEPHONE NUMBER</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                aria-label="Emergency Relationship"
                id="child_emergency_contact_telephone_number2"
                name="child_emergency_contact_telephone_number2"
              />
              <span id="child_emergency_contact_telephone_number_span"
                style={{ display: 'none' }}>
                Enter valid input [only numbers,+,-,()].</span>
            </div>

            <div>
              <label htmlFor="child_emergency_contact_state_address2"
                className="form-label"><b>STATE</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                id="child_emergency_contact_state_address2"
                name="child_emergency_contact_state_address2"></input>
            </div>

            <div>
              <label htmlFor="child_emergency_contact_zip_address2" className="form-label"><b>ZIP</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} aria-label="emergency_address"
                id="child_emergency_contact_zip_address2"
                name="child_emergency_contact_zip_address2"></input>
            </div>



          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 sm:px-6 py-6">
            <div>
              <label htmlFor="child_care_provider_name" className="form-label"><b>NAME OF MEDICAL CARE
                PROVIDER</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} id="child_care_provider_name"
                name="child_care_provider_name"></input>
            </div>

            <div>
              <label htmlFor="child_hospital_affiliation" className="form-label"><b>HOSPITAL
                AFFILIATION</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} id="child_hospital_affiliation"
                name="child_hospital_affiliation"></input>
            </div>
          </div>


        </div>

        <div ref={section4Ref}
          className="g-white border border-2 mx-auto mt-5 text-[15px] border-[#0f2d52]"

        >
          <div className="w-full border-b-2 border-[#0f2d52]" >
            <div className="flex flex-col md:flex-row w-full h-auto md:h-[180px]">
              {/* Left Logo */}
              <div
                className="w-full md:w-1/2 flex items-center justify-center border-b md:border-b-0 md:border-r-2 px-4 py-4 border-[#0f2d52]"

              >
                <img src={logo} alt="Goddard Logo" className="h-20 md:h-28 object-contain" />
              </div>

              {/* Right Title */}
              <div
                className="w-full md:w-1/2 flex items-center justify-center py-4 bg-[#0f2d52]"

              >
                <span className="text-white text-2xl md:text-3xl font-bold tracking-wide">
                  APPLICATION FOR ADMISSION
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 sm:px-6 py-6">
            <div>
              <label htmlFor="child_care_provider_street_address" className="form-label"><b>STREET</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                id="child_care_provider_street_address"
                name="child_care_provider_street_address"></input>
            </div>
            <div>
              <label htmlFor="child_care_provider_city_address" className="form-label"><b>CITY</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                id="child_care_provider_city_address" name="child_care_provider_city_address"></input>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 sm:px-6 py-6">
            <div>
              <label htmlFor="child_care_provider_state_address" className="form-label"><b>STATE</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                id="child_care_provider_state_address" name="child_care_provider_state_address"></input>
            </div>

            <div>
              <label htmlFor="child_care_provider_zip_address" className="form-label"><b>ZIP</b>
              </label>
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                id="child_care_provider_zip_address" name="child_care_provider_zip_address"
              />
              <span id="child_care_provider_zip_address_span" style={{ display: 'none' }}>
                Enter valid input [only numbers].</span>
            </div>

            <div>
              <label htmlFor="child_care_provider_telephone_number" className="form-label"><b>TELEPHONE
                NUMBER</b>
              </label>
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                id="child_care_provider_telephone_number"
                name="child_care_provider_telephone_number"
              />
              <span id="child_care_provider_telephone_number_span"
                style={{ display: "none" }}>
                Enter valid input [only numbers,+,-,()].</span>
            </div>

            <div>
              <label htmlFor="child_dentist_name" className="form-label"><b>NAME OF CHILD'S
                DENTIST</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} id="child_dentist_name"
                name="child_dentist_name"></input>
            </div>

            <div>
              <label htmlFor="dentist_telephone_number" className="form-label"><b>DENTIST
                TELEPHONE NUMBER</b>
              </label>
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} id="dentist_telephone_number"
                name="dentist_telephone_number"
              />
              <span id="dentist_telephone_number_span" style={{ display: "none" }}>
                Enter valid input [only numbers,+,-,()].</span>
            </div>

            <div>
              <label htmlFor="allergies_medication_reaction" className="form-label"><b>ALLERGIES
                (MEDICATION REACTION)</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} id="allergies_medication_reaction"
                name="allergies_medication_reaction"></input>
            </div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 sm:px-6 py-6">

            <div>
              <label htmlFor="dentist_street_address" className="form-label"><b>STREET</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} id="dentist_street_address"
                name="dentist_street_address"></input>
            </div>

            <div>
              <label htmlFor="dentist_city_address" className="form-label"><b>CITY</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} id="dentist_city_address"
                name="dentist_city_address"></input>
            </div>

            <div>
              <label htmlFor="dentist_state_address" className="form-label"><b>STATE</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} id="dentist_state_address"
                name="dentist_state_address"></input>
            </div>

            <div>
              <label htmlFor="dentist_zip_address" className="form-label"><b>ZIP</b>
              </label>
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} id="dentist_zip_address"
                name="dentist_zip_address"
              />
              <span id="child_care_provider_zip_address_span" style={{ display: 'none' }}>
                Enter valid input [only numbers].</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 sm:px-6 py-6">
            <div>
              <label htmlFor="special_diabilities" className="form-label"><b>SPECIAL
                DIABILITIES (IF ANY)</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} id="special_diabilities"
                name="special_diabilities"></input>
            </div>

            <div>
              <label htmlFor="medication" className="form-label"><b>MEDICATION, SPECIAL
                CONDITIONS NUMBER</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} id="medication" name="medication"></input>
            </div>

            <div>
              <label htmlFor="additional_info" className="form-label"><b>ADDITIONAL
                INFORMATION REGARDING SPECIAL NEEDS</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} id="additional_info"
                name="additional_info"></input>
            </div>

            <div>
              <label htmlFor="policy_number" className="form-label"><b>POLICY NUMBER</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} id="policy_number"
                name="policy_number"></input>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6 px-4 sm:px-6 pb-6">
            <div>
              <label htmlFor="health_insurance" className="form-label"><b>HEALTH INSURANCE
                COVERAGE FOR CHILD OR MEDICAL ASSISTANCE BENEFITS</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} id="health_insurance"
                name="health_insurance"></input>
            </div>
          </div>

        </div>

        <div ref={section4Ref}
          className="g-white border border-2 mx-auto mt-5 text-[15px] border-[#0f2d52]"

        >
          <div className="w-full border-b-2 border-[#0f2d52]" >
            <div className="flex flex-col md:flex-row w-full h-auto md:h-[180px]">
              {/* Left Logo */}
              <div
                className="w-full md:w-1/2 flex items-center justify-center border-b md:border-b-0 md:border-r-2 px-4 py-4 border-[#0f2d52]"

              >
                <img src={logo} alt="Goddard Logo" className="h-20 md:h-28 object-contain" />
              </div>

              {/* Right Title */}
              <div
                className="w-full md:w-1/2 flex items-center justify-center py-4 bg-[#0f2d52]"

              >
                <span className="text-white text-2xl md:text-3xl font-bold tracking-wide">
                  APPLICATION FOR ADMISSION
                </span>
              </div>
            </div>
          </div>

          <h4 className="text-center mb-2 pt-2 text-black text-[1.5rem]"><b>PARENT’S / LEGAL GUARDIAN’S SIGNATURE IS REQUIRED TO
            INDICATE CONSENT</b></h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 sm:px-6 py-6">
            <div>
              <label htmlFor="obtaining_emergency_medical_care" className="form-label"><b>OBTAINING
                EMERGENCY MEDICAL CARE</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                id="obtaining_emergency_medical_care"
                name="obtaining_emergency_medical_care"></input>
            </div>

            <div>
              <label htmlFor="administration_first_aid_procedures"
                className="form-label"><b>ADMINISTRATION OF MINOR FIRST-AID
                  PROCEDURES</b></label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                id="administration_first_aid_procedures"
                name="administration_first_aid_procedures"></input>
            </div>
          </div>

          <p className="px-4 sm:px-6 text-black">In EMERGENCIES requiring immediate medical attention, your child will be taken to the
            NEAREST HOSPITAL EMERGENCY ROOM. Your signature authorizes the
            responsible person at the child care facility to have your child transported to that
            hospital.</p>

          <h4 className="text-[1.5rem] text-black text-center pt-3 pb-3">Parent Agreement</h4>
          <div className="form-group d-flex align-items-center gap- px-4 sm:px-6">
            <input type="checkbox" className="input-checkbox custom-checkbox"
              id="agree_all_above_information_is_correct"
              name="agree_all_above_information_is_correct" />
            <label className="form-check-label pl-2" htmlFor="agree_all_above_information_is_correct">
              <span><b>I agree all the above information is correct.</b></span>
            </label>
          </div>

          <h4 className="text-[1.5rem] text-black text-center pt-3 pb-3"><b>Child History</b></h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 sm:px-6 py-6">
            <div>
              <label htmlFor="physical_exam_last_date" className="form-label"><b>Date of Last
                Physical Exam</b>
              </label><br />
              <input type="date" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} id="physical_exam_last_date"
                name="physical_exam_last_date"
              ></input>
            </div>

            <div>
              <label htmlFor="dental_exam_last_date" className="form-label"><b>Date of Last
                Dental Exam</b>
              </label><br />
              <input type="date" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} id="dental_exam_last_date"
                name="dental_exam_last_date" ></input>
            </div>

          </div>

          <h4 className="text-[1.5rem] text-black text-center pt-3 pb-3"><b>Medical History And Illnesses</b></h4>
          <h3 className="text-[1.75rem] text-black text-center">Does your child have a history of : (please describe)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 sm:px-6 py-6">
            <div>
              <label htmlFor="allergies" className="form-label"><b>Allergies (food/drug)</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} name="allergies" id="allergies"></input>
            </div>
            <div>
              <label htmlFor="bleeding_problems" className="form-label"><b>Bleeding
                Problems</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} name="bleeding_problems"
                id="bleeding_problems"></input>
            </div>

            <div>
              <label htmlFor="frequent_ear_infections" className="form-label"><b>Frequent Ear
                Infections</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} id="frequent_ear_infections"
                name="frequent_ear_infections"></input>
            </div>

            <div>
              <label htmlFor="asthma" className="form-label"><b>Asthma</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} id="asthma" name="asthma"></input>
            </div>

            <div>
              <label htmlFor="diabetes" className="form-label"><b>Diabetes</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} id="diabetes" name="diabetes"></input>
            </div>

            <div>
              <label htmlFor="epilepsy" className="form-label"><b>Epilepsy</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}} id="epilepsy" name="epilepsy"></input>
            </div>
          </div>

        </div>

        <div ref={section5Ref}
          className="g-white border border-2 mx-auto mt-5 text-[15px] border-[#0f2d52]"

        >
          <div className="w-full border-b-2 border-[#0f2d52]" >
            <div className="flex flex-col md:flex-row w-full h-auto md:h-[180px]">
              {/* Left Logo */}
              <div
                className="w-full md:w-1/2 flex items-center justify-center border-b md:border-b-0 md:border-r-2 px-4 py-4 border-[#0f2d52]"

              >
                <img src={logo} alt="Goddard Logo" className="h-20 md:h-28 object-contain" />
              </div>

              {/* Right Title */}
              <div
                className="w-full md:w-1/2 flex items-center justify-center py-4 bg-[#0f2d52]"

              >
                <span className="text-white text-2xl md:text-3xl font-bold tracking-wide">
                  APPLICATION FOR ADMISSION
                </span>
              </div>
            </div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 sm:px-6 py-6">
            <div>
              <label htmlFor="frequent_illnesses" className="form-label"><b>Frequent
                Illnesses</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b px-2 py-1 focus:border-transparent" id="frequent_illnesses"
                name="frequent_illnesses"></input>
            </div>

            <div>
              <label htmlFor="hearing_problems" className="form-label"><b>Hearing Problems</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b px-2 py-1 focus:border-transparent" id="hearing_problems"
                name="hearing_problems"></input>
            </div>

            <div>
              <label htmlFor="high_fevers" className="form-label"><b>High Fevers</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b px-2 py-1 focus:border-transparent" id="high_fevers"
                name="high_fevers"></input>
            </div>

            <div>
              <label htmlFor="hospitalization" className="form-label"><b>Hospitialization</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b px-2 py-1 focus:border-transparent" id="hospitalization"
                name="hospitalization"></input>
            </div>

            <div>
              <label htmlFor="rheumatic_fever" className="form-label"><b>Rheumatic Fever</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b px-2 py-1 focus:border-transparent" id="rheumatic_fever"
                name="rheumatic_fever"></input>
            </div>

            <div>
              <label htmlFor="seizures_convulsions" className="form-label"><b>Seizures/Convulsions</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b px-2 py-1 focus:border-transparent" id="seizures_convulsions"
                name="seizures_convulsions"></input>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 sm:px-6 py-6">
            <div>
              <label htmlFor="serious_injuries_accidents" className="form-label"><b>Serious
                Injuries/Accidents</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b px-2 py-1 focus:border-transparent" id="serious_injuries_accidents"
                name="serious_injuries_accidents"></input>
            </div>

            <div>
              <label htmlFor="surgeries" className="form-label"><b>Surgeries</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b px-2 py-1 focus:border-transparent" id="surgeries" name="surgeries"></input>
            </div>

            <div>
              <label htmlFor="vision_problems" className="form-label"><b>Vision Problems</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b px-2 py-1 focus:border-transparent" id="vision_problems"
                name="vision_problems"></input>
            </div>

            <div>
              <label htmlFor="medical_other" className="form-label"><b>Other</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b px-2 py-1 focus:border-transparent" id="medical_other"
                name="medical_other"></input>
            </div>
          </div>

          <h4 className="text-center mb-2 pt-2 text-black text-[1.5rem]"><b>Pregnancy And Infant History</b></h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 sm:px-6 py-6">
            <div>
              <label htmlFor="illness_during_pregnancy" className="form-label"><b>Illness
                during pregnancy</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b px-2 py-1 focus:border-transparent" id="illness_during_pregnancy"
                name="illness_during_pregnancy"></input>
            </div>
            <div>
              <label htmlFor="condition_of_newborn" className="form-label"><b>Condition of
                Newborn</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b px-2 py-1 focus:border-transparent" id="condition_of_newborn"
                name="condition_of_newborn"></input>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 sm:px-6 py-6">
            <div>
              <label htmlFor="birth_weight_lbs" className="form-label"><b>Birth
                Weight</b>
              </label><br />
              <div className="input-group">
                <input
                  type="text"
                  className="form-control text-box border-b px-2 py-1 w-80 focus:border-transparent"
                  id="birth_weight_lbs"
                  name="birth_weight_lbs"
                />
                <span className="input-group-text" style={{ backgroundColor: "gray", color: "black", padding: "6px" }}>
                  lbs.
                </span>
              </div>
            </div>
            <div>
              <label htmlFor="birth_weight_oz" className="form-label"><b>Birth Weight</b></label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control text-box border-b px-2 py-1 w-80 focus:border-transparent"
                  id="birth_weight_oz"
                  name="birth_weight_oz"
                />
                <span className="input-group-text" style={{ backgroundColor: "gray", color: "black", padding: "6px" }}>
                  oz.
                </span>
              </div>

            </div>
            <div>
              <label htmlFor="duration_of_pregnancy" className="form-label"><b>Duration of
                pregnancy</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b px-2 py-1 focus:border-transparent" id="duration_of_pregnancy"
                name="duration_of_pregnancy"></input>
            </div>
            <div>
              <label htmlFor="complications" className="form-label"><b>Complications</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b px-2 py-1 focus:border-transparent" id="complications"
                name="complications"></input>
            </div>
            <div>
              <label htmlFor="bottle_fed" className="form-label"><b>Bottle Fed?</b>
              </label><br />
              <input name="bottle_fed" id="bottle_fed1" className="form-control text-box w-full border-b px-2 py-1 focus:border-transparent"></input>
            </div>

            <div>
              <label htmlFor="breast_fed" className="form-label"><b>Breast Fed?</b>
              </label><br />
              <input name="breast_fed" id="breast_fed1" className="form-control text-box w-full border-b px-2 py-1 focus:border-transparent"></input>
            </div>
          </div>
          <h4 className="text-center mb-2 pt-2 text-black text-[1.5rem]"><b>Other Siblings</b></h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 sm:px-6 py-6">

            <div>
              <label htmlFor="other_siblings_name" className="form-label"><b>Name</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b px-2 py-1 focus:border-transparent" id="other_siblings_name"
                name="other_siblings_name"></input>
            </div>
            <div>
              <label htmlFor="other_siblings_age" className="form-label"><b>Age</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b px-2 py-1 focus:border-transparent" id="other_siblings_age"
                name="other_siblings_age"></input>
            </div>
          </div>

        </div>

        <div ref={section6Ref}
          className="g-white border border-2 mx-auto mt-5 text-[15px] border-[#0f2d52]"

        >
          <div className="w-full border-b-2 border-[#0f2d52]" >
            <div className="flex flex-col md:flex-row w-full h-auto md:h-[180px]">
              {/* Left Logo */}
              <div
                className="w-full md:w-1/2 flex items-center justify-center border-b md:border-b-0 md:border-r-2 px-4 py-4 border-[#0f2d52]"

              >
                <img src={logo} alt="Goddard Logo" className="h-20 md:h-28 object-contain" />
              </div>

              {/* Right Title */}
              <div
                className="w-full md:w-1/2 flex items-center justify-center py-4 bg-[#0f2d52]"

              >
                <span className="text-white text-2xl md:text-3xl font-bold tracking-wide">
                  APPLICATION FOR ADMISSION
                </span>
              </div>
            </div>
          </div>
          <h4 className="text-center mb-2 pt-2 text-black text-[1.5rem]"><b>Family History</b></h4>
          <h3 className="text-[1.75rem] text-black text-center">Has any blood relative of this child had any of the following conditions? (please check off)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 sm:px-6 py-6">
            <div>
              <input type="checkbox" className="input-checkbox custom-checkbox"
                id="family_history_allergies" name="family_history_allergies" />
              <label className="form-check-label pl-3"
                htmlFor="family_history_allergies"><span><b>Allergies</b></span>
              </label>
            </div>
            <div>
              <input type="checkbox" className="input-checkbox custom-checkbox"
                id="family_history_heart_problems" name="family_history_heart_problems" />
              <label className="form-check-label pl-3" htmlFor="family_history_heart_problems"><span><b>Heart
                Problems</b></span>
              </label>
            </div>

            <div>
              <input type="checkbox" className="input-checkbox custom-checkbox"
                id="family_history_tuberculosis" name="family_history_tuberculosis" />
              <label className="form-check-label pl-3"
                htmlFor="family_history_tuberculosis"><span><b>Tuberculosis</b></span>
              </label>
            </div>

            <div>
              <input type="checkbox" className="input-checkbox custom-checkbox" id="family_history_asthma"
                name="family_history_asthma" />
              <label className="form-check-label pl-3" htmlFor="family_history_asthma"><span><b>Asthma</b></span>
              </label>
            </div>
            <div>
              <input type="checkbox" className="input-checkbox custom-checkbox"
                id="family_history_vision_problems" name="family_history_vision_problems" />
              <label className="form-check-label pl-3" htmlFor="family_history_vision_problems"><span><b>Vision
                Problems</b></span>
              </label>
            </div>
            <div>
              <input type="checkbox" className="input-checkbox custom-checkbox"
                id="family_history_diabetes" name="family_history_diabetes" />
              <label className="form-check-label pl-3"
                htmlFor="family_history_diabetes"><span><b>Diabetes</b></span>
              </label>
            </div>

            <div>
              <input type="checkbox" className="input-checkbox custom-checkbox"
                id="family_history_high_blood_pressure" name="family_history_high_blood_pressure" />
              <label className="form-check-label pl-3" htmlFor="family_history_high_blood_pressure"><span><b>High
                Blood Pressure</b></span>
              </label>
            </div>

            <div>
              <input type="checkbox" className="input-checkbox custom-checkbox"
                id="family_history_hyperactivity" name="family_history_hyperactivity" />
              <label className="form-check-label pl-3"
                htmlFor="family_history_hyperactivity"><span><b>Hyperactivity</b></span>
              </label>
            </div>

            <div>
              <input type="checkbox" className="input-checkbox custom-checkbox"
                id="no_illnesses_for_this_child" name="no_illnesses_for_this_child" />
              <label className="form-check-label pl-3" htmlFor="no_illnesses_for_this_child"><span><b>No
                Illnesses</b></span>
              </label>
            </div>

            <div>
              <input type="checkbox" className="input-checkbox custom-checkbox"
                id="family_history_epilepsy" name="family_history_epilepsy" />
              <label className="form-check-label pl-3"
                htmlFor="family_history_epilepsy"><span><b>Epilepsy</b></span>
              </label>
            </div>
          </div>

          <h4 className="text-center mb-2 pt-2 text-black text-[1.5rem]"><b>Social Behavior</b></h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 sm:px-6 py-6">
            <div>
              <label htmlFor="age_group_friends" className="form-label"><b>Age group of
                friends</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b px-2 py-1 focus:border-transparent" id="age_group_friends"
                name="age_group_friends"></input>
            </div>
            <div>
              <label htmlFor="neighborhood_friends" className="form-label"><b>Neighborhood
                friends</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b px-2 py-1 focus:border-transparent" id="neighborhood_friends"
                name="neighborhood_friends"></input>
            </div>
            <div>
              <label htmlFor="relationship_with_mother" className="form-label"><b>Relationship
                with mother</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b px-2 py-1 focus:border-transparent" id="relationship_with_mother"
                name="relationship_with_mother"></input>
            </div>
            <div>
              <label htmlFor="relationship_with_father" className="form-label"><b>Relationship
                with father</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b px-2 py-1 focus:border-transparent" id="relationship_with_father"
                name="relationship_with_father"></input>
            </div>
            <div>
              <label htmlFor="relationship_with_siblings" className="form-label"><b>Relationship with
                siblings</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b px-2 py-1 focus:border-transparent" id="relationship_with_siblings"
                name="relationship_with_siblings"></input>
            </div>
            <div>
              <label htmlFor="relationship_with_extended_family" className="form-label">
                <b>Relationship with extended family</b></label><br />
              <input type="text" className="form-control text-box w-full border-b px-2 py-1 focus:border-transparent"
                id="relationship_with_extended_family" name="relationship_with_extended_family"></input>
            </div>

            <div>
              <label htmlFor="fears_conflicts" className="form-label"><b>Fears and
                Conflicts</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b px-2 py-1 focus:border-transparent" id="fears_conflicts"
                name="fears_conflicts"></input>
            </div>
            <div>
              <label htmlFor="child_response_frustration" className="form-label"><b>Child’s
                response to frustration</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b px-2 py-1 focus:border-transparent" id="child_response_frustration"
                name="child_response_frustration"></input>
            </div>
          </div>

        </div>

        <div ref={section7Ref}
          className="g-white border border-2 mx-auto mt-5 text-[15px] border-[#0f2d52]"

        >
          <div className="w-full border-b-2 border-[#0f2d52]" >
            <div className="flex flex-col md:flex-row w-full h-auto md:h-[180px]">
              {/* Left Logo */}
              <div
                className="w-full md:w-1/2 flex items-center justify-center border-b md:border-b-0 md:border-r-2 px-4 py-4 border-[#0f2d52]"

              >
                <img src={logo} alt="Goddard Logo" className="h-20 md:h-28 object-contain" />
              </div>

              {/* Right Title */}
              <div
                className="w-full md:w-1/2 flex items-center justify-center py-4 bg-[#0f2d52]"

              >
                <span className="text-white text-2xl md:text-3xl font-bold tracking-wide">
                  APPLICATION FOR ADMISSION
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 sm:px-6 py-6">
            <div>
              <label htmlFor="favorite_activities" className="form-label"><b>Favorite
                activities</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b px-2 py-1 focus:border-transparent" id="favorite_activities"
                name="favorite_activities"></input>
            </div>
          </div>
          <h4 className="text-center mb-2 pt-2 text-black text-[1.5rem]"><b>Environmental Factors</b></h4>
          <div className="grid grid-cols-1 gap-6 px-4 sm:px-6 py-6">
            <div>
              <label htmlFor="last_five_years_moved" className="form-label">
                <b>How many times have you moved in the last five years?</b></label><br />
              <input type="text" className="form-control text-box w-full border-b px-2 py-1 focus:border-transparent" id="last_five_years_moved"
                name="last_five_years_moved" />
            </div>

            <div>
              <label htmlFor="things_used_at_home" className="form-label">
                <b>Educational toys, games, books used at home?</b></label><br />
              <input type="text" className="form-control text-box w-full border-b px-2 py-1 focus:border-transparent" id="things_used_at_home"
                name="things_used_at_home"></input>
            </div>

            <div>
              <label htmlFor="hours_of_television_daily" className="form-label">
                <b>How many hours of television daily?</b></label><br />
              <input type="text" className="form-control text-box w-full border-b px-2 py-1 focus:border-transparent" id="hours_of_television_daily"
                name="hours_of_television_daily"></input>
            </div>

            <div>
              <label htmlFor="language_used_at_home" className="form-label">
                <b>Language used in the home?</b></label><br />
              <input type="text" className="form-control text-box w-full border-b px-2 py-1 focus:border-transparent" id="language_used_at_home"
                name="language_used_at_home"></input>
            </div>

            <div>
              <label htmlFor="changes_at_home_situation" className="form-label"><b>Have
                there been any changes in the home situation recently, i.e.
                addition/loss/death/divorce.</b></label><br />
              <input type="text" className="form-control text-box w-full border-b px-2 py-1 focus:border-transparent" id="changes_at_home_situation"
                name="changes_at_home_situation"></input>
            </div>

            <div>
              <label htmlFor="educational_expectations_of_child" className="form-label"><b>What are your
                educational expectations of your
                child?</b>
              </label><br />
              <input type="text" className="form-control text-box w-full border-b px-2 py-1 focus:border-transparent"
                id="educational_expectations_of_child" name="educational_expectations_of_child"></input>
            </div>
            <h4 className="text-center mb-2 pt-2 text-black text-[1.5rem]"><b>Parent Agreement</b></h4>

            <div className="form-group d-flex align-items-center gap-1">
              <input type="checkbox" className="input-checkbox custom-checkbox"
                id="agree_all_above_info_is_correct" name="agree_all_above_info_is_correct" />
              <label className="form-check-label pl-3" htmlFor="agree_all_above_info_is_correct">
                <span><b>I agree all the above information is correct.</b></span>
              </label>
            </div>


          </div>


        </div>

        <div ref={section8Ref}
          className="g-white border border-2 mx-auto mt-5 text-[15px] border-[#0f2d52]"

        >
          <div className="w-full border-b-2 border-[#0f2d52]" >
            <div className="flex flex-col md:flex-row w-full h-auto md:h-[180px]">
              {/* Left Logo */}
              <div
                className="w-full md:w-1/2 flex items-center justify-center border-b md:border-b-0 md:border-r-2 px-4 py-4 border-[#0f2d52]"

              >
                <img src={logo} alt="Goddard Logo" className="h-20 md:h-28 object-contain" />
              </div>

              {/* Right Title */}
              <div
                className="w-full md:w-1/2 flex items-center justify-center py-4 bg-[#0f2d52]"

              >
                <span className="text-white text-2xl md:text-3xl font-bold tracking-wide">
                  APPLICATION FOR ADMISSION
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <div className="p-4 mb-3">
              <p className="p-[3%]">
                Please provide your children’s immunization records to the school on or before your
                children’s first day in our school.
              </p>
              <p className="p-[3%]">
                <b>NOTE:</b> If your child has a vaccination history with Washington State, we can directly
                download the immunization record from the Department of Health. You don't have to send us an
                immunization copy.
              </p>
              <ol type="1" className="list-decimal ml-6">
                <li className="p-[3%]">
                  If you have a soft copy, feel free to email it to us.
                </li>
                <li className="p-[3%]">
                  You can visit{" "}
                  <a
                    href="https://myirmobile.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600"
                  >
                    https://myirmobile.com
                  </a>
                  , register, and access the report for your child.
                </li>
                <li className="p-[3%]">
                  If you have a MyChart login for your child's profile, you can download the
                  report directly or request it from your pediatrician.
                </li>
              </ol>

              <p className="pl-[1%] pt-[20px]">
                Once obtained, kindly email it to us at{" "}
                <a href="mailto:lynnwoodmanagementgroup@goddardsystems.onmicrosoft.com">
                  lynnwoodmanagementgroup@goddardsystems.onmicrosoft.com
                </a>
                .
              </p>
              <p className="pl-[1%] pt-[20px]">
                If you have an exemption due to medical or religious reasons. Please let us know and we will
                help provide the proper form to fill out.
              </p>

              {/* Checkbox Section */}

              <div className="form-group d-flex align-items-center gap-1 pl-[1%] pt-[20px]">
                <input
                  type="checkbox"
                  className="input-checkbox custom-checkbox"
                  id="do_you_agree_this_immunization_instructions"
                  name="do_you_agree_this_immunization_instructions"
                />
                <label className="form-check-label pl-3" htmlFor="do_you_agree_this_immunization_instructions">
                  <span>
                    <b>I agree immunization instructions.</b>
                  </span>
                </label>

              </div>

              {/* Child Profile Details */}
              <h4 className="text-center mb-2 pt-2 text-black text-[1.5rem]">
                <b>Child Profile Details</b>
              </h4>
              <br />

              {/* First Input */}
              <div className="grid grid-cols-1 gap-6 px-4 sm:px-6 py-6">

                <div className="form-group">
                  <label htmlFor="important_fam_members" className="form-label ">
                    <b>Other important Family Members (Siblings, Grandparent, Pets, etc)</b>
                  </label><br />
                  <input
                    type="text"
                    className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                    id="important_fam_members"
                    name="important_fam_members"
                  />
                </div>


                {/* Second Input */}


                <div className="form-group">
                  <label htmlFor="about_family_celebrations" className="form-label">
                    <b>Tell us about your family traditions or important celebrations</b>
                  </label><br />
                  <input
                    type="text"
                    className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                    id="about_family_celebrations"
                    name="about_family_celebrations"
                  />
                </div>

              </div>
            </div>
          </div>



        </div>

        <div ref={section9Ref}
          className="g-white border border-2 mx-auto mt-5 text-[15px] border-[#0f2d52]"

        >
          <div className="w-full border-b-2 border-[#0f2d52]" >
            <div className="flex flex-col md:flex-row w-full h-auto md:h-[180px]">
              {/* Left Logo */}
              <div
                className="w-full md:w-1/2 flex items-center justify-center border-b md:border-b-0 md:border-r-2 px-4 py-4 border-[#0f2d52]"

              >
                <img src={logo} alt="Goddard Logo" className="h-20 md:h-28 object-contain" />
              </div>

              {/* Right Title */}
              <div
                className="w-full md:w-1/2 flex items-center justify-center py-4 bg-[#0f2d52]"

              >
                <span className="text-white text-2xl md:text-3xl font-bold tracking-wide">
                  APPLICATION FOR ADMISSION
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 sm:px-6 py-6">
            <div>
              <label htmlFor="reason_for_childcare_before" className="form-label"><b>Has your child
                been
                in childcare before?</b></label><br />
              <input type="text" className="form-control text-box w-full border-b px-2 py-1 focus:border-transparent" name="reason_for_childcare_before"
                id="reason_for_childcare_before"></input>
            </div>

            <div>
              <label htmlFor="what_child_interests" className="form-label"><b>What are you child’s
                interests</b>

              </label><br />
              <input type="text" className="form-control text-box w-full border-b px-2 py-1 focus:border-transparent" id="what_child_interests"
                name="what_child_interests"></input>
            </div>

          </div>

          <h4 className="text-center mb-2 pt-2 text-black text-[1.5rem]">
            <b>What will be your child’s typical time?</b>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 sm:px-6 py-6">
            <div>
              <label htmlFor="drop_off_time" className="form-label"><b>Drop off time?</b>

              </label><br />
              <input type="time" className="form-control text-box w-full border-b px-2 py-1 focus:border-transparent" id="drop_off_time"
                name="drop_off_time" />
            </div>

            <div>
              <label htmlFor="pick_up_time" className="form-label"><b>Pick up time?</b>

              </label><br />
              <input type="time" className="form-control text-box w-full border-b px-2 py-1 focus:border-transparent" id="pick_up_time"
                name="pick_up_time" />
            </div>

          </div>

          <h4 className="text-center mb-2 pt-2 text-black text-[1.5rem]">
            <b>Nutrition</b>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 sm:px-6 py-6">
            <div id="restricted_diet" className="col-sm">
              <div className="form-group">
                <label htmlFor="restricted_diet_reason" className="form-label">
                  <b>Does your child have a special or restricted diet?</b>
                </label>
                <input
                  type="text"
                  className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                  name="restricted_diet_reason"
                  id="restricted_diet_reason"
                />
              </div>
            </div>

            <div className="col-sm">
              <div className="form-group">
                <label htmlFor="favorite_foods" className="form-label">
                  <b>What are your child’s favorite foods?</b>
                </label>
                <input
                  type="text"
                  className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                  id="favorite_foods"
                  name="favorite_foods"
                />
              </div>
            </div>

            <div id="eat_own" className="col-sm">
              <div className="form-group">
                <label htmlFor="eat_own_reason" className="form-label">
                  <b>Does your child eat on their own?</b>
                </label>
                <input
                  type="text"
                  className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                  name="eat_own_reason"
                  id="eat_own_reason"
                />
              </div>
            </div>

          </div>

          <h4 className="text-center mb-2 pt-2 text-black text-[1.5rem]">
            <b>Rest and Diapering/Toilet Learning</b>
          </h4>

          <div className="grid grid-cols-1 gap-6 px-4 sm:px-6 py-6">
            <div id="rest_in_the_middle_day" className="col-sm">
              <div className="form-group">
                <label htmlFor="reason_for_rest_in_the_middle_day" className="form-label">
                  <b>Does your child rest in the middle of the day?</b>
                </label><br />
                <input
                  type="text"
                  className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                  name="reason_for_rest_in_the_middle_day"
                  id="reason_for_rest_in_the_middle_day"
                />
              </div>
            </div>


            <div className="col-sm">
              <div className="form-group">
                <label htmlFor="rest_routine" className="form-label">
                  <b>What is their nap/rest routine?</b>
                </label><br />
                <input
                  type="text"
                  className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                  id="rest_routine"
                  name="rest_routine"
                />
              </div>
            </div>


          </div>


        </div>

        <div ref={section10Ref}
          className="g-white border border-2 mx-auto mt-5 text-[15px] border-[#0f2d52]"

        >
          <div className="w-full border-b-2 border-[#0f2d52]" >
            <div className="flex flex-col md:flex-row w-full h-auto md:h-[180px]">
              {/* Left Logo */}
              <div
                className="w-full md:w-1/2 flex items-center justify-center border-b md:border-b-0 md:border-r-2 px-4 py-4 border-[#0f2d52]"

              >
                <img src={logo} alt="Goddard Logo" className="h-20 md:h-28 object-contain" />
              </div>

              {/* Right Title */}
              <div
                className="w-full md:w-1/2 flex items-center justify-center py-4 bg-[#0f2d52]"

              >
                <span className="text-white text-2xl md:text-3xl font-bold tracking-wide">
                  APPLICATION FOR ADMISSION
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 px-4 sm:px-6 py-6">
            <div id="toilet_trained" className="col-sm">
              <div className="form-group">
                <label htmlFor="reason_for_toilet_trained" className="form-label">
                  <b>Is your child toilet trained?</b>
                </label><br />
                <input
                  type="text"
                  className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                  name="reason_for_toilet_trained"
                  id="reason_for_toilet_trained"
                />
              </div>
            </div>

            <h4 className="text-center mb-2 pt-2 text-black text-[1.5rem]">
              <b>Medical/General</b>
            </h4>
            <div id="existing_illness_allergy" className="col-sm">
              <div className="form-group">
                <label
                  htmlFor="explain_for_existing_illness_allergy"
                  className="form-label"
                >
                  <b>Does your child have an existing illness/allergy/condition?</b>
                </label><br />
                <input
                  type="text"
                  className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                  name="explain_for_existing_illness_allergy"
                  id="explain_for_existing_illness_allergy"
                />
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 sm:px-6 py-6">
            <div id="functioning_at_age" className="col-sm">
              <div className="form-group">
                <label htmlFor="explain_for_functioning_at_age" className="form-label">
                  <b>Do you think your child is functioning at age-level?</b>
                </label><br />
                <input
                  type="text"
                  className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                  name="explain_for_functioning_at_age"
                  id="explain_for_functioning_at_age"
                />
              </div>
            </div>

            <div id="able_to_walk" className="col-sm">
              <div className="form-group">
                <label htmlFor="explain_for_able_to_walk" className="form-label">
                  <b>Is your child able to walk?</b>
                </label><br />
                <input
                  type="text"
                  className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                  name="explain_for_able_to_walk"
                  id="explain_for_able_to_walk"
                />
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 gap-6 px-4 sm:px-6 py-6">
            <div id="communicate_their_needs" className="col-sm">
              <div className="form-group">
                <label htmlFor="explain_for_communicate_their_needs" className="form-label">
                  <b>Is your child able to communicate their needs to others?</b>
                </label><br />
                <input
                  type="text"
                  className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                  name="explain_for_communicate_their_needs"
                  id="explain_for_communicate_their_needs"
                />
              </div>
            </div>

            <div id="any_medication" className="col-sm">
              <div className="form-group">
                <label htmlFor="explain_for_any_medication" className="form-label">
                  <b>
                    Does your child require any medication, therapy, treatment, or medical
                    assessment (example, blood sugar monitoring) while in childcare?
                  </b>
                </label><br />
                <input
                  type="text"
                  className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                  name="explain_for_any_medication"
                  id="explain_for_any_medication"
                />
              </div>
            </div>



            <div id="utilize_special_equipment" className="col-sm">
              <div className="form-group">
                <label
                  htmlFor="explain_for_utilize_special_equipment"
                  className="form-label"
                >
                  <b>
                    Does your child utilize any special equipment (such as a breathing
                    machine, wheelchair, hearing aid, or braces)?
                  </b>
                </label><br />
                <input
                  type="text"
                  className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                  name="explain_for_utilize_special_equipment"
                  id="explain_for_utilize_special_equipment"
                />
              </div>
            </div>

            <div id="significant_periods" className="col-sm">
              <div className="form-group">
                <label htmlFor="explain_for_significant_periods" className="form-label">
                  <b>
                    Does your child require one-on-one supervision on a regular basis for
                    significant periods of time?
                  </b>
                </label><br />
                <input
                  type="text"
                  className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                  name="explain_for_significant_periods"
                  id="explain_for_significant_periods"
                />
              </div>
            </div>


          </div>
        </div>

        <div ref={section11Ref}
          className="g-white border border-2 mx-auto mt-5 text-[15px] border-[#0f2d52]"

        >
          <div className="w-full border-b-2 border-[#0f2d52]" >
            <div className="flex flex-col md:flex-row w-full h-auto md:h-[180px]">
              {/* Left Logo */}
              <div
                className="w-full md:w-1/2 flex items-center justify-center border-b md:border-b-0 md:border-r-2 px-4 py-4 border-[#0f2d52]"

              >
                <img src={logo} alt="Goddard Logo" className="h-20 md:h-28 object-contain" />
              </div>

              {/* Right Title */}
              <div
                className="w-full md:w-1/2 flex items-center justify-center py-4 bg-[#0f2d52]"

              >
                <span className="text-white text-2xl md:text-3xl font-bold tracking-wide">
                  APPLICATION FOR ADMISSION
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 px-4 sm:px-6 py-6 mb-5">
            <div id="desire_any_accommodations">
              <div className="form-group">
                <label
                  htmlFor="explain_for_desire_any_accommodations"
                  className="form-label"
                >
                  <b>
                    Does your child require and/or desire any accommodations or modifications
                    in order to fully and equally enjoy and participate in The Goddard School®
                    group setting?
                  </b>
                </label>
                <input
                  type="text"
                  className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                  name="explain_for_desire_any_accommodations"
                  id="explain_for_desire_any_accommodations"
                />
              </div>
            </div>

            <div className="mb-3">
              <div className="form-group">
                <label htmlFor="additional_information" className="form-label h-3">
                  <b>Comments and additional information</b>
                </label><br />
                <input
                  type="text"
                  className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                  id="additional_information"
                  name="additional_information"
                />
              </div>
            </div>

            {/* Parent Agreement */}
            <h4 className="text-center  pt-2 text-black text-[1.5rem]">
              <b>Parent Agreement</b>
            </h4>
            <h5 className="text-center text-black text-[1.25rem]">
              <b>Correct and Complete Information</b>
            </h5>
            <p className="m-4 mb-3">
              To the best of my knowledge, the information I have provided and the statements
              I have made in this profile are correct and complete. I understand that false
              information provided herein or in connection with the enrollment process may
              result in disenrollment of my child. I further agree to update the information
              in this Health and Social Record as circumstances may require at Goddard
              School’s request.
            </p>

            <div className="form-group d-flex align-items-center gap-1 mb-3">
              <input
                type="checkbox"
                className="input-checkbox custom-checkbox"
                id="do_you_agree_this"
                name="do_you_agree_this"
              />
              <label className="form-check-label pl-3" htmlFor="do_you_agree_this">
                <span>
                  <b>I agree all the above information is correct.</b>
                </span>
              </label>
            </div>

            <br />
            <br />

            <p className="m-4 ">
              It is part of The Goddard School® security policy to have a password that is
              given to anyone whom you designate as an authorized pick-up for your child.
              Your child will be released to this authorized person only if the following
              conditions have been met:
            </p>

          </div>

        </div>

        <div ref={section12Ref}
          className="g-white border border-2 mx-auto mt-5 text-[15px] border-[#0f2d52]"

        >
          <div className="w-full border-b-2 border-[#0f2d52]" >
            <div className="flex flex-col md:flex-row w-full h-auto md:h-[180px]">
              {/* Left Logo */}
              <div
                className="w-full md:w-1/2 flex items-center justify-center border-b md:border-b-0 md:border-r-2 px-4 py-4 border-[#0f2d52]"

              >
                <img src={logo} alt="Goddard Logo" className="h-20 md:h-28 object-contain" />
              </div>

              {/* Right Title */}
              <div
                className="w-full md:w-1/2 flex items-center justify-center py-4 bg-[#0f2d52]"

              >
                <span className="text-white text-2xl md:text-3xl font-bold tracking-wide">
                  APPLICATION FOR ADMISSION
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 px-4 sm:px-6 py-6">

            <div className="pt-4">
              <div className="p-4">
                <ol className="list-decimal ml-6">
                  <li className="p-[3%]">
                    The Director must be notified in writing, either at the time of enrollment, or
                    in advance of the pick-up, that you are authorizing someone other than yourself
                    to pick-up your child. If you telephone the school to authorize a pick-up, be
                    prepared to receive a return phone call to verify the information.
                  </li>
                  <li className="p-[3%]">
                    At the time of notification, you will need to give us the authorized individual’s
                    full name and his/her approximate time of arrival so we can then notify the staff.
                  </li>
                  <li className="p-[3%]">
                    The authorized individual must show two forms of identification (one must be a
                    photo ID) and tell the Owner or Director the password you have designated below.
                  </li>
                  <li className="p-[3%]">
                    The authorized individual will be responsible for signing your child out of the building.
                  </li>
                </ol>

                <p className="mt-4">
                  The password is an added measure of security for your family and will be kept with your
                  child’s emergency information.
                </p>

                <div className="form-group text-center mt-4">
                  <label
                    htmlFor="child_password_pick_up_password_form"
                    className="form-label text-lg font-bold"
                  >
                    Password
                  </label>
                  <input
                    type="text"

                    className="form-control text-box mx-auto border-b block mt-2 w-1/2"
                    id="child_password_pick_up_password_form"
                    name="child_password_pick_up_password_form"
                  />
                  <p className="pt-2 text-center font-bold text-sm md:text-base">
                    (5 digits, alphanumeric characters)
                  </p>

                </div>

                <div className="form-group d-flex align-items-center gap-1 mt-4">
                  <input
                    type="checkbox"
                    className="input-checkbox custom-checkbox"
                    id="do_you_agree_this_pick_up_password_form"
                    name="do_you_agree_this_pick_up_password_form"
                  />
                  <label
                    className="form-check-label pl-3"
                    htmlFor="do_you_agree_this_pick_up_password_form"
                  >
                    <span>
                      <b>I agree pick-up password instructions.</b>
                    </span>
                  </label>
                </div>

                <h4 className="text-center pt-2 text-black text-[1.5rem]">
                  <b>Consent to Photograph</b>
                </h4>
                <p className="mt-2">
                  I consent to The Goddard School® taking photographs and videos of my child, who are
                  identified below. For value received and without additional consideration, I agree that
                  all photographs and video footage of my child taken at The Goddard School may be used at
                  any time by The Goddard School or Goddard Systems, Inc. for the purposes of illustration,
                  advertising and publicity, in any manner or in any form, including in broadcast, print,
                  electronic and social media.
                </p>

                <div className="form-group text-center mt-4">
                  <input
                    type="text"
                    className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                    id="photo_usage_photo_video_permission_form"
                    name="photo_usage_photo_video_permission_form"
                  />
                </div>
              </div>
            </div>

          </div>


        </div>

        <div ref={section13Ref}
          className="g-white border border-2 mx-auto mt-5 text-[15px] border-[#0f2d52]"

        >
          <div className="w-full border-b-2 border-[#0f2d52]" >
            <div className="flex flex-col md:flex-row w-full h-auto md:h-[180px]">
              {/* Left Logo */}
              <div
                className="w-full md:w-1/2 flex items-center justify-center border-b md:border-b-0 md:border-r-2 px-4 py-4 border-[#0f2d52]"

              >
                <img src={logo} alt="Goddard Logo" className="h-20 md:h-28 object-contain" />
              </div>

              {/* Right Title */}
              <div
                className="w-full md:w-1/2 flex items-center justify-center py-4 bg-[#0f2d52]"

              >
                <span className="text-white text-2xl md:text-3xl font-bold tracking-wide">
                  APPLICATION FOR ADMISSION
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 px-4 sm:px-6 py-6">
            <p>
              *In-house only includes photos used in the classroom or hallways and photos
              taken for and through electronic daily report tools, such as Kaymbu.
            </p>

            <h4 className="text-center mb-2 pt-2 text-black text-[1.5rem] font-bold">
              Group Photos in Electronic Daily Activity Reports
            </h4>

            <p>
              The Goddard School takes photos of individual children and groups of children
              for electronic daily activity reports. These photos will not be used for any
              other purpose by The Goddard School or Goddard Systems, Inc. Although we have
              a School policy against it, it is possible for individuals who receive group
              photos in an electronic daily activity reports to share these group photos
              through their personal social media accounts. For this reason, we ask that you
              specifically authorize whether we can include your child in any group photos
              shared through the electronic daily activity reports.
            </p>

            <div className="m-2">
              <div className="form-group flex items-center gap-2">
                <input
                  type="checkbox"
                  className="input-checkbox custom-checkbox"
                  id="photo_permission_agree_group_photos_electronic"
                  name="photo_permission_agree_group_photos_electronic"
                />
                <label
                  className="form-check-label"
                  htmlFor="photo_permission_agree_group_photos_electronic"
                >
                  <span>
                    I agree to have individual photos of my child and photos of group
                    activities that include my child shared through the School’s electronic
                    daily activity reports.
                  </span>
                </label>
              </div>
            </div>

            <h4 className="text-center mb-2 pt-2 text-black text-[1.5rem] font-bold">
              Agreement Not to Post Photos of Other Children
            </h4>

            <div className="m-2">
              <div className="form-group items-center gap-2">
                <input
                  type="checkbox"
                  className="input-checkbox custom-checkbox"
                  id="do_you_agree_this_photo_video_permission_form"
                  name="do_you_agree_this_photo_video_permission_form"
                />
                <label
                  className="form-check-label"
                  htmlFor="do_you_agree_this_photo_video_permission_form"
                >
                  <span>
                    I agree that I will not post or use any photographs or videos that I
                    receive from or take at The Goddard School
                  </span>{" "}
                  that include children other than my own child in print, electronic or
                  social media or any other form. This includes group photos that I receive
                  as part of an electronic daily activity report. My agreement extends to
                  photos or videos taken by any member of my family or any visitors that I
                  bring to The Goddard School.
                </label>
              </div>
            </div>

            <div className="m-4">
              <p>
                I understand that The Goddard School® has installed security cameras in the
                foyer and around the outside perimeter of the building. I also understand
                that while attending The Goddard School®, my child may be videotaped by a
                security camera.
              </p>
              <p className="pt-3">
                I recognize that I may also be videotaped by a security camera while at or
                around the school premises. I will notify each person listed on the
                Application for Admission that he or she may also be videotaped while at or
                around the school premises.
              </p>
            </div>

          </div>
        </div>
        <div ref={section14Ref}
          className="g-white border border-2 mx-auto mt-5 text-[15px] border-[#0f2d52]"

        >
          <div className="w-full border-b-2 border-[#0f2d52]" >
            <div className="flex flex-col md:flex-row w-full h-auto md:h-[180px]">
              {/* Left Logo */}
              <div
                className="w-full md:w-1/2 flex items-center justify-center border-b md:border-b-0 md:border-r-2 px-4 py-4 border-[#0f2d52]"

              >
                <img src={logo} alt="Goddard Logo" className="h-20 md:h-28 object-contain" />
              </div>

              {/* Right Title */}
              <div
                className="w-full md:w-1/2 flex items-center justify-center py-4 bg-[#0f2d52]"

              >
                <span className="text-white text-2xl md:text-3xl font-bold tracking-wide">
                  APPLICATION FOR ADMISSION
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 px-4 sm:px-6 py-6">
            <h5 className="text-center text-black text-[1.25rem]"><b>Policy Sign off</b></h5>

            <p className="m-4">
              My signature below confirms my understanding of the Enrollment Agreement,
              school policies, my tuition obligation, my responsibility for the payment of
              fees, and confirms that I have received and read a copy of the parent
              handbook.
            </p>

            <div className="m-2 mb-3">
              <div className="form-group flex items-center gap-2">
                <input
                  type="checkbox"
                  className="input-checkbox custom-checkbox"
                  id="security_release_policy_form"
                  name="security_release_policy_form"
                />
                <label
                  className="form-check-label"
                  htmlFor="security_release_policy_form"
                >
                  <span>
                    <b>I agree Security Release &amp; Policy Acknowledgement.</b>
                  </span>
                </label>
              </div>
            </div>

            <div className="m-4">
              <p style={{ textAlign: "justify" }}>
                The undersigned authorizes representatives of The Goddard School® to contact
                Emergency Medical Technicians to transport
                <input
                  type="text"
                  className="form-control inputBox text-box mx-2"
                  id="med_technicians_med_transportation_waiver"
                  name="med_technicians_med_transportation_waiver"
                />
                (“Student”) to receive medical care, if such transportation/care is deemed
                necessary.
              </p>
              <p className="pt-3">
                The undersigned irrevocably release any claims, demands, actions or causes
                of action against The Goddard School®, its franchisor, Goddard Systems,
                Inc., and their respective representatives and employees, which arise out of
                or relate to the transportation of Student and any medical care provided.
              </p>
              <p className="pt-3">
                This authorization and waiver shall remain effective until Student withdraws
                from The Goddard School®.
              </p>

              <h4 className="text-center mb-2 pt-2 text-black text-[1.5rem] font-bold">Parent Agreement</h4>
              <div className="form-group flex items-center gap-2 mt-3">
                <input
                  type="checkbox"
                  className="input-checkbox custom-checkbox"
                  id="medical_transportation_waiver"
                  name="medical_transportation_waiver"
                />
                <label
                  className="form-check-label"
                  htmlFor="medical_transportation_waiver"
                >
                  <span>
                    <b>I agree medical transportation waiver.</b>
                  </span>
                </label>
              </div>
            </div>

          </div>
        </div>


        <div ref={section15Ref}
          className="g-white border border-2 mx-auto mt-5 text-[15px] border-[#0f2d52]"

        >
          <div className="w-full border-b-2 border-[#0f2d52]" >
            <div className="flex flex-col md:flex-row w-full h-auto md:h-[180px]">
              {/* Left Logo */}
              <div
                className="w-full md:w-1/2 flex items-center justify-center border-b md:border-b-0 md:border-r-2 px-4 py-4 border-[#0f2d52]"

              >
                <img src={logo} alt="Goddard Logo" className="h-20 md:h-28 object-contain" />
              </div>

              {/* Right Title */}
              <div
                className="w-full md:w-1/2 flex items-center justify-center py-4 bg-[#0f2d52]"

              >
                <span className="text-white text-2xl md:text-3xl font-bold tracking-wide">
                  APPLICATION FOR ADMISSION
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 px-4 sm:px-6 py-6">
            <div className="p-4">
              <p className="mb-8">
                The owners and staff at The Goddard School® do all we can to promote a
                healthy environment for your children. Our teachers make sure children wash
                their hands before meals, after art projects, after toileting and
                diapering, after coming in from outside, and after wiping one's nose. Our
                teachers are required to wash their hands before serving meals or snacks
                and are sure to wear latex gloves while diapering or assisting a child with
                toileting and when coming into contact with any bodily fluids. In addition,
                we disinfect infant and toddler toys on a daily basis. Our preschool toys
                are disinfected weekly.
              </p>

              <p className="mb-8">
                The health of the children is very important to the staff at The Goddard
                School®. Children who are ill cannot be appropriately cared for in a
                childcare setting. A child who is unable to participate due to illness
                should not be in attendance. The Goddard School® staff understands that it
                may be difficult to make alternate arrangements when a child may be too ill
                to attend the program. However, cooperation in keeping a child home when
                they are showing symptoms of illness will be greatly appreciated by the
                teachers and all the children who would normally be in contact with that
                child. By establishing and maintaining a healthy environment and reasonable
                health policies, all of our children will benefit.
              </p>

              <p>
                If a child does arrive in the morning showing signs of ill health, we will
                be unable to accept him/her. The exception to this requirement would be that
                a licensed physician has examined the child and indicated, in writing, that
                there would be no health risk to your child or others, and the child is
                capable of participating in all activities, including outdoor play.
              </p>
            </div>

          </div>



        </div>



        <div ref={section16Ref}
          className="g-white border border-2 mx-auto mt-5 text-[15px] border-[#0f2d52]"

        >
          <div className="w-full border-b-2 border-[#0f2d52]" >
            <div className="flex flex-col md:flex-row w-full h-auto md:h-[180px]">
              {/* Left Logo */}
              <div
                className="w-full md:w-1/2 flex items-center justify-center border-b md:border-b-0 md:border-r-2 px-4 py-4 border-[#0f2d52]"

              >
                <img src={logo} alt="Goddard Logo" className="h-20 md:h-28 object-contain" />
              </div>

              {/* Right Title */}
              <div
                className="w-full md:w-1/2 flex items-center justify-center py-4 bg-[#0f2d52]"

              >
                <span className="text-white text-2xl md:text-3xl font-bold tracking-wide">
                  APPLICATION FOR ADMISSION
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 px-4 sm:px-6 py-6">
            <div className="p-4 md:p-6 lg:p-8">
              <h4 className="font-bold mb-4 text-lg md:text-xl lg:text-2xl">
                Examples of health symptoms that require exclusion from the program include,
                but are not limited to:
              </h4>

              <ul className="list-disc pl-6 mb-4 text-sm md:text-base lg:text-lg leading-relaxed">
                <li>Severe pain or discomfort particularly in joints, abdomen, or ears</li>
                <li>Vomiting or diarrhea (2 or more incidents within a 24 hour period)</li>
                <li>Severe coughing or sore throat</li>
                <li>
                  Temperature of 100° or more and/or accompanied by other behavior changes/
                  symptoms
                </li>
                <li>Jaundice (yellow) skin or eyes</li>
                <li>
                  Eye discharge or conjunctivitis (pink eye) until clear or until 24 hours
                  of antibiotic treatment
                </li>
                <li>
                  Infected, untreated skin patches/lesions or severe itching of body/scalp
                </li>
                <li>Difficult or rapid breathing</li>
                <li>
                  Skin rashes (excluding diaper rash) especially with fever or itching
                </li>
                <li>Swollen joints, visibly enlarged lymph nodes, or stiff neck</li>
                <li>Blood/pus from ears, skin, urine, stool</li>
                <li>
                  Unusual behavior characterized by listlessness, loss of normal appetite,
                  or confusion
                </li>
                <li>
                  Symptoms of chicken pox, impetigo, lice, scabies, or strep throat
                </li>
              </ul>

              <p className="mb-6 text-sm md:text-base lg:text-lg leading-relaxed">
                If a child becomes ill during the day, a parent will be advised immediately.
                The child will be given the opportunity to rest or have other activities in
                a separated, supervised area until a designated release person can pick up
                the child. If the child is not picked up within one hour from the time of
                notification, the emergency contact person will be called. Children who are
                sent home due to illness will not be readmitted to the school until all
                signs of illness have been gone for 24 hours. Therefore, a child who is sent
                home ill cannot return to school the following day.
              </p>
            </div>

          </div>

        </div>

        <div ref={section17Ref}
          className="g-white border border-2 mx-auto mt-5 text-[15px] border-[#0f2d52]"

        >
          <div className="w-full border-b-2 border-[#0f2d52]" >
            <div className="flex flex-col md:flex-row w-full h-auto md:h-[180px]">
              {/* Left Logo */}
              <div
                className="w-full md:w-1/2 flex items-center justify-center border-b md:border-b-0 md:border-r-2 px-4 py-4 border-[#0f2d52]"

              >
                <img src={logo} alt="Goddard Logo" className="h-20 md:h-28 object-contain" />
              </div>

              {/* Right Title */}
              <div
                className="w-full md:w-1/2 flex items-center justify-center py-4 bg-[#0f2d52]"

              >
                <span className="text-white text-2xl md:text-3xl font-bold tracking-wide">
                  APPLICATION FOR ADMISSION
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 px-4 sm:px-6 py-6">

            <div className="p-4 md:p-6 lg:p-8">
              <div className="mb-6">
                <p className="mb-4 text-sm md:text-base leading-relaxed">
                  The exception to this requirement would be that a licensed physician has
                  examined the child and has indicated in writing that the child does not
                  present a health threat to him/her or others and is able to participate in
                  all school activities, including outdoor play.
                </p>
                <p className="text-sm md:text-base leading-relaxed">
                  In cases of certain communicable diseases, The Goddard School® is required
                  to file a report with the Department of Health within 24 hours, so control
                  measures can be used. Parents and staff are reminded to notify The Goddard
                  School® within 24 hours if a child or family member has developed a known
                  or suspected communicable disease. If a child has not been fully immunized
                  for these diseases (due to the child's age, medical condition, or
                  religious belief) they will be excluded from the school during the outbreak
                  of a vaccine-preventable disease, as directed by Washington State
                  Department of Health. Examples of "Reportable Diseases" include (but are
                  not limited to):
                </p>
              </div>

              {/* Responsive Table */}
              <div className="overflow-x-auto mb-6">
                <table className="w-full border border-gray-300 text-sm md:text-base">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-4 py-2">COVID-19</th>
                      <th className="border px-4 py-2">Spinal Meningitis</th>
                      <th className="border px-4 py-2">Hepatitis A</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border px-4 py-2">RSV (Respiratory Syncytial Virus)</td>
                      <td className="border px-4 py-2">Flu A/Flu B</td>
                      <td className="border px-4 py-2">Varicella / Chicken Pox</td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2">Measles / Mumps / Rubella</td>
                      <td className="border px-4 py-2">Pinkeye / Conjunctivitis</td>
                      <td className="border px-4 py-2">Giardiasis</td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2">Strep Throat</td>
                      <td className="border px-4 py-2">Salmonellosis</td>
                      <td className="border px-4 py-2">Shigellosis</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mb-4 text-sm md:text-base leading-relaxed">
                All parents will be informed in writing if a communicable disease is
                reported. The Goddard School® follows the reporting guidelines as
                established by Washington State Department of Health. A copy of these
                guidelines is on file in the Director's office and is available for your
                review.
              </p>
              <p className="mb-6 text-sm md:text-base leading-relaxed">
                Please refer to our parent handbook along with the detailed health policies
                here at{" "}
                <a
                  href="https://tinyurl.com/5x7c7nwf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600"
                >
                  https://tinyurl.com/5x7c7nwf
                </a>
              </p>

              {/* Parent Agreement */}
              <h4 className="font-bold text-center mb-4 text-lg md:text-xl lg:text-2xl">
                Parent Agreement
              </h4>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-blue-600 border-[3px] border-gray-300 rounded"
                  id="do_you_agree_this_health_policies"
                  name="do_you_agree_this_health_policies"
                />
                <label
                  className="text-sm md:text-base"
                  htmlFor="do_you_agree_this_health_policies"
                >
                  <b>I agree health policies.</b>
                </label>
              </div>
            </div>

          </div>

        </div>


        <div ref={section18Ref}
          className="g-white border border-2 mx-auto mt-5 text-[15px] border-[#0f2d52]"

        >
          <div className="w-full border-b-2 border-[#0f2d52]" >
            <div className="flex flex-col md:flex-row w-full h-auto md:h-[180px]">
              {/* Left Logo */}
              <div
                className="w-full md:w-1/2 flex items-center justify-center border-b md:border-b-0 md:border-r-2 px-4 py-4 border-[#0f2d52]"

              >
                <img src={logo} alt="Goddard Logo" className="h-20 md:h-28 object-contain" />
              </div>

              {/* Right Title */}
              <div
                className="w-full md:w-1/2 flex items-center justify-center py-4 bg-[#0f2d52]"

              >
                <span className="text-white text-2xl md:text-3xl font-bold tracking-wide">
                  APPLICATION FOR ADMISSION
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 px-4 sm:px-6 py-6">
            <div className="pt-1 px-4 md:px-6 lg:px-8">
              <div className="mb-6">
                <p className="mb-4 text-sm md:text-base leading-relaxed">
                  Parent(s) of student(s) enrolled at The Goddard School Lynnwood may
                  request one or more employees of The Goddard School Lynnwood to provide
                  childcare services (baby-sitting/transportation) outside of school
                  premises and school hours.
                </p>

                <h3 className="text-lg md:text-xl font-bold mb-4">
                  Parents and employees agree as follows:
                </h3>

                <ul className="list-disc pl-6 text-sm md:text-base leading-relaxed space-y-2">
                  <li>
                    Parents acknowledge that they have requested that Employee provide
                    Babysitting Services/Transportation solely for Parents' convenience and
                    benefit, and not for the convenience or benefit of the School.
                  </li>
                  <li>
                    Parents acknowledge that, in providing Transportation and/or Babysitting
                    Services, Employee is acting as an independent contractor and not as an
                    employee of the School. Parents acknowledge that providing
                    Transportation and Babysitting Services is not part of Employee's job
                    with the School and that the School is not requesting that Employee
                    provide these services.
                  </li>
                  <li>
                    Parents acknowledge that the School has not reviewed Employee's driving
                    record and makes no representations regarding Employee's driving history
                    or ability or the existence or scope of Employee's insurance.
                  </li>
                  <li>
                    Parents interested in hiring a teacher(s) for outside services must ask
                    if the teacher is interested. The admin team will not aid in finding
                    someone to facilitate before/after hour care.
                  </li>
                  <li>
                    When hiring for outside engagements, parents ensure that staff work
                    hours at school are not disturbed.
                  </li>
                  <li>
                    If there is a matter of contention between the staff hired and the
                    family, management is not liable to mediate or take disciplinary actions
                    against the staff based on what happened outside the school.
                  </li>
                </ul>
              </div>

              <h4 className="font-bold mb-4 text-center text-lg md:text-xl lg:text-2xl">
                Parent Agreement
              </h4>

              <div className="flex items-center gap-2 mb-8">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded"
                  id="parent_sign_outside_waiver"
                  name="parent_sign_outside_waiver"
                />
                <label
                  htmlFor="parent_sign_outside_waiver"
                  className="text-sm md:text-base leading-snug"
                >
                  <b>I have read this agreement and understand its terms.</b>
                </label>
              </div>
            </div>

          </div>

        </div>

        <div ref={section19Ref}
          className="g-white border border-2 mx-auto mt-5 text-[15px] border-[#0f2d52]"

        >
          <div className="w-full border-b-2 border-[#0f2d52]">
            <div className="flex flex-col md:flex-row w-full h-auto md:h-[180px]">
              {/* Left Logo */}
              <div
                className="w-full md:w-1/2 flex items-center justify-center border-b md:border-b-0 md:border-r-2 px-4 py-4 border-[#0f2d52]"

              >
                <img src={logo} alt="Goddard Logo" className="h-20 md:h-28 object-contain" />
              </div>

              {/* Right Title */}
              <div
                className="w-full md:w-1/2 flex items-center justify-center py-4 bg-[#0f2d52]"

              >
                <span className="text-white text-2xl md:text-3xl font-bold tracking-wide">
                  APPLICATION FOR ADMISSION
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 sm:px-6 py-6">

            <h3 className="text-[1.75rem] text-black text-center"><b>Facebook</b></h3>
            <h3 className="text-[1.75rem] text-black text-center"><b>Instagram</b></h3>
          </div>

          <div className="grid grid-cols-1 gap-6 px-4 sm:px-6 py-6">
            <p>I hereby grant permission for The Goddard School to utilize any photographs
              and/or
              video footage of my child, whose name is provided below, for social media
              purposes.
              Neither the child's name nor any other identifying details will be mentioned.
            </p>

            <div className="space-y-6 px-4 md:px-6 lg:px-8">
              {/* Radio Options */}
              <div id="approval" className="mb-4">
                <p className="font-bold mb-2">Select One:</p>
                <div className="space-y-2">

                  <input
                    name="approve_social_media_post"
                    id="approve_social_media_post1"
                    value="approve_social_media_post"
                    type="radio"
                    defaultChecked
                    className="w-4 h-4 text-blue-600"
                  />
                  <label htmlFor="approve_social_media_post1" className="text-sm md:text-base pl-3">
                    Approve Social Media Postings
                  </label>


                  <input
                    name="approve_social_media_post"
                    id="approve_social_media_post2"
                    value="do_not_approve_social_media_post"
                    type="radio"
                    className="w-4 h-4 ml-5 text-blue-600"
                  />
                  <label htmlFor="approve_social_media_post2" className="text-sm md:text-base pl-3">
                    Do NOT Approve Postings to Social Media
                  </label>

                </div>
              </div>

              {/* Printed Name */}
              <div>
                <label htmlFor="printed_name_social_media_post" className="block font-bold mb-1">
                  Printed Name
                </label>
                <input
                  type="text"
                  className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                  id="printed_name_social_media_post"
                  name="printed_name_social_media_post"
                />
              </div>

              {/* Checkbox Agreement */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded"
                  id="do_you_agree_this_social_media_post"
                  name="do_you_agree_this_social_media_post"
                />
                <label htmlFor="do_you_agree_this_social_media_post" className="text-sm md:text-base">
                  <b>I have read this agreement and understand its terms.</b>
                </label>
              </div>

              {/* Signature and Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="parent_sign_admission" className="block font-bold mb-1">
                    Parent Signature
                  </label>
                  <input
                    type="text"
                    className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                    id="parent_sign_admission"
                    name="parent_sign_admission"
                  />
                </div>
                <div>
                  <label htmlFor="parent_sign_date_admission" className="block font-bold mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent" style={{paddingBottom:"10px"}}
                    id="parent_sign_date_admission"
                    name="parent_sign_date_admission"
                  />
                </div>
              </div>
            </div>

          </div>

        </div>


      </div>
    </>
  );
});

export default AdmissionSection;

// ===================================

// App.js (Main component)
