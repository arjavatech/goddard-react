import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const CheckboxWithLabel = ({ id, checked, onChange, label }) => {
  return (
    <div className="flex items-center space-x-3 pt-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-[#0F2D52] data-[state=checked]:border-[#0F2D52]"
      />
      <Label htmlFor={id} className="font-bold text-base cursor-pointer">
        {label}
      </Label>
    </div>
  );
};

export default CheckboxWithLabel;