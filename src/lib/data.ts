/**
 * data.ts — the single data-access layer. Every read/write goes through here.
 *
 * In MOCK_MODE it operates on the localStorage-backed mockStore (seed data) so the app
 * builds and runs without a live Supabase project. When real credentials are present it
 * issues real Supabase queries (RLS-enforced). Callers don't care which path runs.
 */
import { MOCK_MODE } from '@/config/env';
import { mockStore, uuid } from './mockStore';
import * as sfp from './sfp';
import type {
  BookingInsert,
  BookingRow,
  BookingStatus,
  LeadInsert,
  LeadRow,
  LeadStatus,
  OrderRow,
  PromotionInsert,
  PromotionRow,
  PromoRegistrationInsert,
  PromoRegistrationRow,
  ReviewRow,
} from '@/types/database.types';
import type { LeadNote, LeadActivity, LeadActivityKind } from '@/types/crm';
import type { Automation } from '@/config/automations.config';
import type { Campaign, CampaignEventKind } from '@/types/campaigns';

/** Human label for a status value (appointment_set -> "Appointment Set"). */
function statusLabel(s: LeadStatus): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Append a mock activity entry for a lead (demo timeline). */
function logActivity(leadId: string, kind: LeadActivityKind, label: string): void {
  if (!MOCK_MODE) return;
  mockStore.db().leadActivity.push({
    id: uuid(),
    lead_id: leadId,
    kind,
    label,
    created_at: mockStore.nowIso(),
  });
  mockStore.save();
}

// ----------------------------------------------------------------- leads (SFA Insurance)
/**
 * Capture a lead from a public form. In MOCK_MODE it lands in the localStorage store so
 * the admin Leads tab shows it immediately; live, it inserts via the SFP backend RPC.
 * Either way it also fires an automation event (Resend/SMS follow-up wires to this).
 */
export async function createLead(input: LeadInsert): Promise<LeadRow> {
  if (MOCK_MODE) {
    const row: LeadRow = {
      id: input.id ?? uuid(),
      tenant_id: input.tenant_id ?? mockStore.tenantId,
      profile_id: input.profile_id ?? null,
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
      zip: input.zip ?? null,
      product_line: input.product_line,
      message: input.message ?? null,
      best_time: input.best_time ?? 'anytime',
      consent_contact: input.consent_contact ?? false,
      source: input.source ?? 'website-form',
      status: input.status ?? 'new',
      locale: input.locale ?? 'en',
      created_at: mockStore.nowIso(),
      updated_at: mockStore.nowIso(),
    };
    mockStore.db().leads.unshift(row);
    mockStore.save();
    logActivity(row.id, 'created', `Lead captured (${row.source ?? 'website'})`);
    return row;
  }
  return sfp.createLead(input);
}

export async function getAllLeads(): Promise<LeadRow[]> {
  if (MOCK_MODE)
    return [...mockStore.db().leads].sort((a, b) => b.created_at.localeCompare(a.created_at));
  return sfp.listLeads();
}

export async function setLeadStatus(id: string, status: LeadStatus): Promise<void> {
  if (MOCK_MODE) {
    const l = mockStore.db().leads.find((x) => x.id === id);
    if (l && l.status !== status) {
      l.status = status;
      l.updated_at = mockStore.nowIso();
      logActivity(id, 'status', `Status changed to ${statusLabel(status)}`);
    }
    mockStore.save();
    return;
  }
  await sfp.updateLead(id, { status });
}

// ----------------------------------------------------------------- lead notes + activity
export async function getLeadNotes(leadId: string): Promise<LeadNote[]> {
  if (MOCK_MODE)
    return mockStore
      .db()
      .leadNotes.filter((n) => n.lead_id === leadId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  return []; // live: sfp_ins_lead_notes (not wired in the demo)
}

export async function addLeadNote(leadId: string, body: string): Promise<LeadNote> {
  const note: LeadNote = {
    id: uuid(),
    lead_id: leadId,
    body: body.trim(),
    author: 'Agent',
    created_at: mockStore.nowIso(),
  };
  if (MOCK_MODE) {
    mockStore.db().leadNotes.unshift(note);
    mockStore.save();
    logActivity(leadId, 'note', 'Note added');
    return note;
  }
  throw new Error('Lead notes not wired to the live backend yet.');
}

/**
 * Send a marketing email to a set of leads. Demo: logs a send to each lead's timeline.
 * Live: batches to Resend (separate cold domain) via an Edge Function, honoring the
 * suppression list + rate limits. Compliance: caller must exclude Medicare + non-consented.
 */
export async function sendMarketingEmail(leadIds: string[], subject: string): Promise<number> {
  if (MOCK_MODE) {
    for (const id of leadIds) logActivity(id, 'email', `Marketing email sent: ${subject}`);
    return leadIds.length;
  }
  throw new Error('Resend blast not wired to the live backend yet.');
}

export async function getLeadActivity(leadId: string): Promise<LeadActivity[]> {
  if (MOCK_MODE)
    return mockStore
      .db()
      .leadActivity.filter((a) => a.lead_id === leadId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  return [];
}

// ----------------------------------------------------------------- automations (editable)
export async function getAutomations(): Promise<Automation[]> {
  // Return a fresh array so a save() (which mutates the store in place) yields a new
  // reference and React actually re-renders the toggles.
  if (MOCK_MODE) return [...mockStore.db().automations];
  return []; // live: sfp_ins_automations (not wired in the demo)
}

/** Upsert an automation (enabled flag or edited message content) and persist. */
export async function saveAutomation(updated: Automation): Promise<void> {
  if (MOCK_MODE) {
    const list = mockStore.db().automations;
    const i = list.findIndex((a) => a.id === updated.id);
    if (i >= 0) list[i] = updated;
    else list.push(updated);
    mockStore.save();
    return;
  }
  throw new Error('Automations not wired to the live backend yet.');
}

// ----------------------------------------------------------------- carrier campaigns
export async function getCampaigns(): Promise<Campaign[]> {
  if (MOCK_MODE)
    return [...mockStore.db().campaigns].sort((a, b) => b.created_at.localeCompare(a.created_at));
  return []; // live: sfp_ins_campaigns (not wired in the demo)
}

export async function getCampaignBySlug(slug: string): Promise<Campaign | null> {
  if (MOCK_MODE) return mockStore.db().campaigns.find((c) => c.slug === slug && c.enabled) ?? null;
  return null;
}

export async function saveCampaign(updated: Campaign): Promise<void> {
  if (MOCK_MODE) {
    const list = mockStore.db().campaigns;
    const i = list.findIndex((c) => c.id === updated.id);
    if (i >= 0) list[i] = updated;
    else list.unshift(updated);
    mockStore.save();
    return;
  }
  throw new Error('Campaigns not wired to the live backend yet.');
}

export async function deleteCampaign(id: string): Promise<void> {
  if (MOCK_MODE) {
    const db = mockStore.db();
    db.campaigns = db.campaigns.filter((c) => c.id !== id);
    db.campaignEvents = db.campaignEvents.filter((e) => e.campaign_id !== id);
    mockStore.save();
    return;
  }
  throw new Error('Campaigns not wired to the live backend yet.');
}

/** Record a click or capture against a campaign (attribution). */
export async function logCampaignEvent(
  campaignId: string,
  kind: CampaignEventKind,
  leadId?: string,
): Promise<void> {
  if (!MOCK_MODE) return;
  mockStore.db().campaignEvents.push({
    id: uuid(),
    campaign_id: campaignId,
    kind,
    lead_id: leadId ?? null,
    created_at: mockStore.nowIso(),
  });
  mockStore.save();
}

/** Per-campaign click + capture counts for the admin. */
export async function getCampaignStats(): Promise<Record<string, { clicks: number; captures: number }>> {
  if (!MOCK_MODE) return {};
  const stats: Record<string, { clicks: number; captures: number }> = {};
  for (const e of mockStore.db().campaignEvents) {
    stats[e.campaign_id] ??= { clicks: 0, captures: 0 };
    if (e.kind === 'click') stats[e.campaign_id].clicks++;
    else stats[e.campaign_id].captures++;
  }
  return stats;
}

// ----------------------------------------------------------------- reviews
export async function getFeaturedReviews(): Promise<ReviewRow[]> {
  if (MOCK_MODE) return mockStore.db().reviews.filter((r) => r.featured);
  return sfp.publicReviews();
}

export async function getAllReviews(): Promise<ReviewRow[]> {
  if (MOCK_MODE) return mockStore.db().reviews;
  return sfp.listReviews();
}

export async function setReviewFeatured(id: string, featured: boolean): Promise<void> {
  if (MOCK_MODE) {
    const r = mockStore.db().reviews.find((x) => x.id === id);
    if (r) r.featured = featured;
    mockStore.save();
    return;
  }
  await sfp.setReviewPublished(id, featured);
}

export async function addReview(input: {
  author_name: string;
  rating: number;
  body: string;
}): Promise<void> {
  if (MOCK_MODE) {
    mockStore.db().reviews.unshift({
      id: uuid(),
      author_name: input.author_name,
      rating: input.rating,
      body: input.body,
      source: 'native',
      featured: false,
      created_at: mockStore.nowIso(),
    });
    mockStore.save();
    return;
  }
  await sfp.createReview(input);
}

// ----------------------------------------------------------------- promotions
export async function getPublishedPromotions(): Promise<PromotionRow[]> {
  if (MOCK_MODE) return mockStore.db().promotions.filter((p) => p.status === 'published');
  return sfp.publicPromotions();
}

export async function getAllPromotions(): Promise<PromotionRow[]> {
  if (MOCK_MODE) return mockStore.db().promotions;
  return sfp.listPromotions();
}

export async function getPromotionBySlug(slug: string): Promise<PromotionRow | null> {
  if (MOCK_MODE) return mockStore.db().promotions.find((p) => p.slug === slug) ?? null;
  return sfp.publicPromotion(slug);
}

export async function upsertPromotion(input: PromotionInsert): Promise<PromotionRow> {
  if (MOCK_MODE) {
    const db = mockStore.db();
    const existing = input.id ? db.promotions.find((p) => p.id === input.id) : undefined;
    if (existing) {
      Object.assign(existing, input, { updated_at: mockStore.nowIso() });
      mockStore.save();
      return existing;
    }
    const row: PromotionRow = {
      id: input.id ?? uuid(),
      slug: input.slug,
      title_en: input.title_en,
      title_es: input.title_es,
      body_en: input.body_en ?? null,
      body_es: input.body_es ?? null,
      image_url: input.image_url ?? null,
      status: input.status ?? 'draft',
      is_event: input.is_event ?? false,
      event_start: input.event_start ?? null,
      event_end: input.event_end ?? null,
      requires_registration: input.requires_registration ?? false,
      price_cents: input.price_cents ?? null,
      capacity: input.capacity ?? null,
      published_at: input.published_at ?? null,
      created_at: mockStore.nowIso(),
      updated_at: mockStore.nowIso(),
    };
    db.promotions.unshift(row);
    mockStore.save();
    return row;
  }
  return sfp.upsertPromotion(input);
}

export async function setPromotionStatus(
  id: string,
  status: 'draft' | 'published' | 'archived',
): Promise<void> {
  const published_at = status === 'published' ? mockStore.nowIso() : null;
  if (MOCK_MODE) {
    const p = mockStore.db().promotions.find((x) => x.id === id);
    if (p) {
      p.status = status;
      if (status === 'published') p.published_at = published_at;
    }
    mockStore.save();
    return;
  }
  await sfp.setPromotionStatus(id, status, published_at);
}

export async function countPromoRegistrations(promoId: string): Promise<number> {
  if (MOCK_MODE)
    return mockStore.db().promoRegistrations.filter((r) => r.promo_id === promoId).length;
  return sfp.countPromoRegistrations(promoId);
}

// ----------------------------------------------------------------- bookings
export async function createBooking(input: BookingInsert): Promise<BookingRow> {
  if (MOCK_MODE) {
    const row: BookingRow = {
      id: input.id ?? uuid(),
      profile_id: input.profile_id ?? null,
      guest_name: input.guest_name ?? null,
      guest_email: input.guest_email ?? null,
      guest_phone: input.guest_phone ?? null,
      booking_type: input.booking_type,
      service_slug: input.service_slug,
      status: input.status ?? 'requested',
      scheduled_at: input.scheduled_at ?? null,
      location_address: input.location_address ?? null,
      location_lat: input.location_lat ?? null,
      location_lng: input.location_lng ?? null,
      vehicle_info: input.vehicle_info ?? null,
      issue_description: input.issue_description ?? null,
      locale: input.locale ?? 'en',
      payment_status: input.payment_status ?? 'none',
      deposit_cents: input.deposit_cents ?? 0,
      stripe_payment_intent_id: input.stripe_payment_intent_id ?? null,
      calcom_booking_id: input.calcom_booking_id ?? null,
      created_at: mockStore.nowIso(),
      updated_at: mockStore.nowIso(),
    };
    mockStore.db().bookings.unshift(row);
    mockStore.save();
    return row;
  }
  return sfp.createBooking(input);
}

export async function getAllBookings(): Promise<BookingRow[]> {
  if (MOCK_MODE)
    return [...mockStore.db().bookings].sort((a, b) => b.created_at.localeCompare(a.created_at));
  return sfp.listBookings();
}

export async function getMyBookings(profileId: string, email?: string | null): Promise<BookingRow[]> {
  if (MOCK_MODE) {
    return mockStore
      .db()
      .bookings.filter((b) => b.profile_id === profileId || (email && b.guest_email === email));
  }
  // RLS returns only the signed-in customer's own bookings.
  return sfp.listMyBookings();
}

export async function advanceBookingStatus(id: string, status: BookingStatus): Promise<void> {
  if (MOCK_MODE) {
    const b = mockStore.db().bookings.find((x) => x.id === id);
    if (b) {
      b.status = status;
      b.updated_at = mockStore.nowIso();
    }
    mockStore.save();
    return;
  }
  await sfp.updateBooking(id, { status });
}

export async function markBookingPaid(
  id: string,
  paymentIntentId: string,
  status: 'deposit_paid' | 'paid',
): Promise<void> {
  if (MOCK_MODE) {
    const b = mockStore.db().bookings.find((x) => x.id === id);
    if (b) {
      b.payment_status = status;
      b.stripe_payment_intent_id = paymentIntentId;
      b.updated_at = mockStore.nowIso();
    }
    mockStore.save();
    return;
  }
  await sfp.updateBooking(id, { payment_status: status, stripe_payment_intent_id: paymentIntentId });
}

// ----------------------------------------------------------------- promo registrations
export async function createPromoRegistration(
  input: PromoRegistrationInsert,
): Promise<PromoRegistrationRow> {
  if (MOCK_MODE) {
    const row: PromoRegistrationRow = {
      id: input.id ?? uuid(),
      promo_id: input.promo_id,
      profile_id: input.profile_id ?? null,
      guest_name: input.guest_name ?? null,
      guest_email: input.guest_email ?? null,
      guest_phone: input.guest_phone ?? null,
      quantity: input.quantity ?? 1,
      payment_status: input.payment_status ?? 'none',
      stripe_payment_intent_id: input.stripe_payment_intent_id ?? null,
      locale: input.locale ?? 'en',
      created_at: mockStore.nowIso(),
    };
    mockStore.db().promoRegistrations.unshift(row);
    mockStore.save();
    return row;
  }
  return sfp.createPromoRegistration(input);
}

export async function getMyRegistrations(
  profileId: string,
  email?: string | null,
): Promise<PromoRegistrationRow[]> {
  if (MOCK_MODE) {
    return mockStore
      .db()
      .promoRegistrations.filter(
        (r) => r.profile_id === profileId || (email && r.guest_email === email),
      );
  }
  // RLS returns only the signed-in customer's own registrations.
  return sfp.listMyRegistrations();
}

// ----------------------------------------------------------------- orders
export async function getAllOrders(): Promise<OrderRow[]> {
  if (MOCK_MODE)
    return [...mockStore.db().orders].sort((a, b) => b.created_at.localeCompare(a.created_at));
  return sfp.listOrders();
}

export async function getMyOrders(profileId: string): Promise<OrderRow[]> {
  if (MOCK_MODE) return mockStore.db().orders.filter((o) => o.profile_id === profileId);
  // RLS returns only the signed-in customer's own orders.
  return sfp.listMyOrders();
}

/** Create a local order record (MOCK_MODE only — real orders are written by the Edge Function). */
export function recordMockOrder(order: {
  booking_id?: string | null;
  promo_id?: string | null;
  amount_cents: number;
  status: 'deposit_paid' | 'paid';
  stripe_payment_intent_id: string;
  receipt_url: string;
}): OrderRow {
  // Idempotent: refreshing the success page must not create a duplicate order.
  const existing = mockStore
    .db()
    .orders.find((o) => o.stripe_payment_intent_id === order.stripe_payment_intent_id);
  if (existing) return existing;
  const row: OrderRow = {
    id: uuid(),
    booking_id: order.booking_id ?? null,
    promo_id: order.promo_id ?? null,
    profile_id: null,
    amount_cents: order.amount_cents,
    currency: 'usd',
    status: order.status,
    stripe_payment_intent_id: order.stripe_payment_intent_id,
    stripe_charge_id: `ch_mock_${order.stripe_payment_intent_id.slice(-8)}`,
    receipt_url: order.receipt_url,
    created_at: mockStore.nowIso(),
  };
  mockStore.db().orders.unshift(row);
  mockStore.save();
  return row;
}
