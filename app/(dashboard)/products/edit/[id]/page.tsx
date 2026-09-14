import EditProductForm from "@/components/products/edit-product-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Product",
  description: "Edit existing product details.",
};

export default function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  return <EditProductForm />;
}
