"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { ImageAdd } from "@/icons"; // Assuming ImageAdd is the one looking like the screenshot
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  onFileSelect?: (file: File) => void;
  title?: string;
  description?: string;
  maxSizeText?: string;
  accept?: string;
  className?: string;
  preview?: string | null;
  onClear?: () => void;
}

export default function FileUploader({
  onFileSelect,
  title = "Upload Cover photo",
  description = "Allowed *.jpeg, *.jpg, *.png, *.gif",
  maxSizeText = "Max size of 3.1 MB",
  accept = ".jpeg,.jpg,.png,.gif",
  className,
  preview: controlledPreview,
  onClear,
  icon = <ImageAdd className="size-10" />,
}: FileUploaderProps & { icon?: React.ReactNode }) {
  const [internalPreview, setInternalPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const preview =
    controlledPreview !== undefined ? controlledPreview : internalPreview;

  const handleFile = (file: File) => {
    if (onFileSelect) {
      onFileSelect(file);
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setInternalPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInternalPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onClear) {
      onClear();
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={accept}
        onChange={handleChange}
      />
      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="group relative flex h-full min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-500/30 bg-white p-6 text-center transition-colors hover:bg-gray-50"
      >
        {preview ? (
          <div className="relative flex h-[160px] w-full items-center justify-center">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-contain"
            />
            <button
              onClick={handleClear}
              className="absolute -right-2 -top-2 rounded-full border border-gray-500/20 bg-white p-1 text-light-secondary-text shadow-md opacity-0 transition-opacity group-hover:opacity-100 hover:text-error"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full text-light-primary-text">
              {icon}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-light-secondary-text">
                {title}
              </p>
              <p className="text-xs text-light-secondary-text">
                {description}
                <br />
                {maxSizeText}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
