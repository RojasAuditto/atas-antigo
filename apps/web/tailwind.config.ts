import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
import reportsTailwindPreset from "./reports-tailwind-preset";

export default {
  presets: [reportsTailwindPreset],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  plugins: [animate],
} satisfies Config;
