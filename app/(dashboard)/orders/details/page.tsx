"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/axios";
import { OrderDetailData, OrderItem } from "@/types/order";

import OrderDetailOverview from "@/components/orders/order-details/order-detail-overview";
import OrderSmallProductTable from "@/components/orders/order-details/order-small-product-table";
import OrderDetailsSummary from "@/components/orders/order-details/order-details-summary";
import OrderInformation from "@/components/orders/order-details/order-information";
import OrderTracking from "@/components/orders/order-details/order-tracking";

import { UpdateOrderStatusModal } from "@/components/orders/order-details/update-order-status-modal";
import { UpdateOrderItemStatusModal } from "@/components/orders/order-details/update-order-item-status-modal";


export default function OrderDetails() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");

  const [order, setOrder] = useState<OrderDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal display states
  const [isOrderStatusModalOpen, setIsOrderStatusModalOpen] = useState(false);
  const [isPaymentStatusModalOpen, setIsPaymentStatusModalOpen] = useState(false);
  const [selectedItemForStatusUpdate, setSelectedItemForStatusUpdate] =
    useState<OrderItem | null>(null);

  const fetchOrderDetails = useCallback(async () => {
    if (!orderId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get(`orders/${orderId}`);
      if (res?.data?.status && res?.data?.data) {
        setOrder(res.data.data);
      } else {
        setError("Failed to fetch order details.");
      }
    } catch (err: any) {
      console.error("Error fetching order details:", err);
      setError(err?.response?.data?.message || "Error loading order details.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setError("No order ID provided in URL parameters.");
      return;
    }
    fetchOrderDetails();
  }, [orderId, fetchOrderDetails]);

  if (loading && !order) {
    return (
      <div className="bg-white p-8 rounded-2xl w-full flex justify-center items-center min-h-[400px]">
        <p className="text-sm text-gray-500">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-white p-8 rounded-2xl w-full text-center min-h-[400px] flex flex-col justify-center items-center">
        <p className="text-red-500 text-sm mb-4">{error || "Order not found."}</p>
        <PageHeader title="Go Back" backHref="/orders" />
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl w-full">
      <div className="pb-4 flex flex-wrap justify-between items-center gap-3">
        <PageHeader title={`Details - ${order.order_no}`} backHref="/orders" />
        <div className="flex flex-wrap gap-2.5">
          <Button
            size="xs"
            variant="outline"
            onClick={() => setIsOrderStatusModalOpen(true)}
          >
            Update Order Status
          </Button> 
          <Button size="xs" variant="outline">
            Export
          </Button>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <div className="border border-gray-500/20 rounded-2xl pb-4 sm:pb-6">
          <div className="py-4 px-4 sm:px-6 border-b border-gray-500/20">
            <h3 className="text-lg font-bold text-light-primary-text">
              Order Information
            </h3>
          </div>
          <div className="p-4 sm:p-6">
            <OrderDetailOverview order={order} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 px-4 sm:px-6">
            <div className="lg:col-span-2">
              <OrderSmallProductTable
                items={order.items || []}
                onUpdateItemStatus={(item) => setSelectedItemForStatusUpdate(item)}
              />
            </div>
            <div className="lg:col-span-1">
              <OrderDetailsSummary order={order} />
            </div>
          </div>
        </div>

        <OrderInformation order={order} />
        <OrderTracking statusHistories={order.status_histories || []} />
      </div>

      {/* Endpoint 1: POST /orders/[id]/update-status */}
      <UpdateOrderStatusModal
        orderId={order.id}
        currentStatus={order.order_status}
        isOpen={isOrderStatusModalOpen}
        onClose={() => setIsOrderStatusModalOpen(false)}
        onSuccess={fetchOrderDetails}
      />
 

      {/* Endpoint 3: POST /orders/order-items/[id]/update-status */}
      <UpdateOrderItemStatusModal
        item={selectedItemForStatusUpdate}
        isOpen={!!selectedItemForStatusUpdate}
        onClose={() => setSelectedItemForStatusUpdate(null)}
        onSuccess={fetchOrderDetails}
      />
    </div>
  );
}