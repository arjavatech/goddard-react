import React from 'react';
import logo from "/image/gs_logo_branch.png";

const PDFHeader = ({ heading }) => {
  return (
    <header className="w-full border-b-2 border-[#0f2d52]">
      <div className="flex flex-row w-full h-[180px]">
        {/* Left Logo */}
        <div className="w-1/2 flex items-center justify-center border-r-2 px-4 py-4 border-[#0f2d52]">
          <img src={logo} alt="Goddard Logo" className="h-28 object-contain" />
        </div>

        {/* Right Title */}
        <div className="w-1/2 flex items-center justify-center py-4 bg-[#0f2d52]">
          <span className="text-white text-3xl font-bold tracking-wide">
            {heading}
          </span>
        </div>
      </div>
    </header>
  );
};

export default PDFHeader;
