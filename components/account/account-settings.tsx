"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { apiClient } from "@/lib/axios";
import { Loader2, User, Camera } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function AccountSettings() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const fetchAccount = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/account");
      if (res.data?.status) {
        const data = res.data.data;
        setName(data.name || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setAvatarUrl(data.avatar || null);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load account details.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccount();
  }, [fetchAccount]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("phone", phone);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const res = await apiClient.post("/account/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.status) {
        toast.success("Profile updated successfully!");
        if (res.data.data?.avatar) {
          setAvatarUrl(res.data.data.avatar);
        }
        setAvatarFile(null);
        setAvatarPreview(null);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-6">
      <div className="border-b pb-4 border-gray-100 flex items-center gap-2">
        <User className="size-5 text-primary" />
        <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Upload */}
        <div className="flex items-center gap-4">
          <div className="relative size-20 rounded-full overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
            {avatarPreview || avatarUrl ? (
              <Image
                src={avatarPreview || avatarUrl || ""}
                alt="Avatar"
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <User className="size-8 text-gray-400" />
            )}
          </div>
          <div>
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition">
              <Camera className="size-4" /> Change Avatar
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG or WEBP (Max 2MB)</p>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FloatingInput
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <FloatingInput
            label="Email Address (Readonly)"
            type="email"
            value={email}
            disabled
            className="bg-gray-50 text-gray-500 cursor-not-allowed"
          />
          <FloatingInput
            label="Phone Number"
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" className="px-6" disabled={submitting}>
            {submitting && <Loader2 className="size-4 animate-spin mr-2" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}