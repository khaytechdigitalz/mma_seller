"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Bell, Loader2, ChevronRight, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";

interface NotificationItem {
  id: number;
  user_id: number;
  subject: string;
  details: string;
  admin_read: boolean;
  user_read: boolean;
  created_at: string;
}

type FilterTab = "all" | "unread" | "read";

export default function AllNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  useEffect(() => {
    fetchAllNotifications(currentPage);
  }, [currentPage]);

  const fetchAllNotifications = async (page: number) => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/notifications?page=${page}`);
      if (res.data?.status) {
        setNotifications(res.data.data.data || []);
        setLastPage(res.data.data.last_page || 1);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  // Filter logic based on tab selection (using admin_read as the status indicator)
  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === "unread") return !item.admin_read;
    if (activeTab === "read") return item.admin_read;
    return true;
  });

  return (
    <div className="max-w-full mx-auto p-6 space-y-6 animate-in fade-in duration-300">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-xs">
            <Bell className="size-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Notifications Center</h1>
            <p className="text-xs text-gray-500">Manage and review your complete system logs and alerts history.</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center p-1 bg-gray-100/80 rounded-xl border border-gray-200/60 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "all" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab("unread")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "unread" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setActiveTab("read")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "read" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Read
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <Loader2 className="size-7 animate-spin text-primary" />
            <p className="text-xs text-gray-400 font-medium">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto text-gray-400">
              <Bell className="size-5" />
            </div>
            <p className="text-xs font-semibold text-gray-700">No notifications found</p>
            <p className="text-[11px] text-gray-400">You're all caught up for this filter category.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((item) => (
              <div
                key={item.id}
                onClick={() => router.push(`/notifications/${item.id}`)}
                className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition-all cursor-pointer group ${
                  !item.admin_read ? "bg-primary/[0.02] hover:bg-primary/[0.05]" : "hover:bg-gray-50/80"
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className={`mt-0.5 p-2 rounded-xl shrink-0 ${!item.admin_read ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-400"}`}>
                    {!item.admin_read ? <Clock className="size-4" /> : <CheckCircle2 className="size-4" />}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm tracking-tight truncate ${!item.admin_read ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
                        {item.subject}
                      </span>
                      {!item.admin_read && (
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate max-w-xl leading-relaxed">
                      {item.details}
                    </p>
                    <span className="text-[11px] text-gray-400 font-medium block pt-0.5">
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 text-gray-400 group-hover:text-primary transition-colors p-1 rounded-lg group-hover:bg-white shadow-2xs">
                  <ChevronRight className="size-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination controls */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50/50">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1 || loading}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="text-xs font-medium"
          >
            Previous
          </Button>
          <span className="text-xs text-gray-500 font-semibold">
            Page {currentPage} of {lastPage}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= lastPage || loading}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, lastPage))}
            className="text-xs font-medium"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}