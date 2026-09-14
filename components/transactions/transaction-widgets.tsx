"use client";

import { useEffect, useState } from "react";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { apiClient } from "@/lib/axios";

interface TransactionMetrics {
  total_transactions: number;
  total_volume: string | number;
  successful: number;
  pending: number;
  failed: number;
  refunded: number;
  // Percentage change fields optional/fallback
  total_transactions_change?: number;
  total_volume_change?: number;
  successful_change?: number;
  pending_change?: number;
  failed_change?: number;
  refunded_change?: number;
}

export default function TransactionWidgets() {
  const [metrics, setMetrics] = useState<TransactionMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await apiClient.get("/transactions/dashboard-widgets");
        if (response.data?.status) {
          setMetrics(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch transaction metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const formatCurrency = (amount: string | number) => {
    const num = Number(amount) || 0;
    return `₦${num.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
  };

  const widgetCards = [
    {
      title: "Total Transactions",
      value: metrics?.total_transactions ?? 0,
      bgColor: "bg-[#E0F2FE]", // Light Cyan/Blue
      change: metrics?.total_transactions_change ?? 0.1,
    },
    {
      title: "Total Volume",
      value: formatCurrency(metrics?.total_volume ?? 0),
      bgColor: "bg-[#FEF9C3]", // Light Yellow
      change: metrics?.total_volume_change ?? -0.1,
    },
    {
      title: "Successful",
      value: metrics?.successful ?? 0,
      bgColor: "bg-[#FFEDD5]", // Light Peach/Orange
      change: metrics?.successful_change ?? 0.1,
    },
    {
      title: "Pending",
      value: metrics?.pending ?? 0,
      bgColor: "bg-[#FCE7F3]", // Light Pink
      change: metrics?.pending_change ?? -0.1,
    },
    {
      title: "Failed",
      value: metrics?.failed ?? 0,
      bgColor: "bg-[#DCFCE7]", // Light Green
      change: metrics?.failed_change ?? 0.1,
    },
    {
      title: "Refunded",
      value: metrics?.refunded ?? 0,
      bgColor: "bg-[#E0E7FF]", // Light Indigo/Blue
      change: metrics?.refunded_change ?? -0.1,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
      {widgetCards.map((card, idx) => {
        const isPositive = card.change >= 0;
        const formattedPercentage = `${isPositive ? "+" : ""}${card.change.toFixed(1)}%`;

        return (
          <div
            key={idx}
            className={`${card.bgColor} rounded-2xl p-5 flex flex-col justify-between min-h-[120px] transition-all`}
          >
            <span className="text-sm font-medium text-gray-700">
              {card.title}
            </span>

            <div className="mt-4 flex items-center justify-between gap-2">
              {loading ? (
                <Loader2 className="size-5 animate-spin text-gray-500" />
              ) : (
                <h4 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {card.value}
                </h4>
              )}

              {/* Percentage Pill Badge */}
              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/80 shadow-xs ${
                  isPositive ? "text-emerald-600" : "text-rose-500"
                }`}
              >
                <span>{formattedPercentage}</span>
                {isPositive ? (
                  <TrendingUp className="size-3.5 stroke-[2.5]" />
                ) : (
                  <TrendingDown className="size-3.5 stroke-[2.5]" />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}