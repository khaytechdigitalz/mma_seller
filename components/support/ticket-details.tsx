"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/axios";
import { toast } from "sonner";
import { Loader2, Send, Paperclip, CheckCircle2, AlertTriangle, FileText, X } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
}

interface Message {
  id: number;
  ticket_id: number;
  user_id: number;
  message: string;
  attachments?: string[];
  created_at: string;
  user?: User;
}

interface TicketData {
  id: number;
  ticket_id: string;
  user_id: number;
  subject: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  user?: User;
  messages: Message[];
}

export default function TicketDetails() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id;

  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  // Reply form state
  const [replyMessage, setReplyMessage] = useState("");
  const [replyAttachment, setReplyAttachment] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  // Close ticket state
  const [closingTicket, setClosingTicket] = useState(false);

  const fetchTicketDetails = useCallback(async () => {
    if (!ticketId) return;
    try {
      setLoading(true);
      const response = await apiClient.get(`/tickets/${ticketId}`);
      if (response.data?.status) {
        setTicket(response.data.data);
      }
    } catch (err: any) {
      console.error("Failed to load ticket details:", err);
      toast.error(err?.response?.data?.message || "Failed to load ticket details.");
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchTicketDetails();
  }, [fetchTicketDetails]);

  // Handle Reply Submit
  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) {
      toast.error("Please enter a reply message.");
      return;
    }

    try {
      setSubmittingReply(true);
      const payload = {
        message: replyMessage,
        attachments: replyAttachment.trim() ? [replyAttachment.trim()] : [],
      };

      const response = await apiClient.post(`/tickets/${ticketId}/reply`, payload);
      if (response.status === 200 || response.data?.status) {
        toast.success("Reply sent successfully.");
        setReplyMessage("");
        setReplyAttachment("");
        setIsReplyModalOpen(false);
        fetchTicketDetails();
      }
    } catch (err: any) {
      console.error("Failed to send reply:", err);
      toast.error(err?.response?.data?.message || "Failed to send reply.");
    } finally {
      setSubmittingReply(false);
    }
  };

  // Handle Close Ticket
  const handleCloseTicket = async () => {
    try {
      setClosingTicket(true);
      const response = await apiClient.patch(`/tickets/${ticketId}/close`);
      if (response.status === 200 || response.data?.status) {
        toast.success("Ticket closed successfully.");
        setIsCloseModalOpen(false);
        fetchTicketDetails();
      }
    } catch (err: any) {
      console.error("Failed to close ticket:", err);
      toast.error(err?.response?.data?.message || "Failed to close ticket.");
    } finally {
      setClosingTicket(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "success";
      case "replied":
        return "default";
      case "closed":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-teal-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-sm font-medium">Loading ticket details...</span>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">Ticket not found or has been removed.</p>
        <Button onClick={() => router.push("/support")}>Back to Support</Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="space-y-1">
          <PageHeader title={`Ticket #${ticket.ticket_id}`} backHref="/support" />
          <p className="text-xs text-gray-500 pl-7">
            Created on {new Date(ticket.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={getStatusBadgeVariant(ticket.status) as any} className="capitalize">
            {ticket.status}
          </Badge>
          <span className="px-2.5 py-0.5 text-xs rounded-md bg-gray-100 font-medium uppercase text-gray-700">
            {ticket.priority} Priority
          </span>
          {ticket.status.toLowerCase() !== "closed" && (
            <Button
              variant="outline"
              size="xs"
              className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
              onClick={() => setIsCloseModalOpen(true)}
            >
              Dismiss / Close
            </Button>
          )}
        </div>
      </div>

      {/* Ticket Info Card */}
      <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Subject</span>
          <h2 className="text-lg font-bold text-gray-900 mt-0.5">{ticket.subject}</h2>
        </div>
        <div className="sm:text-right">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Submitted By</span>
          <p className="text-sm font-medium text-gray-900 mt-0.5">
            {ticket.user?.name} <span className="text-gray-500">({ticket.user?.email})</span>
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="border border-gray-500/20 rounded-2xl">
        <div className="flex px-4 sm:px-6 py-4 items-center justify-between border-b border-gray-500/20">
          <h3 className="text-base font-bold text-gray-900">
            Conversation History ({ticket.messages?.length || 0})
          </h3>
          {ticket.status.toLowerCase() !== "closed" && (
            <Button variant="success" size="xs" onClick={() => setIsReplyModalOpen(true)}>
              Reply
            </Button>
          )}
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          {ticket.messages && ticket.messages.length > 0 ? (
            ticket.messages.map((msg, index) => (
              <div key={msg.id || index} className="bg-white border border-gray-200/80 rounded-xl p-4 sm:p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
                      {msg.user?.name ? msg.user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900">{msg.user?.name || "User"}</h4>
                      <p className="text-xs text-gray-500">{msg.user?.email}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(msg.created_at).toLocaleString()}
                  </span>
                </div>

                <p className="text-sm sm:text-base text-gray-800 leading-relaxed pl-10">
                  {msg.message}
                </p>

                {/* Attachments Section */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="pl-10 pt-2 flex flex-wrap gap-2">
                    {msg.attachments.map((att, attIndex) => (
                      <a
                        key={attIndex}
                        href={att}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs font-medium text-teal-700 hover:bg-teal-50 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Attachment {attIndex + 1}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-6">No messages found in this ticket.</p>
          )}
        </div>
      </div>

      {/* Reply Modal */}
      {isReplyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-bold text-lg text-gray-900">Reply to Ticket</h3>
              <button
                onClick={() => setIsReplyModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReplySubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Message</label>
                <textarea
                  rows={4}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your response here..."
                  required
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Attachment URL / File Link (Optional)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Paperclip className="w-4 h-4" />
                  </span>
                  <input
                    type="url"
                    value={replyAttachment}
                    onChange={(e) => setReplyAttachment(e.target.value)}
                    placeholder="https://storage.example.com/receipt.pdf"
                    className="w-full rounded-xl border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsReplyModalOpen(false)}
                  disabled={submittingReply}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submittingReply} className="gap-2">
                  {submittingReply ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Send Reply
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Ticket Confirmation Modal */}
      {isCloseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl animate-in fade-in zoom-in duration-200 text-center">
            <div className="size-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">Close This Ticket?</h3>
              <p className="text-sm text-gray-500 mt-1">
                Are you sure you want to dismiss/close ticket #{ticket.ticket_id}? This action marks the support inquiry as resolved.
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsCloseModalOpen(false)}
                disabled={closingTicket}
              >
                Cancel
              </Button>
              <Button
                variant="warning"
                onClick={handleCloseTicket}
                disabled={closingTicket}
                className="bg-red-600 hover:bg-red-700 text-white gap-2"
              >
                {closingTicket ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Closing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Yes, Close Ticket
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}