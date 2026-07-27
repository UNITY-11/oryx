"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { deleteCoupon, fetchCoupons } from "@/features/coupons/api";
import { Coupon } from "@/features/coupons/types";
import { useSanityListener } from "@/shared/hooks/use-sanity-listener";
import { ListPagination, usePagination } from "@/shared/ui/list-pagination";
import {
  Edit2,
  Flower2,
  Plus,
  Scissors,
  Sparkles,
  Ticket,
  Trash2,
} from "lucide-react";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    page,
    setPage,
    totalPages,
    totalItems,
    paginatedItems,
    from,
    to,
    hasPrev,
    hasNext,
  } = usePagination(coupons, 20);

  const loadCoupons = async () => {
    try {
      const data = await fetchCoupons();
      setCoupons(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  useSanityListener('*[_type == "coupon"]', loadCoupons);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this coupon?")) {
      try {
        await deleteCoupon(id);
        setCoupons((prev) => prev.filter((c) => c.id !== id));
      } catch (err) {
        console.error("Failed to delete coupon:", err);
      }
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Scissors":
        return <Scissors className="h-4 w-4" />;
      case "Sparkles":
        return <Sparkles className="h-4 w-4" />;
      case "Flower2":
        return <Flower2 className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex h-full flex-col space-y-6">
      <div className="border-primary/10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[32px] border bg-white shadow-sm">
        <div className="border-primary/10 flex shrink-0 flex-col items-center justify-between border-b p-4 md:flex-row md:p-6">
          <div>
            <h2 className="text-primary flex items-center gap-2 text-xl font-medium">
              Coupons & Offers
            </h2>
            <p className="text-text-secondary text-sm">
              Manage promotional banners and discounts.
            </p>
          </div>
          <Link
            href="/coupons/new"
            className="bg-primary hover:bg-primary-dark mt-4 flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-colors md:mt-0"
          >
            <Plus className="h-4 w-4" /> Add Coupon
          </Link>
        </div>

        <div className="scrollbar-hide flex-1 overflow-auto p-4 md:p-6">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-primary/5 h-32 animate-pulse rounded-2xl"
                />
              ))}
            </div>
          ) : totalItems === 0 ? (
            <div className="border-primary/20 bg-primary/5 flex flex-col items-center justify-center rounded-3xl border border-dashed py-24 text-center">
              <Ticket className="text-primary/40 mb-4 h-12 w-12" />
              <h3 className="text-primary-dark font-serif text-xl font-medium">
                No coupons found
              </h3>
              <p className="text-text-secondary mt-2 max-w-md text-sm">
                You haven't created any promotional offers yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {paginatedItems.map((coupon) => (
                <div
                  key={coupon.id}
                  className="group border-primary/15 relative w-full overflow-hidden rounded-2xl border bg-white shadow-md"
                >
                  {/* Actions overlay */}
                  <div className="absolute top-2 right-2 z-30 flex gap-2 rounded-full bg-white/80 p-1 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100">
                    <Link
                      href={`/coupons/${coupon.id}`}
                      className="text-primary hover:bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(coupon.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Inner Dashed container */}
                  <div className="relative m-2 flex h-[120px] items-center justify-between overflow-hidden rounded-xl border-2 border-dashed border-[#c8a24a] p-5">
                    <div className="bg-primary/20 absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full blur-2xl" />

                    <div className="relative z-10 flex-1 pr-4">
                      <span className="text-primary mb-1 flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase">
                        {getIcon(coupon.icon)} {coupon.type}
                      </span>
                      <h3 className="text-primary mb-0 line-clamp-2 font-serif text-lg leading-tight">
                        {coupon.title}
                      </h3>
                    </div>

                    {/* Vertical Dashed separator */}
                    <div className="relative z-10 mx-2 h-full w-px border-l-2 border-dashed border-[#c8a24a]" />

                    <div className="relative z-10 flex min-w-[80px] flex-col items-center justify-center pr-1 pl-3 text-center">
                      <p className="text-text-secondary mb-1 text-[9px] font-bold tracking-wider uppercase">
                        Use Code
                      </p>
                      <strong className="text-primary border-primary/20 inline-block max-w-[100px] truncate rounded-md border bg-[#fcf4f0] px-3 py-1.5 font-mono text-sm tracking-wider shadow-sm">
                        {coupon.code}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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
      </div>
    </div>
  );
}
