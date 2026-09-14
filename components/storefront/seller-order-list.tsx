"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/axios";
import { PaginatedResponse } from "@/types/seller";

interface OrderItem {
  id: number;
  order_no: string;
  user: {
    name: string;
    email: string;
  } | null;
  customer_name: string;
  total_amount: string | number;
  payment_status: string;
  order_status: string;
  created_at: string;
}

export default function SellerOrderList({ sellerId }: { sellerId: string }) {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!sellerId) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get<PaginatedResponse<OrderItem>>(
          `/sellers/${sellerId}/orders`,
          {
            params: { page: currentPage },
          }
        );

        if (response.data?.status) {
          setOrders(response.data.data.data);
          setTotalPages(response.data.data.last_page);
        }
      } catch (err: any) {
        console.error("Failed to fetch seller orders:", err);
        setError(err?.response?.data?.message || "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [sellerId, currentPage]);

  if (loading) {
    return <div className="py-6 text-center text-sm text-gray-500">Loading orders...</div>;
  }

  if (error) {
    return <div className="py-6 text-center text-sm text-red-500">{error}</div>;
  }

  if (orders.length === 0) {
    return <div className="py-6 text-center text-sm text-gray-500">No orders found for this seller.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700">
            <tr>
              <th className="p-3">Order No</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-900">#{order.order_no}</td>
                <td className="p-3">{order.user?.name || "Guest"}<br></br>{order.user?.email || "N/A"}</td>
                <td className="p-3 font-semibold">${Number(order.total_amount).toFixed(2)}</td>
                <td className="p-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                      order.payment_status === "paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.payment_status}
                  </span>
                </td>
                <td className="p-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                      order.order_status === "completed"
                        ? "bg-blue-100 text-blue-800"
                        : order.order_status === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {order.order_status}
                  </span>
                </td>
                <td className="p-3 text-gray-500">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="rounded border px-3 py-1 text-xs disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className="rounded border px-3 py-1 text-xs disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}