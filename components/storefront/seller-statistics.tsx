"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/axios";

interface SellerStatisticsResponse {
  status: boolean;
  data: {
    status_counts: {
      pending: number;
      active: number;
      disabled: number;
      blocked: number;
      total: number;
    };
  };
}

interface StatCardProps {
  title: string;
  value: number | string;
  bgColor: string;
}

function StatCard({ title, value, bgColor }: StatCardProps) {
  return (
    <div
      className={`flex flex-col justify-between p-5 rounded-2xl ${bgColor} transition-shadow duration-200`}
    >
      <span className="text-sm font-medium text-gray-700">{title}</span>
      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl sm:text-3xl font-bold text-gray-900">
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
      </div>
    </div>
  );
}

export default function SellerStatistics() {
  const [stats, setStats] = useState<SellerStatisticsResponse["data"]["status_counts"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get<SellerStatisticsResponse>("/sellers/statistics");

        if (response.data?.status) {
          setStats(response.data.data.status_counts);
        }
      } catch (err: any) {
        console.error("Failed to fetch seller statistics:", err);
        setError(err?.response?.data?.message || "Failed to load statistics.");
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-sm text-red-500 bg-red-50 rounded-xl">{error}</div>;
  }

  const statCards = [
    {
      title: "Total Sellers",
      value: stats?.total ?? 0,
      bgColor: "bg-[#E2F5F4]", // Pastel Teal
    },
    {
      title: "Active Sellers",
      value: stats?.active ?? 0,
      bgColor: "bg-[#FEF8CD]", // Pastel Yellow
    },
    {
      title: "Pending Approval",
      value: stats?.pending ?? 0,
      bgColor: "bg-[#FBE2D3]", // Pastel Peach
    },
    {
      title: "Disabled Sellers",
      value: stats?.disabled ?? 0,
      bgColor: "bg-[#FCE8F3]", // Pastel Pink
    },
    {
      title: "Blocked Sellers",
      value: stats?.blocked ?? 0,
      bgColor: "bg-[#D6E8FE]", // Pastel Blue
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {statCards.map((card, idx) => (
        <StatCard
          key={idx}
          title={card.title}
          value={card.value}
          bgColor={card.bgColor}
        />
      ))}
    </div>
  );
}