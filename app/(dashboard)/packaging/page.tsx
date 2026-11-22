"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import PackageListTable from "@/components/packaging/package-list-table";
import AddPackage from "@/components/packaging/add-package-form";
import { Button } from "@/components/ui/button";

export default function PackageListPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
     

    <div className="w-full bg-swhite rounded-2xl mx-auto p-4 sm:p-6 space-y-6">
     

      <AddPackage onSuccess={triggerRefresh} />

      <PackageListTable refreshTrigger={refreshKey} />
    </div>
  );
}