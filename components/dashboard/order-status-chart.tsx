"use client";

import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { DashboardCard } from "@/components/ui/dashboard-card";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

// Default color palette corresponding to chart statuses
const COLOR_PALETTE = [
  "#2CD9C5", // Teal
  "#2D99FF", // Blue
  "#FFEF5A", // Yellow
  "#E02D69", // Pink
  "#FF6C40", // Orange
  "#826AF9", // Purple
  "#CB0233", // Red
  "#056D6E", // Dark Teal
  "#00AAEC", // Light Blue
];

interface OrderStatusChartProps {
  chartData?: Record<string, number>;
  isLoading?: boolean;
}

// Helper function to turn snake_case API keys into clean display labels
const formatLabel = (key: string): string => {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function OrderStatusChart({
  chartData = {},
  isLoading = false,
}: OrderStatusChartProps) {
  // Extract dynamic labels, series, and colors based on API data
  const rawKeys = Object.keys(chartData);
  const labels = rawKeys.map((key) => formatLabel(key));
  const series = Object.values(chartData);
  const colors = rawKeys.map(
    (_, index) => COLOR_PALETTE[index % COLOR_PALETTE.length]
  );

  const options: ApexOptions = {
    chart: {
      type: "pie",
      fontFamily: "var(--font-dm-sans)",
      animations: {
        enabled: true,
      },
      toolbar: {
        show: false,
      },
    },
    labels: labels,
    colors: colors,
    plotOptions: {
      pie: {
        expandOnClick: false,
        donut: {
          size: "0%",
        },
      },
    },
    stroke: {
      width: 0,
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    tooltip: {
      enabled: true,
      theme: "dark",
      style: {
        fontSize: "12px",
        fontFamily: "var(--font-dm-sans)",
      },
    },
  };

  if (isLoading) {
    return (
      <DashboardCard title="Order Status">
        <div className="flex flex-col md:flex-row justify-between gap-8 h-[270px] animate-pulse">
          <div className="w-full md:w-1/2 space-y-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div className="h-4 w-28 bg-gray-200 rounded"></div>
                <div className="h-4 w-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
          <div className="w-full md:w-1/2 flex justify-center items-center">
            <div className="w-48 h-48 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="Order Status">
      <div className="flex flex-col md:flex-row justify-between gap-8 min-h-[270px]">
        {/* Custom Legend */}
        <div className="w-full md:w-1/2 space-y-2">
          {labels.length > 0 ? (
            labels.map((label, index) => (
              <div
                key={label}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: colors[index] }}
                  ></span>
                  <span className="text-sm text-light-primary-text">
                    {label}
                  </span>
                </div>
                <span className="text-sm leading-5.5 text-light-primary-text font-medium">
                  {series[index]}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 py-4">
              No order status data available.
            </p>
          )}
        </div>

        {/* Dynamic Pie Chart */}
        <div className="w-full md:w-1/2 flex justify-center items-center">
          <div className="relative w-full">
            {series.length > 0 ? (
              <Chart
                options={options}
                series={series}
                type="pie"
                width="100%"
                height="270"
              />
            ) : (
              <div className="w-48 h-48 bg-gray-50 rounded-full border border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-400">
                No Data
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}