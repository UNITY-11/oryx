import { createFreshReadClient, createWriteClient } from "@repo/sanity";

/**
 * Fresh public reads (CDN off) so CMS updates show immediately after
 * on-demand revalidation.
 */
export const sanityClient = createFreshReadClient();

/**
 * Write-capable client for booking creation from the public site.
 * Only import from Route Handlers (app/api/**) — never from client components.
 */
export const sanityWriteClient = createWriteClient();
