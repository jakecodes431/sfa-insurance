-- 014_invoices.sql — Custom invoices (Phase 10, context/04 §D).
-- Admin builds an invoice, sends a pay link (tenant's Stripe Connect account), and it is
-- marked paid by the Stripe webhook (or manually for cash). Tenant-scoped, per-tenant
-- sequential invoice numbers.

create table if not exists public.invoices (
  id                       uuid primary key default gen_random_uuid(),
  tenant_id                uuid not null default public.current_tenant() references public.tenants (id) on delete cascade,
  invoice_number           int  not null,                 -- per-tenant sequential (trigger below)
  customer_profile_id      uuid references auth.users (id) on delete set null,
  customer_name            text not null,
  customer_email           text,
  customer_phone           text,
  status                   text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'void')),
  currency                 text not null default 'usd',
  subtotal_cents           int  not null default 0,
  tax_cents                int  not null default 0,
  total_cents              int  not null default 0,
  notes                    text,
  due_date                 date,
  stripe_payment_intent_id text,
  stripe_invoice_id        text,
  hosted_pay_url           text,
  locale                   public.locale not null default 'en',
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  unique (tenant_id, invoice_number)
);
create index if not exists invoices_tenant_idx on public.invoices (tenant_id);

create table if not exists public.invoice_line_items (
  id               uuid primary key default gen_random_uuid(),
  invoice_id       uuid not null references public.invoices (id) on delete cascade,
  description      text not null,
  quantity         int  not null default 1,
  unit_price_cents int  not null default 0,
  amount_cents     int  not null default 0,
  sort_order       int  not null default 0
);
create index if not exists invoice_line_items_invoice_idx on public.invoice_line_items (invoice_id);

create trigger trg_invoices_updated_at
  before update on public.invoices
  for each row execute function public.touch_updated_at();

-- Per-tenant sequential invoice_number.
create or replace function public.set_invoice_number()
returns trigger
language plpgsql
as $$
begin
  if new.invoice_number is null or new.invoice_number = 0 then
    select coalesce(max(invoice_number), 0) + 1 into new.invoice_number
    from public.invoices where tenant_id = new.tenant_id;
  end if;
  return new;
end;
$$;
create trigger trg_invoices_number
  before insert on public.invoices
  for each row execute function public.set_invoice_number();

-- ----------------------------------------------------------------- RLS
alter table public.invoices           enable row level security;
alter table public.invoice_line_items enable row level security;

-- Tenant staff/admin manage invoices within their tenant.
create policy "invoices: tenant staff all" on public.invoices
  for all to authenticated
  using (tenant_id = public.current_tenant() and public.is_tenant_staff())
  with check (tenant_id = public.current_tenant() and public.is_tenant_staff());
-- A customer may read an invoice addressed to them (same tenant).
create policy "invoices: customer read own" on public.invoices
  for select to authenticated
  using (
    tenant_id = public.current_tenant()
    and (customer_profile_id = auth.uid() or customer_email = (auth.jwt() ->> 'email'))
  );

-- Line items follow their invoice's access.
create policy "invoice_items: tenant staff all" on public.invoice_line_items
  for all to authenticated
  using (exists (
    select 1 from public.invoices i
    where i.id = invoice_id and i.tenant_id = public.current_tenant() and public.is_tenant_staff()
  ))
  with check (exists (
    select 1 from public.invoices i
    where i.id = invoice_id and i.tenant_id = public.current_tenant() and public.is_tenant_staff()
  ));
create policy "invoice_items: customer read own" on public.invoice_line_items
  for select to authenticated
  using (exists (
    select 1 from public.invoices i
    where i.id = invoice_id and i.tenant_id = public.current_tenant()
      and (i.customer_profile_id = auth.uid() or i.customer_email = (auth.jwt() ->> 'email'))
  ));
