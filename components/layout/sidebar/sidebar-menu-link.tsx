import Link from "next/link";
import React from "react";

interface SidebarMenuLinkProps {
  item: { label: string; href?: string; icon: React.ReactNode };
  pathname: string;
  isCollapsed?: boolean;
  userRole?: "master" | "seller";
}

export function SidebarMenuLink({
  item,
  pathname,
  isCollapsed,
  userRole,
}: SidebarMenuLinkProps) {
  const isActive =
    (item.href !== "/" && pathname.startsWith(item.href || "")) ||
    pathname === item.href;

  return (
    <Link
      href={item.href || "#"}
      className={`flex items-center rounded-md transition-colors py-2 group ${
        isActive
          ? userRole === "seller"
            ? "bg-primary-lighter text-primary"
            : "bg-primary-dark text-white"
          : userRole === "seller"
            ? "text-light-secondary-text hover:bg-gray-200 hover:text-light-primary-text"
            : "hover:bg-white/5 text-white"
      } ${isCollapsed ? "justify-center px-0" : "justify-between px-3"}`}
    >
      <div
        className={`flex items-center gap-3 ${isCollapsed ? "" : "min-w-0"}`}
      >
        <span
          className={`${userRole === "seller" && !isActive ? "text-light-secondary-text group-hover:text-gray-700" : ""}`}
        >
          {item.icon}
        </span>
        {!isCollapsed && (
          <span className="font-medium text-sm whitespace-nowrap truncate">
            {item.label}
          </span>
        )}
      </div>
    </Link>
  );
}
