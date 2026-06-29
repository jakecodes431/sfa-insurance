import type { ReviewRow } from '@/types/database.types';
import { StarRating } from './StarRating';

export function ReviewCard({ review }: { review: ReviewRow }) {
  return (
    <figure className="card relative flex flex-col">
      {/* Oversized quote mark watermark. */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-4 top-1 font-display text-6xl leading-none text-brand-red/15"
      >
        &rdquo;
      </span>
      <StarRating rating={review.rating} />
      <blockquote className="mt-4 flex-1 text-brand-white">
        &ldquo;{review.body}&rdquo;
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3 border-t border-brand-steel/60 pt-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-red font-display text-sm font-bold text-brand-white">
          {review.author_name.charAt(0).toUpperCase()}
        </span>
        <span className="text-sm">
          <span className="block font-semibold text-brand-white">{review.author_name}</span>
          {review.source !== 'native' && (
            <span className="capitalize text-brand-chrome/70">via {review.source}</span>
          )}
        </span>
      </figcaption>
    </figure>
  );
}
