import CouponOverviewGrid from "@/components/coupon/coupon-overview-grid";
import CouponTable from "@/components/coupon/coupon-table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coupons",
  description: "Manage discount coupons and promotions.",
};

export default function CouponPage() {
  return (
    <div className="space-y-4 sm:space-y-6 bg-white rounded-2xl">
      <CouponTable />
    </div>
  );
}
