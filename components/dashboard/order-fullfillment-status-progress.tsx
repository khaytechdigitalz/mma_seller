"use client";

import { ProgressBar } from "../ui/progress-bar";
import { DashboardCard } from "@/components/ui/dashboard-card";

interface OrderFulfillmentStatusProps {
  fulfillmentData?: Record<string, number>;
  isLoading?: boolean;
}

// Map status keys to human-readable labels and theme colors
const CONFIG_MAP: Record<
  string,
  { label: string; color: string; trackColor: string }
> = {
  shipped: {
    label: "Shipped orders",
    color: "bg-info",
    trackColor: "bg-info-lighter",
  },
  delivered: {
    label: "Delivered",
    color: "bg-primary",
    trackColor: "bg-primary-lighter",
  },
  pending: {
    label: "Pending shipments",
    color: "bg-warning",
    trackColor: "bg-warning-lighter",
  },
  stuck: {
    label: "Stuck orders",
    color: "bg-gray-900",
    trackColor: "bg-gray-200",
  },
  processing: {
    label: "Processing",
    color: "bg-blue-500",
    trackColor: "bg-blue-100",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-error",
    trackColor: "bg-error-lighter",
  },
};

export default function OrderFulfillmentStatus({
  fulfillmentData = {},
  isLoading = false,
}: OrderFulfillmentStatusProps) {
  const entries = Object.entries(fulfillmentData);

  // Calculate total count across all statuses to compute dynamic percentages
  const totalCount = entries.reduce((sum, [_, count]) => sum + count, 0);

  const formattedData = entries.map(([key, count]) => {
    const config = CONFIG_MAP[key] || {
      label: key.charAt(0).toUpperCase() + key.slice(1),
      color: "bg-gray-500",
      trackColor: "bg-gray-100",
    };

    const percentage =
      totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;

    return {
      key,
      label: config.label,
      count,
      percentage,
      color: config.color,
      trackColor: config.trackColor,
    };
  });

  if (isLoading) {
    return (
      <DashboardCard title="Order Fulfillment Status">
        <div className="space-y-6 pt-3 animate-pulse">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-4 w-28 bg-gray-200 rounded"></div>
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="Order Fulfillment Status">
      <div className="space-y-6 pt-3">
        {formattedData.length > 0 ? (
          formattedData.map((item) => (
            <div key={item.key} className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-light-primary-text leading-5.5">
                  {item.label}
                </span>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-light-primary-text leading-5.5">
                    {item.count}
                  </span>
                  <span className="text-light-secondary-text">
                    ({item.percentage.toString().padStart(2, "0")}%)
                  </span>
                </div>
              </div>
              <ProgressBar
                value={item.percentage}
                color={item.color}
                trackColor={item.trackColor}
                className="h-2"
              />
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 py-4 text-center">
            No fulfillment status data available.
          </p>
        )}
      </div>
    </DashboardCard>
  );
}