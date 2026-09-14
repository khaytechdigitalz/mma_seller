"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FloatingInput } from "@/components/ui/floating-input";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/axios";
import { handleApiError } from "@/lib/apiHelper";
import { Logo } from "@/components/ui/logo";

export function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post("/auth/forgotpassword", {
        email,
      });

      const { status, message } = response.data;

      if (status) {
        toast.success(message || "OTP code sent to your email!");
        // Redirect to OTP verification step and pass email in query param
        router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
      } else {
        toast.error(message || "Failed to request password reset.");
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
          Reset Password
        </h1>
        <p className="text-gray-600 font-public-sans text-sm max-w-sm">
          Enter your email address, and we'll send you instructions to reset
          your password.
        </p>
      </div>

      {/* Form */}
      <form className="space-y-6" onSubmit={handleSubmit}>
        <FloatingInput
          label="Email"
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
              Sending...
            </>
          ) : (
            "Send"
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