import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";
import containerQueries from "@tailwindcss/container-queries";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./app/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "on-primary-container": "var(--color-on-primary-container)",
        "on-secondary": "var(--color-on-secondary)",
        "error-container": "var(--color-error-container)",
        "secondary-fixed-dim": "var(--color-secondary-fixed-dim)",
        "on-primary": "var(--color-on-primary)",
        "on-surface": "var(--color-on-surface)",
        "tertiary": "var(--color-tertiary)",
        "on-tertiary-fixed": "var(--color-on-tertiary-fixed)",
        "on-secondary-container": "var(--color-on-secondary-container)",
        "on-error-container": "var(--color-on-error-container)",
        "background": "var(--color-background)",
        "error": "var(--color-error)",
        "surface": "var(--color-surface)",
        "inverse-primary": "var(--color-inverse-primary)",
        "surface-dim": "var(--color-surface-dim)",
        "outline": "var(--color-outline)",
        "on-tertiary-fixed-variant": "var(--color-on-tertiary-fixed-variant)",
        "outline-variant": "var(--color-outline-variant)",
        "on-secondary-fixed-variant": "var(--color-on-secondary-fixed-variant)",
        "primary-fixed-dim": "var(--color-primary-fixed-dim)",
        "secondary-container": "var(--color-secondary-container)",
        "secondary-fixed": "var(--color-secondary-fixed)",
        "surface-container-highest": "var(--color-surface-container-highest)",
        "on-error": "var(--color-on-error)",
        "tertiary-fixed": "var(--color-tertiary-fixed)",
        "on-tertiary-container": "var(--color-on-tertiary-container)",
        "on-tertiary": "var(--color-on-tertiary)",
        "on-secondary-fixed": "var(--color-on-secondary-fixed)",
        "on-primary-fixed": "var(--color-on-primary-fixed)",
        "surface-bright": "var(--color-surface-bright)",
        "on-background": "var(--color-on-background)",
        "primary-container": "var(--color-primary-container)",
        "tertiary-fixed-dim": "var(--color-tertiary-fixed-dim)",
        "on-surface-variant": "var(--color-on-surface-variant)",
        "on-primary-fixed-variant": "var(--color-on-primary-fixed-variant)",
        "surface-container-low": "var(--color-surface-container-low)",
        "surface-container-lowest": "var(--color-surface-container-lowest)",
        "surface-container-high": "var(--color-surface-container-high)",
        "inverse-surface": "var(--color-inverse-surface)",
        "primary": "var(--color-primary)",
        "surface-container": "var(--color-surface-container)",
        "surface-tint": "var(--color-surface-tint)",
        "inverse-on-surface": "var(--color-inverse-on-surface)",
        "tertiary-container": "var(--color-tertiary-container)",
        "surface-variant": "var(--color-surface-variant)",
        "secondary": "var(--color-secondary)",
        "primary-fixed": "var(--color-primary-fixed)"
      },
      fontFamily: {
        headline: ["var(--font-headline)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        label: ["var(--font-label)", "sans-serif"]
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        }
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        shimmer: "shimmer 3s ease-in-out infinite"
      }
    }
  },
  plugins: [forms, containerQueries]
};

export default config;
