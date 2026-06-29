/** format.ts — locale-aware formatting helpers. Money is always integer cents. */
import { pricingConfig } from '@/config/pricing.config';
import type { AppLocale } from '@/i18n';

export function formatMoney(cents: number, locale: AppLocale = 'en'): string {
  return new Intl.NumberFormat(locale === 'es' ? 'es-US' : 'en-US', {
    style: 'currency',
    currency: pricingConfig.currency.toUpperCase(),
  }).format(cents / 100);
}

/** Convert a 24h "HH:MM" string to a localized 12h label, e.g. "9:00 AM". */
export function formatTime(hhmm: string, locale: AppLocale = 'en'): string {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(2000, 0, 1, h, m);
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-US' : 'en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(d);
}

export function formatDateTime(iso: string, locale: AppLocale = 'en'): string {
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-US' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}
