"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/axios";
import { PaginatedResponse } from "@/types/seller";

interface ProductItem {
  id: number;
  name: string;
  sku: string;
  current_stock: number;
  unit_price: string | number;
}

/**
 * Products this seller has fully sold out of. Assumes the same
 * /sellers/{id}/products endpoint supports a stock filter - adjust the
 * param name if your backend differs.
 */
export default function RecentSoldOutTable() {
  const params = useParams();
  const sellerId = params?.id as string;

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sellerId) return;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get<PaginatedResponse<ProductItem>>(
          `/sellers/${sellerId}/products`,
          { params: { page: 1, per_page: 5, stock: 0 } },
        );
        if (response.data?.status) {
          setProducts(response.data.data.data.filter((p) => p.current_stock === 0));
        }
      } catch (err: any) {
        console.error("Failed to fetch sold-out products:", err);
        setError(err?.response?.data?.message || "Failed to load sold-out products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [sellerId]);

  return (
    <div className="rounded-2xl border border-gray-100 p-4 sm:p-6 space-y-4">
      <h3 className="text-base font-bold text-gray-900">Sold Out Products</h3>
      {loading ? (
        <div className="py-6 text-center text-sm text-gray-500">Loading...</div>
      ) : error ? (
        <div className="py-6 text-center text-sm text-red-500">{error}</div>
      ) : products.length === 0 ? (
        <div className="py-6 text-center text-sm text-gray-500">No sold-out products.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product.id} className="border rounded-xl p-4 flex flex-col gap-2 border-red-100 bg-red-50/30">
              <p className="font-bold text-sm text-gray-900 truncate">{product.name}</p>
              <p className="text-xs text-gray-500">SKU: {product.sku}</p>
              <div className="flex justify-between items-center mt-2 text-sm">
                <span className="text-red-600 font-medium">Out of Stock</span>
                <span className="font-semibold text-primary">
                  ${Number(product.unit_price).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
