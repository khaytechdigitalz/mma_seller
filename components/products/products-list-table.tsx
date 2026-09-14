"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Pagination } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Eye,
  Pencil,
  Trash2 as Trash,
  MoreVertical,
  Globe,
  GlobeX,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import DeleteModal from "../ui/delete-modal";
import ConfirmModal from "../ui/confirm-modal";
import ProductFilterBar, { ProductFilterValues } from "./product-filter-bar";

export interface ProductItem {
  id: number;
  seller_id: number;
  brand_id: number;
  category_id: number;
  name: string;
  slug: string;
  sku: string;
  unit_price: number;
  current_stock: number;
  published: boolean;
  status: string;
  thumbnail: string | null;
  category?: { id: number; name: string; slug: string } | null;
  seller?: { id: number; name: string; email: string } | null;
  brand?: { id: number; name: string } | null;
}

export interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface ProductListTableProps {
  products?: ProductItem[];
  pagination?: PaginationData;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
  onFilterChange?: (filters: ProductFilterValues) => void;
  onDeleteProduct?: (id: number) => Promise<void>;
  onTogglePublishProduct?: (id: number, currentPublished: boolean) => Promise<void>;
}

const getStatusBadgeVariant = (
  status: string
): "success" | "warning" | "error" | "default" => {
  switch (status.toLowerCase()) {
    case "approved":
      return "success";
    case "pending":
      return "warning";
    case "rejected":
      return "error";
    default:
      return "default";
  }
};
 
const formatCurrency = (sales: string | number) => {
    const num = typeof sales === "string" ? parseFloat(sales) : sales;
    if (isNaN(num)) return "₦0";
    
    const formattedNumber = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);

    return `₦${formattedNumber}`;
  };

export default function ProductListTable({
  products = [],
  pagination,
  isLoading = false,
  onPageChange,
  onFilterChange,
  onDeleteProduct,
  onTogglePublishProduct,
}: ProductListTableProps) {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  // Modals state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);

  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [productToPublish, setProductToPublish] = useState<ProductItem | null>(null);

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(products.map((p) => p.id));
    } else {
      setSelectedRows([]);
    }
  };

  const toggleSelectRow = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedRows((prev) => [...prev, id]);
    } else {
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
    }
  };

  const isAllSelected =
    products.length > 0 && selectedRows.length === products.length;

  const handleDeleteClick = (id: number) => {
    setProductToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (productToDelete && onDeleteProduct) {
      await onDeleteProduct(productToDelete);
    }
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const handlePublishClick = (product: ProductItem) => {
    setProductToPublish(product);
    setIsPublishModalOpen(true);
  };

  const handleConfirmPublish = async () => {
    if (productToPublish && onTogglePublishProduct) {
      await onTogglePublishProduct(
        productToPublish.id,
        productToPublish.published
      );
    }
    setIsPublishModalOpen(false);
    setProductToPublish(null);
  };

  return (
    <div className="bg-white rounded-2xl w-full border border-gray-500/20">
      <div className="p-4 sm:p-6 pb-4">
        <div className="flex items-center justify-between gap-4 mb-4 sm:mb-6">
          <h3 className="text-xl font-bold text-light-primary-text leading-7">
            Product List
          </h3>
          <Button href="/products/add">Create Product</Button>
        </div>

        {/* Modular Product Filter Bar */}
        <ProductFilterBar
          onFilterChange={(filters) => onFilterChange?.(filters)}
        />
      </div>

      {/* Product Data Table */}
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100 hover:bg-gray-100 border-y border-gray-500/20">
            <TableHead className="w-[50px] pl-6">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={toggleSelectAll}
              />
            </TableHead>
            <TableHead>SKU/ID</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right pr-6">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow
                key={index}
                className="border-b border-gray-500/20 animate-pulse"
              >
                <TableCell className="pl-6"><div className="h-4 w-4 bg-gray-200 rounded"></div></TableCell>
                <TableCell><div className="h-4 w-16 bg-gray-200 rounded"></div></TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="size-8 bg-gray-200 rounded-lg"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  </div>
                </TableCell>
                <TableCell><div className="h-4 w-20 bg-gray-200 rounded"></div></TableCell>
                <TableCell><div className="h-4 w-14 bg-gray-200 rounded"></div></TableCell>
                <TableCell><div className="h-4 w-10 bg-gray-200 rounded"></div></TableCell>
                <TableCell><div className="h-4 w-20 bg-gray-200 rounded"></div></TableCell>
                <TableCell><div className="h-6 w-16 bg-gray-200 rounded-full"></div></TableCell>
                <TableCell className="pr-6 text-right"><div className="h-6 w-8 bg-gray-200 rounded ml-auto"></div></TableCell>
              </TableRow>
            ))
          ) : products.length > 0 ? (
            products.map((product) => {
              const imageSrc = product.thumbnail
                ? product.thumbnail.startsWith("http")
                  ? product.thumbnail
                  : `${process.env.NEXT_PUBLIC_STORAGE_URL || ""}/${product.thumbnail}`
                : "/images/placeholder.png";

              return (
                <TableRow
                  key={product.id}
                  className="border-b last:border-0 border-gray-500/20 hover:bg-gray-50/50 transition-colors"
                >
                  <TableCell className="pl-6 whitespace-nowrap">
                    <Checkbox
                      checked={selectedRows.includes(product.id)}
                      onCheckedChange={(checked) =>
                        toggleSelectRow(product.id, checked)
                      }
                    />
                  </TableCell>
                  <TableCell className="font-normal text-sm text-light-secondary-text whitespace-nowrap">
                    #{product.sku || product.id}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg relative overflow-hidden shrink-0 bg-gray-100">
                        <Image
                          src={imageSrc}
                          alt={product.name}
                          width={32}
                          height={32}
                          className="rounded-lg object-cover"
                          unoptimized
                          onError={(e) => {
                            e.currentTarget.src = "/images/customer/user_01.png";
                          }}
                        />
                      </div>
                      <span className="text-sm text-light-secondary-text font-medium truncate max-w-[200px]">
                        {product.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-light-secondary-text whitespace-nowrap">
                    {product.category?.name || "Uncategorized"}
                  </TableCell>
                  <TableCell className="font-semibold text-sm text-primary whitespace-nowrap">
                    {formatCurrency(product.unit_price)}
                  </TableCell>
                  <TableCell className="text-light-secondary-text whitespace-nowrap">
                    {product.current_stock}
                  </TableCell> 
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(product.status)}>
                        {product.status}
                      </Badge>
                      {product.published && (
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-semibold">
                          Published
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="pr-6 whitespace-nowrap text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="icon" className="hover:bg-gray-100">
                          <MoreVertical className="size-4 text-gray-600" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 bg-white shadow-lg rounded-xl border border-gray-100 p-1">
                       
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/products/edit/${product.id}`}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer"
                          >
                            <Pencil className="size-4 text-gray-500" />
                            Edit Product
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => handlePublishClick(product)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer"
                        >
                          {product.published ? (
                            <>
                              <GlobeX className="size-4 text-amber-500" />
                              Unpublish
                            </>
                          ) : (
                            <>
                              <Globe className="size-4 text-emerald-500" />
                              Publish
                            </>
                          )}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="my-1 border-gray-100" />

                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(product.id)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                        >
                          <Trash className="size-4 text-red-500" />
                          Delete Product
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="py-8 text-center text-gray-500 text-sm">
                No products found matching the criteria.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination Container */}
      <div className="p-4 sm:p-6 border-t border-gray-500/20 flex justify-between items-center flex-wrap gap-4">
        <p className="text-sm text-light-secondary-text">
          Showing {products.length} of {pagination?.total ?? 0} products
        </p>
        <Pagination
          currentPage={pagination?.current_page || 1}
          totalPages={pagination?.last_page || 1}
          onPageChange={(page) => onPageChange?.(page)}
        />
      </div>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      {isPublishModalOpen && productToPublish && (
        <ConfirmModal
          isOpen={isPublishModalOpen}
          onClose={() => setIsPublishModalOpen(false)}
          onConfirm={handleConfirmPublish}
          title={productToPublish.published ? "Unpublish Product" : "Publish Product"}
          description={`Are you sure you want to ${
            productToPublish.published ? "unpublish" : "publish"
          } "${productToPublish.name}"?`}
          confirmText={productToPublish.published ? "Unpublish" : "Publish"}
        />
      )}
    </div>
  );
}