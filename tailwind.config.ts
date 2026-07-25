import type { Config } from "tailwindcss";

// Emerald luxury palette (v2 — moved off the navy/gold scheme that read too
// close to the RealLaw site). Deep forest emerald base, sage tints from
// Karen's seafoam, champagne accent.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          DEFAULT: "#0C2F25",
          800: "#113B2E",
          700: "#175041",
        },
        jade: {
          DEFAULT: "#3A6B58",
          soft: "#4F8069",
        },
        sage: {
          DEFAULT: "#C7DCCE",
          light: "#E2EFE6",
          faint: "#F4F9F5",
        },
        champagne: {
          DEFAULT: "#D3B97E",
          strong: "#BFA05C",
          ink: "#8A6C38",
        },
        cream: "#FAF9F6",
        ink: "#13221B",
        muted: "#5D6E65",
      },
      fontFamily: {
        heading: ["var(--font-playfair)", "Georgia", "serif"],
        body: ["var(--font-vietnam)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        content: "72rem",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        drama: "cubic-bezier(0.77, 0, 0.175, 1)",
      },
      boxShadow: {
        card: "0 2px 8px rgba(12, 47, 37, 0.06), 0 12px 32px rgba(12, 47, 37, 0.08)",
        lift: "0 4px 12px rgba(12, 47, 37, 0.08), 0 24px 48px rgba(12, 47, 37, 0.14)",
      },
    },
  },
  plugins: [],
};
export default config;
