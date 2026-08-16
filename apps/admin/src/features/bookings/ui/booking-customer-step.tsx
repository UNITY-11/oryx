"use client";

import { useEffect, useState } from "react";
import { PhoneInput } from "@/shared/ui/phone-input";
import { Check, Loader2, Search, UserPlus, Users } from "lucide-react";

import { fetchCustomersPage } from "../../customers/api";
import type { Customer } from "../../customers/types";

type CustomerMode = "existing" | "new";

interface BookingCustomerStepProps {
  customerName: string;
  setCustomerName: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
}

function canSearchCustomers(query: string): boolean {
  const trimmed = query.trim();
  if (!trimmed) return false;
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length >= 3) return true;
  return trimmed.replace(/\d/g, "").trim().length >= 2;
}

export function BookingCustomerStep({
  customerName,
  setCustomerName,
  phone,
  setPhone,
}: BookingCustomerStepProps) {
  const [mode, setMode] = useState<CustomerMode>("existing");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [results, setResults] = useState<Customer[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const activeQuery = canSearchCustomers(debouncedSearch)
    ? debouncedSearch.trim()
    : "";

  useEffect(() => {
    if (mode !== "existing" || !activeQuery) {
      setResults([]);
      setSearchError(null);
      setSearchLoading(false);
      return;
    }

    let cancelled = false;
    setSearchLoading(true);
    setSearchError(null);

    fetchCustomersPage({ q: activeQuery, page: 1, pageSize: 8 })
      .then((res) => {
        if (!cancelled) setResults(res.items);
      })
      .catch((err) => {
        if (!cancelled) {
          setResults([]);
          setSearchError(
            err instanceof Error ? err.message : "Failed to search customers"
          );
        }
      })
      .finally(() => {
        if (!cancelled) setSearchLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mode, activeQuery]);

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomerId(customer.id);
    setCustomerName(customer.name);
    setPhone(customer.phone);
    setSearchQuery("");
    setResults([]);
  };

  const clearSelection = () => {
    setSelectedCustomerId(null);
    setCustomerName("");
    setPhone("");
    setSearchQuery("");
    setResults([]);
  };

  const switchMode = (next: CustomerMode) => {
    setMode(next);
    setSearchError(null);
    setResults([]);
    if (next === "new") {
      setSelectedCustomerId(null);
      setSearchQuery("");
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-5">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => switchMode("existing")}
          className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-sm font-medium transition-colors ${
            mode === "existing"
              ? "border-primary bg-primary/10 text-primary-dark"
              : "border-primary/10 text-text-secondary hover:border-primary/30 bg-white"
          }`}
        >
          <Users className="h-4 w-4 shrink-0" />
          Find existing
        </button>
        <button
          type="button"
          onClick={() => switchMode("new")}
          className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-sm font-medium transition-colors ${
            mode === "new"
              ? "border-primary bg-primary/10 text-primary-dark"
              : "border-primary/10 text-text-secondary hover:border-primary/30 bg-white"
          }`}
        >
          <UserPlus className="h-4 w-4 shrink-0" />
          New customer
        </button>
      </div>

      {mode === "existing" ? (
        <div className="space-y-4">
          {selectedCustomerId ? (
            <div className="border-primary/20 bg-primary/5 flex items-start justify-between gap-3 rounded-2xl border p-4">
              <div className="min-w-0">
                <p className="text-primary-dark truncate font-medium">
                  {customerName}
                </p>
                <p className="text-text-secondary mt-0.5 text-sm">{phone}</p>
                <p className="text-primary mt-2 flex items-center gap-1 text-xs font-medium">
                  <Check className="h-3.5 w-3.5" />
                  Customer selected
                </p>
              </div>
              <button
                type="button"
                onClick={clearSelection}
                className="text-primary shrink-0 text-sm font-medium hover:underline"
              >
                Change
              </button>
            </div>
          ) : (
            <>
              <div>
                <label className="text-primary-dark mb-1.5 block text-sm font-medium">
                  Search by name or number
                </label>
                <div className="relative">
                  <Search className="text-text-secondary absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-primary/10 focus:border-primary/30 w-full rounded-2xl border bg-gray-50 py-3 pr-4 pl-9 text-sm shadow-sm transition-colors focus:bg-white focus:outline-none"
                    placeholder="Name or phone number"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="border-primary/10 rounded-2xl border bg-white shadow-sm">
                {searchLoading ? (
                  <div className="text-text-secondary flex items-center justify-center gap-2 py-8 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching...
                  </div>
                ) : searchError ? (
                  <p className="px-4 py-6 text-center text-sm text-red-500">
                    {searchError}
                  </p>
                ) : !activeQuery ? (
                  <p className="text-text-secondary px-4 py-6 text-center text-sm">
                    Type a name (2+ letters) or phone number (3+ digits) to
                    search.
                  </p>
                ) : results.length === 0 ? (
                  <p className="text-text-secondary px-4 py-6 text-center text-sm">
                    No customers found. Try another search or add a new
                    customer.
                  </p>
                ) : (
                  <ul className="divide-primary/10 divide-y">
                    {results.map((customer) => (
                      <li key={customer.id}>
                        <button
                          type="button"
                          onClick={() => selectCustomer(customer)}
                          className="hover:bg-primary/5 flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="text-primary-dark truncate text-sm font-medium">
                              {customer.name}
                            </p>
                            <p className="text-text-secondary truncate text-xs">
                              {customer.phone || "No phone"}
                            </p>
                          </div>
                          <span className="text-primary shrink-0 text-xs font-medium">
                            Select
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <label className="text-primary-dark mb-1.5 block text-sm font-medium">
              Customer Name
            </label>
            <input
              required
              type="text"
              value={customerName}
              onChange={(e) => {
                const val = e.target.value.replace(/[0-9]/g, "");
                setCustomerName(val);
              }}
              className="border-primary/10 focus:border-primary/30 w-full rounded-2xl border bg-gray-50 px-4 py-3 shadow-sm transition-colors focus:bg-white focus:outline-none"
              placeholder="e.g. Sarah Smith"
            />
          </div>
          <div>
            <label className="text-primary-dark mb-1.5 block text-sm font-medium">
              Phone Number
            </label>
            <PhoneInput
              value={phone}
              onChange={setPhone}
              placeholder="5555 0000"
            />
          </div>
        </div>
      )}
    </div>
  );
}
