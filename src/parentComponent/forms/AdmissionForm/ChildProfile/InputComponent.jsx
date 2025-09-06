import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup as ShadcnRadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const FormInput = ({ label, type = "text", value, onChange, placeholder, name, className }) => {
    const getInputBorderClass = (value) => {
        if (value && typeof value === 'string' && value.trim() !== '') {
            return 'border-green-500 focus-visible:ring-green-500';
        } else {
            return 'border-red-500 focus-visible:ring-red-500';
        }
    };

    return (
        <div className={cn("space-y-2", className)}>
            <Label htmlFor={name} className="text-sm font-medium text-gray-700">
                {label}
            </Label>
            <Input
                id={name}
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={cn("w-full transition-colors", getInputBorderClass(value))}
            />
        </div>
    );
};

const RadioGroup = ({ label, name, options, selectedValue, onChange, className }) => {
    const handleValueChange = (value) => {
        onChange({ target: { name, value } });
    };

    return (
        <div className={cn("space-y-3", className)}>
            <Label className="text-sm font-medium text-gray-700">{label}</Label>
            <ShadcnRadioGroup value={selectedValue} onValueChange={handleValueChange}>
                <div className="flex space-x-6">
                    {options.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={option.value} id={`${name}-${option.value}`} />
                            <Label 
                                htmlFor={`${name}-${option.value}`} 
                                className="text-sm text-gray-700 cursor-pointer"
                            >
                                {option.label}
                            </Label>
                        </div>
                    ))}
                </div>
            </ShadcnRadioGroup>
        </div>
    );
};

const CheckboxGroup = ({ label, name, options, selectedValues = [], onChange, className }) => {
    // Handle toggle logic
    const handleCheckboxChange = (value, checked) => {
        if (checked) {
            onChange([...selectedValues, value]);
        } else {
            onChange(selectedValues.filter((v) => v !== value));
        }
    };

    return (
        <div className={cn("space-y-3", className)}>
            <Label className="text-sm font-medium text-gray-700">{label}</Label>
            <div className="flex space-x-6">
                {options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                            id={`${name}-${option.value}`}
                            checked={selectedValues.includes(option.value)}
                            onCheckedChange={(checked) => handleCheckboxChange(option.value, checked)}
                        />
                        <Label 
                            htmlFor={`${name}-${option.value}`}
                            className="text-sm font-medium text-gray-700 cursor-pointer"
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
