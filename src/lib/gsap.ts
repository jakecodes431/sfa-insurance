/**
 * gsap.ts — single place that imports GSAP + registers plugins.
 * Import { gsap, ScrollTrigger } from here so the plugin is only registered once.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Dev-only: expose for manual verification in headless previews where rAF is throttled.
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as unknown as { gsap: typeof gsap }).gsap = gsap;
}

export { gsap, ScrollTrigger };
