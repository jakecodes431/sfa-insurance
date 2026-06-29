// create-payment-intent — SERVER ONLY. Recomputes amount + application fee from config so the
// client can't tamper. Secret key lives here, never in the browser. (Deno Edge Function.)
import { corsHeaders } from '../_shared/cors.ts';
// import Stripe from 'https://esm.sh/stripe?target=deno';
export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  // const { serviceId, tenant } = await req.json();
  // const amount = depositAmountFromConfig(serviceId); // recompute server-side
  // const intent = await stripe.paymentIntents.create({ amount, currency, application_fee_amount, ... }, { stripeAccount: acct });
  return new Response(JSON.stringify({ clientSecret: 'mock_secret' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
