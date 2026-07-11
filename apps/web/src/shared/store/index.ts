import { create } from "zustand";
import { Item, User, CartItem } from "../types";

// User Store
interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));

// Cart Store
interface CartState {
  items: CartItem[];
  addItem: (item: Item) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.item.id === item.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { item, quantity: 1 }] };
    }),
  removeItem: (itemId) =>
    set((state) => ({
      items: state.items.filter((i) => i.item.id !== itemId),
    })),
  clearCart: () => set({ items: [] }),
  getTotal: () => {
    return get().items.reduce((total, i) => total + i.item.price * i.quantity, 0);
  },
}));

// Favorites Store
interface FavoritesState {
  favorites: Item[];
  toggleFavorite: (item: Item) => void;
  isFavorite: (itemId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  toggleFavorite: (item) =>
    set((state) => {
      const exists = state.favorites.find((i) => i.id === item.id);
      if (exists) {
        return { favorites: state.favorites.filter((i) => i.id !== item.id) };
      }
      return { favorites: [...state.favorites, item] };
    }),
  isFavorite: (itemId) => {
    return get().favorites.some((i) => i.id === itemId);
  },
}));
