import { useRef } from "react";
import "./index.css"; 
import logo from "../../../public/image/goddrd logo.png";
function ACHForm() {
  const contentRef = useRef();

  return (
    <div className="min-h-screen my-5 sm:my-10 px-2 sm:px-4">
      <div
        ref={contentRef}
        className="bg-white border-2 border-[#0f2d52] max-w-full lg:max-w-6xl mx-auto text-[#0f2d52] text-xs sm:text-sm md:text-[15px] text-black overflow-hidden" // Main change: md:text-[15px] added here
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
              <span className="text-white text-xl sm:text-2xl md:text-3xl font-bold tracking-wide text-center">
                Authorization ACH
              </span>
            </div>
          </div>
        </div>

        <div className="px-3 sm:px-4 md:px-6">
          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 px-0 py-6 sm:py-8 md:py-10 lg:py-15">
            <div>
              <label className="font-bold block mb-1 text-xs sm:text-sm md:text-[15px]">Bank Routing</label> {/* md:text-[15px] added */}
              <input type="text" className="underline-input w-full text-sm sm:text-base md:text-[15px]" /> {/* md:text-[15px] added */}
            </div>
            <div>
              <label className="font-bold block mb-1 text-xs sm:text-sm md:text-[15px]">Bank Account</label> {/* md:text-[15px] added */}
              <input type="text" className="underline-input w-full text-sm sm:text-base md:text-[15px]" /> {/* md:text-[15px] added */}
            </div>
            <div>
              <label className="font-bold block mb-1 text-xs sm:text-sm md:text-[15px]">Driver’s License</label> {/* md:text-[15px] added */}
              <input type="text" className="underline-input w-full text-sm sm:text-base md:text-[15px]" /> {/* md:text-[15px] added */}
            </div>
            <div>
              <label className="font-bold block mb-1 text-xs sm:text-sm md:text-[15px]">State</label> {/* md:text-[15px] added */}
              <input type="text" className="underline-input w-full text-sm sm:text-base md:text-[15px]" /> {/* md:text-[15px] added */}
            </div>
          </div>

          {/* Statement of Authorization */}
          <div className="px-0 pb-3 sm:pb-4">
            <div className="text-center font-bold text-base sm:text-lg md:text-xl mb-2">
              Statement of authorization
            </div>
            <p className="font-semibold mb-2 sm:mb-3 leading-relaxed text-justify text-xs sm:text-sm md:text-[15px]"> {/* md:text-[15px] added */}
              I{" "}
              <input
                type="text"
                className="underline-input inline-block w-24 sm:w-40 md:w-60 align-baseline text-xs sm:text-sm md:text-[15px]" // md:text-[15px] added
              />{" "}
              hereby authorize (Alphabetz Corp, dba The Goddard School) to charge
              my above referenced bank account for the invoiced amount once each
              month on the 1st day of the month until changed by me in writing in
              the future. This will constitute the paid tuition for my child(ren)
              during the period designated. For wait-listed/newly enrolled
              families this is a one-time charge and not a recurring one until
              they start the school.
            </p>
            <p className="font-bold leading-snug text-justify text-xs sm:text-sm md:text-[15px]"> {/* md:text-[15px] added */}
              Please provide us 10 days advance notice should you wish to put a stop
              to this authorization. An automatic electronic authorization of the
              monthly transaction will take place and an email-generated receipt
              will be automatically sent to the email address provided to us above.
              A copy of this document will be scanned and saved in an electronic
              file, the original will be shredded for your protection.
            </p>
          </div>

          {/* Parent Agreement */}
          <div className="text-center font-semibold text-lg sm:text-xl md:text-2xl mb-2 sm:mb-3 mt-3 sm:mt-4">
            Parent Agreement
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 px-0 pb-5 sm:pb-6 md:pb-8">
            <div>
              <label className="font-bold block mb-1 text-xs sm:text-sm md:text-[15px]">Parent Signature</label> {/* md:text-[15px] added */}
              <input type="text" className="underline-input w-full text-sm sm:text-base md:text-[15px]" /> {/* md:text-[15px] added */}
            </div>
            <div>
              <label className="font-bold block mb-1 text-xs sm:text-sm md:text-[15px]">Date</label> {/* md:text-[15px] added */}
              <input type="date" className="underline-input w-full text-sm sm:text-base md:text-[15px]" /> {/* md:text-[15px] added */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ACHForm;