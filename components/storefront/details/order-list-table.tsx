"use client";

import { useParams } from "next/navigation";
import SellerOrderList from "@/components/storefront/seller-order-list";

/**
 * Thin wrapper so the pending-seller review page can reuse the same,
 * already-working order list used on the approved-seller details page,
 * without duplicating its fetch logic.
 */
export default function OrderListTable() {
  const params = useParams();
  const sellerId = params?.id as string;

  return (
    <div className="rounded-2xl border border-gray-100 p-4 sm:p-6 space-y-4">
      <h3 className="text-base font-bold text-gray-900">Recent Orders</h3>
      <SellerOrderList sellerId={sellerId} />
    </div>
  );
}
