"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell, Calendar, ShieldCheck, Loader2, UserCheck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface NotificationDetail {
  id: number;
  user_id: number;
  subject: string;
  details: string;
  admin_read: boolean;
  user_read: boolean;
  created_at: string;
  updated_at: string;
}

export default function NotificationDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [notification, setNotification] = useState<NotificationDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchNotificationDetails();
    }
  }, [id]);

  const fetchNotificationDetails = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/notifications/details/${id}`);
      if (res.data?.status) {
        setNotification(res.data.data);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load notification details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-3">
        <Loader2 className="size-7 animate-spin text-primary" />
        <p className="text-xs text-gray-400 font-medium">Loading notification details...</p>
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="max-w-full mx-auto py-24 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto text-gray-400">
          <Bell className="size-5" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-gray-900">Notification not found</p>
          <p className="text-xs text-gray-500">The record you are looking for might have been deleted or doesn't exist.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto p-6 space-y-6 animate-in fade-in duration-300">
      {/* Top Action Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-2 text-xs font-semibold">
          <ArrowLeft className="size-4" /> Back to Notifications
        </Button>
        <span className="text-xs font-medium text-gray-400">System Alert View</span>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
        {/* Header Metadata */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary shrink-0 shadow-xs">
              <Bell className="size-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-gray-900 tracking-tight">{notification.subject}</h2>
              <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                <Calendar className="size-3.5 text-gray-400" />
                <span>{new Date(notification.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-200/60 text-xs font-semibold text-gray-700 self-start sm:self-auto">
            <ShieldCheck className="size-4 text-emerald-600" /> ID: #{notification.id}
          </div>
        </div>

        {/* Message Content Box */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Message Content</h4>
          <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-100 text-sm text-gray-700 leading-relaxed shadow-2xs">
            {notification.details}
          </div>
        </div>

        {/* Footer Metadata & Status Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-100 text-xs">
          <div className="flex items-center gap-2 text-gray-500 font-medium">
            <UserCheck className="size-4 text-gray-400" />
            <span>Target User ID: <strong className="text-gray-900">#{notification.user_id}</strong></span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200/60 font-semibold">
              <CheckCircle2 className="size-3.5 text-emerald-600" /> Admin Read Status Synced
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}