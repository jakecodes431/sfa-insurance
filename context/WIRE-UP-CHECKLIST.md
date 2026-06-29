# WIRE-UP CHECKLIST — [Client]

Every mock placeholder and its real replacement. The demo runs without these; launch needs them.

## Env (set as VITE_*, baked by Coolify at build)
- [ ] `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`  → flips MOCK_MODE off
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY`
- [ ] `VITE_TENANT_SLUG` (stable tenant identity)
- [ ] `VITE_CAL_LINK` (Cal.com event-type)
- [ ] `VITE_SITE_URL` (production domain — canonical + OG + sitemap)

## Supabase
- [ ] Apply migrations to the shared project; create this tenant's org row + admin staff row.
- [ ] Confirm `sfp_user_org_code()` resolves for the admin.
- [ ] Run `get_advisors`; resolve every RLS finding.
- [ ] Point `send-auth-email` at Resend; verify templates.

## Stripe (Connect Express)
- [ ] Connect the client's account (`acct_…`); set the application fee %.
- [ ] Secret key + webhook signing secret in Edge Function env ONLY (never client).
- [ ] Register the live webhook; test a real charge end-to-end (intent → card → webhook → row).

## Cal.com
- [ ] Real account + event-type link per bookable service; availability = real hours.

## SEO / go-live
- [ ] Real OG share image (1200×630) in `public/`.
- [ ] Production `robots.txt` (remove preview Disallow); submit sitemap in Search Console.
- [ ] Validate JSON-LD; confirm no admin/mock routes in the sitemap.

## Promote
- [ ] Move `Demos/[Client]/[slug]/` → `Clients/[Client]/`; update `_system/CLIENTS.md` (Live + domain).
