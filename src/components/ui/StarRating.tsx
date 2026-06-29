import { cn } from '@/lib/cn';
import { StarIcon } from './Icons';

export function StarRating({
  rating,
  className,
  size = 'text-lg',
}: {
  rating: number;
  className?: string;
  size?: string;
}) {
  return (
    <span
      className={cn('inline-flex items-center gap-0.5 text-brand-red', size, className)}
      aria-label={`${rating} / 5`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon
          key={i}
          filled={i <= Math.round(rating)}
          className={i <= Math.round(rating) ? 'text-brand-red' : 'text-brand-steel'}
        />
      ))}
    </span>
  );
}
