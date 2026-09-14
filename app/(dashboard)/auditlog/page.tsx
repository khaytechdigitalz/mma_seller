"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { SearchIcon, Eye } from "@/icons";
import CustomSelect, { Option } from "components/ui/custom-select";
import SearchInput from "components/common/search-input";
import { AuditLogItem, AuditLogResponse } from "types/audit-log";

const actionFilterOptions = [
  { label: "All Actions", value: "all" },
  { label: "Profile Update", value: "update_own_profile" },
  { label: "Product Update", value: "product.update" },
];

const dateSortOptions = [
  { label: "Newest First", value: "desc" },
  { label: "Oldest First", value: "asc" },
];

export interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch?: (value: string) => void;
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    from: 0,
    to: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [actionFilter, setActionFilter] = useState<Option | null>(null);
  const [dateSort, setDateSort] = useState<Option | null>(null);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [activeLogItem, setActiveLogItem] = useState<AuditLogItem | null>(null);

const fetchAuditLogs = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: result } = await apiClient.get<AuditLogResponse>("/audit-logs", {
        params: {
          page,
          search: searchQuery || undefined,
          action: actionFilter?.value !== "all" ? actionFilter?.value : undefined,
          sort: dateSort?.value || undefined,
        },
      });

      if (result.status && result.data) {
        setLogs(result.data.data);
        setPagination({
          currentPage: result.data.current_page,
          lastPage: result.data.last_page,
          total: result.data.total,
          from: result.data.from ?? 0,
          to: result.data.to ?? 0,
        });
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "An unexpected error occurred while loading audit logs."
      );
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, actionFilter, dateSort]);

  useEffect(() => {
    fetchAuditLogs(pagination.currentPage);
  }, [fetchAuditLogs, pagination.currentPage]);

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(logs.map((item) => item.id));
    } else {
      setSelectedRows([]);
    }
  };

  const toggleSelectRow = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedRows((prev) => [...prev, id]);
    } else {
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
    }
  };

  const isAllSelected = logs.length > 0 && selectedRows.length === logs.length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Overview Stat Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Total Audit Logs Recorded
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            {isLoading ? (
              <Skeleton className="h-9 w-16 rounded-md" />
            ) : (
              <span className="text-3xl font-extrabold text-gray-900">
                {pagination.total}
              </span>
            )}
            <span className="text-xs text-green-600 font-medium">System Active</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl w-full border border-gray-100 shadow-sm">
        <div className="p-4 sm:p-6 pb-4">
          <div className="flex items-center justify-between gap-4 mb-4 sm:mb-6">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-light-primary-text">
                Audit Trail Logs
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Monitor user actions, system modifications, and access history.
              </p>
            </div>
            <Button size="xs" disabled={isLoading}>
              Export Logs
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
           <SearchInput
              placeholder="Search action, description, or IP..."
              onSearch={(val: string) => setSearchQuery(val)}
            />
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-[150px]">
                <CustomSelect
                  options={actionFilterOptions}
                  value={actionFilter}
                  onChange={setActionFilter}
                  placeholder="Filter Action"
                />
              </div>
              <div className="min-w-[150px]">
                <CustomSelect
                  options={dateSortOptions}
                  value={dateSort}
                  onChange={setDateSort}
                  placeholder="Sort Date"
                />
              </div>
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50 border-y border-gray-200">
              <TableHead className="w-[50px] pl-6">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={toggleSelectAll}
                  disabled={isLoading || logs.length === 0}
                />
              </TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead className="text-right pr-6">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              /* Table Skeleton Loader */
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index} className="border-b border-gray-100">
                  <TableCell className="pl-6">
                    <Skeleton className="size-4 rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-36" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <Skeleton className="size-8 rounded-full ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-red-500 text-sm">
                  {error}
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500 text-sm">
                  No audit log entries found.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((item) => (
                <TableRow
                  key={item.id}
                  className="border-b last:border-0 border-gray-100 hover:bg-gray-50/50 transition-colors"
                >
                  <TableCell className="pl-6 whitespace-nowrap">
                    <Checkbox
                      checked={selectedRows.includes(item.id)}
                      onCheckedChange={(checked) =>
                        toggleSelectRow(item.id, Boolean(checked))
                      }
                    />
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {item.user?.name || "System"}
                      </span>
                      <span className="text-xs text-gray-400">
                        {item.user?.email || "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      {item.action}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 max-w-[280px] truncate">
                    {item.description}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500 font-mono whitespace-nowrap">
                    {item.ip_address}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                    {formatDate(item.created_at)}
                  </TableCell>
                  <TableCell className="pr-6 text-right whitespace-nowrap">
                    <Button
                      variant="icon"
                      onClick={() => setActiveLogItem(item)}
                      className="group"
                    >
                      <Eye className="size-4 hover:text-primary" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="p-4 sm:p-6 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {isLoading ? (
              <Skeleton className="h-4 w-36" />
            ) : (
              `Showing ${pagination.from} to ${pagination.to} of ${pagination.total} entries`
            )}
          </span>
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.lastPage}
            onPageChange={(page) =>
              setPagination((prev) => ({ ...prev, currentPage: page }))
            }
          />
        </div>
      </div>

      {/* Audit Detail Inspector Drawer / Modal */}
      {activeLogItem && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-end transition-opacity">
          <div className="bg-white w-full max-w-lg h-full p-6 overflow-y-auto flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between border-b pb-4 mb-4">
                <h4 className="font-bold text-lg text-gray-900">
                  Audit Entry #{activeLogItem.id}
                </h4>
                <button
                  onClick={() => setActiveLogItem(null)}
                  className="text-gray-400 hover:text-gray-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-gray-400 font-medium block">Performed By</span>
                  <p className="text-sm font-semibold text-gray-800">
                    {activeLogItem.user?.name} ({activeLogItem.user?.email})
                  </p>
                </div>

                <div>
                  <span className="text-gray-400 font-medium block">Action & Target</span>
                  <p className="font-mono text-blue-600 bg-blue-50 p-2 rounded border border-blue-100 mt-1">
                    {activeLogItem.action}
                  </p>
                </div>

                <div>
                  <span className="text-gray-400 font-medium block">Description</span>
                  <p className="text-gray-700 mt-1">{activeLogItem.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                  <div>
                    <span className="text-gray-400 font-medium block">IP Address</span>
                    <p className="font-mono">{activeLogItem.ip_address}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium block">User Agent</span>
                    <p className="font-mono truncate">{activeLogItem.user_agent}</p>
                  </div>
                </div>

                {activeLogItem.old_values && (
                  <div className="pt-2 border-t">
                    <span className="text-gray-400 font-medium block mb-1">Old Values</span>
                    <pre className="bg-gray-50 p-3 rounded text-[11px] font-mono text-gray-700 overflow-x-auto border">
                      {JSON.stringify(activeLogItem.old_values, null, 2)}
                    </pre>
                  </div>
                )}

                {activeLogItem.new_values && (
                  <div className="pt-2 border-t">
                    <span className="text-gray-400 font-medium block mb-1">New Values</span>
                    <pre className="bg-gray-50 p-3 rounded text-[11px] font-mono text-gray-700 overflow-x-auto border">
                      {JSON.stringify(activeLogItem.new_values, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t mt-6">
              <Button className="w-full" onClick={() => setActiveLogItem(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}