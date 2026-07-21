import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.SANITY_API_VERSION || "2024-06-01";

if (!projectId) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID environment variable");
}

/**
 * Public, read-only Sanity client.
 * Safe to be imported in client components ("use client") for real-time listeners.
 */
export const sanityPublicClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Must be false for real-time listeners
});
