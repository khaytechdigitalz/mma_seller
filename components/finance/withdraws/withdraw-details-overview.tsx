import React from "react";
import { Badge } from "@/components/ui/badge";
import { WithdrawalDetail } from "@/types/withdrawal";

interface OverviewProps {
  data: WithdrawalDetail;
}

export default function WithdrawDetailsOverview({ data }: OverviewProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Pending Process";
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "successful":
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
      case "rejected":
      case "declined":
        return "error";
      default:
        return "info";
    }
  };

  const overviewCards = [
    {
      label: "Gross Amount",
      value: `₦${Number(data.amount).toLocaleString()}`,
      bgClass: "bg-[rgba(160,226,224,0.3)]",
    },
    {
      label: "Processing Fee",
      value: `₦${Number(data.fee).toLocaleString()}`,
      bgClass: "bg-[rgba(255,235,105,0.3)]",
    },
    {
      label: "Net Payout",
      value: `₦${Number(data.net_amount).toLocaleString()}`,
      bgClass: "bg-[rgba(197,242,168,0.4)]",
    },
    {
      label: "Requested Date",
      value: formatDate(data.created_at),
      bgClass: "bg-[rgba(255,192,145,0.3)]",
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-400 font-mono">Reference</span>
          <h2 className="text-xl font-bold text-light-primary-text">{data.reference}</h2>
        </div>
        <Badge variant={getBadgeVariant(data.status)} className="px-3 py-1 text-xs capitalize">
          {data.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {overviewCards.map((item, index) => (
          <div
            key={index}
            className={`${item.bgClass} rounded-2xl p-4 sm:p-6 flex flex-col gap-1 border border-black/5`}
          >
            <p className="text-xs font-semibold text-light-secondary-text">
              {item.label}
            </p>
            <p className="text-lg font-bold text-light-primary-text">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {data.admin_notes && (
        <div className="border border-gray-500/20 rounded-2xl p-4 sm:p-6 bg-gray-50/50">
          <h3 className="text-xs font-semibold text-light-primary-text mb-1 uppercase tracking-wider">
            Admin Note
          </h3>
          <p className="text-sm max-w-2xl text-light-secondary-text leading-5.5">
            {data.admin_notes}
          </p>
        </div>
      )}
    </div>
  );
}