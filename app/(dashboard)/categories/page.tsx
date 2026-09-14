import CategoriesListTable from "@/components/categories/categories-list-table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categories",
  description: "Manage product categories.",
};

export default function Page() {
  return <CategoriesListTable />;
}
