export type ServiceCategory = "Massage" | "Facial" | "Body Treatment" | "Hair" | "Nails" | "Package";
export type ServiceStatus = "Active" | "Inactive";

export interface Addon {
  id: string;
  name: string;
  price: number;
  duration: number; // minutes
}

export interface PricingTier {
  id: string;
  label: string; // e.g. "60 min", "90 min"
  price: number;
  duration: number;
}

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  status: ServiceStatus;
  description: string;
  shortDescription: string;
  image: string | null;
  pricingTiers: PricingTier[];
  addons: Addon[];
  preparationTime: number; // minutes before appointment
  cleanupTime: number; // minutes after appointment
  maxCapacity: number;
  tags: string[];
  createdAt: string;
}

export const MOCK_SERVICES: Service[] = [
  {
    id: "SVC-001",
    name: "Signature Massage",
    category: "Massage",
    status: "Active",
    shortDescription: "A bespoke full-body massage tailored to your needs.",
    description:
      "Our signature massage is a customized experience that combines Swedish and deep tissue techniques. Your therapist will tailor the pressure and focus areas to address your specific needs, leaving you fully restored.",
    image: null,
    pricingTiers: [
      { id: "pt-1", label: "60 min", price: 120, duration: 60 },
      { id: "pt-2", label: "90 min", price: 170, duration: 90 },
      { id: "pt-3", label: "120 min", price: 220, duration: 120 },
    ],
    addons: [
      { id: "a-1", name: "Aromatherapy Oils", price: 30, duration: 0 },
      { id: "a-2", name: "Hot Stone Enhancement", price: 50, duration: 15 },
      { id: "a-3", name: "Scalp Massage", price: 25, duration: 10 },
    ],
    preparationTime: 10,
    cleanupTime: 15,
    maxCapacity: 1,
    tags: ["Relaxation", "Deep Tissue", "Bestseller"],
    createdAt: "2024-01-10",
  },
  {
    id: "SVC-002",
    name: "Gold Radiance Facial",
    category: "Facial",
    status: "Active",
    shortDescription: "Luxurious 24k gold-infused facial for luminous skin.",
    description:
      "Experience the ultimate in luxury skincare with our Gold Radiance Facial. Infused with 24k gold particles, this treatment brightens the complexion, reduces the appearance of fine lines, and leaves skin with an unparalleled luminosity.",
    image: null,
    pricingTiers: [
      { id: "pt-4", label: "60 min", price: 180, duration: 60 },
      { id: "pt-5", label: "90 min", price: 240, duration: 90 },
    ],
    addons: [
      { id: "a-4", name: "Eye Contour Treatment", price: 40, duration: 10 },
      { id: "a-5", name: "Lip Plumping Mask", price: 35, duration: 10 },
    ],
    preparationTime: 15,
    cleanupTime: 10,
    maxCapacity: 1,
    tags: ["Anti-Aging", "Luxury", "Brightening"],
    createdAt: "2024-01-15",
  },
  {
    id: "SVC-003",
    name: "Hot Stone Therapy",
    category: "Massage",
    status: "Active",
    shortDescription: "Deep heat therapy with smooth volcanic basalt stones.",
    description:
      "Warm volcanic basalt stones are placed on key energy points of the body, while your therapist uses them to massage muscle groups. The deep, penetrating heat melts away tension and promotes profound relaxation.",
    image: null,
    pricingTiers: [
      { id: "pt-6", label: "75 min", price: 150, duration: 75 },
      { id: "pt-7", label: "100 min", price: 195, duration: 100 },
    ],
    addons: [
      { id: "a-6", name: "Herbal Compress", price: 45, duration: 15 },
    ],
    preparationTime: 20,
    cleanupTime: 20,
    maxCapacity: 1,
    tags: ["Deep Heat", "Muscle Relief", "Popular"],
    createdAt: "2024-02-01",
  },
  {
    id: "SVC-004",
    name: "Hammam Ritual",
    category: "Body Treatment",
    status: "Active",
    shortDescription: "Traditional steam bath with kessa exfoliation and soap.",
    description:
      "An authentic Moroccan hammam experience featuring a steam bath, kessa glove exfoliation to remove dead skin cells, and a nourishing black soap application. Skin is left silky smooth and deeply cleansed.",
    image: null,
    pricingTiers: [
      { id: "pt-8", label: "90 min", price: 200, duration: 90 },
      { id: "pt-9", label: "120 min", price: 260, duration: 120 },
    ],
    addons: [
      { id: "a-7", name: "Argan Oil Wrap", price: 60, duration: 20 },
      { id: "a-8", name: "Rhassoul Clay Mask", price: 50, duration: 15 },
    ],
    preparationTime: 20,
    cleanupTime: 25,
    maxCapacity: 2,
    tags: ["Traditional", "Exfoliation", "Cultural"],
    createdAt: "2024-02-10",
  },
  {
    id: "SVC-005",
    name: "Spa Day Package",
    category: "Package",
    status: "Active",
    shortDescription: "Full-day indulgence combining our best treatments.",
    description:
      "The ultimate retreat, this all-day package includes a hammam ritual, a gold facial, our signature massage, and a light spa lunch. Perfect for celebrating a special occasion or simply gifting yourself a day of pure luxury.",
    image: null,
    pricingTiers: [
      { id: "pt-10", label: "Full Day (5-6 hrs)", price: 580, duration: 360 },
    ],
    addons: [
      { id: "a-9", name: "Champagne & Canapés", price: 120, duration: 0 },
      { id: "a-10", name: "Take-Home Spa Kit", price: 80, duration: 0 },
    ],
    preparationTime: 15,
    cleanupTime: 15,
    maxCapacity: 1,
    tags: ["Package", "Full Day", "Gift"],
    createdAt: "2024-03-01",
  },
  {
    id: "SVC-006",
    name: "Deep Tissue Therapy",
    category: "Massage",
    status: "Inactive",
    shortDescription: "Targeted pressure for chronic muscle tension and pain.",
    description:
      "Using firm pressure and slow, deliberate strokes, our therapists target the deep layers of muscle and connective tissue. Ideal for athletes or those suffering from chronic pain and postural issues.",
    image: null,
    pricingTiers: [
      { id: "pt-11", label: "60 min", price: 135, duration: 60 },
      { id: "pt-12", label: "90 min", price: 185, duration: 90 },
    ],
    addons: [
      { id: "a-11", name: "Cupping Therapy", price: 55, duration: 20 },
    ],
    preparationTime: 10,
    cleanupTime: 15,
    maxCapacity: 1,
    tags: ["Therapeutic", "Sports", "Pain Relief"],
    createdAt: "2024-03-15",
  },
];
