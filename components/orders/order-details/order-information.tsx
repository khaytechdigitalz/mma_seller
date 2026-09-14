"use client";

import React from "react";
import Image from "next/image";
import { Mail01Icon, PhoneIcon, MapMarkerIcon } from "@/icons";
import { OrderDetailData } from "@/types/order";

interface OrderInformationProps {
  order: OrderDetailData;
}

export default function OrderInformation({ order }: OrderInformationProps) {
  const buyerName =
    order.user?.name ||
    (order.shipping_address
      ? `${order.shipping_address.first_name || ""} ${order.shipping_address.last_name || ""}`.trim()
      : "N/A");

  const avatar = order.user?.avatar;
  const avatarSrc = avatar
    ? avatar.startsWith("http")
      ? avatar
      : `${process.env.NEXT_PUBLIC_STORAGE_URL || ""}/${avatar}`
    : "/images/user/user_10.png";

  const buyerEmail = order.user?.email || "N/A";
  const buyerPhone = order.shipping_address?.phone || order.user?.phone || "N/A";

  const fullAddress = order.shipping_address
    ? `${order.shipping_address.address || ""}, ${order.shipping_address.city || ""}, ${order.shipping_address.state || ""}, ${order.shipping_address.country || ""}`
    : `${order.shipping_state}, ${order.shipping_country}`;
 

   return (
    <>
      {/* Customer Information */}
      <div className="border border-gray-500/20 rounded-2xl w-full">
        <h3 className="text-lg sm:text-xl font-bold text-light-primary-text py-4 px-6 border-b border-gray-500/20">
          Customer Information
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-4 sm:p-6">
          <div className="size-20 sm:size-25 ring-2 ring-white rounded-lg relative overflow-hidden shrink-0 bg-gray-100">
            <Image
              src={avatarSrc}
              fill
              className="object-cover rounded-lg"
              alt={buyerName}
              unoptimized

                          onError={(e) => {
                            e.currentTarget.src = "/images/customer/user_01.png";
                          }}
            />
          </div>

          <div className="flex-1">
            <h4 className="text-xl font-bold text-light-primary-text mb-3">
              {buyerName}
            </h4>

            <div className="flex flex-wrap gap-y-2 gap-x-5">
              <div className="flex items-center gap-2 text-light-primary-text">
                <Mail01Icon className="size-4 shrink-0" />
                <span className="text-sm">{buyerEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-light-primary-text">
                <PhoneIcon className="size-4 shrink-0" />
                <span className="text-sm">{buyerPhone}</span>
              </div>
              <div className="flex items-center gap-2 text-light-primary-text">
                <MapMarkerIcon className="size-4 shrink-0" />
                <span className="text-sm">{fullAddress}</span>
              </div>
            </div>
          </div>
        </div>
      </div> 

      {/* Shipping / Notes Info */}
      <div className="border border-gray-500/20 rounded-2xl w-full">
        <h3 className="text-lg sm:text-xl font-bold text-light-primary-text py-4 px-6 border-b border-gray-500/20">
          Delivery Notes & Information
        </h3>
        <div className="p-4 sm:p-6">
          <p className="text-sm text-light-primary-text">
            {order.notes || "No special instructions provided for this order."}
          </p>
        </div>
      </div>
    </>
  );
}