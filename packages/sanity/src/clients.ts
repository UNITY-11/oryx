import { createClient } from "@sanity/client";

import { sanityConfig } from "./config";

/**
 * Public read client — safe for server components and CDN-cached fetches.
 * Use in both web and admin for read-only data fetching.
 */
export function createReadClient() {
  return createClient({
    ...sanityConfig,
    useCdn: true,
  });
}

/**
 * Public read client with CDN disabled — use when admin updates must appear
 * immediately (e.g. after on-demand ISR revalidation).
 */
export function createFreshReadClient() {
  return createClient({
    ...sanityConfig,
    useCdn: false,
  });
}

/**
 * Write-capable client for server-side operations.
 * Only import from Route Handlers (app/api/**) — never from client components.
 */
export function createWriteClient() {
  return createClient({
    ...sanityConfig,
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
  });
}

/**
 * Public, read-only client with CDN disabled.
 * Safe for client components ("use client") for real-time listeners.
 */
export function createPublicListenerClient() {
  return createClient({
    ...sanityConfig,
    useCdn: false, // Must be false for real-time listeners
  });
}
