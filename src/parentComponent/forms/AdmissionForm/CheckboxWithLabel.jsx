import React from "react";

const CheckboxWithLabel = ({ id, checked, onChange, label }) => {
  return (
    <div className="flex items-center space-x-3 pt-2">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer hidden"
      />
      <label
        htmlFor={id}
        className="relative w-5 h-5 border-2 border-black rounded cursor-pointer flex-shrink-0"
      >
        {checked && (
          <div className="absolute inset-0 bg-[#0F2D52] text-white text-sm font-bold flex items-center justify-center rounded">
            ✓
          </div>
        )}
      </label>
      <label htmlFor={id} className="font-bold text-base select-none cursor-pointer">
        {label}
      </label>
    </div>
  );
};

export default CheckboxWithLabel;
