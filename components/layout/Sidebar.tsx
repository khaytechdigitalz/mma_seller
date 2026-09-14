"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { navItems } from "./nav-data";
import { SidebarHeader } from "./sidebar/sidebar-header";
import { SidebarItemWrapper } from "./sidebar/sidebar-item-wrapper";
import { SidebarMenuLink } from "./sidebar/sidebar-menu-link";
import { SidebarSubmenu } from "./sidebar/sidebar-submenu";
import Link from "next/link";
import { DashboardGridIcon, MoreHorizontalIcon, StoreIcon } from "@/icons";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  isCollapsed,
  toggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});

  const [prevPathname, setPrevPathname] = useState<string | null>(null);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    let hasChanges = false;
    const newOpenSubMenus = { ...openSubMenus };

    navItems.slice(1).forEach((group) => {
      if ("items" in group && Array.isArray(group.items)) {
        group.items.forEach((item) => {
          if (item.subItems) {
            const isChildActive = item.subItems.some(
              (sub) =>
                pathname === sub.href || pathname.startsWith(`${sub.href}/`),
            );
            if (isChildActive && !newOpenSubMenus[item.label]) {
              newOpenSubMenus[item.label] = true;
              hasChanges = true;
            }
          }
        });
      }
    });

    if (hasChanges) {
      setOpenSubMenus(newOpenSubMenus);
    }
  }

  const toggleSubMenu = (label: string) => {
    if (isCollapsed && toggleCollapse) {
      toggleCollapse();
      setOpenSubMenus({ [label]: true });
      return;
    }
    setOpenSubMenus((prev) => ({ [label]: !prev[label] }));
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-45 xl:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`h-screen shrink-0 fixed left-0 top-0 z-50 flex flex-col transition-all duration-300 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} xl:translate-x-0 
        ${isCollapsed ? "w-[80px]" : "w-[280px]"}
        bg-primary-darker`}
      >
        <SidebarHeader
          isCollapsed={isCollapsed}
          toggleCollapse={toggleCollapse}
          onClose={onClose}
        />

        <div className="p-4 pb-10 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar-white">
          <SidebarItemWrapper label="Dashboard" isCollapsed={isCollapsed}>
            <Link
              href="/"
              className={`flex items-center gap-3 py-2 rounded-lg mb-6 transition-all duration-300 ${isCollapsed ? "justify-center px-0" : "px-4"} ${
                pathname === "/"
                  ? "bg-primary-dark text-white"
                  : "text-white hover:bg-white/5"
              }`}
            >
              <DashboardGridIcon className="w-5.5 h-5.5" />
              {!isCollapsed && (
                <span className="font-medium text-sm whitespace-nowrap">
                  Dashboard
                </span>
              )}
            </Link>
          </SidebarItemWrapper>
 

          {navItems.slice(1).map((group, idx) => (
            <div key={idx} className="mb-6">
              {"category" in group && (
                <div
                  className={`text-xs font-medium tracking-wider mb-3 uppercase whitespace-nowrap transition-all duration-300 text-warning-light ${
                    isCollapsed
                      ? "flex justify-center px-0 overflow-hidden"
                      : "px-4"
                  }`}
                >
                  {isCollapsed ? (
                    <MoreHorizontalIcon className="size-5.5 text-white" />
                  ) : (
                    group.category
                  )}
                </div>
              )}

              <div className="space-y-1">
                {"items" in group &&
                  Array.isArray(group.items) &&
                  group.items.map((item) => (
                    <div key={item.label}>
                      {item.subItems ? (
                        <SidebarItemWrapper
                          label={item.label}
                          isCollapsed={isCollapsed}
                        >
                          <SidebarSubmenu
                            item={
                              item as Parameters<
                                typeof SidebarSubmenu
                              >[0]["item"]
                            }
                            pathname={pathname}
                            isCollapsed={isCollapsed}
                            isOpen={!!openSubMenus[item.label]}
                            onToggle={() => toggleSubMenu(item.label)}
                          />
                        </SidebarItemWrapper>
                      ) : (
                        <SidebarItemWrapper
                          label={item.label}
                          isCollapsed={isCollapsed}
                        >
                          <SidebarMenuLink
                            item={
                              item as Parameters<
                                typeof SidebarMenuLink
                              >[0]["item"]
                            }
                            pathname={pathname}
                            isCollapsed={isCollapsed}
                          />
                        </SidebarItemWrapper>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}