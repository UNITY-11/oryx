import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
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
  PlayCircle,
  RefreshCw,
} from "lucide-react";

import { reorderHeroItems } from "../api";
import { HeroItem } from "../types";

interface HeroGridProps {
  loading: boolean;
  error: string | null;
  items: HeroItem[];
  onRetry?: () => void;
}

function SortableHeroCard({ item }: { item: HeroItem }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group from-primary/10 to-primary/5 relative aspect-video overflow-hidden rounded-2xl bg-gradient-to-br shadow-sm transition-all sm:rounded-3xl ${
        isDragging ? "scale-105 shadow-lg" : "hover:shadow-md"
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 z-20 cursor-grab rounded-lg bg-white/30 p-2.5 opacity-70 backdrop-blur-sm transition-opacity active:cursor-grabbing md:opacity-0 md:group-hover:opacity-100"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-5 w-5 text-white drop-shadow" />
      </div>

      <Link href={`/hero/${item.id}`} className="block h-full w-full">
        {item.type === "video" ? (
          <>
            <video
              src={item.src}
              className="absolute inset-0 h-full w-full object-cover opacity-70"
              muted
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <PlayCircle className="h-12 w-12 text-white opacity-80 drop-shadow-md transition-transform" />
            </div>
          </>
        ) : item.src ? (
          <img
            src={item.src}
            alt={item.title || "Slide image"}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon className="text-primary/20 h-10 w-10" />
          </div>
        )}

        <div className="from-primary-dark/80 via-primary-dark/30 absolute inset-0 flex flex-col justify-end bg-gradient-to-t to-transparent p-3 opacity-100 sm:p-4 md:opacity-0 md:transition-opacity md:duration-300 md:group-hover:opacity-100">
          <p className="text-sm leading-tight font-semibold text-white drop-shadow-sm">
            {item.title || "Untitled"}
          </p>
        </div>
      </Link>
    </div>
  );
}

function AddSlideCard() {
  return (
    <Link
      href="/hero/new"
      className="group border-primary/30 hover:border-primary/60 hover:bg-primary/5 text-primary/50 hover:text-primary flex aspect-video flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all sm:rounded-3xl"
    >
      <div className="bg-primary/10 group-hover:bg-primary/20 mb-3 flex h-12 w-12 items-center justify-center rounded-full transition-colors">
        <span className="text-2xl leading-none font-light">+</span>
      </div>
      <span className="px-4 text-center text-sm font-medium">Add Slide</span>
    </Link>
  );
}

export function HeroGrid({
  loading,
  error,
  items: initialItems,
  onRetry,
}: HeroGridProps) {
  const [items, setItems] = useState(initialItems);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const closeToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

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

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      const reorderedItems = newItems.map((item, idx) => ({
        ...item,
        order: idx + 1,
      }));
      const previousItems = items;
      setItems(reorderedItems);

      setSaving(true);
      try {
        await reorderHeroItems(
          reorderedItems.map((i) => ({ id: i.id, order: i.order }))
        );
        setToast({ type: "success", message: "Slide order saved" });
      } catch (err) {
        setItems(previousItems);
        setToast({
          type: "error",
          message:
            err instanceof Error ? err.message : "Failed to save slide order",
        });
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div className="flex h-full flex-col space-y-4 sm:space-y-6">
      <Toast toast={toast} onClose={closeToast} />

      <div className="border-primary/10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-white shadow-sm sm:rounded-[32px]">
        <div className="border-primary/10 flex shrink-0 flex-col gap-2 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <h2 className="text-primary flex items-center gap-2 text-lg font-medium sm:text-xl">
            Hero Slides
            {saving && (
              <Loader2 className="text-text-secondary h-4 w-4 animate-spin" />
            )}
          </h2>
          <p className="text-text-secondary text-xs sm:text-sm">
            Drag slides to reorder · tap to edit
          </p>
        </div>

        <div className="scrollbar-hide flex-1 overflow-auto p-4 sm:p-6">
          {loading ? (
            <div className="text-text-secondary flex h-48 flex-col items-center justify-center text-center">
              <Loader2 className="text-primary mb-3 h-8 w-8 animate-spin" />
              <p className="text-sm font-medium">Loading hero slides...</p>
            </div>
          ) : error ? (
            <div className="flex h-48 flex-col items-center justify-center px-4 text-center">
              <AlertCircle className="mb-3 h-8 w-8 text-red-500" />
              <p className="text-primary-dark mb-1 text-sm font-semibold">
                Couldn&apos;t load slides
              </p>
              <p className="text-text-secondary mb-5 max-w-sm text-sm">
                {error}
              </p>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="border-primary text-primary hover:bg-primary/5 inline-flex h-10 items-center gap-2 rounded-full border px-5 text-sm font-semibold"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try again
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
              <AddSlideCard />

              {items.length === 0 ? (
                <div className="border-primary/10 col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-10 text-center sm:rounded-3xl sm:py-12">
                  <ImageIcon className="text-primary/20 mb-3 h-10 w-10" />
                  <p className="text-primary-dark mb-1 text-sm font-semibold">
                    No hero slides yet
                  </p>
                  <p className="text-text-secondary max-w-xs text-xs sm:text-sm">
                    Add your first slide to showcase featured content on the
                    homepage.
                  </p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={items.map((i) => i.id)}
                    strategy={rectSortingStrategy}
                  >
                    {items.map((item) => (
                      <SortableHeroCard key={item.id} item={item} />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
