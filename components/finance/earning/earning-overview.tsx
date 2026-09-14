"use client";

import React from "react";
import { Button } from "@/components/ui/button";

export interface PlatformWidgets {
  total_net_earnings: number;
  total_gross_amount: number;
  total_platform_fees: number;
  total_settlements: number;
}

interface EarningOverviewProps {
  widgets: PlatformWidgets | null;
  loading: boolean;
}

export default function EarningOverview({ widgets, loading }: EarningOverviewProps) {
  const formatCurrency = (val: number = 0) =>
    `₦${Number(val).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const cards = [
    {
      title: "Total Net Earnings",
      value: formatCurrency(widgets?.total_net_earnings),
      bgClass: "bg-[#DDF4F4]", // Soft Cyan
    },
    {
      title: "Total Gross Amount",
      value: formatCurrency(widgets?.total_gross_amount),
      bgClass: "bg-[#E2F0D9]", // Soft Green
    },
    {
      title: "Platform Fees",
      value: formatCurrency(widgets?.total_platform_fees),
      bgClass: "bg-[#FFF5C0]", // Soft Yellow
    },
    {
      title: "Total Settlements",
      value: widgets?.total_settlements.toLocaleString() || "0",
      bgClass: "bg-[#DDEBF7]", // Soft Blue
    },
  ];

  return (
    <div className="w-full px-4 sm:px-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl font-bold text-light-primary-text">
          Earnings Overview
        </h2>
        <Button className="rounded-full bg-teal-700 hover:bg-teal-800 text-white px-6">
          Export
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((item, index) => (
          <div
            key={index}
            className={`${item.bgClass} p-5 rounded-2xl flex flex-col justify-between min-h-[100px]`}
          >
            <span className="text-xs font-semibold text-gray-700">
              {item.title}
            </span>
            <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">
              {loading ? "..." : item.value}
            </h4>
          </div>
        ))}
      </div>
    </div>
  );
}