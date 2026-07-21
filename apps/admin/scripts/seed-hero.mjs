/**
 * One-time seed script: pushes the existing static hero slides into Sanity
 * so the admin app has real data immediately.
 *
 * Usage: node scripts/seed-hero.mjs
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

const MOCK_HERO_SLIDES = [
  {
    id: "hero-1",
    type: "video",
    src: "/videos/animate-video.mp4",
    title: "Welcome to ORYX",
    subtitle: "The ultimate relaxation experience.",
    order: 1,
  },
  {
    id: "hero-2",
    type: "image",
    src: "/images/hero/image.png",
    title: "Relax & Rejuvenate",
    subtitle: "Experience our signature massages.",
    order: 2,
  },
  {
    id: "hero-3",
    type: "image",
    src: "/images/hero/image copy.png",
    title: "Glowing Skin",
    subtitle: "Discover our premium facials.",
    order: 3,
  },
  {
    id: "hero-4",
    type: "image",
    src: "/images/hero/image copy 2.png",
    title: "Luxury Products",
    subtitle: "Take the spa experience home.",
    order: 4,
  },
];

async function seedEntity(type, docs, buildDoc) {
  const existing = await client.fetch(`count(*[_type == $type])`, { type });
  if (existing > 0) {
    console.log(`Skipping ${type}: ${existing} document(s) already exist.`);
    return;
  }
  const transaction = client.transaction();
  for (const doc of docs) {
    transaction.createOrReplace(buildDoc(doc));
  }
  const result = await transaction.commit();
  console.log(`Seeded ${result.results.length} ${type} document(s).`);
}

async function seed() {
  await seedEntity("hero", MOCK_HERO_SLIDES, (h) => ({
    _id: `hero-${h.id}`,
    _type: "hero",
    type: h.type,
    src: h.src,
    title: h.title,

    order: h.order,
  }));
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
