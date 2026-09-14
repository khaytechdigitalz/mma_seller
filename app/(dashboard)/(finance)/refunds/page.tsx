import RefundTable from "@/components/finance/refund/refund-table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refunds",
  description: "Manage customer refunds.",
};

export default function Page() {
  return (
    <div>
      <RefundTable />
    </div>
  );
}