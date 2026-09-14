"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { apiClient } from "@/lib/axios";
import { Loader2, ShieldCheck, ShieldAlert, KeyRound, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

export default function TwoFaSettings() {
  const [loading, setLoading] = useState(true);
  const [is2faEnabled, setIs2faEnabled] = useState(false);
  const [setupData, setSetupData] = useState<{ secret: string; qr_code_url: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 6-box OTP code state
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Disable modal / form fields state
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disableCode, setDisableCode] = useState(["", "", "", "", "", ""]);
  const disableInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/account");
      if (res.data?.status) {
        setIs2faEnabled(!!res.data.data.google2fa_enabled);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Handle OTP box changes (Setup/Enable)
  const handleOtpChange = (index: number, value: string, isDisable = false) => {
    if (isNaN(Number(value))) return;
    const currentCode = isDisable ? [...disableCode] : [...otpCode];
    currentCode[index] = value.substring(value.length - 1);
    
    if (isDisable) {
      setDisableCode(currentCode);
    } else {
      setOtpCode(currentCode);
    }

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = isDisable ? disableInputRefs.current[index + 1] : inputRefs.current[index + 1];
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent, isDisable = false) => {
    if (e.key === "Backspace") {
      const currentCode = isDisable ? [...disableCode] : [...otpCode];
      if (!currentCode[index] && index > 0) {
        const prevInput = isDisable ? disableInputRefs.current[index - 1] : inputRefs.current[index - 1];
        prevInput?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent, isDisable = false) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasteData)) {
      const digits = pasteData.split("");
      if (isDisable) {
        setDisableCode(digits);
        disableInputRefs.current[5]?.focus();
      } else {
        setOtpCode(digits);
        inputRefs.current[5]?.focus();
      }
    }
  };

  const handleStartSetup = async () => {
    setSubmitting(true);
    try {
      const res = await apiClient.post("/account/2fa/setup");
      if (res.data?.status) {
        setSetupData(res.data.data);
        toast.success("Scan the QR code with your authenticator app.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to initialize 2FA setup.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnable2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    const codeStr = otpCode.join("");
    if (codeStr.length !== 6) {
      toast.error("Please enter a valid 6-digit verification code.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiClient.post("/account/2fa/enable", { code: codeStr });
      if (res.data?.status) {
        toast.success("Google 2FA enabled successfully!");
        setIs2faEnabled(true);
        setSetupData(null);
        setOtpCode(["", "", "", "", "", ""]);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Invalid verification code.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisable2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    const codeStr = disableCode.join("");
    if (!disablePassword || codeStr.length !== 6) {
      toast.error("Please provide your password and 6-digit code.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiClient.post("/account/2fa/disable", {
        password: disablePassword,
        code: codeStr,
      });
      if (res.data?.status) {
        toast.success("Google 2FA disabled successfully.");
        setIs2faEnabled(false);
        setShowDisableModal(false);
        setDisablePassword("");
        setDisableCode(["", "", "", "", "", ""]);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to disable 2FA.");
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
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
      {/* Header section */}
      <div className="border-b pb-4 border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${is2faEnabled ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
            {is2faEnabled ? <ShieldCheck className="size-5" /> : <ShieldAlert className="size-5" />}
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Google Two-Factor Authentication</h2>
            <p className="text-xs text-gray-500">Secure your account sign-ins using an authenticator app.</p>
          </div>
        </div>
        <span
          className={`px-3.5 py-1 rounded-full text-xs font-semibold ${
            is2faEnabled ? "bg-emerald-50 text-emerald-600 border border-emerald-200/50" : "bg-amber-50 text-amber-600 border border-amber-200/50"
          }`}
        >
          {is2faEnabled ? "Enabled" : "Disabled"}
        </span>
      </div>

      {!is2faEnabled ? (
        <div className="space-y-6">
          {!setupData ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-gray-900">Add an extra layer of security</h3>
                <p className="text-xs text-gray-500 max-w-xl">
                  Protect your workspace access. Once enabled, logging into your account will require a secure 6-digit token from Google Authenticator, Authy, or 1Password.
                </p>
              </div>
              <Button type="button" variant="primary" onClick={handleStartSetup} disabled={submitting} className="shrink-0">
                {submitting && <Loader2 className="size-4 animate-spin mr-2" />}
                Setup Google 2FA
              </Button>
            </div>
          ) : (
            <form onSubmit={handleEnable2fa} className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Step 1 Card */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-gray-50/70 border border-gray-200/80 rounded-2xl space-y-4 text-center">
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-white px-3 py-1 rounded-full shadow-xs border border-gray-200">
                    <Smartphone className="size-3.5 text-primary" /> Step 1: Scan QR Code
                  </div>
                  <div className="p-3 bg-white rounded-xl shadow-xs border border-gray-100">
                    <QRCodeSVG value={setupData.qr_code_url} size={150} level="H" includeMargin />
                  </div>
                  <div className="w-full space-y-1">
                    <p className="text-[11px] text-gray-400">Can't scan? Use setup key:</p>
                    <p className="text-xs text-gray-700 font-mono bg-white px-3 py-1.5 rounded-lg border border-gray-200 select-all truncate">
                      {setupData.secret}
                    </p>
                  </div>
                </div>

                {/* Step 2 Card */}
                <div className="lg:col-span-7 p-6 bg-white border border-gray-200/80 rounded-2xl space-y-5">
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                    <KeyRound className="size-3.5 text-primary" /> Step 2: Verification
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">Enter 6-Digit Token</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Type the verification code generated by your authenticator app to complete configuration.
                    </p>
                  </div>

                  {/* 6-box input */}
                  <div className="flex gap-2.5" onPaste={(e) => handlePaste(e, false)}>
                    {otpCode.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          inputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value, false)}
                        onKeyDown={(e) => handleKeyDown(idx, e, false)}
                        className="size-12 text-center font-bold text-lg bg-gray-50/50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Button type="submit" variant="primary" disabled={submitting || otpCode.join("").length !== 6}>
                      {submitting && <Loader2 className="size-4 animate-spin mr-2" />}
                      Verify & Enable
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setSetupData(null)}>
                      Cancel Setup
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-emerald-900">Your account is fully secured</h3>
              <p className="text-xs text-emerald-700 max-w-lg">
                Google Two-Factor Authentication is active and protecting your sign-in session. You will be prompted for an authenticator code on future logins.
              </p>
            </div>
            {!showDisableModal && (
              <Button type="button" variant="danger" onClick={() => setShowDisableModal(true)} className="shrink-0">
                Disable 2FA
              </Button>
            )}
          </div>

          {showDisableModal && (
            <form onSubmit={handleDisable2fa} className="p-6 bg-gray-50/70 rounded-2xl border border-gray-200/80 space-y-5 animate-in fade-in duration-300">
              <div className="space-y-1">
                <h3 className="font-bold text-gray-900 text-sm">Disable Google Two-Factor Authentication</h3>
                <p className="text-xs text-gray-500">
                  For your security, please confirm your current account password and provide a valid 6-digit code to turn off 2FA.
                </p>
              </div>
              
              <div className="max-w-md">
                <FloatingInput
                  label="Account Password"
                  type="password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700">Current 6-Digit Code</label>
                <div className="flex gap-2.5" onPaste={(e) => handlePaste(e, true)}>
                  {disableCode.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        disableInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value, true)}
                      onKeyDown={(e) => handleKeyDown(idx, e, true)}
                      className="size-12 text-center font-bold text-lg bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" variant="danger" disabled={submitting}>
                  {submitting && <Loader2 className="size-4 animate-spin mr-2" />}
                  Confirm & Disable 2FA
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowDisableModal(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}