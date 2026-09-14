import React, { Fragment, useState, useRef } from "react";
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Transition,
} from "@headlessui/react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  label: string;
  value: string;
}

interface CustomFloatingSelectProps {
  label: string;
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  allowCustom?: boolean;
}

export default function CustomFloatingSelect({
  label,
  options,
  value,
  onChange,
  className,
  allowCustom,
}: CustomFloatingSelectProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const filteredOptions =
    query === ""
      ? options
      : options.filter((option) =>
          option.label.toLowerCase().includes(query.toLowerCase()),
        );

  return (
    <div className={cn("relative", className)}>
      <Combobox value={value} onChange={(val) => onChange(val || "")} nullable>
        {({ open }) => (
          <>
            <div className="relative">
              <div
                className={cn(
                  "relative w-full cursor-default overflow-hidden rounded-full border bg-transparent text-left focus-within:border-primary focus-within:ring-0 sm:text-sm transition-colors",
                  open ? "border-primary" : "border-gray-500/20",
                )}
              >
                <ComboboxInput
                  ref={inputRef}
                  className={cn(
                    "w-full border-none py-4 pl-3.5 pr-10 text-sm leading-5 text-light-primary-text focus:outline-none bg-transparent h-14",
                    className,
                  )}
                  displayValue={(val: string) =>
                    options.find((opt) => opt.value === val)?.label || ""
                  }
                  onChange={(event) => setQuery(event.target.value)}
                  onFocus={(e) => {
                    e.target.select();
                    if (!open) buttonRef.current?.click();
                  }}
                  onClick={() => {
                    if (!open) buttonRef.current?.click();
                  }}
                  autoComplete="off"
                />
                <ComboboxButton
                  ref={buttonRef}
                  className="absolute inset-y-0 right-0 flex items-center pr-4"
                >
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-light-secondary-text transition-transform duration-200",
                      open && "rotate-180",
                    )}
                    aria-hidden="true"
                  />
                </ComboboxButton>
              </div>

              <label
                onClick={() => inputRef.current?.focus()}
                className={cn(
                  "absolute start-1 bg-white px-1 origin-left text-sm left-3.5 cursor-text transition-all duration-300",
                  value || open || query
                    ? "top-2 -translate-y-4 scale-75 text-primary"
                    : "top-1/2 -translate-y-1/2 scale-100 text-light-disabled-text",
                )}
              >
                {label}
              </label>

              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                afterLeave={() => setQuery("")}
              >
                <ComboboxOptions className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-50 custom-scrollbar">
                  {filteredOptions.length === 0 && query !== "" ? (
                    allowCustom ? (
                      <ComboboxOption
                        value={query}
                        className={({ active }) =>
                          cn(
                            "relative cursor-default select-none py-2 pl-4 pr-4",
                            active
                              ? "bg-primary-lighter text-primary-darker"
                              : "text-gray-900",
                          )
                        }
                      >
                        Create "{query}"
                      </ComboboxOption>
                    ) : (
                      <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                        Nothing found.
                      </div>
                    )
                  ) : (
                    <>
                      {filteredOptions.map((option) => (
                        <ComboboxOption
                          key={option.value}
                          className={({ active }) =>
                            cn(
                              "relative cursor-default select-none py-2 pl-4 pr-4",
                              active
                                ? "bg-primary-lighter text-primary-darker"
                                : "text-gray-900",
                            )
                          }
                          value={option.value}
                        >
                          {({ selected, active }) => (
                            <div className="flex items-center justify-between">
                              <span
                                className={cn(
                                  "block truncate",
                                  selected ? "font-medium" : "font-normal",
                                )}
                              >
                                {option.label}
                              </span>
                              {selected ? (
                                <span
                                  className={cn(
                                    "flex items-center pl-3",
                                    active
                                      ? "text-primary-darker"
                                      : "text-primary",
                                  )}
                                >
                                  <Check
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                  />
                                </span>
                              ) : null}
                            </div>
                          )}
                        </ComboboxOption>
                      ))}
                      {allowCustom &&
                        query !== "" &&
                        !filteredOptions.some(
                          (o) => o.label.toLowerCase() === query.toLowerCase(),
                        ) && (
                          <ComboboxOption
                            value={query}
                            className={({ active }) =>
                              cn(
                                "relative cursor-default select-none py-2 pl-4 pr-4 border-t border-gray-100",
                                active
                                  ? "bg-primary-lighter text-primary-darker"
                                  : "text-gray-900",
                              )
                            }
                          >
                            Create "{query}"
                          </ComboboxOption>
                        )}
                    </>
                  )}
                </ComboboxOptions>
              </Transition>
            </div>
          </>
        )}
      </Combobox>
    </div>
  );
}
