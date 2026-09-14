"use client";

import { useState } from "react";

import { Menu11Icon, MessageIcon, SearchIcon } from "../../icons";
import UserDropdown from "./dropdown/user-dropdown";
import LanguageDropdown from "./dropdown/language-dropdown";
import NotificationDropdown from "./dropdown/notification-dropdown";
import Link from "next/link";
import SearchModal from "./search-modal";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="bg-white border-b z-40 px-4 lg:px-6 xl:px-10 py-4 border-gray-100 flex items-center justify-between sticky top-0">
        <div className="flex items-center gap-4">
          {/* Mobile menu trigger */}
          <button
            className="xl:hidden p-2 text-light-primary-text hover:bg-gray-100 rounded-md"
            onClick={onMenuClick}
          >
            <Menu11Icon className="size-5.5" />
          </button>

          {/* Search */}
          <div
            className="relative hidden md:block cursor-pointer"
            onClick={() => setSearchOpen(true)}
          >
            <SearchIcon className="absolute size-4 text-light-primary-text left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              readOnly
              className="pl-10 pr-3.5 ring h-10 ring-gray-500/20 py-2 w-[344px] bg-gray-100 border-none rounded-full text-sm focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <NotificationDropdown />

          {/* User Profile */}
          <UserDropdown />
        </div>
      </header>
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}