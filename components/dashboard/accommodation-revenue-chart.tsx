"use client";

import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { MonthlyRevenueItem } from "@/types/dashboard";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

// Alternating color scheme for bar visualization matching design
const BAR_COLORS = [
  "#FFC107", // Yellow
  "#088178", // Teal
  "#FFC107",
  "#088178",
  "#FFC107",
  "#088178",
  "#FFC107",
  "#088178",
  "#FFC107",
  "#088178",
  "#FFC107",
  "#088178",
];

interface AccommodationRevenueChartProps {
  revenueData?: MonthlyRevenueItem[];
  isLoading?: boolean;
}

export default function AccommodationRevenueChart({
  revenueData = [],
  isLoading = false,
}: AccommodationRevenueChartProps) {
  // Extract categories (months) and series values (revenue) dynamically
  const categories = revenueData.map((item) => item.month);
  const seriesData = revenueData.map((item) => item.revenue);

  // Calculate dynamic max height for Y-axis scaling
  const maxRevenue = Math.max(...seriesData, 0);
  const yAxisMax = maxRevenue > 0 ? Math.ceil(maxRevenue * 1.2) : 100;

  const options: ApexOptions = {
    chart: {
      type: "bar",
      toolbar: {
        show: false,
      },
      fontFamily: "var(--font-dm-sans)",
    },
    plotOptions: {
      bar: {
        columnWidth: "50%",
        distributed: true,
        borderRadius: 8,
        borderRadiusApplication: "end",
      },
    },
    responsive: [
      {
        breakpoint: 600,
        options: {
          plotOptions: {
            bar: {
              borderRadius: 4,
            },
          },
        },
      },
    ],
    colors: BAR_COLORS,
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          colors: "#919eab",
          fontSize: "12px",
          fontFamily: "var(--font-dm-sans)",
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      min: 0,
      max: yAxisMax,
      tickAmount: 5,
      labels: {
        formatter: (value) => `$${value}`,
        style: {
          colors: "#919eab",
          fontSize: "12px",
          fontFamily: "var(--font-dm-sans)",
        },
      },
    },
    grid: {
      padding: {
        left: 24,
      },
      strokeDashArray: 4,
      borderColor: "rgba(145,158,171,0.20)",
      yaxis: {
        lines: {
          show: true,
        },
      },
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return `$ ${val.toLocaleString()}`;
        },
      },
    },
  };

  if (isLoading) {
    return (
      <DashboardCard
        title="Accommodation Revenue"
        subtitle="Loading chart metrics..."
      >
        <div className="h-[300px] w-full animate-pulse flex items-end justify-between gap-2 pt-12 pb-4 px-4">
          {Array.from({ length: 12 }).map((_, idx) => (
            <div
              key={idx}
              className="w-full bg-gray-200 rounded-t-lg"
              style={{ height: `${Math.floor(Math.random() * 60) + 20}%` }}
            ></div>
          ))}
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard
      title="Accommodation Revenue"
      subtitle="(+43%) than last year"
    >
      <div className="-ml-5 -mb-5">
        <Chart
          options={options}
          series={[{ name: "Revenue", data: seriesData }]}
          type="bar"
          height={300}
          width="100%"
        />
      </div>
    </DashboardCard>
  );
}