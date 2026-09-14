"use client";

import React from "react";
import { DashboardCard } from "@/components/ui/dashboard-card";


export interface TopState {
  shipping_state: string;
  total_sales: string;
}

interface TopStateCardProps {
  states?: TopState[];
  isLoading?: boolean;
}

export default function TopStateCard({
  states = [],
  isLoading = false,
}: TopStateCardProps) {

  // Calculate dynamic total sales across top states for subtitle
  const totalSalesSum = states.reduce(
    (acc, state) => acc + (parseFloat(state.total_sales) || 0),
    0
  );

const formattedTotalSales = `₦${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(totalSalesSum)}`;

const formatSalesVal = (sales: string | number) => {
    const num = typeof sales === "string" ? parseFloat(sales) : sales;
    if (isNaN(num)) return "₦0";
    
    const formattedNumber = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);

    return `₦${formattedNumber}`;
  };

  if (isLoading) {
    return (
      <DashboardCard title="Top States By Sales" subtitle="Loading metrics...">
        <div className="space-y-6 pt-6 animate-pulse">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-8 h-6 bg-gray-200 rounded"></div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
              </div>
              <div className="h-7 w-[80px] bg-gray-200 rounded"></div>
              <div className="h-4 w-12 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard
      title="Top States By Sales"
      subtitle={`Total Sale ${formattedTotalSales}`}
    >
      <div className="space-y-6 pt-6">
        {states.length > 0 ? (
          states.map((state, index) => {
            const stateName = state.shipping_state || "Unknown";
            const isUpTrend = index % 2 === 0;
            const trendColor = isUpTrend ? "#00c853" : "#ff3d60";

            return (
              <div
                key={`${stateName}-${index}`}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-6 flex items-center justify-center text-base shrink-0 select-none text-gray-400">
                    📍
                  </div>
                  <span className="font-semibold font-dm-sans text-light-primary-text text-sm">
                    {stateName}
                  </span>
                </div>

                <div className="flex-1 h-7 max-w-[80px]">
                   
                </div>

                <div className="text-right">
                  <span className="font-semibold text-sm text-light-primary-text">
                    {formatSalesVal(state.total_sales)}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-gray-500 py-4 text-center">
            No sales state data available.
          </p>
        )}
      </div>
    </DashboardCard>
  );
}