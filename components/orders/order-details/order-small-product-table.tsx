"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderItem } from "@/types/order";
import { Badge } from "@/components/ui/badge"; 
interface OrderSmallProductTableProps {
  items: OrderItem[];
  onUpdateItemStatus?: (item: OrderItem) => void;
}


  const formatCurrency = (sales: string | number) => {
    const num = typeof sales === "string" ? parseFloat(sales) : sales;
    if (isNaN(num)) return "₦0";
    
    const formattedNumber = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);

    return `₦${formattedNumber}`;
  };

export default function OrderSmallProductTable({
  items,
  onUpdateItemStatus,
}: OrderSmallProductTableProps) {
  return (
    <div className="w-full overflow-hidden border border-gray-500/20 rounded-2xl">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100 hover:bg-gray-100 border-b border-gray-500/20">
            <TableHead className="pl-6">Product Name</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="pr-6">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                No items in this order.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => {
              const product = item.product;
              const thumbnail = product?.thumbnail;
              const imageSrc = thumbnail
                ? thumbnail.startsWith("http")
                  ? thumbnail
                  : `${process.env.NEXT_PUBLIC_STORAGE_URL || ""}/${thumbnail}`
                : "/images/placeholder.png";

              return (
                <TableRow
                  key={item.id}
                  className="border-b last:border-0 border-gray-500/20 hover:bg-gray-50/50"
                >
                  <TableCell className="pl-6 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg shrink-0 relative overflow-hidden bg-gray-100">
                        <Image
                          src={imageSrc}
                          alt={item.product_name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-light-primary-text max-w-[200px] truncate">
                          {item.product?.name}
                        </p>
                        <p className="text-xs text-light-secondary-text">
                          ID: #{item.product_id}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap py-2 text-light-secondary-text">
                    {item.product?.sku || "N/A"}
                  </TableCell>


                  <TableCell className="text-sm whitespace-nowrap py-2 text-light-secondary-text">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap py-2 font-medium text-light-primary-text">
                    {formatCurrency(item.total_price)}
                  </TableCell>

                  <TableCell className="text-sm whitespace-nowrap py-2 text-light-secondary-text">
                  <Badge
                    variant={item.delivery_status === "delivered" ? "success" : "default"}
                    className="capitalize text-xs font-semibold"
                  >
                    {item.delivery_status?.replace("_", " ") || "N/A"}
                  </Badge>
                </TableCell>

                  <TableCell className="pr-6 py-2 whitespace-nowrap">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => onUpdateItemStatus?.(item)}
                    >
                      Update Status
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}