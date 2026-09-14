import React from "react";
import SupportTicketTable from "@/components/support/support-ticket-table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support Tickets",
  description: "View and manage customer support tickets.",
};

export default function SupportPage() {
  return <SupportTicketTable />;
}
