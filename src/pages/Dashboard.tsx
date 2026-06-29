import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth';
import { useLocale } from '@/hooks/useLocale';
import { useLocalizedService } from '@/hooks/useLocalizedService';
import { getServiceBySlug } from '@/config/services.config';
import {
  getMyBookings,
  getMyOrders,
  getMyRegistrations,
} from '@/lib/data';
import { formatDateTime, formatMoney } from '@/lib/format';
import { Seo } from '@/components/seo/Seo';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { LanguageToggle } from '@/components/layout/LanguageToggle';
import type {
  BookingRow,
  OrderRow,
  PromoRegistrationRow,
} from '@/types/database.types';

export default function Dashboard() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const ls = useLocalizedService();
  const { profile } = useAuth();

  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [regs, setRegs] = useState<PromoRegistrationRow[]>([]);

  const reload = useCallback(async () => {
    if (!profile) return;
    setBookings(await getMyBookings(profile.id, profile.email));
    setOrders(await getMyOrders(profile.id));
    setRegs(await getMyRegistrations(profile.id, profile.email));
  }, [profile]);

  useEffect(() => {
    void reload();
  }, [reload]);

  if (!profile) return null;

  const now = Date.now();
  const upcoming = bookings.filter((b) => !b.scheduled_at || new Date(b.scheduled_at).getTime() >= now);
  const past = bookings.filter((b) => b.scheduled_at && new Date(b.scheduled_at).getTime() < now);

  return (
    <section className="container-content py-10 sm:py-16">
      <Seo title={t('dashboard.seoTitle')} path="/dashboard" />
      <SectionHeading title={t('dashboard.heading')} subtitle={profile.full_name ?? profile.email ?? ''} />

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {/* Bookings */}
        <div>
          <h2 className="text-xl text-brand-white">{t('dashboard.upcoming')}</h2>
          <BookingList bookings={upcoming} empty={t('dashboard.noBookings')} ls={ls} locale={locale} t={t} />
          <h2 className="mt-8 text-xl text-brand-white">{t('dashboard.past')}</h2>
          <BookingList bookings={past} empty={t('dashboard.noBookings')} ls={ls} locale={locale} t={t} />
        </div>

        {/* Receipts + registrations + prefs */}
        <div className="space-y-8">
          <div>
            <h2 className="text-xl text-brand-white">{t('dashboard.receipts')}</h2>
            <ul className="mt-3 space-y-2">
              {orders.length === 0 && <li className="text-sm text-brand-chrome">{t('admin.orders.none')}</li>}
              {orders.map((o) => (
                <li key={o.id} className="card flex items-center justify-between">
                  <span className="text-brand-white">{formatMoney(o.amount_cents, locale)}</span>
                  <span className="text-sm text-brand-chrome">{t(`paymentStatus.${o.status}`)}</span>
                  {o.receipt_url && (
                    <a href={o.receipt_url} target="_blank" rel="noreferrer" className="text-sm text-brand-red underline">
                      {t('dashboard.viewReceipt')}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl text-brand-white">{t('dashboard.registrations')}</h2>
            <ul className="mt-3 space-y-2">
              {regs.length === 0 && <li className="text-sm text-brand-chrome">{t('dashboard.noRegistrations')}</li>}
              {regs.map((r) => (
                <li key={r.id} className="card text-sm text-brand-white">
                  {t('promotions.quantity')}: {r.quantity} · {t(`paymentStatus.${r.payment_status}`)}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl text-brand-white">{t('dashboard.preferences')}</h2>
            <div className="card mt-3 flex items-center justify-between">
              <span className="text-brand-chrome">{t('dashboard.preferredLanguage')}</span>
              <LanguageToggle />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BookingList({
  bookings,
  empty,
  ls,
  locale,
  t,
}: {
  bookings: BookingRow[];
  empty: string;
  ls: ReturnType<typeof useLocalizedService>;
  locale: 'en' | 'es';
  t: ReturnType<typeof useTranslation>['t'];
}) {
  // Dynamic-key lookups (bookingStatus.*, paymentStatus.*) — cast to a plain signature so the
  // huge i18n key union doesn't trip TS's "excessively deep" instantiation limit.
  const tStr = t as unknown as (key: string) => string;
  if (bookings.length === 0) return <p className="mt-3 text-sm text-brand-chrome">{empty}</p>;
  return (
    <ul className="mt-3 space-y-2">
      {bookings.map((b) => {
        const svc = getServiceBySlug(b.service_slug);
        return (
          <li key={b.id} className="card">
            <div className="flex items-center justify-between">
              <span className="text-brand-white">{svc ? ls.name(svc) : b.service_slug}</span>
              <span className="rounded-full border border-brand-steel px-2 py-0.5 text-xs text-brand-chrome">
                {tStr(`bookingStatus.${b.status}`)}
              </span>
            </div>
            {b.scheduled_at && (
              <p className="mt-1 text-sm text-brand-chrome">{formatDateTime(b.scheduled_at, locale)}</p>
            )}
            <p className="mt-1 text-xs text-brand-chrome">{tStr(`paymentStatus.${b.payment_status}`)}</p>
          </li>
        );
      })}
    </ul>
  );
}
