"use client";

import React from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import CouponInfo from "./coupon-info";

export default function CouponDetails() {
  const params = useParams();
  const couponId = params?.id as string;

  return (
    <div className="w-full bg-white rounded-2xl mx-auto p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <PageHeader title="Details" backHref="/coupon" className="gap-4" />
        <Button variant="outline" href={`/coupon/edit/${couponId}`}>
          Edit
        </Button>
      </div>

      {/* Coupon Information + Coupon Products */}
      <CouponInfo />
    </div>
  );
}
