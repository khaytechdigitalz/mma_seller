"use client";

import { useState, useEffect } from "react";
import SearchInput from "../common/search-input";
import CustomSelect, { Option } from "@/components/ui/custom-select";
import { Button } from "@/components/ui/button";
import { Filter, RotateCcw } from "lucide-react";
import { apiClient } from "@/lib/axios";

export interface FilterValues {
  order_no: string;
  order_status: string;
  payment_status: string;
  user_id: string;
  seller_id: string;
  date_from: string;
  date_to: string;
}

interface OrderFiltersProps {
  onFilterChange: (filters: FilterValues) => void;
  isLoading?: boolean;
}

interface SellerItem {
  id: number;
  name?: string;
  store_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

const orderStatusOptions: Option[] = [
  { label: "Pending Payment", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Returned", value: "returned" },
  { label: "Failed", value: "failed" },
];

const paymentStatusOptions: Option[] = [
  { label: "Paid", value: "paid" },
  { label: "Unpaid", value: "unpaid" },
  { label: "Pending", value: "pending" },
  { label: "Refunded", value: "refunded" },
];

export default function OrderFilters({
  onFilterChange,
  isLoading = false,
}: OrderFiltersProps) {
  // Immediate search query state
  const [orderNo, setOrderNo] = useState<string>("");

  // Pending filter states (stored locally until "Filter" is clicked)
  const [orderStatus, setOrderStatus] = useState<Option | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<Option | null>(null);
  const [seller, setSeller] = useState<Option | null>(null);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  // Applied filter states (committed when "Filter" button is clicked)
  const [appliedOrderStatus, setAppliedOrderStatus] = useState<Option | null>(null);
  const [appliedPaymentStatus, setAppliedPaymentStatus] = useState<Option | null>(null);
  const [appliedSeller, setAppliedSeller] = useState<Option | null>(null);
  const [appliedDateFrom, setAppliedDateFrom] = useState<string>("");
  const [appliedDateTo, setAppliedDateTo] = useState<string>("");

  const [sellerOptions, setSellerOptions] = useState<Option[]>([]);
 

  // Handler for immediate search box typing/search
  const handleSearchChange = (query: string) => {
    setOrderNo(query);
    onFilterChange({
      order_no: query,
      order_status: appliedOrderStatus?.value ? String(appliedOrderStatus.value) : "",
      payment_status: appliedPaymentStatus?.value ? String(appliedPaymentStatus.value) : "",
      user_id: "",
      seller_id: appliedSeller?.value ? String(appliedSeller.value) : "",
      date_from: appliedDateFrom,
      date_to: appliedDateTo,
    });
  };

  // Handler when "Filter" button is clicked
  const handleApplyFilters = () => {
    setAppliedOrderStatus(orderStatus);
    setAppliedPaymentStatus(paymentStatus);
    setAppliedSeller(seller);
    setAppliedDateFrom(dateFrom);
    setAppliedDateTo(dateTo);

    onFilterChange({
      order_no: orderNo,
      order_status: orderStatus?.value ? String(orderStatus.value) : "",
      payment_status: paymentStatus?.value ? String(paymentStatus.value) : "",
      user_id: "",
      seller_id: seller?.value ? String(seller.value) : "",
      date_from: dateFrom,
      date_to: dateTo,
    });
  };

  // Handler when "Reset" button is clicked
  const handleReset = () => {
    setOrderNo("");
    setOrderStatus(null);
    setPaymentStatus(null);
    setSeller(null);
    setDateFrom("");
    setDateTo("");

    setAppliedOrderStatus(null);
    setAppliedPaymentStatus(null);
    setAppliedSeller(null);
    setAppliedDateFrom("");
    setAppliedDateTo("");

    onFilterChange({
      order_no: "",
      order_status: "",
      payment_status: "",
      user_id: "",
      seller_id: "",
      date_from: "",
      date_to: "",
    });
  };

  const hasActiveFilters = Boolean(
    orderNo ||
      appliedOrderStatus ||
      appliedPaymentStatus ||
      appliedSeller ||
      appliedDateFrom ||
      appliedDateTo ||
      orderStatus ||
      paymentStatus ||
      seller ||
      dateFrom ||
      dateTo
  );

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="w-full flex flex-col lg:flex-row justify-between gap-4 lg:items-center">
        {/* Immediate Search by Order No */}
        <div className="w-full lg:max-w-xs">
          <SearchInput
            placeholder="Search Order No..."
            onSearch={handleSearchChange}
          />
        </div>

        {/* Select & Date Filters */}
        <div className="flex flex-wrap items-center gap-3"> 

          {/* Order Status */}
          <div className="min-w-[160px]">
            <CustomSelect
              options={orderStatusOptions}
              value={orderStatus}
              onChange={(selected) => setOrderStatus(selected)}
              placeholder="Order Status"
            />
          </div>

          {/* Payment Status */}
          <div className="min-w-[160px]">
            <CustomSelect
              options={paymentStatusOptions}
              value={paymentStatus}
              onChange={(selected) => setPaymentStatus(selected)}
              placeholder="Payment Status"
            />
          </div>

          {/* Date Range Inputs */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              name="date_from"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-10 px-3 text-xs border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="From Date"
            />
            <span className="text-xs text-gray-400">to</span>
            <input
              type="date"
              name="date_to"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-10 px-3 text-xs border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="To Date"
            />
          </div>

          {/* Apply Filter Button */}
          <Button
            onClick={handleApplyFilters}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-xs h-10 px-4"
          >
            <Filter className="size-3.5" />
            Filter
          </Button>

          {/* Reset Button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={isLoading}
              className="flex items-center gap-1.5 text-xs text-gray-600 h-10"
            >
              <RotateCcw className="size-3.5" />
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}