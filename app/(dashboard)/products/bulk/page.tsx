import BulkProductForm from "@/components/products/bulk-product-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bulk Upload Product",
  description: "Upload bulk product to your storefront.",
};

export default function AddProduct() {
  return <BulkProductForm />;
}
