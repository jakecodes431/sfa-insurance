-- 005_automation_log.sql — debugging log for n8n webhook sends. Admin-only (RLS in 007).

create table public.automation_log (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  payload jsonb,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
create index automation_log_event_type_idx on public.automation_log (event_type);
create index automation_log_created_at_idx on public.automation_log (created_at desc);
