"use client";

import { useState } from "react";
import AccountSettings from "@/components/account/account-settings";
import PasswordSettings from "@/components/account/password-settings";
import TwoFaSettings from "@/components/account/twofa-settings";
import { User, Lock, ShieldCheck } from "lucide-react";

export default function AccountTabs() {
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "2fa">("profile");

  return (
    <div className="space-y-6">
      {/* Tab Header Buttons */}
      <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-none bg-white rounded-t-2xl px-2">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 py-3.5 px-5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === "profile"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <User className="size-4" /> Profile Information
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("password")}
          className={`flex items-center gap-2 py-3.5 px-5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === "password"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Lock className="size-4" /> Password & Security
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("2fa")}
          className={`flex items-center gap-2 py-3.5 px-5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === "2fa"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <ShieldCheck className="size-4" /> Two-Factor Authentication
        </button>
      </div>

      {/* Tab Content Display */}
      <div>
        {activeTab === "profile" && <AccountSettings />}
        {activeTab === "password" && <PasswordSettings />}
        {activeTab === "2fa" && <TwoFaSettings />}
      </div>
    </div>
  );
}