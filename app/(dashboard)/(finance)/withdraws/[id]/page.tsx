"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import WithdrawBy from "@/components/finance/withdraws/withdraw-by";
import WithdrawDetailsOverview from "@/components/finance/withdraws/withdraw-details-overview";
import BankDetailsCard from "@/components/finance/withdraws/bank-details-card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { ActionModal } from "@/components/ui/action-modal";
import { WithdrawalDetail, WithdrawalDetailApiResponse } from "@/types/withdrawal";
import { apiClient } from "@/lib/axios";

export default function WithdrawDetailsPage() {
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<WithdrawalDetail | null>(null);

  // Modal States
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  const handleApprove = async () => {
    try {
      setSubmitting(true);
      await apiClient.post(`/withdrawals/${id}/approve`, {
        admin_notes: adminNotes,
      });
      setApproveModalOpen(false);
      setAdminNotes("");
      fetchDetails();
    } catch (error) {
      console.error("Failed to approve withdrawal:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = async () => {
    try {
      setSubmitting(true);
      await apiClient.post(`/withdrawals/${id}/decline`, {
        admin_notes: adminNotes,
      });
      setDeclineModalOpen(false);
      setAdminNotes("");
      fetchDetails();
    } catch (error) {
      console.error("Failed to decline withdrawal:", error);
    } finally {
      setSubmitting(false);
    }
  };

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

        {isPending && (
          <div className="flex gap-3">
            <Button
              size="xs"
              variant="outline"
              className="border-red-500 text-red-600 hover:bg-red-50"
              onClick={() => setDeclineModalOpen(true)}
            >
              Reject
            </Button>
            <Button
              size="xs"
              className="bg-teal-700 hover:bg-teal-800 text-white"
              onClick={() => setApproveModalOpen(true)}
            >
              Approve Payout
            </Button>
          </div>
        )}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WithdrawBy user={data.user} processedBy={data.processed_by} />
        <BankDetailsCard bankDetail={data.bank_detail} />
      </div>

      {/* Approve Modal */}
      <ActionModal
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        title="Approve Withdrawal"
        description="Are you sure you want to approve this withdrawal request?"
        confirmText="Approve"
        confirmVariant="teal"
        loading={submitting}
        onConfirm={handleApprove}
      >
        <div className="mt-4">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Admin Notes (Optional)
          </label>
          <textarea
            rows={3}
            className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
            placeholder="Enter processing details or transfer reference..."
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
          />
        </div>
      </ActionModal>

      {/* Reject Modal */}
      <ActionModal
        isOpen={declineModalOpen}
        onClose={() => setDeclineModalOpen(false)}
        title="Decline Withdrawal"
        description="Are you sure you want to decline this withdrawal request?"
        confirmText="Decline"
        confirmVariant="danger"
        loading={submitting}
        onConfirm={handleDecline}
      >
        <div className="mt-4">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Reason / Admin Notes
          </label>
          <textarea
            rows={3}
            className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
            placeholder="Explain why this request is being declined..."
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
          />
        </div>
      </ActionModal>
    </div>
  );
}