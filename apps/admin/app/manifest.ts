import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ORYX Admin",
    short_name: "ORYX Admin",
    description: "Highly secure and performant admin panel for ORYX",
    start_url: "/",
    display: "standalone",
    background_color: "#f3e6dc",
    theme_color: "#f3e6dc",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };
}
