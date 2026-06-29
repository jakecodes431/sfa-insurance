-- 007_rls.sql — Row Level Security on EVERY table.
-- Conventions (context/03 + context/02 §9):
--   * customers see only their own rows; staff/admin per-table elevated access
--   * guest flows: anon may INSERT bookings & promo_registrations, but never read others'
--   * public read only for active services / published promotions / reviews
-- Run get_advisors after applying; there should be zero "RLS disabled" findings.

-- Enable RLS everywhere.
alter table public.profiles            enable row level security;
alter table public.vehicles            enable row level security;
alter table public.services            enable row level security;
alter table public.reviews             enable row level security;
alter table public.bookings            enable row level security;
alter table public.orders              enable row level security;
alter table public.promotions          enable row level security;
alter table public.promo_registrations enable row level security;
alter table public.automation_log      enable row level security;

-- ----------------------------------------------------------------- profiles
create policy "profiles: read own" on public.profiles
  for select to authenticated
  using (id = auth.uid());

create policy "profiles: read all (admin)" on public.profiles
  for select to authenticated
  using (public.is_admin());

create policy "profiles: update own" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles: admin update all" on public.profiles
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------------------------------------------------- vehicles
create policy "vehicles: owner all" on public.vehicles
  for all to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "vehicles: admin all" on public.vehicles
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------------------------------------------------- services
create policy "services: public read active" on public.services
  for select to anon, authenticated
  using (active = true);

create policy "services: admin read all" on public.services
  for select to authenticated
  using (public.is_admin());

create policy "services: admin write" on public.services
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------------------------------------------------- reviews
create policy "reviews: public read" on public.reviews
  for select to anon, authenticated
  using (true);

create policy "reviews: admin write" on public.reviews
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------------------------------------------------- bookings
-- Guests (anon) AND authenticated users may create bookings.
create policy "bookings: anyone insert" on public.bookings
  for insert to anon, authenticated
  with check (true);

-- Customers read their own (by profile_id or by their authenticated email).
create policy "bookings: read own" on public.bookings
  for select to authenticated
  using (
    profile_id = auth.uid()
    or guest_email = (auth.jwt() ->> 'email')
  );

-- Staff/admin read all.
create policy "bookings: staff read all" on public.bookings
  for select to authenticated
  using (public.is_staff());

-- Staff/admin update all (advance status, assign dispatch, etc.).
create policy "bookings: staff write" on public.bookings
  for update to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- ----------------------------------------------------------------- orders
create policy "orders: read own" on public.orders
  for select to authenticated
  using (profile_id = auth.uid());

create policy "orders: admin read all" on public.orders
  for select to authenticated
  using (public.is_admin());
-- Inserts/updates to orders happen server-side via the service_role key (Edge Functions),
-- which bypasses RLS. No anon/authenticated write policy is intentional.

-- ----------------------------------------------------------------- promotions
create policy "promotions: public read published" on public.promotions
  for select to anon, authenticated
  using (status = 'published');

create policy "promotions: admin read all" on public.promotions
  for select to authenticated
  using (public.is_admin());

create policy "promotions: admin write" on public.promotions
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------- promo_registrations
create policy "promo_reg: anyone insert" on public.promo_registrations
  for insert to anon, authenticated
  with check (true);

create policy "promo_reg: read own" on public.promo_registrations
  for select to authenticated
  using (
    profile_id = auth.uid()
    or guest_email = (auth.jwt() ->> 'email')
  );

create policy "promo_reg: admin all" on public.promo_registrations
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------------------------------------------- automation_log
create policy "automation_log: admin only" on public.automation_log
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
-- Writes from the app/Edge Functions use service_role (bypasses RLS).
