"use client";

import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import React from "react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export interface ChartsData {
  today: Record<string, number> | any[];
  last_7_days: Record<string, number> | any[];
  this_month: Record<string, number> | any[];
  this_year: Record<string, number> | any[];
}

interface RevenueChartProps {
  charts: ChartsData | null;
  loading: boolean;
}

const monthsOrder = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function RevenueChart({ charts, loading }: RevenueChartProps) {
  const yearData = charts?.this_year && !Array.isArray(charts.this_year) 
    ? charts.this_year 
    : {};

  const categories = monthsOrder.map((m) => m.substring(0, 3));
  const seriesData = monthsOrder.map((m) => yearData[m] || 0);

  const series = [
    {
      name: "Platform Earnings",
      data: seriesData,
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "area",
      height: 350,
      zoom: { enabled: false },
      toolbar: { show: false },
      fontFamily: "Public Sans, sans-serif",
    },
    colors: ["#088178"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
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
    legend: {
      position: "top",
      horizontalAlign: "right",
    },
    tooltip: {
      y: {
        formatter: (val) => `₦${val.toLocaleString()}`,
      },
    },
  };

  return (
    <div className="px-4 sm:px-6">
      <div className="border border-gray-500/20 rounded-2xl w-full mt-4 sm:mt-6">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-500/20">
          <h3 className="text-lg mb-1 font-bold text-light-primary-text">
            Earnings Performance
          </h3>
          <p className="text-sm text-light-secondary-text">
            Annual platform earnings breakdown by month
          </p>
        </div>
        <div id="chart" className="pt-4 sm:pt-6">
          {loading ? (
            <div className="h-[300px] flex items-center justify-center text-sm text-gray-500">
              Loading chart...
            </div>
          ) : (
            <ReactApexChart
              options={options}
              series={series}
              type="area"
              height={300}
            />
          )}
        </div>
      </div>
    </div>
  );
}