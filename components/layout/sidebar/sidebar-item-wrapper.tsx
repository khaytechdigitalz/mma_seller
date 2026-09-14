import React from "react";
import Tooltip from "@/components/ui/tooltip";

export function SidebarItemWrapper({
  children,
  label,
  isCollapsed,
}: {
  children: React.ReactNode;
  label: string;
  isCollapsed?: boolean;
}) {
  if (isCollapsed) {
    return (
      <Tooltip content={label} side="right">
        {children}
      </Tooltip>
    );
  }
  return <>{children}</>;
}
