import { createRequire } from "module";
import withSerwistInit from "@serwist/next";

const require = createRequire(import.meta.url);
const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    resolveAlias: {
      // Force jsPDF to use the browser ES build, not the Node.js build
      jspdf: "jspdf/dist/jspdf.es.min.js",
    },
  },
  webpack: (config) => {
    // Prevent Node.js-only modules from being bundled for the browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      worker_threads: false,
      fs: false,
    };
    // Also alias jsPDF to browser build for webpack (non-turbopack)
    config.resolve.alias = {
      ...config.resolve.alias,
      jspdf: require.resolve("jspdf/dist/jspdf.es.min.js"),
    };
    return config;
  },
};

export default withSerwist(nextConfig);
