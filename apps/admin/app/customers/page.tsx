"use client";

import { useState } from "react";
import { Search, UserCircle2, Mail, Phone, Plus } from "lucide-react";
import Link from "next/link";
import { MOCK_CUSTOMERS, Customer, CustomerTier } from "../../src/features/customers/mock-data";

const TIER_FILTERS: Array<CustomerTier | "All"> = ["All", "Platinum", "Gold", "Silver", "Bronze"];

export default function CustomersPage() {
  const [customers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<CustomerTier | "All">("All");

  const filtered = customers
    .filter((c) => tierFilter === "All" || c.tier === tierFilter)
    .filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery)
    );

  const activeCount = customers.filter((c) => c.status === "Active").length;
  const inactiveCount = customers.filter((c) => c.status === "Inactive").length;

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="bg-white rounded-[32px] border border-primary/10 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">

        {/* Top Bar */}
        <div className="p-4 md:p-6 border-b border-primary/10 flex flex-col md:flex-row gap-4 justify-between items-center shrink-0">
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-transparent border border-primary rounded-full focus:outline-none focus:ring-1 focus:ring-primary text-primary-dark placeholder:text-primary/70 text-sm"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide shrink-0">
            {TIER_FILTERS.map((tier) => (
              <button
                key={tier}
                onClick={() => setTierFilter(tier)}
                className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                  tierFilter === tier
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-white text-text-secondary border-primary/10 hover:bg-primary/5"
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        {/* Customers List */}
        <div className="overflow-auto scrollbar-hide flex-1 p-4 md:p-6">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-text-secondary">
              <UserCircle2 className="w-10 h-10 mb-3 text-primary/20" />
              <p>No customers found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-primary/10 overflow-hidden">
              <div className="grid grid-cols-[auto_1fr_1fr_100px_100px] gap-4 bg-[#fcf4f0] text-[10px] uppercase tracking-wider text-text-secondary px-6 py-4 border-b border-primary/10 items-center hidden md:grid">
                <span className="w-10"></span>
                <span>Customer</span>
                <span>Contact</span>
                <span>Tier</span>
                <span className="text-right">Total Spent</span>
              </div>
              
              <div className="divide-y divide-primary/5">
                {filtered.map((customer) => (
                  <Link
                    key={customer.id}
                    href={`/customers/${customer.id}`}
                    className="grid grid-cols-1 md:grid-cols-[auto_1fr_1fr_100px_100px] gap-4 items-center px-6 py-4 hover:bg-primary/5 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary font-serif">
                      {customer.avatar ? (
                        <img src={customer.avatar} alt={customer.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span>{customer.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-primary-dark truncate group-hover:text-primary transition-colors">{customer.name}</span>
                      <span className="text-xs text-text-secondary">Last visit: {customer.lastVisit}</span>
                    </div>

                    <div className="flex flex-col space-y-1 min-w-0 hidden md:flex">
                      <span className="text-xs text-text-secondary flex items-center gap-1.5 truncate"><Mail className="w-3.5 h-3.5" /> {customer.email}</span>
                      <span className="text-xs text-text-secondary flex items-center gap-1.5 truncate"><Phone className="w-3.5 h-3.5" /> {customer.phone}</span>
                    </div>

                    <div className="hidden md:block">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border
                        ${customer.tier === 'Platinum' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                          customer.tier === 'Gold' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                          customer.tier === 'Silver' ? 'bg-gray-50 text-gray-500 border-gray-200' :
                          'bg-orange-50 text-orange-700 border-orange-200'
                        }
                      `}>
                        {customer.tier}
                      </span>
                    </div>

                    <div className="text-right hidden md:block">
                      <span className="text-sm font-semibold text-primary-dark">QAR {customer.totalSpent}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="px-6 py-3 border-t border-primary/5 shrink-0 flex items-center gap-4 text-xs text-text-secondary">
          <span className="flex items-center gap-1">
            <UserCircle2 className="w-3 h-3 text-primary" />
            {activeCount} Active
          </span>
          <span className="text-red-500">{inactiveCount} Inactive</span>
          <span className="ml-auto">{filtered.length} shown</span>
        </div>
      </div>
    </div>
  );
}
