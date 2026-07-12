export type Category = "Massage" | "Facial" | "Nails" | "Hair" | "Products" | "Spa" | "Therapy";

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
}

export interface CartItem {
  id: string; // Unique cart item ID (since the same item could be added with different options)
  item: Item;
  quantity: number;
  selectedVariant?: ItemVariant;
  selectedAddons?: ItemVariant[];
  totalPrice: number; // Calculated price for this specific configured item
}
