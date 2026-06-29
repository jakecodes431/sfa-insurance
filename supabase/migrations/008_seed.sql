-- 008_seed.sql — launch seed data: services (mirror config), featured reviews, sample promos.
-- Idempotent via slug/natural-key conflicts where practical.
--
-- PLACEHOLDER DATA: neutral generic business (SFP starter base). Mirrors
-- src/config/services.config.ts and src/config/promotions.config.ts. Replace per client.

-- Services (mirror src/config/services.config.ts). category in (in_shop|mobile|consultation).
insert into public.services (slug, name_en, name_es, description_en, description_es, category, bookable, deposit_cents, base_price_cents)
values
  ('standard-service','Standard Service','Servicio Estándar','Our core service for everyday needs.','Nuestro servicio principal para necesidades cotidianas.','in_shop',true,0,null),
  ('premium-service','Premium Service','Servicio Premium','A more thorough service option.','Una opción de servicio más completa.','in_shop',true,0,null),
  ('maintenance-checkup','Maintenance Checkup','Revisión de Mantenimiento','A quick check to keep everything running smoothly.','Una revisión rápida para mantener todo en orden.','in_shop',true,0,0),
  ('free-consultation','Free Consultation','Consulta Gratis','A free, no-obligation consultation.','Una consulta gratuita y sin compromiso.','consultation',true,0,0),
  ('on-site-visit','On-Site Visit','Visita a Domicilio','We come to you.','Vamos a donde estés.','mobile',true,2500,null),
  ('emergency-callout','Emergency Callout','Atención de Emergencia','Priority on-site callout.','Visita prioritaria a domicilio.','mobile',true,2500,null)
on conflict (slug) do nothing;

-- Featured reviews (placeholder).
insert into public.reviews (author_name, rating, body, source, featured)
values
  ('Sample Customer', 5, 'Great service and friendly staff. Highly recommend! (placeholder review)', 'google', true),
  ('Another Customer', 5, 'Quick, professional, and easy to book online. (placeholder review)', 'google', true),
  ('Cliente de Ejemplo', 5, 'Servicio rápido y atención en español. Excelente. (reseña de muestra)', 'facebook', true);

-- Sample published promotions so /promotions is never empty at launch.
insert into public.promotions (slug, title_en, title_es, body_en, body_es, status, is_event, requires_registration, price_cents, published_at)
values
  ('welcome-offer','New Customer Welcome Offer','Oferta de Bienvenida para Nuevos Clientes',
   'New here? Book your first appointment online and mention this offer for a friendly welcome.',
   '¿Primera vez? Reserva tu primera cita en línea y menciona esta oferta para una calurosa bienvenida.',
   'published', false, false, null, now()),
  ('free-consultation','Free Consultation','Consulta Gratis',
   'Not sure what you need? Schedule a free, no-obligation consultation.',
   '¿No sabes qué necesitas? Agenda una consulta gratuita y sin compromiso.',
   'published', false, false, null, now())
on conflict (slug) do nothing;
