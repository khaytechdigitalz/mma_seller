import React from "react";
import Image from "next/image";
import { Mail01Icon, PhoneIcon } from "@/icons";
import { WithdrawalUser, ProcessedBy } from "@/types/withdrawal";

interface WithdrawByProps {
  user: WithdrawalUser | null;
  processedBy?: ProcessedBy | null;
}

export default function WithdrawBy({ user, processedBy }: WithdrawByProps) {
  return (
    <div className="border border-gray-500/20 rounded-2xl overflow-hidden h-full">
      <div className="border-b px-4 sm:px-6 py-4 border-gray-500/20 bg-white flex justify-between items-center">
        <h3 className="text-lg text-light-primary-text font-bold">
          Requested By
        </h3>
        {processedBy && (
          <span className="text-xs text-gray-500">
            Processed by: <strong className="text-gray-800">{processedBy.name}</strong>
          </span>
        )}
      </div>
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
          <div className="size-16 rounded-full bg-teal-700/10 flex items-center justify-center text-teal-800 font-bold text-xl shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="space-y-2">
            <h4 className="text-lg font-bold text-light-primary-text">
              {user?.name || "N/A"}
            </h4>
            <div className="flex flex-col gap-y-1.5 text-sm text-light-primary-text">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail01Icon className="size-4 shrink-0 text-gray-400" />
                <span>{user?.email || "No email available"}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <PhoneIcon className="size-4 shrink-0 text-gray-400" />
                <span>{user?.phone || "No phone number registered"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}