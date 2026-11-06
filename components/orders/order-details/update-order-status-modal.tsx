"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/axios";

interface UpdateOrderStatusModalProps {
  orderId: number;
  currentStatus: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ORDER_STATUSES = [
  {
    label: "Confirmed",
    value: "confirmed"
  },
  {
    label: "Available For Shipment (Packed)",
    value: "shipment_created"
  },
];

export function UpdateOrderStatusModal({
  orderId,
  currentStatus,
  isOpen,
  onClose,
  onSuccess,
}: UpdateOrderStatusModalProps) {
  const [orderStatus, setOrderStatus] = useState(currentStatus || "pending");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await apiClient.post(`orders/${orderId}/update-status`, {
        order_status: orderStatus,
        comment,
      });

      if (res?.data?.status) {
        toast.success(res.data.message || "Order status updated and shipment booked successfully!");
      } else {
        toast.success("Order status updated successfully.");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to update order status.";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-light-primary-text">Update Order Status</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1 text-light-secondary-text">
              Order Status
            </label>
            <select
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 capitalize"
            >
              {ORDER_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-light-secondary-text">
              Comment
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter comment..."
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? "Updating..." : "Update Status"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}