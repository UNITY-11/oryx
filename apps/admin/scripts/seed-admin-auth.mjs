/**
 * Seeds the single admin auth document in Sanity.
 *
 * Email: oryxbeauty.qa@gmail.com (hardcoded in app)
 * Password: admin@oryxspa2026 (change after first login via Account page)
 *
 * Usage: node scripts/seed-admin-auth.mjs
 */
import { createClient } from "@sanity/client";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const ADMIN_EMAIL = "oryxbeauty.qa@gmail.com";
const ADMIN_PASSWORD = "admin@oryxspa2026";
const ADMIN_AUTH_DOCUMENT_ID = "adminAuth";

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

const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

const doc = {
  _id: ADMIN_AUTH_DOCUMENT_ID,
  _type: "adminAuth",
  email: ADMIN_EMAIL,
  passwordHash,
  resetTokenHash: null,
  resetTokenExpires: null,
  updatedAt: new Date().toISOString(),
};

await client.createOrReplace(doc);

console.log("Admin auth seeded successfully.");
console.log(`Email: ${ADMIN_EMAIL}`);
console.log("Password: admin@oryxspa2026 (change it after first login)");
