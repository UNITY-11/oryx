"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MobileMenuButton } from "@/shared/ui/sidebar-context";
import { Toast, type ToastState } from "@/shared/ui/toast";
import { uploadProductImage } from "@features/products/api";
import { ProductCategory } from "@features/products/types";
import {
  hasProductFieldErrors,
  PRODUCT_CATEGORIES,
  validateProduct,
  validateProductImageFile,
  type ProductFieldErrors,
  type ProductFormData,
} from "@features/products/validation";
import {
  ArrowLeft,
  Ban,
  Check,
  CheckCircle,
  ChevronDown,
  ImageIcon,
  Loader2,
  Package,
  Save,
  Upload,
} from "lucide-react";

const CATEGORIES = PRODUCT_CATEGORIES;

const DEFAULT_STATE: ProductFormData = {
  name: "",
  brand: "",
  volumeOrWeight: "",
  quantity: 0,
  price: 0,
  category: "Skincare",
  image: null,
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

function CategoryDropdown({
  value,
  onChange,
  disabled,
  hasError,
}: {
  value: ProductCategory;
  onChange: (v: ProductCategory) => void;
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
        <div className="border-primary/10 absolute top-full right-0 left-0 z-20 mt-2 max-h-56 overflow-y-auto rounded-2xl border bg-white shadow-xl">
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
  const [product, setProduct] = useState<ProductFormData>(DEFAULT_STATE);
  const [saving, setSaving] = useState(false);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ProductFieldErrors>({});
  const [toast, setToast] = useState<ToastState>(null);

  const closeToast = useCallback(() => setToast(null), []);

  const update = <K extends keyof ProductFormData>(
    key: K,
    value: ProductFormData[K]
  ) => {
    setProduct((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const imageError = validateProductImageFile(file);
    if (imageError) {
      setFieldErrors((prev) => ({ ...prev, image: imageError }));
      setToast({ type: "error", message: imageError });
      e.target.value = "";
      return;
    }
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.image;
      return next;
    });
    setPendingImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => update("image", reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCreate = async () => {
    const errors = validateProduct(product);
    if (hasProductFieldErrors(errors)) {
      setFieldErrors(errors);
      setToast({ type: "error", message: "Please fix the highlighted fields" });
      const firstKey = Object.keys(errors)[0];
      if (firstKey) {
        document
          .querySelector(`[data-field="${firstKey}"]`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setSaving(true);
    try {
      let imageUrl = product.image;
      if (pendingImageFile) {
        imageUrl = await uploadProductImage(pendingImageFile);
      }
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...product,
          name: product.name.trim(),
          brand: product.brand.trim(),
          volumeOrWeight: product.volumeOrWeight.trim(),
          image: imageUrl,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.fieldErrors && typeof data.fieldErrors === "object") {
          setFieldErrors(data.fieldErrors as ProductFieldErrors);
        }
        setToast({
          type: "error",
          message: data.error ?? "Failed to create product",
        });
        setSaving(false);
        return;
      }
      setToast({ type: "success", message: "Product created successfully" });
      setTimeout(() => router.push("/products"), 900);
    } catch (err) {
      setToast({
        type: "error",
        message:
          err instanceof Error ? err.message : "Failed to create product",
      });
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
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden pt-4 sm:gap-4">
      <Toast toast={toast} onClose={closeToast} />

      <header className="border-primary/10 flex shrink-0 flex-wrap items-center gap-2 rounded-2xl border bg-white px-2.5 py-2 shadow-sm sm:gap-3 sm:rounded-3xl sm:px-4 sm:py-2.5 md:px-5">
        <MobileMenuButton className="-ml-0" />
        <button
          type="button"
          onClick={() => router.push("/products")}
          className="text-text-secondary hover:text-primary-dark hover:bg-primary/5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors"
          aria-label="Back to products"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-primary truncate font-serif text-base leading-tight font-medium uppercase sm:text-xl md:text-2xl">
            New Product
          </h1>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() =>
              update(
                "status",
                product.status === "Active" ? "Inactive" : "Active"
              )
            }
            disabled={saving}
            className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-full border px-2.5 text-sm font-semibold transition-colors sm:px-4 ${
              product.status === "Active"
                ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100"
            }`}
            title={product.status}
          >
            {product.status === "Active" ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <Ban className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">{product.status}</span>
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={saving}
            className="bg-primary inline-flex h-10 items-center gap-1.5 rounded-full px-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60 sm:px-4"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {saving ? "Creating…" : "Create Product"}
            </span>
          </button>
        </div>
      </header>

      <div className="border-primary/10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-white shadow-sm sm:rounded-[32px]">
        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="mx-auto flex max-w-4xl flex-col gap-6 sm:gap-8 lg:flex-row">
            <div
              className="mx-auto w-full max-w-xs shrink-0 sm:max-w-sm lg:mx-0 lg:w-64"
              data-field="image"
            >
              <label className={labelClass}>Product Image</label>
              <div
                onClick={() => !saving && fileInputRef.current?.click()}
                className={`border-primary/40 hover:border-primary/70 bg-primary/5 group relative aspect-square w-full cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-colors sm:rounded-3xl ${fieldErrors.image ? "border-red-400" : ""}`}
              >
                {product.image ? (
                  <>
                    <img
                      src={product.image}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                    <div className="bg-primary-dark/40 absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
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
                      <p className="mt-0.5 text-[10px]">1:1 · max 5 MB</p>
                    </div>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleImageChange}
              />
              <FieldError message={fieldErrors.image} />
              <p className="text-text-secondary mt-2 text-center text-[10px]">
                JPG, PNG, WEBP or GIF
              </p>
            </div>

            <div className="min-w-0 flex-1 space-y-5 sm:space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div data-field="name">
                  <label className={labelClass}>Product Name *</label>
                  <input
                    value={product.name}
                    disabled={saving}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="e.g. Rose Hip Facial Oil"
                    className={`${inputClass} text-base font-medium ${fieldErrors.name ? inputErrorClass : ""}`}
                  />
                  <FieldError message={fieldErrors.name} />
                </div>
                <div data-field="category">
                  <label className={labelClass}>Category *</label>
                  <CategoryDropdown
                    value={product.category}
                    disabled={saving}
                    hasError={Boolean(fieldErrors.category)}
                    onChange={(v) => update("category", v)}
                  />
                  <FieldError message={fieldErrors.category} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div data-field="brand">
                  <label className={labelClass}>Brand</label>
                  <input
                    value={product.brand}
                    disabled={saving}
                    onChange={(e) => update("brand", e.target.value)}
                    placeholder="e.g. Oryx Naturals"
                    className={`${inputClass} ${fieldErrors.brand ? inputErrorClass : ""}`}
                  />
                  <FieldError message={fieldErrors.brand} />
                </div>
                <div data-field="volumeOrWeight">
                  <label className={labelClass}>Liters / Grams</label>
                  <input
                    value={product.volumeOrWeight}
                    disabled={saving}
                    onChange={(e) => update("volumeOrWeight", e.target.value)}
                    placeholder="e.g. 50 ml or 200 g"
                    className={`${inputClass} ${fieldErrors.volumeOrWeight ? inputErrorClass : ""}`}
                  />
                  <FieldError message={fieldErrors.volumeOrWeight} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div data-field="price">
                  <label className={labelClass}>Price (QAR) *</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    disabled={saving}
                    value={product.price === 0 ? "" : product.price}
                    placeholder="e.g. 150"
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === "") {
                        update("price", 0);
                        return;
                      }
                      const num = Number(raw);
                      if (!Number.isNaN(num)) update("price", num);
                    }}
                    className={`${inputClass} ${fieldErrors.price ? inputErrorClass : ""}`}
                  />
                  <FieldError message={fieldErrors.price} />
                </div>
                <div data-field="quantity">
                  <label className={labelClass}>Quantity (Stock) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      disabled={saving}
                      value={product.quantity}
                      onChange={(e) =>
                        update(
                          "quantity",
                          Math.max(0, Math.floor(Number(e.target.value) || 0))
                        )
                      }
                      className={`${inputClass} pr-12 text-base font-semibold ${fieldErrors.quantity ? inputErrorClass : ""}`}
                    />
                    <Package
                      className={`absolute top-1/2 right-4 h-5 w-5 shrink-0 -translate-y-1/2 ${stockColor}`}
                    />
                  </div>
                  <FieldError message={fieldErrors.quantity} />
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
