"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/axios";
import { Loader2 } from "lucide-react";
import {
  PackageIcon,
  PackageProcessIcon,
  DeliverySentIcon,
  CartRemoveIcon,
  PackageMovingIcon,
  PackageDelivered,
  TrolleyIcon,
  PackageOutOfStock,
} from "@/icons";

interface WidgetData {
  total_orders: number;
  pending_payment: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  returned: number;
  failed: number;
}

interface OrderStatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  bgColor: string;
  isLoading: boolean;
}

const OrderStatCard: React.FC<OrderStatCardProps> = ({
  icon,
  label,
  value,
  bgColor,
  isLoading,
}) => {
  return (
    <div className={`${bgColor} rounded-xl p-5 flex items-center gap-4`}>
      <div className="bg-white size-12 shrink-0 lg:size-15 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-sm mb-1 text-light-secondary-text font-semibold">
          {label}
        </p>
        {isLoading ? (
          <div className="h-8 flex items-center">
            <Loader2 className="size-4 animate-spin text-gray-400" />
          </div>
        ) : (
          <p className="text-2xl font-bold text-light-primary-text">
            {value.toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default function OrderOverview() {
  const [data, setData] = useState<WidgetData>({
    total_orders: 0,
    pending_payment: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    returned: 0,
    failed: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchWidgets = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get("orders/dashboard-widgets");
      if (res?.data?.status && res?.data?.data) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching order dashboard widgets:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWidgets();
  }, [fetchWidgets]);

  const orderStats = [
    {
      icon: <PackageIcon className="size-8 text-light-primary-text" />,
      label: "Total Orders",
      value: data.total_orders,
      bgColor: "bg-accent-5/60",
    },
    {
      icon: <PackageProcessIcon className="size-8 text-light-primary-text" />,
      label: "Pending Payment",
      value: data.pending_payment,
      bgColor: "bg-accent-2/60",
    },
    {
      icon: <PackageMovingIcon className="size-8 text-light-primary-text" />,
      label: "Processing",
      value: data.processing,
      bgColor: "bg-accent-1/60",
    },
    {
      icon: <DeliverySentIcon className="size-8 text-light-primary-text" />,
      label: "Shipped",
      value: data.shipped,
      bgColor: "bg-accent-3/60",
    },
    {
      icon: <PackageDelivered className="size-8 text-light-primary-text" />,
      label: "Delivered",
      value: data.delivered,
      bgColor: "bg-accent-4/60",
    },
    {
      icon: <PackageOutOfStock className="size-8 text-light-primary-text" />,
      label: "Cancelled",
      value: data.cancelled,
      bgColor: "bg-accent-6/60",
    },
    {
      icon: <TrolleyIcon className="size-8 text-light-primary-text" />,
      label: "Returned",
      value: data.returned,
      bgColor: "bg-accent-7/60",
    },
    {
      icon: <CartRemoveIcon className="size-8 text-light-primary-text" />,
      label: "Failed",
      value: data.failed,
      bgColor: "bg-info-lighter",
    },
  ];

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-xl font-bold text-light-primary-text">
          Total Orders
        </h3>
        <Button variant="primary" size="xs">
          Export
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {orderStats.map((stat, index) => (
          <OrderStatCard
            key={index}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            bgColor={stat.bgColor}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  );
}