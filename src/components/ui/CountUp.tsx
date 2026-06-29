import { useEffect, useState } from 'react';
import { useReveal } from '@/hooks/useReveal';

/**
 * CountUp — animates a number from 0 to `to` when it scrolls into view (or on mount
 * when `immediate`). Honors reduced-motion (useReveal reports visible immediately).
 *
 * No "has started" ref guard on purpose: under React StrictMode the effect mounts,
 * cleans up, then mounts again — a guard would leave the value stuck at 0. Restarting
 * the rAF on each effect run is correct and cheap.
 */
export function CountUp({
  to,
  decimals = 0,
  duration = 1400,
  prefix = '',
  suffix = '',
  className,
  immediate = false,
}: {
  to: number;
  decimals?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  /** Start counting on mount instead of waiting for scroll. */
  immediate?: boolean;
}) {
  const { ref, visible } = useReveal<HTMLSpanElement>({ immediate });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!visible) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setValue(to * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
      else setValue(to);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, to, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}
