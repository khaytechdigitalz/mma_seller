import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface FloatingSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
}

const FloatingSelect = React.forwardRef<HTMLSelectElement, FloatingSelectProps>(
  ({ className, label, id, children, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;

    return (
      <div className="relative">
        <select
          id={selectId}
          className={cn(
            "block px-3.5 py-2 w-full h-12 text-sm text-gray-900 bg-transparent rounded-full border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer",
            className,
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <label
          htmlFor={selectId}
          className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-left bg-white px-2 peer-focus:px-2 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1 cursor-text"
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
FloatingSelect.displayName = "FloatingSelect";

export { FloatingSelect };
