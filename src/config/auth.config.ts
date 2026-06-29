/**
 * auth.config.ts — social sign-in (OAuth) configuration for this site.
 *
 * SFP MODEL: every ServiceFlowPro site shares ONE Supabase project, so OAuth providers
 * are enabled once at the project level (Auth → Providers) and become available to every
 * tenant automatically. This file does NOT enable a provider — it only controls which
 * buttons THIS site surfaces. Add a provider id below ONLY after it is:
 *   1. enabled in the shared Supabase project, and
 *   2. this site's domain is in the Supabase Auth "Redirect URLs" allowlist.
 * Until then, leave it out so the live site never shows a button that errors.
 */

/** Supabase provider ids. Microsoft is the `azure` provider. */
export type OAuthProvider = 'google' | 'azure' | 'apple';

/**
 * Providers shown on this site's Login/Signup. EMPTY = no social buttons (password only).
 * Flip a provider on by adding it here once it's live in Supabase (see notes above).
 *   e.g. ['google', 'azure', 'apple']
 */
export const ENABLED_OAUTH_PROVIDERS: OAuthProvider[] = [];

/** i18n label key per provider (button text). `as const` keeps the literal key types
 * so t() accepts them without a cast. */
export const OAUTH_PROVIDER_LABEL = {
  google: 'auth.continueGoogle',
  azure: 'auth.continueMicrosoft',
  apple: 'auth.continueApple',
} as const satisfies Record<OAuthProvider, string>;
