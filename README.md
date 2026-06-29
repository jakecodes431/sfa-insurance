# sfp-starter

The reusable **ServiceFlowPro base**. Clone this per client, fill `src/config/*` + `src/i18n/*`,
compose the pages the blueprint selected, and you have a themed, mock-mode demo with zero real
credentials. Real env values flip it live with no code change.

> This is the base referenced throughout `Dev/ServiceFlowPro/_system/`. Build process lives in
> `_system/` (blueprint → kickoff → build → wire-up → live). Reusable capability specs live in
> `Dev/ServiceFlowPro/Templates/` (auth, payments, design, SEO, scheduling).

## Stack (locked house standard)
Vite + React + TypeScript (SPA) · Tailwind with brand tokens as CSS variables · Supabase
(Postgres + Auth + RLS) · Stripe Connect Express · Cal.com · Resend + Supabase Edge Functions ·
Coolify (Docker + nginx), `VITE_*` baked at build.

## Run
```bash
npm install
npm run dev      # http://localhost:3000  (MOCK_MODE: seed data, simulated pay, mock admin)
npm run build    # tsc -b && vite build
```
No `.env` needed to run — absence of Supabase creds = MOCK_MODE. Copy `.env.example` to `.env`
and fill it to go live.

## Architecture (config-driven)
Every business value lives in `src/config/*`, never hardcoded in a component:

| File | Holds |
|------|-------|
| `business.config.ts` | name, contact, hours, address, service area |
| `services.config.ts` | tiers, specialty, add-ons (the menu) |
| `pricing.config.ts` | pricing model + amounts (cents) + deposit policy |
| `theme.config.ts` | brand tokens (mirrored as CSS vars in `index.css`) |
| `promotions / legal / admin / auth.config.ts` | promos, legal, modules/tabs, OAuth toggles |
| `env.ts` | `VITE_*` access + the `MOCK_MODE` switch |
| `tenants.ts` | this site's tenant slug |

`src/lib/data.ts` is the single data layer — everything branches on `MOCK_MODE` (seed data) vs
Supabase (RLS-scoped). Pages never import `supabase` directly.

## House rules baked in
Mock-mode first · guest-first (auth is admin-only) · mobile-first (375px) · tokens not raw hex ·
the one `Select` component (no raw `<select>`) · Zod-validated forms · secrets server-side only ·
no em dashes in UI copy.

## Re-skin in 3 steps
1. Derive brand tokens from the client logo → `src/config/theme.config.ts`.
2. Mirror them as RGB channels in `src/index.css`.
3. Fill the rest of `src/config/*` + `src/i18n/*` from the blueprint.

## Go live
Fill `context/WIRE-UP-CHECKLIST.md`. See `Templates/functionality/*` for each capability's wiring.
