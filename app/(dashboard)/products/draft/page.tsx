import DraftProduct from "@/components/products/draft-products-list-table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Draft Uploaded Products",
  description: "Draft bulk uploaded product.",
};

export default function AddProduct() {
  return <DraftProduct />;
}
