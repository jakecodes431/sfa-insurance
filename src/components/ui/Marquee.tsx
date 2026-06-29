import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

/** A marquee entry — either plain text or a label that links to a page. */
export type MarqueeItem = string | { label: string; to: string };

/**
 * Marquee — seamless, gapless infinite horizontal scroll. The item list is repeated
 * enough times that a single "half" is wider than any screen, then the track (two
 * identical halves) is translated -50% for a loop with no end gap. Pauses on hover.
 * Speed is kept consistent by scaling the duration with the number of items.
 */
export function Marquee({ items, className }: { items: MarqueeItem[]; className?: string }) {
  // Repeat so one half overflows even ultra-wide screens (otherwise the loop shows a gap).
  const repeats = Math.max(2, Math.ceil(18 / items.length));
  const row = Array.from({ length: repeats }, () => items).flat();
  const durationS = row.length * 4; // ~4s per item → constant, readable speed

  const itemClass =
    'px-3 font-display text-sm uppercase tracking-wide text-brand-chrome sm:px-6 sm:text-lg';

  return (
    <div className={cn('marquee-mask group relative overflow-hidden', className)}>
      <div
        className="flex w-max animate-marquee group-hover:[animation-play-state:paused]"
        style={{ animationDuration: `${durationS}s` }}
      >
        {[0, 1].map((dup) => (
          <div key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
            {row.map((item, i) => (
              <Fragment key={`${dup}-${i}`}>
                {typeof item === 'string' ? (
                  <span className={itemClass}>{item}</span>
                ) : (
                  <Link
                    to={item.to}
                    tabIndex={dup === 1 ? -1 : undefined}
                    className={cn(itemClass, 'transition-colors hover:text-brand-white')}
                  >
                    {item.label}
                  </Link>
                )}
                <span className="text-brand-red" aria-hidden>
                  ◆
                </span>
              </Fragment>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
