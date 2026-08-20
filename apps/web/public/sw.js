self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  return self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Empty fetch handler to satisfy PWA requirements
});
