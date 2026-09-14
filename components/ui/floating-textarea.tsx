import React from "react";
import { cn } from "@/lib/utils";

interface FloatingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

const FloatingTextarea = React.forwardRef<
  HTMLTextAreaElement,
  FloatingTextareaProps
>(({ className, label, id, ...props }, ref) => {
  const generatedId = React.useId();
  const inputId = id || generatedId;

  return (
    <div className="relative">
      <textarea
        id={inputId}
        className={cn(
          "block px-3.5 py-4 w-full text-sm text-light-primary-text bg-transparent rounded-2xl border border-gray-500/20 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer h-[150px] resize-none",
          className,
        )}
        placeholder=" "
        ref={ref}
        {...props}
      />
      <label
        htmlFor={inputId}
        className="absolute text-sm text-primary duration-300 transform -translate-y-4 scale-75 top-2 z-10 left-3.5 origin-left bg-white peer-placeholder-shown:bg-transparent peer-focus:bg-white px-1 peer-focus:px-2 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:text-light-disabled-text peer-placeholder-shown:translate-y-3 peer-placeholder-shown:top-1 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1 cursor-text"
      >
        {label}
      </label>
    </div>
  );
});

FloatingTextarea.displayName = "FloatingTextarea";

export { FloatingTextarea };
