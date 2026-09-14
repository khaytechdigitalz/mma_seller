import Link from "next/link";
import React from "react";
import { ChevronDown, ChevronRight } from "@/icons";

interface SidebarSubmenuProps {
  item: {
    label: string;
    icon: React.ReactNode;
    subItems: { label: string; href: string }[];
  };
  pathname: string;
  isCollapsed?: boolean;
  isOpen: boolean;
  onToggle: () => void;
  userRole?: "master" | "seller";
}

export function SidebarSubmenu({
  item,
  pathname,
  isCollapsed,
  isOpen,
  onToggle,
  userRole,
}: SidebarSubmenuProps) {
  const hasActiveChild = item.subItems.some(
    (sub) => pathname === sub.href || pathname.startsWith(`${sub.href}/`),
  );

  return (
    <div>
      <button
        onClick={onToggle}
        className={`w-full font-semibold flex items-center rounded-lg transition-colors py-2 pl-3 pr-3 ${
          hasActiveChild
            ? "bg-primary-lighter text-primary"
            : userRole === "seller"
              ? "text-light-secondary-text hover:bg-gray-200 hover:text-light-primary-text"
              : "text-white hover:bg-white/5"
        } ${isCollapsed ? "justify-center px-0" : "justify-between px-4"}`}
      >
        <div
          className={`flex items-center gap-3 ${isCollapsed ? "" : "min-w-0"}`}
        >
          <span
            className={`${userRole === "seller" && !hasActiveChild ? "text-light-secondary-text group-hover:text-light-primary-text" : ""}`}
          >
            {item.icon}
          </span>
          {!isCollapsed && (
            <span className="font-medium text-sm whitespace-nowrap truncate">
              {item.label}
            </span>
          )}
        </div>
        {!isCollapsed &&
          (isOpen ? (
            <ChevronDown
              size={16}
              className={`shrink-0 size-4 ${userRole === "seller" && !hasActiveChild ? "text-light-secondary-text" : ""}`}
            />
          ) : (
            <ChevronRight
              size={16}
              className={`shrink-0 size-4 ${userRole === "seller" && !hasActiveChild ? "text-light-secondary-text" : ""}`}
            />
          ))}
      </button>

      {/* Submenu - Only show if NOT collapsed */}
      {!isCollapsed && (
        <div
          className={`grid transition-all duration-300 ease-in-out ${
            isOpen
              ? "grid-rows-[1fr] opacity-100 mt-2"
              : "grid-rows-[0fr] opacity-0 mt-0"
          }`}
        >
          <div className="overflow-hidden min-h-0 relative space-y-0">
            {/* Vertical connection line from center of first to center of last */}
            <div
              className={`absolute left-[30px] top-[22px] bottom-[22px] w-[2px] z-0 bg-gray-500/20`}
            ></div>

            {/* Progress Line (Active Path) */}
            {(() => {
              const activeIndex = item.subItems.findIndex(
                (sub) => pathname === sub.href,
              );
              if (activeIndex > 0) {
                return (
                  <div
                    className="absolute left-[30px] top-[18px] w-[2px] z-0 transition-all duration-300 bg-primary-light"
                    style={{ height: `${activeIndex * 36}px` }}
                  ></div>
                );
              }
              return null;
            })()}

            {item.subItems.map((sub, index) => {
              const isBetterMatch = item.subItems.some(
                (sibling) =>
                  sibling !== sub &&
                  sibling.href.length > sub.href.length &&
                  (pathname === sibling.href ||
                    pathname.startsWith(`${sibling.href}/`)),
              );

              const isActive =
                !isBetterMatch &&
                (pathname === sub.href ||
                  (sub.href !== "/" && pathname.startsWith(`${sub.href}/`)));

              const isFirst = index === 0;
              const isLast = index === item.subItems.length - 1;

              const hasActiveSubItem = item.subItems.some((s) => {
                const sBetterMatch = item.subItems.some(
                  (sibling) =>
                    sibling !== s &&
                    sibling.href.length > s.href.length &&
                    (pathname === sibling.href ||
                      pathname.startsWith(`${sibling.href}/`)),
                );
                return (
                  !sBetterMatch &&
                  (pathname === s.href ||
                    (s.href !== "/" && pathname.startsWith(`${s.href}/`)))
                );
              });

              return (
                <Link
                  key={sub.href}
                  href={sub.href}
                  className={`relative block pl-[50px] py-2 text-sm transition-colors z-10 ${
                    isActive
                      ? "text-primary-light font-semibold"
                      : userRole === "seller"
                        ? "text-light-secondary-text hover:text-light-primary-text"
                        : "text-white hover:text-primary-light"
                  }`}
                >
                  {/* Dot on the line - only for first and last items */}
                  {(isFirst || isLast) && (
                    <div
                      className={`absolute left-[27px] top-[14px] w-2 h-2 rounded-full z-20 ${
                        (isFirst && hasActiveSubItem) || (isLast && isActive)
                          ? "bg-primary-light"
                          : "bg-gray-500/20"
                      }`}
                    ></div>
                  )}

                  {sub.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
