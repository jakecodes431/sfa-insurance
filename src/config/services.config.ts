/**
 * services.config.ts — for SFA Insurance Group these are the PRODUCT LINES the agency
 * helps with, not paid services. Money fields are kept (schema compatibility) but every
 * line is "no online price / no deposit" — the agent is paid by carrier commission, the
 * consumer never pays SFA. All lines are "bookable" = the consumer can request a call /
 * book a time with a licensed agent.
 *
 * COMPLIANCE: Medicare is consumer-initiated INBOUND only (no checkout, no pressure).
 * Dental/Vision and Life/Final Expense are the lines that can also be marketed harder and
 * routed to carrier self-service links (see the SFA blueprint, Track B).
 *
 * `category` reuses the existing union values as semantic slots:
 *   consultation -> "talk to a licensed agent" (all SFA lines)
 */

export type ServiceCategory = 'in_shop' | 'mobile' | 'consultation';

export interface Service {
  id: string;
  slug: string;
  name_en: string;
  name_es: string;
  description_en: string;
  description_es: string;
  category: ServiceCategory;
  /** Bookable online (request a call / book a time with a licensed agent). */
  bookable: boolean;
  /** Always 0 for SFA — the consumer never pays the agency. */
  depositCents: number;
  /** Always null for SFA — no online price; carrier sets premiums. */
  basePriceCents: number | null;
}

export const services: Service[] = [
  {
    id: 'medicare',
    slug: 'medicare',
    name_en: 'Medicare Plans',
    name_es: 'Planes de Medicare',
    description_en:
      'Medicare Advantage, Supplement, and Part D. A licensed agent reviews your doctors, prescriptions, and budget, then compares plans side by side. No cost to you.',
    description_es:
      'Medicare Advantage, Suplemento y Parte D. Un agente con licencia revisa sus médicos, recetas y presupuesto, y compara los planes. Sin costo para usted.',
    category: 'consultation',
    bookable: true,
    depositCents: 0,
    basePriceCents: null,
  },
  {
    id: 'dental-vision',
    slug: 'dental-vision',
    name_en: 'Dental & Vision',
    name_es: 'Dental y Visión',
    description_en:
      'Standalone dental and vision plans for any age. See available plans in your area and enroll yourself, or have an agent walk you through it.',
    description_es:
      'Planes dentales y de visión para cualquier edad. Vea los planes disponibles en su área e inscríbase usted mismo, o pida ayuda a un agente.',
    category: 'consultation',
    bookable: true,
    depositCents: 0,
    basePriceCents: null,
  },
  {
    id: 'life-final-expense',
    slug: 'life-final-expense',
    name_en: 'Life & Final Expense',
    name_es: 'Vida y Gastos Finales',
    description_en:
      'Affordable whole-life and final expense coverage so your family is not left with the bill. Simple qualification, fixed premiums.',
    description_es:
      'Cobertura de vida entera y gastos finales a precios accesibles para que su familia no quede con la cuenta. Calificación simple, primas fijas.',
    category: 'consultation',
    bookable: true,
    depositCents: 0,
    basePriceCents: null,
  },
  {
    id: 'under-65-health',
    slug: 'under-65-health',
    name_en: 'Under-65 Health',
    name_es: 'Salud Menores de 65',
    description_en:
      'Individual and family health coverage for those not yet on Medicare. An agent helps you find a plan that fits your needs and budget.',
    description_es:
      'Cobertura de salud individual y familiar para quienes aún no tienen Medicare. Un agente le ayuda a encontrar un plan a su medida.',
    category: 'consultation',
    bookable: true,
    depositCents: 0,
    basePriceCents: null,
  },
];

// ---------------------------------------------------------------- helpers
export const servicesByCategory = (category: ServiceCategory): Service[] =>
  services.filter((s) => s.category === category);

export const getServiceBySlug = (slug: string): Service | undefined =>
  services.find((s) => s.slug === slug);

export const bookableServices = (category?: ServiceCategory): Service[] =>
  services.filter((s) => s.bookable && (category ? s.category === category : true));
