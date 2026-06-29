/**
 * pricing.config.ts — deposit defaults, trip fees, Stripe price IDs.
 * All money in integer cents. Values marked TODO-confirm await owner/Jake sign-off.
 * Server-side payment logic validates against these (never trusts a client amount).
 */

export const pricingConfig = {
  currency: 'usd',

  /** Default on-site/dispatch deposit when a service doesn't override depositCents. */
  defaultMobileDepositCents: 2500, // $25.00 — TODO-confirm with owner

  /** Flat trip/dispatch fee for on-site service. */
  mobileTripFeeCents: 0, // TODO-confirm: owner to set dispatch area + trip fee

  /**
   * Stripe application fee taken by the ForgeIT platform on the connected account,
   * in basis points (100 = 1%). TODO-confirm exact % with Jake. Sourced from env at runtime
   * server-side; this constant documents the default/fallback.
   */
  applicationFeeBps: 0, // TODO-confirm: Jake to set platform fee %

  /** Card processing reference (Stripe standard) — informational, not charged here. */
  cardFee: {
    percent: 2.9,
    fixedCents: 30,
  },

  /**
   * Stripe Price ID placeholders for fixed-price products (e.g. event packages).
   * Real IDs come from the client's connected account. TODO-confirm.
   */
  stripePriceIds: {
    seasonalPackage: 'price_PLACEHOLDER_seasonal',
  },
} as const;

export type PricingConfig = typeof pricingConfig;
