"use client";

import React, { useState, useEffect, useCallback } from "react";
import SalesReportOverview from "@/components/reports/sales-report-overview";
import RevenueReportChart from "@/components/reports/revenue-report-chart";
import SalesReportTable from "@/components/reports/sales-report-table";
import SalesReportFilters from "@/components/reports/sales-report-filters";
import { FilterParams, SalesReportResponse } from "@/types/sales-report";
import {apiClient} from "@/lib/axios";

export default function SalesReportsPage() {
  const [filters, setFilters] = useState<FilterParams>({
    year: null,
    month: null,
    date_from: null,
    date_to: null,
  });

  const [reportData, setReportData] = useState<SalesReportResponse["data"] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSalesReport = useCallback(async (activeFilters: FilterParams) => {
    setLoading(true);
    try {
      const response = await apiClient.get<SalesReportResponse>("/sales-report", {
        params: {
          year: activeFilters.year || undefined,
          month: activeFilters.month || undefined,
          date_from: activeFilters.date_from || undefined,
          date_to: activeFilters.date_to || undefined,
        },
      });

      if (response.data?.status) {
        setReportData(response.data.data);
      }
    } catch (error) {
      console.error("Failed to load sales report:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSalesReport(filters);
  }, [filters, fetchSalesReport]);

  const handleResetFilters = () => {
    setFilters({
      year: null,
      month: null,
      date_from: null,
      date_to: null,
    });
  };

  return (
    <div className="bg-white py-4 sm:py-6 rounded-2xl">
      <div className="px-4 sm:px-6">
        <SalesReportFilters
          filters={filters}
          onFilterChange={setFilters}
          onReset={handleResetFilters}
        />
        <SalesReportOverview summary={reportData?.summary} isLoading={loading} />
        <RevenueReportChart monthlyData={reportData?.monthly_chart} isLoading={loading} />
      </div>
      <div>
        <SalesReportTable
          products={reportData?.top_5_selling_products}
          isLoading={loading}
        />
      </div>
    </div>
  );
}