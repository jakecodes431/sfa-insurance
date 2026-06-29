-- 003_bookings_orders.sql — bookings + invoices, RLS-scoped to the staff member's org.
create table bookings (
  id uuid primary key default gen_random_uuid(),
  org_code text references orgs(code) not null,
  service text not null, customer_name text not null,
  scheduled_for timestamptz, deposit_paid boolean default false,
  status booking_status default 'pending', created_at timestamptz default now()
);
create table invoices (
  id uuid primary key default gen_random_uuid(),
  org_code text references orgs(code) not null,
  booking_id uuid references bookings(id), amount_cents int not null,
  status invoice_status default 'draft', created_at timestamptz default now()
);
alter table bookings enable row level security;
alter table invoices enable row level security;
create policy bookings_org on bookings for all using ( org_code = sfp_user_org_code() ) with check ( org_code = sfp_user_org_code() );
create policy invoices_org on invoices for all using ( org_code = sfp_user_org_code() ) with check ( org_code = sfp_user_org_code() );
-- NOTE: public reads (e.g. service catalog) go through SECURITY DEFINER RPCs taking org as an arg.
-- Run get_advisors after applying migrations and resolve every RLS finding.
