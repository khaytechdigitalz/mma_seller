import TopProductsTable from "@/components/top-products/top-product-table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Top Products",
  description: "View top performing products.",
};

export default function TopProductsPage() {
  return <TopProductsTable />;
}
