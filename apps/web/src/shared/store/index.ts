import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Item, User, CartItem, ItemVariant, Booking } from "../types";

// User Store
interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: "user-storage",
    }
  )
);

// Cart Store
interface CartState {
  items: CartItem[];
  addItem: (item: Item, selectedVariant?: ItemVariant, selectedAddons?: ItemVariant[]) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, selectedVariant, selectedAddons = []) =>
        set((state) => {
          // Calculate total price for this configured item
          let totalPrice = selectedVariant ? selectedVariant.price : item.price;
          selectedAddons.forEach((addon) => { totalPrice += addon.price; });

          // Create a unique hash for this configuration to group identical items
          const addonIds = selectedAddons.map(a => a.id).sort().join('-');
          const cartItemId = `${item.id}-${selectedVariant?.id || 'base'}-${addonIds}`;

          const existing = state.items.find((i) => i.item.id === item.id);
          if (existing) {
            return state; // Do nothing if the service is already in the cart
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
    }),
    {
      name: "cart-storage",
    }
  )
);



// Booking Store
interface BookingState {
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  removeBooking: (id: string) => void;
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      bookings: [],
      addBooking: (booking) =>
        set((state) => ({ bookings: [booking, ...state.bookings] })),
      removeBooking: (id) =>
        set((state) => ({ bookings: state.bookings.filter((b) => b.id !== id) })),
    }),
    {
      name: "booking-storage",
    }
  )
);
