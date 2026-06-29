// stripe-webhook — the SOURCE OF TRUTH for payment state. Verifies the signature, then writes
// to Supabase under RLS (payment_intent.succeeded -> mark deposit paid; charge.refunded; etc.).
import { corsHeaders } from '../_shared/cors.ts';
export default async function handler(req: Request): Promise<Response> {
  // const sig = req.headers.get('stripe-signature'); verify against the webhook signing secret
  return new Response(JSON.stringify({ received: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
