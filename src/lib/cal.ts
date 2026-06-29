/**
 * cal.ts — single source of truth for building Cal.com booking links.
 * Account comes from VITE_CALCOM_LINK (currently the ForgeIT/ServiceFlowPro account
 * `jakeforgeit/serviceflowpro`; swap to ADN's own link before launch — see WIRE-UP CHECKLIST).
 */
import { env, runtimeFlags } from '@/config/env';

export const calConfigured = runtimeFlags.calcomConfigured;

/** Full public booking URL, with optional metadata forwarded as query params. */
export function getCalBookingUrl(metadata?: Record<string, string>): string {
  const base = `https://cal.com/${env.calcomLink}`;
  const params = metadata ? new URLSearchParams(metadata).toString() : '';
  return params ? `${base}?${params}` : base;
}
