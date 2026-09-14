"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/axios";
import { PaginatedResponse } from "@/types/seller";

export interface SettlementItem {
  id: number;
  order_id: number;
  seller_id: number;
  gross_amount: string | number;
  platform_fee: string | number;
  net_settlement: string | number;
  status: "pending" | "processing" | "completed" | "settled" | "failed";
  settled_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SettlementSummary {
  total_gross_amount: number;
  total_platform_fee: number;
  total_net_settlement: number;
}

export interface SettlementApiResponse {
  status: boolean;
  summary: SettlementSummary;
  data: PaginatedResponse<SettlementItem>["data"];
}

export default function SellerSettlementList({ sellerId }: { sellerId: string }) {
  const [settlements, setSettlements] = useState<SettlementItem[]>([]);
  const [summary, setSummary] = useState<SettlementSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!sellerId) return;

    const fetchSettlements = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get<SettlementApiResponse>(
          `/sellers/${sellerId}/settlements`,
          {
            params: { page: currentPage },
          }
        );

        if (response.data?.status) {
          setSettlements(response.data.data.data);
          setSummary(response.data.summary);
          setTotalPages(response.data.data.last_page);
        }
      } catch (err: any) {
        console.error("Failed to fetch seller settlements:", err);
        setError(err?.response?.data?.message || "Failed to load settlement history.");
      } finally {
        setLoading(false);
      }
    };

    fetchSettlements();
  }, [sellerId, currentPage]);

  const getStatusBadge = (status: SettlementItem["status"]) => {
    switch (status) {
      case "completed":
      case "settled":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (val?: number | string) =>
    `$${Number(val ?? 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  if (loading) {
    return <div className="py-6 text-center text-sm text-gray-500">Loading settlements...</div>;
  }

  if (error) {
    return <div className="py-6 text-center text-sm text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Metrics Header */}
      {summary && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
            <p className="text-xs font-semibold text-gray-500">Total Gross Amount</p>
            <h4 className="mt-1 text-xl font-bold text-gray-900">
              {formatCurrency(summary.total_gross_amount)}
            </h4>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
            <p className="text-xs font-semibold text-gray-500">Total Platform Fee</p>
            <h4 className="mt-1 text-xl font-bold text-red-600">
              {formatCurrency(summary.total_platform_fee)}
            </h4>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
            <p className="text-xs font-semibold text-gray-500">Total Net Settlement</p>
            <h4 className="mt-1 text-xl font-bold text-green-600">
              {formatCurrency(summary.total_net_settlement)}
            </h4>
          </div>
        </div>
      )}

      {/* Settlements Table */}
      {settlements.length === 0 ? (
        <div className="py-6 text-center text-sm text-gray-500">
          No settlement history found for this seller.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b border-gray-200">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Order ID</th>
                <th className="p-3">Gross Amount</th>
                <th className="p-3">Platform Fee</th>
                <th className="p-3">Net Settlement</th>
                <th className="p-3">Status</th>
                <th className="p-3">Settled At</th>
                <th className="p-3">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {settlements.map((settlement) => (
                <tr key={settlement.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-900">#{settlement.id}</td>
                  <td className="p-3 font-medium text-gray-900">#{settlement.order_id}</td>
                  <td className="p-3 font-semibold text-gray-900">
                    {formatCurrency(settlement.gross_amount)}
                  </td>
                  <td className="p-3 text-red-600">
                    {formatCurrency(settlement.platform_fee)}
                  </td>
                  <td className="p-3 font-semibold text-green-600">
                    {formatCurrency(settlement.net_settlement)}
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${getStatusBadge(
                        settlement.status
                      )}`}
                    >
                      {settlement.status}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500 whitespace-nowrap">
                    {settlement.settled_at
                      ? new Date(settlement.settled_at).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="p-3 text-gray-500 whitespace-nowrap">
                    {new Date(settlement.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm pt-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="rounded border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className="rounded border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}