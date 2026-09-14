"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import DatePicker from "@/components/ui/date-picker";
import StatusSelect from "@/components/ui/status-select";
import { FloatingInput } from "@/components/ui/floating-input";
import { toast } from "sonner";
import { apiClient } from "@/lib/axios";
import { Loader2, Percent, Banknote, Search, X, Tag } from "lucide-react";

interface ProductOption {
  id: number;
  name: string;
}

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

export default function EditCouponForm() {
  const router = useRouter();
  const params = useParams();
  const couponId = params?.id;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [status, setStatus] = useState(statusOptions[0]);
  const [discountType, setDiscountType] = useState<"percentage" | "flat">("percentage");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  // Product Selection State
  const [productQuery, setProductQuery] = useState("");
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductOption[]>([]);
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch Existing Coupon Data
  const fetchCouponDetails = useCallback(async () => {
    if (!couponId) return;

    try {
      setLoading(true);
      const response = await apiClient.get(`/coupons/${couponId}`);

      if (response.data?.status || response.status === 200) {
        const data = response.data.data;

        setName(data.name || "");
        setCode(data.code || "");
        setDiscountType(data.discount_type === "flat" ? "flat" : "percentage");
        setDiscount(String(data.discount || ""));
        setStatus(data.is_active ? statusOptions[0] : statusOptions[1]);

        if (data.start_date) {
          setStartDate(new Date(data.start_date));
        }
        if (data.end_date) {
          setEndDate(new Date(data.end_date));
        }

        // Populate attached products
        if (Array.isArray(data.products) && data.products.length > 0) {
          setSelectedProducts(
            data.products.map((p: any) => ({
              id: p.id,
              name: p.name || `Product #${p.id}`,
            }))
          );
        } else if (Array.isArray(data.product_ids) && data.product_ids.length > 0) {
          setSelectedProducts(
            data.product_ids.map((id: number) => ({
              id,
              name: `Product #${id}`,
            }))
          );
        }
      } else {
        toast.error("Failed to load coupon details.");
      }
    } catch (err: any) {
      console.error("Error loading coupon details:", err);
      toast.error(err?.response?.data?.message || "Failed to retrieve coupon record.");
    } finally {
      setLoading(false);
    }
  }, [couponId]);

  useEffect(() => {
    fetchCouponDetails();
  }, [fetchCouponDetails]);

  // Fetch Products via API with Search
  const fetchProducts = useCallback(async (searchQuery: string) => {
    try {
      setIsSearchingProducts(true);
      const response = await apiClient.get("/products", {
        params: {
          page: 1,
          search: searchQuery.trim(),
        },
      });

      if (response.data?.status || response.status === 200) {
        const items = response.data?.data?.data || response.data?.products?.data || response.data?.data || [];
        setProductOptions(
          items.map((item: any) => ({
            id: item.id,
            name: item.name || item.title || `Product #${item.id}`,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setIsSearchingProducts(false);
    }
  }, []);

  // Debounced product search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(productQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [productQuery, fetchProducts]);

  // Click outside listener for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProductDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSelectProduct = (product: ProductOption) => {
    const isSelected = selectedProducts.some((p) => p.id === product.id);
    if (isSelected) {
      setSelectedProducts((prev) => prev.filter((p) => p.id !== product.id));
    } else {
      setSelectedProducts((prev) => [...prev, product]);
    }
  };

  const removeProduct = (id: number) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const formatDateToYMD = (date?: Date): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return toast.error("Please enter a campaign name.");
    if (!code.trim()) return toast.error("Please enter a coupon code.");
    if (!discount || isNaN(Number(discount))) return toast.error("Please enter a valid discount amount.");
    if (!startDate) return toast.error("Please select a start date.");
    if (!endDate) return toast.error("Please select an end date.");

    const payload = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      discount_type: discountType,
      discount: Number(discount),
      start_date: formatDateToYMD(startDate),
      end_date: formatDateToYMD(endDate),
      is_active: status.value === "active",
      product_id: selectedProducts.map((p) => p.id),
    };

    try {
      setSubmitting(true);
      const response = await apiClient.put(`/coupons/${couponId}`, payload);

      const successMessage = response.data?.message || "Coupon updated successfully!";
      toast.success(successMessage);
      router.push("/coupon");
    } catch (err: any) {
      console.error("Error updating coupon:", err);
      const errorMessage =
        err?.response?.data?.message || "An error occurred while updating the coupon.";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-white rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[350px]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-3" />
        <p className="text-sm font-medium text-gray-500">Loading coupon details...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <PageHeader title="Edit Coupon" backHref="/coupon" className="mb-6">
        <div>
          <StatusSelect
            value={status}
            onChange={(val) => {
              if (val) setStatus(val as (typeof statusOptions)[0]);
            }}
            options={statusOptions}
          />
        </div>
      </PageHeader>

      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-500/20 shadow-xs space-y-8">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Basic Information
          </h3>
          <p className="text-xs text-gray-500">
            Update campaign criteria, discount values, and execution schedules.
          </p>
        </div>

        {/* Discount Type Radio Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Discount Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label
              className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                discountType === "percentage"
                  ? "border-teal-600 bg-teal-50/40 text-teal-900 shadow-2xs"
                  : "border-gray-200 hover:border-gray-300 bg-white text-gray-700"
              }`}
            >
              <input
                type="radio"
                name="discount_type"
                value="percentage"
                checked={discountType === "percentage"}
                onChange={() => setDiscountType("percentage")}
                className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-gray-300"
              />
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-teal-600" />
                <span className="text-sm font-semibold">Percentage Discount (%)</span>
              </div>
            </label>

            <label
              className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                discountType === "flat"
                  ? "border-teal-600 bg-teal-50/40 text-teal-900 shadow-2xs"
                  : "border-gray-200 hover:border-gray-300 bg-white text-gray-700"
              }`}
            >
              <input
                type="radio"
                name="discount_type"
                value="flat"
                checked={discountType === "flat"}
                onChange={() => setDiscountType("flat")}
                className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-gray-300"
              />
              <div className="flex items-center gap-2">
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold">Fixed Amount (₦)</span>
              </div>
            </label>
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FloatingInput
            label="Campaign Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <FloatingInput
            label="Coupon Code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. SUMMER2026"
            required
          />

          <div className="md:col-span-2">
            <FloatingInput
              label={
                discountType === "percentage"
                  ? "Discount Percentage (%)"
                  : "Discount Amount (₦)"
              }
              type="number"
              step="0.01"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder={discountType === "percentage" ? "15" : "1500"}
              required
            />
          </div>

          {/* Product Multi-Select Search */}
          <div className="md:col-span-2 space-y-2 relative" ref={dropdownRef}>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Select Applicable Products (Optional)
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products to attach coupon..."
                value={productQuery}
                onFocus={() => setShowProductDropdown(true)}
                onChange={(e) => {
                  setProductQuery(e.target.value);
                  setShowProductDropdown(true);
                }}
                className="w-full pl-10 pr-10 py-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-white"
              />
              {isSearchingProducts && (
                <Loader2 className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-teal-600" />
              )}
            </div>

            {/* Selected Product Chips */}
            {selectedProducts.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {selectedProducts.map((prod) => (
                  <span
                    key={prod.id}
                    className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-900 text-xs font-medium px-3 py-1.5 rounded-lg border border-teal-200/60"
                  >
                    <Tag className="w-3.5 h-3.5 text-teal-600" />
                    {prod.name}
                    <button
                      type="button"
                      onClick={() => removeProduct(prod.id)}
                      className="hover:text-red-500 transition-colors ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Dropdown Options List */}
            {showProductDropdown && (
              <div className="absolute z-20 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg divide-y divide-gray-100">
                {productOptions.length === 0 ? (
                  <div className="p-4 text-xs text-center text-gray-400">
                    {isSearchingProducts ? "Searching products..." : "No products found"}
                  </div>
                ) : (
                  productOptions.map((prod) => {
                    const isSelected = selectedProducts.some((p) => p.id === prod.id);
                    return (
                      <div
                        key={prod.id}
                        onClick={() => toggleSelectProduct(prod)}
                        className={`flex items-center justify-between p-3 text-sm cursor-pointer transition-colors ${
                          isSelected ? "bg-teal-50/50 text-teal-900 font-medium" : "hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        <span>{prod.name}</span>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                        />
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          <div>
            <DatePicker
              date={startDate}
              setDate={setStartDate}
              label="Start Date"
            />
          </div>

          <div>
            <DatePicker
              date={endDate}
              setDate={setEndDate}
              label="End Date"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            className="rounded-full px-8"
            onClick={() => router.push("/coupon")}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="rounded-full px-8 bg-teal-700 hover:bg-teal-800 text-white min-w-[120px]"
            disabled={submitting}
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}