"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { UserIcon } from "@/icons";
import { cva, type VariantProps } from "class-variance-authority";

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full items-center justify-center font-medium text-gray-600",
  {
    variants: {
      size: {
        xs: "size-6 text-[10px]",
        sm: "size-8 text-xs",
        md: "size-10 text-sm",
        lg: "size-12 text-base",
        xl: "size-14 text-lg",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export interface AvatarProps extends VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  fallback?: React.ReactNode;
  className?: string;
  width?: number;
  height?: number;
}

export function Avatar({
  src,
  alt = "Avatar",
  fallback,
  className,
  size,
  width,
  height,
}: AvatarProps) {
  const [hasError, setHasError] = useState(false);

  const [prevSrc, setPrevSrc] = useState(src);

  if (src !== prevSrc) {
    setPrevSrc(src);
    setHasError(false);
  }

  // Use inline style for width/height if explicitly provided, overriding size classes
  const style = width || height ? { width, height } : undefined;

  return (
    <div className={cn(avatarVariants({ size }), className)} style={style}>
      {src && !hasError ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="aspect-square h-full w-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-gray-500">
          {fallback || <UserIcon className="size-1/2" />}
        </span>
      )}
    </div>
  );
}
