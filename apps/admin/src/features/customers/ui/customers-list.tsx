import Link from "next/link";
import {
  AlertCircle,
  Loader2,
  Mail,
  Phone,
  Search,
  UserCircle2,
} from "lucide-react";
import { Customer, CustomerTier } from "../mock-data";
import { TIER_FILTERS } from "../api/use-customers";

interface CustomersListProps {
  loading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  tierFilter: CustomerTier | "All";
  setTierFilter: (filter: CustomerTier | "All") => void;
  filtered: Customer[];
  activeCount: number;
  inactiveCount: number;
}

export function CustomersList({
  loading,
  error,
  searchQuery,
  setSearchQuery,
  tierFilter,
  setTierFilter,
  filtered,
  activeCount,
  inactiveCount,
}: CustomersListProps) {
  return (
    <div className="flex h-full flex-col space-y-6">
      <div className="border-primary/10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[32px] border bg-white shadow-sm">
        <div className="border-primary/10 flex shrink-0 flex-col items-center justify-between gap-4 border-b p-4 md:flex-row md:p-6">
          <div className="relative w-full shrink-0 md:w-80">
            <Search className="text-primary absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-primary focus:ring-primary text-primary-dark placeholder:text-primary/70 w-full rounded-full border bg-transparent py-3 pr-4 pl-12 text-sm focus:ring-1 focus:outline-none"
            />
          </div>

          <div className="scrollbar-hide flex shrink-0 items-center gap-2 overflow-x-auto pb-1">
            {TIER_FILTERS.map((tier) => (
              <button
                key={tier}
                onClick={() => setTierFilter(tier)}
                className={`rounded-full border px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                  tierFilter === tier
                    ? "bg-primary border-primary text-white shadow-sm"
                    : "text-text-secondary border-primary/10 hover:bg-primary/5 bg-white"
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        <div className="scrollbar-hide flex-1 overflow-auto p-4 md:p-6">
          {loading ? (
            <div className="text-text-secondary flex h-48 flex-col items-center justify-center">
              <Loader2 className="text-primary mb-3 h-8 w-8 animate-spin" />
              <p>Loading customers...</p>
            </div>
          ) : error ? (
            <div className="flex h-48 flex-col items-center justify-center text-red-500">
              <AlertCircle className="mb-3 h-8 w-8" />
              <p>{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-text-secondary flex h-48 flex-col items-center justify-center">
              <UserCircle2 className="text-primary/20 mb-3 h-10 w-10" />
              <p>No customers found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="border-primary/10 overflow-hidden rounded-2xl border">
              <div className="text-text-secondary border-primary/10 grid hidden grid-cols-[auto_1fr_1fr_100px_100px] items-center gap-4 border-b bg-[#fcf4f0] px-6 py-4 text-[10px] tracking-wider uppercase md:grid">
                <span className="w-10"></span>
                <span>Customer</span>
                <span>Contact</span>
                <span>Tier</span>
                <span className="text-right">Total Spent</span>
              </div>

              <div className="divide-primary/5 divide-y">
                {filtered.map((customer) => (
                  <Link
                    key={customer.id}
                    href={`/customers/${customer.id}`}
                    className="hover:bg-primary/5 group grid grid-cols-1 items-center gap-4 px-6 py-4 transition-colors md:grid-cols-[auto_1fr_1fr_100px_100px]"
                  >
                    <div className="bg-primary/10 border-primary/20 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full border font-serif">
                      {customer.avatar ? (
                        <img
                          src={customer.avatar}
                          alt={customer.name}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <span>
                          {customer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .substring(0, 2)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-col">
                      <span className="text-primary-dark group-hover:text-primary truncate text-sm font-semibold transition-colors">
                        {customer.name}
                      </span>
                      <span className="text-text-secondary text-xs">
                        Last visit: {customer.lastVisit}
                      </span>
                    </div>

                    <div className="flex hidden min-w-0 flex-col space-y-1 md:flex">
                      <span className="text-text-secondary flex items-center gap-1.5 truncate text-xs">
                        <Mail className="h-3.5 w-3.5" /> {customer.email}
                      </span>
                      <span className="text-text-secondary flex items-center gap-1.5 truncate text-xs">
                        <Phone className="h-3.5 w-3.5" /> {customer.phone}
                      </span>
                    </div>

                    <div className="hidden md:block">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase ${
                          customer.tier === "Platinum"
                            ? "border-slate-200 bg-slate-100 text-slate-700"
                            : customer.tier === "Gold"
                              ? "border-amber-200 bg-amber-50 text-amber-600"
                              : customer.tier === "Silver"
                                ? "border-gray-200 bg-gray-50 text-gray-500"
                                : "border-orange-200 bg-orange-50 text-orange-700"
                        } `}
                      >
                        {customer.tier}
                      </span>
                    </div>

                    <div className="hidden text-right md:block">
                      <span className="text-primary-dark text-sm font-semibold">
                        QAR {customer.totalSpent}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-primary/5 text-text-secondary flex shrink-0 items-center gap-4 border-t px-6 py-3 text-xs">
          <span className="flex items-center gap-1">
            <UserCircle2 className="text-primary h-3 w-3" />
            {activeCount} Active
          </span>
          <span className="text-red-500">{inactiveCount} Inactive</span>
          <span className="ml-auto">{filtered.length} shown</span>
        </div>
      </div>
    </div>
  );
}
