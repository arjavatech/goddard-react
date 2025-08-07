import React from 'react';

const PDFFormInput = ({
    id,
    name,
    label,
    type = "text",
    defaultValue = "",
    maxLength,
    ...props
}) => {
    return (
        <div>
            <label htmlFor={id} className="form-label font-bold block">
                {label}
            </label>
            <input
                id={id}
                name={name}
                type={type}
                maxLength={maxLength}
                className="form-control text-box w-full border-b mt-3 text-[20px] focus:border-transparent"
                style={{ lineHeight: "1.5", minHeight: "40px" }}
                defaultValue={defaultValue}
                {...props}
            />
        </div>
    );
};

export default PDFFormInput;