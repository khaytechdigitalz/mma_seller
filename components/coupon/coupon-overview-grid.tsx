"use client";

import React from "react";
import {
  Tag,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { Button } from "../ui/button";

export interface CouponMetrics {
  total: number;
  active: number;
  inactive: number;
  expired: number;
}

interface OverviewCardProps {
  icon: React.ElementType;
  title: string;
  value: string | number;
  bgColor: string;
  loading?: boolean;
}

const OverviewCard = ({
  icon: Icon,
  title,
  value,
  bgColor,
  loading = false,
}: OverviewCardProps) => {
  return (
    <div className={`rounded-2xl p-5 flex items-center gap-4 ${bgColor}`}>
      <div className="size-6 rounded-full flex items-center justify-center shrink-0 text-light-primary-text shadow-sm">
        <Icon className="size-8 text-gray-800" />
      </div>
      <div>
        <h4 className="text-light-primary-text text-sm font-semibold mb-1">
          {title}
        </h4>
        <div className="text-2xl font-bold text-light-primary-text">
          {loading ? (
            <span className="text-xs font-normal animate-pulse text-gray-500">
              Loading...
            </span>
          ) : (
            Number(value).toLocaleString()
          )}
        </div>
      </div>
    </div>
  );
};

interface CouponOverviewGridProps {
  metrics?: CouponMetrics | null;
  loading?: boolean;
}

export default function CouponOverviewGrid({
  metrics,
  loading = false,
}: CouponOverviewGridProps) {
  const cards = [
    {
      title: "Total Coupons",
      value: metrics?.total ?? 0,
      icon: Tag,
      bgColor: "bg-accent-1/60",
    },
    {
      title: "Active Coupons",
      value: metrics?.active ?? 0,
      icon: CheckCircle2,
      bgColor: "bg-accent-2/60",
    },
    {
      title: "Inactive Coupons",
      value: metrics?.inactive ?? 0,
      icon: XCircle,
      bgColor: "bg-accent-4/60",
    },
    {
      title: "Expired Coupons",
      value: metrics?.expired ?? 0,
      icon: Clock,
      bgColor: "bg-accent-3/60",
    },
  ];

  return (
    <div className="px-4 sm:px-6 pt-4 sm:pt-6">
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-light-primary-text leading-7">
            Coupon Overview
          </h3>
          <div className="flex items-center gap-3">
            <Button href="/coupon/add" className="bg-teal-700 hover:bg-teal-800 text-white rounded-full px-5">
              Create Coupon
            </Button> 
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {cards.map((item, index) => (
          <OverviewCard key={index} {...item} loading={loading} />
        ))}
      </div>
    </div>
  );
}