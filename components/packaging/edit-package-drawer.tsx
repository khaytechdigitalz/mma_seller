"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import CustomFloatingSelect from "@/components/ui/custom-floating-select";
import { apiClient } from "@/lib/axios";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import type { PackageRecord } from "./add-package-form";

interface EditPackageDrawerProps {
  pkg: PackageRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const packageTypeOptions = [
  { label: "Box", value: "box" },
  { label: "Envelope", value: "envelope" },
  { label: "Soft Packaging", value: "soft-packaging" },
];

const sizeUnitOptions = [{ label: "cm", value: "cm" }];

const weightUnitOptions = [{ label: "kg", value: "kg" }];

const allowedTypes = new Set(["box", "envelope", "soft-packaging"]);

export default function EditPackageDrawer({
  pkg,
  isOpen,
  onClose,
  onSuccess,
}: EditPackageDrawerProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState("box");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [sizeUnit, setSizeUnit] = useState("cm");
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (pkg) {
      setName(pkg.name || "");
      setType(allowedTypes.has(pkg.type) ? pkg.type : "box");
      setLength(pkg.length !== undefined ? String(pkg.length) : "");
      setWidth(pkg.width !== undefined ? String(pkg.width) : "");
      setHeight(pkg.height !== undefined ? String(pkg.height) : "");
      setSizeUnit("cm");
      setWeight(pkg.weight !== undefined ? String(pkg.weight) : "");
      setWeightUnit("kg");
    }
  }, [pkg]);

  if (!isOpen || !pkg) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: name.trim(),
      type,
      length: Number(length),
      width: Number(width),
      height: Number(height),
      size_unit: "cm",
      weight: Number(weight),
      weight_unit: "kg",
    };

    try {
      setIsSubmitting(true);
      const res = await apiClient.patch(`packages/${pkg.id}/update`, payload);
      toast.success(res?.data?.message || "Package updated successfully.");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update package.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[1px]">
      <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-gray-200 flex flex-col justify-between p-6 overflow-y-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Edit Package</h3>
              {pkg.package_id && (
                <p className="text-xs font-mono text-gray-500 mt-0.5">{pkg.package_id}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>

          <form id="edit-package-form" onSubmit={handleUpdate} className="space-y-4">
            <FloatingInput
              label="Package Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-3">
              <CustomFloatingSelect
                label="Package Type *"
                options={packageTypeOptions}
                value={type}
                onChange={setType}
              />
              <CustomFloatingSelect
                label="Size Unit *"
                options={sizeUnitOptions}
                value={sizeUnit}
                onChange={setSizeUnit}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <FloatingInput
                label="Length (cm) *"
                type="number"
                step="any"
                value={length}
                onChange={(e) => setLength(e.target.value)}
              />
              <FloatingInput
                label="Width (cm) *"
                type="number"
                step="any"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
              />
              <FloatingInput
                label="Height (cm) *"
                type="number"
                step="any"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FloatingInput
                label="Weight (kg) *"
                type="number"
                step="any"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
              <CustomFloatingSelect
                label="Weight Unit *"
                options={weightUnitOptions}
                value={weightUnit}
                onChange={setWeightUnit}
              />
            </div>
          </form>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="edit-package-form" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Updating...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}