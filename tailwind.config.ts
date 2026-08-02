import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0B0F0D",
          soft: "#121611",
        },
        ivory: {
          DEFAULT: "#F7F5F0",
          dim: "#EDEAE2",
        },
        emerald: {
          50: "#E6F3EC",
          100: "#C2E2D2",
          200: "#93CBB2",
          300: "#5FAF8F",
          400: "#2F9270",
          500: "#0B6E4F",
          600: "#095E43",
          700: "#074C37",
          800: "#053A2A",
          900: "#03281D",
          DEFAULT: "#0B6E4F",
          bright: "#10A672",
        },
        gold: {
          DEFAULT: "#C9A45C",
          soft: "#DCC28A",
          deep: "#A9813F",
        },
        graphite: {
          DEFAULT: "#2A2E2B",
          light: "#3A3F3B",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.04em",
        widest2: "0.32em",
      },
      backgroundImage: {
        "tape-line":
          "repeating-linear-gradient(90deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 8px)",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(11, 15, 13, 0.28)",
        emerald: "0 20px 40px -12px rgba(11, 110, 79, 0.35)",
      },
      backdropBlur: {
        glass: "16px",
      },
      animation: {
        "fade-up": "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
