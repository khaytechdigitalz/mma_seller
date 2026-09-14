"use client";

import { useState } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { SearchIcon, ClockIcon } from "@/icons";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
}

const recentSearches = [
  "Iphone 13 Pro Max",
  "Macbook Pro m1",
  "Headphone",
  "Ipad air 2022",
];

export default function SearchInput({
  placeholder = "Search...",
  className,
  onSearch,
}: SearchInputProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("");

  const filteredSearches =
    query === ""
      ? recentSearches
      : recentSearches.filter((item) =>
          item.toLowerCase().includes(query.toLowerCase()),
        );

  return (
    <div className={cn("relative sm:w-[300px] w-full", className)}>
      <SearchIcon className="absolute size-4 text-light-primary-text left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
      <Combobox
        value={selected}
        onChange={(value) => {
          const val = value || "";
          setSelected(val);
          setQuery(val);
          if (onSearch) onSearch(val);
        }}
      >
        <div className="relative">
          <ComboboxInput
            className="pl-9 w-full pr-3.5 ring h-9 ring-gray-500/20 py-2 bg-gray-100 border-none rounded-full text-sm focus:outline-none focus:ring-primary transition-all font-normal text-light-primary-text placeholder:text-light-secondary-text"
            placeholder={placeholder}
            onChange={(event) => setQuery(event.target.value)}
            // displayValue should return the string to display in input.
            // If selected is set, we show it.
            // If user types, query updates.
            displayValue={(item: string) => item}
          />

          <ComboboxOptions className="absolute mt-2 w-full overflow-hidden rounded-xl bg-white p-2 shadow-lg ring-1 ring-black/5 focus:outline-none z-50 origin-top-right empty:invisible">
            {filteredSearches.length > 0 && (
              <div className="px-3 py-2 text-sm font-normal text-light-secondary-text">
                Recent Searches
              </div>
            )}

            {filteredSearches.map((item, index) => (
              <ComboboxOption
                key={index}
                value={item}
                className={({ active }) =>
                  cn(
                    "flex items-center gap-3 cursor-pointer select-none rounded-lg px-3 py-2.5 text-sm transition-colors",
                    active
                      ? "bg-gray-50 text-light-primary-text"
                      : "text-light-primary-text",
                  )
                }
              >
                <ClockIcon className="size-4 text-light-secondary-text" />
                <span className="truncate">{item}</span>
              </ComboboxOption>
            ))}

            {query.length > 0 && !filteredSearches.includes(query) && (
              <>
                {/* Divider if we have recent searches above */}
                {filteredSearches.length > 0 && (
                  <div className="h-px bg-gray-100 my-1 mx-3" />
                )}
                <ComboboxOption
                  value={query}
                  className={({ active }) =>
                    cn(
                      "flex items-center gap-3 cursor-pointer select-none rounded-lg px-3 py-2.5 text-sm transition-colors",
                      active
                        ? "bg-gray-50 text-light-primary-text"
                        : "text-light-primary-text",
                    )
                  }
                >
                  <SearchIcon className="size-4 text-light-secondary-text" />
                  <span className="truncate">Search for "{query}"</span>
                </ComboboxOption>
              </>
            )}

            {/* If no recent searches and no query (just opened empty), show recent searches list (handled by filteredSearches logic for query === "") */}

            {/* If query has length but filteredSearches is empty AND we already show "Search for query", we are good. */}
          </ComboboxOptions>
        </div>
      </Combobox>
    </div>
  );
}
