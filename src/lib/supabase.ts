/**
 * supabase.ts — browser Supabase client (anon key only; never the service_role key).
 *
 * With placeholder credentials the client is constructed but never exercised — the data
 * layer (src/lib/data.ts) checks MOCK_MODE and serves seed data instead of calling out.
 * Once real env values are set, MOCK_MODE flips off and these calls hit the real project.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { env, MOCK_MODE } from '@/config/env';

// Fall back to syntactically-valid placeholders so createClient never throws at import time.
const url = env.supabaseUrl || 'https://placeholder.supabase.co';
const anonKey = env.supabaseAnonKey || 'placeholder-anon-key';

// On the shared ServiceFlowPro backend, tenancy is NOT carried in a client header — RLS
// derives the org from sfp_user_org_code() (the signed-in staff member's row / JWT claim),
// and public reads go through SECURITY DEFINER RPCs that take the org as an argument
// (see src/lib/sfp.ts). So no x-tenant-id header here.
export const supabase: SupabaseClient<Database> = createClient<Database>(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/** Re-export for callers that branch on whether the real backend is wired. */
export { MOCK_MODE };
