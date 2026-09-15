import type { Config } from "tailwindcss";

const reportsTailwindPreset = {
  content: [],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
          glow: "hsl(var(--primary-glow) / <alpha-value>)",
          deep: "hsl(var(--brand-deep) / <alpha-value>)",
          vivid: "hsl(var(--brand-vivid) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
          ink: "hsl(var(--destructive-ink) / <alpha-value>)",
        },
        success: {
          DEFAULT: "hsl(var(--success) / <alpha-value>)",
          foreground: "hsl(var(--success-foreground) / <alpha-value>)",
          ink: "hsl(var(--success-ink) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "hsl(var(--warning) / <alpha-value>)",
          foreground: "hsl(var(--warning-foreground) / <alpha-value>)",
          ink: "hsl(var(--warning-ink) / <alpha-value>)",
        },
        info: { ink: "hsl(var(--info-ink) / <alpha-value>)" },
        neutral: { ink: "hsl(var(--neutral-ink) / <alpha-value>)" },
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        hub: {
          blue: "hsl(var(--hub-blue) / <alpha-value>)",
          "blue-soft": "hsl(var(--hub-blue-soft) / <alpha-value>)",
          amber: "hsl(var(--hub-amber) / <alpha-value>)",
          emerald: "hsl(var(--hub-emerald) / <alpha-value>)",
          indigo: "hsl(var(--hub-indigo) / <alpha-value>)",
          rose: "hsl(var(--hub-rose) / <alpha-value>)",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-foreground) / <alpha-value>)",
          primary: "hsl(var(--sidebar-primary) / <alpha-value>)",
          accent: "hsl(var(--sidebar-accent) / <alpha-value>)",
          border: "hsl(var(--sidebar-border) / <alpha-value>)",
          ring: "hsl(var(--sidebar-ring) / <alpha-value>)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "var(--radius)",
        xl: "var(--radius)",
        "2xl": "6px",
        "3xl": "8px",
      },
      fontFamily: {
        sans: ["Oxanium", "system-ui", "sans-serif"],
        display: ["Oxanium", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "hub-primary": "0 8px 24px -10px hsl(var(--primary) / 0.45)",
      },
      screens: { "3xl": "1920px" },
      transitionTimingFunction: {
        hub: "cubic-bezier(0.32, 0.72, 0, 1)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: { "fade-in": "fade-in 300ms ease-out" },
    },
  },
} satisfies Config;

export default reportsTailwindPreset;
