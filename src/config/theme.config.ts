/**
 * theme.config.ts — brand tokens for the active tenant (SFA Insurance Group).
 *
 * The token names (red/redDark/black/charcoal/steel/chrome/white) are kept for
 * compatibility with the Tailwind config + CSS variables, but treated as SEMANTIC
 * SLOTS, not literal colors:
 *   red     -> accent           (SFA blue, CTAs/links/highlights)
 *   redDark -> accent-dark       (hover/pressed)
 *   black   -> page background   (light)
 *   charcoal-> surface/cards     (white)
 *   steel   -> borders/hairlines (light slate)
 *   chrome  -> muted/secondary text
 *   white   -> primary text      (deep navy)
 *
 * This lets the dark-built starter render as a clean, light, trustworthy insurance
 * theme by swapping values only. CSS variables in src/index.css mirror these (RGB
 * channels). Components reference Tailwind `brand.*` tokens, never raw hex.
 */

export const themeConfig = {
  colors: {
    red: '#1C5BD6', // Accent — SFA blue (close to their current site). CTAs, links, highlights
    redDark: '#1648AD', // Accent hover/pressed
    black: '#F4F7FB', // Page background — light blue-slate
    charcoal: '#FFFFFF', // Surfaces / cards / header
    steel: '#DCE3EC', // Borders, hairlines
    chrome: '#4A5A70', // Secondary / muted text
    white: '#0E2747', // Primary text — deep navy ink
  },
  fonts: {
    display: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
    body: '"Inter", system-ui, -apple-system, sans-serif',
  },
  /** Light blue, modern, trustworthy — close to the client's existing site. */
  mode: 'light' as const,
} as const;

export type ThemeColorToken = keyof typeof themeConfig.colors;
