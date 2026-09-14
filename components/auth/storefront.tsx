"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { Store, Globe, DollarSign, Upload, ArrowRight, ArrowLeft, Loader2, CheckCircle2, X } from "lucide-react";
import { FloatingInput } from "@/components/ui/floating-input";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/axios";
import { Logo } from "@/components/ui/logo";

interface CreateStorefrontProps {
  token: string;
  keepSignedIn?: boolean;
  redirectTo?: string;
}

export function CreateStorefrontForm({ token, keepSignedIn = false, redirectTo = "/" }: CreateStorefrontProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [description, setDescription] = useState("");
  
  // File upload states & previews
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const currencies = [
    { code: "USD", label: "USD - US Dollar ($)" },
    { code: "NGN", label: "NGN - Nigerian Naira (₦)" },
    { code: "EUR", label: "EUR - Euro (€)" },
    { code: "GBP", label: "GBP - British Pound (£)" },
  ];

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Logo file size must be less than 2MB.");
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Banner file size must be less than 5MB.");
        return;
      }
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!name.trim()) {
        toast.error("Please enter your store name.");
        return;
      }
      if (!currency) {
        toast.error("Please select a store currency.");
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, 2));
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Store name is required.");
      return;
    }

    setLoading(true);

    try {
      // Build FormData payload to support file uploads
      const formData = new FormData();
      formData.append("token", token);
      formData.append("name", name);
      formData.append("currency", currency);
      if (description) formData.append("description", description);
      if (logoFile) formData.append("logo", logoFile);
      if (bannerFile) formData.append("banner", bannerFile);

      const response = await apiClient.post("/auth/storefront/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const { status, message, data } = response.data;

      if (status && data?.token) {
        const { token: authToken, user, storefront } = data;

        const cookieExpiry = keepSignedIn ? 30 : 1;
        Cookies.set("auth_token", authToken, {
          expires: cookieExpiry,
          secure: true,
          sameSite: "lax",
        });

        localStorage.setItem("auth_token", authToken);
        localStorage.setItem("user_info", JSON.stringify(user));
        localStorage.setItem("storefront_info", JSON.stringify(storefront));
        localStorage.setItem("userRole", "seller");
        document.cookie = `userRole=seller; path=/; max-age=31536000`;

        toast.success(message || "Storefront created successfully!");
        window.location.href = redirectTo;
      } else {
        toast.error(message || "Failed to create storefront.");
      }
    } catch (error: any) {
      console.error("Storefront creation error:", error);
      toast.error(error?.response?.data?.message || "An error occurred while creating your store.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-6">
        <Link href="/" className="mb-6 flex justify-center">
          <Logo />
        </Link>
        <h1 className="text-2xl font-public-sans font-bold text-light-primary-text mb-2">
          Setup Your Storefront
        </h1>
        <p className="text-gray-600 font-public-sans text-sm max-w-sm">
          Welcome! Before accessing your seller dashboard, let&apos;s configure your store profile.
        </p>

        {/* Wizard Progress Steps Indicator */}
        <div className="flex items-center gap-3 mt-6 w-full px-4">
          <div className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? "bg-primary text-white" : "bg-gray-200 text-gray-600"}`}>
              {step > 1 ? <CheckCircle2 size={16} /> : "1"}
            </div>
            <div className={`h-1 flex-1 rounded ${step > 1 ? "bg-primary" : "bg-gray-200"}`} />
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? "bg-primary text-white" : "bg-gray-200 text-gray-600"}`}>
              2
            </div>
          </div>
        </div>
      </div>

      {/* Step 1: Basic Store Details */}
      {step === 1 && (
        <form onSubmit={handleNextStep} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <Store size={14} className="text-primary" /> Store Name
            </label>
            <FloatingInput
              label="e.g. Artistry Haven"
              id="store-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
              className="h-12"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign size={14} className="text-primary" /> Default Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full h-12 px-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {currencies.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <Globe size={14} className="text-primary" /> Short Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell customers what your store is about..."
              rows={3}
              className="w-full p-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          <Button type="submit" className="w-full h-12 py-3 text-base flex items-center justify-center gap-2 mt-4">
            Next Step <ArrowRight size={16} />
          </Button>
        </form>
      )}

      {/* Step 2: Branding & Image Uploads */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Logo Upload Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              Store Logo (Optional)
            </label>
            <div className="flex items-center gap-3">
              {logoPreview ? (
                <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-gray-300 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setLogoFile(null); setLogoPreview(null); }}
                    className="absolute top-0.5 right-0.5 bg-black/60 text-white p-0.5 rounded-full hover:bg-black"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : null}
              <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-3 cursor-pointer hover:border-primary transition-colors bg-gray-50/50">
                <Upload size={18} className="text-gray-400 mb-1" />
                <span className="text-xs font-medium text-gray-600">Choose logo file (PNG, JPG)</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleLogoChange}
                  disabled={loading}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Banner Upload Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              Store Banner (Optional)
            </label>
            <div className="flex items-center gap-3">
              {bannerPreview ? (
                <div className="relative w-20 h-12 rounded-lg overflow-hidden border border-gray-300 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={bannerPreview} alt="Banner preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setBannerFile(null); setBannerPreview(null); }}
                    className="absolute top-0.5 right-0.5 bg-black/60 text-white p-0.5 rounded-full hover:bg-black"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : null}
              <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-3 cursor-pointer hover:border-primary transition-colors bg-gray-50/50">
                <Upload size={18} className="text-gray-400 mb-1" />
                <span className="text-xs font-medium text-gray-600">Choose banner file (PNG, JPG)</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleBannerChange}
                  disabled={loading}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 leading-relaxed">
            <span className="font-semibold text-gray-900">Summary:</span> Creating store <span className="font-semibold text-primary">{name}</span> under currency <span className="font-semibold">{currency}</span>.
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevStep}
              disabled={loading}
              className="w-1/3 h-12 flex items-center justify-center gap-2 border-gray-300"
            >
              <ArrowLeft size={16} /> Back
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-2/3 h-12 py-3 text-base flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Store...
                </>
              ) : (
                "Complete Setup"
              )}
            </Button>
          </div>
        </form>
      )}

      <p className="mt-8 text-center text-xs text-light-secondary-text">
        Need help? Contact support or return to{" "}
        <Link href="/signin" className="font-bold text-primary hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}