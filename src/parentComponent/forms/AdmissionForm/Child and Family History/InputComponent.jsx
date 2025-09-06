import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const FormInput = ({ label, type = "text", value, onChange, placeholder, name }) => {
    return (
        <div className="space-y-2">
            <Label htmlFor={name} className="text-gray-700 font-medium">{label}</Label>
            <Input
                id={name}
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full"
            />
        </div>
    );
};

import { RadioGroup as ShadcnRadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const RadioGroup = ({ label, name, options, selectedValue, onChange }) => {
    const handleValueChange = (value) => {
        onChange({ target: { name, value } });
    };

    return (
        <div className="space-y-3">
            <Label className="text-gray-700 font-medium">{label}</Label>
            <ShadcnRadioGroup value={selectedValue} onValueChange={handleValueChange}>
                <div className="flex space-x-6">
                    {options.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={option.value} id={`${name}-${option.value}`} />
                            <Label htmlFor={`${name}-${option.value}`} className="text-sm font-normal">
                                {option.label}
                            </Label>
                        </div>
                    ))}
                </div>
            </ShadcnRadioGroup>
        </div>
    );
};


import { Checkbox } from '@/components/ui/checkbox';

const CheckboxGroup = ({ label, name, options, selectedValues = [], onChange }) => {
    // Handle toggle logic
    const handleCheckboxChange = (value, checked) => {
        if (checked) {
            onChange([...selectedValues, value]);
        } else {
            onChange(selectedValues.filter((v) => v !== value));
        }
    };

    return (
        <div className="space-y-3">
            {label && <Label className="text-gray-700 font-medium">{label}</Label>}
            <div className="flex flex-col space-y-3">
                {options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-3">
                        <Checkbox
                            id={`${name}-${option.value}`}
                            checked={selectedValues.includes(option.value)}
                            onCheckedChange={(checked) => handleCheckboxChange(option.value, checked)}
                        />
                        <Label 
                            htmlFor={`${name}-${option.value}`} 
                            className="text-sm font-semibold cursor-pointer"
                        >
                            {option.label}
                        </Label>
                    </div>
                ))}
            </div>
        </div>
    );
};

export { FormInput, RadioGroup, CheckboxGroup };
