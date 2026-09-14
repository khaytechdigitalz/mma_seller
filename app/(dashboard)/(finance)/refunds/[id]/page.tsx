import type { Metadata } from "next";
import RefundDetailsClient from "@/components/finance/refund/refund-details-client";

export const metadata: Metadata = {
  title: "Refund Details",
  description: "View detailed information about a refund.",
};

export default async function RefundDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;

  return (
    <div className="p-4 sm:p-6 bg-white rounded-2xl">
      <RefundDetailsClient refundId={resolvedParams.id} />
    </div>
  );
}