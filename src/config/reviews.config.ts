/**
 * reviews.config.ts — the testimonials shown on the landing page.
 *
 * Reviews are set-and-forget content, not a live-managed feature: add or edit the agency's
 * real client reviews here and they render in the Reviews section (and feed the review
 * schema for SEO). Rating is 1-5. Keep them truthful.
 *
 * The entries below are PLACEHOLDERS — replace with SFA Insurance Group's real reviews.
 */
export interface Testimonial {
  name: string;
  rating: number;
  body: string;
}

export const testimonials: Testimonial[] = [
  {
    name: 'Patricia M.',
    rating: 5,
    body: 'They walked me through every Medicare option without any pressure. I finally understood my plan.',
  },
  {
    name: 'Gerald T.',
    rating: 5,
    body: 'My agent compared plans side by side and saved me money on my prescriptions. Highly recommend.',
  },
  {
    name: 'Linda K.',
    rating: 5,
    body: 'They explained my dental and Medicare options clearly and never pushed me. Very professional.',
  },
];
