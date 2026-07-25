import type { Config } from "tailwindcss";

// Palette sourced from Karen's Squarespace theme HSL variables:
//   darkAccent hsl(211.76,53.13%,12.55%) -> navy
//   accent     hsl(210.64,31.13%,29.61%) -> slate
//   lightAccent hsl(184.62,26.53%,80.78%) -> seafoam
// Gold is the luxury refinement of the draft's #FFED05 highlight.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0F1F31",
          800: "#16293E",
          700: "#1D344C",
        },
        slate: {
          DEFAULT: "#34506B",
          soft: "#4A6785",
        },
        seafoam: {
          DEFAULT: "#C1D9DB",
          light: "#E4EFF0",
          faint: "#F2F7F8",
        },
        gold: {
          DEFAULT: "#C9A468",
          strong: "#B8914F",
          ink: "#8A6A32",
        },
        cream: "#FAF9F6",
        ink: "#152232",
        muted: "#5B6B7C",
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
        card: "0 2px 8px rgba(15, 31, 49, 0.06), 0 12px 32px rgba(15, 31, 49, 0.08)",
        lift: "0 4px 12px rgba(15, 31, 49, 0.08), 0 24px 48px rgba(15, 31, 49, 0.14)",
      },
    },
  },
  plugins: [],
};
export default config;
