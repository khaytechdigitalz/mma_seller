import AddCategoryForm from "@/components/categories/add-category-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Category",
  description: "Create a new product category.",
};

export default function AddCategoryPage() {
  return <AddCategoryForm />;
}
