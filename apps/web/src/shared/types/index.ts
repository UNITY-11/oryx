export type Category = "Massage" | "Facial" | "Nails" | "Hair" | "Products" | "Spa" | "Therapy";

export interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  duration?: number; // in minutes, mainly for services
  category: Category;
  imageUrl: string;
  isProduct?: boolean;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  channel: "SMS" | "WhatsApp";
}

export interface CartItem {
  item: Item;
  quantity: number;
}
