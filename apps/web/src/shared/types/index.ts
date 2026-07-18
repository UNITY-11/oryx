export type Category = string;

export interface ItemVariant {
  id: string;
  name: string;
  price: number;
  duration?: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  price: number; // Base price
  duration?: number; // Base duration
  category: Category;
  imageUrl: string;
  isProduct?: boolean;
  variants?: ItemVariant[];
  addons?: ItemVariant[];
}

export interface User {
  id: string;
  name: string;
  phone: string;
  channel: "SMS" | "WhatsApp";
  email?: string;
  age?: string;
}

export interface CartItem {
  id: string; // Unique cart item ID (since the same item could be added with different options)
  item: Item;
  quantity: number;
  selectedVariant?: ItemVariant;
  selectedAddons?: ItemVariant[];
  totalPrice: number; // Calculated price for this specific configured item
}

export interface Booking {
  id: string;
  cartItems: CartItem[];
  totalPrice: number;
  date: string;
  time: string;
  status: "upcoming" | "completed";
  bookingRef: string;
}
