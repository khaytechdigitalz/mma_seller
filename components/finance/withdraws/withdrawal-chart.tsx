"use client";

import dynamic from "next/dynamic";
import React, { useState } from "react";
import { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export interface ChartsData {
  today: Record<string, string | number> | any[];
  this_week: Record<string, string | number> | any[];
  this_month: Record<string, string | number> | any[];
  this_year: Record<string, string | number> | any[];
}

interface WithdrawalChartProps {
  charts: ChartsData | null;
  loading: boolean;
}

type PeriodTab = "today" | "this_week" | "this_month" | "this_year";

export default function WithdrawalChart({
  charts,
  loading,
}: WithdrawalChartProps) {
  const [activeTab, setActiveTab] = useState<PeriodTab>("this_year");

  const getChartData = () => {
    if (!charts || !charts[activeTab]) {
      return { categories: [], data: [] };
    }

    const currentDataSet = charts[activeTab];

    if (Array.isArray(currentDataSet)) {
      if (currentDataSet.length === 0) {
        return { categories: ["No Data"], data: [0] };
      }
      return {
        categories: currentDataSet.map((_, i) => `Entry ${i + 1}`),
        data: currentDataSet.map((val) => Number(val) || 0),
      };
    }

    const categories = Object.keys(currentDataSet);
    const data = Object.values(currentDataSet).map((v) => Number(v) || 0);

    return { categories, data };
  };

  const { categories, data } = getChartData();

  const series = [
    {
      name: "Withdrawal Volume",
      data,
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 300,
      toolbar: { show: false },
      fontFamily: "Public Sans, sans-serif",
    },
    colors: ["#088178"],
    plotOptions: {
      bar: {
        columnWidth: "35%",
        borderRadius: 4,
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: "#919EAB", fontSize: "12px" },
      },
    },
    yaxis: {
      labels: {
        formatter: (val) => `₦${val.toLocaleString()}`,
        style: { colors: "#919EAB", fontSize: "12px" },
      },
      min: 0,
    },
    grid: {
      borderColor: "rgba(145, 158, 171, 0.20)",
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    tooltip: {
      y: {
        formatter: (val) => `₦${val.toLocaleString()}`,
      },
    },
  };

  const tabs: { label: string; key: PeriodTab }[] = [
    { label: "Today", key: "today" },
    { label: "This Week", key: "this_week" },
    { label: "This Month", key: "this_month" },
    { label: "This Year", key: "this_year" },
  ];

  return (
    <div className="border border-gray-500/20 rounded-2xl w-full mt-6">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-light-primary-text">
            Withdrawal Performance
          </h3>
          <p className="text-sm text-light-secondary-text">
            Summary of withdrawals requested over time
          </p>
        </div>

        {/* Tab Switcher Buttons */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === tab.key
                  ? "bg-white text-teal-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {loading ? (
          <div className="h-[250px] flex items-center justify-center text-sm text-gray-500">
            Loading performance metrics...
          </div>
        ) : (
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={280}
          />
        )}
      </div>
    </div>
  );
}