"use client";

import React from "react";
import { DashboardMetrics } from "@/types/dashboard";
import { TrendUpIcon, TrendDownIcon } from "../../icons";

interface DashboardStatsGridProps {
  metrics?: DashboardMetrics;
  isLoading?: boolean;
}

export default function DashboardStatsGrid({
  metrics,
  isLoading = false,
}: DashboardStatsGridProps) {
  // Helper to format numbers cleanly (e.g., currency formatting & thousand separators)
  const formatValue = (key: string, val: number | string | undefined) => {
    if (val === undefined || val === null) return "0";
    const numericVal = typeof val === "string" ? parseFloat(val) : val;

    if (isNaN(numericVal)) return "0";

    if (key === "total_sales") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 2,
      }).format(numericVal);
    }

    return new Intl.NumberFormat("en-US").format(numericVal);
  };

  const statsConfig = [
    {
      key: "total_sales",
      label: "Total Sales",
      value: formatValue("total_sales", metrics?.total_sales),
      trend: "+0.1%",
      isPositive: true,
      bgClass: "bg-[rgba(160,226,224,0.60)]",
    },
    {
      key: "total_orders",
      label: "Total Orders",
      value: formatValue("total_orders", metrics?.total_orders),
      trend: "-0.1%",
      isPositive: false,
      bgClass: "bg-[rgba(255,235,105,0.60)]",
    },
    {
      key: "total_customers",
      label: "Total Customers",
      value: formatValue("total_customers", metrics?.total_customers),
      trend: "+0.1%",
      isPositive: true,
      bgClass: "bg-[rgba(255,192,145,0.60)]",
    },
    {
      key: "refund_requests",
      label: "Refund Requests",
      value: formatValue("refund_requests", metrics?.refund_requests),
      trend: "+0.1%",
      isPositive: true,
      bgClass: "bg-[rgba(146,189,245,0.60)]",
    },
    {
      key: "stock_products",
      label: "Total Products",
      value: formatValue("stock_products", metrics?.stock_products),
      trend: "-0.1%",
      isPositive: false,
      bgClass: "bg-[rgba(250,184,81,0.60)]",
    },
    {
      key: "abandoned_carts",
      label: "Abandoned Carts",
      value: formatValue("abandoned_carts", metrics?.abandoned_carts),
      trend: "+0.1%",
      isPositive: true,
      bgClass: "bg-[rgba(158,232,114,0.60)]",
    },
    {
      key: "payment_failures",
      label: "Payment Failures",
      value: formatValue("payment_failures", metrics?.payment_failures),
      trend: "-0.1%",
      isPositive: false,
      bgClass: "bg-[rgba(116,202,255,0.60)]",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-32 bg-gray-100 animate-pulse rounded-2xl p-6 flex flex-col justify-between"
          >
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
            <div className="h-8 w-32 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {statsConfig.map((stat) => (
        <div
          key={stat.key}
          className={`${stat.bgClass} p-6 rounded-2xl flex flex-col justify-between relative`}
        >
          <div>
            <p className="text-sm font-semibold text-light-secondary-text mb-2">
              {stat.label}
            </p>
            <h3 className="text-2xl font-dm-sans font-bold text-light-primary-text">
              {stat.value}
            </h3>
          </div>

          {/*
          <div className="absolute bottom-6 right-6 flex items-center gap-1 bg-white px-2 py-1 font-normal text-xs rounded-full">
            <span
              className={`text-xs font-bold ${
                stat.isPositive ? "text-primary" : "text-error"
              }`}
            >
              {stat.trend}
            </span>
            <span className={stat.isPositive ? "text-primary" : "text-error"}>
              {stat.isPositive ? (
                <TrendUpIcon width={16} height={16} />
              ) : (
                <TrendDownIcon width={16} height={16} />
              )}
            </span>
          </div>
          */}
        </div>
      ))}
    </div>
  );
}