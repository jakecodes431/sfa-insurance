-- 010_tenant_id_columns.sql — add tenant_id to every existing tenant-scoped table (Phase 8).
-- Backfills all existing rows to the placeholder tenant, then enforces NOT NULL + FK + index.
-- Shared reference tables (vehicle_catalog / vehicle_tire_fitment, added in Phase 9) are
-- intentionally NOT tenant-scoped.

do $$
declare
  org uuid := 'a0000000-0000-4000-8000-000000000001';
  tbl text;
  tenant_tables text[] := array[
    'profiles', 'vehicles', 'services', 'bookings', 'orders',
    'promotions', 'promo_registrations', 'reviews', 'automation_log'
  ];
begin
  foreach tbl in array tenant_tables loop
    -- add column (nullable first so the backfill can run)
    execute format('alter table public.%I add column if not exists tenant_id uuid;', tbl);
    -- backfill existing tenant rows
    execute format('update public.%I set tenant_id = %L where tenant_id is null;', tbl, org);
    -- enforce + reference + index
    execute format('alter table public.%I alter column tenant_id set not null;', tbl);
    execute format(
      'alter table public.%I add constraint %I foreign key (tenant_id) references public.tenants(id) on delete cascade;',
      tbl, tbl || '_tenant_id_fkey'
    );
    execute format('create index if not exists %I on public.%I (tenant_id);', tbl || '_tenant_id_idx', tbl);
  end loop;
end $$;

-- Default tenant_id on insert from the request's resolved tenant, so app inserts
-- (which don't send tenant_id explicitly) are always correctly scoped. RLS still
-- enforces that the value cannot belong to another tenant.
do $$
declare
  tbl text;
  tenant_tables text[] := array[
    'profiles', 'vehicles', 'services', 'bookings', 'orders',
    'promotions', 'promo_registrations', 'reviews', 'automation_log'
  ];
begin
  foreach tbl in array tenant_tables loop
    execute format('alter table public.%I alter column tenant_id set default public.current_tenant();', tbl);
  end loop;
end $$;
