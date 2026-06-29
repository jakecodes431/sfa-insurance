-- 001_enums.sql — shared enums. Multi-tenant: every row carries an org; isolation via RLS only.
create type booking_status as enum ('pending', 'confirmed', 'completed', 'cancelled');
create type invoice_status as enum ('draft', 'paid', 'void');
