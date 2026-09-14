"use client";

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/axios";
import { DashboardData, DashboardResponse } from "types/dashboard";

import DashboardStatsGrid from "@/components/dashboard/dashboard-stats-grid";
import OrderStatusChart from "@/components/dashboard/order-status-chart";
import AccommodationRevenueChart from "@/components/dashboard/accommodation-revenue-chart";
import OrderFulfillmentStatus from "@/components/dashboard/order-fullfillment-status-progress";
import RecentOrdersTable from "@/components/dashboard/recent-order-table";
import TopCountryCard from "@/components/dashboard/top-country-card";
import TopStateCard from "@/components/dashboard/top-state-card";

export default function Home() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: response } = await apiClient.get<DashboardResponse>("/dashboard");
      if (response.status && response.data) {
        setDashboardData(response.data);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load dashboard data."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (error) {
    return (
      <div className="bg-white p-8 rounded-2xl text-center border border-red-100">
        <p className="text-red-500 font-medium">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 bg-primary text-white text-xs rounded-lg hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
      {/* 8 Metric KPI Cards Grid */}
      <DashboardStatsGrid
        metrics={dashboardData?.metrics}
        isLoading={isLoading}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="sm:col-span-2 order-1">
            <OrderStatusChart
              chartData={dashboardData?.order_status_chart}
              isLoading={isLoading}
            />
          </div>
          <div className="lg:col-span-1 order-4 lg:order-2">
            <TopCountryCard
              countries={dashboardData?.top_countries}
              isLoading={isLoading}
            />
            <br></br>
            <TopStateCard
              states={dashboardData?.top_states}
              isLoading={isLoading}
            />
          </div>

          <div className="sm:col-span-2 order-2 lg:order-3">
            <AccommodationRevenueChart
              revenueData={dashboardData?.monthly_revenue_chart}
              isLoading={isLoading}
            />
          </div>
          <div className="lg:col-span-1 order-3">
            <OrderFulfillmentStatus
              fulfillmentData={dashboardData?.fulfillment_status}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="mt-4 sm:mt-6">
        <RecentOrdersTable
          orders={dashboardData?.recent_orders || []}
          isLoading={isLoading}
        />
      </div>

      
    </div>
  );
}