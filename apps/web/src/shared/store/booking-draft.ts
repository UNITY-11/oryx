"use client";

import type { Item, ItemVariant } from "@/shared/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DraftService = {
  item: Item;
  selectedOptions: ItemVariant[];
  totalPrice: number;
};

function priceFor(item: Item, selectedOptions: ItemVariant[]): number {
  if (selectedOptions.length > 0) {
    return selectedOptions.reduce((sum, opt) => sum + opt.price, 0);
  }
  return item.price;
}

interface BookingDraftState {
  services: DraftService[];
  upsertService: (item: Item, selectedOptions?: ItemVariant[]) => void;
  removeService: (itemId: string) => void;
  clear: () => void;
  getTotal: () => number;
}

export const useBookingDraftStore = create<BookingDraftState>()(
  persist(
    (set, get) => ({
      services: [],
      upsertService: (item, selectedOptions = []) =>
        set((state) => {
          const next: DraftService = {
            item,
            selectedOptions,
            totalPrice: priceFor(item, selectedOptions),
          };
          const idx = state.services.findIndex((s) => s.item.id === item.id);
          if (idx >= 0) {
            const services = [...state.services];
            services[idx] = next;
            return { services };
          }
          return { services: [...state.services, next] };
        }),
      removeService: (itemId) =>
        set((state) => ({
          services: state.services.filter((s) => s.item.id !== itemId),
        })),
      clear: () => set({ services: [] }),
      getTotal: () => get().services.reduce((sum, s) => sum + s.totalPrice, 0),
    }),
    { name: "booking-draft-storage" }
  )
);
