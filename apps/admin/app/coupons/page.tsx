"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { deleteCoupon, fetchCouponsPage } from "@/features/coupons/api";
import { Coupon } from "@/features/coupons/types";
import { usePaginatedList } from "@/shared/hooks/use-paginated-list";
import { useSanityListener } from "@/shared/hooks/use-sanity-listener";
import { ListPagination } from "@/shared/ui/list-pagination";
import { Toast, type ToastState } from "@/shared/ui/toast";
import {
  AlertCircle,
  Edit2,
  Flower2,
  Gift,
  Heart,
  Loader2,
  Plus,
  Scissors,
  Search,
  Sparkles,
  Star,
  Ticket,
  Trash2,
} from "lucide-react";

function getIcon(iconName: string) {
  switch (iconName) {
    case "Scissors":
      return <Scissors className="h-4 w-4" />;
    case "Sparkles":
      return <Sparkles className="h-4 w-4" />;
    case "Flower2":
      return <Flower2 className="h-4 w-4" />;
    case "Heart":
      return <Heart className="h-4 w-4" />;
    case "Star":
      return <Star className="h-4 w-4" />;
    case "Gift":
      return <Gift className="h-4 w-4" />;
    default:
      return <Sparkles className="h-4 w-4" />;
  }
}

export default function CouponsPage() {
  const fetchPage = useCallback(
    (params: { q: string; page: number; pageSize: number }) =>
      fetchCouponsPage({
        q: params.q,
        page: params.page,
        pageSize: params.pageSize,
      }),
    []
  );

  const {
    items: coupons,
    setItems: setCoupons,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    totalPages,
    totalItems,
    from,
    to,
    hasPrev,
    hasNext,
    reload: loadCoupons,
  } = usePaginatedList(fetchPage);

  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const closeToast = useCallback(() => setToast(null), []);

  useSanityListener('*[_type == "coupon"]', loadCoupons);

  const hasSearch = Boolean(searchQuery.trim());

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsProcessing(deleteTarget.id);
      await deleteCoupon(deleteTarget.id);
      setCoupons((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setToast({ type: "success", message: "Coupon deleted successfully" });
      setDeleteTarget(null);
    } catch (err) {
      setToast({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to delete coupon",
      });
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <Toast toast={toast} onClose={closeToast} />

      <div className="border-primary/10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] border bg-white shadow-sm sm:rounded-[32px]">
        <div className="border-primary/10 flex shrink-0 flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 md:p-6">
          <div className="min-w-0">
            <h2 className="text-primary-dark font-serif text-xl font-medium sm:text-2xl">
              Coupons & Offers
            </h2>
            <p className="text-text-secondary mt-0.5 text-sm">
              Manage promotional banners and discount codes.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-56">
              <Search className="text-primary absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search coupons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-primary focus:ring-primary text-primary-dark placeholder:text-primary/70 w-full rounded-full border bg-transparent py-2.5 pr-4 pl-10 text-sm focus:ring-1 focus:outline-none"
              />
            </div>
            <Link
              href="/coupons/new"
              className="bg-primary hover:bg-primary-dark inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold text-white transition-colors sm:h-10 sm:w-auto"
            >
              <Plus className="h-4 w-4" /> Add Coupon
            </Link>
          </div>
        </div>

        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          {loading ? (
            <div className="text-text-secondary flex h-56 flex-col items-center justify-center px-4 text-center">
              <Loader2 className="text-primary mb-3 h-8 w-8 animate-spin" />
              <p className="text-sm font-medium">Loading coupons...</p>
            </div>
          ) : error ? (
            <div className="flex h-56 flex-col items-center justify-center px-4 text-center">
              <AlertCircle className="mb-3 h-8 w-8 text-red-500" />
              <p className="text-sm font-semibold text-red-600">
                Couldn&apos;t load coupons
              </p>
              <p className="text-text-secondary mt-1 max-w-sm text-xs">
                {error}
              </p>
              <button
                type="button"
                onClick={loadCoupons}
                className="bg-primary mt-4 rounded-full px-5 py-2 text-xs font-semibold text-white shadow-sm"
              >
                Try again
              </button>
            </div>
          ) : totalItems === 0 ? (
            <div className="border-primary/15 flex h-56 flex-col items-center justify-center rounded-2xl border border-dashed bg-[#fcf4f0]/40 px-4 text-center sm:rounded-3xl">
              <Ticket className="text-primary/30 mb-3 h-10 w-10" />
              <p className="text-primary-dark text-sm font-semibold">
                {hasSearch ? "No matching coupons" : "No coupons yet"}
              </p>
              <p className="text-text-secondary mt-1 max-w-sm text-xs">
                {hasSearch
                  ? "Try a different search term."
                  : "Create your first promotional offer to display on the site."}
              </p>
              {!hasSearch && (
                <Link
                  href="/coupons/new"
                  className="bg-primary mt-4 inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-semibold text-white shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Coupon
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="border-primary/15 relative w-full overflow-hidden rounded-2xl border bg-white shadow-sm"
                >
                  <div className="absolute top-2 right-2 z-20 flex gap-1.5 rounded-full bg-white/90 p-1 shadow-sm backdrop-blur-sm">
                    <Link
                      href={`/coupons/${coupon.id}`}
                      className="text-primary hover:bg-primary/10 flex h-9 w-9 items-center justify-center rounded-full transition-colors"
                      aria-label="Edit coupon"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(coupon)}
                      disabled={isProcessing === coupon.id}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
                      aria-label="Delete coupon"
                    >
                      {isProcessing === coupon.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <div className="relative m-2 flex min-h-[120px] items-center justify-between overflow-hidden rounded-xl border-2 border-dashed border-[#c8a24a] p-4 sm:p-5">
                    <div className="bg-primary/20 absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full blur-2xl" />

                    <div className="relative z-10 min-w-0 flex-1 pr-3">
                      <span className="text-primary mb-1 flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase">
                        {getIcon(coupon.icon)} {coupon.type}
                      </span>
                      <h3 className="text-primary line-clamp-2 font-serif text-base leading-tight sm:text-lg">
                        {coupon.title}
                      </h3>
                    </div>

                    <div className="relative z-10 mx-1 h-full w-px shrink-0 border-l-2 border-dashed border-[#c8a24a] sm:mx-2" />

                    <div className="relative z-10 flex min-w-[72px] shrink-0 flex-col items-center justify-center pl-2 text-center sm:min-w-[80px] sm:pl-3">
                      <p className="text-text-secondary mb-1 text-[9px] font-bold tracking-wider uppercase">
                        Use Code
                      </p>
                      <strong className="text-primary border-primary/20 inline-block max-w-[100px] truncate rounded-md border bg-[#fcf4f0] px-2.5 py-1.5 font-mono text-xs tracking-wider shadow-sm sm:px-3 sm:text-sm">
                        {coupon.code}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!loading && !error && totalItems > 0 && (
          <ListPagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            from={from}
            to={to}
            hasPrev={hasPrev}
            hasNext={hasNext}
            onPageChange={setPage}
          />
        )}
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="border-primary/10 w-full max-w-md rounded-t-[28px] border bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6">
            <div className="mb-3 flex items-center gap-3 sm:mb-4">
              <div className="bg-primary/10 text-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-full">
                <Trash2 className="h-5 w-5" />
              </div>
              <h3 className="text-primary-dark font-serif text-lg font-semibold">
                Delete Coupon
              </h3>
            </div>
            <p className="text-text-secondary mb-6 text-sm leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="text-primary-dark font-semibold">
                {deleteTarget.title}
              </span>{" "}
              ({deleteTarget.code})? This cannot be undone.
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="border-primary/20 text-primary hover:bg-primary/5 h-11 flex-1 rounded-full border text-sm font-semibold transition-colors"
                disabled={isProcessing === deleteTarget.id}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isProcessing === deleteTarget.id}
                className="bg-primary flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isProcessing === deleteTarget.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
