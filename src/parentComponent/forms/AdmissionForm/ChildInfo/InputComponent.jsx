import React from 'react';

const FormInput = ({ label, type = "text", value, onChange, placeholder, name }) => {
    const getInputBorderClass = (value) => {
        if (value && value.trim() !== '') {
            return 'border-green-500 focus:ring-green-500';
        } else {
            return 'border-red-500 focus:ring-red-500';
        }
    };

    return (
        <div>
            <label className="block  font-medium text-gray-700 mb-2 form-label">{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full px-3 py-2 border-2 rounded-md focus:outline-none transition-colors ${getInputBorderClass(value)}`}
            />
        </div>
    );
};

const RadioGroup = ({ label, name, options, selectedValue, onChange }) => {
    return (
        <div className="mb-4">
            <label className="block  font-medium text-gray-700 mb-2">{label}</label>
            <div className="flex space-x-4">
                {options.map((option) => (
                    <label key={option.value} className="flex items-center space-x-2">
                        <input
                            type="radio"
                            name={name}
                            value={option.value}
                            checked={selectedValue === option.value}
                            onChange={onChange}
                            className="text-blue-600 focus:ring-blue-500"
                        />
                        <span>{option.label}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};


const CheckboxGroup = ({ label, name, options, selectedValues = [], onChange }) => {
    // Handle toggle logic
    const handleCheckboxChange = (value) => {
        if (selectedValues.includes(value)) {
            onChange(selectedValues.filter((v) => v !== value));
        } else {
            onChange([...selectedValues, value]);
        }
    };

    return (
        <div className="mb-4">
            <label className="block  font-medium text-gray-700 mb-2">{label}</label>
            <div className="flex space-x-4">
                {options.map((option) => (
                    <label key={option.value} className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            name={name}
                            value={option.value}
                            checked={selectedValues.includes(option.value)}
                            onChange={() => handleCheckboxChange(option.value)}
                            className="w-4 h-5 text-blue-600 border-gray-300 rounded  focus:ring-blue-500"
                        />
                        <span className='text-x font-bold'>{option.label}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

export { FormInput, RadioGroup, CheckboxGroup };
