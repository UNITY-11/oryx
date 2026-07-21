import { useState, useEffect } from "react";
import Link from "next/link";
import { AlertCircle, GripVertical, ImageIcon, Loader2, PlayCircle } from "lucide-react";
import { HeroItem } from "../types";
import { reorderHeroItems } from "../api";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface HeroGridProps {
  loading: boolean;
  error: string | null;
  items: HeroItem[];
}

function SortableHeroCard({ item }: { item: HeroItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
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
      className={`group from-primary/10 to-primary/5 relative overflow-hidden rounded-3xl bg-gradient-to-br shadow-sm transition-all aspect-video ${
        isDragging ? "shadow-lg scale-105" : "hover:shadow-md"
      }`}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="absolute top-2 right-2 z-20 p-2 bg-white/20 hover:bg-white/40 rounded-lg cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
      >
        <GripVertical className="w-5 h-5 text-white" />
      </div>

      <Link href={`/hero/${item.id}`} className="block w-full h-full">
        {item.type === "video" ? (
          <>
            <video src={item.src} className="absolute inset-0 h-full w-full object-cover opacity-70" muted />
            <div className="absolute inset-0 flex items-center justify-center">
              <PlayCircle className="text-white drop-shadow-md h-12 w-12 opacity-80 transition-transform" />
            </div>
          </>
        ) : item.src ? (
          <img src={item.src} alt={item.title || "Slide image"} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon className="text-primary/20 h-10 w-10" />
          </div>
        )}

        <div className="from-primary-dark/80 absolute inset-0 flex flex-col justify-end bg-gradient-to-t via-primary-dark/30 to-transparent p-4 transition-opacity duration-300">
          <p className="text-sm leading-tight font-semibold text-white drop-shadow-sm">
            {item.title || "Untitled"}
          </p>
        </div>
      </Link>
    </div>
  );
}

export function HeroGrid({ loading, error, items: initialItems }: HeroGridProps) {
  const [items, setItems] = useState(initialItems);
  const [saving, setSaving] = useState(false);

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
      
      // Update order index purely based on new array position
      const reorderedItems = newItems.map((item, idx) => ({ ...item, order: idx + 1 }));
      setItems(reorderedItems);

      setSaving(true);
      try {
        await reorderHeroItems(reorderedItems.map(i => ({ id: i.id, order: i.order })));
      } catch (err) {
        console.error(err);
        setItems(items); // Revert on failure
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div className="flex h-full flex-col space-y-6">
      <div className="border-primary/10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[32px] border bg-white shadow-sm">
        <div className="border-primary/10 flex shrink-0 flex-col items-center justify-between border-b p-4 md:flex-row md:p-6">
          <h2 className="text-xl font-medium text-primary flex items-center gap-2">
            Hero Slides {saving && <Loader2 className="w-4 h-4 animate-spin text-text-secondary" />}
          </h2>
        </div>

        <div className="scrollbar-hide flex-1 overflow-auto p-4 md:p-6">
          {loading ? (
            <div className="text-text-secondary flex h-48 flex-col items-center justify-center">
              <Loader2 className="text-primary mb-3 h-8 w-8 animate-spin" />
              <p>Loading hero items...</p>
            </div>
          ) : error ? (
            <div className="flex h-48 flex-col items-center justify-center text-red-500">
              <AlertCircle className="mb-3 h-8 w-8" />
              <p>{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <Link
                href="/hero/new"
                className="group border-primary/30 hover:border-primary/60 hover:bg-primary/5 text-primary/50 hover:text-primary flex flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-all aspect-video"
              >
                <div className="bg-primary/10 group-hover:bg-primary/20 mb-3 flex h-12 w-12 items-center justify-center rounded-full transition-colors">
                  <span className="text-2xl leading-none font-light">+</span>
                </div>
                <span className="px-4 text-center text-sm font-medium">Add Slide</span>
              </Link>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={items.map(i => i.id)} strategy={rectSortingStrategy}>
                  {items.map((item) => (
                    <SortableHeroCard key={item.id} item={item} />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
