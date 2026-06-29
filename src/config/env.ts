/**
 * env.ts — typed access to client (VITE_) environment variables.
 * Never reference import.meta.env directly in app code — go through this module.
 * Server-side secrets (service role, Stripe secret) are NEVER read here.
 */

export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
  stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? '',
  calcomLink: import.meta.env.VITE_CALCOM_LINK ?? '',
  n8nWebhookBase: import.meta.env.VITE_N8N_WEBHOOK_BASE ?? '',
  defaultLocale: (import.meta.env.VITE_DEFAULT_LOCALE ?? 'en') as 'en' | 'es',
  hcaptchaSiteKey: import.meta.env.VITE_HCAPTCHA_SITE_KEY ?? '',
  // Which tenant this build serves (multi-tenant SFP backend). Falls back to domain
  // resolution, then the default tenant. See src/config/tenants.ts.
  tenantSlug: import.meta.env.VITE_TENANT_SLUG ?? '',
} as const;

/**
 * Placeholder detection. When credentials are missing or clearly placeholder values,
 * the app runs in "mock mode" — the data layer serves seed data and no live external
 * calls are made. This is the default state for this build (no live connections).
 */
const isPlaceholder = (v: string): boolean =>
  v === '' || v.includes('PLACEHOLDER') || v.startsWith('https://PLACEHOLDER');

export const runtimeFlags = {
  supabaseConfigured: !isPlaceholder(env.supabaseUrl) && !isPlaceholder(env.supabaseAnonKey),
  stripeConfigured: !isPlaceholder(env.stripePublishableKey),
  calcomConfigured: !isPlaceholder(env.calcomLink),
  n8nConfigured: !isPlaceholder(env.n8nWebhookBase),
} as const;

/** True when the app should serve mock/seed data instead of hitting Supabase. */
export const MOCK_MODE = !runtimeFlags.supabaseConfigured;
