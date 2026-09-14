"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { apiClient } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { UserIcon, PhoneIcon, Mail01Icon } from "@/icons";
import { SellerDetailsResponse } from "@/types/seller";

function StoreAvatar({ logo, name }: { logo?: string | null; name: string }) {
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

export default function SellerDetailsOverview() {
  const params = useParams();
  const router = useRouter();
  const sellerId = params?.id as string;

  const [data, setData] = useState<SellerDetailsResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<"approve" | "reject" | null>(null);

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

  const handleDecision = async (decision: "approve" | "reject") => {
    setActionLoading(decision);
    try {
      await apiClient.post(`/sellers/${sellerId}/${decision}`);
      toast.success(decision === "approve" ? "Seller approved successfully." : "Seller application rejected.");
      router.push("/sellers/pending");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || `Failed to ${decision} seller.`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <div className="py-10 text-center text-sm text-gray-500">Loading seller details...</div>;
  }

  if (error || !data) {
    return <div className="py-10 text-center text-sm text-red-500">{error || "Seller not found."}</div>;
  }

  const { seller } = data;

  return (
    <div className="rounded-2xl border border-gray-100 p-4 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <StoreAvatar logo={seller.storefront?.logo} name={seller.storefront?.name || seller.name} />
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-gray-900 truncate">
            {seller.storefront?.name || seller.name}
          </h2>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
            <span className="flex items-center gap-1.5">
              <UserIcon className="size-4" /> {seller.name}
            </span>
            <span className="flex items-center gap-1.5">
              <Mail01Icon className="size-4" /> {seller.email}
            </span>
            {seller.phone && (
              <span className="flex items-center gap-1.5">
                <PhoneIcon className="size-4" /> {seller.phone}
              </span>
            )}
          </div>
        </div>
        <span className="capitalize rounded-full bg-warning-lighter/40 text-warning px-3 py-1 text-xs font-semibold w-fit h-fit">
          {seller.status}
        </span>
      </div>

      {seller.storefront?.description && (
        <p className="text-sm text-gray-600">{seller.storefront.description}</p>
      )}

      <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100">
        <Button
          variant="danger-outline"
          size="sm"
          onClick={() => handleDecision("reject")}
          disabled={actionLoading !== null}
        >
          {actionLoading === "reject" ? "Rejecting..." : "Reject Application"}
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => handleDecision("approve")}
          disabled={actionLoading !== null}
        >
          {actionLoading === "approve" ? "Approving..." : "Approve Seller"}
        </Button>
      </div>
    </div>
  );
}
