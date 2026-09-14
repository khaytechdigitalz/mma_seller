import { ForgotPasswordOTPForm } from "@/components/auth/verify-otp-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enter OTP",
  description: "Enter The OTP Sent To Your Email.",
};

export default function ForgotPasswordOTPPage() {
  return <ForgotPasswordOTPForm />;
}
