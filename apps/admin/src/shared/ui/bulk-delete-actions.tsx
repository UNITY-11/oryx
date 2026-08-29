"use client";

import { useState } from "react";
import type { useBulkSelection } from "@/shared/hooks/use-bulk-selection";
import { deleteMany } from "@/shared/lib/bulk-delete";
import { BulkDeleteModal } from "@/shared/ui/bulk-delete-modal";
import { RowSelectCheckbox } from "@/shared/ui/row-select-checkbox";
import { Trash2, X } from "lucide-react";

type BulkSelection = ReturnType<typeof useBulkSelection>;

type BulkDeleteToolbarProps = {
  selection: BulkSelection;
  itemIds: string[];
  entityLabel: string;
  deleteOne: (id: string) => Promise<void>;
  onDeleted: (deletedIds: string[]) => void;
  onError?: (message: string) => void;
  className?: string;
};

export function BulkDeleteToolbar({
  selection,
  itemIds,
  entityLabel,
  deleteOne,
  onDeleted,
  onError,
  className = "",
}: BulkDeleteToolbarProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (itemIds.length === 0) return null;

  const hasSelection = selection.count > 0;

  const handleConfirm = async () => {
    const ids = selection.selectedArray;
    if (ids.length === 0) return;
    setDeleting(true);
    try {
      const { deleted, failed } = await deleteMany(ids, deleteOne);
      if (deleted.length > 0) {
        onDeleted(deleted);
        selection.clear();
        setModalOpen(false);
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

  return (
    <>
      <div
        className={`border-primary/10 flex w-full flex-wrap items-center justify-between gap-3 rounded-xl border px-3 py-2.5 transition-colors sm:px-4 sm:py-3 ${
          hasSelection
            ? "border-primary/25 bg-primary/8 shadow-sm"
            : "bg-[#fcf4f0]/70"
        } ${className}`}
      >
        <label className="text-text-secondary flex cursor-pointer items-center gap-2.5 text-sm">
          <RowSelectCheckbox
            checked={selection.allSelected}
            indeterminate={selection.isIndeterminate}
            onChange={() =>
              selection.allSelected ? selection.clear() : selection.selectAll()
            }
            aria-label="Select all on this page"
          />
          <span className="font-medium">Select all on this page</span>
        </label>

        {hasSelection && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-primary-dark text-sm font-semibold tabular-nums">
              {selection.count} selected
            </span>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
            <button
              type="button"
              onClick={selection.clear}
              className="text-text-secondary hover:text-primary-dark inline-flex items-center gap-1 text-sm font-medium transition-colors"
              aria-label="Clear selection"
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        )}
      </div>

      <BulkDeleteModal
        open={modalOpen}
        count={selection.count}
        entityLabel={entityLabel}
        deleting={deleting}
        onCancel={() => setModalOpen(false)}
        onConfirm={handleConfirm}
      />
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
