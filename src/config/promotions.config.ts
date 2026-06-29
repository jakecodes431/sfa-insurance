/**
 * promotions.config.ts — type definitions + seed structure for promos/events.
 * LIVE promo data comes from the Supabase `promotions` table; this file defines the
 * shape and a small seed used for local/mock rendering before the DB is wired.
 *
 * PLACEHOLDER DATA: neutral generic promos for the SFP starter base.
 */

export type PromoStatus = 'draft' | 'published' | 'archived';

export interface Promotion {
  id: string;
  slug: string;
  title_en: string;
  title_es: string;
  body_en: string;
  body_es: string;
  image_url: string | null;
  status: PromoStatus;
  is_event: boolean;
  event_start: string | null; // ISO timestamp
  event_end: string | null; // ISO timestamp
  requires_registration: boolean;
  price_cents: number | null; // null/0 = free
  capacity: number | null; // null = unlimited
  published_at: string | null;
  created_at: string;
}

/**
 * Seed promos rendered when the DB layer is stubbed (mock mode).
 * Mirrors the rows the DB seed inserts into Supabase so /promotions is never empty.
 */
export const seedPromotions: Promotion[] = [
  {
    id: 'seed-welcome-offer',
    slug: 'welcome-offer',
    title_en: 'New Customer Welcome Offer',
    title_es: 'Oferta de Bienvenida para Nuevos Clientes',
    body_en:
      'New here? Book your first appointment online and mention this offer for a friendly welcome.',
    body_es:
      '¿Primera vez? Reserva tu primera cita en línea y menciona esta oferta para una calurosa bienvenida.',
    image_url: null,
    status: 'published',
    is_event: false,
    event_start: null,
    event_end: null,
    requires_registration: false,
    price_cents: null,
    capacity: null,
    published_at: '2026-06-01T12:00:00.000Z',
    created_at: '2026-06-01T12:00:00.000Z',
  },
  {
    id: 'seed-free-consultation',
    slug: 'free-consultation',
    title_en: 'Free Consultation',
    title_es: 'Consulta Gratis',
    body_en:
      'Not sure what you need? Schedule a free, no-obligation consultation and we will help you figure it out.',
    body_es:
      '¿No sabes qué necesitas? Agenda una consulta gratuita y sin compromiso y te ayudamos a resolverlo.',
    image_url: null,
    status: 'published',
    is_event: false,
    event_start: null,
    event_end: null,
    requires_registration: false,
    price_cents: null,
    capacity: null,
    published_at: '2026-06-01T12:00:00.000Z',
    created_at: '2026-06-01T12:00:00.000Z',
  },
];
