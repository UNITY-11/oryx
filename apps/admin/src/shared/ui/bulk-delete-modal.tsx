"use client";

import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { createPortal } from "react-dom";

type BulkDeleteModalProps = {
  open: boolean;
  count: number;
  entityLabel: string;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function BulkDeleteModal({
  open,
  count,
  entityLabel,
  deleting,
  onCancel,
  onConfirm,
}: BulkDeleteModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open || !mounted) return null;

  const label = count === 1 ? entityLabel.replace(/s$/, "") : entityLabel;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={deleting ? undefined : onCancel}
    >
      <div
        className="border-primary/10 w-full max-w-md rounded-t-[28px] border bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center gap-3 sm:mb-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
            <Trash2 className="h-5 w-5" />
          </div>
          <h3 className="text-primary-dark font-serif text-lg font-semibold">
            Delete {count} {label}?
          </h3>
        </div>
        <p className="text-text-secondary text-sm leading-relaxed">
          This action cannot be undone. The selected items will be permanently
          removed.
        </p>
        <div className="mt-6 flex gap-2.5 sm:mt-8">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="border-primary/20 text-primary hover:bg-primary/5 h-11 flex-1 rounded-full border text-sm font-semibold transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-red-600 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {deleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
