"use client";

import TransactionWidgets from "@/components/transactions/transaction-widgets";
import TransactionChart from "@/components/transactions/transaction-chart";
import TransactionTable from "@/components/transactions/transaction-table";

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <TransactionWidgets />
      <div className="bg-white rounded-2xl p-4 sm:p-6">
        <TransactionChart />
      </div>
      <TransactionTable />
    </div>
  );
}