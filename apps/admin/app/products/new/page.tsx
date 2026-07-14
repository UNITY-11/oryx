"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Upload, ImageIcon, Save, Package, ChevronDown, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { ProductCategory } from "../../../src/features/products/mock-data";

const CATEGORIES: ProductCategory[] = [
  "Skincare", "Body Care", "Hair Care", "Aromatherapy", "Accessories", "Supplements",
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
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(cat); setOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm text-left hover:bg-primary/5 transition-colors ${cat === value ? "text-primary font-medium" : "text-primary-dark"}`}
            >
              <span>{cat}</span>
              {cat === value && <Check className="w-4 h-4 text-primary" />}
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

  const update = <K extends keyof NewProductState>(key: K, value: NewProductState[K]) =>
    setProduct((prev) => ({ ...prev, [key]: value }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => update("image", reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCreate = () => {
    if (!product.name.trim()) return;
    setSaved(true);
    setTimeout(() => router.push("/products"), 1200);
  };

  const stockColor =
    product.quantity === 0
      ? "text-red-500"
      : product.quantity <= 10
      ? "text-amber-600"
      : "text-green-600";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="bg-white rounded-[32px] border border-primary/10 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">

        {/* Top Bar */}
        <div className="px-6 md:px-8 py-5 border-b border-primary/10 flex items-center justify-between shrink-0">
          <button
            onClick={() => router.push("/products")}
            className="flex items-center gap-2 text-text-secondary hover:text-primary-dark transition-colors text-sm font-medium group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Products
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => update("status", product.status === "Active" ? "Inactive" : "Active")}
              className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${
                product.status === "Active"
                  ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                  : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
              }`}
            >
              {product.status}
            </button>

            <button
              onClick={handleCreate}
              disabled={!product.name.trim()}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                saved ? "bg-green-500 text-white" : "bg-primary text-white hover:opacity-90"
              }`}
            >
              <Save className="w-4 h-4" />
              {saved ? "Created!" : "Create Product"}
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-auto scrollbar-hide flex-1 p-6 md:p-8">
          <div className="flex flex-col lg:flex-row gap-8 max-w-4xl mx-auto">

            {/* LEFT — Image + Stock */}
            <div className="flex flex-col gap-4 lg:w-64 shrink-0">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-3">Product Image</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative cursor-pointer rounded-3xl overflow-hidden border-2 border-dashed border-primary/40 hover:border-primary/70 transition-colors bg-primary/5 group w-full"
                  style={{ aspectRatio: "3/4" }}
                >
                  {product.image ? (
                    <>
                      <img src={product.image} alt="Preview" className="w-full h-full object-cover" />
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
            </div>

            {/* RIGHT — Details */}
            <div className="flex-1 space-y-6 min-w-0">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Product Name *</label>
                  <input
                    value={product.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="e.g. Rose Hip Facial Oil"
                    className="w-full px-4 py-3 rounded-2xl border border-primary/40 bg-transparent focus:outline-none focus:border-primary text-primary-dark font-medium text-base placeholder:text-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Category</label>
                  <CategoryDropdown value={product.category} onChange={(v) => update("category", v)} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Brand</label>
                  <input
                    value={product.brand}
                    onChange={(e) => update("brand", e.target.value)}
                    placeholder="e.g. Oryx Naturals"
                    className="w-full px-4 py-3 rounded-2xl border border-primary/40 bg-transparent focus:outline-none focus:border-primary text-primary-dark text-sm placeholder:text-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Liters / Grams</label>
                  <input
                    value={product.volumeOrWeight}
                    onChange={(e) => update("volumeOrWeight", e.target.value)}
                    placeholder="e.g. 50 ml or 200 g"
                    className="w-full px-4 py-3 rounded-2xl border border-primary/40 bg-transparent focus:outline-none focus:border-primary text-primary-dark text-sm placeholder:text-primary/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Price (QAR)</label>
                  <input
                    type="number"
                    min={0}
                    value={product.price}
                    onChange={(e) => update("price", Math.max(0, Number(e.target.value)))}
                    className="w-full px-4 py-3 rounded-2xl border border-primary/40 bg-transparent focus:outline-none focus:border-primary text-primary-dark text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Quantity (Stock)</label>
                  <div className="flex items-center gap-3 relative">
                    <input
                      type="number"
                      min={0}
                      value={product.quantity}
                      onChange={(e) => update("quantity", Math.max(0, Number(e.target.value)))}
                      className="w-full px-4 py-3 pr-12 rounded-2xl border border-primary/40 bg-white focus:outline-none focus:border-primary text-primary-dark font-semibold text-base"
                    />
                    <Package className={`absolute right-4 w-5 h-5 shrink-0 ${stockColor}`} />
                  </div>
                  <p className={`text-[10px] font-medium mt-1 ${stockColor}`}>
                    {product.quantity === 0 ? "Out of Stock" : product.quantity <= 10 ? `Low Stock — ${product.quantity} left` : `${product.quantity} in stock`}
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
