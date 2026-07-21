import { createPublicListenerClient } from "@repo/sanity";

/**
 * Public, read-only Sanity client.
 * Safe to be imported in client components ("use client") for real-time listeners.
 */
export const sanityPublicClient = createPublicListenerClient();
