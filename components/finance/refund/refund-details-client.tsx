"use client";

import React, { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/axios";
import RefundDetailsOverview from "./refund-details-overview";
import CustomerInfo from "./customer-info";
import RefundProductTable from "./refund-product-table";

export interface RefundDetailsData {
  id: number;
  refund_no: string;
  order_id: number;
  order_no: string;
  transaction_ref: string;
  user_id: number;
  seller_id: number;
  refund_amount: string;
  reason: string;
  evidence_urls: string[] | null;
  status: string;
  admin_notes: string | null;
  processed_by_user_id: number | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
  };
  seller?: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
  };
  order?: {
    id: number;
    order_no: string;
    user_id: number;
    seller_id: number;
    order_status: string;
    payment_status: string;
    payment_method: string;
    transaction_ref: string;
    subtotal: string;
    tax_amount: string;
    shipping_cost: string;
    discount_amount: string;
    total_amount: string;
    shipping_country: string;
    shipping_state: string;
    shipping_address?: {
      city?: string;
      phone?: string;
      state?: string;
      address?: string;
      country?: string;
      last_name?: string;
      first_name?: string;
    };
    billing_address?: {
      city?: string;
      phone?: string;
      state?: string;
      address?: string;
      country?: string;
      last_name?: string;
      first_name?: string;
    };
    notes?: string;
    created_at: string;
    updated_at: string;
    items?: Array<{
      id: number;
      order_id: number;
      product_id: number;
      seller_id: number;
      product_name: string;
      sku: string;
      unit_price: string;
      quantity: number;
      tax: string;
      discount: string;
      total_price: string;
      delivery_status: string;
      product?: {
        id: number;
        name: string;
        sku: string;
      };
    }>;
  };
  processed_by?: {
    id: number;
    name: string;
    email: string;
  };
}

export default function RefundDetailsClient({ refundId }: { refundId: string }) {
  const [data, setData] = useState<RefundDetailsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRefundDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/refunds/${refundId}`);
      if (response.data?.status && response.data?.data) {
        setData(response.data.data);
      } else {
        setError("Failed to load refund details.");
      }
    } catch (err) {
      console.error("Error fetching refund details:", err);
      setError("An error occurred while fetching refund details.");
    } finally {
      setLoading(false);
    }
  }, [refundId]);

  useEffect(() => {
    fetchRefundDetails();
  }, [fetchRefundDetails]);

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500">
        Loading refund details...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-20 text-center text-red-500 font-medium">
        {error || "Refund record not found."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RefundDetailsOverview refund={data} onRefresh={fetchRefundDetails} />
      <CustomerInfo refund={data} />
      <RefundProductTable items={data.order?.items || []} />
    </div>
  );
}