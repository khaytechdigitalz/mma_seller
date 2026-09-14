"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  seller_id: number;
  product_name: string;
  sku: string;
  unit_price: string;
  quantity: number;
  tax: string;
  discount: string;
  total_price: string;
  delivery_status: string;
  product?: {
    id: number;
    name: string;
    sku: string;
  };
}

interface Props {
  items: OrderItem[];
}

export default function RefundProductTable({ items }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-500/20 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-500/20">
        <h3 className="text-lg font-bold text-light-primary-text">
          Order Items Affected
        </h3>
      </div>

      {items.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-500">
          No order items associated with this refund.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 hover:bg-gray-100 border-b border-gray-500/20">
              <TableHead className="pl-6">Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead className="text-center">Qty</TableHead>
              <TableHead>Delivery Status</TableHead>
              <TableHead className="pr-6 text-right">Total Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow
                key={item.id}
                className="border-b last:border-0 border-gray-500/20 hover:bg-gray-50/50"
              >
                <TableCell className="pl-6 font-medium text-gray-900 whitespace-nowrap">
                  {item.product?.name || item.product_name}
                </TableCell>
                <TableCell className="font-mono text-xs text-gray-500 whitespace-nowrap">
                  {item.sku}
                </TableCell>
                <TableCell className="text-sm text-gray-700 whitespace-nowrap">
                  ₦{Number(item.unit_price).toLocaleString()}
                </TableCell>
                <TableCell className="text-sm font-semibold text-center whitespace-nowrap">
                  {item.quantity}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <Badge variant="info">
                    {item.delivery_status}
                  </Badge>
                </TableCell>
                <TableCell className="pr-6 text-right font-semibold text-gray-900 whitespace-nowrap">
                  ₦{Number(item.total_price).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}