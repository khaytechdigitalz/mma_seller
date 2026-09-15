import React from "react";
import {
  DashboardGridIcon,
  DeliveryBoxIcon,
  ShoppingCartIcon,
  AnalyticsIcon,
  TransactionIcon,
  CuponPercentIcon,
  StructureIcon,
  CustomerSupportIcon,
  UserIcon, 
  MoneyBagIcon,
  MoneyIcon,
  MoneyExchangeIcon,
  StarIcon,
  InvoiceIcon, 
  StoreIcon,
} from "../../icons";

export type NavItem = {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  category?: string;
  items?: NavItem[];
  subItems?: { label: string; href: string }[];
};

  let storeid = 0;

  try {
    const storedUser = localStorage.getItem("user_info");
    const userInfo = storedUser ? JSON.parse(storedUser) : 0;
    storeid = userInfo?.id ?? 0;
  } catch (error) {
    // Falls back to 0 if localStorage is unavailable (SSR)
    storeid = 0;
  }

export const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: <DashboardGridIcon className="size-5.5" />,
  },
  {
    label: "Category",
    category: "STORE MANAGEMENT",
    items: [
       {
        label: "Manage Store",
        href: "/storefront/details?id=0",
        icon: <StructureIcon className="size-5.5" />,
      },
      {
        label: "Manage Product",
        href: "/products",
        icon: <DeliveryBoxIcon className="size-5.5" />,
        subItems: [
          { label: "All Products", href: "/products" },
          { label: "Add New Product", href: "/products/add" },
          { label: "Bulk Upload Product", href: "/products/bulk" },
          { label: "Draft Products", href: "/products/draft" },
        ],
      },
      {
        label: "Product Review",
        href: "/review",
        icon: <StarIcon className="size-5.5" />,
      },
    ],
  },
  {
    label: "Category",
    category: "ORDER MANAGEMENT",
    items: [
      {
        label: "Orders",
        href: "/orders",
        icon: <ShoppingCartIcon className="size-5.5" />,
      }, 
      {
        label: "Transactions",
        href: "/transactions",
        icon: <TransactionIcon className="size-5.5" />,
      },
    ],
  },
  
  {
    label: "Category",
    category: "REPORTS & ANALYTICS",
    items: [
      {
        label: "Sales reports",
        href: "/sales-reports",
        icon: <InvoiceIcon className="size-5.5" />,
      },
      {
        label: "Grossing Products",
        href: "/top-products",
        icon: <AnalyticsIcon className="size-5.5" />,
      },
    ],
  },
  {
    label: "Category",
    category: "FINANCE MANAGEMENT",
    items: [
      {
        label: "Earning",
        href: "/earning",
        icon: <MoneyIcon className="size-5.5" />,
      },
      {
        label: "Withdraws",
        href: "/withdraws",
        icon: <MoneyBagIcon className="size-5.5" />,
      },
      {
        label: "Refunds",
        href: "/refunds",
        icon: <MoneyExchangeIcon className="size-5.5" />,
      },
    ],
  },
  /*
  {
    label: "Category",
    category: "PROMOTIONAL DEALS",
    items: [
      {
        label: "Coupon",
        href: "/coupon",
        icon: <CuponPercentIcon className="size-5.5" />,
      }, 
    ],
  }, 
  */
  {
    label: "Category",
    category: "HELP & SUPPORT",
    items: [
      {
        label: "Support & Ticket",
        href: "/support",
        icon: <CustomerSupportIcon className="size-5.5" />,
      },
    ],
  },
  {
    label: "Category",
    category: "SECURITY",
    items: [
      {
        label: "Audit Log",
        href: "/auditlog",
        icon: <StoreIcon className="size-5.5" />,
      },
      {
        label: "My Account",
        href: "/account",
        icon: <UserIcon className="size-5.5" />,
      },
    ],
  }
 
];
