import React, { useState } from 'react';
import AdmissionForm from './forms/AdmissionForm';
import AuthorizationForm from './forms/AuthorizationForm';
import EnrollmentForm from './forms/EnrollmentForm';
import HandbookForm from './forms/HandbookForm';

const FormContent = ({ formData, incompleteForms, childId, editID, onAlert }) => {
  const [activeForm, setActiveForm] = useState(null);

  const renderActiveForm = () => {
    switch (activeForm) {
      case 'admission_form':
        return (
          <AdmissionForm
            formData={formData}
            childId={childId}
            editID={editID}
            onAlert={onAlert}
          />
        );
      case 'authorization':
        return (
          <AuthorizationForm
            formData={formData}
            childId={childId}
            editID={editID}
            onAlert={onAlert}
          />
        );
      case 'enrollment_agreement':
        return (
          <EnrollmentForm
            formData={formData}
            childId={childId}
            editID={editID}
            onAlert={onAlert}
          />
        );
      case 'parent_handbook':
        return (
          <HandbookForm
            formData={formData}
            childId={childId}
            editID={editID}
            onAlert={onAlert}
          />
        );
      default:
        return (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-600 mb-4">
              Select a form from the sidebar to begin
            </h3>
            <p className="text-gray-500">
              Choose from the available incomplete forms to continue your application.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded shadow min-h-96">
      {renderActiveForm()}
    </div>
  );
};

export default FormContent;