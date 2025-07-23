import React from 'react';


const FormInput = ({ 
  id, 
  name, 
  type = "text", 
  value, 
  onChange, 
  placeholder,
  required = false,
  showPasswordToggle = false,
  onTogglePassword,
  showPassword = false
}) => {
  const inputClasses = "w-full px-3 bg-white py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900";
  
  return (
    <div className="mb-4">
      {showPasswordToggle ? (
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            className={inputClasses}
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
            onClick={onTogglePassword}
          >
            <i className={` ${showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'} text-[#002e4d]`}></i>
          </button>
        </div>
      ) : (
        <input
          type={type}
          className={inputClasses}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
        />
      )}
    </div>
  );
};

export default FormInput;