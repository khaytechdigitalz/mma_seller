"use client";

import { useState } from "react";
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
import { SearchIcon, Download } from "@/icons";
import CustomSelect, { Option } from "@/components/ui/custom-select";
import Image from "next/image";
import SearchInput from "../common/search-input";

const paymentMethods = [
  { method: "Wise", icon: "/images/payment-logo/wise.png" },
  { method: "Paypal", icon: "/images/payment-logo/paypal.jpeg" },
  { method: "Stripe", icon: "/images/payment-logo/stripe.jpeg" },
  { method: "Razorpay", icon: "/images/payment-logo/razor.jpeg" },
  { method: "Apple Pay", icon: "/images/payment-logo/apple.png" },
  { method: "Google Pay", icon: "/images/payment-logo/google.jpeg" },
];

const transactionsData = Array.from({ length: 15 }).map((_, i) => {
  const payment = paymentMethods[i % paymentMethods.length];

  return {
    id: `#${73423 + i}`,
    amount: `$${i * 50 + 100}`,
    method: payment.method,
    methodIcon: payment.icon,
    mail: `customer${i + 1}@example.com`,
    status: i % 4 === 0 ? "Pending" : "Paid",
    date: `1${i + 1} Sept, 2027`,
  };
});

const methodOptions = [
  { label: "Master Card", value: "logo" },
  { label: "Visa", value: "visa" },
  { label: "PayPal", value: "paypal" },
];

const statusOptions = [
  { label: "Paid", value: "paid" },
  { label: "Pending", value: "pending" },
  { label: "Failed", value: "failed" },
];

const dateOptions = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
];

export default function TransactionTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [method, setMethod] = useState<Option | null>(null);
  const [status, setStatus] = useState<Option | null>(null);
  const [date, setDate] = useState<Option | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(transactionsData.map((_, i) => String(i)));
    } else {
      setSelectedRows([]);
    }
  };

  const toggleSelectRow = (index: string, checked: boolean) => {
    if (checked) {
      setSelectedRows((prev) => [...prev, index]);
    } else {
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== index));
    }
  };

  const isAllSelected =
    transactionsData.length > 0 &&
    selectedRows.length === transactionsData.length;

  return (
    <div className="bg-white rounded-2xl w-full">
      {/* Header */}
      <div className="p-4 sm:p-6 pb-4">
        <div className="flex items-center gap-4 mb-4 sm:mb-6 justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-light-primary-text">
            Transactions
          </h2>
          <Button variant="primary" size="xs">
            Export
          </Button>
        </div>

        <div className="w-full flex flex-col sm:flex-row  justify-between gap-4">
          {/* Search */}
          <SearchInput />
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-[120px]">
              <CustomSelect
                options={methodOptions}
                value={method}
                onChange={setMethod}
                placeholder="Method"
              />
            </div>
            <div className="min-w-[100px]">
              <CustomSelect
                options={statusOptions}
                value={status}
                onChange={setStatus}
                placeholder="Status"
              />
            </div>
            <div className="min-w-[100px]">
              <CustomSelect
                options={dateOptions}
                value={date}
                onChange={setDate}
                placeholder="Date"
              />
            </div>
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100 hover:bg-gray-100 border-y border-gray-500/20">
            <TableHead className="w-[50px] pl-6 whitespace-nowrap">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={toggleSelectAll}
              />
            </TableHead>
            <TableHead>ID</TableHead>
            <TableHead className="whitespace-nowrap">Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="whitespace-nowrap">Mail</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="pr-6 whitespace-nowrap">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactionsData.slice((currentPage - 1) * 10, currentPage * 10).map((transaction, index) => (
            <TableRow
              key={index}
              className="border-b last:border-0 border-gray-500/20 hover:bg-gray-50/50"
            >
              <TableCell className="pl-6 whitespace-nowrap">
                <Checkbox
                  checked={selectedRows.includes(String(index))}
                  onCheckedChange={(checked) =>
                    toggleSelectRow(String(index), checked)
                  }
                />
              </TableCell>
              <TableCell className="font-normal text-sm text-light-secondary-text whitespace-nowrap">
                {transaction.id}
              </TableCell>
              <TableCell className="text-sm font-medium text-light-primary-text whitespace-nowrap">
                {transaction.amount}
              </TableCell>
              <TableCell className="whitespace-nowrap min-w-40">
                <div className="flex items-center gap-2">
                  <div className="shrink-0">
                    <Image
                      src={transaction.methodIcon}
                      alt={transaction.method}
                      width={32}
                      height={32}
                      className="object-cover w-full h-full rounded-md"
                    />
                  </div>
                  <span className="text-sm text-light-secondary-text">
                    {transaction.method}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-sm min-w-60 whitespace-nowrap text-light-secondary-text">
                {transaction.mail}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    transaction.status === "Paid" ? "success" : "warning"
                  }
                >
                  {transaction.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-light-secondary-text whitespace-nowrap">
                {transaction.date}
              </TableCell>
              <TableCell className="pr-6 whitespace-nowrap">
                <Button variant="icon">
                  <Download className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="p-4 sm:p-6 border-t border-gray-500/20 flex justify-end">
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(transactionsData.length / 10)}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
