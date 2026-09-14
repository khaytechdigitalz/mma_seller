import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | "success"
    | "warning"
    | "error"
    | "info"
    | "default"
    | "success-outline"
    | "warning-outline"
    | "error-outline"
    | "info-outline"
    | "active";
  className?: string;
}

const variantStyles = {
  success: "bg-primary-alpha-16 text-primary-dark",
  warning: "bg-warning-alpha-16 text-warning-dark",
  error: "bg-error-alpha-16 text-error-dark",
  info: "bg-info-lighter text-info-dark",
  default: "bg-gray-100 text-gray-700",
  "success-outline": "bg-transparent border border-primary text-primary",
  "warning-outline": "bg-transparent border border-warning text-warning",
  "error-outline": "bg-transparent border border-error text-error",
  "info-outline": "bg-transparent border border-info text-info",
  active: "bg-success-alpha-16 text-success-dark",
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  className,
}) => {
  return (
    <span
      className={cn(
        "px-2 py-1 h-5.5 inline-flex items-center justify-center font-public-sans leading-5 rounded-full text-xs font-medium",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
};
