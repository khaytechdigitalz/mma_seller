"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/axios";
import { PaginatedResponse } from "@/types/seller";

interface RefundItem {
  id: number;
  refund_no: string;
  order_no: string;
  refund_amount: string | number;
  status: string;
  reason: string;
}

export default function SellerRefundList({ sellerId }: { sellerId: string }) {
  const [refunds, setRefunds] = useState<RefundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sellerId) return;

    const fetchRefunds = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get<PaginatedResponse<RefundItem>>(
          `/sellers/${sellerId}/refunds`,
          {
            params: { page: 1 },
          }
        );

        if (response.data?.status) {
          setRefunds(response.data.data.data);
        }
      } catch (err: any) {
        console.error("Failed to fetch seller refunds:", err);
        setError(err?.response?.data?.message || "Failed to load refunds.");
      } finally {
        setLoading(false);
      }
    };

    fetchRefunds();
  }, [sellerId]);

  if (loading) {
    return <div className="py-6 text-center text-sm text-gray-500">Loading refunds...</div>;
  }

  if (error) {
    return <div className="py-6 text-center text-sm text-red-500">{error}</div>;
  }

  if (refunds.length === 0) {
    return <div className="py-6 text-center text-sm text-gray-500">No refunds found.</div>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase text-gray-700">
          <tr>
            <th className="p-3">Refund No</th>
            <th className="p-3">Order No</th>
            <th className="p-3">Amount</th>
            <th className="p-3">Status</th>
            <th className="p-3">Reason</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {refunds.map((refund) => (
            <tr key={refund.id} className="hover:bg-gray-50">
              <td className="p-3 font-medium text-gray-900">#{refund.refund_no}</td>
              <td className="p-3">#{refund.order_no}</td>
              <td className="p-3 font-semibold">${Number(refund.refund_amount).toFixed(2)}</td>
              <td className="p-3 capitalize">{refund.status}</td>
              <td className="p-3 truncate max-w-xs">{refund.reason || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}