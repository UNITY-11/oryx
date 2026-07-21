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
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2024-03-15",
  token: env.SANITY_API_TOKEN,
  useCdn: false,
});

const MOCK_REVIEWS = [
  {
    id: "r1",
    name: "Sarah Al M.",
    text: "The most relaxing massage I've ever had. The ambiance and professionalism are unmatched in Doha.",
    initials: "SA",
    rating: 5,
    status: "Active",
  },
  {
    id: "r2",
    name: "Fatima K.",
    text: "Absolutely in love with their premium facials. My skin has never glowed this much before!",
    initials: "FK",
    rating: 5,
    status: "Active",
  },
  {
    id: "r3",
    name: "Jessica R.",
    text: "A hidden gem! The attention to detail and the quality of their organic products is incredible.",
    initials: "JR",
    rating: 5,
    status: "Active",
  },
  {
    id: "r4",
    name: "Aisha B.",
    text: "Highly recommend the hot stone therapy. It melts all the stress away perfectly.",
    initials: "AB",
    rating: 5,
    status: "Active",
  },
  {
    id: "r5",
    name: "Nour S.",
    text: "Beautiful spa with excellent staff. The massage therapists really know what they are doing. Will be back!",
    initials: "NS",
    rating: 5,
    status: "Active",
  },
  {
    id: "r6",
    name: "Elena M.",
    text: "Such a relaxing experience from start to finish. The complimentary tea and foot soak was a lovely touch.",
    initials: "EM",
    rating: 5,
    status: "Active",
  },
];

async function seedEntity(type, items, mapFn) {
  console.log(`\nDeleting existing ${type}s...`);
  await client.delete({ query: `*[_type == "${type}"]` });
  console.log(`Cleared old ${type}s.`);

  console.log(`\nSeeding ${items.length} ${type}s...`);
  for (const item of items) {
    const doc = mapFn(item);
    await client.createIfNotExists(doc);
    console.log(`Created ${type}: ${item.name}`);
  }
}

async function seed() {
  await seedEntity("review", MOCK_REVIEWS, (r) => ({
    _id: r.id,
    _type: "review",
    name: r.name,
    text: r.text,
    initials: r.initials,
    rating: r.rating,
    status: r.status,
    createdAt: new Date().toISOString(),
  }));
}

seed()
  .then(() => {
    console.log("\nReview seeding complete! 🎉");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
