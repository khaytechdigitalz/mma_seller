"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import CustomFloatingSelect from "@/components/ui/custom-floating-select";
import { apiClient } from "@/lib/axios";
import { toast } from "sonner";
import { Loader2, PackagePlus, Info } from "lucide-react";

export interface PackageRecord {
  id: number;
  seller_id?: number;
  package_id?: string;
  name: string;
  type: "box" | "envelope" | "soft-packaging" | string;
  length: number | string;
  width: number | string;
  height: number | string;
  size_unit: "cm" | string;
  weight: number | string;
  weight_unit: "kg" | string;
  is_default?: boolean | number;
  created_at?: string;
}

interface AddPackageProps {
  onSuccess?: () => void;
}

const packageTypeOptions = [
  { label: "Box", value: "box" },
  { label: "Envelope", value: "envelope" },
  { label: "Soft Packaging", value: "soft-packaging" },
];

const sizeUnitOptions = [{ label: "cm", value: "cm" }];

const weightUnitOptions = [{ label: "kg", value: "kg" }];

export default function AddPackage({ onSuccess }: AddPackageProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState("box");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [sizeUnit, setSizeUnit] = useState("cm");
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName("");
    setType("box");
    setLength("");
    setWidth("");
    setHeight("");
    setSizeUnit("cm");
    setWeight("");
    setWeightUnit("kg");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !length || !width || !height || !weight) {
      toast.error("Please fill in package name, dimensions, and weight.");
      return;
    }

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
      const res = await apiClient.post("packages", payload);
      toast.success(res?.data?.message || "Package created successfully.");
      resetForm();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create package.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-gray-500/20 p-4 sm:p-6 space-y-5 shadow-2xs"
    >
      <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
        <PackagePlus className="size-5 text-primary" />
        <h2 className="text-base sm:text-lg font-bold text-gray-900">Add New Package</h2>
      </div>

      {/* Seller Guidance Alert */}
      <div
        role="note"
        className="flex items-start gap-3 rounded-xl border border-blue-200/80 bg-blue-50/70 p-3.5 text-xs sm:text-sm text-blue-950"
      >
        <Info className="size-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-blue-900">How Shipping Packages Work</p>
          <p className="text-xs text-blue-800/90 leading-relaxed">
            Create reusable packaging presets (boxes, envelopes, or soft mailers) with accurate{" "}
            <span className="font-semibold">cm</span> dimensions and{" "}
            <span className="font-semibold">kg</span> weight. Once saved, you can assign a package
            when creating or editing a product so live courier shipping rates and pickup bookings
            calculate accurately at checkout.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="sm:col-span-2">
          <FloatingInput
            label="Package Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

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

        <div className="grid grid-cols-2 gap-2">
          <FloatingInput
            label="Weight (kg) *"
            type="number"
            step="any"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
          <CustomFloatingSelect
            label="Unit"
            options={weightUnitOptions}
            value={weightUnit}
            onChange={setWeightUnit}
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            "Create Package"
          )}
        </Button>
      </div>
    </form>
  );
}