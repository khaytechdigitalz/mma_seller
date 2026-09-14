"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { apiClient } from "@/lib/axios";
import { Loader2, Lock, Check, X, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function PasswordSettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Show/Hide password toggles for each field
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  // Strength criteria
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  // Calculate strength score (0 to 5)
  const strengthScore = [hasMinLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

  const getStrengthConfig = () => {
    if (strengthScore <= 2) {
      return { 
        text: "Weak", 
        color: "bg-rose-500", 
        badgeBg: "bg-rose-50 text-rose-700 border-rose-200" 
      };
    }
    if (strengthScore <= 4) {
      return { 
        text: "Good", 
        color: "bg-amber-500", 
        badgeBg: "bg-amber-50 text-amber-700 border-amber-200" 
      };
    }
    return { 
      text: "Strong", 
      color: "bg-emerald-500", 
      badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200" 
    };
  };

  const strengthConfig = getStrengthConfig();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== passwordConfirmation) {
      toast.error("New passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await apiClient.post("/account/password", {
        current_password: currentPassword,
        password,
        password_confirmation: passwordConfirmation,
      });

      if (res.data?.status) {
        toast.success("Password updated successfully!");
        setCurrentPassword("");
        setPassword("");
        setPasswordConfirmation("");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
      {/* Header section */}
      <div className="border-b pb-4 border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Lock className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Security & Password</h2>
            <p className="text-xs text-gray-500">Update your account password regularly to protect your profile.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="max-w-md relative">
            <FloatingInput
              label="Current Password"
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
              tabIndex={-1}
            >
              {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <FloatingInput
                label="New Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>

            <div className="relative">
              <FloatingInput
                label="Confirm New Password"
                type={showPasswordConfirmation ? "text" : "password"}
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                tabIndex={-1}
              >
                {showPasswordConfirmation ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Stylistic Password Strength & Requirements Card */}
        {password && (
          <div className="p-5 bg-gradient-to-br from-gray-50/90 to-gray-100/50 rounded-2xl space-y-4 border border-gray-200/80 shadow-xs animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-700">Security Rating:</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border shadow-2xs ${strengthConfig.badgeBg}`}>
                {strengthConfig.text}
              </span>
            </div>

            {/* Stylistic Segmented Progress Bar */}
            <div className="grid grid-cols-5 gap-2 h-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`rounded-full transition-all duration-500 shadow-2xs ${
                    strengthScore >= level ? strengthConfig.color : "bg-gray-200/80"
                  }`}
                />
              ))}
            </div>

            {/* Checklist Grid with modern pill styling */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1 text-xs">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-colors ${hasMinLength ? "bg-emerald-50/70 border-emerald-200/60 text-emerald-700 font-medium" : "bg-white/60 border-gray-200/60 text-gray-400"}`}>
                {hasMinLength ? <Check className="size-3.5 text-emerald-600 shrink-0" /> : <X className="size-3.5 text-gray-300 shrink-0" />} 
                <span>At least 8 characters</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-colors ${hasUpper ? "bg-emerald-50/70 border-emerald-200/60 text-emerald-700 font-medium" : "bg-white/60 border-gray-200/60 text-gray-400"}`}>
                {hasUpper ? <Check className="size-3.5 text-emerald-600 shrink-0" /> : <X className="size-3.5 text-gray-300 shrink-0" />} 
                <span>One uppercase letter</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-colors ${hasLower ? "bg-emerald-50/70 border-emerald-200/60 text-emerald-700 font-medium" : "bg-white/60 border-gray-200/60 text-gray-400"}`}>
                {hasLower ? <Check className="size-3.5 text-emerald-600 shrink-0" /> : <X className="size-3.5 text-gray-300 shrink-0" />} 
                <span>One lowercase letter</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-colors ${hasNumber ? "bg-emerald-50/70 border-emerald-200/60 text-emerald-700 font-medium" : "bg-white/60 border-gray-200/60 text-gray-400"}`}>
                {hasNumber ? <Check className="size-3.5 text-emerald-600 shrink-0" /> : <X className="size-3.5 text-gray-300 shrink-0" />} 
                <span>One number</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-colors ${hasSpecial ? "bg-emerald-50/70 border-emerald-200/60 text-emerald-700 font-medium" : "bg-white/60 border-gray-200/60 text-gray-400"}`}>
                {hasSpecial ? <Check className="size-3.5 text-emerald-600 shrink-0" /> : <X className="size-3.5 text-gray-300 shrink-0" />} 
                <span>One special character</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" className="px-6" disabled={submitting}>
            {submitting && <Loader2 className="size-4 animate-spin mr-2" />}
            Update Password
          </Button>
        </div>
      </form>
    </div>
  );
}