import React from "react";
import { BankDetail } from "@/types/withdrawal";
import { Building2, CreditCard, User, ShieldCheck, AlertCircle } from "lucide-react";

interface BankDetailsCardProps {
  bankDetail: BankDetail | null;
}

export default function BankDetailsCard({ bankDetail }: BankDetailsCardProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden h-full shadow-xs transition-all hover:shadow-md flex flex-col">
      {/* Header */}
      <div className="border-b px-5 sm:px-6 py-4 border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700">
            <Building2 className="size-4" />
          </div>
          <h3 className="text-base text-gray-900 font-bold">
            Destination Bank Account
          </h3>
        </div>
        {bankDetail && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="size-3 text-emerald-600" /> Verified
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-center">
        {bankDetail ? (
          <div className="space-y-5">
            {/* Bank Name & Code */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Bank Name</p>
                <p className="text-base font-bold text-gray-900 mt-0.5">
                  {bankDetail.bank_name}
                </p>
              </div>
              <span className="font-mono text-xs font-semibold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg border border-gray-200/60">
                {bankDetail.bank_code}
              </span>
            </div>

            {/* Grid for Account Number & Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold flex items-center gap-1">
                  <CreditCard className="size-3 text-teal-700" /> Account Number
                </p>
                <p className="font-mono text-lg font-bold tracking-tight text-teal-900">
                  {bankDetail.account_number}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold flex items-center gap-1">
                  <User className="size-3 text-teal-700" /> Account Name
                </p>
                <p className="text-sm font-bold text-gray-800 uppercase tracking-wide truncate">
                  {bankDetail.account_name}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 space-y-2">
            <div className="size-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
              <AlertCircle className="size-5" />
            </div>
            <p className="text-xs font-medium text-gray-500">
              No destination bank details provided for this transaction.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}