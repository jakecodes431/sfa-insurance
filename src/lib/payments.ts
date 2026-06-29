/**
 * payments.ts — client-side payment helpers.
 *
 * Real mode: createPaymentIntent() invokes the `create-payment-intent` Edge Function
 * (which derives the amount server-side and returns a client_secret). The Stripe webhook
 * reconciles the DB on success.
 *
 * Placeholder mode (no Stripe configured): we NEVER call Stripe. createPaymentIntent()
 * returns a simulated client_secret, and finalizeSimulatedPayment() does client-side what
 * the webhook would do server-side (mark paid, record an order, fire payment.succeeded) so
 * the flow completes end-to-end on a simulated path.
 */
import { supabase } from './supabase';
import { runtimeFlags } from '@/config/env';
import { createPaymentIntentSchema, type CreatePaymentIntentInput } from '@/schemas';
import { markBookingPaid, recordMockOrder } from './data';
import { postEvent } from './automation';
import type { AppLocale } from '@/i18n';

export interface PaymentIntentResult {
  clientSecret: string;
  amountCents: number;
  simulated: boolean;
}

export async function createPaymentIntent(
  input: CreatePaymentIntentInput,
): Promise<PaymentIntentResult> {
  const parsed = createPaymentIntentSchema.parse(input);

  if (!runtimeFlags.stripeConfigured) {
    // Simulated intent — no network call to Stripe.
    return {
      clientSecret: `pi_sim_${Math.abs(hash(JSON.stringify(parsed)))}_secret_sim`,
      amountCents: parsed.amount_cents,
      simulated: true,
    };
  }

  const { data, error } = await supabase.functions.invoke('create-payment-intent', {
    body: parsed,
  });
  if (error || !data?.client_secret) {
    throw new Error(error?.message ?? 'Failed to create payment intent');
  }
  return {
    clientSecret: data.client_secret as string,
    amountCents: (data.amount_cents as number) ?? parsed.amount_cents,
    simulated: false,
  };
}

/**
 * Placeholder-mode finalize. Mirrors the Stripe webhook: flips status, records an order,
 * fires payment.succeeded. Idempotent per payment-intent id (uses a deterministic id).
 */
export async function finalizeSimulatedPayment(args: {
  clientSecret: string;
  amountCents: number;
  locale: AppLocale;
  bookingId?: string;
  promoRegistrationId?: string;
  kind: 'deposit' | 'event';
}): Promise<{ paymentIntentId: string; receiptUrl: string }> {
  const paymentIntentId = args.clientSecret.split('_secret_')[0];
  const receiptUrl = `https://pay.stripe.com/receipts/sim/${paymentIntentId}`;

  if (args.bookingId) {
    await markBookingPaid(args.bookingId, paymentIntentId, 'deposit_paid');
  }
  recordMockOrder({
    booking_id: args.bookingId ?? null,
    amount_cents: args.amountCents,
    status: args.kind === 'deposit' ? 'deposit_paid' : 'paid',
    stripe_payment_intent_id: paymentIntentId,
    receipt_url: receiptUrl,
  });

  await postEvent('payment.succeeded', {
    locale: args.locale,
    booking_id: args.bookingId ?? null,
    promo_registration_id: args.promoRegistrationId ?? null,
    amount_cents: args.amountCents,
    receipt_url: receiptUrl,
  });

  return { paymentIntentId, receiptUrl };
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h;
}
