"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import WithdrawOverview, {
  WithdrawalWidgets,
} from "@/components/finance/withdraws/withdraw-overview";
import WithdrawalChart, {
  ChartsData,
} from "@/components/finance/withdraws/withdrawal-chart";
import WithdrawsTable, {
  WithdrawalItem,
  PaginationMeta,
} from "@/components/finance/withdraws/withdraws-table";
import { Option } from "@/components/ui/custom-select";
import { apiClient } from "@/lib/axios";

export interface WithdrawalApiResponse {
  status: boolean;
  widgets: WithdrawalWidgets;
  charts: ChartsData;
  data: {
    current_page: number;
    data: WithdrawalItem[];
    from: number;
    to: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export default function Page() {
  const [loading, setLoading] = useState<boolean>(true);
  const [widgets, setWidgets] = useState<WithdrawalWidgets | null>(null);
  const [charts, setCharts] = useState<ChartsData | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const [selectedStatus, setSelectedStatus] = useState<Option | null>({
    label: "Pending",
    value: "pending",
  });
  const [selectedSeller, setSelectedSeller] = useState<Option | null>(null);
  const [searchRef, setSearchRef] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const perPage = 15;

  const fetchWithdrawals = useCallback(async () => {
    try {
      setLoading(true);

      const statusQuery = selectedStatus?.value ? selectedStatus.value : undefined;
      const userQuery = selectedSeller?.value ? selectedSeller.value : undefined;

      const response = await apiClient.get<WithdrawalApiResponse>(
        "/withdrawals",
        {
          params: {
            status: statusQuery,
            user_id: userQuery,
            search: searchRef || undefined,
            page,
            per_page: perPage,
          },
        }
      );

      if (response.data?.status) {
        setWidgets(response.data.widgets);
        setCharts(response.data.charts);
        setWithdrawals(response.data.data.data || []);
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
      console.error("Failed to fetch withdrawals:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, selectedSeller, searchRef, page]);

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  return (
    <div className="py-4 sm:py-6 bg-white rounded-2xl">
      <div className="px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl font-bold text-light-primary-text mb-4 sm:mb-0">
            Withdrawals
          </h1>
          <div className="flex gap-3">
            <Button className="rounded-full bg-teal-700 hover:bg-teal-800 text-white px-6">
              Invoice
            </Button>
            <Button className="rounded-full bg-teal-700 hover:bg-teal-800 text-white px-6">
              Export
            </Button>
          </div>
        </div>

        <WithdrawOverview widgets={widgets} loading={loading} />
        <WithdrawalChart charts={charts} loading={loading} />
      </div>

      <WithdrawsTable
        withdrawals={withdrawals}
        pagination={pagination}
        loading={loading}
        selectedStatus={selectedStatus}
        selectedSeller={selectedSeller}
        onStatusChange={(status) => {
          setSelectedStatus(status);
          setPage(1);
        }}
        onSellerChange={(seller) => {
          setSelectedSeller(seller);
          setPage(1);
        }}
        onPageChange={(newPage) => setPage(newPage)}
        onSearchChange={(val) => {
          setSearchRef(val);
          setPage(1);
        }}
      />
    </div>
  );
}