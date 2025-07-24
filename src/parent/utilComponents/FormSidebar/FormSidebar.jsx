import React, { useState } from 'react';
import useFormStatus from './FormStatusLogic';
import FormSection from './FormSection';
import { formSections, formNameMapping } from './formSections';

const FormSidebar = ({
  activeChildId,
  onSectionChange,
  selectedSubForm,
  onHideCompleted,
  onToggleCompleted,
  onSubFormChange,
  incompleteForms,
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { formStatus, handleToggle, openSection, toggleCompleted, loading } = useFormStatus(activeChildId);

  const availableFormSections = formSections.filter(section => {
    if (incompleteForms !== undefined && Array.isArray(incompleteForms)) {
      return incompleteForms.some(apiFormName => formNameMapping[apiFormName] === section.key);
    }
    return !formStatus[section.key]?.completed;
  });

  const handleSectionClick = (sectionKey) => {
    handleToggle(sectionKey);
    onHideCompleted?.();
    onSectionChange?.(sectionKey);
    onSubFormChange?.(null);
  };

  const handleItemClick = (sectionKey, itemName) => {
    onHideCompleted?.();
    onSectionChange?.(sectionKey);
    onSubFormChange?.(itemName);
    setIsMobileOpen(false);
  };

  const handleToggleCompleted = () => {
    onToggleCompleted?.() ?? toggleCompleted();
  };

  const sidebarContent = (
    <div className="p-3">
      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#0F2D52]"></div>
          <p className="mt-2 text-sm">Loading forms...</p>
        </div>
      )}

      <div className="bg-[#0F2D52] text-white text-center py-2 mt-3 font-medium rounded">
        Incomplete {!loading && (`${availableFormSections.length}`)}
      </div>

      <div className="mt-2 space-y-2">
        {availableFormSections.length > 0 ? (
          availableFormSections.map((section) => (
            <FormSection
              key={section.key}
              section={section}
              formStatus={formStatus}
              isOpen={openSection === section.key}
              onToggle={() => handleSectionClick(section.key)}
              onItemClick={handleItemClick}
              selectedSubForm={selectedSubForm}
            />
          ))
        ) : (
          <div className="text-center py-4 px-2 text-gray-600">
            <p className="text-sm">No forms available</p>
          </div>
        )}
      </div>

      <div className="mt-4">
        <button
          onClick={handleToggleCompleted}
          className="w-full bg-[#0F2D52] text-white py-2 font-semibold rounded cursor-pointer hover:bg-[#1a3a6b]"
        >
          View All Completed Forms
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop View */}
      <div className="hidden lg:block bg-white rounded-md shadow-md text-sm font-sans m-3 w-full max-w-xs">
        <h2 className="bg-[#0F2D52] text-white font-bold text-center rounded-t-md py-2">
          Forms Status
        </h2>
        {sidebarContent}
      </div>

      {/* Mobile + Tablet View */}
      <div className="lg:hidden">
        {/* Top Navbar */}
        <div className="bg-[#0F2D52] text-white font-bold text-base flex items-center justify-between px-4 py-2">
          <span>Forms Status</span>
          <button onClick={() => setIsMobileOpen(true)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Overlay */}
        <div
          className={`fixed inset-0  bg-opacity-50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
            isMobileOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
          onClick={() => setIsMobileOpen(false)}
        ></div>

        {/* Slide-In Sidebar */}
        <div
          className={`fixed top-0 left-0 z-50 h-full w-72 sm:w-80 bg-white shadow-md transform transition-transform duration-300 ease-in-out ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between p-3 border-b">
            <h2 className="text-[#0F2D52] font-bold text-base">Forms Status</h2>
            <button onClick={() => setIsMobileOpen(false)} className="text-gray-700 hover:text-black">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {sidebarContent}
        </div>
      </div>
    </>
  );
};

export default FormSidebar;
