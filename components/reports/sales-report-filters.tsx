"use client";

import React from "react";
import { FilterParams } from "@/types/sales-report";
import CustomSelect, { Option } from "@/components/ui/custom-select";
import { Button } from "@/components/ui/button";

interface SalesReportFiltersProps {
  filters: FilterParams;
  onFilterChange: (newFilters: FilterParams) => void;
  onReset: () => void;
}

const yearOptions: Option[] = [
  { label: "2026", value: "2026" },
  { label: "2025", value: "2025" },
  { label: "2024", value: "2024" },
];

const monthOptions: Option[] = [
  { label: "January", value: "1" },
  { label: "February", value: "2" },
  { label: "March", value: "3" },
  { label: "April", value: "4" },
  { label: "May", value: "5" },
  { label: "June", value: "6" },
  { label: "July", value: "7" },
  { label: "August", value: "8" },
  { label: "September", value: "9" },
  { label: "October", value: "10" },
  { label: "November", value: "11" },
  { label: "December", value: "12" },
];

export default function SalesReportFilters({
  filters,
  onFilterChange,
  onReset,
}: SalesReportFiltersProps) {
  const currentYearOption = yearOptions.find((opt) => opt.value === filters.year) || null;
  const currentMonthOption = monthOptions.find((opt) => opt.value === String(filters.month)) || null;

  return (
    <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-500/20 mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
        {/* Year Filter */}
        <div className="w-full sm:w-36">
          <CustomSelect
            options={yearOptions}
            value={currentYearOption}
            onChange={(selected) =>
              onFilterChange({ 
                ...filters, 
                year: selected ? String(selected.value) : null 
              })
            }
            placeholder="Select Year"
          />
        </div>

        {/* Month Filter */}
        <div className="w-full sm:w-40">
          <CustomSelect
            options={monthOptions}
            value={currentMonthOption}
            onChange={(selected) =>
              onFilterChange({ ...filters, month: selected ? selected.value : null })
            }
            placeholder="Select Month"
          />
        </div>

        {/* Date From */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-semibold text-light-secondary-text shrink-0">From:</label>
          <input
            type="date"
            value={filters.date_from || ""}
            onChange={(e) =>
              onFilterChange({ ...filters, date_from: e.target.value || null })
            }
            className="w-full sm:w-auto h-10 px-3 py-2 text-sm bg-white border border-gray-500/20 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Date To */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-semibold text-light-secondary-text shrink-0">To:</label>
          <input
            type="date"
            value={filters.date_to || ""}
            onChange={(e) =>
              onFilterChange({ ...filters, date_to: e.target.value || null })
            }
            className="w-full sm:w-auto h-10 px-3 py-2 text-sm bg-white border border-gray-500/20 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <Button variant="outline" size="xs" onClick={onReset}>
        Reset Filters
      </Button>
    </div>
  );
}