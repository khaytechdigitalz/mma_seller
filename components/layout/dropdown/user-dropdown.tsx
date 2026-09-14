"use client";
import { useState, useEffect } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Image from "next/image";
import Link from "next/link";
import Cookies from "js-cookie";
import { apiClient } from "@/lib/axios";
import { ChevronDown } from "@/icons";
import { DashboardGridIcon, LogoutIcon, SettingsIcon, UserIcon } from "@/icons";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  type: string;
  phone: string;
  avatar: string;
  google2fa_enabled: boolean;
  created_at: string;
}

export default function UserDropdown() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetchAccountDetails();
  }, []);

  const fetchAccountDetails = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/account");
      if (res.data?.status) {
        setUser(res.data.data);
      }
    } catch (error) {
      console.error("Failed to load account details", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      // Even if the server call fails, still clear the local session below -
      // the admin's intent to leave wins over a flaky/expired backend call.
      console.error("Server logout failed, clearing local session anyway", error);
    } finally {
      Cookies.remove("auth_token");
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_info");
      localStorage.removeItem("userRole");
      document.cookie = "userRole=; path=/; max-age=0";
      window.location.href = "/signin";
    }
  };

  return (
    <div className="text-right">
      <Menu as="div" className="relative inline-block text-left">
        {({ open }) => (
          <>
            <MenuButton className="inline-flex items-center gap-2.5 w-full justify-center focus:outline-none text-sm">
              <span className="h-9 w-9 relative rounded-full overflow-hidden block bg-gray-100 shrink-0 ring-1 ring-gray-200">
                <Image
                  src={user?.avatar || "/images/user/user_01.png"}
                  alt={user?.name || "User"}
                  fill
                  className="object-cover"
                  unoptimized
                  onError={(e) => {
                            e.currentTarget.src = "/images/customer/user_01.png";
                          }}
                />
              </span>
              <span className="hidden text-left md:block">
                <span className="text-sm font-semibold text-text-primary-text block truncate max-w-[140px]">
                  {loading ? "Loading..." : user?.name || "Account"}
                </span>
                <span className="text-xs text-text-secondary-text block capitalize">
                  {user?.type || "Admin"}
                </span>
              </span>
              <ChevronDown
                className={`size-4 text-text-primary-text transition-transform duration-200 ${
                  open ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </MenuButton>

            <MenuItems
              transition
              className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-500/20 rounded-lg bg-white ring-1 ring-gray-500/20 focus:outline-none z-50 transition duration-100 ease-out data-closed:scale-95 data-closed:opacity-0 shadow-lg"
            >
              <div className="px-1 py-1">
                <MenuItem>
                  {({ focus }) => (
                    <Link
                      href="/account"
                      className={`${
                        focus
                          ? "bg-gray-100 text-light-primary-text"
                          : "text-light-secondary-text"
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm gap-2 transition-colors`}
                    >
                      <UserIcon className="h-4 w-4" />
                      Profile
                    </Link>
                  )}
                </MenuItem>  
              </div>
              <div className="px-1 py-1">
                <MenuItem>
                  {({ focus }) => (
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className={`${
                        focus
                          ? "bg-gray-100 text-error"
                          : "text-light-secondary-text"
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm gap-2 transition-colors cursor-pointer disabled:opacity-60`}
                    >
                      <LogoutIcon className="h-4 w-4" />
                      {loggingOut ? "Logging out..." : "Logout"}
                    </button>
                  )}
                </MenuItem>
              </div>
            </MenuItems>
          </>
        )}
      </Menu>
    </div>
  );
}