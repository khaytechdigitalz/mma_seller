"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { Eye, EyeOff } from "lucide-react";
import { FloatingInput } from "@/components/ui/floating-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/axios";
import { handleApiError } from "@/lib/apiHelper";
import { TwoFaForm } from "@/components/auth/sigin-2fa-form";
import { Logo } from "@/components/ui/logo";

// Renamed the original component to an inner component. It still uses
// useSearchParams(), so it still needs a Suspense boundary above it.
function SigninFormInner() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("expired") === "1") {
      toast.error("Your session has expired. Please sign in again.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [requires2Fa, setRequires2Fa] = useState(false);
  const [twoFaToken, setTwoFaToken] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post("/auth/login", {
        email,
        password,
      });

      const { status, message, requires_2fa, data } = response.data;

      if (status && requires_2fa) {
        setTwoFaToken(data?.token || "");
        setRequires2Fa(true);
        toast.info(message || "Please enter your 2FA code.");
        return;
      }

      if (status && data?.token) {
        const { token, user } = data;

        const cookieExpiry = keepSignedIn ? 30 : 1;
        Cookies.set("auth_token", token, {
          expires: cookieExpiry,
          secure: true,
          sameSite: "lax",
        });
        const role: "master" | "seller" = user?.type === "seller" ? "seller" : "master";
        localStorage.setItem("auth_token", token);
        localStorage.setItem("user_info", JSON.stringify(user));
        localStorage.setItem("userRole", role);
        document.cookie = `userRole=${role}; path=/; max-age=31536000`;

        toast.success(message || "Login successful!");
        window.location.href = redirectTo;
      } else {
        toast.error(message || "Authentication failed. Please check your credentials.");
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (requires2Fa) {
    return <TwoFaForm token={twoFaToken} keepSignedIn={keepSignedIn} redirectTo={redirectTo} />;
  }

  return (
    <div>
      <div className="flex flex-col items-center text-center mb-8">
        <Link href="/" className="mb-8 flex justify-center">
          <Logo />
        </Link>
        <h1 className="text-2xl font-public-sans font-bold text-light-primary-text mb-2">
          Welcome Back
        </h1>
        <p className="text-gray-600 font-public-sans text-sm max-w-sm">
          Log in with your email and password to access the admin panel.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
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

        <div className="relative">
          <FloatingInput
            label="Password"
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            className="h-12 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none disabled:opacity-50"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              id="keep-signed-in"
              checked={keepSignedIn}
              onCheckedChange={(checked) => setKeepSignedIn(checked as boolean)}
              disabled={loading}
            />
            <label
              htmlFor="keep-signed-in"
              className="text-sm font-public-sans text-light-secondary-text font-medium cursor-pointer"
            >
              Keep me signed in
            </label>
          </div>
          <Link
            href="/forgot-password"
            className="text-[13px] font-bold text-primary hover:text-primary-dark"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 py-3 text-base flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
      <p className="mt-10 text-sm text-light-secondary-text text-center">
        Dont have an account ?{" "}
        <Link
          href="/signup"
          className="ml-2 font-bold text-primary hover:text-primary-dark"
        >
          Become A Seller
        </Link>
      </p>
    </div>
  );
}

// Simple fallback shown while the client bailout resolves. Feel free to
// swap this for a skeleton that matches the form's dimensions.
function SigninFormFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <span className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// This is the component you actually import and render elsewhere
// (e.g. in your page.tsx). It wraps the part that reads search params
// in a Suspense boundary, which is what Next.js is asking for.
export function SigninForm() {
  return (
    <Suspense fallback={<SigninFormFallback />}>
      <SigninFormInner />
    </Suspense>
  );
}