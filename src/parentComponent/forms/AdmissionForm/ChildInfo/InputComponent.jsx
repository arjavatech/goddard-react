import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const FormInput = ({ label, type = "text", value, onChange, placeholder, name }) => {
    const getInputBorderClass = (value) => {
        if (value && typeof value === 'string' && value.trim() !== '') {
            return 'border-green-500 focus:ring-green-500';
        } else {
            return 'border-red-500 focus:ring-red-500';
        }
    };

    return (
        <div className="space-y-2">
            <Label htmlFor={name} className="font-medium text-gray-700">{label}</Label>
            <Input
                id={name}
                type={type}
                name={name}
                value={value || ''}
                onChange={onChange}
                placeholder={placeholder}
                className={`transition-colors ${getInputBorderClass(value)}`}
            />
        </div>
    );
};

const RadioGroup = ({ label, name, options, selectedValue, onChange }) => {
    return (
        <div className="space-y-3">
            <Label className="font-medium text-gray-700">{label}</Label>
            <div className="flex space-x-6">
                {options.map((option) => (
                    <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="radio"
                            name={name}
                            value={option.value}
                            checked={selectedValue === option.value}
                            onChange={onChange}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                        />
                        <span className="text-sm font-medium">{option.label}</span>
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
        <div className="space-y-3">
            <Label className="font-medium text-gray-700">{label}</Label>
            <div className="flex space-x-6">
                {options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                            id={`${name}-${option.value}`}
                            checked={selectedValues.includes(option.value)}
                            onCheckedChange={() => handleCheckboxChange(option.value)}
                        />
                        <Label htmlFor={`${name}-${option.value}`} className="text-sm font-bold cursor-pointer">
                            {option.label}
                        </Label>
                    </div>
                ))}
            </div>
        </div>
    );
};

export { FormInput, RadioGroup, CheckboxGroup };
