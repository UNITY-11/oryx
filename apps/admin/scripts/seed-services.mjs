/**
 * One-time seed script: pushes the existing mock services into Sanity so the
 * admin app has real data to work with immediately after the backend switch.
 *
 * Usage: node scripts/seed-services.mjs
 * Reads Sanity credentials from apps/admin/.env.local (never printed).
 */
import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = join(__dirname, "..", ".env.local");
  const content = readFileSync(envPath, "utf-8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
  }
  return env;
}

const env = loadEnv();

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: env.SANITY_API_VERSION || "2024-06-01",
  token: env.SANITY_API_TOKEN,
  useCdn: false,
});

const MOCK_SERVICES = [
  {
    id: "SVC-001",
    name: "Signature Massage",
    category: "Massage",
    status: "Active",
    shortDescription: "A bespoke full-body massage tailored to your needs.",
    description:
      "Our signature massage is a customized experience that combines Swedish and deep tissue techniques. Your therapist will tailor the pressure and focus areas to address your specific needs, leaving you fully restored.",
    image: null,
    price: 50,
    options: [
      { id: "a-1", name: "Aromatherapy Oils", price: 30 },
      { id: "a-2", name: "Hot Stone Enhancement", price: 50 },
      { id: "a-3", name: "Scalp Massage", price: 25 },
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
    price: 50,
    options: [
      { id: "a-4", name: "Eye Contour Treatment", price: 40 },
      { id: "a-5", name: "Lip Plumping Mask", price: 35 },
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
    price: 50,
    options: [{ id: "a-6", name: "Herbal Compress", price: 45 }],
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
    price: 50,
    options: [
      { id: "a-7", name: "Argan Oil Wrap", price: 60 },
      { id: "a-8", name: "Rhassoul Clay Mask", price: 50 },
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
    price: 50,
    options: [
      { id: "a-9", name: "Champagne & Canapés", price: 120 },
      { id: "a-10", name: "Take-Home Spa Kit", price: 80 },
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
    price: 50,
    options: [{ id: "a-11", name: "Cupping Therapy", price: 55 }],
    preparationTime: 10,
    cleanupTime: 15,
    maxCapacity: 1,
    tags: ["Therapeutic", "Sports", "Pain Relief"],
    createdAt: "2024-03-15",
  },
];

function withKeys(items) {
  return (items ?? []).map((item) => ({ ...item, _key: item.id }));
}

async function seed() {
  const existing = await client.fetch(`count(*[_type == "service"])`);
  if (existing > 0) {
    console.log(`Skipping seed: ${existing} service document(s) already exist in Sanity.`);
    return;
  }

  const transaction = client.transaction();
  for (const service of MOCK_SERVICES) {
    transaction.createOrReplace({
      _id: `service-${service.id}`,
      _type: "service",
      name: service.name,
      category: service.category,
      status: service.status,
      shortDescription: service.shortDescription,
      description: service.description,
      image: service.image,
      price: service.price,
      options: withKeys(service.options),
      preparationTime: service.preparationTime,
      cleanupTime: service.cleanupTime,
      maxCapacity: service.maxCapacity,
      tags: service.tags,
      createdAt: service.createdAt,
    });
  }

  const result = await transaction.commit();
  console.log(`Seeded ${result.results.length} service document(s) into Sanity.`);
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
