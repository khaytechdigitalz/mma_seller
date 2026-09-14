"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/lib/axios";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type TimeFilterKey = "12_months" | "30_days" | "7_days" | "24_hours";

interface FilterOption {
  label: string;
  key: TimeFilterKey;
}

const timeFilters: FilterOption[] = [
  { label: "12 months", key: "12_months" },
  { label: "30 days", key: "30_days" },
  { label: "7 days", key: "7_days" },
  { label: "24 hours", key: "24_hours" },
];

interface ChartDataItem {
  label: string;
  total_volume: number;
  successful_volume?: number;
}

export default function TransactionChart() {
  const [activeFilter, setActiveFilter] = useState<TimeFilterKey>("12_months");
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchChartData = useCallback(async (periodKey: TimeFilterKey) => {
    setIsLoading(true);
    try {
      const res = await apiClient.get(`/transactions/chart-metrics?period=${periodKey}`);
      if (res?.data?.status && Array.isArray(res.data.data)) {
        setChartData(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching transaction chart:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChartData(activeFilter);
  }, [activeFilter, fetchChartData]);

  const categories = useMemo(() => {
    return chartData.map((item) => item.label);
  }, [chartData]);

  const volumeSeries = useMemo(() => {
    return chartData.map((item) => item.total_volume || 0);
  }, [chartData]);

  const successfulSeries = useMemo(() => {
    return chartData.map((item) => item.successful_volume ?? item.total_volume ?? 0);
  }, [chartData]);

  const options: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "line",
        toolbar: { show: false },
        zoom: { enabled: false },
        fontFamily: "inherit",
        animations: { enabled: true, easing: "easeinout", speed: 500 },
      },
      colors: ["#088178", "#FAB851"],
      stroke: { width: 4, curve: "straight" },
      grid: {
        borderColor: "#F1F4F9",
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
      },
      xaxis: {
        categories,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: { colors: "#6B7280", fontSize: "12px" },
        },
      },
      yaxis: {
        labels: {
          style: { colors: "#6B7280", fontSize: "12px" },
          formatter: (value: number) => {
            if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
            if (value >= 1000) return `₦${(value / 1000).toFixed(0)}k`;
            return `₦${value}`;
          },
        },
      },
      legend: { show: false },
      markers: { size: 0, hover: { size: 6 } },
      tooltip: {
        y: {
          formatter: (value: number) => `₦${value.toLocaleString()}`,
        },
      },
    }),
    [categories]
  );

  const series = useMemo(
    () => [
      { name: "Total Volume", data: volumeSeries },
      { name: "Successful Volume", data: successfulSeries },
    ],
    [volumeSeries, successfulSeries]
  );

  return (
    <div className="w-full">
      <div className="pt-2">
        <h3 className="text-xl mb-2 font-bold text-light-primary-text">
          Transaction Metrics
        </h3>

        <div className="flex flex-col lg:flex-row py-4 items-start gap-5 lg:items-center justify-between">
          <div className="flex items-center h-11.5 ring ring-gray-300 rounded-lg overflow-hidden w-full lg:w-auto">
            <div className="flex divide-x divide-gray-300 items-center h-full overflow-x-auto scrollbar-hide min-w-max">
              {timeFilters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  className={`px-3 lg:px-5 py-3.5 text-[15px] font-semibold transition-colors whitespace-nowrap ${
                    activeFilter === filter.key
                      ? "bg-gray-100 text-light-primary-text"
                      : "bg-white text-light-disabled-text hover:bg-gray-50"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border-2 border-primary bg-transparent"></span>
              <span className="text-sm text-light-secondary-text">
                Total Volume
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border-2 border-[#FAB851] bg-transparent"></span>
              <span className="text-sm text-light-secondary-text">
                Successful Volume
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="h-[300px] w-full -ml-4 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        )}
        <Chart
          options={options}
          series={series}
          type="line"
          height="100%"
          width="100%"
        />
      </div>
    </div>
  );
}