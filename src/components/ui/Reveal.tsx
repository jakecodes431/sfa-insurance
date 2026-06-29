import type { ReactNode } from 'react';
import { useReveal } from '@/hooks/useReveal';
import { cn } from '@/lib/cn';

type Direction = 'up' | 'left' | 'right' | 'scale' | 'fade';

const HIDDEN: Record<Direction, string> = {
  up: 'opacity-0 translate-y-8',
  left: 'opacity-0 -translate-x-8',
  right: 'opacity-0 translate-x-8',
  scale: 'opacity-0 scale-95',
  fade: 'opacity-0',
};

/**
 * Reveal — fades/slides children into view on scroll. Use `delay` (ms) to
 * stagger siblings. Pure CSS transition driven by an IntersectionObserver.
 */
export function Reveal({
  children,
  direction = 'up',
  delay = 0,
  className,
  immediate = false,
  as: Tag = 'div',
}: {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  className?: string;
  /** Animate on mount instead of waiting for scroll (above-the-fold content). */
  immediate?: boolean;
  as?: 'div' | 'section' | 'li' | 'article';
}) {
  const { ref, visible } = useReveal<HTMLDivElement>({ immediate });
  return (
    <Tag
      ref={ref as never}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
      className={cn(
        'transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform',
        visible ? 'opacity-100 translate-x-0 translate-y-0 scale-100' : HIDDEN[direction],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
