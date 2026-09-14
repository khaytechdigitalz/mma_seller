"use client";

import {
  Menu as HeadlessMenu,
  MenuButton as HeadlessMenuButton,
  MenuItem as HeadlessMenuItem,
  MenuItems as HeadlessMenuItems,
  MenuButtonProps,
  MenuItemsProps,
  MenuProps,
} from "@headlessui/react";
import { cn } from "@/lib/utils";
import React from "react";

export const Menu = (props: MenuProps) => <HeadlessMenu {...props} />;

export const MenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button">
>(({ className, ...props }, ref) => (
  <HeadlessMenuButton
    ref={ref}
    className={cn("outline-none", className)}
    {...props}
  />
));
MenuButton.displayName = "MenuButton";

export const MenuItems = React.forwardRef<HTMLElement, MenuItemsProps>(
  ({ className, anchor = "bottom end", ...props }, ref) => (
    <HeadlessMenuItems
      ref={ref}
      transition
      anchor={anchor}
      className={cn(
        "w-40 divide-y divide-gray-100 rounded-lg bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-50",
        "transition duration-100 ease-out data-closed:scale-95 data-closed:opacity-0",
        className,
      )}
      {...props}
    />
  ),
);
MenuItems.displayName = "MenuItems";

export const MenuItem = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"button">
>(({ className, ...props }, ref) => (
  <HeadlessMenuItem
    as="button"
    ref={ref}
    className={cn(
      "group flex w-full items-center border-transparent gap-2 rounded-md px-2 py-2 text-sm transition-colors cursor-pointer outline-none",
      "data-focus:bg-gray-200 data-focus:text-light-primary-text text-light-secondary-text",
      className,
    )}
    {...props}
  />
));
MenuItem.displayName = "MenuItem";
