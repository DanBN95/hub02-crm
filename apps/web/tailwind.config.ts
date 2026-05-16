/**
 * Tailwind v4 config — hub02-crm
 *
 * Tailwind v4 sources its theme from `@theme` blocks in CSS (see
 * `src/styles/tokens.css`). This config exists as the conventional
 * entry point and to declare content roots + the small set of
 * runtime variants we need (theme attribute switching).
 */
import type { Config } from "tailwindcss";

export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  // v4 reads theme from CSS; keep this minimal.
  theme: {
    extend: {},
  },
  // Light-mode opt-in via [data-theme="light"] on <html>.
  // Default surface stays dark.
  darkMode: ["selector", '[data-theme="light"] &'],
  plugins: [],
} satisfies Config;
