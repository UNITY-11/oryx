"use client";

import { useEffect, useState } from "react";
import { Loader2, Minus, Package, Plus, X } from "lucide-react";

import { updateProduct } from "../api";
import type { Product } from "../types";

type ProductQuantityModalProps = {
  product: Product;
  onClose: () => void;
  onSaved: (product: Product) => void;
};

export function ProductQuantityModal({
  product,
  onClose,
  onSaved,
}: ProductQuantityModalProps) {
  const [quantity, setQuantity] = useState(Number(product.quantity) || 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setQuantity(Number(product.quantity) || 0);
    setError(null);
  }, [product]);

  const adjust = (delta: number) => {
    setQuantity((prev) => Math.max(0, Math.floor(prev + delta)));
    setError(null);
  };

  const handleSave = async () => {
    const next = Math.max(0, Math.floor(quantity));
    if (next === Number(product.quantity)) {
      onClose();
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const updated = await updateProduct(product.id, { quantity: next });
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update quantity"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={() => {
        if (!saving) onClose();
      }}
    >
      <div
        className="border-primary/10 w-full max-w-sm rounded-t-[28px] border bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-qty-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3
              id="product-qty-title"
              className="text-primary-dark font-serif text-lg font-semibold"
            >
              Update Quantity
            </h3>
            <p className="text-text-secondary mt-0.5 truncate text-sm">
              {product.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="text-text-secondary hover:bg-primary/5 hover:text-primary-dark flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-5 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => adjust(-1)}
            disabled={saving || quantity <= 0}
            className="border-primary/20 text-primary hover:bg-primary/5 flex h-12 w-12 items-center justify-center rounded-full border transition-colors disabled:opacity-40"
            aria-label="Decrease quantity"
          >
            <Minus className="h-5 w-5" />
          </button>

          <div className="flex min-w-[5.5rem] flex-col items-center">
            <div className="text-primary-dark flex items-center gap-1.5 font-serif text-3xl font-semibold tabular-nums">
              <Package className="text-primary h-5 w-5" />
              {quantity}
            </div>
            <p className="text-text-secondary mt-1 text-[11px]">in stock</p>
          </div>

          <button
            type="button"
            onClick={() => adjust(1)}
            disabled={saving}
            className="border-primary/20 text-primary hover:bg-primary/5 flex h-12 w-12 items-center justify-center rounded-full border transition-colors disabled:opacity-40"
            aria-label="Increase quantity"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-5 flex justify-center gap-2">
          {[-5, -10, 5, 10].map((delta) => (
            <button
              key={delta}
              type="button"
              onClick={() => adjust(delta)}
              disabled={saving || (delta < 0 && quantity <= 0)}
              className="border-primary/15 text-primary-dark hover:bg-primary/5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-40"
            >
              {delta > 0 ? `+${delta}` : delta}
            </button>
          ))}
        </div>

        {error && (
          <p className="mb-4 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-center text-xs font-medium text-red-600">
            {error}
          </p>
        )}

        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="border-primary/20 text-primary hover:bg-primary/5 h-11 flex-1 rounded-full border text-sm font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-primary flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
