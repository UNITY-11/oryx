export interface Product {
  id: string;
  name: string;
  description: string;
  image: string | null;
  stock: number;
  category: ProductCategory;
  status: "Active" | "Inactive";
}

export type ProductCategory =
  | "Skincare"
  | "Body Care"
  | "Hair Care"
  | "Aromatherapy"
  | "Accessories"
  | "Supplements";

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Rose Hip Facial Oil",
    description: "A luxurious facial oil rich in Omega-3 and Omega-6 fatty acids to deeply nourish and hydrate the skin.",
    image: null,
    stock: 24,
    category: "Skincare",
    status: "Active",
  },
  {
    id: "prod-2",
    name: "Lavender Body Scrub",
    description: "An exfoliating body scrub infused with lavender essential oil to smooth and soften skin.",
    image: null,
    stock: 16,
    category: "Body Care",
    status: "Active",
  },
  {
    id: "prod-3",
    name: "Argan Shampoo",
    description: "Sulfate-free shampoo enriched with argan oil for silky, frizz-free hair.",
    image: null,
    stock: 8,
    category: "Hair Care",
    status: "Active",
  },
  {
    id: "prod-4",
    name: "Eucalyptus Essential Oil",
    description: "Pure eucalyptus essential oil for aromatherapy, diffusers, and topical use.",
    image: null,
    stock: 32,
    category: "Aromatherapy",
    status: "Active",
  },
  {
    id: "prod-5",
    name: "Bamboo Massage Roller",
    description: "Handcrafted bamboo roller for targeted muscle relief and lymphatic drainage.",
    image: null,
    stock: 5,
    category: "Accessories",
    status: "Active",
  },
  {
    id: "prod-6",
    name: "Collagen Booster Serum",
    description: "A potent serum with marine collagen peptides to firm and plump the skin.",
    image: null,
    stock: 0,
    category: "Skincare",
    status: "Inactive",
  },
  {
    id: "prod-7",
    name: "Peppermint Foot Cream",
    description: "Cooling and hydrating foot cream with peppermint and shea butter.",
    image: null,
    stock: 19,
    category: "Body Care",
    status: "Active",
  },
  {
    id: "prod-8",
    name: "Biotin Hair Supplement",
    description: "Daily supplement with biotin, zinc and vitamin B complex to support healthy hair growth.",
    image: null,
    stock: 11,
    category: "Supplements",
    status: "Active",
  },
];
