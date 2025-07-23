import React from 'react';

const FormLabel = ({ htmlFor, children, required = false }) => {
  return (
    <label htmlFor={htmlFor} className="block text-lg font-bold text-gray-700 mb-2">
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
};

export default FormLabel;