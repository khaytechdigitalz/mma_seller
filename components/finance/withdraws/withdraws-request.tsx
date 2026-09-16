"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { apiClient } from "@/lib/axios";
import { Loader2, X, Wallet, Building2, CreditCard, UserCheck } from "lucide-react";
import { toast } from "sonner";

interface BankAccount {
  id: number;
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_name: string;
  is_active: boolean;
}

interface WithdrawRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function WithdrawRequestModal({
  isOpen,
  onClose,
  onSuccess,
}: WithdrawRequestModalProps) {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [fetchingBanks, setFetchingBanks] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedBankId("");
      setAmount("");
      fetchUserBankAccounts();
    }
  }, [isOpen]);

  const fetchUserBankAccounts = async () => {
    setFetchingBanks(true);
    try {
      const res = await apiClient.get("/withdrawals/bank-accounts/list");
      if (res.data?.status) {
        const activeAccounts = (res.data.data || []).filter(
          (acc: BankAccount) => acc.is_active
        );
        setBankAccounts(activeAccounts);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load your bank accounts.");
    } finally {
      setFetchingBanks(false);
    }
  };

  // Find currently selected bank object to display its metadata cleanly
  const selectedBankAccount = bankAccounts.find(
    (acc) => String(acc.id) === String(selectedBankId)
  );

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBankId) {
      toast.error("Please select a bank account.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid payout amount.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiClient.post("/withdrawals/withdraw", {
        bank_account_id: selectedBankId,
        amount: Number(amount),
      });

      if (res.data?.status) {
        toast.success("Payout request submitted successfully!");
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to process withdrawal request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 md:p-8 space-y-6 relative shadow-2xl">
        <div className="flex items-center justify-between border-b pb-4 border-gray-100">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700">
              <Wallet className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Request Payout</h3>
              <p className="text-xs text-gray-500">Transfer funds from your wallet to your bank</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleRequestPayout} className="space-y-4">
          {/* Bank Account Selection Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">
              Select Destination Bank Account
            </label>
            {fetchingBanks ? (
              <div className="flex items-center gap-2 py-3 px-4 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-500">
                <Loader2 className="size-4 animate-spin text-teal-700" />
                Loading your linked bank accounts...
              </div>
            ) : bankAccounts.length === 0 ? (
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 text-center space-y-2">
                <p className="text-xs text-amber-800 font-medium">
                  No active bank accounts found.
                </p>
                <p className="text-[11px] text-amber-600">
                  Please link and activate a bank account in your settings first.
                </p>
              </div>
            ) : (
              <select
                value={selectedBankId}
                onChange={(e) => setSelectedBankId(e.target.value)}
                className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:border-teal-600 focus:outline-hidden focus:ring-1 focus:ring-teal-600 transition"
                required
              >
                <option value="" disabled>
                  Choose a bank account...
                </option>
                {bankAccounts.map((bank) => (
                  <option key={bank.id} value={bank.id}>
                    {bank.bank_name} — {bank.account_number}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Display Account Name & Bank Code Outside the Dropdown if Selected */}
          {selectedBankAccount && (
            <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100 space-y-2 text-xs">
              <div className="flex items-center justify-between text-gray-700">
                <span className="flex items-center gap-1.5 text-gray-500">
                  <Building2 className="size-3.5 text-teal-700" /> Bank Code:
                </span>
                <span className="font-mono font-bold text-gray-900 bg-white px-2 py-0.5 rounded-md border border-teal-100">
                  {selectedBankAccount.bank_code}
                </span>
              </div>
              <div className="flex items-center justify-between text-gray-700">
                <span className="flex items-center gap-1.5 text-gray-500">
                  <UserCheck className="size-3.5 text-teal-700" /> Account Name:
                </span>
                <span className="font-semibold text-gray-900 uppercase">
                  {selectedBankAccount.account_name}
                </span>
              </div>
              <div className="flex items-center justify-between text-gray-700 pt-1 border-t border-teal-100/60">
                <span className="flex items-center gap-1.5 text-gray-500">
                  <CreditCard className="size-3.5 text-teal-700" /> Account Number:
                </span>
                <span className="font-mono font-bold text-teal-900">
                  {selectedBankAccount.account_number}
                </span>
              </div>
            </div>
          )}

          {/* Amount Input */}
          <FloatingInput
            label="Amount to Withdraw"
            type="number"
            step="any"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || bankAccounts.length === 0}
              className="rounded-xl bg-teal-700 hover:bg-teal-800 text-white"
            >
              {submitting && <Loader2 className="size-4 animate-spin mr-2" />}
              Submit Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}