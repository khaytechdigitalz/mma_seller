import AddProductForm from "@/components/products/add-product-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Product",
  description: "Add a new product to your catalog.",
};

export default function AddProduct() {
  return <AddProductForm />;
}
