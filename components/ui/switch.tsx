"use client";

import * as React from "react";
import { Switch as HeadlessSwitch } from "@headlessui/react";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

export default function Switch({
  checked,
  onChange,
  className = "",
  disabled = false,
}: SwitchProps) {
  return (
    <HeadlessSwitch
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className={`${
        checked ? "bg-primary/30" : "bg-gray-500"
      } relative inline-flex h-3.5 w-8.5 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } ${className}`}
    >
      <span
        className={`${
          checked ? "translate-x-4 bg-primary" : "-translate-x-0.5 bg-white"
        } inline-block h-5 w-5 transform rounded-full shadow transition-all duration-200 ease-in-out`}
      />
    </HeadlessSwitch>
  );
}
