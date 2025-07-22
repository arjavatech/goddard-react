import React from 'react';

const Alert = ({ show, type, message, onClose }) => {
  if (!show) return null;

  return (
    <div
    className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] p-4 w-full max-w-md sm:max-w-lg mx-4 rounded border shadow-lg ${
      type === 'success'
        ? 'bg-green-100 border-green-400 text-green-700'
        : 'bg-red-100 border-red-400 text-red-700'
    }`}
  >
    <div className="flex justify-between items-start gap-4 flex-wrap">
      <span className="flex-1 text-sm sm:text-base">
        <strong>{type === 'success' ? 'Success!' : 'Oops!'}</strong> {message}
      </span>
      <button
        onClick={onClose}
        className={`px-3 py-1 rounded font-bold text-sm sm:text-base ${
          type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        } hover:opacity-80`}
      >
        OK
      </button>
    </div>
  </div>
  
  );
};

export default Alert;