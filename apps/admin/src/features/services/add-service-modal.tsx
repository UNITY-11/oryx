"use client";

import { useRef, useState } from "react";
import { ImageIcon, Plus, Trash2, Upload, X } from "lucide-react";

import { Addon, PricingTier, Service, ServiceCategory } from "./types";

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddService: (service: Service) => void;
}

const CATEGORIES: ServiceCategory[] = [
  "Massage",
  "Facial",
  "Body Treatment",
  "Hair",
  "Nails",
  "Package",
];

export function AddServiceModal({
  isOpen,
  onClose,
  onAddService,
}: AddServiceModalProps) {
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

  const updatePricingTier = (
    idx: number,
    field: keyof Omit<PricingTier, "id">,
    value: string | number
  ) =>
    setPricingTiers(
      pricingTiers.map((t, i) => (i === idx ? { ...t, [field]: value } : t))
    );

  const addAddon = () =>
    setAddons([...addons, { name: "", price: 0, duration: 0 }]);
  const removeAddon = (idx: number) =>
    setAddons(addons.filter((_, i) => i !== idx));
  const updateAddon = (
    idx: number,
    field: keyof Omit<Addon, "id">,
    value: string | number
  ) =>
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
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      createdAt: new Date().toISOString().split("T")[0] || "",
    };
    onAddService(newService);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="bg-primary-dark/30 absolute inset-0 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="border-primary/10 relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[32px] border bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="border-primary/10 flex shrink-0 items-center justify-between border-b px-8 py-6">
          <h2 className="text-primary-dark font-serif text-2xl font-medium">
            New Service
          </h2>
          <button
            onClick={onClose}
            className="hover:bg-primary/5 text-text-secondary rounded-full p-2 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="scrollbar-hide flex-1 overflow-y-auto"
        >
          <div className="space-y-6 px-8 py-6">
            {/* Image Picker */}
            <div>
              <label className="text-text-secondary mb-3 block text-sm font-medium">
                Service Image (3:4)
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-primary/30 hover:border-primary/60 bg-primary/5 group relative w-[180px] cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-colors"
                style={{ aspectRatio: "3/4" }}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-primary/50 group-hover:text-primary absolute inset-0 flex flex-col items-center justify-center gap-2 transition-colors">
                    <ImageIcon className="h-8 w-8" />
                    <span className="px-2 text-center text-xs font-medium">
                      Choose Image
                    </span>
                    <Upload className="h-4 w-4" />
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            {/* Name & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-text-secondary mb-2 block text-sm font-medium">
                  Service Name *
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Signature Massage"
                  className="border-primary/20 focus:border-primary text-primary-dark placeholder:text-primary/40 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="text-text-secondary mb-2 block text-sm font-medium">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category: e.target.value as ServiceCategory,
                    })
                  }
                  className="border-primary/20 focus:border-primary text-primary-dark w-full appearance-none rounded-2xl border bg-transparent px-4 py-3 text-sm focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Short Description */}
            <div>
              <label className="text-text-secondary mb-2 block text-sm font-medium">
                Short Description
              </label>
              <input
                value={form.shortDescription}
                onChange={(e) =>
                  setForm({ ...form, shortDescription: e.target.value })
                }
                placeholder="One-line summary shown on the card"
                className="border-primary/20 focus:border-primary text-primary-dark placeholder:text-primary/40 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm focus:outline-none"
              />
            </div>

            {/* Pricing Tiers */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="text-text-secondary text-sm font-medium">
                  Pricing Tiers
                </label>
                <button
                  type="button"
                  onClick={addPricingTier}
                  className="text-primary flex items-center gap-1 text-xs font-medium hover:underline"
                >
                  <Plus className="h-3 w-3" /> Add Tier
                </button>
              </div>
              <div className="space-y-2">
                {pricingTiers.map((tier, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-3 items-center gap-2"
                  >
                    <input
                      value={tier.label}
                      onChange={(e) =>
                        updatePricingTier(idx, "label", e.target.value)
                      }
                      placeholder="Label (e.g. 60 min)"
                      className="border-primary/20 focus:border-primary text-primary-dark placeholder:text-primary/40 rounded-xl border bg-transparent px-3 py-2.5 text-sm focus:outline-none"
                    />
                    <input
                      type="number"
                      value={tier.price || ""}
                      onChange={(e) =>
                        updatePricingTier(idx, "price", Number(e.target.value))
                      }
                      placeholder="Price (QAR)"
                      className="border-primary/20 focus:border-primary text-primary-dark placeholder:text-primary/40 rounded-xl border bg-transparent px-3 py-2.5 text-sm focus:outline-none"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={tier.duration || ""}
                        onChange={(e) =>
                          updatePricingTier(
                            idx,
                            "duration",
                            Number(e.target.value)
                          )
                        }
                        placeholder="Duration (min)"
                        className="border-primary/20 focus:border-primary text-primary-dark placeholder:text-primary/40 flex-1 rounded-xl border bg-transparent px-3 py-2.5 text-sm focus:outline-none"
                      />
                      {pricingTiers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePricingTier(idx)}
                          className="shrink-0 p-1 text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add-ons */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="text-text-secondary text-sm font-medium">
                  Add-ons
                </label>
                <button
                  type="button"
                  onClick={addAddon}
                  className="text-primary flex items-center gap-1 text-xs font-medium hover:underline"
                >
                  <Plus className="h-3 w-3" /> Add Addon
                </button>
              </div>
              {addons.length === 0 && (
                <p className="text-primary/40 text-xs italic">
                  No add-ons yet. Click "Add Addon" to create one.
                </p>
              )}
              <div className="space-y-2">
                {addons.map((addon, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-3 items-center gap-2"
                  >
                    <input
                      value={addon.name}
                      onChange={(e) => updateAddon(idx, "name", e.target.value)}
                      placeholder="Addon name"
                      className="border-primary/20 focus:border-primary text-primary-dark placeholder:text-primary/40 rounded-xl border bg-transparent px-3 py-2.5 text-sm focus:outline-none"
                    />
                    <input
                      type="number"
                      value={addon.price || ""}
                      onChange={(e) =>
                        updateAddon(idx, "price", Number(e.target.value))
                      }
                      placeholder="Price (QAR)"
                      className="border-primary/20 focus:border-primary text-primary-dark placeholder:text-primary/40 rounded-xl border bg-transparent px-3 py-2.5 text-sm focus:outline-none"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={addon.duration || ""}
                        onChange={(e) =>
                          updateAddon(idx, "duration", Number(e.target.value))
                        }
                        placeholder="+mins"
                        className="border-primary/20 focus:border-primary text-primary-dark placeholder:text-primary/40 flex-1 rounded-xl border bg-transparent px-3 py-2.5 text-sm focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeAddon(idx)}
                        className="shrink-0 p-1 text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timing & Capacity */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-text-secondary mb-2 block text-sm font-medium">
                  Prep Time (min)
                </label>
                <input
                  type="number"
                  value={form.preparationTime}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      preparationTime: Number(e.target.value),
                    })
                  }
                  className="border-primary/20 focus:border-primary text-primary-dark w-full rounded-2xl border bg-transparent px-4 py-3 text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="text-text-secondary mb-2 block text-sm font-medium">
                  Cleanup Time (min)
                </label>
                <input
                  type="number"
                  value={form.cleanupTime}
                  onChange={(e) =>
                    setForm({ ...form, cleanupTime: Number(e.target.value) })
                  }
                  className="border-primary/20 focus:border-primary text-primary-dark w-full rounded-2xl border bg-transparent px-4 py-3 text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="text-text-secondary mb-2 block text-sm font-medium">
                  Max Capacity
                </label>
                <input
                  type="number"
                  value={form.maxCapacity}
                  onChange={(e) =>
                    setForm({ ...form, maxCapacity: Number(e.target.value) })
                  }
                  className="border-primary/20 focus:border-primary text-primary-dark w-full rounded-2xl border bg-transparent px-4 py-3 text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="text-text-secondary mb-2 block text-sm font-medium">
                Tags (comma-separated)
              </label>
              <input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="e.g. Relaxation, Bestseller, Luxury"
                className="border-primary/20 focus:border-primary text-primary-dark placeholder:text-primary/40 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="border-primary/10 flex shrink-0 justify-end gap-3 border-t bg-white px-8 py-5">
            <button
              type="button"
              onClick={onClose}
              className="border-primary/20 text-text-secondary hover:bg-primary/5 rounded-full border px-6 py-2.5 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary rounded-full px-8 py-2.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
            >
              Create Service
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
