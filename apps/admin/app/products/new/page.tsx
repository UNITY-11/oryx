"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct, uploadProductImage } from "@features/products/api";
import { ProductCategory } from "@features/products/types";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronDown,
  ImageIcon,
  Loader2,
  Package,
  Save,
  Upload,
} from "lucide-react";

const CATEGORIES: ProductCategory[] = [
  "Skincare",
  "Body Care",
  "Hair Care",
  "Aromatherapy",
  "Accessories",
  "Supplements",
];

interface NewProductState {
  name: string;
  brand: string;
  volumeOrWeight: string;
  quantity: number;
  price: number;
  category: ProductCategory;
  image: string | null;
  status: "Active" | "Inactive";
}

const DEFAULT_STATE: NewProductState = {
  name: "",
  brand: "",
  volumeOrWeight: "",
  quantity: 0,
  price: 0,
  category: "Skincare",
  image: null,
  status: "Active",
};

function CategoryDropdown({
  value,
  onChange,
}: {
  value: ProductCategory;
  onChange: (v: ProductCategory) => void;
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
        onClick={() => setOpen(!open)}
        className="border-primary/40 hover:border-primary focus:border-primary text-primary-dark flex w-full items-center justify-between rounded-2xl border bg-transparent px-4 py-3 text-sm transition-colors focus:outline-none"
      >
        <span>{value}</span>
        <ChevronDown
          className={`text-primary/60 h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="border-primary/10 absolute top-full right-0 left-0 z-20 mt-2 overflow-hidden rounded-2xl border bg-white shadow-xl">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(cat);
                setOpen(false);
              }}
              className={`hover:bg-primary/5 flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors ${cat === value ? "text-primary font-medium" : "text-primary-dark"}`}
            >
              <span>{cat}</span>
              {cat === value && <Check className="text-primary h-4 w-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NewProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [product, setProduct] = useState<NewProductState>(DEFAULT_STATE);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);

  const update = <K extends keyof NewProductState>(
    key: K,
    value: NewProductState[K]
  ) => setProduct((prev) => ({ ...prev, [key]: value }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => update("image", reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCreate = async () => {
    if (!product.name.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      let imageUrl = product.image;
      if (pendingImageFile) {
        imageUrl = await uploadProductImage(pendingImageFile);
      }
      await createProduct({ ...product, image: imageUrl });
      setSaved(true);
      setTimeout(() => router.push("/products"), 1200);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to create product"
      );
      setSaving(false);
    }
  };

  const stockColor =
    product.quantity === 0
      ? "text-red-500"
      : product.quantity <= 10
        ? "text-amber-600"
        : "text-green-600";

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-primary/10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[32px] border bg-white shadow-sm">
        {/* Top Bar */}
        <div className="border-primary/10 flex shrink-0 items-center justify-between border-b px-6 py-5 md:px-8">
          <button
            onClick={() => router.push("/products")}
            className="text-text-secondary hover:text-primary-dark group flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Products
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                update(
                  "status",
                  product.status === "Active" ? "Inactive" : "Active"
                )
              }
              className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
                product.status === "Active"
                  ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                  : "border-gray-200 bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {product.status}
            </button>

            <button
              onClick={handleCreate}
              disabled={!product.name.trim() || saving}
              className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                saved
                  ? "bg-green-500 text-white"
                  : "bg-primary text-white hover:opacity-90"
              }`}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Creating..." : saved ? "Created!" : "Create Product"}
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="scrollbar-hide flex-1 overflow-auto p-6 md:p-8">
          {saveError && (
            <div className="mx-auto mb-6 flex max-w-4xl items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {saveError}
            </div>
          )}
          <div className="mx-auto flex max-w-4xl flex-col gap-8 lg:flex-row">
            {/* LEFT — Image + Stock */}
            <div className="flex shrink-0 flex-col gap-4 lg:w-64">
              <div>
                <label className="text-text-secondary mb-3 block text-sm font-medium">
                  Product Image
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-primary/40 hover:border-primary/70 bg-primary/5 group relative w-full cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed transition-colors"
                  style={{ aspectRatio: "1/1" }}
                >
                  {product.image ? (
                    <>
                      <img
                        src={product.image}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                      <div className="bg-primary-dark/40 absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <Upload className="h-6 w-6 text-white" />
                        <span className="text-xs font-medium text-white">
                          Change Image
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-primary/40 group-hover:text-primary absolute inset-0 flex flex-col items-center justify-center gap-3 transition-colors">
                      <ImageIcon className="h-10 w-10" />
                      <div className="text-center">
                        <p className="text-xs font-medium">Upload Image</p>
                        <p className="mt-0.5 text-[10px]">
                          1:1 ratio recommended
                        </p>
                      </div>
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
                <p className="text-text-secondary mt-2 text-center text-[10px]">
                  Click to choose from gallery
                </p>
              </div>
            </div>

            {/* RIGHT — Details */}
            <div className="min-w-0 flex-1 space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-text-secondary mb-2 block text-xs font-semibold tracking-wider uppercase">
                    Product Name *
                  </label>
                  <input
                    value={product.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="e.g. Rose Hip Facial Oil"
                    className="border-primary/40 focus:border-primary text-primary-dark placeholder:text-primary/30 w-full rounded-2xl border bg-transparent px-4 py-3 text-base font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-text-secondary mb-2 block text-xs font-semibold tracking-wider uppercase">
                    Category
                  </label>
                  <CategoryDropdown
                    value={product.category}
                    onChange={(v) => update("category", v)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-text-secondary mb-2 block text-xs font-semibold tracking-wider uppercase">
                    Brand
                  </label>
                  <input
                    value={product.brand}
                    onChange={(e) => update("brand", e.target.value)}
                    placeholder="e.g. Oryx Naturals"
                    className="border-primary/40 focus:border-primary text-primary-dark placeholder:text-primary/30 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-text-secondary mb-2 block text-xs font-semibold tracking-wider uppercase">
                    Liters / Grams
                  </label>
                  <input
                    value={product.volumeOrWeight}
                    onChange={(e) => update("volumeOrWeight", e.target.value)}
                    placeholder="e.g. 50 ml or 200 g"
                    className="border-primary/40 focus:border-primary text-primary-dark placeholder:text-primary/30 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-text-secondary mb-2 block text-xs font-semibold tracking-wider uppercase">
                    Price (QAR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={product.price}
                    onChange={(e) =>
                      update("price", Math.max(0, Number(e.target.value)))
                    }
                    className="border-primary/40 focus:border-primary text-primary-dark w-full rounded-2xl border bg-transparent px-4 py-3 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-text-secondary mb-2 block text-xs font-semibold tracking-wider uppercase">
                    Quantity (Stock)
                  </label>
                  <div className="relative flex items-center gap-3">
                    <input
                      type="number"
                      min={0}
                      value={product.quantity}
                      onChange={(e) =>
                        update("quantity", Math.max(0, Number(e.target.value)))
                      }
                      className="border-primary/40 focus:border-primary text-primary-dark w-full rounded-2xl border bg-white px-4 py-3 pr-12 text-base font-semibold focus:outline-none"
                    />
                    <Package
                      className={`absolute right-4 h-5 w-5 shrink-0 ${stockColor}`}
                    />
                  </div>
                  <p className={`mt-1 text-[10px] font-medium ${stockColor}`}>
                    {product.quantity === 0
                      ? "Out of Stock"
                      : product.quantity <= 10
                        ? `Low Stock — ${product.quantity} left`
                        : `${product.quantity} in stock`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
