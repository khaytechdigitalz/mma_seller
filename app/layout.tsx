import type { Metadata } from "next";
import { DM_Sans, Public_Sans, Urbanist } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap",
});

const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Market My Art - Admin Dashboard",
    default: "Market My Art - Admin Dashboard",
  },
  description:
    "Market My Art is a modern e-commerce platform built with security in mind.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${publicSans.variable} ${urbanist.variable}  antialiased`}
      >
        {children}
            <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
