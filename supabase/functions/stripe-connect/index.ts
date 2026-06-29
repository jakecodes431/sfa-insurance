// stripe-connect — SHARED self-serve Stripe Connect onboarding for the admin portal.
//
// A signed-in staff member connects THEIR tenant's payout account from inside the admin.
// The org is derived from the caller's staff row (sfp_user_org_code) — never trusted from the
// client — so an admin can only ever touch their own tenant. Express accounts + Account Links
// (Stripe-hosted onboarding); status is synced back into sfp_tenants.connect_* on return.
//
// Actions (POST body): { action: 'status' | 'start' | 'refresh', return_url? }
//   status  → current flags from sfp_tenants (no Stripe write)
//   start   → ensure Express account exists, return a hosted onboarding URL
//   refresh → re-fetch the account from Stripe and update the flags (call on return)
//
// Secrets: STRIPE_SECRET_KEY. SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY auto-injected.
// Deploy: supabase functions deploy stripe-connect

import Stripe from 'https://esm.sh/stripe@16.12.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});
const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

interface Body {
  action?: 'status' | 'start' | 'refresh';
  return_url?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    // Derive the caller's org from THEIR staff row (authoritative — not from the client).
    const authHeader = req.headers.get('Authorization') ?? '';
    const asUser = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: org } = await asUser.rpc('sfp_user_org_code');
    if (!org) return json({ error: 'Not authorized for any organization' }, 403);

    const { action = 'status', return_url }: Body = await req.json().catch(() => ({}));

    const { data: tenant } = await admin
      .from('sfp_tenants')
      .select('organization_code, display_name, stripe_connect_account_id')
      .eq('organization_code', org)
      .single();
    if (!tenant) return json({ error: 'Tenant not found' }, 404);

    let accountId = tenant.stripe_connect_account_id as string | null;

    // ----- start: ensure an Express account exists, return an onboarding link -----
    if (action === 'start') {
      if (!accountId) {
        const account = await stripe.accounts.create({
          type: 'express',
          metadata: { organization_code: org },
          capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
        });
        accountId = account.id;
        await admin
          .from('sfp_tenants')
          .update({ stripe_connect_account_id: accountId, connect_onboarding_started_at: new Date().toISOString() })
          .eq('organization_code', org);
      }
      const base = (return_url ?? '').replace(/[?#].*$/, '') || 'https://example.com/admin';
      const link = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${base}?tab=payments&connect=refresh`,
        return_url: `${base}?tab=payments&connect=done`,
        type: 'account_onboarding',
      });
      return json({ url: link.url, account_id: accountId });
    }

    // ----- refresh: pull live status from Stripe and persist the flags -----
    if (action === 'refresh' && accountId) {
      const acct = await stripe.accounts.retrieve(accountId);
      const complete = Boolean(acct.details_submitted && acct.charges_enabled);
      await admin
        .from('sfp_tenants')
        .update({
          connect_charges_enabled: Boolean(acct.charges_enabled),
          connect_payouts_enabled: Boolean(acct.payouts_enabled),
          connect_details_submitted: Boolean(acct.details_submitted),
          connect_onboarding_complete: complete,
          connect_onboarded_at: complete ? new Date().toISOString() : null,
        })
        .eq('organization_code', org);
      return json({
        connected: complete,
        charges_enabled: Boolean(acct.charges_enabled),
        payouts_enabled: Boolean(acct.payouts_enabled),
        details_submitted: Boolean(acct.details_submitted),
        account_id: accountId,
      });
    }

    // ----- status: read current flags (default) -----
    const { data: flags } = await admin
      .from('sfp_tenants')
      .select('connect_charges_enabled, connect_payouts_enabled, connect_details_submitted, connect_onboarding_complete')
      .eq('organization_code', org)
      .single();
    return json({
      connected: Boolean(flags?.connect_onboarding_complete),
      charges_enabled: Boolean(flags?.connect_charges_enabled),
      payouts_enabled: Boolean(flags?.connect_payouts_enabled),
      details_submitted: Boolean(flags?.connect_details_submitted),
      account_id: accountId,
      has_account: Boolean(accountId),
    });
  } catch (err) {
    console.error('stripe-connect error', err);
    return json({ error: err instanceof Error ? err.message : 'connect error' }, 400);
  }
});
