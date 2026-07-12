import { Item } from "@/shared/types";

export const MOCK_SERVICES: Item[] = [
  {
    id: "s1",
    name: "Signature ORYX Massage",
    description: "Our bespoke full-body massage using warm aromatherapy oils.",
    price: 120,
    duration: 60,
    category: "Massage",
    imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "s2",
    name: "Deep Tissue Therapy",
    description: "Intensive muscle relief targeting deep tissue layers.",
    price: 150,
    duration: 90,
    category: "Massage",
    imageUrl: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "s3",
    name: "Radiance Facial",
    description: "A glowing facial treatment with vitamin C serums.",
    price: 95,
    duration: 45,
    category: "Facial",
    imageUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "s4",
    name: "Luxury Manicure",
    description: "Complete nail care, cuticle treatment, and gel polish.",
    price: 45,
    duration: 45,
    category: "Nails",
    imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800",
  }
];

export const MOCK_PRODUCTS: Item[] = [
  {
    id: "p1",
    name: "ORYX Gold Serum",
    description: "Daily revitalizing face serum infused with gold flakes.",
    price: 65,
    category: "Products",
    isProduct: true,
    imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "p2",
    name: "Lavender Massage Oil",
    description: "Relaxing body oil for home use.",
    price: 35,
    category: "Products",
    isProduct: true,
    imageUrl: "https://images.unsplash.com/photo-1608248593842-8eb44a6ec3f9?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "p3",
    name: "Hydrating Rose Mist",
    description: "Refreshing facial mist with organic rose water.",
    price: 28,
    category: "Products",
    isProduct: true,
    imageUrl: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "p4",
    name: "Charcoal Detox Mask",
    description: "Deep cleansing clay mask for purifying pores.",
    price: 42,
    category: "Products",
    isProduct: true,
    imageUrl: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "p5",
    name: "Shea Butter Body Cream",
    description: "Ultra-rich moisturizing cream for dry skin.",
    price: 55,
    category: "Products",
    isProduct: true,
    imageUrl: "https://images.unsplash.com/photo-1614859324967-bdfce6b4c10a?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "p6",
    name: "Vitamin C Eye Serum",
    description: "Brightening eye treatment to reduce dark circles.",
    price: 75,
    category: "Products",
    isProduct: true,
    imageUrl: "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=800",
  }
];

export const ALL_MOCK_ITEMS = [...MOCK_SERVICES, ...MOCK_PRODUCTS];
