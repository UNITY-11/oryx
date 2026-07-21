import { createReadClient, createWriteClient } from "@repo/sanity";

/** Public read client — safe for server components and CDN-cached fetches. */
export const sanityClient = createReadClient();

/**
 * Write-capable client for booking creation from the public site.
 * Only import from Route Handlers (app/api/**) — never from client components.
 */
export const sanityWriteClient = createWriteClient();
