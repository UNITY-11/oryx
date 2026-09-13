"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { deleteStaff, fetchStaffPage } from "@/features/staff/api";
import type { Staff } from "@/features/staff/types";
import { useBulkSelectMode } from "@/shared/hooks/use-bulk-select-mode";
import { useBulkSelection } from "@/shared/hooks/use-bulk-selection";
import {
  BulkDeleteToolbar,
  BulkSelectControls,
} from "@/shared/ui/bulk-delete-actions";
import { ListPagination } from "@/shared/ui/list-pagination";
import { Toast, type ToastState } from "@/shared/ui/toast";
import { AlertCircle, Loader2, Search, UserCog } from "lucide-react";

export default function StaffPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [hasPrev, setHasPrev] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const closeToast = useCallback(() => setToast(null), []);

  const selection = useBulkSelection(staffList.map((s) => s.id));
  const select = useBulkSelectMode(selection);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStaffPage({
        q: debouncedSearch,
        page,
        pageSize: 20,
      });
      setStaffList(data.items);
      setTotalItems(data.total);
      setTotalPages(data.totalPages);
      const pageSize = data.pageSize || 20;
      setFrom(data.total === 0 ? 0 : (data.page - 1) * pageSize + 1);
      setTo(Math.min(data.page * pageSize, data.total));
      setHasPrev(data.page > 1);
      setHasNext(data.page < data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load staff");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="flex h-full flex-col space-y-6 md:space-y-8">
      <Toast toast={toast} onClose={closeToast} />
      <div className="border-primary/10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[32px] border bg-white shadow-sm">
        <div className="border-primary/10 z-10 flex shrink-0 flex-col gap-4 border-b p-4 md:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="relative w-full min-w-0 md:max-w-md">
              <Search className="text-primary absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
              <input
                type="search"
                placeholder="Search name, role, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-primary focus:ring-primary text-primary-dark placeholder:text-primary/60 w-full rounded-full border bg-transparent py-3 pr-4 pl-12 transition-colors focus:ring-1 focus:outline-none"
              />
            </div>
            {!loading && staffList.length > 0 && (
              <BulkSelectControls
                selectMode={select.selectMode}
                allSelected={selection.allSelected}
                onSelectToggle={select.toggleSelect}
                onSelectAll={select.selectAll}
              />
            )}
          </div>
        </div>

        {!loading && staffList.length > 0 && (
          <BulkDeleteToolbar
            selection={selection}
            itemIds={staffList.map((s) => s.id)}
            entityLabel="staff members"
            deleteOne={deleteStaff}
            requirePin
            onDeleted={(ids) => {
              setStaffList((prev) => prev.filter((s) => !ids.includes(s.id)));
              setToast({
                type: "success",
                message: `Deleted ${ids.length} staff member(s)`,
              });
            }}
            onClear={select.exit}
            onError={(message) => setToast({ type: "error", message })}
          />
        )}

        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
          {loading ? (
            <div className="text-text-secondary flex items-center justify-center gap-2 py-20 text-sm">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading staff…
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-sm text-red-500">
              <AlertCircle className="h-5 w-5" />
              {error}
              <button
                type="button"
                onClick={load}
                className="text-primary text-xs font-semibold underline"
              >
                Retry
              </button>
            </div>
          ) : staffList.length === 0 ? (
            <div className="text-text-secondary flex flex-col items-center justify-center gap-3 py-20 text-sm">
              <UserCog className="text-primary/40 h-10 w-10" />
              No staff members found.
              <Link
                href="/staff/new"
                className="text-primary text-xs font-semibold underline"
              >
                Add your first staff member
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {staffList.map((member) => {
                const selected = selection.isSelected(member.id);
                return (
                  <div
                    key={member.id}
                    className={`border-primary/10 relative rounded-2xl border bg-[#fcf4f0] p-4 transition-shadow hover:shadow-sm ${
                      selected ? "ring-primary/30 ring-2" : ""
                    }`}
                  >
                    {select.showCheckboxes && (
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => selection.toggle(member.id)}
                        className="accent-primary absolute top-3 right-3 h-4 w-4"
                        aria-label={`Select ${member.name}`}
                      />
                    )}
                    <Link href={`/staff/${member.id}`} className="block pr-6">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 text-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-primary-dark truncate font-semibold">
                            {member.name}
                          </p>
                          <p className="text-text-secondary truncate text-sm">
                            {member.role}
                          </p>
                          <p className="text-text-secondary mt-1 truncate text-xs">
                            {member.phone}
                          </p>
                          <span
                            className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                              member.status === "Active"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {member.status}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {!loading && totalItems > 0 && (
          <ListPagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            from={from}
            to={to}
            hasPrev={hasPrev}
            hasNext={hasNext}
            onPageChange={setPage}
            className="border-primary/10 shrink-0 border-t px-4 py-3 md:px-6"
          />
        )}
      </div>
    </div>
  );
}
