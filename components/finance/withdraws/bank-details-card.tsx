import React from "react";
import { BankDetail } from "@/types/withdrawal";

interface BankDetailsCardProps {
  bankDetail: BankDetail | null;
}

export default function BankDetailsCard({ bankDetail }: BankDetailsCardProps) {
  return (
    <div className="border border-gray-500/20 rounded-2xl overflow-hidden h-full">
      <div className="border-b px-4 sm:px-6 py-4 border-gray-500/20 bg-white">
        <h3 className="text-lg text-light-primary-text font-bold">
          Destination Bank Account
        </h3>
      </div>
      <div className="p-4 sm:p-6">
        {bankDetail ? (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-400 font-medium">Bank Name</p>
              <p className="text-base font-semibold text-gray-900">
                {bankDetail.bank_name} ({bankDetail.bank_code})
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 font-medium">Account Number</p>
                <p className="text-base font-mono font-bold text-teal-800">
                  {bankDetail.account_number}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Account Name</p>
                <p className="text-base font-medium text-gray-800">
                  {bankDetail.account_name}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-400 py-4">
            No bank details provided.
          </div>
        )}
      </div>
    </div>
  );
}