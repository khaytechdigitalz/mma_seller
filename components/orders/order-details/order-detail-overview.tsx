import { Badge } from "@/components/ui/badge";
import { OrderDetailData } from "@/types/order";

interface OrderDetailOverviewProps {
  order: OrderDetailData;
}

export default function OrderDetailOverview({ order }: OrderDetailOverviewProps) {
  // Format dates
  const formattedOrderDate = order.created_at
    ? new Date(order.created_at).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "N/A";

  const formattedUpdateDate = order.updated_at
    ? new Date(order.updated_at).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "N/A";

  const totalItemsCount =
    order.items?.reduce((acc, item) => acc + (item.quantity || 0), 0) || 0;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-light-primary-text">
          #{order.order_no || order.id}
        </h2>
        <div className="flex items-center gap-3">
          <Badge
            variant={order.payment_status === "paid" ? "success-outline" : "warning-outline"}
          >
            {order.payment_status}
          </Badge>
          <Badge
            variant={
              order.order_status === "delivered" || order.order_status === "shipped"
                ? "success"
                : "default"
            }
          >
            {order.order_status}
          </Badge>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[
          {
            label: "Order Date",
            value: formattedOrderDate,
            className: "bg-accent-1/60",
          },
          {
            label: "Total Items",
            value: `${totalItemsCount} pcs`,
            className: "bg-accent-4/60",
          },
          {
            label: "Last Updated",
            value: formattedUpdateDate,
            className: "bg-accent-7/60",
          },
        ].map((card, index) => (
          <div
            key={index}
            className={`rounded-2xl p-4 sm:p-6 ${card.className}`}
          >
            <p className="text-xs font-semibold text-light-secondary-text mb-2">
              {card.label}
            </p>
            <p className="text-lg font-bold text-light-primary-text">
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}