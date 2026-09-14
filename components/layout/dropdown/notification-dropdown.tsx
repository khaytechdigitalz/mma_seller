"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, MenuButton, MenuItems } from "@headlessui/react";
import { BellAltIcon, BellIcon } from "@/icons";
import { apiClient } from "@/lib/axios";

interface NotificationItem {
  id: number;
  subject: string;
  details: string;
  created_at: string;
  admin_read: boolean;
}

export default function NotificationDropdown() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNewNotifications();
  }, []);

  const fetchNewNotifications = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/notifications/new");
      if (res.data?.status) {
        setNotifications(res.data.data.data || []);
        setTotalCount(res.data.data.total || 0);
      }
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <Menu as="div" className="relative inline-block text-left">
        <MenuButton className="relative size-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors focus:outline-none">
          <BellIcon className="w-5 h-5 text-text-primary-text" />
          {totalCount > 0 && (
            <span className="absolute top-[2px] right-0 h-4.5 w-4.5 flex items-center justify-center rounded-full bg-error text-xs font-bold text-white">
              {totalCount}
            </span>
          )}
        </MenuButton>

        <MenuItems
          transition
          className="absolute -right-[70px] sm:right-0 mt-2 w-[320px] origin-top-right rounded-lg bg-white ring-1 ring-gray-500/20 focus:outline-none z-50 transition duration-100 ease-out data-closed:scale-95 data-closed:opacity-0 shadow-lg"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-500/20">
            <h3 className="font-semibold text-light-primary-text text-sm">
              Notification
            </h3>
            <Link
              href="/notifications"
              className="text-xs text-light-secondary-text hover:text-light-primary-text transition-colors font-medium"
            >
              View All
            </Link>
          </div>

          {/* List */}
          <div className="max-h-[400px] p-3 space-y-2 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="py-8 text-center text-xs text-light-secondary-text">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-light-secondary-text">No new notifications</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => router.push(`/notifications/${notification.id}`)}
                  className="flex gap-3 rounded-lg p-2 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 cursor-pointer"
                >
                  <div className="shrink-0">
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-light-primary-text">
                      <BellAltIcon className="size-4" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 md:mt-1">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <p className="text-sm font-semibold text-light-primary-text truncate">
                        {notification.subject}
                      </p>
                      <span className="text-xs text-light-disabled-text whitespace-nowrap">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-light-secondary-text line-clamp-2 leading-relaxed">
                      {notification.details}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </MenuItems>
      </Menu>
    </div>
  );
}