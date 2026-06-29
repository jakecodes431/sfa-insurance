-- 004_promos.sql — promotions/events and registrations.

create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_en text not null,
  title_es text not null,
  body_en text,
  body_es text,
  image_url text,
  status promo_status not null default 'draft',
  is_event boolean not null default false,
  event_start timestamptz,
  event_end timestamptz,
  requires_registration boolean not null default false,
  price_cents int, -- null/0 = free
  capacity int, -- null = unlimited
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index promotions_status_idx on public.promotions (status);

create table public.promo_registrations (
  id uuid primary key default gen_random_uuid(),
  promo_id uuid not null references public.promotions (id) on delete cascade,
  profile_id uuid references public.profiles (id) on delete set null,
  guest_name text,
  guest_email text,
  guest_phone text,
  quantity int not null default 1 check (quantity >= 1),
  payment_status payment_status not null default 'none',
  stripe_payment_intent_id text,
  locale locale not null default 'en',
  created_at timestamptz not null default now(),
  constraint promo_reg_owner_or_guest check (
    profile_id is not null or guest_email is not null or guest_phone is not null
  )
);
create index promo_registrations_promo_id_idx on public.promo_registrations (promo_id);
create index promo_registrations_profile_id_idx on public.promo_registrations (profile_id);

-- Now wire the deferred orders.promo_id FK (promotions exists as of this migration).
alter table public.orders
  add constraint orders_promo_id_fkey
  foreign key (promo_id) references public.promotions (id) on delete set null;
