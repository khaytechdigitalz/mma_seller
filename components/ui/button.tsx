import React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "rounded-full inline-flex items-center justify-center cursor-pointer font-bold transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-white hover:bg-primary-dark disabled:bg-[rgba(145,158,171,0.24)] disabled:text-[rgba(145,158,171,0.80)] disabled:opacity-100",
        "primary-outline":
          "border border-primary bg-primary-lighter/20 text-primary hover:bg-primary-lighter/40",
        secondary:
          "bg-secondary text-white hover:bg-secondary-dark disabled:bg-[rgba(145,158,171,0.24)] disabled:text-[rgba(145,158,171,0.80)] disabled:opacity-100",
        outline:
          "border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:text-[rgba(145,158,171,0.80)] disabled:border-[rgba(145,158,171,0.24)] disabled:opacity-100",
        "danger-outline":
          "ring ring-[rgba(255,72,66,0.48)] text-error hover:bg-error-lighter/20",
        danger:
          "bg-error text-white hover:bg-error-dark disabled:bg-[rgba(145,158,171,0.24)] disabled:text-[rgba(145,158,171,0.80)] disabled:opacity-100",
        ghost: "text-gray-600 hover:bg-gray-100",
        icon: "text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-900 border-none shadow-none bg-transparent",
        success:
          "bg-success text-white hover:bg-success-dark disabled:bg-[rgba(145,158,171,0.24)] disabled:text-[rgba(145,158,171,0.80)] disabled:opacity-100",
        "success-outline":
          "border border-success bg-success-lighter/20 text-success hover:bg-success-lighter/40",
        warning:
          "bg-warning text-black hover:bg-warning-dark disabled:bg-[rgba(145,158,171,0.24)] disabled:text-[rgba(145,158,171,0.80)] disabled:opacity-100",
        "warning-outline":
          "border border-warning bg-warning-lighter/20 text-warning hover:bg-warning-lighter/40",
        info: "bg-info text-white hover:bg-info-dark disabled:bg-[rgba(145,158,171,0.24)] disabled:text-[rgba(145,158,171,0.80)] disabled:opacity-100",
        "info-outline":
          "border border-info bg-info-lighter/20 text-info hover:bg-info-lighter/40",
      },
      size: {
        xs: "px-4 py-1 h-7.5 text-[13px] leading-5.5",
        sm: "px-4 py-1 h-9 text-sm leading-6",
        md: "px-4 py-1.5 leading-6 h-10 text-sm",
        lg: "px-6 py-3 text-base",
        icon: "h-8 w-8 p-0 text-light-primary-text",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "sm",
    },
  },
);

interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  href?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant,
  size,
  className,
  href,
  ...props
}) => {
  // If variant is "icon" and size is not specified, use "icon" size
  const effectiveSize = variant === "icon" && !size ? "icon" : size;

  const classes = cn(
    buttonVariants({ variant, size: effectiveSize }),
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};

export { buttonVariants };
