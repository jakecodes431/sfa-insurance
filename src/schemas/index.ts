/**
 * Zod schemas — validate every form / data-layer boundary before insert.
 * No `any`; types are inferred from the schemas and used throughout.
 * Error messages are i18n KEYS (resolved in the UI via t()), not literal English.
 */
import { z } from 'zod';

export const localeSchema = z.enum(['en', 'es']);

// Loosely validate US phone input (allow common formatting); store as entered.
const phoneRegex = /^[+()\-.\s\d]{7,20}$/;

export const contactSchema = z.object({
  name: z.string().min(1, 'validation.nameRequired'),
  email: z.string().min(1, 'validation.emailRequired').email('validation.emailInvalid'),
  phone: z
    .string()
    .regex(phoneRegex, 'validation.phoneInvalid')
    .optional()
    .or(z.literal('')),
  message: z.string().min(1, 'validation.messageRequired'),
  locale: localeSchema,
});
export type ContactInput = z.infer<typeof contactSchema>;

/** SFA Insurance lead-capture form (consumer-initiated, compliant inbound). */
export const productLineSchema = z.enum([
  'medicare',
  'dental-vision',
  'life-final-expense',
  'under-65-health',
  'general',
]);

export const callWindowSchema = z.enum(['anytime', 'morning', 'afternoon', 'evening']);

export const leadSchema = z.object({
  name: z.string().min(1, 'validation.nameRequired'),
  phone: z.string().regex(phoneRegex, 'validation.phoneInvalid'),
  email: z.string().email('validation.emailInvalid').optional().or(z.literal('')),
  zip: z
    .string()
    .regex(/^\d{5}$/, 'validation.zipInvalid')
    .optional()
    .or(z.literal('')),
  product_line: productLineSchema,
  best_time: callWindowSchema,
  message: z.string().optional().or(z.literal('')),
  // Permission-to-contact: must be true (TPMO/CMS consent before SFA may reach out).
  consent_contact: z.literal(true, {
    errorMap: () => ({ message: 'validation.consentRequired' }),
  }),
  locale: localeSchema,
});
export type LeadInput = z.infer<typeof leadSchema>;

export const vehicleInfoSchema = z.object({
  make: z.string().optional().or(z.literal('')),
  model: z.string().optional().or(z.literal('')),
  year: z
    .union([z.coerce.number().int().min(1900).max(2100), z.literal('')])
    .optional(),
  tireSize: z.string().optional().or(z.literal('')),
});
export type VehicleInfoInput = z.infer<typeof vehicleInfoSchema>;

/** In-shop booking captured after a Cal.com booking succeeds. */
export const inShopBookingSchema = z.object({
  service_slug: z.string().min(1, 'validation.serviceRequired'),
  guest_name: z.string().min(1, 'validation.nameRequired'),
  guest_email: z.string().email('validation.emailInvalid'),
  guest_phone: z.string().regex(phoneRegex, 'validation.phoneInvalid').optional().or(z.literal('')),
  scheduled_at: z.string().datetime().nullable().optional(),
  calcom_booking_id: z.string().nullable().optional(),
  locale: localeSchema,
});
export type InShopBookingInput = z.infer<typeof inShopBookingSchema>;

/** Mobile / roadside dispatch request. Built up across the multi-step form. */
export const dispatchSchema = z.object({
  service_slug: z.string().min(1, 'validation.issueRequired'),
  issue_description: z.string().optional().or(z.literal('')),
  vehicle: vehicleInfoSchema,
  location_address: z.string().min(1, 'validation.locationRequired'),
  location_lat: z.number().nullable().optional(),
  location_lng: z.number().nullable().optional(),
  guest_name: z.string().min(1, 'validation.nameRequired'),
  guest_email: z.string().email('validation.emailInvalid'),
  guest_phone: z.string().regex(phoneRegex, 'validation.phoneInvalid'),
  locale: localeSchema,
});
export type DispatchInput = z.infer<typeof dispatchSchema>;

/** Event / promo registration. */
export const promoRegistrationSchema = z.object({
  promo_id: z.string().min(1),
  guest_name: z.string().min(1, 'validation.nameRequired'),
  guest_email: z.string().email('validation.emailInvalid'),
  guest_phone: z.string().regex(phoneRegex, 'validation.phoneInvalid').optional().or(z.literal('')),
  quantity: z.coerce.number().int().min(1, 'validation.quantityMin'),
  locale: localeSchema,
});
export type PromoRegistrationInput = z.infer<typeof promoRegistrationSchema>;

/** Admin promotion create/edit. */
export const promotionSchema = z.object({
  slug: z.string().min(1),
  title_en: z.string().min(1),
  title_es: z.string().min(1),
  body_en: z.string().optional().or(z.literal('')),
  body_es: z.string().optional().or(z.literal('')),
  is_event: z.boolean(),
  requires_registration: z.boolean(),
  price_cents: z.coerce.number().int().min(0).nullable(),
  capacity: z.coerce.number().int().min(1).nullable(),
  event_start: z.string().nullable().optional(),
  event_end: z.string().nullable().optional(),
});
export type PromotionFormInput = z.infer<typeof promotionSchema>;

/** Edge Function input: create a payment intent. Validated server-side too. */
export const createPaymentIntentSchema = z.object({
  booking_id: z.string().uuid().optional(),
  promo_registration_id: z.string().uuid().optional(),
  amount_cents: z.number().int().positive(),
  locale: localeSchema,
});
export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>;
