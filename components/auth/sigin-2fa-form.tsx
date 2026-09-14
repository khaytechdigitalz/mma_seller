"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/axios";
import { handleApiError } from "@/lib/apiHelper";
import { Logo } from "@/components/ui/logo";

interface TwoFaFormProps {
  token?: string;
  keepSignedIn?: boolean;
  redirectTo?: string;
  onBack?: () => void; // Added callback to return to the sign-in form
}

export function TwoFaForm({
  token: propToken,
  keepSignedIn: propKeepSignedIn,
  redirectTo = "/",
  onBack,
}: TwoFaFormProps) {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resolve token and keepSignedIn from props or fall back to session storage
  const [token, setToken] = useState<string>("");
  const [keepSignedIn, setKeepSignedIn] = useState<boolean>(false);

  useEffect(() => {
    if (propToken) {
      setToken(propToken);
      sessionStorage.setItem("2fa_challenge_token", propToken);
    } else {
      const storedToken = sessionStorage.getItem("2fa_challenge_token") || localStorage.getItem("2fa_challenge_token") || "";
      setToken(storedToken);
    }

    if (propKeepSignedIn !== undefined) {
      setKeepSignedIn(propKeepSignedIn);
      sessionStorage.setItem("2fa_keep_signed_in", String(propKeepSignedIn));
    } else {
      const storedKeepSignedIn = sessionStorage.getItem("2fa_keep_signed_in") === "true";
      setKeepSignedIn(storedKeepSignedIn);
    }
  }, [propToken, propKeepSignedIn]);

  // Auto-focus the first OTP box on load
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Handle box-by-box input change
  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle keyboard backspace navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle pasting full 6-digit OTP code
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

  const handleBackClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // Clear temporary 2FA session items
    sessionStorage.removeItem("2fa_challenge_token");
    sessionStorage.removeItem("2fa_keep_signed_in");

    if (onBack) {
      onBack();
    } else {
      window.location.href = "/signin";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join("");

    if (fullOtp.length < 6) {
      toast.error("Please enter the complete 6-digit authentication code.");
      return;
    }

    if (!token) {
      toast.error("Invalid or expired 2FA session. Please sign in again.");
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post("/auth/login_twofa", {
        token,
        one_time_password: fullOtp,
      });

      const { status, message, data } = response.data;

      if (status && data?.token) {
        const { token: authToken, user } = data;

        // Clear temporary challenge tokens
        sessionStorage.removeItem("2fa_challenge_token");
        sessionStorage.removeItem("2fa_keep_signed_in");

        const cookieExpiry = keepSignedIn ? 30 : 1;
        Cookies.set("auth_token", authToken, {
          expires: cookieExpiry,
          secure: true,
          sameSite: "lax",
        });

        const role: "master" | "seller" = user?.type === "seller" ? "seller" : "master";
        localStorage.setItem("auth_token", authToken);
        localStorage.setItem("user_info", JSON.stringify(user));
        localStorage.setItem("userRole", role);
        document.cookie = `userRole=${role}; path=/; max-age=31536000`;

        toast.success(message || "2FA verification successful!");
        window.location.href = redirectTo;
      } else {
        toast.error(message || "Invalid or expired 2FA code.");
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
          Two-Factor Authentication
        </h1>
        <p className="text-gray-600 font-public-sans text-sm max-w-sm">
          Open your authenticator app and enter the 6-digit security code to complete your login.
        </p>
      </div>

      {/* 6-Box OTP Form */}
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
              Verifying Code...
            </>
          ) : (
            "Verify & Sign In"
          )}
        </Button>
      </form>

      <p className="mt-10 text-center text-sm text-light-secondary-text">
        Back to{" "}
        <a
          href="#signin"
          onClick={handleBackClick}
          className="ml-1 font-bold text-primary hover:text-primary-dark cursor-pointer"
        >
          Sign In
        </a>
      </p>
    </div>
  );
}