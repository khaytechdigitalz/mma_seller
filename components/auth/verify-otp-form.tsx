"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/axios";
import { handleApiError } from "@/lib/apiHelper";
import { Logo } from "@/components/ui/logo";

// Renamed the original component to an inner component. It still uses
// useSearchParams(), so it still needs a Suspense boundary above it.
function ForgotPasswordOTPFormInner() {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim().slice(0, 6);

    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp([...newOtp, ...new Array(6 - newOtp.length).fill("")]);
      const nextFocusIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextFocusIndex]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join("");

    if (fullOtp.length < 6) {
      toast.error("Please enter the complete 6-digit OTP code.");
      return;
    }

    if (!email) {
      toast.error("Missing email parameter. Please restart the password reset process.");
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post("auth/otp/verify", {
        email,
        otp: fullOtp,
      });

      const { status, message } = response.data;

      if (status) {
        toast.success(message || "OTP verified successfully!");
        router.push(`/set-new-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(fullOtp)}`);
      } else {
        toast.error(message || "Invalid or expired OTP code.");
      }
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col items-center text-center mb-8">
        <Link href="/" className="mb-8 flex justify-center">
          <Logo />
        </Link>

        <h1 className="text-2xl font-public-sans font-bold text-light-primary-text mb-2">
          Verify OTP Code
        </h1>
        <p className="text-gray-600 font-public-sans text-sm max-w-sm">
          Enter the 6-digit verification code sent to{" "}
          <span className="font-semibold text-gray-900">{email || "your email"}</span>.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              disabled={loading}
              className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:bg-gray-100"
            />
          ))}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 py-3 text-base flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify OTP"
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

// Simple fallback shown while the client bailout resolves. Feel free to
// swap this for a skeleton that matches the form's dimensions.
function ForgotPasswordOTPFormFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <span className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// This is the component you actually import and render elsewhere. It wraps
// the part that reads search params in a Suspense boundary.
export function ForgotPasswordOTPForm() {
  return (
    <Suspense fallback={<ForgotPasswordOTPFormFallback />}>
      <ForgotPasswordOTPFormInner />
    </Suspense>
  );
}