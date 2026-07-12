import { Item } from "@/shared/types";

export const MOCK_SERVICES: Item[] = [
  {
    id: "s1",
    name: "Signature ORYX Massage",
    description: "Our bespoke full-body massage using warm aromatherapy oils.",
    price: 120,
    duration: 60,
    category: "Massage",
    imageUrl: "/images/services/image.png",
    variants: [
      { id: "v1", name: "60 Minutes", price: 120, duration: 60 },
      { id: "v2", name: "90 Minutes", price: 170, duration: 90 },
      { id: "v3", name: "120 Minutes", price: 210, duration: 120 },
    ],
    addons: [
      { id: "a1", name: "Hot Stones", price: 25 },
      { id: "a2", name: "Aromatherapy", price: 15 },
      { id: "a3", name: "Deep Tissue Upgrade", price: 20 },
    ]
  },
  {
    id: "s2",
    name: "Deep Tissue Therapy",
    description: "Intensive muscle relief targeting deep tissue layers.",
    price: 150,
    duration: 90,
    category: "Massage",
    imageUrl: "/images/services/image%20copy.png",
  },
  {
    id: "s3",
    name: "Radiance Facial",
    description: "A glowing facial treatment with vitamin C serums.",
    price: 95,
    duration: 45,
    category: "Facial",
    imageUrl: "/images/services/image%20copy%202.png",
    variants: [
      { id: "f1", name: "Standard (45 Min)", price: 95, duration: 45 },
      { id: "f2", name: "Deluxe (60 Min)", price: 130, duration: 60 },
    ],
    addons: [
      { id: "fa1", name: "LED Light Therapy", price: 30 },
      { id: "fa2", name: "Collagen Eye Mask", price: 15 },
    ]
  },
  {
    id: "s4",
    name: "Luxury Manicure",
    description: "Complete nail care, cuticle treatment, and gel polish.",
    price: 45,
    duration: 45,
    category: "Nails",
    imageUrl: "/images/services/image%20copy%203.png",
  },
  {
    id: "s5",
    name: "Aromatherapy Soak",
    description: "A relaxing floral bath soak with essential oils.",
    price: 65,
    duration: 30,
    category: "Spa",
    imageUrl: "/images/services/image.png",
  },
  {
    id: "s6",
    name: "Hot Stone Therapy",
    description: "Melt away tension with smooth, heated stones.",
    price: 135,
    duration: 75,
    category: "Massage",
    imageUrl: "/images/services/image%20copy.png",
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
    imageUrl: "/images/products/image%20copy%204.png",
  },
  {
    id: "p2",
    name: "Lavender Massage Oil",
    description: "Relaxing body oil for home use.",
    price: 35,
    category: "Products",
    isProduct: true,
    imageUrl: "/images/products/image%20copy%205.png",
  },
  {
    id: "p3",
    name: "Hydrating Rose Mist",
    description: "Refreshing facial mist with organic rose water.",
    price: 28,
    category: "Products",
    isProduct: true,
    imageUrl: "/images/products/image%20copy%206.png",
  },
  {
    id: "p4",
    name: "Charcoal Detox Mask",
    description: "Deep cleansing clay mask for purifying pores.",
    price: 42,
    category: "Products",
    isProduct: true,
    imageUrl: "/images/products/image%20copy%207.png",
  },
  {
    id: "p5",
    name: "Shea Butter Body Cream",
    description: "Ultra-rich moisturizing cream for dry skin.",
    price: 55,
    category: "Products",
    isProduct: true,
    imageUrl: "/images/products/image%20copy%208.png",
  },
  {
    id: "p6",
    name: "Vitamin C Eye Serum",
    description: "Brightening eye treatment to reduce dark circles.",
    price: 75,
    category: "Products",
    isProduct: true,
    imageUrl: "/images/products/image%20copy%209.png",
  }
];

export const ALL_MOCK_ITEMS = [...MOCK_SERVICES, ...MOCK_PRODUCTS];
