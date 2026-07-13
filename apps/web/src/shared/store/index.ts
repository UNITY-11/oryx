import { create } from "zustand";
import { Item, User, CartItem, ItemVariant } from "../types";

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
  addItem: (item: Item, selectedVariant?: ItemVariant, selectedAddons?: ItemVariant[]) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (item, selectedVariant, selectedAddons = []) =>
    set((state) => {
      // Calculate total price for this configured item
      let totalPrice = selectedVariant ? selectedVariant.price : item.price;
      selectedAddons.forEach((addon) => { totalPrice += addon.price; });

      // Create a unique hash for this configuration to group identical items
      const addonIds = selectedAddons.map(a => a.id).sort().join('-');
      const cartItemId = `${item.id}-${selectedVariant?.id || 'base'}-${addonIds}`;

      const existing = state.items.find((i) => i.id === cartItemId);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === cartItemId ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { id: cartItemId, item, quantity: 1, selectedVariant, selectedAddons, totalPrice }] };
    }),
  removeItem: (cartItemId) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== cartItemId),
    })),
  clearCart: () => set({ items: [] }),
  getTotal: () => {
    return get().items.reduce((total, i) => total + i.totalPrice * i.quantity, 0);
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
