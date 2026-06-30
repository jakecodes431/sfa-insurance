/**
 * sfp.ts — adapter onto the shared ServiceFlowPro backend.
 *
 * The app's internal Row types (src/types/database.types.ts) describe the standalone
 * schema (tenant_id / active). The live backend is the multi-tenant SFP project
 * (organization_code / is_active, sfp_-prefixed tables). This module is the ONLY place
 * that bridges the two: it calls the SFP RPCs/tables and maps results back to the
 * internal Row shapes, so the rest of the app is unchanged.
 *
 * The active tenant's slug IS its organization_code (see src/config/tenants.ts).
 */
import { supabase } from './supabase';
import { getActiveTenant } from '@/config/tenants';
import type {
  SfpServiceCategoryRow,
  SfpServiceCategoryInsert,
  SfpTireBookingRow,
  SfpTireBookingInsert,
  SfpTireOrderRow,
  SfpTireInvoiceRow,
  SfpTireInvoiceInsert,
  ServiceCategoryRow,
  ServiceCategoryInsert,
  BookingRow,
  BookingInsert,
  OrderRow,
  InvoiceRow,
  InvoiceInsert,
  InvoiceLineItemRow,
  ReviewRow,
  PromotionRow,
  PromotionInsert,
  PromoRegistrationRow,
  PromoRegistrationInsert,
  SfpTirePromotionRow,
  SfpTirePromotionInsert,
  SfpTireContentBlockRow,
  SfpTireContentBlockInsert,
  LeadRow,
  LeadInsert,
  SfpInsLeadRow,
  SfpInsLeadInsert,
} from '@/types/database.types';

/** The SFP tables/RPCs live on the same client (their types are part of Database). */
const sfp = supabase;

/** organization_code for this build's tenant. */
export const orgCode = (): string => getActiveTenant().slug;

// --------------------------------------------------------------- service categories
/** SFP single-language category → internal bilingual row. SFP has no Spanish column,
 *  so name_es mirrors name until a localized catalog is introduced. */
function categoryFromTable(r: SfpServiceCategoryRow): ServiceCategoryRow {
  return {
    id: r.id,
    tenant_id: r.organization_code,
    name_en: r.name,
    name_es: r.name,
    sort_order: r.sort_order,
    active: r.is_active,
    created_at: r.created_at,
  };
}

function categoryToInsert(input: ServiceCategoryInsert): SfpServiceCategoryInsert {
  return {
    id: input.id,
    organization_code: orgCode(),
    name: input.name_en,
    sort_order: input.sort_order,
    is_active: input.active,
  };
}

export async function listCategories(): Promise<ServiceCategoryRow[]> {
  const { data, error } = await sfp
    .from('sfp_service_categories')
    .select('*')
    .eq('organization_code', orgCode())
    .order('sort_order');
  if (error) throw new Error(error.message);
  return (data ?? []).map(categoryFromTable);
}

export async function upsertCategory(input: ServiceCategoryInsert): Promise<ServiceCategoryRow> {
  const { data, error } = await sfp
    .from('sfp_service_categories')
    .upsert(categoryToInsert(input))
    .select()
    .single();
  if (error) throw new Error(error.message);
  return categoryFromTable(data);
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await sfp
    .from('sfp_service_categories')
    .delete()
    .eq('id', id)
    .eq('organization_code', orgCode());
  if (error) throw new Error(error.message);
}

// --------------------------------------------------------------- bookings
/** SFP booking row → internal BookingRow (client_auth_id ↔ profile_id). */
function bookingFromTable(r: SfpTireBookingRow): BookingRow {
  return {
    id: r.id,
    profile_id: r.client_auth_id,
    guest_name: r.guest_name,
    guest_email: r.guest_email,
    guest_phone: r.guest_phone,
    booking_type: r.booking_type,
    service_slug: r.service_slug,
    status: r.status,
    scheduled_at: r.scheduled_at,
    location_address: r.location_address,
    location_lat: r.location_lat,
    location_lng: r.location_lng,
    vehicle_info: r.vehicle_info,
    issue_description: r.issue_description,
    locale: r.locale,
    payment_status: r.payment_status,
    deposit_cents: r.deposit_cents,
    stripe_payment_intent_id: r.stripe_payment_intent_id,
    calcom_booking_id: r.calcom_booking_id,
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}

/** Guests create bookings through the anon-safe RPC; returns the materialized row. */
export async function createBooking(input: BookingInsert): Promise<BookingRow> {
  const { data: id, error } = await sfp.rpc('sfp_public_create_tire_booking', {
    p_org: orgCode(),
    p_booking_type: input.booking_type,
    p_service_slug: input.service_slug,
    p_name: input.guest_name ?? '',
    p_email: input.guest_email ?? '',
    p_phone: input.guest_phone ?? null,
    p_scheduled_at: input.scheduled_at ?? null,
    p_location_address: input.location_address ?? null,
    p_location_lat: input.location_lat ?? null,
    p_location_lng: input.location_lng ?? null,
    p_vehicle_info: input.vehicle_info ?? null,
    p_issue_description: input.issue_description ?? null,
    p_locale: input.locale ?? 'en',
    p_deposit_cents: input.deposit_cents ?? 0,
    p_calcom_booking_id: input.calcom_booking_id ?? null,
  });
  if (error) throw new Error(error.message);
  return {
    id: id as string,
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
    created_at: '',
    updated_at: '',
  };
}

/** All bookings for the org (staff; RLS-scoped). */
export async function listBookings(): Promise<BookingRow[]> {
  const { data, error } = await sfp
    .from('sfp_tire_bookings')
    .select('*')
    .eq('organization_code', orgCode())
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(bookingFromTable);
}

/** The signed-in customer's own bookings (RLS returns only their rows). */
export async function listMyBookings(): Promise<BookingRow[]> {
  const { data, error } = await sfp
    .from('sfp_tire_bookings')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(bookingFromTable);
}

export async function updateBooking(
  id: string,
  patch: Partial<SfpTireBookingInsert>,
): Promise<void> {
  const { error } = await sfp.from('sfp_tire_bookings').update(patch).eq('id', id);
  if (error) throw new Error(error.message);
}

// --------------------------------------------------------------- orders
function orderFromTable(r: SfpTireOrderRow): OrderRow {
  return {
    id: r.id,
    booking_id: r.booking_id,
    promo_id: r.promo_id,
    profile_id: r.client_auth_id,
    amount_cents: r.amount_cents,
    currency: r.currency,
    status: r.status,
    stripe_payment_intent_id: r.stripe_payment_intent_id,
    stripe_charge_id: r.stripe_charge_id,
    receipt_url: r.receipt_url,
    created_at: r.created_at,
  };
}

export async function listOrders(): Promise<OrderRow[]> {
  const { data, error } = await sfp
    .from('sfp_tire_orders')
    .select('*')
    .eq('organization_code', orgCode())
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(orderFromTable);
}

export async function listMyOrders(): Promise<OrderRow[]> {
  const { data, error } = await sfp
    .from('sfp_tire_orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(orderFromTable);
}

// --------------------------------------------------------------- invoices
function invoiceFromTable(r: SfpTireInvoiceRow): InvoiceRow {
  return {
    id: r.id,
    tenant_id: r.organization_code,
    invoice_number: r.invoice_number,
    customer_profile_id: r.customer_auth_id,
    customer_name: r.customer_name,
    customer_email: r.customer_email,
    customer_phone: r.customer_phone,
    status: r.status,
    currency: r.currency,
    subtotal_cents: r.subtotal_cents,
    tax_cents: r.tax_cents,
    total_cents: r.total_cents,
    notes: r.notes,
    due_date: r.due_date,
    stripe_payment_intent_id: r.stripe_payment_intent_id,
    stripe_invoice_id: r.stripe_invoice_id,
    hosted_pay_url: r.hosted_pay_url,
    locale: r.locale,
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}

export async function listInvoices(): Promise<InvoiceRow[]> {
  const { data, error } = await sfp
    .from('sfp_tire_invoices')
    .select('*')
    .eq('organization_code', orgCode())
    .order('invoice_number', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(invoiceFromTable);
}

/** Fetch an invoice + its line items via the public RPC (works for staff and the pay link;
 *  the unguessable uuid is the access token, and Stripe ids are excluded server-side). */
export async function getInvoiceBundle(
  id: string,
): Promise<{ invoice: InvoiceRow; items: InvoiceLineItemRow[] } | null> {
  const { data, error } = await sfp.rpc('sfp_public_tire_invoice', { p_id: id });
  if (error) throw new Error(error.message);
  if (!data) return null;
  return {
    invoice: {
      id: data.invoice.id,
      tenant_id: data.invoice.organization_code,
      invoice_number: data.invoice.invoice_number,
      customer_profile_id: null,
      customer_name: data.invoice.customer_name,
      customer_email: data.invoice.customer_email,
      customer_phone: data.invoice.customer_phone,
      status: data.invoice.status,
      currency: data.invoice.currency,
      subtotal_cents: data.invoice.subtotal_cents,
      tax_cents: data.invoice.tax_cents,
      total_cents: data.invoice.total_cents,
      notes: data.invoice.notes,
      due_date: data.invoice.due_date,
      stripe_payment_intent_id: null,
      stripe_invoice_id: null,
      hosted_pay_url: data.invoice.hosted_pay_url,
      locale: data.invoice.locale,
      created_at: data.invoice.created_at,
      updated_at: data.invoice.created_at,
    },
    items: data.items,
  };
}

/** Upsert an invoice (per-org invoice_number auto-assigned by trigger on insert) and
 *  replace its line items. `input` carries totals already computed by the caller. */
export async function saveInvoice(
  input: InvoiceInsert,
  items: { description: string; quantity: number; unit_price_cents: number }[],
): Promise<InvoiceRow> {
  const payload: SfpTireInvoiceInsert = {
    id: input.id,
    organization_code: orgCode(),
    customer_auth_id: input.customer_profile_id,
    customer_name: input.customer_name,
    customer_email: input.customer_email,
    customer_phone: input.customer_phone,
    status: input.status,
    currency: input.currency,
    subtotal_cents: input.subtotal_cents,
    tax_cents: input.tax_cents,
    total_cents: input.total_cents,
    notes: input.notes,
    due_date: input.due_date,
    locale: input.locale,
  };
  const { data, error } = await sfp
    .from('sfp_tire_invoices')
    .upsert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message);
  await sfp.from('sfp_tire_invoice_line_items').delete().eq('invoice_id', data.id);
  if (items.length > 0) {
    const { error: liErr } = await sfp.from('sfp_tire_invoice_line_items').insert(
      items.map((it, idx) => ({
        invoice_id: data.id,
        description: it.description,
        quantity: it.quantity,
        unit_price_cents: it.unit_price_cents,
        amount_cents: it.quantity * it.unit_price_cents,
        sort_order: idx,
      })),
    );
    if (liErr) throw new Error(liErr.message);
  }
  return invoiceFromTable(data);
}

export async function updateInvoice(
  id: string,
  patch: Partial<SfpTireInvoiceInsert>,
): Promise<InvoiceRow | null> {
  const { data, error } = await sfp
    .from('sfp_tire_invoices')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data ? invoiceFromTable(data) : null;
}

// --------------------------------------------------------------- reviews (sfp_reviews)
const reviewFromTable = (r: {
  id: string; client_name: string; rating: number; body: string | null;
  is_published: boolean; created_at: string;
}): ReviewRow => ({
  id: r.id,
  author_name: r.client_name,
  rating: r.rating,
  body: r.body,
  source: 'native',
  featured: r.is_published,
  created_at: r.created_at,
});

/** Published, non-flagged reviews for the public site (via anon-safe RPC). */
export async function publicReviews(): Promise<ReviewRow[]> {
  const { data, error } = await sfp.rpc('sfp_public_reviews', { p_org: orgCode() });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    id: r.id, author_name: r.author_name, rating: r.rating, body: r.body,
    source: 'native' as const, featured: true, created_at: r.created_at,
  }));
}

/** All reviews for the org (staff). */
export async function listReviews(): Promise<ReviewRow[]> {
  const { data, error } = await sfp
    .from('sfp_reviews')
    .select('*')
    .eq('organization_code', orgCode())
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(reviewFromTable);
}

/** Publish/unpublish a review (the app's "featured" toggle maps to is_published). */
export async function setReviewPublished(id: string, published: boolean): Promise<void> {
  const { error } = await sfp.from('sfp_reviews').update({ is_published: published }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function createReview(input: {
  author_name: string; rating: number; body: string;
}): Promise<void> {
  const { error } = await sfp.rpc('sfp_public_create_review', {
    p_org: orgCode(), p_name: input.author_name, p_rating: input.rating, p_body: input.body,
  });
  if (error) throw new Error(error.message);
}

// --------------------------------------------------------------- promotions
function promoFromTable(r: SfpTirePromotionRow): PromotionRow {
  return {
    id: r.id,
    slug: r.slug,
    title_en: r.title_en,
    title_es: r.title_es,
    body_en: r.body_en,
    body_es: r.body_es,
    image_url: r.image_url,
    status: r.status,
    is_event: r.is_event,
    event_start: r.event_start,
    event_end: r.event_end,
    requires_registration: r.requires_registration,
    price_cents: r.price_cents,
    capacity: r.capacity,
    published_at: r.published_at,
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}
const promoFromPublic = (r: PromotionRow | (Omit<PromotionRow, 'updated_at'> & { updated_at?: string })): PromotionRow =>
  ({ ...r, updated_at: (r as PromotionRow).updated_at ?? r.created_at });

export async function publicPromotions(): Promise<PromotionRow[]> {
  const { data, error } = await sfp.rpc('sfp_public_tire_promotions', { p_org: orgCode() });
  if (error) throw new Error(error.message);
  return (data ?? []).map((p) => promoFromPublic(p as PromotionRow));
}

export async function publicPromotion(slug: string): Promise<PromotionRow | null> {
  const { data, error } = await sfp.rpc('sfp_public_tire_promotion', { p_org: orgCode(), p_slug: slug });
  if (error) throw new Error(error.message);
  return data ? promoFromPublic(data as PromotionRow) : null;
}

export async function listPromotions(): Promise<PromotionRow[]> {
  const { data, error } = await sfp
    .from('sfp_tire_promotions')
    .select('*')
    .eq('organization_code', orgCode())
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(promoFromTable);
}

export async function upsertPromotion(input: PromotionInsert): Promise<PromotionRow> {
  const payload: SfpTirePromotionInsert = { ...input, organization_code: orgCode() };
  const { data, error } = await sfp
    .from('sfp_tire_promotions')
    .upsert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return promoFromTable(data);
}

export async function setPromotionStatus(
  id: string,
  status: PromotionRow['status'],
  publishedAt: string | null,
): Promise<void> {
  const { error } = await sfp
    .from('sfp_tire_promotions')
    .update({ status, published_at: publishedAt })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function countPromoRegistrations(promoId: string): Promise<number> {
  const { count, error } = await sfp
    .from('sfp_tire_promo_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('promo_id', promoId);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function createPromoRegistration(
  input: PromoRegistrationInsert,
): Promise<PromoRegistrationRow> {
  const { data: id, error } = await sfp.rpc('sfp_public_create_promo_registration', {
    p_org: orgCode(),
    p_promo_id: input.promo_id,
    p_name: input.guest_name ?? '',
    p_email: input.guest_email ?? '',
    p_phone: input.guest_phone ?? null,
    p_quantity: input.quantity ?? 1,
    p_locale: input.locale ?? 'en',
  });
  if (error) throw new Error(error.message);
  return {
    id: id as string,
    promo_id: input.promo_id,
    profile_id: input.profile_id ?? null,
    guest_name: input.guest_name ?? null,
    guest_email: input.guest_email ?? null,
    guest_phone: input.guest_phone ?? null,
    quantity: input.quantity ?? 1,
    payment_status: input.payment_status ?? 'none',
    stripe_payment_intent_id: input.stripe_payment_intent_id ?? null,
    locale: input.locale ?? 'en',
    created_at: '',
  };
}

export async function listMyRegistrations(): Promise<PromoRegistrationRow[]> {
  const { data, error } = await sfp
    .from('sfp_tire_promo_registrations')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    id: r.id,
    promo_id: r.promo_id,
    profile_id: r.client_auth_id,
    guest_name: r.guest_name,
    guest_email: r.guest_email,
    guest_phone: r.guest_phone,
    quantity: r.quantity,
    payment_status: r.payment_status,
    stripe_payment_intent_id: r.stripe_payment_intent_id,
    locale: r.locale,
    created_at: r.created_at,
  }));
}

// --------------------------------------------------------------- site content (CMS)
/** Whole-tenant key → value map for the public site (anon-safe). */
export async function publicContent(): Promise<Record<string, string | null>> {
  const { data, error } = await sfp.rpc('sfp_public_tire_content', { p_org: orgCode() });
  if (error) throw new Error(error.message);
  return data ?? {};
}

export async function listContentBlocks(): Promise<SfpTireContentBlockRow[]> {
  const { data, error } = await sfp
    .from('sfp_tire_content_blocks')
    .select('*')
    .eq('organization_code', orgCode())
    .order('group_name')
    .order('sort_order');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function upsertContentBlock(
  input: Omit<SfpTireContentBlockInsert, 'organization_code'>,
): Promise<SfpTireContentBlockRow> {
  const { data, error } = await sfp
    .from('sfp_tire_content_blocks')
    .upsert({ ...input, organization_code: orgCode() }, { onConflict: 'organization_code,key' })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// --------------------------------------------------------------- Stripe Connect (admin self-serve)
export interface ConnectStatus {
  connected: boolean;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  has_account?: boolean;
  account_id?: string | null;
}

/** Surface the edge function's real error body (supabase-js hides it behind a generic message). */
async function fnError(error: unknown): Promise<string> {
  const ctx = (error as { context?: Response })?.context;
  if (ctx && typeof ctx.json === 'function') {
    try {
      const b = (await ctx.json()) as { error?: unknown };
      if (b?.error) return typeof b.error === 'string' ? b.error : JSON.stringify(b.error);
    } catch {
      /* fall through to generic */
    }
  }
  return error instanceof Error ? error.message : 'request failed';
}

/** Current Connect status for the signed-in admin's tenant (no Stripe write). */
export async function connectStatus(): Promise<ConnectStatus> {
  const { data, error } = await sfp.functions.invoke('stripe-connect', { body: { action: 'status' } });
  if (error) throw new Error(await fnError(error));
  return data as ConnectStatus;
}

/** Re-sync status from Stripe (call when returning from the onboarding flow). */
export async function connectRefresh(): Promise<ConnectStatus> {
  const { data, error } = await sfp.functions.invoke('stripe-connect', { body: { action: 'refresh' } });
  if (error) throw new Error(await fnError(error));
  return data as ConnectStatus;
}

/** Begin/resume Stripe onboarding; returns a hosted URL to redirect the admin to. */
export async function startConnectOnboarding(returnUrl: string): Promise<string> {
  const { data, error } = await sfp.functions.invoke('stripe-connect', {
    body: { action: 'start', return_url: returnUrl },
  });
  if (error) throw new Error(await fnError(error));
  return (data as { url: string }).url;
}

/** Upload an image to this tenant's folder in sfp-images and return its public URL. */
export async function uploadImage(category: string, file: File): Promise<string> {
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${orgCode()}/${category}/${Date.now()}-${safe}`;
  const { error } = await sfp.storage.from('sfp-images').upload(path, file, { upsert: true });
  if (error) throw new Error(error.message);
  return sfp.storage.from('sfp-images').getPublicUrl(path).data.publicUrl;
}

// --------------------------------------------------------------- leads (SFA Insurance)
// LIVE PATH — backed by sfp_ins_leads (org-scoped, RLS) and the anon-safe
// sfp_public_create_ins_lead RPC on the shared SFP backend. Reached only when MOCK_MODE
// is false (real Supabase creds); otherwise the demo runs on the mock store.

/** SFP sfp_ins_leads row → internal LeadRow (organization_code ↔ tenant_id). */
function leadFromTable(r: SfpInsLeadRow): LeadRow {
  return {
    id: r.id,
    tenant_id: r.organization_code,
    profile_id: null,
    name: r.name,
    email: r.email,
    phone: r.phone,
    zip: r.zip,
    product_line: r.product_line as LeadRow['product_line'],
    message: r.message,
    best_time: (r.best_time ?? 'anytime') as LeadRow['best_time'],
    consent_contact: r.consent_contact,
    source: r.source,
    status: r.status as LeadRow['status'],
    locale: (r.locale ?? 'en') as LeadRow['locale'],
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}

/** Public lead capture through the anon-safe RPC; returns the materialized row. */
export async function createLead(input: LeadInsert): Promise<LeadRow> {
  const { data: id, error } = await sfp.rpc('sfp_public_create_ins_lead', {
    p_org: orgCode(),
    p_name: input.name,
    p_email: input.email ?? '',
    p_phone: input.phone ?? null,
    p_zip: input.zip ?? null,
    p_product_line: input.product_line ?? 'medicare',
    p_best_time: input.best_time ?? null,
    p_message: input.message ?? null,
    p_consent_contact: input.consent_contact ?? false,
    p_locale: input.locale ?? 'en',
  });
  if (error) throw new Error(error.message);
  return {
    id: id as string,
    tenant_id: orgCode(),
    profile_id: null,
    name: input.name,
    email: input.email ?? null,
    phone: input.phone ?? null,
    zip: input.zip ?? null,
    product_line: input.product_line,
    message: input.message ?? null,
    best_time: input.best_time ?? 'anytime',
    consent_contact: input.consent_contact ?? false,
    source: input.source ?? 'website',
    status: input.status ?? 'new',
    locale: input.locale ?? 'en',
    created_at: '',
    updated_at: '',
  };
}

/** All leads for the org (staff; RLS-scoped to the signed-in admin's tenant). */
export async function listLeads(): Promise<LeadRow[]> {
  const { data, error } = await sfp
    .from('sfp_ins_leads')
    .select('*')
    .eq('organization_code', orgCode())
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(leadFromTable);
}

/** Staff edit (e.g. pipeline status). tenant_id is not writable through this path. */
export async function updateLead(id: string, patch: Partial<LeadInsert>): Promise<void> {
  const row: Partial<SfpInsLeadInsert> = {};
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.email != null) row.email = patch.email;
  if (patch.phone !== undefined) row.phone = patch.phone;
  if (patch.zip !== undefined) row.zip = patch.zip;
  if (patch.product_line !== undefined) row.product_line = patch.product_line;
  if (patch.best_time !== undefined) row.best_time = patch.best_time;
  if (patch.message !== undefined) row.message = patch.message;
  if (patch.consent_contact !== undefined) row.consent_contact = patch.consent_contact;
  const { error } = await sfp
    .from('sfp_ins_leads')
    .update(row)
    .eq('id', id)
    .eq('organization_code', orgCode());
  if (error) throw new Error(error.message);
}
