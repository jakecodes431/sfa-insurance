-- 009_tenants.sql — Multi-tenancy core (Phase 8). SECURITY-CRITICAL.
-- ServiceFlowPro is ONE backend serving many client sites. This seeds tenant #1.
-- This migration adds the tenant model, the user→tenant role mapping, the platform
-- super-admin capability, and the current_tenant()/role helper functions that every
-- tenant-scoped RLS policy depends on (see 011_tenant_rls.sql).

-- ----------------------------------------------------------------- tenants
create table if not exists public.tenants (
  id                        uuid primary key default gen_random_uuid(),
  slug                      text not null unique,
  name                      text not null,
  domain                    text unique,
  brand                     jsonb not null default '{}'::jsonb, -- colors/logo/fonts
  locale_default            public.locale not null default 'en',
  stripe_connect_account_id text,
  cal_com_link              text,
  n8n_webhook_base          text,
  active                    boolean not null default true,
  created_at                timestamptz not null default now()
);

comment on table public.tenants is
  'One row per client site. Every tenant-scoped row references this via tenant_id.';

-- ----------------------------------------------------- platform super-admins
-- ForgeIT-level operators who can manage tenants. Kept STRICTLY separate from
-- tenant admins so a tenant admin can never reach platform-wide data.
create table if not exists public.platform_admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------- user ↔ tenant roles
-- A user belongs to one tenant for now, but this is modeled as a join table so the
-- platform can support multi-tenant users later without a schema change.
create table if not exists public.user_tenant_roles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  tenant_id  uuid not null references public.tenants (id) on delete cascade,
  role       public.user_role not null default 'customer',
  created_at timestamptz not null default now(),
  unique (user_id, tenant_id)
);

create index if not exists user_tenant_roles_user_idx   on public.user_tenant_roles (user_id);
create index if not exists user_tenant_roles_tenant_idx on public.user_tenant_roles (tenant_id);

-- =====================================================================
-- Tenant resolution + role helpers
-- =====================================================================
-- current_tenant() resolves the active tenant for the request:
--   1) Authenticated users: the tenant bound to them via user_tenant_roles
--      (authoritative — a signed-in user can only act within their own tenant).
--   2) Anonymous/public requests: the tenant id supplied by the client as the
--      `x-tenant-id` request header (the frontend sets this from the resolved
--      tenant — see src/lib/tenant.tsx + src/lib/supabase.ts).
create or replace function public.current_tenant()
returns uuid
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  t uuid;
begin
  if auth.uid() is not null then
    select tenant_id into t
    from public.user_tenant_roles
    where user_id = auth.uid()
    limit 1;
    if t is not null then
      return t;
    end if;
  end if;

  begin
    t := nullif(current_setting('request.headers', true)::json ->> 'x-tenant-id', '')::uuid;
  exception
    when others then t := null;
  end;
  return t;
end;
$$;

-- Is the current user an admin OF THE CURRENT TENANT?
create or replace function public.is_tenant_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_tenant_roles r
    where r.user_id = auth.uid()
      and r.tenant_id = public.current_tenant()
      and r.role = 'admin'
  );
$$;

-- Is the current user staff or admin OF THE CURRENT TENANT?
create or replace function public.is_tenant_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_tenant_roles r
    where r.user_id = auth.uid()
      and r.tenant_id = public.current_tenant()
      and r.role in ('admin', 'staff')
  );
$$;

-- Platform-level super admin (ForgeIT). Not a tenant role.
create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.platform_admins p where p.user_id = auth.uid());
$$;

-- ----------------------------------------------------------------- RLS: tenancy tables
alter table public.tenants            enable row level security;
alter table public.platform_admins    enable row level security;
alter table public.user_tenant_roles  enable row level security;

-- Tenants: a site may read its OWN tenant row (for brand/config); platform admins manage all.
create policy "tenants: read own" on public.tenants
  for select to anon, authenticated
  using (id = public.current_tenant());
create policy "tenants: platform manage" on public.tenants
  for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

-- platform_admins: only platform admins can see/manage the list.
create policy "platform_admins: self-or-platform read" on public.platform_admins
  for select to authenticated
  using (user_id = auth.uid() or public.is_platform_admin());
create policy "platform_admins: platform manage" on public.platform_admins
  for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

-- user_tenant_roles: a user reads their own bindings; tenant admins manage within their tenant.
create policy "utr: read own" on public.user_tenant_roles
  for select to authenticated
  using (user_id = auth.uid());
create policy "utr: tenant admin read" on public.user_tenant_roles
  for select to authenticated
  using (tenant_id = public.current_tenant() and public.is_tenant_admin());
create policy "utr: tenant admin manage" on public.user_tenant_roles
  for all to authenticated
  using (tenant_id = public.current_tenant() and public.is_tenant_admin())
  with check (tenant_id = public.current_tenant() and public.is_tenant_admin());

-- --------------------------------------------------- seed: placeholder tenant (#1)
-- Fixed id so later migrations / backfills can reference it deterministically.
-- PLACEHOLDER tenant for the SFP starter base. Replace name/slug/domain/brand per client.
insert into public.tenants (id, slug, name, domain, brand, locale_default,
  stripe_connect_account_id, cal_com_link, n8n_webhook_base, active)
values (
  'a0000000-0000-4000-8000-000000000001',
  'maple-street',
  'Maple Street Services LLC',
  'maplestreetservices.example',
  jsonb_build_object(
    'red', '#2563EB', 'redDark', '#1D4ED8', 'black', '#0B0F17',
    'charcoal', '#171B24', 'steel', '#374151', 'chrome', '#CBD5E1', 'white', '#FFFFFF',
    'logoPrimary', '/brand/logo-primary-banner.png',
    'logoBadge', '/brand/logo-badge-square.png'
  ),
  'en',
  null,                                  -- TODO: Stripe Connect account id (wire-up)
  null,                                  -- TODO: Cal.com link (wire-up)
  null,                                  -- TODO: n8n webhook base (wire-up)
  true
)
on conflict (id) do nothing;
