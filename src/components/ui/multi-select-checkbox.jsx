import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormItem, FormLabel } from "@/components/ui/form";

const MultiSelectCheckbox = ({ options, value, onChange }) => {
  const handleCheckedChange = (checked, optionValue) => {
    if (checked) {
      onChange([...(value || []), optionValue]);
    } else {
      onChange((value || []).filter((v) => v !== optionValue));
    }
  };

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2">
      {options.map((option) => (
        <FormItem key={option.value} className="flex items-center space-x-2 space-y-0">
          <FormControl>
            <Checkbox
              checked={(value || []).includes(option.value)}
              onCheckedChange={(checked) => handleCheckedChange(checked, option.value)}
            />
          </FormControl>
          <FormLabel className="font-normal">{option.label}</FormLabel>
        </FormItem>
      ))}
    </div>
  );
};

export default MultiSelectCheckbox;