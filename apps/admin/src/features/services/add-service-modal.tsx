"use client";

import { useState, useRef } from "react";
import { X, Plus, Trash2, Upload, ImageIcon } from "lucide-react";
import { Service, ServiceCategory, Addon, PricingTier } from "./mock-data";

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddService: (service: Service) => void;
}

const CATEGORIES: ServiceCategory[] = ["Massage", "Facial", "Body Treatment", "Hair", "Nails", "Package"];

export function AddServiceModal({ isOpen, onClose, onAddService }: AddServiceModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    category: "Massage" as ServiceCategory,
    shortDescription: "",
    description: "",
    preparationTime: 10,
    cleanupTime: 15,
    maxCapacity: 1,
    tags: "",
  });

  const [pricingTiers, setPricingTiers] = useState<Omit<PricingTier, "id">[]>([
    { label: "60 min", price: 0, duration: 60 },
  ]);

  const [addons, setAddons] = useState<Omit<Addon, "id">[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const addPricingTier = () =>
    setPricingTiers([...pricingTiers, { label: "", price: 0, duration: 60 }]);

  const removePricingTier = (idx: number) =>
    setPricingTiers(pricingTiers.filter((_, i) => i !== idx));

  const updatePricingTier = (idx: number, field: keyof Omit<PricingTier, "id">, value: string | number) =>
    setPricingTiers(pricingTiers.map((t, i) => (i === idx ? { ...t, [field]: value } : t)));

  const addAddon = () => setAddons([...addons, { name: "", price: 0, duration: 0 }]);
  const removeAddon = (idx: number) => setAddons(addons.filter((_, i) => i !== idx));
  const updateAddon = (idx: number, field: keyof Omit<Addon, "id">, value: string | number) =>
    setAddons(addons.map((a, i) => (i === idx ? { ...a, [field]: value } : a)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const newService: Service = {
      id: `SVC-${String(Date.now()).slice(-4)}`,
      name: form.name,
      category: form.category,
      status: "Active",
      shortDescription: form.shortDescription,
      description: form.description,
      image: imagePreview,
      pricingTiers: pricingTiers.map((t, i) => ({ ...t, id: `pt-new-${i}` })),
      addons: addons.map((a, i) => ({ ...a, id: `a-new-${i}` })),
      preparationTime: form.preparationTime,
      cleanupTime: form.cleanupTime,
      maxCapacity: form.maxCapacity,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      createdAt: new Date().toISOString().split("T")[0] || "",
    };
    onAddService(newService);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-primary-dark/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-primary/10">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-primary/10 shrink-0">
          <h2 className="font-serif text-2xl font-medium text-primary-dark">New Service</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-primary/5 text-text-secondary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 scrollbar-hide">
          <div className="px-8 py-6 space-y-6">

            {/* Image Picker */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-3">Service Image (3:4)</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative cursor-pointer w-[180px] rounded-2xl border-2 border-dashed border-primary/30 hover:border-primary/60 transition-colors overflow-hidden bg-primary/5 group"
                style={{ aspectRatio: "3/4" }}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-primary/50 group-hover:text-primary transition-colors gap-2">
                    <ImageIcon className="w-8 h-8" />
                    <span className="text-xs font-medium text-center px-2">Choose Image</span>
                    <Upload className="w-4 h-4" />
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>

            {/* Name & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Service Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Signature Massage"
                  className="w-full px-4 py-3 rounded-2xl border border-primary/20 bg-transparent focus:outline-none focus:border-primary text-primary-dark placeholder:text-primary/40 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as ServiceCategory })}
                  className="w-full px-4 py-3 rounded-2xl border border-primary/20 bg-transparent focus:outline-none focus:border-primary text-primary-dark text-sm appearance-none"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Short Description</label>
              <input
                value={form.shortDescription}
                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                placeholder="One-line summary shown on the card"
                className="w-full px-4 py-3 rounded-2xl border border-primary/20 bg-transparent focus:outline-none focus:border-primary text-primary-dark placeholder:text-primary/40 text-sm"
              />
            </div>

            {/* Pricing Tiers */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-text-secondary">Pricing Tiers</label>
                <button type="button" onClick={addPricingTier} className="flex items-center gap-1 text-xs text-primary font-medium hover:underline">
                  <Plus className="w-3 h-3" /> Add Tier
                </button>
              </div>
              <div className="space-y-2">
                {pricingTiers.map((tier, idx) => (
                  <div key={idx} className="grid grid-cols-3 gap-2 items-center">
                    <input
                      value={tier.label}
                      onChange={(e) => updatePricingTier(idx, "label", e.target.value)}
                      placeholder="Label (e.g. 60 min)"
                      className="px-3 py-2.5 rounded-xl border border-primary/20 bg-transparent focus:outline-none focus:border-primary text-primary-dark placeholder:text-primary/40 text-sm"
                    />
                    <input
                      type="number"
                      value={tier.price || ""}
                      onChange={(e) => updatePricingTier(idx, "price", Number(e.target.value))}
                      placeholder="Price (QAR)"
                      className="px-3 py-2.5 rounded-xl border border-primary/20 bg-transparent focus:outline-none focus:border-primary text-primary-dark placeholder:text-primary/40 text-sm"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={tier.duration || ""}
                        onChange={(e) => updatePricingTier(idx, "duration", Number(e.target.value))}
                        placeholder="Duration (min)"
                        className="flex-1 px-3 py-2.5 rounded-xl border border-primary/20 bg-transparent focus:outline-none focus:border-primary text-primary-dark placeholder:text-primary/40 text-sm"
                      />
                      {pricingTiers.length > 1 && (
                        <button type="button" onClick={() => removePricingTier(idx)} className="text-red-400 hover:text-red-600 p-1 shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add-ons */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-text-secondary">Add-ons</label>
                <button type="button" onClick={addAddon} className="flex items-center gap-1 text-xs text-primary font-medium hover:underline">
                  <Plus className="w-3 h-3" /> Add Addon
                </button>
              </div>
              {addons.length === 0 && (
                <p className="text-xs text-primary/40 italic">No add-ons yet. Click "Add Addon" to create one.</p>
              )}
              <div className="space-y-2">
                {addons.map((addon, idx) => (
                  <div key={idx} className="grid grid-cols-3 gap-2 items-center">
                    <input
                      value={addon.name}
                      onChange={(e) => updateAddon(idx, "name", e.target.value)}
                      placeholder="Addon name"
                      className="px-3 py-2.5 rounded-xl border border-primary/20 bg-transparent focus:outline-none focus:border-primary text-primary-dark placeholder:text-primary/40 text-sm"
                    />
                    <input
                      type="number"
                      value={addon.price || ""}
                      onChange={(e) => updateAddon(idx, "price", Number(e.target.value))}
                      placeholder="Price (QAR)"
                      className="px-3 py-2.5 rounded-xl border border-primary/20 bg-transparent focus:outline-none focus:border-primary text-primary-dark placeholder:text-primary/40 text-sm"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={addon.duration || ""}
                        onChange={(e) => updateAddon(idx, "duration", Number(e.target.value))}
                        placeholder="+mins"
                        className="flex-1 px-3 py-2.5 rounded-xl border border-primary/20 bg-transparent focus:outline-none focus:border-primary text-primary-dark placeholder:text-primary/40 text-sm"
                      />
                      <button type="button" onClick={() => removeAddon(idx)} className="text-red-400 hover:text-red-600 p-1 shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timing & Capacity */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Prep Time (min)</label>
                <input
                  type="number"
                  value={form.preparationTime}
                  onChange={(e) => setForm({ ...form, preparationTime: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-2xl border border-primary/20 bg-transparent focus:outline-none focus:border-primary text-primary-dark text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Cleanup Time (min)</label>
                <input
                  type="number"
                  value={form.cleanupTime}
                  onChange={(e) => setForm({ ...form, cleanupTime: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-2xl border border-primary/20 bg-transparent focus:outline-none focus:border-primary text-primary-dark text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Max Capacity</label>
                <input
                  type="number"
                  value={form.maxCapacity}
                  onChange={(e) => setForm({ ...form, maxCapacity: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-2xl border border-primary/20 bg-transparent focus:outline-none focus:border-primary text-primary-dark text-sm"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Tags (comma-separated)</label>
              <input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="e.g. Relaxation, Bestseller, Luxury"
                className="w-full px-4 py-3 rounded-2xl border border-primary/20 bg-transparent focus:outline-none focus:border-primary text-primary-dark placeholder:text-primary/40 text-sm"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-5 border-t border-primary/10 flex justify-end gap-3 shrink-0 bg-white">
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-full border border-primary/20 text-text-secondary text-sm font-medium hover:bg-primary/5 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-8 py-2.5 rounded-full bg-primary text-white text-sm font-medium shadow-sm hover:opacity-90 transition-opacity">
              Create Service
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
