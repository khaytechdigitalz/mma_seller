"use client";

import React from "react";
import {
  MoneyExchangeIcon,
  MoneyCheckIcon,
  InvoiceIcon,
  BannedIcon,
} from "@/icons";

export interface WithdrawalWidgets {
  total_successful_transaction_amount: number;
  pending_withdrawals: number;
  successful_withdrawals: number;
  cancelled_withdrawals: number;
}

interface WithdrawOverviewProps {
  widgets: WithdrawalWidgets | null;
  loading: boolean;
}

export default function WithdrawOverview({
  widgets,
  loading,
}: WithdrawOverviewProps) {
  const formatCurrency = (val: number = 0) =>
    `₦${Number(val).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const overviewData = [
    {
      title: "Total Transactions",
      value: formatCurrency(widgets?.total_successful_transaction_amount),
      bgClass: "bg-[rgba(0,171,85,0.12)]",
      icon: MoneyExchangeIcon,
    },
    {
      title: "Pending Withdrawals",
      value: formatCurrency(widgets?.pending_withdrawals),
      bgClass: "bg-[#EBEBFF]",
      icon: MoneyCheckIcon,
    },
    {
      title: "Successful Withdrawals",
      value: formatCurrency(widgets?.successful_withdrawals),
      bgClass: "bg-[#EAF9DE]",
      icon: InvoiceIcon,
    },
    {
      title: "Declined Withdrawals",
      value: formatCurrency(widgets?.cancelled_withdrawals),
      bgClass: "bg-[#FFEBEC]",
      icon: BannedIcon,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {overviewData.map((item, index) => {
        const IconComponent = item.icon;
        return (
          <div
            key={index}
            className={`${item.bgClass} p-4 sm:p-5 rounded-2xl flex items-center justify-between min-h-[96px]`}
          >
            <div>
              <h3 className="text-xs font-semibold mb-1 text-light-primary-text">
                {item.title}
              </h3>
              <span className="text-xl sm:text-2xl font-bold text-light-primary-text">
                {loading ? "..." : item.value}
              </span>
            </div>
            <div className="p-3 bg-white/70 rounded-full">
              <IconComponent className="size-6 text-gray-700" />
            </div>
          </div>
        );
      })}
    </div>
  );
}