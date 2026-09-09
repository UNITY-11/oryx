"use client";

import { useState } from "react";
import type { useBulkSelection } from "@/shared/hooks/use-bulk-selection";
import { deleteMany } from "@/shared/lib/bulk-delete";
import { ActionPinModal } from "@/shared/ui/action-pin-modal";
import { BulkDeleteModal } from "@/shared/ui/bulk-delete-modal";
import { RowSelectCheckbox } from "@/shared/ui/row-select-checkbox";
import { Trash2, X } from "lucide-react";

type BulkSelection = ReturnType<typeof useBulkSelection>;

export function BulkSelectControls({
  selectMode,
  allSelected,
  onSelectToggle,
  onSelectAll,
  className = "",
}: {
  selectMode: boolean;
  allSelected: boolean;
  onSelectToggle: () => void;
  onSelectAll: () => void;
  className?: string;
}) {
  return (
    <div
      className={`border-primary/15 flex shrink-0 items-center gap-1 rounded-full border bg-[#fcf4f0]/80 p-1 ${className}`}
    >
      <button
        type="button"
        onClick={onSelectToggle}
        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:px-3.5 sm:text-sm ${
          selectMode
            ? "bg-primary text-white shadow-sm"
            : "text-text-secondary hover:text-primary-dark hover:bg-white/80"
        }`}
      >
        Select
      </button>
      <button
        type="button"
        onClick={onSelectAll}
        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:px-3.5 sm:text-sm ${
          allSelected
            ? "bg-primary text-white shadow-sm"
            : "text-text-secondary hover:text-primary-dark hover:bg-white/80"
        }`}
      >
        Select all
      </button>
    </div>
  );
}

type BulkDeleteToolbarProps = {
  selection: BulkSelection;
  itemIds: string[];
  entityLabel: string;
  deleteOne: (id: string) => Promise<void>;
  onDeleted: (deletedIds: string[]) => void;
  onError?: (message: string) => void;
  onClear?: () => void;
  /** When true, require admin PIN after confirm before deleting. */
  requirePin?: boolean;
  className?: string;
};

/** Compact delete/clear bar — only renders when items are selected. */
export function BulkDeleteToolbar({
  selection,
  itemIds,
  entityLabel,
  deleteOne,
  onDeleted,
  onError,
  onClear,
  requirePin = false,
  className = "",
}: BulkDeleteToolbarProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (itemIds.length === 0 || selection.count === 0) return null;

  const handleConfirm = async () => {
    const ids = selection.selectedArray;
    if (ids.length === 0) return;
    setDeleting(true);
    try {
      const { deleted, failed } = await deleteMany(ids, deleteOne);
      if (deleted.length > 0) {
        onDeleted(deleted);
        if (onClear) onClear();
        else selection.clear();
        setModalOpen(false);
        setPinOpen(false);
      }
      if (failed.length > 0) {
        onError?.(
          `Deleted ${deleted.length} item(s). Failed to delete ${failed.length}.`
        );
      }
    } catch (err) {
      onError?.(
        err instanceof Error ? err.message : "Failed to delete selected items"
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleClear = () => {
    if (onClear) onClear();
    else selection.clear();
  };

  const handleModalConfirm = () => {
    if (requirePin) {
      setModalOpen(false);
      setPinOpen(true);
      return;
    }
    void handleConfirm();
  };

  return (
    <>
      <div
        className={`border-primary/20 bg-primary/8 flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2 sm:gap-3 ${className}`}
      >
        <span className="text-primary-dark text-sm font-semibold tabular-nums">
          {selection.count} selected
        </span>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="text-text-secondary hover:text-primary-dark inline-flex items-center gap-1 text-sm font-medium transition-colors"
          aria-label="Clear selection"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </button>
      </div>

      <BulkDeleteModal
        open={modalOpen}
        count={selection.count}
        entityLabel={entityLabel}
        deleting={deleting}
        onCancel={() => setModalOpen(false)}
        onConfirm={handleModalConfirm}
      />

      {pinOpen && (
        <ActionPinModal
          onSuccess={() => {
            void handleConfirm();
          }}
          onCancel={() => setPinOpen(false)}
        />
      )}
    </>
  );
}

export function BulkSelectCheckbox({
  selection,
  id,
  label,
  className,
}: {
  selection: BulkSelection;
  id: string;
  label?: string;
  className?: string;
}) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-lg p-1 transition-colors hover:bg-black/5"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <RowSelectCheckbox
        checked={selection.isSelected(id)}
        onChange={() => selection.toggle(id)}
        aria-label={label ?? "Select row"}
        className={className}
      />
    </span>
  );
}
