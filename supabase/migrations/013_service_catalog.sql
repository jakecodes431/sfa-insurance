-- 013_service_catalog.sql — Owner-managed service catalog (Phase 10, context/04 §C).
-- Adds manageable service categories and extends `services` with owner-editable fields
-- (price, price type, duration, availability, deposit). All tenant-scoped.

create table if not exists public.service_categories (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null default public.current_tenant() references public.tenants (id) on delete cascade,
  name_en    text not null,
  name_es    text not null,
  sort_order int  not null default 0,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists service_categories_tenant_idx on public.service_categories (tenant_id);

-- Extend services with owner-editable fields (keep existing columns intact).
alter table public.services add column if not exists category_id uuid references public.service_categories (id) on delete set null;
alter table public.services add column if not exists price_cents int;
alter table public.services add column if not exists price_type text not null default 'quote' check (price_type in ('fixed', 'from', 'quote'));
alter table public.services add column if not exists est_duration_minutes int;
alter table public.services add column if not exists availability jsonb not null default '{"available":true}'::jsonb;
alter table public.services add column if not exists requires_deposit boolean not null default false;
alter table public.services add column if not exists sort_order int not null default 0;
alter table public.services add column if not exists updated_at timestamptz not null default now();

create trigger trg_services_updated_at
  before update on public.services
  for each row execute function public.touch_updated_at();

alter table public.service_categories enable row level security;

create policy "service_categories: public read active" on public.service_categories
  for select to anon, authenticated
  using (tenant_id = public.current_tenant() and active = true);
create policy "service_categories: tenant admin all" on public.service_categories
  for all to authenticated
  using (tenant_id = public.current_tenant() and public.is_tenant_admin())
  with check (tenant_id = public.current_tenant() and public.is_tenant_admin());

-- Seed placeholder categories + map existing services to them.
do $$
declare
  org uuid := 'a0000000-0000-4000-8000-000000000001';
  c_services uuid; c_consult uuid; c_onsite uuid;
begin
  insert into public.service_categories (tenant_id, name_en, name_es, sort_order)
  values (org, 'Services', 'Servicios', 1) returning id into c_services;
  insert into public.service_categories (tenant_id, name_en, name_es, sort_order)
  values (org, 'Consultation', 'Consulta', 2) returning id into c_consult;
  insert into public.service_categories (tenant_id, name_en, name_es, sort_order)
  values (org, 'On-Site', 'A Domicilio', 3) returning id into c_onsite;

  update public.services set category_id = c_onsite where tenant_id = org and category = 'mobile';
  update public.services set category_id = c_consult where tenant_id = org and category = 'consultation';
  update public.services set category_id = c_services where tenant_id = org and category = 'in_shop';
  -- price_type from existing base_price_cents (0 = fixed/free, null = quote)
  update public.services set price_type = case when base_price_cents = 0 then 'fixed'
                                               when base_price_cents is null then 'quote'
                                               else 'from' end,
                             price_cents = base_price_cents,
                             requires_deposit = (deposit_cents > 0)
  where tenant_id = org;
exception when others then null; -- seed is best-effort
end $$;
