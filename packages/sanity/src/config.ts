/**
 * Shared Sanity configuration.
 *
 * Reads environment variables once and validates them so that every
 * consumer (web, admin, future apps) gets the same guaranteed config.
 */

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.SANITY_API_VERSION || "2024-06-01";

if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
  console.warn("Missing NEXT_PUBLIC_SANITY_PROJECT_ID environment variable");
}

export const sanityConfig = {
  projectId,
  dataset,
  apiVersion,
} as const;
