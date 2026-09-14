import { SigninForm } from "@/components/auth/sigin-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your account.",
};

export default function SigninPage() {
  return <SigninForm />;
}
