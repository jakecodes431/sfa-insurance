-- 002_core.sql — tenants + staff. RLS derives org from the signed-in staff member.
create table orgs ( code text primary key, name text not null, created_at timestamptz default now() );
create table staff ( id uuid primary key default gen_random_uuid(), org_code text references orgs(code), email text unique not null );

-- org of the signed-in staff member (used by RLS policies + SECURITY DEFINER RPCs)
create or replace function sfp_user_org_code() returns text language sql stable as $$
  select org_code from staff where id = auth.uid()
$$;

alter table orgs enable row level security;
alter table staff enable row level security;
create policy staff_self on staff for select using ( id = auth.uid() );
create policy org_member on orgs for select using ( code = sfp_user_org_code() );
