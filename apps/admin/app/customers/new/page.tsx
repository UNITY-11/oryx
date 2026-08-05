"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneInput } from "@/shared/ui/phone-input";
import { MobileMenuButton } from "@/shared/ui/sidebar-context";
import { Toast, type ToastState } from "@/shared/ui/toast";
import { createCustomer } from "@features/customers/api";
import { CustomerTier } from "@features/customers/types";
import {
  hasCustomerFieldErrors,
  validateCustomer,
  type CustomerFieldErrors,
  type CustomerFormData,
} from "@features/customers/validation";
import { ArrowLeft, Check, ChevronDown, Loader2, Save } from "lucide-react";

const TIERS: CustomerTier[] = ["Bronze", "Silver", "Gold", "Platinum"];

const DEFAULT_STATE: CustomerFormData = {
  name: "",
  email: "",
  phone: "",
  avatar: null,
  tier: "Bronze",
  status: "Active",
};

const inputClass =
  "border-primary/40 focus:border-primary text-primary-dark placeholder:text-primary/30 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm focus:outline-none disabled:opacity-60";
const inputErrorClass = "border-red-400 focus:border-red-500";
const labelClass =
  "text-text-secondary mb-2 block text-xs font-semibold tracking-wider uppercase";
const errorClass = "mt-1.5 text-xs font-medium text-red-500";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className={errorClass}>{message}</p>;
}

function TierDropdown({
  value,
  onChange,
  disabled,
  hasError,
}: {
  value: CustomerTier;
  onChange: (v: CustomerTier) => void;
  disabled?: boolean;
  hasError?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    const handleScroll = () => setOpen(false);
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={`${inputClass} flex items-center justify-between ${hasError ? inputErrorClass : ""}`}
      >
        <span>{value}</span>
        <ChevronDown
          className={`text-primary/60 h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="border-primary/10 absolute top-full right-0 left-0 z-20 mt-2 overflow-hidden rounded-2xl border bg-white shadow-xl">
          {TIERS.map((tier) => (
            <button
              key={tier}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(tier);
                setOpen(false);
              }}
              className={`hover:bg-primary/5 flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors ${tier === value ? "text-primary font-medium" : "text-primary-dark"}`}
            >
              <span>{tier}</span>
              {tier === value && <Check className="text-primary h-4 w-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NewCustomerPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerFormData>(DEFAULT_STATE);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<CustomerFieldErrors>({});
  const [toast, setToast] = useState<ToastState>(null);
  const closeToast = useCallback(() => setToast(null), []);

  const update = <K extends keyof CustomerFormData>(
    key: K,
    value: CustomerFormData[K]
  ) => {
    setCustomer((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key as keyof CustomerFieldErrors]) return prev;
      const next = { ...prev };
      delete next[key as keyof CustomerFieldErrors];
      return next;
    });
  };

  const handleCreate = async () => {
    const errors = validateCustomer(customer);
    if (hasCustomerFieldErrors(errors)) {
      setFieldErrors(errors);
      setToast({ type: "error", message: "Please fix the highlighted fields" });
      return;
    }

    setSaving(true);
    try {
      await createCustomer({
        ...customer,
        name: customer.name.trim(),
        email: customer.email.trim(),
        phone: customer.phone.trim(),
        avatar: null,
        totalSpent: 0,
        lastVisit: new Date().toISOString().slice(0, 10),
      });
      setToast({ type: "success", message: "Customer created successfully" });
      setTimeout(() => router.push("/customers"), 900);
    } catch (err) {
      setToast({
        type: "error",
        message:
          err instanceof Error ? err.message : "Failed to create customer",
      });
      setSaving(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden pt-4">
      <Toast toast={toast} onClose={closeToast} />

      <div className="border-primary/10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-white shadow-sm sm:rounded-[32px]">
        <div className="border-primary/10 flex shrink-0 flex-col gap-3 border-b px-3 py-3 sm:px-4 sm:py-4 md:flex-row md:items-center md:justify-between md:px-6 md:py-5 lg:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <MobileMenuButton className="-ml-0" />
            <button
              type="button"
              onClick={() => router.push("/customers")}
              className="border-primary/10 text-primary hover:bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-[#fcf4f0] transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-primary-dark truncate font-serif text-base font-medium sm:text-xl">
                New Customer
              </h1>
              <p className="text-text-secondary truncate text-[11px] sm:text-xs">
                Add a client to the directory
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() =>
                update(
                  "status",
                  customer.status === "Active" ? "Inactive" : "Active"
                )
              }
              disabled={saving}
              className={`rounded-full border px-3 py-2 text-[10px] font-bold tracking-wider uppercase transition-colors sm:px-4 sm:text-xs ${
                customer.status === "Active"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-gray-200 bg-gray-100 text-gray-500"
              }`}
            >
              {customer.status}
            </button>

            <button
              type="button"
              onClick={handleCreate}
              disabled={saving}
              className="bg-primary inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60 sm:px-5 sm:text-sm"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{saving ? "Creating…" : "Create Customer"}</span>
            </button>
          </div>
        </div>

        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="mx-auto max-w-3xl space-y-5 sm:space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Full Name *</label>
                <input
                  value={customer.name}
                  disabled={saving}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className={`${inputClass} text-base font-medium ${fieldErrors.name ? inputErrorClass : ""}`}
                />
                <FieldError message={fieldErrors.name} />
              </div>
              <div>
                <label className={labelClass}>Tier *</label>
                <TierDropdown
                  value={customer.tier}
                  disabled={saving}
                  hasError={Boolean(fieldErrors.tier)}
                  onChange={(v) => update("tier", v)}
                />
                <FieldError message={fieldErrors.tier} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>
                  Email{" "}
                  <span className="font-normal text-gray-400 normal-case">
                    (Optional)
                  </span>
                </label>
                <input
                  type="email"
                  value={customer.email}
                  disabled={saving}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="jane@example.com"
                  className={`${inputClass} ${fieldErrors.email ? inputErrorClass : ""}`}
                />
                <FieldError message={fieldErrors.email} />
              </div>
              <div>
                <label className={labelClass}>Phone Number *</label>
                <PhoneInput
                  value={customer.phone}
                  disabled={saving}
                  onChange={(phone) => update("phone", phone)}
                  hasError={Boolean(fieldErrors.phone)}
                  placeholder="5555 0000"
                />
                <FieldError message={fieldErrors.phone} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
