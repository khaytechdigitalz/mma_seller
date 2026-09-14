"use client";

import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import React from "react";
import { MonthlyChartData } from "@/types/sales-report";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface RevenueReportChartProps {
  monthlyData?: MonthlyChartData[];
  isLoading?: boolean;
}


const RevenueReportChart = ({ monthlyData = [] }: RevenueReportChartProps) => {
  const categories = monthlyData.map((item) => item.month.substring(0, 3));
  const totalSalesSeries = monthlyData.map((item) => item.total_sales);
  const netEarningsSeries = monthlyData.map((item) => item.net_earnings);

  const series = [
    {
      name: "Total Sales",
      data: totalSalesSeries.length ? totalSalesSeries : Array(12).fill(0),
    },
    {
      name: "Net Earnings",
      data: netEarningsSeries.length ? netEarningsSeries : Array(12).fill(0),
    },
  ];

  const maxVal = Math.max(...totalSalesSeries, ...netEarningsSeries, 100);

  const options: ApexOptions = {
    chart: {
      type: "area",
      height: 350,
      zoom: { enabled: false },
      toolbar: { show: false },
      fontFamily: "Public Sans, sans-serif",
    },
    colors: ["#00AB55", "#3366FF"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.25,
        opacityTo: 0,
        stops: [0, 100],
      },
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 1.5 },
    xaxis: {
      categories: categories.length
        ? categories
        : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: "#919EAB", fontSize: "12px" } },
    },
    yaxis: {
      labels: {
        formatter: (value) => `$${value.toLocaleString()}`,
        style: { colors: "#919EAB", fontSize: "12px" },
      },
      min: 0,
      max: Math.ceil(maxVal * 1.1),
    },
    grid: {
      borderColor: "rgba(145, 158, 171, 0.20)",
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    legend: {
      show: true,
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
    <div className="border border-gray-500/20 bg-white rounded-2xl w-full mt-4 sm:mt-6">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-500/20">
        <h3 className="text-lg mb-1 font-bold text-light-primary-text">
          Sales & Revenue Analytics
        </h3>
        <p className="text-sm text-light-secondary-text">
          Monthly breakdown of earnings and charges
        </p>
      </div>
      <div id="chart" className="pt-4 sm:pt-6">
        <ReactApexChart
          options={options}
          series={series}
          type="area"
          height={300}
        />
      </div>
    </div>
  );
};

export default RevenueReportChart;