"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/axios";
import { PaginatedResponse } from "@/types/seller";

interface ProductItem {
  id: number;
  name: string;
  sku: string;
  current_stock: number;
  unit_price: string | number;
}

export default function SellerProductList({ sellerId }: { sellerId: string }) {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sellerId) return;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<PaginatedResponse<ProductItem>>(
          `/sellers/${sellerId}/products`,
          {
            params: { page: 1 },
          }
        );

        if (response.data?.status) {
          setProducts(response.data.data.data);
        }
      } catch (err: any) {
        console.error("Failed to fetch seller products:", err);
        setError(err?.response?.data?.message || "Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [sellerId]);

  if (loading) {
    return <div className="py-6 text-center text-sm text-gray-500">Loading products...</div>;
  }

  if (error) {
    return <div className="py-6 text-center text-sm text-red-500">{error}</div>;
  }

  if (products.length === 0) {
    return <div className="py-6 text-center text-sm text-gray-500">No products found.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {products.map((product) => (
        <div key={product.id} className="border rounded-xl p-4 flex flex-col gap-2">
          <p className="font-bold text-base text-gray-900">{product.name}</p>
          <p className="text-xs text-gray-500">SKU: {product.sku}</p>
          <div className="flex justify-between items-center mt-2 text-sm">
            <span className="text-gray-600">Stock: {product.current_stock}</span>
            <span className="font-semibold text-primary">
              ${Number(product.unit_price).toFixed(2)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}