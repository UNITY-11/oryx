export type ProductCategory =
  | "Skincare"
  | "Body Care"
  | "Hair Care"
  | "Aromatherapy"
  | "Accessories"
  | "Supplements";

export interface Product {
  id: string;
  name: string;
  brand: string;
  volumeOrWeight: string;
  quantity: number;
  price: number;
  category: ProductCategory;
  image: string | null;
  status: "Active" | "Inactive";
}
