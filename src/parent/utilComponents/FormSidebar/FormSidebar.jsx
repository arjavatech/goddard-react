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
      return incompleteForms.some(apiFormName => 
        formNameMapping[apiFormName] === section.key
      );
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
    <>
      <div className="bg-[#0F2D52] text-white text-center py-2 mt-3 font-medium rounded">
        Incomplete {!loading && `(${availableFormSections.length})`}
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
          className="w-full bg-[#0F2D52] text-white py-2 font-semibold rounded cursor-pointer hover:bg-[#1a3a6b] transition-colors duration-200"
        >
          View All Completed Forms
        </button>
      </div>
    </>
  );

  return (
    <div className="w-full max-w-xs mx-auto mt-2 bg-white shadow-lg  overflow-hidden md:sticky md:top-4 md:h-[calc(100vh-1rem)] md:max-h-[calc(100vh-1rem)] md:overflow-y-auto"> 
      {/* Mobile View */}
      <div className="md:hidden">
        {/* Mobile Header - Always visible */}
        <div className="flex justify-between items-center bg-[#0F2D52] text-white px-4 py-2 ">
          <h2 className="font-bold text-base">Forms Status</h2>
          <button 
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-1 transition-transform duration-200 hover:scale-110"
            aria-expanded={isMobileOpen}
          >
            <svg 
              className={`w-6 h-6 transition-transform duration-300 ${isMobileOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round"
                d={isMobileOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
              />
            </svg>
          </button>
        </div>

        {/* Mobile Content - Slides down from header */}
        <div 
          className={`bg-white shadow-md overflow-hidden transition-all duration-300 ease-in-out ${isMobileOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="p-3">
            {sidebarContent}
          </div>
        </div>
      </div>

      {/* Desktop View - Unchanged */}
      <div className="hidden md:block bg-white shadow-md  ">
        <div className="bg-[#0F2D52] text-white font-bold text-center  py-2">
          Forms Status
        </div>
        <div className="p-3">
          {sidebarContent}
        </div>
      </div>
    </div>
  );
};

export default FormSidebar;