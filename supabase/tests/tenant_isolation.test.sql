-- tenant_isolation.test.sql — Phase 8 cross-tenant isolation proof.
-- Run AFTER applying migrations 009–011 (and 012–014 for the expansion tables):
--   supabase db execute --file supabase/tests/tenant_isolation.test.sql
-- It creates a second tenant (B) with seed rows, then simulates an anonymous request
-- scoped to tenant A (ADN) and asserts ZERO tenant-B rows are visible on every
-- public-readable, tenant-scoped table — and vice-versa. Any leak RAISES EXCEPTION.
--
-- Mechanism: RLS `current_tenant()` reads the `x-tenant-id` request header for anon
-- requests, so we set that header + `role anon` to emulate each tenant's public site.

begin;

-- ---- fixtures -------------------------------------------------------------
\set adn '''a0000000-0000-4000-8000-000000000001'''
insert into public.tenants (id, slug, name, domain, active)
values ('b0000000-0000-4000-8000-0000000000b2', 'test-tenant-b', 'Test Tenant B', 'tenant-b.example', true)
on conflict (id) do nothing;

-- Seed one public-readable row per table for BOTH tenants.
insert into public.services (tenant_id, slug, name_en, name_es, description_en, description_es, category, bookable, deposit_cents, base_price_cents, active)
values
  ('a0000000-0000-4000-8000-000000000001','iso-a','A svc','A svc','x','x','in_shop',true,0,null,true),
  ('b0000000-0000-4000-8000-0000000000b2','iso-b','B svc','B svc','x','x','in_shop',true,0,null,true);
insert into public.reviews (tenant_id, author_name, rating, body, source, featured)
values
  ('a0000000-0000-4000-8000-000000000001','A','5','a','native',true),
  ('b0000000-0000-4000-8000-0000000000b2','B','5','b','native',true);
insert into public.promotions (tenant_id, slug, title_en, title_es, status)
values
  ('a0000000-0000-4000-8000-000000000001','iso-promo-a','A','A','published'),
  ('b0000000-0000-4000-8000-0000000000b2','iso-promo-b','B','B','published');

-- ---- assertion helper -----------------------------------------------------
create or replace function pg_temp.assert_zero(label text, cnt bigint) returns void
language plpgsql as $$
begin
  if cnt <> 0 then
    raise exception 'TENANT ISOLATION FAILURE: % leaked % cross-tenant row(s)', label, cnt;
  end if;
end $$;

-- ---- act as tenant A's public site, look for tenant B rows ----------------
set local role anon;
select set_config('request.headers', '{"x-tenant-id":"a0000000-0000-4000-8000-000000000001"}', true);

select pg_temp.assert_zero('services',   (select count(*) from public.services   where tenant_id = 'b0000000-0000-4000-8000-0000000000b2'));
select pg_temp.assert_zero('reviews',    (select count(*) from public.reviews    where tenant_id = 'b0000000-0000-4000-8000-0000000000b2'));
select pg_temp.assert_zero('promotions', (select count(*) from public.promotions where tenant_id = 'b0000000-0000-4000-8000-0000000000b2'));
-- anon must see NONE of these tables at all (no anon read policy):
select pg_temp.assert_zero('profiles(anon)', (select count(*) from public.profiles));
select pg_temp.assert_zero('orders(anon)',   (select count(*) from public.orders));
select pg_temp.assert_zero('bookings(anon)', (select count(*) from public.bookings));

-- expansion tables (present after 013–014):
do $$
begin
  if to_regclass('public.services') is not null then
    perform pg_temp.assert_zero('service_categories?',
      coalesce((select count(*) from public.service_categories where tenant_id = 'b0000000-0000-4000-8000-0000000000b2'), 0));
  end if;
exception when undefined_table then null;
end $$;

reset role;

-- ---- act as tenant B's public site, look for tenant A rows ----------------
set local role anon;
select set_config('request.headers', '{"x-tenant-id":"b0000000-0000-4000-8000-0000000000b2"}', true);
select pg_temp.assert_zero('services(B view A)',   (select count(*) from public.services   where tenant_id = 'a0000000-0000-4000-8000-000000000001'));
select pg_temp.assert_zero('reviews(B view A)',    (select count(*) from public.reviews    where tenant_id = 'a0000000-0000-4000-8000-000000000001'));
select pg_temp.assert_zero('promotions(B view A)', (select count(*) from public.promotions where tenant_id = 'a0000000-0000-4000-8000-000000000001'));
reset role;

select 'TENANT ISOLATION: ALL CHECKS PASSED' as result;

rollback;  -- this is a test; leave the database unchanged
