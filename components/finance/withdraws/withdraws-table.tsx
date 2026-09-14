"use client";

import React, { useEffect, useState } from "react";
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
import { apiClient } from "@/lib/axios";

export interface WithdrawalUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
}

export interface BankDetail {
  id: number;
  user_id: number;
  bank_code: string;
  bank_name: string;
  account_number: string;
  account_name: string;
}

export interface WithdrawalItem {
  id: number;
  reference: string;
  user_id: number;
  user_bank_detail_id: number;
  amount: string;
  fee: string;
  net_amount: string;
  status: string;
  admin_notes: string | null;
  processed_by_user_id: number | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
  user: WithdrawalUser | null;
  bank_detail: BankDetail | null;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface SellerItem {
  id: number;
  name: string;
  email: string;
  storefront?: {
    name: string;
  } | null;
}

export interface SellersApiResponse {
  status: boolean;
  data: {
    data: SellerItem[];
  };
}
 

interface WithdrawsTableProps {
  withdrawals: WithdrawalItem[];
  pagination: PaginationMeta | null;
  loading: boolean; 
  onPageChange: (page: number) => void;
  onSearchChange: (val: string) => void;
}

export default function WithdrawsTable({
  withdrawals,
  pagination,
  loading, 
  onPageChange,
  onSearchChange,
}: WithdrawsTableProps) {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(withdrawals.map((p) => p.id));
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
    withdrawals.length > 0 && selectedRows.length === withdrawals.length;

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
      case "successful":
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
      case "declined":
        return "error";
      default:
        return "info";
    }
  };

  return (
    <div>
       

      <div>
        {loading ? (
          <div className="py-12 text-center text-sm text-gray-500">
            Loading withdrawal records...
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">
            No withdrawal requests found.
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
                <TableHead>Reference</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Bank Account</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Net Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested Date</TableHead>
                <TableHead className="text-start pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.map((item) => {
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
                    <TableCell className="font-mono text-xs text-light-secondary-text whitespace-nowrap">
                      {item.reference}
                    </TableCell>
                    <TableCell className="text-light-secondary-text whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.user?.name || "N/A"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {item.user?.email || ""}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-light-secondary-text whitespace-nowrap">
                      {item.bank_detail ? (
                        <div>
                          <p className="text-xs font-semibold text-gray-800">
                            {item.bank_detail.bank_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.bank_detail.account_number}
                          </p>
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                      ₦{Number(item.amount).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                      ₦{Number(item.fee).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm font-bold text-teal-700 whitespace-nowrap">
                      ₦{Number(item.net_amount).toLocaleString()}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant={getBadgeVariant(item.status)}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-light-secondary-text whitespace-nowrap">
                      {formatDate(item.created_at)}
                    </TableCell>
                    <TableCell className="pr-6 whitespace-nowrap">
                      <div className="flex gap-2">
                        <Link href={`/withdraws/${item.id}`}>
                          <Button size="xs" variant="outline">
                            View
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