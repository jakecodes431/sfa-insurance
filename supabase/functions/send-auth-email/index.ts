// send-auth-email — transactional auth mail via Resend (confirm / reset / magic link).
// Stubbed in mock mode; wired at go-live.
import { corsHeaders } from '../_shared/cors.ts';
export default async function handler(_req: Request): Promise<Response> {
  return new Response(JSON.stringify({ sent: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
