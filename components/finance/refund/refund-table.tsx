"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
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
import CustomSelect, { Option } from "@/components/ui/custom-select";
import SearchInput from "@/components/common/search-input";
import { ActionModal } from "@/components/ui/action-modal";
import { apiClient } from "@/lib/axios";
import { RefundItem, RefundMetrics, RefundApiResponse } from "@/types/refund";

const statusOptions: Option[] = [
  { label: "All Statuses", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Declined", value: "declined" },
];

export default function RefundTable() {
  const [loading, setLoading] = useState<boolean>(true);
  const [refunds, setRefunds] = useState<RefundItem[]>([]);
  const [metrics, setMetrics] = useState<RefundMetrics | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    from: 0,
    to: 0,
  });

  // Filter & Search states
  const [selectedStatus, setSelectedStatus] = useState<Option | null>(null); 
  const [orderNoSearch, setOrderNoSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
 
  // Modal Action states
  const [selectedRefund, setSelectedRefund] = useState<RefundItem | null>(null); 
  const [adminNotes, setAdminNotes] = useState<string>("");

  const [selectedRows, setSelectedRows] = useState<number[]>([]);

   
  // Fetch Refunds data from endpoint
  const fetchRefunds = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<RefundApiResponse>("/refunds", {
        params: {
          status: selectedStatus?.value || undefined, 
          order_no: orderNoSearch || undefined,
          page: currentPage,
          per_page: 15,
        },
      });

      if (response.data?.status) {
        setMetrics(response.data.metrics);
        setRefunds(response.data.data.data || []);
        setPagination({
          currentPage: response.data.data.current_page,
          lastPage: response.data.data.last_page,
          total: response.data.data.total,
          from: response.data.data.from,
          to: response.data.data.to,
        });
      }
    } catch (error) {
      console.error("Failed to fetch refunds:", error);
    } finally {
      setLoading(false);
    }
  }, [
    selectedStatus, 
    orderNoSearch,
    currentPage,
  ]);

  useEffect(() => {
    fetchRefunds();
  }, [fetchRefunds]);

   
  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(refunds.map((item) => item.id));
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
    refunds.length > 0 && selectedRows.length === refunds.length;

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "declined":
      case "rejected":
        return "error";
      default:
        return "info";
    }
  };

  return (
    <div className="bg-white rounded-2xl w-full">
      <div className="sm:p-6 p-4 pb-4">
        <div className="flex justify-between items-center gap-4 mb-6">
          <h3 className="text-xl font-bold text-light-primary-text leading-7">
            Refunds
          </h3>

          <div className="flex items-center gap-3">
            <Button className="rounded-full bg-teal-700 hover:bg-teal-800 text-white px-6">
              Export
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
{metrics && (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    {/* Total Refunds - (Matches "Refund Requests" Blue) */}
    <div className="bg-[#c2dcfc] rounded-2xl p-5 flex flex-col justify-between min-h-[120px]">
      <p className="text-sm font-semibold text-gray-700">Total Refunds</p>
      <div className="flex justify-between items-end mt-4">
        <h4 className="text-2xl font-bold text-gray-900">
          ₦{metrics.total.value.toLocaleString()}
        </h4>
        <div className="bg-white px-2.5 py-1 rounded-full text-xs font-bold text-gray-700 flex items-center gap-1 shadow-sm">
          {metrics.total.count} Requests
        </div>
      </div>
    </div>

    {/* Pending Refunds - (Matches "Total Orders" Yellow) */}
    <div className="bg-[#fef2a0] rounded-2xl p-5 flex flex-col justify-between min-h-[120px]">
      <p className="text-sm font-semibold text-gray-700">Pending</p>
      <div className="flex justify-between items-end mt-4">
        <h4 className="text-2xl font-bold text-gray-900">
          ₦{metrics.pending.value.toLocaleString()}
        </h4>
        <div className="bg-white px-2.5 py-1 rounded-full text-xs font-bold text-gray-700 flex items-center gap-1 shadow-sm">
          {metrics.pending.count} Requests
        </div>
      </div>
    </div>

    {/* Approved Refunds - (Matches "Abandoned Carts" Green) */}
    <div className="bg-[#c3f0aa] rounded-2xl p-5 flex flex-col justify-between min-h-[120px]">
      <p className="text-sm font-semibold text-gray-700">Approved</p>
      <div className="flex justify-between items-end mt-4">
        <h4 className="text-2xl font-bold text-gray-900">
          ₦{metrics.approved.value.toLocaleString()}
        </h4>
        <div className="bg-white px-2.5 py-1 rounded-full text-xs font-bold text-gray-700 flex items-center gap-1 shadow-sm">
          {metrics.approved.count} Requests
        </div>
      </div>
    </div>

    {/* Declined Refunds - (Matches "Shipping Delays" Pink) */}
    <div className="bg-[#fde2f4] rounded-2xl p-5 flex flex-col justify-between min-h-[120px]">
      <p className="text-sm font-semibold text-gray-700">Declined</p>
      <div className="flex justify-between items-end mt-4">
        <h4 className="text-2xl font-bold text-gray-900">
          ₦{metrics.declined.value.toLocaleString()}
        </h4>
        <div className="bg-white px-2.5 py-1 rounded-full text-xs font-bold text-gray-700 flex items-center gap-1 shadow-sm">
          {metrics.declined.count} Requests
        </div>
      </div>
    </div>
  </div>
)}

        {/* Search & Filters */}
        <div className="w-full flex-col 2xl:flex-row flex justify-between gap-4 items-center">
          <SearchInput
            placeholder="Search by Order No..."
            onSearch={(val) => {
              setOrderNoSearch(val);
              setCurrentPage(1);
            }}
          />

          <div className="flex items-center flex-wrap gap-3 w-full 2xl:w-auto 2xl:justify-end">
             
            <div className="min-w-[150px]">
              <CustomSelect
                options={statusOptions}
                value={selectedStatus}
                onChange={(opt) => {
                  setSelectedStatus(opt);
                  setCurrentPage(1);
                }}
                placeholder="Status"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        {loading ? (
          <div className="py-12 text-center text-sm text-gray-500">
            Loading refunds records...
          </div>
        ) : refunds.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">
            No refund records found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100 hover:bg-gray-100 border-y border-gray-500/20">
                <TableHead className="w-[50px] pl-6">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={(checked) =>
                      toggleSelectAll(Boolean(checked))
                    }
                  />
                </TableHead>
                <TableHead>Refund No</TableHead>
                <TableHead>Order No</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="pr-6 text-start">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {refunds.map((item) => {
                const isSelected = selectedRows.includes(item.id);
                const isPending = item.status.toLowerCase() === "pending";

                return (
                  <TableRow
                    key={item.id}
                    className="border-b last:border-0 border-gray-500/20 hover:bg-gray-50/50"
                  >
                    <TableCell className="pl-6 whitespace-nowrap">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          toggleSelectRow(item.id, Boolean(checked))
                        }
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs text-light-secondary-text whitespace-nowrap">
                      {item.refund_no}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-gray-900 whitespace-nowrap">
                      {item.order_no}
                    </TableCell>
                    <TableCell className="text-sm text-light-secondary-text whitespace-nowrap">
                      {item.user?.name || "N/A"}
                    </TableCell> 
                    <TableCell className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                      ₦{Number(item.refund_amount).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 max-w-[200px] truncate">
                      {item.reason}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant={getBadgeVariant(item.status)}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-light-secondary-text whitespace-nowrap">
                      {formatDate(item.created_at)}
                    </TableCell>

                    <TableCell className="pr-6 whitespace-nowrap">
                      <div className="flex items-center gap-2"> 
                        <Link href={`/refunds/${item.id}`}>
                          <Button size="xs" variant="outline">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {pagination.total > 0 && (
        <div className="p-4 sm:p-6 border-t border-gray-500/20 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Showing {pagination.from || 0} to {pagination.to || 0} of{" "}
            {pagination.total} entries
          </span>
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.lastPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}

      
    </div>
  );
}