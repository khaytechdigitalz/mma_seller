"use client";

import React from "react";
import { OrderDetailData } from "@/types/order";

interface OrderDetailsSummaryProps {
  order: OrderDetailData;
}

export default function OrderDetailsSummary({ order }: OrderDetailsSummaryProps) {
  const subtotal = parseFloat(order.subtotal || "0");
  const tax = parseFloat(order.tax_amount || "0");
  const discount = parseFloat(order.discount_amount || "0");
  const shipping = parseFloat(order.shipping_cost || "0");
  const total = parseFloat(order.total_amount || "0");
  const formatCurrency = (sales: string | number) => {
    const num = typeof sales === "string" ? parseFloat(sales) : sales;
    if (isNaN(num)) return "₦0";
    
    const formattedNumber = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);

    return `₦${formattedNumber}`;
  };

  const summaryItems = [
    { label: "Sub-Total", value: `${subtotal}` },
    { label: "Tax", value: `${tax}` },
    { label: "Discount", value: `-${discount}` },
    { label: "Shipment", value: `${shipping}` },
  ];

  

  return (
    <div className="bg-accent-2 rounded-2xl p-4 sm:p-6 w-full">
      {/* Header */}
      <h3 className="text-lg sm:text-xl font-bold text-light-primary-text mb-4 sm:mb-6">
        Order Summary
      </h3>

      {/* Summary Items */}
      <div className="space-y-4 mb-8 sm:mb-12">
        {summaryItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-base text-light-secondary-text">
              {item.label}
            </span>
            <span className="text-base font-medium text-light-primary-text">
              {formatCurrency(item.value)}
            </span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-500/20 pt-2 mb-4 sm:mb-6">
        {/* Total */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold leading-7 text-light-primary-text">
            Total
          </span>
          <span className="text-lg font-bold leading-7 text-light-primary-text">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-lg p-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-light-primary-text capitalize">
          Paid via {order.payment_method || "Card"}
        </span>
        <span className="text-xs font-mono text-gray-500">
          Ref: {order.transaction_ref || "N/A"}
        </span>
      </div>
    </div>
  );
}