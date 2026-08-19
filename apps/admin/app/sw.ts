/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import { Serwist, type PrecacheEntry, type SerwistGlobalConfig } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// To fix CORS issues with Sanity's Server-Sent Events (data/listen),
// we must completely bypass the Service Worker for any Sanity API request.
const bypassedCache = defaultCache.map((entry) => {
  const originalMatcher = entry.matcher;
  return {
    ...entry,
    matcher: (options: any) => {
      // If it's a Sanity API request, do NOT match this caching rule.
      if (options.url.hostname.includes("api.sanity.io")) {
        return false;
      }
      if (typeof originalMatcher === "function") {
        return originalMatcher(options);
      }
      if (originalMatcher instanceof RegExp) {
        return originalMatcher.test(options.url.href);
      }
      return originalMatcher === options.url.href;
    },
  };
});

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: bypassedCache,
});

serwist.addEventListeners();
