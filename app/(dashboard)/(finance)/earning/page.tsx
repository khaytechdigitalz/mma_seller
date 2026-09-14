"use client";

import React, { useEffect, useState, useCallback } from "react";
import EarningOverview, {
  PlatformWidgets,
} from "@/components/finance/earning/earning-overview";
import RevenueChart, {
  ChartsData,
} from "@/components/finance/earning/revenue-chart";
import TransactionAndInvoiceTable, {
  PaginationMeta,
} from "@/components/finance/earning/transaction-and-invoice-table";
import { apiClient } from "@/lib/axios";

type PlatformTransaction = React.ComponentProps<
  typeof TransactionAndInvoiceTable
>["transactions"][number];

export interface PlatformEarningsResponse {
  status: boolean;
  widgets: PlatformWidgets;
  charts: ChartsData;
  data: {
    current_page: number;
    data: PlatformTransaction[];
    from: number;
    to: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export default function Page() {
  const [loading, setLoading] = useState<boolean>(true);
  const [widgets, setWidgets] = useState<PlatformWidgets | null>(null);
  const [charts, setCharts] = useState<ChartsData | null>(null);
  const [transactions, setTransactions] = useState<PlatformTransaction[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  // Filters State (restricted to date filters supported by settlement query)
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const perPage = 15;

  const fetchPlatformEarnings = useCallback(async () => {
    try {
      setLoading(true);

      const response = await apiClient.get<PlatformEarningsResponse>(
        "/platform-earnings",
        {
          params: {
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
            page,
            per_page: perPage,
          },
        }
      );

      if (response.data?.status) {
        setWidgets(response.data.widgets);
        setCharts(response.data.charts);
        setTransactions(response.data.data.data || []);
        setPagination({
          current_page: response.data.data.current_page,
          last_page: response.data.data.last_page,
          per_page: response.data.data.per_page,
          total: response.data.data.total,
          from: response.data.data.from,
          to: response.data.data.to,
        });
      }
    } catch (error) {
      console.error("Failed to fetch seller earnings:", error);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, page]);

  useEffect(() => {
    fetchPlatformEarnings();
  }, [fetchPlatformEarnings]);

  return (
    <div className="py-4 sm:py-6 bg-white rounded-2xl">
      <EarningOverview widgets={widgets} loading={loading} />
      <RevenueChart charts={charts} loading={loading} />
      <TransactionAndInvoiceTable
        transactions={transactions}
        pagination={pagination}
        loading={loading}
        onPageChange={(newPage) => setPage(newPage)}
        onSearchChange={(_ref) => {
          // Search reference filter can be omitted or handled locally if needed
          setPage(1);
        }}
        onDateFromChange={(date) => {
          setDateFrom(date);
          setPage(1);
        }}
        onDateToChange={(date) => {
          setDateTo(date);
          setPage(1);
        }}
      />
    </div>
  );
}