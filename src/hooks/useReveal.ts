/**
 * useReveal — IntersectionObserver-based "animate on scroll into view".
 * Lightweight (no animation libs). Fires once, then disconnects.
 * Honors prefers-reduced-motion by reporting visible immediately.
 */
import { useEffect, useRef, useState } from 'react';

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function useReveal<T extends HTMLElement = HTMLDivElement>(options?: {
  threshold?: number;
  rootMargin?: string;
  /** Reveal immediately on mount (for above-the-fold content that shouldn't wait for scroll). */
  immediate?: boolean;
}) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(Boolean(options?.immediate));

  useEffect(() => {
    if (options?.immediate) {
      setVisible(true);
      return;
    }
    const node = ref.current;
    if (!node) return;
    if (prefersReducedMotion()) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        threshold: options?.threshold ?? 0.15,
        rootMargin: options?.rootMargin ?? '0px 0px -10% 0px',
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [options?.threshold, options?.rootMargin, options?.immediate]);

  return { ref, visible };
}
