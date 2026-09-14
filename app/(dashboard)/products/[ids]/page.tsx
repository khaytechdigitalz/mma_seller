"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/axios";
import { Loader2, Package, Tag, Store, ShieldCheck, Check, X } from "lucide-react";

// Helper to assemble full image URLs for remote assets
const STORAGE_BASE_URL =
  process.env.NEXT_PUBLIC_STORAGE_URL;

const getFullImageUrl = (path: string | null) => {
  if (!path) return "/images/placeholder.png";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${STORAGE_BASE_URL}/${path.replace(/^\//, "")}`;
};

// Interface Definitions matching API Response
interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  banner: string | null;
}

interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  status: string;
}

interface Seller {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  status: string;
}

interface AttributeValue {
  id: number;
  attribute_id: number;
  value: string;
}

interface Attribute {
  id: number;
  name: string;
  type: string;
}

interface Variation {
  id: number;
  product_id: number;
  attribute_id: number;
  attribute_value_ids: string[];
  attribute_values: AttributeValue[];
  attribute: Attribute;
}

interface ProductDetails {
  id: number;
  seller_id: number;
  brand_id: number;
  category_id: number;
  sub_category_id: number | null;
  name: string;
  slug: string;
  sku: string;
  product_type: string;
  unit: string;
  tags: string[];
  short_description: string;
  description: string;
  thumbnail: string;
  images: string[];
  unit_price: number;
  purchase_price: number;
  tax: number;
  tax_type: string;
  discount: number;
  discount_type: string;
  current_stock: number;
  minimum_order_qty: number;
  low_stock_threshold: number;
  stock_status: string;
  shipping_cost: number;
  multiply_qty: boolean;
  digital_file: string | null;
  digital_file_type: string | null;
  is_featured: boolean;
  is_todays_deal: boolean;
  published: boolean;
  status: string;
  denied_reason: string | null;
  meta_title: string;
  meta_description: string;
  meta_image: string | null;
  created_at: string;
  updated_at: string;
  category: Category | null;
  sub_category: Category | null;
  brand: Brand | null;
  seller: Seller | null;
  variations: Variation[];
}

export default function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = React.use(params);
  const productId = resolvedParams.id;
  const router = useRouter();

  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get(`products/${productId}`);
        const data = res?.data?.data;
        if (data) {
          setProduct(data);
          setSelectedImage(data.thumbnail || (data.images && data.images[0]) || null);
        }
      } catch (err) {
        console.error("Failed to fetch product details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-2xl min-h-[450px] flex flex-col items-center justify-center p-6 space-y-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-gray-500">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full bg-white rounded-2xl min-h-[400px] flex flex-col items-center justify-center p-6 space-y-4 text-center">
        <Package className="size-12 text-gray-300" />
        <h3 className="text-lg font-bold text-gray-800">Product Not Found</h3>
        <p className="text-sm text-gray-500 max-w-sm">
          The requested product could not be retrieved or has been removed.
        </p>
        <Button variant="outline" size="sm" onClick={() => router.push("/products")}>
          Back to Products
        </Button>
      </div>
    );
  }

  // Gallery array prioritizing thumbnail first, followed by additional images
  const allImages = Array.from(
    new Set([product.thumbnail, ...(product.images || [])].filter(Boolean))
  );

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <PageHeader title="Product Details" backHref="/products" className="gap-4" />
        <div className="flex items-center gap-3">
          <Badge
            variant={
              product.status === "approved"
                ? "success"
                : product.status === "pending"
                ? "warning"
                : "error"
            }
          >
            {product.status}
          </Badge>
          <Button variant="outline" size="xs" href={`/products/edit/${product.id}`}>
            Edit Product
          </Button>
        </div>
      </div>

      {/* Main Grid: Left (Media & Details) / Right (Pricing, Inventory & Metadata) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols wide on Desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gallery & Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
            {/* Gallery View */}
            <div className="space-y-3">
              <div className="relative aspect-square w-full rounded-xl border border-gray-200 overflow-hidden bg-white">
                <Image
                  src={getFullImageUrl(selectedImage)}
                  alt={product.name}
                  fill
                  className="object-contain p-2"
                  unoptimized
                />
              </div>
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(img)}
                      className={`relative size-14 shrink-0 rounded-lg border overflow-hidden bg-white transition-all ${
                        selectedImage === img
                          ? "ring-2 ring-primary border-transparent"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Image
                        src={getFullImageUrl(img)}
                        alt={`Preview ${index}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Core Overview */}
            <div className="space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-bold tracking-wider text-gray-400">
                    SKU: {product.sku}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-gray-500 capitalize">
                    {product.product_type} Product
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {product.name}
                </h1>
                <p className="text-xs text-gray-400 font-mono">Slug: {product.slug}</p>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 pt-2">
                {product.is_featured && (
                  <Badge variant="info" className="text-xs">
                    Featured
                  </Badge>
                )}
                {product.is_todays_deal && (
                  <Badge variant="warning" className="text-xs">
                    Today's Deal
                  </Badge>
                )}
                <Badge
                  variant={product.published ? "success" : "error"}
                  className="text-xs"
                >
                  {product.published ? "Published" : "Draft / Unpublished"}
                </Badge>
              </div>

              {/* Short Description */}
              <div className="pt-2 border-t border-gray-200">
                <h4 className="text-xs font-semibold text-gray-700 uppercase mb-1">
                  Short Description
                </h4>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {product.short_description || "No short description provided."}
                </p>
              </div>

              {/* Category & Brand Metadata */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-white p-2.5 rounded-lg border border-gray-200/80">
                  <span className="text-[11px] font-medium text-gray-400 uppercase block">
                    Category
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    {product.category?.name || "N/A"}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-gray-200/80">
                  <span className="text-[11px] font-medium text-gray-400 uppercase block">
                    Brand
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    {product.brand?.name || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Full Description */}
          <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-500/20 space-y-3">
            <h3 className="text-base font-bold text-gray-900">Description</h3>
            <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {product.description || "No description provided."}
            </div>
          </div>

          {/* Product Variations / Attributes */}
          {product.variations && product.variations.length > 0 && (
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-500/20 space-y-4">
              <h3 className="text-base font-bold text-gray-900">
                Variations & Attributes
              </h3>
              <div className="space-y-3">
                {product.variations.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      <Tag className="size-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">
                        {v.attribute?.name || "Attribute"}
                      </span>
                      <span className="text-xs text-gray-400">({v.attribute?.type})</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {v.attribute_values.map((val) => (
                        <span
                          key={val.id}
                          className="px-2.5 py-1 text-xs font-semibold rounded-md bg-white border border-gray-200 text-gray-800"
                        >
                          {val.value}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-500/20 space-y-3">
              <h3 className="text-base font-bold text-gray-900">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 border border-gray-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1 Col wide on Desktop) */}
        <div className="space-y-6">
          {/* Pricing Card */}
          <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-500/20 space-y-4">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              Pricing Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-gray-500">Unit Price</span>
                <span className="text-xl font-bold text-gray-900">
                  ${product.unit_price}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Purchase Price</span>
                <span className="font-semibold text-gray-700">
                  ${product.purchase_price}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Discount</span>
                <span className="font-semibold text-gray-700">
                  {product.discount} {product.discount_type === "flat" ? "$" : "%"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Tax</span>
                <span className="font-semibold text-gray-700">
                  {product.tax} {product.tax_type === "flat" ? "$" : "%"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Shipping Cost</span>
                <span className="font-semibold text-gray-700">
                  ${product.shipping_cost}
                </span>
              </div>
            </div>
          </div>

          {/* Stock & Inventory Card */}
          <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-500/20 space-y-4">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              Stock & Inventory
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Current Stock</span>
                <span className="font-bold text-gray-900">
                  {product.current_stock} {product.unit}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Stock Status</span>
                <Badge
                  variant={
                    product.stock_status === "in_stock" ? "success" : "error"
                  }
                  className="capitalize"
                >
                  {product.stock_status.replace("_", " ")}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Min. Order Qty</span>
                <span className="font-semibold text-gray-700">
                  {product.minimum_order_qty}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Low Stock Threshold</span>
                <span className="font-semibold text-gray-700">
                  {product.low_stock_threshold}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-gray-500">Multiply Qty With Shipping</span>
                {product.multiply_qty ? (
                  <Check className="size-4 text-emerald-600" />
                ) : (
                  <X className="size-4 text-gray-400" />
                )}
              </div>
            </div>
          </div>

          {/* Seller Card */}
          {product.seller && (
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-500/20 space-y-4">
              <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                <Store className="size-4 text-gray-500" /> Seller Information
              </h3>
              <div className="flex items-center gap-3">
                <div className="relative size-10 rounded-full overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                  <Image
                    src={getFullImageUrl(product.seller.avatar)}
                    alt={product.seller.name}
                    fill
                    className="object-cover"
                    unoptimized
                      onError={(e) => {
                            e.currentTarget.src = "/images/customer/user_01.png";
                          }}
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">
                    {product.seller.name}
                  </h4>
                  <p className="text-xs text-gray-500">{product.seller.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* SEO Metadata Card */}
          <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-500/20 space-y-4">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <ShieldCheck className="size-4 text-gray-500" /> SEO Metadata
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-xs font-semibold text-gray-500 block uppercase">
                  Meta Title
                </span>
                <p className="text-sm font-medium text-gray-800">
                  {product.meta_title || "N/A"}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-500 block uppercase">
                  Meta Description
                </span>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {product.meta_description || "N/A"}
                </p>
              </div>
              {product.meta_image && (
                <div>
                  <span className="text-xs font-semibold text-gray-500 block uppercase mb-1">
                    Meta Image
                  </span>
                  <div className="relative h-20 w-36 rounded-lg border border-gray-200 overflow-hidden">
                    <Image
                      src={getFullImageUrl(product.meta_image)}
                      alt="Meta Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}