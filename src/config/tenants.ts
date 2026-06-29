/**
 * tenants.ts — the per-tenant registry. ServiceFlowPro is ONE backend serving many
 * client sites; each site resolves its tenant at runtime (by VITE_TENANT_SLUG, then by
 * domain) and drives brand/locale/integration config from it.
 *
 * The starter base ships ONE generic placeholder tenant. Adding a future client = one
 * entry here + a `tenants` row in the DB (matching the seeded id). Nothing else.
 */
import { businessConfig } from './business.config';
import { themeConfig } from './theme.config';
import { env } from './env';
import { SFA_ADMIN_MODULES, type AdminModule } from './admin.config';
import type { AppLocale } from '@/i18n';

/** Matches the seeded placeholder tenant id in supabase/migrations/009_tenants.sql. */
export const DEFAULT_TENANT_ID = 'a0000000-0000-4000-8000-000000000001';

export interface TenantBrand {
  red: string;
  redDark: string;
  black: string;
  charcoal: string;
  steel: string;
  chrome: string;
  white: string;
  logoPrimary: string;
  logoBadge: string;
}

export interface TenantConfig {
  id: string;
  slug: string;
  name: string;
  domain: string;
  localeDefault: AppLocale;
  calcomLink: string;
  n8nWebhookBase: string;
  /** Stripe Connect account id for this tenant (server-side charges route here). */
  stripeConnectAccountId: string | null;
  /** Which admin dashboard modules (tabs) this tenant runs — vertical-specific. */
  enabledAdminModules: AdminModule[];
  brand: TenantBrand;
}

export const TENANTS: Record<string, TenantConfig> = {
  sfainsure: {
    id: DEFAULT_TENANT_ID,
    slug: 'sfainsure',
    name: businessConfig.legalName,
    domain: 'sfainsure.com',
    localeDefault: env.defaultLocale,
    calcomLink: env.calcomLink,
    n8nWebhookBase: env.n8nWebhookBase,
    stripeConnectAccountId: null, // SFA takes no consumer payments — carriers process enrollments
    // Lean insurance kit: captured leads + appointment queue + reviews. No payments/orders.
    enabledAdminModules: SFA_ADMIN_MODULES,
    brand: {
      ...themeConfig.colors,
      logoPrimary: businessConfig.logos.primaryBanner,
      logoBadge: businessConfig.logos.badgeSquare,
    },
  },
};

export const DEFAULT_TENANT_SLUG = 'sfainsure';

/** Resolve the active tenant slug: build-time override → domain match → default. */
export function resolveTenantSlug(): string {
  const envSlug = import.meta.env.VITE_TENANT_SLUG as string | undefined;
  if (envSlug && TENANTS[envSlug]) return envSlug;

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const match = Object.values(TENANTS).find(
      (t) => host === t.domain || host.endsWith(`.${t.domain}`),
    );
    if (match) return match.slug;
  }
  return DEFAULT_TENANT_SLUG;
}

export function getActiveTenant(): TenantConfig {
  return TENANTS[resolveTenantSlug()] ?? TENANTS[DEFAULT_TENANT_SLUG];
}
