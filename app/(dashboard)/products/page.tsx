"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/axios";
import ProductListTable, {
  ProductItem,
  PaginationData,
} from "@/components/products/products-list-table";
import { ProductFilterValues } from "@/components/products/product-filter-bar";
import { toast } from "sonner";

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filters, setFilters] = useState<ProductFilterValues>({
    per_page: 15,
  });

  // Fetch Products from API
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const cleanedFilters = Object.fromEntries(
        Object.entries(filters).filter(
          ([_, value]) => value !== undefined && value !== ""
        )
      );

      const response = await apiClient.get("products", {
        params: {
          page: currentPage,
          ...cleanedFilters,
        },
      });

      const responseData = response.data.data;

      if (responseData.data) {
        setProducts(responseData.data);
        setPagination({
          current_page: responseData.current_page || responseData.meta?.current_page || 1,
          last_page: responseData.last_page || responseData.meta?.last_page || 1,
          per_page: responseData.per_page || responseData.meta?.per_page || 15,
          total: responseData.total || responseData.meta?.total || 0,
        });
      } else {
        setProducts(Array.isArray(responseData) ? responseData : []);
      }
    } catch (error: any) {
      console.error("Failed to fetch products:", error);
      toast.error(error?.response?.data?.message || "Failed to load products list.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Prevent state updates if values haven't actually changed
  const handleFilterChange = useCallback((newFilters: ProductFilterValues) => {
    setFilters((prev) => {
      const isUnchanged = JSON.stringify(prev) === JSON.stringify(newFilters);
      if (isUnchanged) return prev;
      return newFilters;
    });
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleDeleteProduct = useCallback(
    async (id: number) => {
      try {
        await apiClient.delete(`products/${id}`);
        toast.success("Product deleted successfully");
        fetchProducts();
      } catch (error: any) {
        console.error("Failed to delete product:", error);
        toast.error(error?.response?.data?.message || "Could not delete product.");
      }
    },
    [fetchProducts]
  );

  const handleTogglePublishProduct = useCallback(
    async (id: number, currentPublished: boolean) => {
      try {
        const endpoint = currentPublished
          ? `products/${id}/unpublish`
          : `products/${id}/publish`;

        await apiClient.patch(endpoint, {
          published: !currentPublished,
        });

        toast.success(
          `Product successfully ${currentPublished ? "unpublished" : "published"}`
        );
        fetchProducts();
      } catch (error: any) {
        console.error("Failed to update product publish status:", error);
        toast.error(
          error?.response?.data?.message || "Failed to update publish status."
        );
      }
    },
    [fetchProducts]
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <ProductListTable
        products={products}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        onFilterChange={handleFilterChange}
        onDeleteProduct={handleDeleteProduct}
        onTogglePublishProduct={handleTogglePublishProduct}
      />
    </div>
  );
}