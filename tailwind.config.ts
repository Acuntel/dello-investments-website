import type { Config } from "tailwindcss";

// Navy brand palette (v3 — Karen's official brand kit, 2026-08-01). Dark navy
// base, primary navy mid tone, mist tint/accent family, warm cream ground.
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
          DEFAULT: "#0F1F31", // brand dark navy — hero bands, headings, buttons
          800: "#1B2E42",
          700: "#2B4158",
        },
        steel: {
          DEFAULT: "#344B63", // brand primary navy — mid tone, gradients
          soft: "#4C6580",
        },
        mist: {
          DEFAULT: "#C1D9DB", // brand mist — accent + tint family
          light: "#DCE9EB",
          faint: "#EFF5F6",
          strong: "#A6C8CC",
          ink: "#41666B",
        },
        cream: "#F7F4F1", // brand cream
        ink: "#14202C",
        muted: "#5C6B79",
      },
      fontFamily: {
        heading: ["var(--font-vietnam)", "system-ui", "sans-serif"],
        body: ["var(--font-poppins)", "system-ui", "sans-serif"],
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
