"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { StatusHistory } from "@/types/order";

interface OrderTrackingProps {
  statusHistories: StatusHistory[];
}

export default function OrderTracking({ statusHistories }: OrderTrackingProps) {
  return (
    <div className="border border-gray-500/20 rounded-2xl w-full">
      <h3 className="text-lg sm:text-xl font-bold text-light-primary-text py-4 px-4 sm:px-6 border-b border-gray-500/20">
        Order Tracking History
      </h3>

      <div className="relative p-6">
        {statusHistories.length === 0 ? (
          <p className="text-sm text-gray-500">No status updates recorded yet.</p>
        ) : (
          statusHistories.map((history, index) => {
            const isCompleted = true; // Historical items in log are completed steps
            const formattedDate = new Date(history.created_at).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div key={history.id || index} className="relative flex gap-6 pb-12 last:pb-0">
                {/* Vertical Line */}
                {index !== statusHistories.length - 1 && (
                  <div
                    className={cn(
                      "absolute left-[15px] top-3.5 -bottom-3.5 w-[2px]",
                      isCompleted ? "bg-primary" : "bg-gray-200"
                    )}
                  />
                )}

                {/* Indicator */}
                <div className="relative shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M12.3184 3.72959C12.8361 3.5377 13.4114 3.80175 13.6035 4.31944C13.7954 4.83692 13.5319 5.41224 13.0146 5.60459C12.3677 5.84464 11.6299 6.35667 10.8594 7.06456C10.0999 7.76229 9.36307 8.59866 8.71289 9.41514C8.0648 10.229 7.51449 11.0085 7.12598 11.5851C6.93219 11.8727 6.77937 12.1087 6.67578 12.2716C6.6242 12.3527 6.58469 12.416 6.55859 12.4581C6.5456 12.4791 6.53554 12.4958 6.5293 12.506C6.52636 12.5107 6.52381 12.5145 6.52246 12.5167L6.52148 12.5187C6.33788 12.8214 6.00736 13.0046 5.65332 13.0001C5.29923 12.9955 4.97362 12.8036 4.79785 12.4962C4.18229 11.4191 3.68932 10.963 3.42578 10.7784C3.31395 10.7001 3.24206 10.6689 3.21582 10.6593C2.71884 10.6012 2.33305 10.1797 2.33301 9.66709C2.33301 9.11481 2.78072 8.66709 3.33301 8.66709V9.46592C3.33315 8.70657 3.33395 8.66895 3.33496 8.66709H3.35254C3.35891 8.66723 3.3662 8.66782 3.37305 8.66807C3.38717 8.66859 3.40282 8.66882 3.41895 8.67002C3.45164 8.67247 3.48892 8.67658 3.5293 8.68272C3.61049 8.69511 3.70616 8.71693 3.81348 8.75108C4.02964 8.81994 4.28717 8.9395 4.57324 9.13975C4.9032 9.3708 5.26625 9.70819 5.6543 10.1935C6.04611 9.62297 6.55752 8.91113 7.14844 8.16905C7.83641 7.3051 8.64411 6.38364 9.50586 5.5919C10.3564 4.81045 11.3185 4.10061 12.3184 3.72959ZM3.27051 10.6651C3.27901 10.6658 3.28873 10.6657 3.29883 10.6661C3.30395 10.6663 3.30992 10.667 3.31543 10.6671H3.33105L3.33203 10.6661C3.30651 10.6661 3.2809 10.6651 3.25586 10.6632C3.26029 10.6637 3.26553 10.6648 3.27051 10.6651Z"
                        fill="white"
                      />
                    </svg>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 -mt-1">
                  <div>
                    <h4 className="text-sm font-semibold text-light-primary-text mb-1 uppercase">
                      {history.status}
                    </h4>
                    <p className="text-xs text-light-primary-text mb-1">
                      {history.comment}
                    </p>
                    {history.changed_by?.name && (
                      <p className="text-xs text-gray-400">
                        Updated by: {history.changed_by.name}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-normal text-light-secondary-text whitespace-nowrap">
                    {formattedDate}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}