import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, id, children, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;

    return (
      <div className="relative">
        <select
          id={selectId}
          className={cn(
            "block w-full rounded-full border border-gray-300 bg-transparent px-6 pb-2.5 pt-5 text-sm text-gray-900 appearance-none focus:border-primary focus:outline-none focus:ring-0 peer",
            className,
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <label
          htmlFor={selectId}
          className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] start-6 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 bg-white px-2 cursor-text"
        >
          {label}
        </label>
        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500 peer-focus:text-primary">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
    );
  },
);
Select.displayName = "Select";

export { Select };
