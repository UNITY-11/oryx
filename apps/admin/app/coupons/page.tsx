"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Scissors, Sparkles, Flower2, Edit2, Trash2, Ticket } from "lucide-react";
import { fetchCoupons, deleteCoupon } from "@/features/coupons/api";
import { Coupon } from "@/features/coupons/types";
import { useSanityListener } from "@/shared/hooks/use-sanity-listener";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

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
            <h2 className="text-xl font-medium text-primary flex items-center gap-2">
              Coupons & Offers
            </h2>
            <p className="text-sm text-text-secondary">Manage promotional banners and discounts.</p>
          </div>
          <Link
            href="/coupons/new"
            className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark mt-4 md:mt-0"
          >
            <Plus className="h-4 w-4" /> Add Coupon
          </Link>
        </div>

        <div className="scrollbar-hide flex-1 overflow-auto p-4 md:p-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-primary/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : coupons.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-primary/20 bg-primary/5 py-24 text-center">
              <Ticket className="mb-4 h-12 w-12 text-primary/40" />
              <h3 className="font-serif text-xl font-medium text-primary-dark">
                No coupons found
              </h3>
              <p className="mt-2 text-sm text-text-secondary max-w-md">
                You haven't created any promotional offers yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {coupons.map((coupon) => (
                <div key={coupon.id} className="relative group border-primary/15 overflow-hidden rounded-2xl border bg-white shadow-md w-full">
                  {/* Actions overlay */}
                  <div className="absolute top-2 right-2 z-30 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100 bg-white/80 backdrop-blur-sm p-1 rounded-full shadow-sm">
                    <Link
                      href={`/coupons/${coupon.id}`}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(coupon.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Inner Dashed container */}
                  <div className="relative m-2 flex items-center justify-between overflow-hidden rounded-xl border-2 border-dashed border-[#c8a24a] p-5 h-[120px]">
                    <div className="bg-primary/20 absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full blur-2xl" />

                    <div className="relative z-10 flex-1 pr-4">
                      <span className="text-primary mb-1 flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase">
                        {getIcon(coupon.icon)} {coupon.type}
                      </span>
                      <h3 className="text-primary mb-0 font-serif text-lg leading-tight line-clamp-2">
                        {coupon.title}
                      </h3>
                    </div>

                    {/* Vertical Dashed separator */}
                    <div className="relative z-10 mx-2 h-full w-px border-l-2 border-dashed border-[#c8a24a]" />

                    <div className="relative z-10 flex flex-col items-center justify-center pl-3 pr-1 text-center min-w-[80px]">
                      <p className="text-text-secondary mb-1 text-[9px] font-bold tracking-wider uppercase">
                        Use Code
                      </p>
                      <strong className="text-primary border-primary/20 inline-block rounded-md border bg-[#fcf4f0] px-3 py-1.5 font-mono text-sm tracking-wider shadow-sm truncate max-w-[100px]">
                        {coupon.code}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
