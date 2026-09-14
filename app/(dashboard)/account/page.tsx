import AccountTabs from "@/components/account/account-tabs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Settings",
  description: "View and manage your account.",
};

export default function AccountPage() {
  return (
    <div className="space-y-6">
      {/* Page Title Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-sm text-gray-500">
          Manage your personal information, security credentials, and two-factor authentication.
        </p>
      </div>

      {/* Tabbed Navigation Component */}
      <AccountTabs />
    </div>
  );
}