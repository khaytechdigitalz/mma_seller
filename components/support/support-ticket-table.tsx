"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Message01Icon } from "@/icons";
import CustomSelect, { Option } from "../ui/custom-select";
import SearchInput from "../common/search-input";
import { apiClient } from "@/lib/axios";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";

interface Ticket {
  id: number;
  ticket_id: string;
  user_id: number;
  subject: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

interface Metrics {
  open: number;
  replied: number;
  closed: number;
  total: number;
}

const statusOptions: Option[] = [
  { label: "Open", value: "open" },
  { label: "Replied", value: "replied" },
  { label: "Closed", value: "closed" },
];

const priorityOptions: Option[] = [
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
  { label: "Urgent", value: "urgent" },
];

const modalPriorityOptions: Option[] = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Urgent", value: "urgent" },
];

export default function SupportTicketTable() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({ open: 0, replied: 0, closed: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<Option | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<Option | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  // Create Ticket Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState<Option | null>(modalPriorityOptions[1]); // Default to medium
  const [message, setMessage] = useState("");
  const [attachmentInput, setAttachmentInput] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);

  // Fetch Tickets from API
  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
      };

      if (statusFilter?.value) {
        params.status = statusFilter.value;
      }
      if (priorityFilter?.value) {
        params.priority = priorityFilter.value;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const response = await apiClient.get("/tickets", { params });
      const responseData = response.data;

      if (responseData?.status) {
        setMetrics(responseData.metrics || { open: 0, replied: 0, closed: 0, total: 0 });
        const paginated = responseData.data;
        setTickets(paginated.data || []);
        setCurrentPage(paginated.current_page || 1);
        setTotalPages(paginated.last_page || 1);
      }
    } catch (err: any) {
      console.error("Failed to fetch support tickets:", err);
      toast.error(err?.response?.data?.message || "Failed to load support tickets.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, priorityFilter, searchQuery]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleAddAttachment = () => {
    if (attachmentInput.trim()) {
      setAttachments([...attachments, attachmentInput.trim()]);
      setAttachmentInput("");
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        subject: subject.trim(),
        priority: priority?.value || "medium",
        message: message.trim(),
        attachments: attachments,
      };

      const response = await apiClient.post("/tickets/create", payload);
      if (response.data?.status) {
        toast.success("Support ticket created successfully.");
        setIsModalOpen(false);
        // Reset form
        setSubject("");
        setPriority(modalPriorityOptions[1]);
        setMessage("");
        setAttachments([]);
        setAttachmentInput("");
        // Refresh list
        fetchTickets();
      }
    } catch (err: any) {
      console.error("Failed to create ticket:", err);
      toast.error(err?.response?.data?.message || "Failed to create support ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(tickets.map((t) => t.id));
    } else {
      setSelectedRows([]);
    }
  };

  const toggleSelectRow = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedRows((prev) => [...prev, id]);
    } else {
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
    }
  };

  const isAllSelected = tickets.length > 0 && selectedRows.length === tickets.length;

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

  return (
    <div className="space-y-6 w-full">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tickets */}
        <div className="bg-[#E0F7FA] p-5 rounded-2xl flex flex-col justify-between shadow-sm">
          <p className="text-sm font-medium text-gray-600">Total Tickets</p>
          <div className="flex items-end justify-between mt-4">
            <h4 className="text-3xl font-bold text-gray-900">{metrics.total}</h4>
          </div>
        </div>

        {/* Open Tickets */}
        <div className="bg-[#FFFDE7] p-5 rounded-2xl flex flex-col justify-between shadow-sm">
          <p className="text-sm font-medium text-gray-600">Open Tickets</p>
          <div className="flex items-end justify-between mt-4">
            <h4 className="text-3xl font-bold text-gray-900">{metrics.open}</h4>
          </div>
        </div>

        {/* Replied Tickets */}
        <div className="bg-[#E3F2FD] p-5 rounded-2xl flex flex-col justify-between shadow-sm">
          <p className="text-sm font-medium text-gray-600">Replied Tickets</p>
          <div className="flex items-end justify-between mt-4">
            <h4 className="text-3xl font-bold text-gray-900">{metrics.replied}</h4>
          </div>
        </div>

        {/* Closed Tickets */}
        <div className="bg-[#F3E5F5] p-5 rounded-2xl flex flex-col justify-between shadow-sm">
          <p className="text-sm font-medium text-gray-600">Closed Tickets</p>
          <div className="flex items-end justify-between mt-4">
            <h4 className="text-3xl font-bold text-gray-900">{metrics.closed}</h4>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl w-full">
        <div className="p-4 sm:p-6 pb-4">
          <div className="mb-4 sm:mb-6 flex justify-between items-center flex-wrap gap-4">
            <h3 className="text-xl font-bold text-light-primary-text leading-7">
              Support & Ticket
            </h3>
            <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
              <Plus className="size-4" /> Create Ticket
            </Button>
          </div>

          <div className="w-full flex justify-between gap-4 items-center flex-wrap">
            {/* Search */}
            <div className="w-full sm:w-72">
              <SearchInput
                onSearch={(val: string) => {
                  setSearchQuery(val);
                  setCurrentPage(1);
                }}
              />
            </div>
            {/* Filters */}
            <div className="flex items-center gap-3 w-full sm:w-auto overflow-visible flex-wrap pb-2 sm:pb-0">
              <div className="min-w-[130px]">
                <CustomSelect
                  options={statusOptions}
                  value={statusFilter}
                  onChange={(val) => {
                    setStatusFilter(val);
                    setCurrentPage(1);
                  }}
                  placeholder="Status"
                />
              </div>
              <div className="min-w-[130px]">
                <CustomSelect
                  options={priorityOptions}
                  value={priorityFilter}
                  onChange={(val) => {
                    setPriorityFilter(val);
                    setCurrentPage(1);
                  }}
                  placeholder="Priority"
                />
              </div>
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 hover:bg-gray-100 border-y border-gray-500/20">
              <TableHead className="whitespace-nowrap pl-6">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="whitespace-nowrap">ID</TableHead>
              <TableHead className="whitespace-nowrap">Type / Priority</TableHead>
              <TableHead className="whitespace-nowrap">Subject</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="whitespace-nowrap">Date</TableHead>
              <TableHead className="pr-6 whitespace-nowrap">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <div className="flex justify-center items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
                    <span className="text-sm text-gray-500">Loading tickets...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-sm text-gray-500">
                  No support tickets found.
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((item) => (
                <TableRow
                  key={item.id}
                  className="border-b last:border-0 border-gray-500/20 hover:bg-gray-50/50"
                >
                  <TableCell className="pl-6 whitespace-nowrap">
                    <Checkbox
                      checked={selectedRows.includes(item.id)}
                      onCheckedChange={(checked) =>
                        toggleSelectRow(item.id, Boolean(checked))
                      }
                    />
                  </TableCell>
                  <TableCell className="font-semibold text-sm text-light-secondary-text whitespace-nowrap">
                    {item.ticket_id}
                  </TableCell> 
                  <TableCell className="text-sm text-light-secondary-text whitespace-nowrap capitalize">
                    <span className="px-2 py-0.5 text-xs rounded-md bg-gray-100 font-medium">
                      {item.priority || "Normal"}
                    </span>
                  </TableCell>
                  <TableCell
                    className="text-sm text-light-secondary-text max-w-[300px] truncate"
                    title={item.subject}
                  >
                    {item.subject}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(item.status) as any}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-light-secondary-text whitespace-nowrap">
                    {new Date(item.created_at).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>

                  <TableCell className="pr-6 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Link href={`/support/${item.id}`}>
                        <Button
                          variant="icon"
                          className="hover:text-primary transition-colors"
                        >
                          <Message01Icon className="size-4" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="p-6 border-t border-gray-500/20 flex justify-end">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Create Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h4 className="text-lg font-bold text-gray-900">Create Support Ticket</h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={255}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of your issue"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <CustomSelect
                  options={modalPriorityOptions}
                  value={priority}
                  onChange={setPriority}
                  placeholder="Select priority"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attachments (URLs)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={attachmentInput}
                    onChange={(e) => setAttachmentInput(e.target.value)}
                    placeholder="Enter attachment URL"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <Button type="button" variant="outline" onClick={handleAddAttachment}>
                    Add
                  </Button>
                </div>
                {attachments.length > 0 && (
                  <ul className="space-y-1">
                    {attachments.map((att, index) => (
                      <li key={index} className="flex justify-between items-center text-xs bg-gray-50 px-2 py-1 rounded border">
                        <span className="truncate max-w-[380px]">{att}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(index)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Submit Ticket
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}