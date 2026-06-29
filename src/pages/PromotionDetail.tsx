import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  countPromoRegistrations,
  createPromoRegistration,
  getPromotionBySlug,
} from '@/lib/data';
import { promoRegistrationSchema } from '@/schemas';
import { useLocalizedPromo } from '@/hooks/useLocalizedPromo';
import { useLocale } from '@/hooks/useLocale';
import { useAuth } from '@/lib/auth';
import { postEvent } from '@/lib/automation';
import { formatDateTime, formatMoney } from '@/lib/format';
import { Seo } from '@/components/seo/Seo';
import { Confirmation } from '@/components/ui/Confirmation';
import type { PromotionRow } from '@/types/database.types';
import NotFound from './NotFound';

export default function PromotionDetail() {
  const { slug = '' } = useParams();
  const { t } = useTranslation();
  const { locale } = useLocale();
  const lp = useLocalizedPromo();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [promo, setPromo] = useState<PromotionRow | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [count, setCount] = useState(0);
  const [form, setForm] = useState({ name: '', email: '', phone: '', quantity: 1 });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  useEffect(() => {
    void (async () => {
      const p = await getPromotionBySlug(slug);
      setPromo(p);
      if (p) setCount(await countPromoRegistrations(p.id));
      setLoaded(true);
      if (profile) setForm((f) => ({ ...f, name: profile.full_name ?? '', email: profile.email ?? '' }));
    })();
  }, [slug, profile]);

  if (loaded && !promo) return <NotFound />;
  if (!promo) return <section className="container-content py-24 text-brand-chrome">{t('common.loading')}</section>;

  const priceCents = promo.price_cents ?? 0;
  const isFull = promo.capacity !== null && count >= promo.capacity;
  const spotsLeft = promo.capacity !== null ? promo.capacity - count : null;

  async function register() {
    if (!promo) return;
    const payload = {
      promo_id: promo.id,
      guest_name: form.name,
      guest_email: form.email,
      guest_phone: form.phone,
      quantity: form.quantity,
      locale,
    };
    const parsed = promoRegistrationSchema.safeParse(payload);
    if (!parsed.success) {
      const e: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const k = String(issue.path[0]) === 'guest_name' ? 'name' : String(issue.path[0]) === 'guest_email' ? 'email' : String(issue.path[0]);
        if (!e[k]) e[k] = t(issue.message as never);
      }
      setErrors(e);
      return;
    }
    setErrors({});

    const reg = await createPromoRegistration({
      promo_id: promo.id,
      guest_name: form.name,
      guest_email: form.email,
      guest_phone: form.phone || null,
      quantity: form.quantity,
      profile_id: profile?.id ?? null,
      payment_status: priceCents > 0 ? 'none' : 'paid',
      locale,
    });

    if (priceCents > 0) {
      navigate('/pay', {
        state: {
          promoRegistrationId: reg.id,
          amountCents: priceCents * form.quantity,
          promoSlug: promo.slug,
          kind: 'event',
        },
      });
      return;
    }
    await postEvent('promo.registration', {
      locale,
      promo_id: promo.id,
      promo_slug: promo.slug,
      registration_id: reg.id,
      guest_name: form.name,
      guest_email: form.email,
      quantity: form.quantity,
    });
    setDone(true);
  }

  return (
    <>
      <Seo title={`${lp.title(promo)} — ${t('common.appName')}`} description={lp.body(promo)} path={`/promotions/${promo.slug}`} />
      <section className="container-content max-w-2xl py-10 sm:py-16">
        <Link to="/promotions" className="text-sm text-brand-chrome hover:text-brand-white">
          ← {t('promotions.backToPromos')}
        </Link>
        <span className="mt-4 block font-display text-xs uppercase tracking-wide text-brand-red">
          {promo.is_event ? t('promotions.event') : t('promotions.promo')}
        </span>
        <h1 className="mt-2 text-4xl text-brand-white">{lp.title(promo)}</h1>
        <p className="mt-4 whitespace-pre-line text-lg text-brand-chrome">{lp.body(promo)}</p>

        {promo.is_event && promo.event_start && (
          <p className="mt-4 text-sm text-brand-chrome">
            {t('promotions.startsAt')}: {formatDateTime(promo.event_start, locale)}
            {promo.event_end && ` · ${t('promotions.endsAt')}: ${formatDateTime(promo.event_end, locale)}`}
          </p>
        )}

        {promo.requires_registration && (
          <div className="mt-8">
            {done ? (
              <Confirmation heading={t('promotions.regSuccessHeading')} body={t('promotions.regSuccessBody')} />
            ) : isFull ? (
              <p className="card text-brand-red">{t('promotions.full')}</p>
            ) : (
              <div className="card space-y-4">
                <h2 className="text-xl text-brand-white">
                  {t('promotions.regHeading', { title: lp.title(promo) })}
                </h2>
                {spotsLeft !== null && (
                  <p className="text-sm text-brand-chrome">
                    {t('promotions.spotsLeft', { count: spotsLeft })}
                  </p>
                )}
                <div className="grid gap-3">
                  <div>
                    <input
                      type="text"
                      autoComplete="name"
                      className="input-field"
                      placeholder={t('dispatch.fields.name')}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                    {errors.name && <p className="mt-1 text-sm text-brand-red">{errors.name}</p>}
                  </div>
                  <div>
                    <input
                      type="email"
                      autoComplete="email"
                      className="input-field"
                      placeholder={t('dispatch.fields.email')}
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                    {errors.email && <p className="mt-1 text-sm text-brand-red">{errors.email}</p>}
                  </div>
                  <input
                    type="tel"
                    autoComplete="tel"
                    className="input-field"
                    placeholder={t('dispatch.fields.phone')}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                  <div>
                    <label className="mb-1 block text-sm text-brand-chrome">{t('promotions.quantity')}</label>
                    <input
                      type="number"
                      min={1}
                      className="input-field w-20 sm:w-24"
                      value={form.quantity}
                      onChange={(e) => setForm({ ...form, quantity: Math.max(1, Number(e.target.value)) })}
                    />
                  </div>
                </div>
                <button type="button" className="btn-primary w-full" onClick={register}>
                  {priceCents > 0
                    ? t('promotions.registerPaid', {
                        amount: formatMoney(priceCents * form.quantity, locale),
                      })
                    : t('promotions.registerFree')}
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
}
