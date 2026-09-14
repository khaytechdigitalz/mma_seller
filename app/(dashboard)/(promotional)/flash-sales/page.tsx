import FlashSaleTable from "@/components/flash-sale/flash-sale-table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flash Sales",
  description: "Manage flash sales and limited time offers.",
};

export default function FlashSalesPage() {
  return <FlashSaleTable />;
}
