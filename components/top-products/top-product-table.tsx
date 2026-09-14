"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye } from "@/icons";
import CustomSelect, { Option } from "../ui/custom-select";
import { apiClient } from "@/lib/axios";

// TypeScript Interfaces
export interface ProductDetail {
  id: number;
  name: string;
  sku: string;
  unit_price: number | string;
  thumbnail?: string | null;
}

export interface TopProductItem {
  product_id: number;
  total_units_sold: number;
  total_revenue: number;
  product: ProductDetail;
}

export interface ReportMetrics {
  total_volume_sold: number;
  total_value_sold: number;
  total_unique_products_sold: number;
}

export interface TopProductReportResponse {
  status: boolean;
  metrics: ReportMetrics;
  data: {
    top_by_count: TopProductItem[];
    top_by_value: TopProductItem[];
  };
}

// Filter Options
const rankingOptions: Option[] = [
  { label: "Top by Value (Revenue)", value: "value" },
  { label: "Top by Count (Volume)", value: "count" },
];

const yearOptions: Option[] = [
  { label: "2026", value: "2026" },
  { label: "2025", value: "2025" },
];

export default function TopProductsTable() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // API Data State
  const [metrics, setMetrics] = useState<ReportMetrics | null>(null);
  const [topByValue, setTopByValue] = useState<TopProductItem[]>([]);
  const [topByCount, setTopByCount] = useState<TopProductItem[]>([]);

  // UI State
  const [rankingType, setRankingType] = useState<"value" | "count">("value");
  const [selectedYear, setSelectedYear] = useState<Option | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const pageSize = 8;

  // Fetch Report Data
  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get<TopProductReportResponse>(
        "/top-product-report",
        {
          params: {
            year: selectedYear ? selectedYear.value : undefined,
          },
        }
      );

      if (response.data?.status) {
        setMetrics(response.data.metrics);
        setTopByValue(response.data.data.top_by_value || []);
        setTopByCount(response.data.data.top_by_count || []);
      }
    } catch (err: any) {
      console.error("Failed to fetch top products report:", err);
      setError(
        err?.response?.data?.message || "Failed to load top products report."
      );
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Active Dataset Selection
  const activeDataset = rankingType === "value" ? topByValue : topByCount;

  // Search Filter
  const filteredProducts = activeDataset.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.product?.name?.toLowerCase().includes(query) ||
      item.product?.sku?.toLowerCase().includes(query)
    );
  });

  // Pagination Slice
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Row Selection Handlers
  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(paginatedProducts.map((p) => p.product_id));
    } else {
      setSelectedRows([]);
    }
  };

  const toggleSelectRow = (productId: number, checked: boolean) => {
    if (checked) {
      setSelectedRows((prev) => [...prev, productId]);
    } else {
      setSelectedRows((prev) => prev.filter((id) => id !== productId));
    }
  };

  const isAllSelected =
    paginatedProducts.length > 0 &&
    paginatedProducts.every((p) => selectedRows.includes(p.product_id));

  const formatCurrency = (val: number | string) =>
    `₦${Number(val || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="space-y-6 w-full">
      {/* Metrics Header Summary Widget */}
      {metrics && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Card 1: Total Sales Revenue */}
          <div className="rounded-2xl bg-[#DDF4F4] p-5 flex flex-col justify-between min-h-[110px]">
            <span className="text-xs font-semibold text-gray-600">
              Total Sales Revenue
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <h4 className="text-2xl font-bold text-gray-900">
                {formatCurrency(metrics.total_value_sold)}
              </h4>
            </div>
          </div>

          {/* Card 2: Total Volume Sold */}
          <div className="rounded-2xl bg-[#FFF5C0] p-5 flex flex-col justify-between min-h-[110px]">
            <span className="text-xs font-semibold text-gray-600">
              Total Volume Sold
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <h4 className="text-2xl font-bold text-gray-900">
                {metrics.total_volume_sold.toLocaleString()}
              </h4>
            </div>
          </div>

          {/* Card 3: Unique Products Sold */}
          <div className="rounded-2xl bg-[#FFE4D6] p-5 flex flex-col justify-between min-h-[110px]">
            <span className="text-xs font-semibold text-gray-600">
              Unique Products Sold
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <h4 className="text-2xl font-bold text-gray-900">
                {metrics.total_unique_products_sold.toLocaleString()}
              </h4>
            </div>
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl w-full border border-gray-200">
        <div className="p-4 sm:p-6 pb-4">
          <div className="flex flex-row justify-between gap-4 mb-4 sm:mb-6">
            <h3 className="text-xl font-bold text-light-primary-text leading-7">
              Top Products List
            </h3>

            <div className="flex items-center gap-3">
              <Button className="rounded-full bg-teal-700 hover:bg-teal-800 text-white px-6">
                Export
              </Button>
            </div>
          </div>

          <div className="w-full flex justify-between gap-4 items-center flex-wrap xl:flex-nowrap">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="sm:w-48">
                <CustomSelect
                  options={rankingOptions}
                  value={
                    rankingOptions.find((opt) => opt.value === rankingType) || null
                  }
                  onChange={(selected) =>
                    setRankingType((selected?.value as "value" | "count") || "value")
                  }
                  placeholder="Ranking View"
                />
              </div>

              <div className="sm:w-32">
                <CustomSelect
                  options={yearOptions}
                  value={selectedYear}
                  onChange={setSelectedYear}
                  placeholder="Year"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Table State */}
        {loading ? (
          <div className="py-12 text-center text-sm text-gray-500">
            Loading report data...
          </div>
        ) : error ? (
          <div className="py-12 text-center text-sm text-red-500">{error}</div>
        ) : paginatedProducts.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">
            No products found matching the criteria.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100 hover:bg-gray-100 border-y border-gray-500/20">
                <TableHead className="w-[50px] pl-6">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Product SKU</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Units Sold</TableHead>
                <TableHead>Total Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.map((item) => {
                const isSelected = selectedRows.includes(item.product_id);
                const thumbnailSrc = item.product?.thumbnail
                  ? `/${item.product.thumbnail}`
                  : "/images/placeholder.png";

                return (
                  <TableRow
                    key={item.product_id}
                    className="border-b last:border-0 border-gray-500/20 hover:bg-gray-50/50"
                  >
                    <TableCell className="pl-6">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          toggleSelectRow(item.product_id, Boolean(checked))
                        }
                      />
                    </TableCell>
                    <TableCell className="font-normal text-sm text-light-secondary-text">
                      #{item.product?.sku}
                    </TableCell>
                    <TableCell className="text-sm text-light-secondary-text">
                      <div className="flex items-center gap-2">
                        <div className="size-8 relative rounded bg-gray-100 shrink-0 overflow-hidden border border-gray-200">
                          <Image
                            src={thumbnailSrc}
                            alt={item.product?.name || "Product"}
                            fill
                            className="object-cover"
                             unoptimized
                           onError={(e) => {
                            e.currentTarget.src = "/images/customer/user_01.png";
                          }}
                          />
                        </div>
                        <span className="font-medium text-gray-900">
                          {item.product?.name || "N/A"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-light-secondary-text">
                      <Badge variant="info" className="font-mono text-xs">
                        {item.product?.sku || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-light-secondary-text">
                      {formatCurrency(item.product?.unit_price)}
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-gray-900">
                      {item.total_units_sold.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-teal-700">
                      {formatCurrency(item.total_revenue)}
                    </TableCell> 
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {/* Footer Pagination */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="p-6 border-t border-gray-500/20 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, filteredProducts.length)} of{" "}
              {filteredProducts.length} entries
            </span>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}