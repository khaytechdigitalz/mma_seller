"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import WithdrawDetailsOverview from "@/components/finance/withdraws/withdraw-details-overview";
import BankDetailsCard from "@/components/finance/withdraws/bank-details-card";
import { PageHeader } from "@/components/ui/page-header";
import { WithdrawalDetail, WithdrawalDetailApiResponse } from "@/types/withdrawal";
import { apiClient } from "@/lib/axios";

export default function WithdrawDetailsPage() {
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<WithdrawalDetail | null>(null);
 

  const fetchDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await apiClient.get<WithdrawalDetailApiResponse>(`/withdrawals/${id}`);
      if (res.data?.status) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch withdrawal details:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

 

  const isPending = data?.status?.toLowerCase() === "pending";

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl py-24 text-center text-gray-500">
        Loading withdrawal details...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white p-6 rounded-2xl py-24 text-center text-gray-500">
        Withdrawal record not found.
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl">
      <div className="pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader title={`Details - ${data.reference}`} backHref="/withdraws" /> 
      </div>

      <div className="border border-gray-500/20 rounded-2xl mb-6">
        <div className="border-b px-4 sm:px-6 py-4 border-gray-500/20">
          <h3 className="text-lg text-light-primary-text font-bold">
            Withdrawal Information
          </h3>
        </div>
        <div className="p-4 sm:p-6">
          <WithdrawDetailsOverview data={data} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <BankDetailsCard bankDetail={data.bank_detail} />
      </div>
 
    </div>
  );
}