"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/axios";
import { OrderItem } from "@/types/order";

interface UpdateOrderItemStatusModalProps {
  item: OrderItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export function UpdateOrderItemStatusModal({
  item,
  isOpen,
  onClose,
  onSuccess,
}: UpdateOrderItemStatusModalProps) {
  const [deliveryStatus, setDeliveryStatus] = useState(item?.delivery_status || "pending");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await apiClient.post(`orders/order-items/${item.id}/update-status`, {
        delivery_status: deliveryStatus,
        comment,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update item status.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
        <div>
          <h3 className="text-lg font-bold text-light-primary-text">
            Update Item Delivery Status
          </h3>
          <p className="text-xs text-light-secondary-text truncate mt-1">
            Product: <span className="font-semibold text-light-primary-text">{item.product_name}</span>
          </p>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1 text-light-secondary-text">
              Delivery Status
            </label>
            <select
              value={deliveryStatus}
              onChange={(e) => setDeliveryStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 capitalize"
            >
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
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
              {submitting ? "Updating..." : "Update Item Status"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}