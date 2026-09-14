"use client";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "@/icons";

const languages = [
  { name: "English", flag: "/images/flag/GB.svg", code: "en" },
  { name: "France", flag: "/images/flag/SG.svg", code: "fr" },
  { name: "Germany", flag: "/images/flag/US.svg", code: "de" },
];

export default function LanguageDropdown() {
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);

  return (
    <div className="relative">
      <Menu as="div" className="relative inline-block text-left">
        <MenuButton className="inline-flex items-center gap-2 justify-center  text-sm font-medium text-gray-700 focus:outline-none ">
          <span className="w-6 h-6 rounded-md overflow-hidden relative block">
            <Image
              src={selectedLanguage.flag}
              alt={selectedLanguage.name}
              fill
              className="object-cover"
            />
          </span>
          <ChevronDown
            className="size-5 text-light-primary-text"
            aria-hidden="true"
          />
        </MenuButton>

        <MenuItems
          transition
          className="absolute right-0 mt-2 w-40 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-50 transition duration-100 ease-out data-closed:scale-95 data-[closed]:opacity-0"
        >
          <div className="p-1">
            {languages.map((language) => (
              <MenuItem key={language.code}>
                {({ focus }) => (
                  <button
                    onClick={() => setSelectedLanguage(language)}
                    className={`${
                      focus ? "bg-gray-100 text-gray-900" : "text-gray-700"
                    } group flex w-full items-center rounded-lg px-2 py-2 text-sm gap-3`}
                  >
                    <span className="w-5 h-5 rounded-full overflow-hidden relative shrink-0 block">
                      <Image
                        src={language.flag}
                        alt={language.name}
                        fill
                        className="object-cover"
                      />
                    </span>
                    {language.name}
                  </button>
                )}
              </MenuItem>
            ))}
          </div>
        </MenuItems>
      </Menu>
    </div>
  );
}
