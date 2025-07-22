import React from 'react';

const StatusSelect = ({ 
  value, 
  onChange, 
  options, 
  label, 
  className = "",
  placeholder = "Select status"
}) => {
  return (
    <div className={`flex items-center relative ${className}`}>
      {label && (
        <label className="mr-2 font-bold text-lg">{label}:</label>
      )}
      <div className="relative flex-1">
        <select
          className="w-full p-2 border border-blue-900 rounded bg-white appearance-none pr-8"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option className="text-gray-500"value="" disabled>{placeholder}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-5 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-black"></div>
        </div>
      </div>
    </div>
  );
};

export default StatusSelect;