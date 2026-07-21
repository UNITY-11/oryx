import type { Config } from "tailwindcss";

/**
 * Shared Tailwind theme preset for the ORYX brand.
 *
 * Both web and admin apps extend this preset, overriding only the
 * `content` paths (and any app-specific additions).
 */
const preset: Config = {
  content: [], // Each app must provide its own content paths
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        primary: {
          DEFAULT: "var(--color-primary)",
          dark: "var(--color-primary-dark)",
        },
        secondary: "var(--color-secondary)",
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
        },
        favorite: "#D65C42",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-cinzel)", "serif"],
      },
      borderRadius: {
        soft: "var(--radius-soft)",
      },
      boxShadow: {
        spa: "var(--shadow-spa)",
      },
    },
  },
  plugins: [],
};
export default preset;
