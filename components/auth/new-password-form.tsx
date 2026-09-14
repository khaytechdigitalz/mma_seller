"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { FloatingInput } from "@/components/ui/floating-input";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/axios";
import { handleApiError } from "@/lib/apiHelper";
import { Logo } from "@/components/ui/logo";

function NewPasswordFormContent() {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";
  const otp = searchParams.get("otp") || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !otp) {
      toast.error("Invalid reset link or missing parameters (email/OTP).");
      return;
    }

    if (!password || !passwordConfirmation) {
      toast.error("Please fill in both password fields.");
      return;
    }

    if (password !== passwordConfirmation) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post("auth/resetpassword", {
        email,
        password,
        password_confirmation: passwordConfirmation,
        otp,
      });

      const { status, message } = response.data;

      if (status) {
        toast.success(message || "Password reset successful! Please sign in.");
        router.push("/signin");
      } else {
        toast.error(message || "Failed to reset password. Please try again.");
      }
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Centered Logos & Illustration */}
      <div className="flex flex-col items-center text-center mb-8">
        <Link href="/" className="mb-8 flex justify-center">
          <Logo/>
        </Link>
        
        <h1 className="text-2xl font-public-sans font-bold text-light-primary-text mb-2">
          Set New Password
        </h1>
        <p className="text-gray-600 font-public-sans text-sm max-w-sm">
          Reset your account with a new password
        </p>
      </div>

      {/* Form */}
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Hidden inputs to capture email and OTP from URL */}
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="otp" value={otp} />

        <FloatingInput
          label="Set New Password"
          id="new-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
          className="h-12"
        />
        <FloatingInput
          label="Confirm New Password"
          id="confirm-new-password"
          type="password"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          disabled={loading}
          required
          className="h-12"
        />

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 py-3 text-base flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>

      <p className="mt-10 text-center text-sm text-light-secondary-text">
        Back to{" "}
        <Link
          href="/signin"
          className="ml-1 font-bold text-primary hover:text-primary-dark"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
}

export function NewPasswordForm() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewPasswordFormContent />
    </Suspense>
  );
}