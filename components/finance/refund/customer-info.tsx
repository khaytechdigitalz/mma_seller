"use client";

import React from "react";
import Image from "next/image";
import { Mail01Icon, PhoneIcon, MapMarkerIcon } from "@/icons";
import { RefundDetailsData } from "./refund-details-client";

interface Props {
  refund: RefundDetailsData;
}

export default function CustomerInfo({ refund }: Props) {
  const customer = refund.user;
  const shipping = refund.order?.shipping_address;

  const fullAddress = shipping
    ? [shipping.address, shipping.city, shipping.state, shipping.country]
        .filter(Boolean)
        .join(", ")
    : "No shipping address specified.";

  return (
    <div className="bg-[#fef2a0]/40 rounded-2xl w-full border border-gray-500/20">
      <h3 className="text-lg border-b py-4 px-6 border-gray-500/20 font-bold text-light-primary-text">
        Customer Information
      </h3>

      <div className="flex flex-col p-4 sm:p-6 sm:flex-row gap-6 sm:items-center">
        <div className="size-20 rounded-full bg-teal-100 flex items-center justify-center text-teal-800 text-xl font-bold shrink-0 border-2 border-white shadow-sm">
          {customer?.name ? customer.name.charAt(0).toUpperCase() : "U"}
        </div>

        <div className="space-y-3">
          <h4 className="text-lg font-bold text-light-primary-text">
            {customer?.name || "N/A"}
          </h4>
          <div className="flex flex-col lg:flex-row flex-wrap gap-y-2 gap-x-8 text-sm text-light-primary-text">
            <div className="flex items-center gap-2">
              <Mail01Icon className="size-4 shrink-0 text-light-primary-text" />
              <span>{customer?.email || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <PhoneIcon className="size-4 shrink-0 text-light-primary-text" />
              <span>{shipping?.phone || customer?.phone || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapMarkerIcon className="size-4 shrink-0 text-light-primary-text" />
              <span>{fullAddress}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}