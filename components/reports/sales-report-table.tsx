"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { Pagination } from "@/components/ui/pagination";
import { Eye } from "@/icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CustomSelect, { Option } from "../ui/custom-select";
import SearchInput from "../common/search-input";
import { Button } from "../ui/button";
import { TopSellingProduct } from "@/types/sales-report";

interface SalesReportTableProps {
  products?: TopSellingProduct[];
  isLoading?: boolean;
}

const dateOptions: Option[] = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
];

export default function SalesReportTable({
  products = [],
  isLoading,
}: SalesReportTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [dateSort, setDateSort] = useState<Option | null>(null);

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(products.map((item) => String(item.product_id)));
    } else {
      setSelectedRows([]);
    }
  };

  const toggleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRows((prev) => [...prev, id]);
    } else {
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
    }
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(num)) return "₦0";
    
    const formattedNumber = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);

    return `₦${formattedNumber}`;
  };


  const isAllSelected =
    products.length > 0 && selectedRows.length === products.length;

  return (
    <div className="overflow-hidden mt-6">
      <div className="p-4 sm:p-6 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-500/20">
        <SearchInput />
        <div className="flex items-center gap-3">
          <div className="min-w-[120px]">
            <CustomSelect
              options={dateOptions}
              value={dateSort}
              onChange={setDateSort}
              placeholder="Sort By"
            />
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100/50 hover:bg-gray-100/50 border-b border-gray-500/20">
            <TableHead className="w-[50px] pl-6">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={toggleSelectAll}
              />
            </TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead>Unit Price</TableHead>
            <TableHead>Units Sold</TableHead>
            <TableHead>Total Revenue</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                Loading sales report data...
              </TableCell>
            </TableRow>
          ) : products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                No product sales records found.
              </TableCell>
            </TableRow>
          ) : (
            products.map((item) => (
              <TableRow
                key={item.product_id}
                className="border-b last:border-0 border-gray-500/20 hover:bg-gray-50/50"
              >
                <TableCell className="pl-6 whitespace-nowrap">
                  <Checkbox
                    checked={selectedRows.includes(String(item.product_id))}
                    onCheckedChange={(checked) =>
                      toggleSelectRow(String(item.product_id), !!checked)
                    }
                  />
                </TableCell>
                <TableCell className="font-normal text-sm text-light-secondary-text whitespace-nowrap">
                  {item.product.sku}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg overflow-hidden shrink-0 bg-gray-100 relative">
                      {item.product.thumbnail && (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/${item.product.thumbnail}`}
                          alt={item.product.name}
                          width={32}
                          height={32}
                          className="object-cover size-full"
                          unoptimized
                           onError={(e) => {
                            e.currentTarget.src = "/images/customer/user_01.png";
                          }}
                        />
                      )}
                    </div>
                    <span className="text-sm font-normal text-light-primary-text">
                      {item.product.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-light-secondary-text whitespace-nowrap">
                  {formatCurrency(item.product.unit_price)}
                </TableCell>
                <TableCell className="text-sm text-light-secondary-text whitespace-nowrap">
                  {item.total_units_sold}
                </TableCell>
                <TableCell className="text-sm font-semibold text-light-primary-text whitespace-nowrap">
                  {formatCurrency(item.total_revenue)}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <Button
                    variant="icon"
                    href={`/products/${item.product_id}`}
                    className="text-light-secondary-text hover:text-primary transition-colors block w-fit"
                  >
                    <Eye className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="pt-6 border-t border-gray-500/20 flex justify-end">
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(products.length / 5) || 1}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}