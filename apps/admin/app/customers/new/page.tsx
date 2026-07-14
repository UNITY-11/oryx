"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Upload, Save, UserCircle2, ChevronDown, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { CustomerTier } from "../../../src/features/customers/mock-data";

const TIERS: CustomerTier[] = ["Bronze", "Silver", "Gold", "Platinum"];

interface NewCustomerState {
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  tier: CustomerTier;
  status: "Active" | "Inactive";
}

const DEFAULT_STATE: NewCustomerState = {
  name: "",
  email: "",
  phone: "",
  avatar: null,
  tier: "Bronze",
  status: "Active",
};

function TierDropdown({
  value,
  onChange,
}: {
  value: CustomerTier;
  onChange: (v: CustomerTier) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
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
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border border-primary/40 bg-transparent hover:border-primary focus:outline-none focus:border-primary text-primary-dark text-sm transition-colors"
      >
        <span>{value}</span>
        <ChevronDown className={`w-4 h-4 text-primary/60 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-primary/10 rounded-2xl shadow-xl z-20 overflow-hidden">
          {TIERS.map((tier) => (
            <button
              key={tier}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(tier); setOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm text-left hover:bg-primary/5 transition-colors ${tier === value ? "text-primary font-medium" : "text-primary-dark"}`}
            >
              <span>{tier}</span>
              {tier === value && <Check className="w-4 h-4 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NewCustomerPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customer, setCustomer] = useState<NewCustomerState>(DEFAULT_STATE);
  const [saved, setSaved] = useState(false);

  const update = <K extends keyof NewCustomerState>(key: K, value: NewCustomerState[K]) =>
    setCustomer((prev) => ({ ...prev, [key]: value }));

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => update("avatar", reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCreate = () => {
    if (!customer.name.trim()) return;
    setSaved(true);
    setTimeout(() => router.push("/customers"), 1200);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="bg-white rounded-[32px] border border-primary/10 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">

        {/* Top Bar */}
        <div className="px-6 md:px-8 py-5 border-b border-primary/10 flex items-center justify-between shrink-0">
          <button
            onClick={() => router.push("/customers")}
            className="flex items-center gap-2 text-text-secondary hover:text-primary-dark transition-colors text-sm font-medium group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Customers
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => update("status", customer.status === "Active" ? "Inactive" : "Active")}
              className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${
                customer.status === "Active"
                  ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                  : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
              }`}
            >
              {customer.status}
            </button>

            <button
              onClick={handleCreate}
              disabled={!customer.name.trim()}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                saved ? "bg-green-500 text-white" : "bg-primary text-white hover:opacity-90"
              }`}
            >
              <Save className="w-4 h-4" />
              {saved ? "Created!" : "Create Customer"}
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-auto scrollbar-hide flex-1 p-6 md:p-8">
          <div className="flex flex-col lg:flex-row gap-8 max-w-3xl mx-auto">

            {/* LEFT — Avatar */}
            <div className="flex flex-col gap-4 items-center lg:w-48 shrink-0">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative w-40 h-40 cursor-pointer rounded-full overflow-hidden border-4 border-white shadow-md bg-primary/5 group"
              >
                {customer.avatar ? (
                  <>
                    <img src={customer.avatar} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-primary-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center flex-col gap-2">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-primary/40 group-hover:text-primary transition-colors">
                    <UserCircle2 className="w-12 h-12" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">Upload</span>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            {/* RIGHT — Details */}
            <div className="flex-1 space-y-6 min-w-0">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Full Name *</label>
                  <input
                    value={customer.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="w-full px-4 py-3 rounded-2xl border border-primary/40 bg-transparent focus:outline-none focus:border-primary text-primary-dark font-medium text-base placeholder:text-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Tier</label>
                  <TierDropdown value={customer.tier} onChange={(v) => update("tier", v)} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Email Address</label>
                  <input
                    type="email"
                    value={customer.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full px-4 py-3 rounded-2xl border border-primary/40 bg-transparent focus:outline-none focus:border-primary text-primary-dark text-sm placeholder:text-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={customer.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="+974 0000 0000"
                    className="w-full px-4 py-3 rounded-2xl border border-primary/40 bg-transparent focus:outline-none focus:border-primary text-primary-dark text-sm placeholder:text-primary/30"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
