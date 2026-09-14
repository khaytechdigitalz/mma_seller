"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { ActionModal } from "@/components/ui/action-modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, Tag, Copy, Check, Power, Loader2 } from "lucide-react";
import SearchInput from "@/components/common/search-input";
import CouponOverviewGrid, { CouponMetrics } from "./coupon-overview-grid";
import { apiClient } from "@/lib/axios";

export interface CouponProduct {
  id: number;
  name: string;
  thumbnail: string;
}

export interface CouponItem {
  id: number;
  name: string;
  code: string;
  discount_type: "percentage" | "flat" | string;
  discount: string;
  start_date: string;
  end_date: string;
  product_ids: number[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  products?: CouponProduct[];
}

export default function CouponTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [metrics, setMetrics] = useState<CouponMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Action & Modal states
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<"toggle" | "delete" | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<CouponItem | null>(null);

  // Search filter
  const [searchCode, setSearchCode] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Selection state
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  // Fetch Coupons API Call
  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, any> = {
        page: currentPage,
      };

      if (searchCode.trim()) {
        params.search = searchCode.trim();
      }

      const response = await apiClient.get("/coupons", { params });

      if (response.data?.status) {
        setCoupons(response.data.data.data || []);
        setMetrics(response.data.metrics || null);
        setTotalPages(response.data.data.last_page || 1);
      } else {
        setError("Failed to load promotion coupons.");
      }
    } catch (err) {
      console.error("Error fetching coupons:", err);
      setError("An error occurred while retrieving coupon records.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchCode]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // Handle Status Toggle (PATCH /coupons/{id}/toggle-status)
  const handleToggleStatus = async (coupon: CouponItem) => {
    try {
      setActionLoadingId(coupon.id);
      setActionType("toggle");

      const response = await apiClient.patch(`/coupons/${coupon.id}/toggle-status`);

      if (response.data?.status || response.status === 200) {
        setCoupons((prev) =>
          prev.map((item) =>
            item.id === coupon.id
              ? { ...item, is_active: !item.is_active }
              : item
          )
        );
        fetchCoupons();
      }
    } catch (err) {
      console.error("Failed to toggle coupon status:", err);
      alert("Failed to update coupon status. Please try again.");
    } finally {
      setActionLoadingId(null);
      setActionType(null);
    }
  };

  // Open Modal
  const promptDeleteCoupon = (coupon: CouponItem) => {
    setCouponToDelete(coupon);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete Action (DELETE /coupons/{id})
  const confirmDeleteCoupon = async () => {
    if (!couponToDelete) return;

    try {
      setActionLoadingId(couponToDelete.id);
      setActionType("delete");

      const response = await apiClient.delete(`/coupons/${couponToDelete.id}`);

      if (response.data?.status || response.status === 200) {
        setCoupons((prev) => prev.filter((item) => item.id !== couponToDelete.id));
        setIsDeleteModalOpen(false);
        setCouponToDelete(null);
        fetchCoupons();
      }
    } catch (err) {
      console.error("Failed to delete coupon:", err);
      alert("Failed to delete coupon. Please try again.");
    } finally {
      setActionLoadingId(null);
      setActionType(null);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(coupons.map((c) => c.id));
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
    coupons.length > 0 && selectedRows.length === coupons.length;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (coupon: CouponItem) => {
    const now = new Date();
    const expiry = new Date(coupon.end_date);

    if (!coupon.is_active) {
      return <Badge variant="error">Inactive</Badge>;
    }

    if (now > expiry) {
      return <Badge variant="warning">Expired</Badge>;
    }

    return <Badge variant="success">Active</Badge>;
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Dynamic Overview Metrics */}
      <CouponOverviewGrid metrics={metrics} loading={loading} />

      {/* Main Table Container */}
      <div className="mx-4 sm:mx-6 mb-6 bg-white rounded-2xl border border-gray-500/20 overflow-hidden shadow-xs">
        {/* Table Header Controls */}
        <div className="p-4 sm:p-6 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="w-full md:w-80">
            <SearchInput
              {...({
                placeholder: "Search coupon code...",
                value: searchCode,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  setSearchCode(e.target.value);
                  setCurrentPage(1);
                },
              } as any)}
            />
          </div>

          {searchCode && (
            <Button
              variant="ghost"
              size="xs"
              className="text-red-500 hover:text-red-600 text-xs self-start md:self-auto"
              onClick={() => {
                setSearchCode("");
                setCurrentPage(1);
              }}
            >
              Clear Search
            </Button>
          )}
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50 border-y border-gray-500/20">
                <TableHead className="w-[50px] pl-6">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Validity Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-10 text-sm text-gray-500"
                  >
                    Loading coupons...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-10 text-sm text-red-500 font-medium"
                  >
                    {error}
                  </TableCell>
                </TableRow>
              ) : coupons.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-10 text-sm text-gray-500"
                  >
                    No coupon promotions found.
                  </TableCell>
                </TableRow>
              ) : (
                coupons.map((item) => (
                  <TableRow
                    key={item.id}
                    className="border-b last:border-0 border-gray-500/20 hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Select Checkbox */}
                    <TableCell className="pl-6 whitespace-nowrap">
                      <Checkbox
                        checked={selectedRows.includes(item.id)}
                        onCheckedChange={(checked) =>
                          toggleSelectRow(item.id, !!checked)
                        }
                      />
                    </TableCell>

                    {/* Campaign Name */}
                    <TableCell className="whitespace-nowrap font-medium text-gray-900 text-sm">
                      {item.name}
                    </TableCell>

                    {/* Code + Copy */}
                    <TableCell className="whitespace-nowrap">
                      <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-900 border border-teal-200/60 px-2.5 py-1 rounded-lg font-mono text-xs font-bold">
                        <span>{item.code}</span>
                        <button
                          onClick={() => handleCopyCode(item.code)}
                          title="Copy Code"
                          className="hover:text-teal-700 transition-colors"
                        >
                          {copiedCode === item.code ? (
                            <Check className="w-3.5 h-3.5 text-teal-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-teal-500" />
                          )}
                        </button>
                      </div>
                    </TableCell>

                    {/* Discount Value */}
                    <TableCell className="whitespace-nowrap text-sm font-semibold text-gray-800">
                      {item.discount_type === "percentage" ? (
                        <span className="text-teal-700">{Number(item.discount)}% OFF</span>
                      ) : (
                        <span className="text-emerald-700">
                          ₦{Number(item.discount).toLocaleString()} OFF
                        </span>
                      )}
                    </TableCell>

                    {/* Product Avatars Badge */}
                    <TableCell className="whitespace-nowrap">
                      {item.products && item.products.length > 0 ? (
                        <div className="flex items-center gap-1.5 text-xs text-gray-700 font-medium">
                          <Tag className="w-4 h-4 text-teal-600" />
                          <span>
                            {item.products.length} {item.products.length === 1 ? "Product" : "Products"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">All Products</span>
                      )}
                    </TableCell>

                    {/* Start Date & End Date */}
                    <TableCell className="whitespace-nowrap text-xs text-gray-600">
                      <div>{formatDate(item.start_date)}</div>
                      <div className="text-gray-400 text-[11px]">to {formatDate(item.end_date)}</div>
                    </TableCell>

                    {/* Dynamic Status Badge */}
                    <TableCell className="whitespace-nowrap">
                      {getStatusBadge(item)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="pr-6 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Toggle Status Button */}
                        <Button
                          variant="icon"
                          className={`p-1.5 transition-colors ${
                            item.is_active
                              ? "hover:text-amber-600 text-emerald-600"
                              : "hover:text-emerald-600 text-gray-400"
                          }`}
                          title={item.is_active ? "Deactivate Coupon" : "Activate Coupon"}
                          disabled={actionLoadingId === item.id}
                          onClick={() => handleToggleStatus(item)}
                        >
                          {actionLoadingId === item.id && actionType === "toggle" ? (
                            <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                          ) : (
                            <Power className="w-4 h-4" />
                          )}
                        </Button>

                        {/* Edit Button */}
                        <Button
                          variant="icon"
                          className="hover:text-teal-600 transition-colors p-1.5"
                          title="Edit Coupon"
                          href={`/coupon/edit/${item.id}`}
                        >
                          <Edit className="w-4 h-4 text-gray-600 hover:text-teal-600" />
                        </Button>

                        {/* Delete Button */}
                        <Button
                          variant="icon"
                          className="hover:text-red-600 transition-colors p-1.5"
                          title="Delete Coupon"
                          disabled={actionLoadingId === item.id}
                          onClick={() => promptDeleteCoupon(item)}
                        >
                          <Trash2 className="w-4 h-4 text-gray-600 hover:text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="p-4 sm:p-6 border-t border-gray-500/20 flex justify-end">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Delete Action Confirmation Modal */}
      {isDeleteModalOpen && couponToDelete && (
        <ActionModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            if (actionLoadingId !== couponToDelete.id) {
              setIsDeleteModalOpen(false);
              setCouponToDelete(null);
            }
          }}
          title="Delete Coupon"
          description={`Are you sure you want to delete "${couponToDelete.name}" (${couponToDelete.code})? This action cannot be undone.`}
          confirmText={
            actionLoadingId === couponToDelete.id && actionType === "delete"
              ? "Deleting..."
              : "Delete Coupon"
          }
          onConfirm={confirmDeleteCoupon}
        />
      )}
    </div>
  );
}