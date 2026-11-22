"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/axios";
import { toast } from "sonner";
import { Loader2, Pencil, Trash2, Box } from "lucide-react";
import type { PackageRecord } from "./add-package-form";
import EditPackageDrawer from "./edit-package-drawer";

interface PackageListTableProps {
  refreshTrigger?: number;
  onMutated?: () => void;
}

export default function PackageListTable({
  refreshTrigger = 0,
  onMutated,
}: PackageListTableProps) {
  const [packages, setPackages] = useState<PackageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingPackage, setEditingPackage] = useState<PackageRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchPackages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("packages");
      const rawData = res?.data?.data;
      const list = Array.isArray(rawData?.data)
        ? rawData.data
        : Array.isArray(rawData)
        ? rawData
        : [];
      setPackages(list);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load packages.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages, refreshTrigger]);

  const handleEditClick = (pkg: PackageRecord) => {
    setEditingPackage(pkg);
    setDrawerOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id);
      const res = await apiClient.delete(`packages/${id}/delete`);
      toast.success(res?.data?.message || "Package deleted successfully.");
      setPackages((prev) => prev.filter((item) => item.id !== id));
      onMutated?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete package.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-500/20 overflow-hidden shadow-2xs">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Box className="size-5 text-primary" />
          <h2 className="text-base sm:text-lg font-bold text-gray-900">Your Packages</h2>
        </div>
        <span className="text-xs font-medium text-gray-500">
          {packages.length} {packages.length === 1 ? "package" : "packages"}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : packages.length === 0 ? (
        <div className="p-10 text-center text-sm text-gray-500">
          No packaging presets found. Use the form above to add your first package.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-semibold text-gray-600">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Dimensions (L × W × H)</th>
                <th className="py-3 px-4">Weight</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {packages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-gray-900">
                    <div>{pkg.name}</div>
                    {pkg.package_id && (
                      <div className="text-[11px] font-mono text-gray-400">{pkg.package_id}</div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 capitalize text-gray-700">{pkg.type}</td>
                  <td className="py-3.5 px-4 text-gray-700">
                    {pkg.length} × {pkg.width} × {pkg.height} {pkg.size_unit}
                  </td>
                  <td className="py-3.5 px-4 text-gray-700">
                    {pkg.weight} {pkg.weight_unit}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={() => handleEditClick(pkg)}
                        className="gap-1"
                      >
                        <Pencil className="size-3.5" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        disabled={deletingId === pkg.id}
                        onClick={() => handleDelete(pkg.id)}
                        className="gap-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      >
                        {deletingId === pkg.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="size-3.5" />
                        )}
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <EditPackageDrawer
        pkg={editingPackage}
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditingPackage(null);
        }}
        onSuccess={() => {
          fetchPackages();
          onMutated?.();
        }}
      />
    </div>
  );
}