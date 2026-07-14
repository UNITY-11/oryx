"use client";

import { useState, useRef } from "react";
import { ArrowLeft, Upload, ImageIcon, Plus, Trash2, Save, Clock, Users, ChevronDown, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { ServiceCategory, PricingTier, Addon } from "../../../src/features/services/mock-data";

const CATEGORIES: ServiceCategory[] = ["Massage", "Facial", "Body Treatment", "Hair", "Nails", "Package"];

/* ── Custom Category Dropdown ── */
function CategoryDropdown({
  value,
  onChange,
}: {
  value: ServiceCategory;
  onChange: (v: ServiceCategory) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border border-primary/40 bg-transparent hover:border-primary focus:outline-none focus:border-primary text-primary-dark text-sm transition-colors"
      >
        <span>{value}</span>
        <ChevronDown className={`w-4 h-4 text-primary/60 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-primary/10 rounded-2xl shadow-xl z-20 overflow-hidden">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => { onChange(cat); setOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm text-left hover:bg-primary/5 transition-colors ${cat === value ? "text-primary font-medium" : "text-primary-dark"}`}
              >
                <span>{cat}</span>
                {cat === value && <Check className="w-4 h-4 text-primary" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface NewServiceState {
  name: string;
  category: ServiceCategory;
  description: string;
  image: string | null;
  preparationTime: number;
  cleanupTime: number;
  maxCapacity: number;
  pricingTiers: PricingTier[];
  addons: Addon[];
  status: "Active" | "Inactive";
}

const DEFAULT_STATE: NewServiceState = {
  name: "",
  category: "Massage",
  description: "",
  image: null,
  preparationTime: 10,
  cleanupTime: 15,
  maxCapacity: 1,
  pricingTiers: [{ id: "pt-1", label: "60 min", price: 0, duration: 60 }],
  addons: [],
  status: "Active",
};

export default function NewServicePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [service, setService] = useState<NewServiceState>(DEFAULT_STATE);
  const [saved, setSaved] = useState(false);

  const update = <K extends keyof NewServiceState>(key: K, value: NewServiceState[K]) =>
    setService((prev) => ({ ...prev, [key]: value }));

  /* Image */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => update("image", reader.result as string);
    reader.readAsDataURL(file);
  };

  /* Pricing Tiers */
  const addTier = () =>
    update("pricingTiers", [...service.pricingTiers, { id: `pt-${Date.now()}`, label: "", price: 0, duration: 60 }]);
  const removeTier = (id: string) =>
    update("pricingTiers", service.pricingTiers.filter((t) => t.id !== id));
  const updateTier = (id: string, field: keyof PricingTier, value: string | number) =>
    update("pricingTiers", service.pricingTiers.map((t) => (t.id === id ? { ...t, [field]: value } : t)));

  /* Addons */
  const addAddon = () =>
    update("addons", [...service.addons, { id: `a-${Date.now()}`, name: "", price: 0, duration: 0 }]);
  const removeAddon = (id: string) =>
    update("addons", service.addons.filter((a) => a.id !== id));
  const updateAddon = (id: string, field: keyof Addon, value: string | number) =>
    update("addons", service.addons.map((a) => (a.id === id ? { ...a, [field]: value } : a)));

  const handleCreate = () => {
    if (!service.name.trim()) return;
    setSaved(true);
    setTimeout(() => router.push("/services"), 1200);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="bg-white rounded-[32px] border border-primary/10 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">

        {/* Top Bar */}
        <div className="px-6 md:px-8 py-5 border-b border-primary/10 flex items-center justify-between shrink-0">
          <button
            onClick={() => router.push("/services")}
            className="flex items-center gap-2 text-text-secondary hover:text-primary-dark transition-colors text-sm font-medium group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Services
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => update("status", service.status === "Active" ? "Inactive" : "Active")}
              className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${
                service.status === "Active"
                  ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                  : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
              }`}
            >
              {service.status}
            </button>

            <button
              onClick={handleCreate}
              disabled={!service.name.trim()}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                saved ? "bg-green-500 text-white" : "bg-primary text-white hover:opacity-90"
              }`}
            >
              <Save className="w-4 h-4" />
              {saved ? "Created!" : "Create Service"}
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-auto scrollbar-hide flex-1 p-6 md:p-8">
          <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto">

            {/* LEFT — Image + Timing */}
            <div className="flex flex-col gap-6 lg:w-72 shrink-0">
              {/* Image Frame 3:4 */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-3">Service Image</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative cursor-pointer rounded-3xl overflow-hidden border-2 border-dashed border-primary/30 hover:border-primary/60 transition-colors bg-primary/5 group w-full"
                  style={{ aspectRatio: "3/4" }}
                >
                  {service.image ? (
                    <>
                      <img src={service.image} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-primary-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center flex-col gap-2">
                        <Upload className="w-6 h-6 text-white" />
                        <span className="text-white text-xs font-medium">Change Image</span>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-primary/40 group-hover:text-primary transition-colors">
                      <ImageIcon className="w-10 h-10" />
                      <div className="text-center">
                        <p className="text-xs font-medium">Upload Image</p>
                        <p className="text-[10px] mt-0.5">3:4 ratio recommended</p>
                      </div>
                      <Upload className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                <p className="text-[10px] text-text-secondary mt-2 text-center">Click to choose from gallery</p>
              </div>

              {/* Quick Stats */}
              <div className="bg-primary/5 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-text-secondary"><Clock className="w-4 h-4" /> Prep Time</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={service.preparationTime}
                      onChange={(e) => update("preparationTime", Number(e.target.value))}
                      className="w-14 text-right bg-transparent text-primary-dark font-medium text-sm focus:outline-none"
                    />
                    <span className="text-text-secondary text-xs">min</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-text-secondary"><Clock className="w-4 h-4" /> Cleanup</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={service.cleanupTime}
                      onChange={(e) => update("cleanupTime", Number(e.target.value))}
                      className="w-14 text-right bg-transparent text-primary-dark font-medium text-sm focus:outline-none"
                    />
                    <span className="text-text-secondary text-xs">min</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-text-secondary"><Users className="w-4 h-4" /> Capacity</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={service.maxCapacity}
                      onChange={(e) => update("maxCapacity", Number(e.target.value))}
                      className="w-14 text-right bg-transparent text-primary-dark font-medium text-sm focus:outline-none"
                    />
                    <span className="text-text-secondary text-xs">guest(s)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT — Details */}
            <div className="flex-1 space-y-8 min-w-0">

              {/* Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Service Name *</label>
                  <input
                    value={service.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="e.g. Signature Massage"
                    className="w-full px-4 py-3 rounded-2xl border border-primary/40 bg-transparent focus:outline-none focus:border-primary text-primary-dark font-medium text-base placeholder:text-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Category</label>
                  <CategoryDropdown value={service.category} onChange={(v) => update("category", v)} />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Description</label>
                <textarea
                  value={service.description}
                  onChange={(e) => update("description", e.target.value)}
                  rows={5}
                  placeholder="Describe the service experience..."
                  className="w-full px-4 py-3 rounded-2xl border border-primary/40 bg-transparent focus:outline-none focus:border-primary text-primary-dark text-sm resize-none placeholder:text-primary/30"
                />
              </div>

              {/* Pricing Tiers */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Pricing Tiers</label>
                  <button onClick={addTier} className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline">
                    <Plus className="w-3 h-3" /> Add Tier
                  </button>
                </div>
                <div className="rounded-2xl border border-primary/10 overflow-hidden">
                  <div className="grid grid-cols-[1fr_130px_130px_44px] bg-[#fcf4f0] text-[10px] uppercase tracking-wider text-text-secondary px-4 py-3 border-b border-primary/10">
                    <span>Label</span><span>Price (QAR)</span><span>Duration (min)</span><span />
                  </div>
                  {service.pricingTiers.map((tier, i) => (
                    <div key={tier.id} className={`grid grid-cols-[1fr_130px_130px_44px] items-center gap-2 px-4 py-3 ${i > 0 ? "border-t border-primary/5" : ""}`}>
                      <input value={tier.label} onChange={(e) => updateTier(tier.id, "label", e.target.value)} placeholder="e.g. 60 min" className="w-full px-3 py-2 rounded-xl border border-primary/40 bg-white focus:outline-none focus:border-primary text-primary-dark text-sm placeholder:text-primary/40" />
                      <input type="number" value={tier.price || ""} onChange={(e) => updateTier(tier.id, "price", Number(e.target.value))} placeholder="0" className="w-full px-3 py-2 rounded-xl border border-primary/40 bg-white focus:outline-none focus:border-primary text-primary-dark text-sm font-medium placeholder:text-primary/40" />
                      <input type="number" value={tier.duration || ""} onChange={(e) => updateTier(tier.id, "duration", Number(e.target.value))} placeholder="60" className="w-full px-3 py-2 rounded-xl border border-primary/40 bg-white focus:outline-none focus:border-primary text-primary-dark text-sm placeholder:text-primary/40" />
                      <button onClick={() => removeTier(tier.id)} disabled={service.pricingTiers.length === 1} className="text-red-400 hover:text-red-600 transition-colors flex justify-center disabled:opacity-20">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Addons */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Add-ons</label>
                  <button onClick={addAddon} className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline">
                    <Plus className="w-3 h-3" /> Add Addon
                  </button>
                </div>
                {service.addons.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-primary/40 p-6 text-center text-text-secondary text-sm">
                    No add-ons yet. Click "Add Addon" to create one.
                  </div>
                ) : (
                  <div className="rounded-2xl border border-primary/10 overflow-hidden">
                    <div className="grid grid-cols-[1fr_130px_130px_44px] bg-[#fcf4f0] text-[10px] uppercase tracking-wider text-text-secondary px-4 py-3 border-b border-primary/10">
                      <span>Name</span><span>Price (QAR)</span><span>+Mins</span><span />
                    </div>
                    {service.addons.map((addon, i) => (
                      <div key={addon.id} className={`grid grid-cols-[1fr_130px_130px_44px] items-center gap-2 px-4 py-3 ${i > 0 ? "border-t border-primary/5" : ""}`}>
                        <input value={addon.name} onChange={(e) => updateAddon(addon.id, "name", e.target.value)} placeholder="Addon name" className="w-full px-3 py-2 rounded-xl border border-primary/40 bg-white focus:outline-none focus:border-primary text-primary-dark text-sm placeholder:text-primary/40" />
                        <input type="number" value={addon.price || ""} onChange={(e) => updateAddon(addon.id, "price", Number(e.target.value))} placeholder="0" className="w-full px-3 py-2 rounded-xl border border-primary/40 bg-white focus:outline-none focus:border-primary text-primary-dark text-sm font-medium placeholder:text-primary/40" />
                        <input type="number" value={addon.duration || ""} onChange={(e) => updateAddon(addon.id, "duration", Number(e.target.value))} placeholder="0" className="w-full px-3 py-2 rounded-xl border border-primary/40 bg-white focus:outline-none focus:border-primary text-primary-dark text-sm placeholder:text-primary/40" />
                        <button onClick={() => removeAddon(addon.id)} className="text-red-400 hover:text-red-600 flex justify-center">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>


            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
