import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, id, ...props }, ref) => {
    // Generate a stable ID if one isn't provided to link label and input
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="relative">
        <input
          type={type}
          id={inputId}
          className={cn(
            "block w-full rounded-full border border-gray-300 bg-transparent px-6 pb-2.5 pt-5 text-sm text-gray-900 appearance-none focus:border-primary focus:outline-none focus:ring-0 peer",
            className,
          )}
          placeholder=""
          ref={ref}
          {...props}
        />
        <label
          htmlFor={inputId}
          className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-left start-6 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 bg-white px-2 cursor-text"
        >
          {label}
        </label>
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
