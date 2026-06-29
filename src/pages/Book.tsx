import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { bookableServices } from '@/config/services.config';
import { useLocale } from '@/hooks/useLocale';
import { useLocalizedService } from '@/hooks/useLocalizedService';
import { useAuth } from '@/lib/auth';
import { createBooking } from '@/lib/data';
import { postEvent } from '@/lib/automation';
import { Seo } from '@/components/seo/Seo';
import { Select } from '@/components/ui/Select';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { CalEmbed } from '@/components/scheduling/CalEmbed';
import { Confirmation } from '@/components/ui/Confirmation';

export default function Book() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const ls = useLocalizedService();
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();

  // All bookable services (scheduled via Cal.com).
  const services = useMemo(() => bookableServices(), []);
  const initial = searchParams.get('service') ?? services[0]?.slug ?? '';

  const [slug, setSlug] = useState(initial);
  const [name, setName] = useState(profile?.full_name ?? '');
  const [email, setEmail] = useState(profile?.email ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [done, setDone] = useState(false);

  const service = services.find((s) => s.slug === slug);
  const contactReady = name.trim() !== '' && /\S+@\S+\.\S+/.test(email);

  async function handleSuccess(calcomBookingId: string) {
    await createBooking({
      booking_type: 'in_shop',
      service_slug: slug,
      status: 'confirmed',
      guest_name: name,
      guest_email: email,
      guest_phone: phone || null,
      profile_id: profile?.id ?? null,
      calcom_booking_id: calcomBookingId,
      issue_description: null,
      vehicle_info: null,
      locale,
    });
    await postEvent('booking.created', {
      locale,
      booking_type: 'in_shop',
      service_slug: slug,
      guest_name: name,
      guest_email: email,
      guest_phone: phone,
      calcom_booking_id: calcomBookingId,
    });
    setDone(true);
  }

  return (
    <section className="container-content max-w-3xl py-10 sm:py-16">
      <Seo title={t('book.seoTitle')} description={t('book.seoDescription')} path="/book" />
      <SectionHeading title={t('book.heading')} subtitle={t('book.sub')} />

      {done ? (
        <div className="mt-8">
          <Confirmation heading={t('book.successHeading')} body={t('book.successBody')} />
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {/* Service picker */}
          <div>
            <label className="mb-2 block font-display text-sm uppercase tracking-wide text-brand-chrome">
              {t('book.chooseService')}
            </label>
            <Select
              aria-label={t('book.chooseService')}
              value={slug}
              onChange={setSlug}
              options={services.map((s) => ({ value: s.slug, label: ls.name(s) }))}
            />
          </div>

          {/* Guest contact */}
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm text-brand-chrome">{t('dispatch.fields.name')}</label>
              <input
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-brand-chrome">{t('dispatch.fields.email')}</label>
              <input
                type="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-brand-chrome">{t('dispatch.fields.phone')}</label>
              <input
                type="tel"
                inputMode="tel"
                className="input-field"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
              />
            </div>
          </div>

          {/* Scheduler */}
          <div>
            <h3 className="mb-3 font-display text-lg uppercase tracking-wide text-brand-white">
              {t('book.schedulerHeading')}
            </h3>
            {contactReady ? (
              <CalEmbed
                metadata={{ service: slug, name, email, locale }}
                onSimulateSuccess={handleSuccess}
              />
            ) : (
              <p className="card text-brand-chrome">{t('validation.nameRequired')}</p>
            )}
          </div>

          {service && service.depositCents > 0 && (
            <p className="text-sm text-brand-chrome">{t('services.depositNote')}</p>
          )}
        </div>
      )}
    </section>
  );
}
