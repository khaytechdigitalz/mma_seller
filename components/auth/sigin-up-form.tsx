"use client";
import React, { useState } from "react";
import Link from "next/link";
import { FloatingInput } from "@/components/ui/floating-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "../../icons";
import { Logo } from "@/components/ui/logo";
import { apiClient } from "@/lib/axios";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import RegisterOTPForm from "@/components/auth/verify-email-form";

export function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  // Visibility states for passwords
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Calculate Password Strength
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "", color: "bg-gray-200" };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-500 text-red-500" };
    if (score === 2) return { score: 2, label: "Fair", color: "bg-orange-500 text-orange-500" };
    if (score === 3) return { score: 3, label: "Good", color: "bg-yellow-500 text-yellow-600" };
    return { score: 4, label: "Strong", color: "bg-green-500 text-green-600" };
  };

  const strength = getPasswordStrength(password);
  const passwordsMatch = passwordConfirmation.length > 0 && password === passwordConfirmation;
  const passwordsMismatch = passwordConfirmation.length > 0 && password !== passwordConfirmation;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptedTerms) {
      toast.error("Please accept the Terms and Conditions to continue.");
      return;
    }

    if (password !== passwordConfirmation) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      };

      const response = await apiClient.post("/auth/register", payload);

      if (response.data?.status) {
        toast.success(response.data.message || "Registration successful! Please verify your email.");
        setIsRegistered(true);
      }
    } catch (err: any) {
      console.error("Registration failed:", err);
      toast.error(err?.response?.data?.message || "Failed to register account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isRegistered) {
    return <RegisterOTPForm email={email} />;
  }

  return (
    <div>
      {/* Logos & Illustration */}
      <div className="flex flex-col items-start mb-8">
        <Link href="/" className="mb-8">
          <Logo />
        </Link>
         
        <h1 className="text-2xl font-public-sans font-bold text-light-primary-text mb-2">
          Sign Up
        </h1>
        <p className="text-gray-600 font-public-sans text-sm">
          First time on our platform? Sign up in seconds.
        </p>
      </div>

      {/* Social Login */}
      <div className="mb-8">
        <button
          type="button"
          onClick={() => toast.info("Google login coming soon!")}
          className="w-full flex items-center font-bold h-12 text-light-primary-text font-public-sans justify-center gap-2 py-3 px-4 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition-colors"
        >
          <GoogleIcon />
          Continue with Google
        </button>
      </div>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-500/20"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-light-secondary-text">Or</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FloatingInput
            label="Name"
            id="name"
            type="text"
            className="h-12"
            value={name}
            onChange={(e: any) => setName(e.target.value)}
            required
          />
          <FloatingInput
            label="Email"
            id="email"
            type="email"
            className="h-12"
            value={email}
            onChange={(e: any) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <FloatingInput
              label="Password"
              id="password"
              type={showPassword ? "text" : "password"}
              className="h-12 pr-10"
              value={password}
              onChange={(e: any) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="relative">
            <FloatingInput
              label="Confirm password"
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              className={`h-12 pr-10 ${passwordsMismatch ? "border-red-500 focus-visible:border-red-500" : ""}`}
              value={passwordConfirmation}
              onChange={(e: any) => setPasswordConfirmation(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Password Strength & Match Indicators */}
        <div className="space-y-1 pt-1">
          {password && (
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-public-sans">
                <span className="text-gray-500">Password Strength:</span>
                <span className={`font-bold ${strength.color.split(" ")[1]}`}>
                  {strength.label}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1 h-1.5 w-full">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`rounded-full transition-colors duration-300 ${
                      strength.score >= level ? strength.color.split(" ")[0] : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {passwordConfirmation && (
            <div className="pt-1">
              {passwordsMatch && (
                <p className="text-xs text-green-600 flex items-center gap-1 font-public-sans">
                  <CheckCircle2 size={13} /> Passwords match
                </p>
              )}
              {passwordsMismatch && (
                <p className="text-xs text-red-500 flex items-center gap-1 font-public-sans">
                  <AlertCircle size={13} /> Passwords do not match
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-2">
          <Checkbox
            id="terms"
            checked={acceptedTerms}
            onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
          />
          <label
            htmlFor="terms"
            className="text-sm font-public-sans text-light-secondary-text font-medium cursor-pointer"
          >
            I accept Terms and Conditions
          </label>
        </div>

        <Button type="submit" disabled={loading} className="w-full h-12 py-3 text-base mt-6">
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Sign Up
        </Button>
      </form>

      <p className="mt-10 text-sm text-light-secondary-text text-center">
        Already have an account?{" "}
        <Link
          href="/signin"
          className="ml-2 font-bold text-primary hover:text-primary-dark"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
}