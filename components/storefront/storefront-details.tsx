"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { apiClient } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { UserIcon, PhoneIcon, Mail01Icon } from "@/icons";
import SellerOrderList from "./seller-order-list";
import SellerRefundList from "./seller-refund-list";
import SellerSettlementList from "./seller-settlement-list";
import SellerProductList from "./seller-product-list";
import { SellerDetailsResponse } from "@/types/seller";

interface StoreAvatarProps {
  logo?: string | null;
  name: string;
}

function StoreAvatar({ logo, name }: StoreAvatarProps) {
  const fallbackSrc = `/images/seller/seller-1.png`;

  const initialSrc = logo
    ? logo.startsWith("http")
      ? logo
      : `${process.env.NEXT_PUBLIC_STORAGE_URL || ""}/${logo}`
    : fallbackSrc;

  const [imgSrc, setImgSrc] = useState<string>(initialSrc);

  return (
    <div className="relative size-16 sm:size-20 rounded-2xl bg-white border-4 border-white shadow-md overflow-hidden shrink-0">
      <Image
        src={imgSrc}
        alt={name || "Store Logo"}
        fill
        className="object-cover"
        unoptimized={imgSrc.startsWith("http")}
        onError={() => {
          if (imgSrc !== fallbackSrc) setImgSrc(fallbackSrc);
        }}
      />
    </div>
  );
}

const TAB_OPTIONS = [
  { key: "orders", label: "Orders" },
  { key: "products", label: "Products" },
  { key: "refunds", label: "Refunds" },
  { key: "settlement", label: "Settlements" },
] as const;

type TabKey = (typeof TAB_OPTIONS)[number]["key"];

export default function SellerDetails() {
  const searchParams = useSearchParams();
  const sellerId = searchParams.get("id");

  const [activeTab, setActiveTab] = useState<TabKey>("orders");
  const [data, setData] = useState<SellerDetailsResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sellerId) return;

    const fetchSellerData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get<SellerDetailsResponse>(`/sellers/${sellerId}`);

        if (response.data?.status) {
          setData(response.data.data);
        }
      } catch (err: any) {
        console.error("Failed to load seller details:", err);
        setError(err?.response?.data?.message || "Failed to load seller details.");
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [sellerId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-white p-6 border border-gray-100 shadow-sm">
        <p className="animate-pulse text-sm font-medium text-gray-500">Loading seller profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 p-6 text-center text-sm font-medium text-red-600 border border-red-100">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl bg-gray-50 p-6 text-center text-sm font-medium text-gray-500 border border-gray-100">
        Seller not found.
      </div>
    );
  }

  const { seller, metrics } = data;
  const storeName = seller.storefront?.name || seller.name || "N/A";

  const metricCards = [
    {
      title: "Total Orders",
      value: metrics.orders.total_orders_count.toLocaleString(),
      bgColor: "bg-[#E2F5F4]", // Pastel Teal
      textColor: "text-gray-900",
    },
    {
      title: "Total Order Value",
      value: `$${metrics.orders.total_orders_value.toLocaleString()}`,
      bgColor: "bg-[#FEF8CD]", // Pastel Yellow
      textColor: "text-gray-900",
    },
    {
      title: "Wallet Balance",
      value: `$${Number(seller.wallet?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      bgColor: "bg-[#D6E8FE]", // Pastel Blue
      textColor: "text-blue-950",
    },
    {
      title: "Total Refunds",
      value: `$${metrics.refunds.total_refunds_value.toLocaleString()}`,
      bgColor: "bg-[#FCE8F3]", // Pastel Pink
      textColor: "text-gray-900",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Bar Header */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm">
        <PageHeader title="Seller Profile" backHref="/sellers" className="gap-4" />
        <Button href={`/sellers/edit-seller?id=${seller.id}`} variant="outline" size="sm">
          Edit Profile
        </Button>
      </div>

      {/* Hero Card with Opaque Background Banner */}
      <div className="relative rounded-2xl border border-gray-100 overflow-hidden shadow-sm bg-white">
        {/* Background Banner Container */}
        <div className="absolute inset-0 z-0">
          {seller.storefront?.banner ? (
            <Image
              src={seller.storefront.banner}
              alt={`${storeName} Banner`}
              fill
              unoptimized={seller.storefront.banner.startsWith("http")}
              className="object-cover opacity-20"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-gray-50 to-gray-100 opacity-60" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/85 to-transparent" />
        </div>

        {/* Content Layer */}
        <div className="relative z-10 p-4 sm:p-6 space-y-6">
          {/* Seller Main Identity */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <StoreAvatar logo={seller.storefront?.logo} name={storeName} />
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                  {storeName}
                </h2>
                <p className="text-xs font-semibold text-gray-500 mt-1">
                  Seller ID: #{seller.id}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Details Pill Strip */}
          <div className="flex flex-wrap gap-y-2 gap-x-6 py-3 px-4 rounded-xl bg-white/90 backdrop-blur-sm text-xs sm:text-sm text-gray-600 border border-gray-200/60 shadow-xs">
            <div className="flex items-center gap-2">
              <UserIcon className="size-4 text-gray-400 shrink-0" />
              <span className="font-medium text-gray-800">{seller.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <PhoneIcon className="size-4 text-gray-400 shrink-0" />
              <span>{seller.phone || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail01Icon className="size-4 text-gray-400 shrink-0" />
              <span>{seller.email}</span>
            </div>
          </div>

          {/* Multi-colored Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {metricCards.map((card, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl ${card.bgColor} shadow-xs transition-shadow duration-200`}
              >
                <p className="text-xs font-medium text-gray-700 mb-2">
                  {card.title}
                </p>
                <p className={`text-2xl font-bold ${card.textColor}`}>
                  {card.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Panel Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 gap-6 mb-6 overflow-x-auto">
          {TAB_OPTIONS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative pb-3 text-sm font-semibold transition-colors duration-200 shrink-0 ${
                  isActive ? "text-primary" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panes */}
        {sellerId && (
          <div>
            {activeTab === "orders" && <SellerOrderList sellerId={sellerId} />}
            {activeTab === "products" && <SellerProductList sellerId={sellerId} />}
            {activeTab === "refunds" && <SellerRefundList sellerId={sellerId} />}
            {activeTab === "settlement" && <SellerSettlementList sellerId={sellerId} />}
          </div>
        )}
      </div>
    </div>
  );
}