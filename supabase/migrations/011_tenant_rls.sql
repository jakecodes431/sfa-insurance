-- 011_tenant_rls.sql — Rewrite EVERY policy to be tenant-scoped (Phase 8). SECURITY-CRITICAL.
-- Drops the original single-tenant policies (007) and recreates them with
-- `tenant_id = public.current_tenant()` on every clause, using the tenant-aware role
-- helpers. A tenant admin/staff/customer/anon can only ever touch their own tenant's rows.
-- After applying: run get_advisors AND the cross-tenant isolation tests
-- (supabase/tests/tenant_isolation.test.sql). A single cross-tenant read = failure.

-- ----------------------------------------------------------------- drop old (single-tenant) policies
drop policy if exists "profiles: read own"                on public.profiles;
drop policy if exists "profiles: read all (admin)"        on public.profiles;
drop policy if exists "profiles: update own"              on public.profiles;
drop policy if exists "profiles: admin update all"        on public.profiles;
drop policy if exists "vehicles: owner all"               on public.vehicles;
drop policy if exists "vehicles: admin all"               on public.vehicles;
drop policy if exists "services: public read active"      on public.services;
drop policy if exists "services: admin read all"          on public.services;
drop policy if exists "services: admin write"             on public.services;
drop policy if exists "reviews: public read"              on public.reviews;
drop policy if exists "reviews: admin write"              on public.reviews;
drop policy if exists "bookings: anyone insert"           on public.bookings;
drop policy if exists "bookings: read own"                on public.bookings;
drop policy if exists "bookings: staff read all"          on public.bookings;
drop policy if exists "bookings: staff write"             on public.bookings;
drop policy if exists "orders: read own"                  on public.orders;
drop policy if exists "orders: admin read all"            on public.orders;
drop policy if exists "promotions: public read published" on public.promotions;
drop policy if exists "promotions: admin read all"        on public.promotions;
drop policy if exists "promotions: admin write"           on public.promotions;
drop policy if exists "promo_reg: anyone insert"          on public.promo_registrations;
drop policy if exists "promo_reg: read own"               on public.promo_registrations;
drop policy if exists "promo_reg: admin all"              on public.promo_registrations;
drop policy if exists "automation_log: admin only"        on public.automation_log;

-- ----------------------------------------------------------------- profiles
create policy "profiles: read own" on public.profiles
  for select to authenticated
  using (tenant_id = public.current_tenant() and id = auth.uid());
create policy "profiles: tenant admin read" on public.profiles
  for select to authenticated
  using (tenant_id = public.current_tenant() and public.is_tenant_admin());
create policy "profiles: update own" on public.profiles
  for update to authenticated
  using (tenant_id = public.current_tenant() and id = auth.uid())
  with check (tenant_id = public.current_tenant() and id = auth.uid());
create policy "profiles: tenant admin update" on public.profiles
  for update to authenticated
  using (tenant_id = public.current_tenant() and public.is_tenant_admin())
  with check (tenant_id = public.current_tenant() and public.is_tenant_admin());

-- ----------------------------------------------------------------- vehicles
create policy "vehicles: owner all" on public.vehicles
  for all to authenticated
  using (tenant_id = public.current_tenant() and profile_id = auth.uid())
  with check (tenant_id = public.current_tenant() and profile_id = auth.uid());
create policy "vehicles: tenant admin all" on public.vehicles
  for all to authenticated
  using (tenant_id = public.current_tenant() and public.is_tenant_admin())
  with check (tenant_id = public.current_tenant() and public.is_tenant_admin());

-- ----------------------------------------------------------------- services
create policy "services: public read active" on public.services
  for select to anon, authenticated
  using (tenant_id = public.current_tenant() and active = true);
create policy "services: tenant admin read" on public.services
  for select to authenticated
  using (tenant_id = public.current_tenant() and public.is_tenant_admin());
create policy "services: tenant admin write" on public.services
  for all to authenticated
  using (tenant_id = public.current_tenant() and public.is_tenant_admin())
  with check (tenant_id = public.current_tenant() and public.is_tenant_admin());

-- ----------------------------------------------------------------- reviews
create policy "reviews: public read" on public.reviews
  for select to anon, authenticated
  using (tenant_id = public.current_tenant());
create policy "reviews: tenant admin write" on public.reviews
  for all to authenticated
  using (tenant_id = public.current_tenant() and public.is_tenant_admin())
  with check (tenant_id = public.current_tenant() and public.is_tenant_admin());

-- ----------------------------------------------------------------- bookings
create policy "bookings: anyone insert" on public.bookings
  for insert to anon, authenticated
  with check (tenant_id = public.current_tenant());
create policy "bookings: read own" on public.bookings
  for select to authenticated
  using (
    tenant_id = public.current_tenant()
    and (profile_id = auth.uid() or guest_email = (auth.jwt() ->> 'email'))
  );
create policy "bookings: staff read all" on public.bookings
  for select to authenticated
  using (tenant_id = public.current_tenant() and public.is_tenant_staff());
create policy "bookings: staff write" on public.bookings
  for update to authenticated
  using (tenant_id = public.current_tenant() and public.is_tenant_staff())
  with check (tenant_id = public.current_tenant() and public.is_tenant_staff());

-- ----------------------------------------------------------------- orders
create policy "orders: read own" on public.orders
  for select to authenticated
  using (tenant_id = public.current_tenant() and profile_id = auth.uid());
create policy "orders: tenant admin read" on public.orders
  for select to authenticated
  using (tenant_id = public.current_tenant() and public.is_tenant_admin());
-- Inserts/updates happen server-side via service_role (bypasses RLS), which sets tenant_id.

-- ----------------------------------------------------------------- promotions
create policy "promotions: public read published" on public.promotions
  for select to anon, authenticated
  using (tenant_id = public.current_tenant() and status = 'published');
create policy "promotions: tenant admin read" on public.promotions
  for select to authenticated
  using (tenant_id = public.current_tenant() and public.is_tenant_admin());
create policy "promotions: tenant admin write" on public.promotions
  for all to authenticated
  using (tenant_id = public.current_tenant() and public.is_tenant_admin())
  with check (tenant_id = public.current_tenant() and public.is_tenant_admin());

-- ---------------------------------------------------- promo_registrations
create policy "promo_reg: anyone insert" on public.promo_registrations
  for insert to anon, authenticated
  with check (tenant_id = public.current_tenant());
create policy "promo_reg: read own" on public.promo_registrations
  for select to authenticated
  using (
    tenant_id = public.current_tenant()
    and (profile_id = auth.uid() or guest_email = (auth.jwt() ->> 'email'))
  );
create policy "promo_reg: tenant admin all" on public.promo_registrations
  for all to authenticated
  using (tenant_id = public.current_tenant() and public.is_tenant_admin())
  with check (tenant_id = public.current_tenant() and public.is_tenant_admin());

-- ----------------------------------------------------------- automation_log
create policy "automation_log: tenant admin only" on public.automation_log
  for all to authenticated
  using (tenant_id = public.current_tenant() and public.is_tenant_admin())
  with check (tenant_id = public.current_tenant() and public.is_tenant_admin());
