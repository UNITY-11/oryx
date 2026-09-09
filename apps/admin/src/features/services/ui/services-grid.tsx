"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBulkSelectMode } from "@/shared/hooks/use-bulk-select-mode";
import { useBulkSelection } from "@/shared/hooks/use-bulk-selection";
import {
  BulkDeleteToolbar,
  BulkSelectCheckbox,
  BulkSelectControls,
} from "@/shared/ui/bulk-delete-actions";
import { ListPagination } from "@/shared/ui/list-pagination";
import { Toast, type ToastState } from "@/shared/ui/toast";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  AlertCircle,
  GripVertical,
  ImageIcon,
  Loader2,
  Search,
  Star,
} from "lucide-react";

import { deleteService, reorderServices } from "../api";
import { Service } from "../types";

interface ServicesGridProps {
  loading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filtered: Service[];
  activeCount: number;
  inactiveCount: number;
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  totalItems: number;
  from: number;
  to: number;
  hasPrev: boolean;
  hasNext: boolean;
  onItemsDeleted?: (ids: string[]) => void;
  onItemsReordered?: (items: Service[]) => void;
}

function SortableServiceCard({
  service,
  selection,
  canDrag,
  selectMode,
  onOpen,
}: {
  service: Service;
  selection: ReturnType<typeof useBulkSelection>;
  canDrag: boolean;
  selectMode: boolean;
  onOpen: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: service.id,
    disabled: !canDrag,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  const isSelected = selection.isSelected(service.id);
  const showCheckbox = selectMode || selection.count > 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group from-primary/10 to-primary/5 relative aspect-[3/4] overflow-hidden rounded-2xl bg-gradient-to-br shadow-sm transition-all sm:rounded-3xl ${
        isDragging ? "scale-105 shadow-lg" : "hover:shadow-md"
      } ${isSelected ? "ring-primary ring-2 ring-offset-1" : ""}`}
    >
      <button
        type="button"
        onClick={onOpen}
        className="absolute inset-0 z-0 cursor-pointer"
        aria-label={`Edit ${service.name}`}
      />

      {service.image ? (
        <img
          src={service.image}
          alt={service.name}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <ImageIcon className="text-primary/20 h-8 w-8 sm:h-10 sm:w-10" />
        </div>
      )}

      <div className="from-primary-dark/80 via-primary-dark/20 pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t to-transparent p-2.5 opacity-100 transition-opacity duration-300 sm:p-4 md:via-transparent md:opacity-0 md:group-hover:opacity-100">
        <p className="line-clamp-2 text-xs leading-tight font-semibold text-white sm:text-sm">
          {service.name}
        </p>
        {service.options.length > 0 && (
          <p className="mt-0.5 text-[10px] font-medium text-white/80 sm:text-xs">
            {service.options.length} option
            {service.options.length === 1 ? "" : "s"}
          </p>
        )}
      </div>

      {service.status === "Inactive" && (
        <>
          <div className="pointer-events-none absolute inset-0 bg-white/50 backdrop-blur-[1px]" />
          <span
            className={`absolute z-10 rounded-full bg-gray-800/80 px-2 py-0.5 text-[9px] font-bold tracking-wide text-white uppercase sm:text-[10px] ${
              showCheckbox ? "top-2 left-10 sm:left-11" : "top-2 left-2"
            }`}
          >
            Inactive
          </span>
        </>
      )}

      {service.featured && service.status !== "Inactive" && (
        <span
          className={`absolute z-10 inline-flex items-center gap-1 rounded-full bg-amber-500/90 px-2 py-0.5 text-[9px] font-bold tracking-wide text-white uppercase sm:text-[10px] ${
            showCheckbox ? "top-2 left-10 sm:left-11" : "top-2 left-2"
          }`}
        >
          <Star className="h-2.5 w-2.5 fill-current" />
          Featured
        </span>
      )}

      {canDrag && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 right-2 z-20 cursor-grab rounded-lg bg-white/30 p-2 opacity-80 backdrop-blur-sm transition-opacity active:cursor-grabbing md:opacity-0 md:group-hover:opacity-100"
          aria-label={`Drag to reorder ${service.name}`}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4 text-white drop-shadow sm:h-5 sm:w-5" />
        </div>
      )}

      {showCheckbox && (
        <div
          className="absolute top-2 left-2 z-20"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="rounded-md bg-white/95 p-1 shadow-sm backdrop-blur-sm">
            <BulkSelectCheckbox
              selection={selection}
              id={service.id}
              label={`Select ${service.name}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function ServicesGrid({
  loading,
  error,
  searchQuery,
  setSearchQuery,
  filtered,
  activeCount,
  inactiveCount,
  page,
  setPage,
  totalPages,
  totalItems,
  from,
  to,
  hasPrev,
  hasNext,
  onItemsDeleted,
  onItemsReordered,
}: ServicesGridProps) {
  const router = useRouter();
  const [items, setItems] = useState(filtered);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const closeToast = useCallback(() => setToast(null), []);
  const selection = useBulkSelection(items.map((s) => s.id));
  const select = useBulkSelectMode(selection);
  const canDrag =
    !searchQuery.trim() && !select.selectMode && selection.count === 0;

  useEffect(() => {
    setItems(filtered);
  }, [filtered]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!canDrag || !over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const newItems = arrayMove(items, oldIndex, newIndex);
    const orderBase = from > 0 ? from : 1;
    const reorderedItems = newItems.map((item, idx) => ({
      ...item,
      order: orderBase + idx,
    }));
    const previousItems = items;
    setItems(reorderedItems);
    onItemsReordered?.(reorderedItems);

    setSaving(true);
    try {
      await reorderServices(
        reorderedItems.map((i) => ({ id: i.id, order: i.order }))
      );
      setToast({ type: "success", message: "Service order saved" });
    } catch (err) {
      setItems(previousItems);
      onItemsReordered?.(previousItems);
      setToast({
        type: "error",
        message:
          err instanceof Error ? err.message : "Failed to save service order",
      });
    } finally {
      setSaving(false);
    }
  };

  const hasItems = !loading && items.length > 0;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <Toast toast={toast} onClose={closeToast} />

      <div className="border-primary/10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] border bg-white shadow-sm sm:rounded-[32px]">
        <div className="border-primary/10 flex shrink-0 flex-col gap-2 border-b p-3 sm:gap-3 sm:p-4 md:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="relative min-w-0 flex-1 md:max-w-sm">
              <Search className="text-primary absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 sm:left-4 sm:h-5 sm:w-5" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-primary focus:ring-primary text-primary-dark placeholder:text-primary/70 w-full rounded-full border bg-transparent py-2.5 pr-4 pl-10 text-sm focus:ring-1 focus:outline-none sm:py-3 sm:pl-12"
              />
            </div>

            {hasItems && (
              <BulkSelectControls
                selectMode={select.selectMode}
                allSelected={selection.allSelected}
                onSelectToggle={select.toggleSelect}
                onSelectAll={select.selectAll}
              />
            )}

            <p className="text-text-secondary hidden items-center gap-2 text-xs lg:flex lg:text-sm">
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {canDrag
                ? "Drag to reorder · tap to edit"
                : select.showCheckboxes
                  ? "Tap checkboxes to select"
                  : "Clear search to reorder"}
            </p>
          </div>

          {hasItems && (
            <BulkDeleteToolbar
              selection={selection}
              itemIds={items.map((s) => s.id)}
              entityLabel="services"
              deleteOne={deleteService}
              onDeleted={(ids) => {
                setItems((prev) => prev.filter((s) => !ids.includes(s.id)));
                onItemsDeleted?.(ids);
                setToast({
                  type: "success",
                  message: `Deleted ${ids.length} service(s)`,
                });
              }}
              onClear={select.exit}
              onError={(msg) => setToast({ type: "error", message: msg })}
            />
          )}
        </div>

        <div className="scrollbar-hide flex-1 overflow-auto p-3 sm:p-4 md:p-6">
          {loading ? (
            <div className="text-text-secondary flex h-48 flex-col items-center justify-center px-4 text-center">
              <Loader2 className="text-primary mb-3 h-8 w-8 animate-spin" />
              <p className="text-sm">Loading services...</p>
            </div>
          ) : error ? (
            <div className="flex h-48 flex-col items-center justify-center px-4 text-center text-red-500">
              <AlertCircle className="mb-3 h-8 w-8" />
              <p className="text-sm">{error}</p>
            </div>
          ) : totalItems === 0 ? (
            <div className="text-text-secondary flex h-48 flex-col items-center justify-center px-4 text-center">
              <ImageIcon className="text-primary/20 mb-3 h-10 w-10" />
              <p className="text-sm">
                No services found. Try adjusting your filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:gap-5 lg:grid-cols-4 xl:grid-cols-5">
              <Link
                href="/services/new"
                className="group border-primary/30 hover:border-primary/60 hover:bg-primary/5 text-primary/50 hover:text-primary flex aspect-[3/4] flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all sm:rounded-3xl"
              >
                <div className="bg-primary/10 group-hover:bg-primary/20 mb-2 flex h-10 w-10 items-center justify-center rounded-full transition-colors sm:mb-3 sm:h-12 sm:w-12">
                  <span className="text-xl leading-none font-light sm:text-2xl">
                    +
                  </span>
                </div>
                <span className="px-2 text-center text-xs font-medium sm:px-4 sm:text-sm">
                  Add Service
                </span>
              </Link>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={items.map((i) => i.id)}
                  strategy={rectSortingStrategy}
                >
                  {items.map((service) => (
                    <SortableServiceCard
                      key={service.id}
                      service={service}
                      selection={selection}
                      canDrag={canDrag}
                      selectMode={select.showCheckboxes}
                      onOpen={() => router.push(`/services/${service.id}`)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>

        <ListPagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          from={from}
          to={to}
          hasPrev={hasPrev}
          hasNext={hasNext}
          onPageChange={setPage}
        />

        <div className="border-primary/5 text-text-secondary flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-t px-3 py-2.5 text-[11px] sm:gap-4 sm:px-6 sm:py-3 sm:text-xs">
          <span className="flex items-center gap-1">
            <Star className="text-primary h-3 w-3" />
            {activeCount} Active
          </span>
          <span>{inactiveCount} Inactive</span>
          <span className="ml-auto">{totalItems} shown</span>
        </div>
      </div>
    </div>
  );
}
