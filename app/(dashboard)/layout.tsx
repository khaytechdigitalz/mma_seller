import DashboardLayout from "@/components/layout/DashboardLayout";
import React from "react";
import { cookies } from "next/headers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const userRole =
    (cookieStore.get("userRole")?.value as "master" | "seller") || "master";

  return (
    <DashboardLayout defaultUserRole={userRole}>{children}</DashboardLayout>
  );
}
