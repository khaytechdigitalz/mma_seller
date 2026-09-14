"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
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
import CustomSelect, { Option } from "../ui/custom-select";
import SearchInput from "../common/search-input";
import { apiClient } from "@/lib/axios";
import { Eye } from "@/icons";

export interface Transaction {
  id: number;
  order_id: number;
  user_id: number;
  transaction_ref: string;
  payment_gateway: string;
  amount: string;
  fee: number;
  total_amount: number;
  tax: number;
  currency: string;
  status: "successful" | "pending" | "failed" | "refunded" | string;
  gateway_response?: any;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  order?: {
    id: number;
    order_no: string;
  };
}

const statusOptions: Option[] = [
  { label: "All Statuses", value: "" },
  { label: "Successful", value: "successful" },
  { label: "Pending", value: "pending" },
  { label: "Failed", value: "failed" },
  { label: "Refunded", value: "refunded" },
];

const gatewayOptions: Option[] = [
  { label: "All Gateways", value: "" },
  { label: "Paystack", value: "Paystack" },
  //{ label: "Flutterwave", value: "Flutterwave" },
  //{ label: "Stripe", value: "Stripe" },
];

const gatewayLogos: Record<string, string> = {
  paystack: "/images/payment-logo/paystack.jpg",
  flutterwave: "/images/payment-logo/flutterwave.png",
  stripe: "/images/payment-logo/stripe.jpeg",
  paypal: "/images/payment-logo/paypal.jpeg",
};

export default function TransactionTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Filtering states
  const [transactionRef, setTransactionRef] = useState("");
  const [statusFilter, setStatusFilter] = useState<Option | null>(null);
  const [gatewayFilter, setGatewayFilter] = useState<Option | null>(null);
  const [userIdFilter, setUserIdFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(15);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/transactions", {
        params: {
          transaction_ref: transactionRef || undefined,
          status: statusFilter?.value || undefined,
          payment_gateway: gatewayFilter?.value || undefined,
          user_id: userIdFilter || undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
          page: currentPage,
          per_page: perPage,
        },
      });

      if (response.data?.status) {
        setTransactions(response.data.data.data);
        setTotalPages(response.data.data.last_page);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  }, [
    transactionRef,
    statusFilter,
    gatewayFilter,
    userIdFilter,
    dateFrom,
    dateTo,
    currentPage,
    perPage,
  ]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleApplyFilter = () => {
    setCurrentPage(1);
    fetchTransactions();
  };

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

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "successful":
        return <Badge variant="success">Successful</Badge>;
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      case "failed":
        return <Badge variant="error">Failed</Badge>;
      case "refunded":
        return <Badge variant="default">Refunded</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatAmount = (amount: number | string, currency = "NGN") => {
    const symbol = currency === "NGN" ? "₦" : "$";
    return `${symbol}${Number(amount).toLocaleString()}`;
  };

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    // Trigger modal or drawer here using selectedTransaction
  };

  return (
    <div className="bg-white rounded-2xl w-full">
      <div className="p-4 sm:p-6 pb-4">
        <div className="flex items-center justify-between gap-4 mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-light-primary-text">
            Orders Transactions
          </h3>
          <Button size="xs">Export</Button>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row justify-between gap-4 lg:items-center">
            {/* Search Reference */}
            <SearchInput
              onSearch={(val) => setTransactionRef(val)}
              placeholder="Search Ref..."
            />

            {/* Dropdowns & Date Pickers */}
            <div className="flex items-center flex-wrap gap-3">
              <div className="min-w-[140px]">
                <CustomSelect
                  options={statusOptions}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  placeholder="Status"
                />
              </div>
              <div className="min-w-[140px]">
                <CustomSelect
                  options={gatewayOptions}
                  value={gatewayFilter}
                  onChange={setGatewayFilter}
                  placeholder="Gateway"
                />
              </div>

              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-10 px-3 text-sm border border-gray-300 rounded-lg text-light-secondary-text focus:outline-none"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-10 px-3 text-sm border border-gray-300 rounded-lg text-light-secondary-text focus:outline-none"
              />

              <Button onClick={handleApplyFilter} size="sm">
                Filter
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100 hover:bg-gray-100 border-y border-gray-500/20">
            <TableHead className="w-[50px] pl-6">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={toggleSelectAll}
              />
            </TableHead>
            <TableHead>Transaction Ref</TableHead>
            <TableHead>Order No</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Fee</TableHead>
            <TableHead>Gateway</TableHead>
            <TableHead>User Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="pr-6 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                Loading transactions...
              </TableCell>
            </TableRow>
          ) : transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                No transactions found.
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((item) => {
              const gatewayKey = item.payment_gateway.toLowerCase();
              const logoSrc = gatewayLogos[gatewayKey];

              return (
                <TableRow
                  key={item.id}
                  className="border-b last:border-0 border-gray-500/20 hover:bg-gray-50/50"
                >
                  <TableCell className="pl-6 whitespace-nowrap">
                    <Checkbox
                      checked={selectedRows.includes(item.id)}
                      onCheckedChange={(checked) =>
                        toggleSelectRow(item.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell className="font-normal text-sm text-light-secondary-text whitespace-nowrap">
                    {item.transaction_ref}
                  </TableCell>
                  <TableCell className="text-sm text-light-secondary-text whitespace-nowrap">
                    {item.order?.order_no || "N/A"}
                  </TableCell>
                  <TableCell className="text-sm font-semibold text-light-primary-text whitespace-nowrap">
                    {formatAmount(item.total_amount, item.currency)}
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap text-light-secondary-text">
                    {formatAmount(item.fee, item.currency)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {logoSrc && (
                        <div className="size-6 relative rounded overflow-hidden shrink-0">
                          <Image
                            src={logoSrc}
                            alt={item.payment_gateway}
                            width={24}
                            height={24}
                            className="object-cover size-full"
                          />
                        </div>
                      )}
                      <span className="text-light-primary-text text-sm">
                        {item.payment_gateway}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-light-secondary-text whitespace-nowrap">
                    {item.user?.email || "N/A"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {getStatusBadge(item.status)}
                  </TableCell>
                  <TableCell className="text-sm text-light-secondary-text whitespace-nowrap">
                    {formatDate(item.created_at)}
                  </TableCell>
                  <TableCell className="pr-6 text-right whitespace-nowrap">
                    <Link
                      href={`/transactions/details?id=${item.id}`}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-primary hover:bg-gray-100 transition-colors"
                      title="View Details"
                    >
                      <Eye className="size-4" />
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="p-4 sm:p-6 border-t border-gray-500/20 flex justify-end">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}