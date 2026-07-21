/**
 * One-time seed script: pushes the existing static coupons into Sanity
 * so the admin app has real data immediately.
 *
 * Usage: node scripts/seed-coupons.mjs
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

const MOCK_COUPONS = [
  {
    id: "coupon-1",
    title: "Get 20% Off Your First Visit",
    type: "SPECIAL OFFER",
    code: "ORYX20",
    icon: "Scissors",
  },
  {
    id: "coupon-2",
    title: "Free Polish With Manicure",
    type: "FREE GIFT",
    code: "GLOWUP",
    icon: "Sparkles",
  },
  {
    id: "coupon-3",
    title: "Bridal Spa Day",
    type: "PACKAGE",
    code: "BRIDE30",
    icon: "Flower2",
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
  await seedEntity("coupon", MOCK_COUPONS, (c) => ({
    _id: c.id,
    _type: "coupon",
    title: c.title,
    type: c.type,
    code: c.code,
    icon: c.icon,
  }));
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
