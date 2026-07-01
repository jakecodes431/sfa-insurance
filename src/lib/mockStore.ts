/**
 * mockStore.ts — localStorage-backed in-memory store used in MOCK_MODE (placeholder creds).
 * Seeds from config/seed data so every flow (booking, payment, promos, admin) works
 * end-to-end without a live Supabase project. Swapped out for real queries once wired.
 *
 * PLACEHOLDER seed data — neutral generic business. Replace per client during wire-up.
 */
import { services as serviceConfig } from '@/config/services.config';
import { getActiveTenant } from '@/config/tenants';
import type {
  BookingRow,
  LeadRow,
  OrderRow,
  PromotionRow,
  PromoRegistrationRow,
  ReviewRow,
  ServiceRow,
  ServiceCategoryRow,
  InvoiceRow,
  InvoiceLineItemRow,
} from '@/types/database.types';
import type { LeadNote, LeadActivity } from '@/types/crm';
import type { Campaign, CampaignEvent } from '@/types/campaigns';
import { automations as defaultAutomations, type Automation } from '@/config/automations.config';

const KEY = 'sfp.mockStore.v6';

interface MockDb {
  leads: LeadRow[];
  leadNotes: LeadNote[];
  leadActivity: LeadActivity[];
  automations: Automation[];
  campaigns: Campaign[];
  campaignEvents: CampaignEvent[];
  bookings: BookingRow[];
  orders: OrderRow[];
  promotions: PromotionRow[];
  promoRegistrations: PromoRegistrationRow[];
  reviews: ReviewRow[];
  serviceCategories: ServiceCategoryRow[];
  invoices: InvoiceRow[];
  invoiceLineItems: InvoiceLineItemRow[];
}

function seedCategories(tenantId: string): ServiceCategoryRow[] {
  const at = '2026-06-01T12:00:00.000Z';
  return [
    { id: 'cat-standard', tenant_id: tenantId, name_en: 'Services', name_es: 'Servicios', sort_order: 1, active: true, created_at: at },
    { id: 'cat-consult', tenant_id: tenantId, name_en: 'Consultation', name_es: 'Consulta', sort_order: 2, active: true, created_at: at },
    { id: 'cat-onsite', tenant_id: tenantId, name_en: 'On-Site', name_es: 'A Domicilio', sort_order: 3, active: true, created_at: at },
  ];
}

function nowIso(): string {
  return new Date().toISOString();
}

export function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.floor(performance.now() * 1000) + Date.parse(nowIso())) % 16;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function seedServices(): ServiceRow[] {
  return serviceConfig.map((s) => ({
    id: s.id,
    slug: s.slug,
    name_en: s.name_en,
    name_es: s.name_es,
    description_en: s.description_en,
    description_es: s.description_es,
    category: s.category,
    bookable: s.bookable,
    deposit_cents: s.depositCents,
    base_price_cents: s.basePriceCents,
    active: true,
    created_at: '2026-06-01T12:00:00.000Z',
  }));
}

function seedLeads(tenantId: string): LeadRow[] {
  const base = {
    tenant_id: tenantId,
    profile_id: null as string | null,
    consent_contact: true,
    locale: 'en' as const,
  };
  return [
    {
      ...base,
      id: 'lead-1',
      name: 'Robert Alvarez',
      email: 'r.alvarez@example.com',
      phone: '(815) 555-0142',
      zip: '60540',
      product_line: 'medicare',
      message: 'Turning 65 in September, need help choosing a plan before enrollment.',
      best_time: 'morning',
      source: 'website-form',
      status: 'new',
      created_at: '2026-06-28T14:12:00.000Z',
      updated_at: '2026-06-28T14:12:00.000Z',
    },
    {
      ...base,
      id: 'lead-2',
      name: 'Diane Whitfield',
      email: 'diane.w@example.com',
      phone: '(248) 555-0188',
      zip: '48201',
      product_line: 'dental-vision',
      message: 'Want standalone dental + vision, no medical.',
      best_time: 'afternoon',
      source: 'facebook-ad: dental-jun',
      status: 'contacted',
      created_at: '2026-06-27T18:40:00.000Z',
      updated_at: '2026-06-27T20:05:00.000Z',
    },
    {
      ...base,
      id: 'lead-3',
      name: 'James Okafor',
      email: null,
      phone: '(773) 555-0117',
      zip: '60616',
      product_line: 'life-final-expense',
      message: 'Final expense for my mother, fixed budget.',
      best_time: 'evening',
      source: 'website-form',
      status: 'appointment_set',
      created_at: '2026-06-26T15:22:00.000Z',
      updated_at: '2026-06-27T13:10:00.000Z',
    },
    {
      ...base,
      id: 'lead-4',
      name: 'Maria Santos',
      email: 'maria.santos@example.com',
      phone: '(312) 555-0163',
      zip: '60629',
      product_line: 'medicare',
      message: 'Turning 65 next month and need help choosing a Medicare plan.',
      best_time: 'anytime',
      source: 'website-form',
      status: 'enrolled',
      created_at: '2026-06-25T16:02:00.000Z',
      updated_at: '2026-06-26T09:30:00.000Z',
    },
  ];
}

/** Consultation appointments for the admin Appointments queue. These mirror what a Cal
 *  booking (or a "Speak With a Specialist" request) creates: a person, a product line,
 *  and a requested time. No vehicles, no dispatch — this is a phone-consult agency. */
function seedBookings(): BookingRow[] {
  const base = {
    profile_id: null as string | null,
    booking_type: 'in_shop' as const, // unused slot for SFA; the queue never shows it
    location_address: null as string | null,
    location_lat: null as number | null,
    location_lng: null as number | null,
    vehicle_info: null,
    locale: 'en' as const,
    payment_status: 'none' as const,
    deposit_cents: 0,
    stripe_payment_intent_id: null as string | null,
    calcom_booking_id: null as string | null,
  };
  return [
    {
      ...base,
      id: 'appt-1',
      guest_name: 'Eleanor Briggs',
      guest_email: 'eleanor.briggs@example.com',
      guest_phone: '(815) 555-0190',
      service_slug: 'medicare',
      status: 'requested',
      issue_description: 'New to Medicare, wants to compare Advantage vs Supplement.',
      scheduled_at: '2026-07-02T15:00:00.000Z',
      created_at: '2026-06-29T13:20:00.000Z',
      updated_at: '2026-06-29T13:20:00.000Z',
    },
    {
      ...base,
      id: 'appt-2',
      guest_name: 'Marcus Hill',
      guest_email: 'marcus.hill@example.com',
      guest_phone: '(248) 555-0176',
      service_slug: 'dental-vision',
      status: 'confirmed',
      issue_description: 'Standalone dental + vision for him and his wife.',
      scheduled_at: '2026-07-01T18:30:00.000Z',
      created_at: '2026-06-28T16:45:00.000Z',
      updated_at: '2026-06-28T17:10:00.000Z',
    },
    {
      ...base,
      id: 'appt-3',
      guest_name: 'Rosa Delgado',
      guest_email: 'rosa.delgado@example.com',
      guest_phone: '(312) 555-0148',
      service_slug: 'life-final-expense',
      status: 'completed',
      issue_description: 'Final expense for her father; reviewed three carriers.',
      scheduled_at: '2026-06-26T17:00:00.000Z',
      created_at: '2026-06-24T14:05:00.000Z',
      updated_at: '2026-06-26T17:40:00.000Z',
    },
    {
      ...base,
      id: 'appt-4',
      guest_name: 'Anthony Russo',
      guest_email: 'a.russo@example.com',
      guest_phone: '(773) 555-0133',
      service_slug: 'under-65-health',
      status: 'requested',
      issue_description: 'Lost employer coverage, needs an individual plan.',
      scheduled_at: '2026-07-03T14:00:00.000Z',
      created_at: '2026-06-29T19:02:00.000Z',
      updated_at: '2026-06-29T19:02:00.000Z',
    },
  ];
}

function seedLeadNotes(): LeadNote[] {
  return [
    { id: 'note-1', lead_id: 'lead-2', body: 'Left a voicemail, texted the intake link. Prefers afternoons.', author: 'Agent', created_at: '2026-06-27T20:05:00.000Z' },
    { id: 'note-2', lead_id: 'lead-3', body: 'Reviewed three final-expense carriers with him. Sending a summary.', author: 'Agent', created_at: '2026-06-27T13:10:00.000Z' },
    { id: 'note-3', lead_id: 'lead-4', body: 'Enrolled in a $0-premium MA plan. Welcome packet on the way.', author: 'Agent', created_at: '2026-06-26T09:30:00.000Z' },
  ];
}

function seedLeadActivity(): LeadActivity[] {
  return [
    // Robert Alvarez (new)
    { id: 'act-1', lead_id: 'lead-1', kind: 'created', label: 'Lead captured from the website form', created_at: '2026-06-28T14:12:00.000Z' },
    // Diane Whitfield (contacted)
    { id: 'act-2', lead_id: 'lead-2', kind: 'created', label: 'Lead captured from a Facebook ad', created_at: '2026-06-27T18:40:00.000Z' },
    { id: 'act-3', lead_id: 'lead-2', kind: 'status', label: 'Status changed to Contacted', created_at: '2026-06-27T20:05:00.000Z' },
    // James Okafor (appointment_set)
    { id: 'act-4', lead_id: 'lead-3', kind: 'created', label: 'Lead captured from the website form', created_at: '2026-06-26T15:22:00.000Z' },
    { id: 'act-5', lead_id: 'lead-3', kind: 'status', label: 'Status changed to Appointment Set', created_at: '2026-06-27T13:10:00.000Z' },
    // Maria Santos (enrolled)
    { id: 'act-6', lead_id: 'lead-4', kind: 'created', label: 'Lead captured from the website form', created_at: '2026-06-25T16:02:00.000Z' },
    { id: 'act-7', lead_id: 'lead-4', kind: 'status', label: 'Status changed to Enrolled', created_at: '2026-06-26T09:30:00.000Z' },
  ];
}

/** Editable automations start as a deep copy of the config defaults. */
function seedAutomations(): Automation[] {
  return JSON.parse(JSON.stringify(defaultAutomations)) as Automation[];
}

function seedCampaigns(): Campaign[] {
  return [
    {
      id: 'camp-1',
      name: 'Dental — Facebook Q3',
      carrier: 'Aetna',
      product_line: 'dental-vision',
      agent_url: 'https://www.aetna.com/',
      slug: 'aetna-dental',
      embed: false,
      enabled: true,
      created_at: '2026-06-20T12:00:00.000Z',
    },
    {
      id: 'camp-2',
      name: 'Final Expense — Google',
      carrier: 'Cigna',
      product_line: 'life-final-expense',
      agent_url: 'https://www.cigna.com/',
      slug: 'cigna-final-expense',
      embed: false,
      enabled: true,
      created_at: '2026-06-22T12:00:00.000Z',
    },
  ];
}

function seedCampaignEvents(): CampaignEvent[] {
  const clicks = (id: string, campaign_id: string, n: number, day: string): CampaignEvent[] =>
    Array.from({ length: n }, (_, i) => ({
      id: `${id}-${i}`,
      campaign_id,
      kind: 'click' as const,
      lead_id: null,
      created_at: `2026-06-${day}T1${i % 9}:00:00.000Z`,
    }));
  return [
    ...clicks('c1c', 'camp-1', 34, '24'),
    ...clicks('c2c', 'camp-2', 18, '25'),
    { id: 'cap-1', campaign_id: 'camp-1', kind: 'capture', lead_id: null, created_at: '2026-06-24T15:00:00.000Z' },
    { id: 'cap-2', campaign_id: 'camp-1', kind: 'capture', lead_id: null, created_at: '2026-06-24T16:30:00.000Z' },
    { id: 'cap-3', campaign_id: 'camp-2', kind: 'capture', lead_id: null, created_at: '2026-06-25T14:00:00.000Z' },
  ];
}

function seedReviews(): ReviewRow[] {
  return [
    {
      id: 'rev-1',
      author_name: 'Patricia M.',
      rating: 5,
      body: 'They walked me through every Medicare option without any pressure. I finally understood my plan. (sample review)',
      source: 'google',
      featured: true,
      created_at: '2026-06-03T12:00:00.000Z',
    },
    {
      id: 'rev-2',
      author_name: 'Gerald T.',
      rating: 5,
      body: 'My agent compared plans side by side and saved me money on my prescriptions. Highly recommend. (sample review)',
      source: 'google',
      featured: true,
      created_at: '2026-05-20T12:00:00.000Z',
    },
    {
      id: 'rev-3',
      author_name: 'Linda K.',
      rating: 5,
      body: 'They explained my dental and Medicare options clearly and never pushed me. Very professional. (sample review)',
      source: 'facebook',
      featured: true,
      created_at: '2026-05-10T12:00:00.000Z',
    },
  ];
}

function seedPromotions(): PromotionRow[] {
  const base = {
    body_en: null as string | null,
    image_url: null as string | null,
    event_start: null as string | null,
    event_end: null as string | null,
    capacity: null as number | null,
    price_cents: null as number | null,
    created_at: '2026-06-01T12:00:00.000Z',
    updated_at: '2026-06-01T12:00:00.000Z',
  };
  return [
    {
      ...base,
      id: 'promo-welcome',
      slug: 'welcome-offer',
      title_en: 'New Customer Welcome Offer',
      title_es: 'Oferta de Bienvenida para Nuevos Clientes',
      body_en:
        'New here? Book your first appointment online and mention this offer for a friendly welcome.',
      body_es:
        '¿Primera vez? Reserva tu primera cita en línea y menciona esta oferta para una calurosa bienvenida.',
      status: 'published',
      is_event: false,
      requires_registration: false,
      published_at: '2026-06-01T12:00:00.000Z',
    },
    {
      ...base,
      id: 'promo-consult',
      slug: 'free-consultation',
      title_en: 'Free Consultation',
      title_es: 'Consulta Gratis',
      body_en: 'Not sure what you need? Schedule a free, no-obligation consultation.',
      body_es: '¿No sabes qué necesitas? Agenda una consulta gratuita y sin compromiso.',
      status: 'published',
      is_event: false,
      requires_registration: false,
      published_at: '2026-06-01T12:00:00.000Z',
    },
    {
      ...base,
      id: 'promo-event',
      slug: 'community-open-house',
      title_en: 'Community Open House',
      title_es: 'Jornada de Puertas Abiertas',
      body_en:
        'Join us for a community open house: meet the team, refreshments, and giveaways.',
      body_es:
        'Acompáñanos en una jornada de puertas abiertas: conoce al equipo, refrigerios y regalos.',
      status: 'published',
      is_event: true,
      requires_registration: true,
      event_start: '2026-07-12T15:00:00.000Z',
      event_end: '2026-07-12T20:00:00.000Z',
      capacity: 50,
      published_at: '2026-06-05T12:00:00.000Z',
    },
  ];
}

let cache: MockDb | null = null;
const services = seedServices();

function load(): MockDb {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      cache = JSON.parse(raw) as MockDb;
      // Backfill arrays added in later phases for stores seeded before they existed.
      cache.leads ??= seedLeads(getActiveTenant().id);
      cache.leadNotes ??= seedLeadNotes();
      cache.leadActivity ??= seedLeadActivity();
      cache.automations ??= seedAutomations();
      cache.campaigns ??= seedCampaigns();
      cache.campaignEvents ??= seedCampaignEvents();
      cache.serviceCategories ??= seedCategories(getActiveTenant().id);
      cache.invoices ??= [];
      cache.invoiceLineItems ??= [];
      return cache;
    }
  } catch {
    /* ignore */
  }
  cache = {
    leads: seedLeads(getActiveTenant().id),
    leadNotes: seedLeadNotes(),
    leadActivity: seedLeadActivity(),
    automations: seedAutomations(),
    campaigns: seedCampaigns(),
    campaignEvents: seedCampaignEvents(),
    bookings: seedBookings(),
    orders: [],
    promotions: seedPromotions(),
    promoRegistrations: [],
    reviews: seedReviews(),
    serviceCategories: seedCategories(getActiveTenant().id),
    invoices: [],
    invoiceLineItems: [],
  };
  persist();
  return cache;
}

function persist(): void {
  if (!cache) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    /* ignore quota errors in demo */
  }
}

export const mockStore = {
  services: () => services,
  db: load,
  save: persist,
  nowIso,
  /** Active tenant id — new mock rows are tagged with it (mirrors tenant_id default). */
  tenantId: getActiveTenant().id,
};
