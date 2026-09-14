"use client";

import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Pagination } from "../ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { RecentOrderItem } from "@/types/dashboard";

interface RecentOrdersTableProps {
  orders?: RecentOrderItem[];
  isLoading?: boolean;
}

// Map order statuses to badge variants matching your Badge component props
const getStatusBadgeVariant = (
  status: string
):
  | "success"
  | "info"
  | "warning"
  | "error"
  | "default"
  | "success-outline"
  | "warning-outline"
  | "error-outline"
  | "info-outline"
  | "active" => {
  const normalized = status.toLowerCase();
  if (normalized === "completed" || normalized === "delivered") return "success";
  if (normalized === "processing" || normalized === "confirmed") return "info";
  if (normalized === "pending") return "warning";
  if (normalized === "cancelled" || normalized === "failed") return "error";
  return "default";
};

// Format ISO date string into a clean display format
const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

// Format currency values 
const formatPrice = (sales: string | number) => {
    const num = typeof sales === "string" ? parseFloat(sales) : sales;
    if (isNaN(num)) return "₦0";
    
    const formattedNumber = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);

    return `₦${formattedNumber}`;
  };

export default function RecentOrdersTable({
  orders = [],
  isLoading = false,
}: RecentOrdersTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const totalPages = Math.ceil(orders.length / pageSize) || 1;
  const paginatedOrders = orders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="border border-gray-500/20 rounded-2xl w-full">
      <div className="px-6 py-4">
        <h3 className="text-lg text-light-primary-text font-bold">
          Recent Orders
        </h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-b px-2 border-[rgba(145,158,171,0.20)] hover:bg-transparent">
            <TableHead className="py-3 whitespace-nowrap font-semibold text-sm text-light-primary-text h-auto">
              Order ID
            </TableHead>
            <TableHead className="py-3 whitespace-nowrap font-semibold text-sm text-light-primary-text h-auto">
              Customer
            </TableHead>
            <TableHead className="py-3 whitespace-nowrap font-semibold text-sm text-light-primary-text h-auto">
              Order Date
            </TableHead>
            <TableHead className="py-3 whitespace-nowrap font-semibold text-sm text-light-primary-text h-auto">
              Price
            </TableHead>
            <TableHead className="py-3 font-semibold text-sm text-light-primary-text h-auto">
              Status
            </TableHead>
            <TableHead className="py-3 font-semibold text-sm text-light-primary-text h-auto">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: pageSize }).map((_, index) => (
              <TableRow
                key={index}
                className="border-b border-[rgba(145,158,171,0.20)] last:border-0 animate-pulse"
              >
                <TableCell className="py-4"><div className="h-4 w-16 bg-gray-200 rounded"></div></TableCell>
                <TableCell className="py-4"><div className="h-4 w-28 bg-gray-200 rounded"></div></TableCell>
                <TableCell className="py-4"><div className="h-4 w-24 bg-gray-200 rounded"></div></TableCell>
                <TableCell className="py-4"><div className="h-4 w-16 bg-gray-200 rounded"></div></TableCell>
                <TableCell className="py-4"><div className="h-6 w-20 bg-gray-200 rounded-full"></div></TableCell>
                <TableCell className="py-4"><div className="h-6 w-14 bg-gray-200 rounded"></div></TableCell>
              </TableRow>
            ))
          ) : paginatedOrders.length > 0 ? (
            paginatedOrders.map((order) => (
              <TableRow
                key={order.id}
                className="border-b border-[rgba(145,158,171,0.20)] last:border-0 hover:bg-gray-50/50 transition-colors"
              >
                <TableCell className="py-4 text-sm text-light-secondary-text font-medium">
                  {order.order_no}
                </TableCell>
                <TableCell className="py-4 text-sm text-light-secondary-text">
                  {order.user?.name || `User #${order.user_id}`}
                </TableCell>
                <TableCell className="py-4 text-sm text-light-secondary-text">
                  {formatDate(order.created_at)}
                </TableCell>
                <TableCell className="py-4 text-sm text-light-secondary-text font-semibold">
                  {formatPrice(order.total_amount)}
                </TableCell>
                <TableCell className="py-4">
                  <Badge variant={getStatusBadgeVariant(order.order_status)}>
                    {order.order_status}
                  </Badge>
                </TableCell>
                <TableCell className="py-4">
                  <Button                     
                    href={`/orders/details/?id=${order.id}`}
                    variant="primary-outline" size="xs">
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-gray-500 text-sm">
                No recent orders found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="p-4 sm:p-6 flex justify-end border-t border-[rgba(145,158,171,0.20)]">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}