"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Eye } from "@/icons";
import { apiClient } from "@/lib/axios";
import OrderFilters, { FilterValues } from "./order-filters";
import { Loader2 } from "lucide-react";

interface OrderItem {
  id: number;
  product: {
    product_name: string;
    sku: string;
  };
  quantity: number;
  total_price: string;
}

interface OrderRecord {
  id: number;
  order_no: string;
  sub_order_no: string;
  user_id: number;
  seller_id: number;
  order_status: string;
  payment_status: string;
  total_amount: string;
  created_at: string;
  master_order: {
    payment_status: string;
    payment_method: string;
    order_no: string;
  } | null;
  user: {
    id: number;
    name: string;
    email: string;
  } | null;
  items: OrderItem[];
}

export default function OrderTable() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  // Filters state
  const [filters, setFilters] = useState<FilterValues>({
    order_no: "",
    order_status: "",
    payment_status: "",
    user_id: "",
    seller_id: "",
    date_from: "",
    date_to: "",
  });

  const fetchOrders = useCallback(
    async (page: number, currentFilters: FilterValues) => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.append("page", String(page));
        queryParams.append("per_page", "15");

        if (currentFilters.order_no) queryParams.append("order_no", currentFilters.order_no);
        if (currentFilters.order_status) queryParams.append("order_status", currentFilters.order_status);
        if (currentFilters.payment_status) queryParams.append("payment_status", currentFilters.payment_status);
        if (currentFilters.user_id) queryParams.append("user_id", currentFilters.user_id);
        if (currentFilters.seller_id) queryParams.append("seller_id", currentFilters.seller_id);
        if (currentFilters.date_from) queryParams.append("date_from", currentFilters.date_from);
        if (currentFilters.date_to) queryParams.append("date_to", currentFilters.date_to);

        const res = await apiClient.get(`orders?${queryParams.toString()}`);
        const paginationData = res?.data?.data;

        if (paginationData) {
          setOrders(paginationData.data || []);
          setCurrentPage(paginationData.current_page || 1);
          setLastPage(paginationData.last_page || 1);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchOrders(currentPage, filters);
  }, [currentPage, filters, fetchOrders]);

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to page 1 on filter update
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(orders.map((o) => o.id));
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
    orders.length > 0 && selectedRows.length === orders.length;

  const getPaymentBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "success-outline";
      case "pending":
        return "warning-outline";
      case "unpaid":
      case "failed":
        return "error-outline";
      default:
        return "default";
    }
  };

  const getReceivedBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "success";
      case "processing":
      case "pending":
        return "warning";
      case "shipped":
        return "info";
      case "cancelled":
      case "failed":
      case "returned":
        return "error";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
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


  const getTotalItemsCount = (items: OrderItem[]) => {
    if (!Array.isArray(items)) return "0 pcs";
    const total = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
    return `${total} pcs`;
  };

  return (
    <div className="pt-6">
      <div className="p-4">
        <OrderFilters
          onFilterChange={handleFilterChange}
          isLoading={isLoading}
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100 hover:bg-gray-100 border-y border-gray-500/20">
            <TableHead className="w-[50px] pl-6">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={toggleSelectAll}
              />
            </TableHead>
            <TableHead>Order No</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Payment Status</TableHead>
            <TableHead>Order Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="pr-6">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={9} className="h-40 text-center">
                <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                  <Loader2 className="size-6 animate-spin text-primary" />
                  <span className="text-sm">Loading orders...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-32 text-center text-gray-500 text-sm">
                No orders found.
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow
                key={order.id}
                className="border-b last:border-0 border-gray-500/20 hover:bg-gray-50/50"
              >
                <TableCell className="pl-6 whitespace-nowrap">
                  <Checkbox
                    checked={selectedRows.includes(order.id)}
                    onCheckedChange={(checked) =>
                      toggleSelectRow(order.id, Boolean(checked))
                    }
                  />
                </TableCell>
                <TableCell className="font-semibold text-sm text-light-primary-text whitespace-nowrap">
                  {order.sub_order_no}
                </TableCell>
                <TableCell className="text-sm text-light-secondary-text whitespace-nowrap">
                  {order.user?.name || "N/A"}
                </TableCell>
                <TableCell className="text-sm whitespace-nowrap text-light-secondary-text">
                  {getTotalItemsCount(order.items)}
                </TableCell>
                <TableCell className="text-sm font-medium text-light-primary-text whitespace-nowrap">
                  {formatCurrency(order.total_amount || "0")}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <Badge variant={getPaymentBadgeVariant(order.payment_status)}>
                    {order.master_order?.payment_status}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <Badge variant={getReceivedBadgeVariant(order.order_status)}>
                    {order.order_status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-light-secondary-text whitespace-nowrap">
                  {formatDate(order.created_at)}
                </TableCell>
                <TableCell className="pr-6 whitespace-nowrap">
                  <Button
                    className="hover:text-primary"
                    variant="icon"
                    href={`/orders/details/?id=${order.id}`}
                  >
                    <Eye className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination Footer */}
      {lastPage > 1 && (
        <div className="pt-4 sm:pt-6 border-t border-gray-500/20 flex justify-end px-4">
          <Pagination
            currentPage={currentPage}
            totalPages={lastPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}