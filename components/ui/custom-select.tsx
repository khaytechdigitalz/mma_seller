import { Fragment } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react";

import { ChevronDown } from "../../icons";

export interface Option {
  label: string;
  value: string | number;
}

interface CustomSelectProps {
  value: Option | null;
  onChange: (value: Option | null) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select option",
  className = "",
}: CustomSelectProps) {
  return (
    <div className="relative  w-full">
      <Listbox value={value} onChange={onChange}>
        {({ open }) => (
          <div className="relative  w-full">
            <ListboxButton
              className={`relative h-9 ring inline-flex text-sm items-center justify-between ring-[rgba(145,158,171,0.20)] w-full cursor-default rounded-full bg-gray-200 px-3 py-2 text-left focus:outline-none ${className}`}
            >
              <span
                className={`block truncate ${
                  value
                    ? "text-light-primary-text"
                    : "text-light-secondary-text"
                }`}
              >
                {value ? value.label : placeholder}
              </span>
              <span className="pointer-events-none flex items-center pl-2">
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </span>
            </ListboxButton>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <ListboxOptions className="absolute focus:outline-none mt-1 max-h-60 min-w-full overflow-auto rounded-lg bg-white p-2 border border-gray-500/20 z-50 shadow-light-z-24">
                {options.map((option, idx) => (
                  <ListboxOption
                    key={idx}
                    className={({ active, selected }) =>
                      `relative cursor-pointer  text-sm rounded-lg select-none px-3 py-1.5 ${
                        active
                          ? "bg-gray-100 text-light-primary-text"
                          : "text-light-secondary-text"
                      } ${selected ? "font-medium" : "font-normal"}`
                    }
                    value={option}
                  >
                    {({ selected }) => (
                      <span className={`block text-sm truncate`}>
                        {option.label}
                      </span>
                    )}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </Transition>
          </div>
        )}
      </Listbox>
    </div>
  );
}
