/**
 * carriers.config.ts — the self-service enrollment funnel for the LOW-COMPLIANCE lines
 * (dental/vision, life/final expense). The consumer lands on a branded SFA page, fills a
 * short capture form (so SFA OWNS the lead + can match the conversion), then hands off to
 * the agent's carrier enrollment link where they pick a plan and pay on the carrier's site.
 *
 * Medicare is intentionally NOT here — it's consultative + TPMO-restricted, so it routes to
 * the booking/quote flow, never a self-enroll blast.
 *
 * Replace the `url`s below with the agent's REAL carrier agent links (Humana / Aetna /
 * Cigna / UnitedHealthcare / Ameritas). The placeholders point at carrier homepages so the
 * demo handoff works end to end.
 */
export interface CarrierLink {
  name: string;
  /** The agent's personal enrollment link for this carrier. PLACEHOLDER — replace. */
  url: string;
  logo?: string;
}

export interface EnrollProduct {
  slug: string;
  eyebrow: string;
  headline: string;
  sub: string;
  bullets: string[];
  /** Maps to the lead product_line so captures land tagged correctly. */
  productLine: 'dental-vision' | 'life-final-expense';
  carriers: CarrierLink[];
}

export const enrollProducts: Record<string, EnrollProduct> = {
  'dental-vision': {
    slug: 'dental-vision',
    productLine: 'dental-vision',
    eyebrow: 'Dental & Vision',
    headline: 'Dental & vision coverage you can enroll in today.',
    sub: 'Standalone plans for any age. See what is available in your area and sign yourself up in minutes. No phone call required.',
    bullets: [
      'Plans for individuals and families, any age',
      'Cleanings, exams, glasses, and more',
      'Enroll online in a few minutes',
      'A licensed agent is here if you want help',
    ],
    carriers: [
      { name: 'Aetna', url: 'https://www.aetna.com/', logo: '/carriers/aetna.png' },
      { name: 'Cigna', url: 'https://www.cigna.com/', logo: '/carriers/cigna.png' },
      { name: 'UnitedHealthcare', url: 'https://www.uhc.com/', logo: '/carriers/unitedhealthcare.png' },
    ],
  },
  'life-final-expense': {
    slug: 'life-final-expense',
    productLine: 'life-final-expense',
    eyebrow: 'Life & Final Expense',
    headline: 'Affordable final expense coverage, done on your terms.',
    sub: 'Simple whole-life and final expense plans so your family is not left with the bill. Fixed premiums, easy qualification.',
    bullets: [
      'Coverage that never expires',
      'Fixed premiums that never go up',
      'Simple health questions, no exam on many plans',
      'A licensed agent can walk you through it',
    ],
    carriers: [
      { name: 'Aetna', url: 'https://www.aetna.com/', logo: '/carriers/aetna.png' },
      { name: 'Cigna', url: 'https://www.cigna.com/', logo: '/carriers/cigna.png' },
    ],
  },
};

export const enrollSlugs = Object.keys(enrollProducts);
