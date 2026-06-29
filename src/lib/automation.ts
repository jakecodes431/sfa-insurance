/**
 * automation.ts — the ONLY way the app talks to n8n. Every automated email/SMS is
 * triggered by POSTing an event here; the app never holds SMTP/SMS creds.
 *
 * PLACEHOLDER MODE: when VITE_N8N_WEBHOOK_BASE is unset (the default for this build),
 * postEvent() logs the payload to the console and no-ops gracefully — it makes NO
 * network calls. Once the base URL is set, it POSTs to `{base}/{event}` with retry +
 * backoff and never blocks or throws into the user flow (failures are swallowed/logged).
 *
 * The exact payload contract for each event is documented in context/automation-contracts.md.
 */
import { env, runtimeFlags } from '@/config/env';
import type { AppLocale } from '@/i18n';

export type AutomationEvent =
  | 'booking.created'
  | 'dispatch.requested'
  | 'booking.reminder'
  | 'payment.succeeded'
  | 'promo.published'
  | 'promo.registration'
  | 'review.request'
  | 'followup.send'
  | 'contact.received'
  | 'lead.received'
  | 'invoice.sent';

/** Every payload carries `locale` so n8n picks the EN or ES template. */
export interface BaseEventPayload {
  locale: AppLocale;
  [key: string]: unknown;
}

const MAX_RETRIES = 3;

function backoff(attempt: number): Promise<void> {
  // 250ms, 500ms, 1000ms …
  return new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt));
}

/**
 * Fire an automation event. Resolves to true if delivered (or cleanly no-op'd in
 * placeholder mode), false if all retries failed. NEVER throws — automation must not
 * break the user-facing flow.
 */
export async function postEvent(
  event: AutomationEvent,
  payload: BaseEventPayload,
): Promise<boolean> {
  const body = { event, ...payload, sent_at: new Date().toISOString() };

  // Placeholder / unconfigured: log and no-op. No network call is made.
  if (!runtimeFlags.n8nConfigured) {
    console.info(`[automation:STUB] ${event} (n8n not configured — no POST made)`, body);
    return true;
  }

  const url = `${env.n8nWebhookBase.replace(/\/$/, '')}/${event}`;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) return true;
    } catch {
      /* network error — retry */
    }
    if (attempt < MAX_RETRIES - 1) await backoff(attempt);
  }
  console.error(`[automation] ${event} failed after ${MAX_RETRIES} attempts`, body);
  return false;
}
