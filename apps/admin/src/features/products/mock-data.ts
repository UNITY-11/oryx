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

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Rose Hip Facial Oil",
    brand: "Oryx Naturals",
    volumeOrWeight: "30 ml",
    quantity: 24,
    price: 150,
    category: "Skincare",
    image: null,
    status: "Active",
  },
  {
    id: "prod-2",
    name: "Lavender Body Scrub",
    brand: "Oryx Naturals",
    volumeOrWeight: "250 g",
    quantity: 16,
    price: 95,
    category: "Body Care",
    image: null,
    status: "Active",
  },
  {
    id: "prod-3",
    name: "Argan Shampoo",
    brand: "Desert Essence",
    volumeOrWeight: "500 ml",
    quantity: 8,
    price: 120,
    category: "Hair Care",
    image: null,
    status: "Active",
  },
  {
    id: "prod-4",
    name: "Eucalyptus Essential Oil",
    brand: "Pure Botanics",
    volumeOrWeight: "15 ml",
    quantity: 32,
    price: 65,
    category: "Aromatherapy",
    image: null,
    status: "Active",
  },
  {
    id: "prod-5",
    name: "Bamboo Massage Roller",
    brand: "Oryx Spa Tools",
    volumeOrWeight: "200 g",
    quantity: 5,
    price: 45,
    category: "Accessories",
    image: null,
    status: "Active",
  },
  {
    id: "prod-6",
    name: "Collagen Booster Serum",
    brand: "Oryx Naturals",
    volumeOrWeight: "50 ml",
    quantity: 0,
    price: 210,
    category: "Skincare",
    image: null,
    status: "Inactive",
  },
  {
    id: "prod-7",
    name: "Peppermint Foot Cream",
    brand: "Desert Essence",
    volumeOrWeight: "100 ml",
    quantity: 19,
    price: 75,
    category: "Body Care",
    image: null,
    status: "Active",
  },
  {
    id: "prod-8",
    name: "Biotin Hair Supplement",
    brand: "Wellness Co",
    volumeOrWeight: "60 capsules",
    quantity: 11,
    price: 180,
    category: "Supplements",
    image: null,
    status: "Active",
  },
];
