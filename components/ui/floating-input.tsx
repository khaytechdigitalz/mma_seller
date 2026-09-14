import React from "react";
import { cn } from "@/lib/utils";

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, label, id, ...props }, ref) => {
    // Generate a unique ID if not provided, though typically controlled by parent for accessibility
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="relative">
        <input
          type="text"
          id={inputId}
          className={cn(
            "block px-3.5 py-4 w-full h-14 text-sm text-light-primary-text bg-transparent rounded-full border border-gray-500/20 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer",
            className,
          )}
          placeholder=" "
          ref={ref}
          {...props}
        />
        <label
          htmlFor={inputId}
          className="absolute text-sm text-primary duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-left left-3.5 bg-white peer-placeholder-shown:bg-transparent peer-focus:bg-white px-1 peer-focus:px-1 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:text-light-disabled-text peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1 cursor-text"
        >
          {label}
        </label>
      </div>
    );
  },
);

FloatingInput.displayName = "FloatingInput";

export { FloatingInput };
