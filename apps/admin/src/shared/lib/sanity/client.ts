import { createWriteClient } from "@repo/sanity";

/**
 * Server-only Sanity client. Carries a write-capable API token, so this
 * module must never be imported from a "use client" component — only from
 * Route Handlers (app/api/**) or other server-side code.
 */
export const sanityClient = createWriteClient();
