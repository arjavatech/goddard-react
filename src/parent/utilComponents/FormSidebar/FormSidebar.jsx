import React from 'react';
import useFormStatus from './FormStatusLogic';
import FormSection from './FormSection';
import { formSections, formNameMapping } from './formSections';

const FormSidebar = ({ activeChildId, onSectionChange, selectedSubForm, onHideCompleted, onToggleCompleted, onSubFormChange, incompleteForms }) => {
  const { formStatus, handleToggle, openSection, toggleCompleted, loading } = useFormStatus(activeChildId);
  
  // Filter formSections based on incompleteForms from API
  const availableFormSections = formSections.filter(section => {
    // If incompleteForms prop is provided (even if empty array), use it
    if (incompleteForms !== undefined && Array.isArray(incompleteForms)) {
      // Empty array means all forms are complete, so no incomplete forms to show
      return incompleteForms.some(apiFormName => 
        formNameMapping[apiFormName] === section.key
      );
    }
    // Only use internal formStatus as fallback if incompleteForms is not provided at all
    return !formStatus[section.key]?.completed;
  });

  // Handle section click
  const handleSectionClick = (sectionKey) => {
    handleToggle(sectionKey);
    
    // Hide completed forms section when clicking on incomplete forms
    if (onHideCompleted) {
      onHideCompleted();
    }
    
    if (onSectionChange) {
      onSectionChange(sectionKey);
    }

    // Reset sub-form selection when clicking main section
    if (onSubFormChange) {
      onSubFormChange(null);
    }
  };

  // Handle sub-form item click
  const handleItemClick = (sectionKey, itemName) => {
    
    // Hide completed forms section
    if (onHideCompleted) {
      onHideCompleted();
    }
    
    // Set the current section
    if (onSectionChange) {
      onSectionChange(sectionKey);
    }

    // Set the selected sub-form
    if (onSubFormChange) {
      onSubFormChange(itemName);
    }
  };

  // Use parent's toggle function if provided, otherwise use local one
  const handleToggleCompleted = () => {
    if (onToggleCompleted) {
      onToggleCompleted();
    } else {
      toggleCompleted();
    }
  };

  return (
    <div className="bg-white rounded-md shadow-md text-sm font-sans m-3 w-full max-w-xs">
      <h2 className="bg-[#0F2D52] text-white font-bold text-center rounded-t-md py-2">
        Forms Status
      </h2>

      <div className="p-3">
        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#0F2D52]"></div>
            <p className="mt-2 text-sm">Loading forms...</p>
          </div>
        )}

        {/* Only show Incomplete Forms Section */}
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
            className="w-full bg-[#0F2D52] text-white py-2 font-semibold rounded cursor-pointer hover:bg-[#1a3a6b]"
          >
            View All Completed Forms
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormSidebar;