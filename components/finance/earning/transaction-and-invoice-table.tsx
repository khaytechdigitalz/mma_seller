"use client";

import React, { useState } from "react";
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
import { TransactionIcon } from "@/icons";

export interface OrderSettlementItem {
  id: number;
  order_id: number;
  seller_id: number;
  gross_amount: number | string;
  platform_fee: number | string;
  net_settlement: number | string;
  status: string;
  settled_at: string | null;
  created_at: string;
  order: {
    id: number;
    order_no: string;
    payment_status: string;
    order_status: string;
  } | null;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

interface TableProps {
  transactions: OrderSettlementItem[];
  pagination: PaginationMeta | null;
  loading: boolean;
  onPageChange: (page: number) => void;
  onSearchChange: (ref: string) => void;
  onDateFromChange: (date: string) => void;
  onDateToChange: (date: string) => void;
}

export default function TransactionAndInvoiceTable({
  transactions,
  pagination,
  loading,
  onPageChange,
  onDateFromChange,
  onDateToChange,
}: TableProps) {
  const [activeTab, setActiveTab] = useState<"settlements">("settlements");
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(transactions.map((t) => t.id));
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
    transactions.length > 0 && selectedRows.length === transactions.length;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (val: number | string = 0) =>
    `₦${Number(val).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="w-full mt-2">
      {/* Tabs */}
      <div className="flex px-4 sm:px-6 pt-4 border-b border-gray-500/20 gap-6 sm:gap-8 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab("settlements")}
          className={`pb-4 flex items-center gap-2 text-sm font-semibold transition-colors border-b-3 whitespace-nowrap ${
            activeTab === "settlements"
              ? "border-primary-dark text-primary-dark"
              : "border-transparent text-light-secondary-text hover:text-light-primary-text"
          }`}
        >
          <TransactionIcon
            className={`size-5 ${
              activeTab === "settlements" ? "" : "text-light-secondary-text"
            }`}
          />
          Settlements
        </button>
      </div>

      <div className="p-4 sm:p-6 sm:pb-4">
        <div className="w-full flex flex-col lg:flex-row justify-between gap-4 lg:items-center">
          <div className="text-sm font-medium text-gray-700">
            Recent Settlement Records
          </div>

          {/* Date Range Inputs */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-start xl:justify-end">
            <input
              type="date"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-700"
              onChange={(e) => onDateFromChange(e.target.value)}
            />
            <span className="text-xs text-gray-400">to</span>
            <input
              type="date"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-700"
              onChange={(e) => onDateToChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div>
        {loading ? (
          <div className="py-12 text-center text-sm text-gray-500">
            Loading settlements...
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">
            No seller settlement records found.
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
                <TableHead>Order No</TableHead>
                <TableHead>Gross Amount</TableHead>
                <TableHead>Platform Fee</TableHead>
                <TableHead>Net Settlement</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Settled Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((item) => {
                const isSelected = selectedRows.includes(item.id);

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
                    <TableCell className="text-sm font-medium text-gray-900 whitespace-nowrap">
                      {item.order?.order_no || "N/A"}
                    </TableCell>
                    <TableCell className="text-sm text-light-secondary-text whitespace-nowrap">
                      {formatCurrency(item.gross_amount)}
                    </TableCell>
                    <TableCell className="text-sm text-amber-700 whitespace-nowrap">
                      {formatCurrency(item.platform_fee)}
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-teal-700 whitespace-nowrap">
                      {formatCurrency(item.net_settlement)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge
                        variant={
                          item.status === "settled" ? "success" : "warning"
                        }
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-light-secondary-text whitespace-nowrap">
                      {formatDate(item.settled_at || item.created_at)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {pagination && pagination.total > 0 && (
        <div className="p-4 sm:p-6 border-t border-gray-500/20 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Showing {pagination.from || 0} to {pagination.to || 0} of{" "}
            {pagination.total} entries
          </span>
          <Pagination
            currentPage={pagination.current_page}
            totalPages={pagination.last_page}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}