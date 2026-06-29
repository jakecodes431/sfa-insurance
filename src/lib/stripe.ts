/**
 * stripe.ts — lazy Stripe.js loader (publishable key only; never the secret key).
 * Only loads the real Stripe.js when a real publishable key is configured; in placeholder
 * mode it returns null and the PaymentStep falls back to a simulated path (no Stripe call).
 */
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { env, runtimeFlags } from '@/config/env';

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!runtimeFlags.stripeConfigured) return Promise.resolve(null);
  if (!stripePromise) stripePromise = loadStripe(env.stripePublishableKey);
  return stripePromise;
}
