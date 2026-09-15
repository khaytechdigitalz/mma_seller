"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { FloatingInput } from "@/components/ui/floating-input";
import { FloatingTextarea } from "@/components/ui/floating-textarea";
import StatusSelect, { Option } from "@/components/ui/status-select";
import { apiClient } from "@/lib/axios";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

const statusOptions: Option[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
];

export default function EditSellerForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sellerId = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form States
  const [name, setName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [status, setStatus] = useState<Option | null>(statusOptions[0]);

  // Preview URLs
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // Raw File states for submission
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  // Fetch Seller Details on Mount
  useEffect(() => {
    const fetchSellerDetails = async () => {
      if (!sellerId) {
        setLoading(false);
        toast.error("No seller ID provided in the URL.");
        return;
      }

      try {
        setLoading(true);
        const response = await apiClient.get(`/sellers/${sellerId}`);
        const sellerData = response.data?.data?.seller;

        if (sellerData) {
          setName(sellerData.name || "");
          setOwnerName(sellerData.name || "");
          setEmail(sellerData.email || "");
          setPhone(sellerData.phone || "");

          if (sellerData.storefront) {
            setStoreName(sellerData.storefront.name || "");
            setStoreDescription(sellerData.storefront.description || "");
            setCurrency(sellerData.storefront.currency || "NGN");

            if (sellerData.storefront.logo) {
              const initialLogo = sellerData.storefront.logo.startsWith("http")
                ? sellerData.storefront.logo
                : `${process.env.NEXT_PUBLIC_STORAGE_URL || ""}/${sellerData.storefront.logo}`;
              setLogoPreview(initialLogo);
            }

            if (sellerData.storefront.banner) {
              const initialBanner = sellerData.storefront.banner.startsWith("http")
                ? sellerData.storefront.banner
                : `${process.env.NEXT_PUBLIC_STORAGE_URL || ""}/${sellerData.storefront.banner}`;
              setBannerPreview(initialBanner);
            }
          }

          const matchedStatus = statusOptions.find(
            (opt) => opt.value === sellerData.status
          );
          if (matchedStatus) setStatus(matchedStatus);
        }
      } catch (error: any) {
        console.error("Failed to load seller details:", error);
        toast.error(error?.response?.data?.message || "Failed to fetch seller details.");
      } finally {
        setLoading(false);
      }
    };

    fetchSellerDetails();
  }, [sellerId]);

  // Handle Logo File Selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  // Handle Banner File Selection
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

 // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerId) {
      toast.error("Missing seller ID.");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();

      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("store_name", storeName);
      formData.append("store_description", storeDescription);
      formData.append("currency", currency);

      if (logoFile) {
        formData.append("logo", logoFile);
      }
      if (bannerFile) {
        formData.append("banner", bannerFile);
      }

      // Standard POST request to update the seller
      const response = await apiClient.post(`sellers/${sellerId}/update`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(response.data?.message || "Seller updated successfully!");
      router.push("/storefront/details?id=0");
    } catch (error: any) {
      console.error("Failed to update seller:", error);
      toast.error(error?.response?.data?.message || "Failed to update seller information.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-2xl gap-3">
        <Loader2 className="size-8 animate-spin text-teal-600" />
        <p className="text-sm text-gray-500">Loading seller information...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full bg-white rounded-2xl p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <PageHeader title="Edit Seller" backHref="/sellers" className="gap-4" />
        <StatusSelect options={statusOptions} value={status} onChange={setStatus} />
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-500/20 space-y-6">
        <h2 className="text-lg font-bold text-light-primary-text mb-4 sm:mb-6">
          Basic Information
        </h2>

        {/* Standard File Inputs Side by Side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-6 gap-4">
          {/* Logo Input */}
          <div className="space-y-2 border border-gray-200 p-4 rounded-xl">
            <label className="block text-sm font-medium text-gray-700">Store Logo</label>
            {logoPreview && (
              <div className="mb-2">
                <img src={logoPreview} alt="Logo Preview" className="h-20 w-20 object-cover rounded-lg border" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
            />
          </div>

          {/* Banner Input */}
          <div className="space-y-2 border border-gray-200 p-4 rounded-xl">
            <label className="block text-sm font-medium text-gray-700">Store Cover Photo</label>
            {bannerPreview && (
              <div className="mb-2">
                <img src={bannerPreview} alt="Banner Preview" className="h-20 w-full object-cover rounded-lg border" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleBannerChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
            />
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <FloatingInput label="User Name" value={name} onChange={(e) => setName(e.target.value)} />
            <FloatingInput label="Store Full Name" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <FloatingInput label="Owner Name" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
            <FloatingInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <FloatingInput label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <FloatingInput label="Currency Code" value={currency} onChange={(e) => setCurrency(e.target.value)} />
          </div>

          <FloatingTextarea label="Short Description" className="h-32" value={storeDescription} onChange={(e) => setStoreDescription(e.target.value)} />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 pt-4 sm:pt-6">
        <Button variant="outline" type="button" href="/sellers">
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save"
          )}
        </Button>
      </div>
    </form>
  );
}