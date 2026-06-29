import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { leadSchema } from '@/schemas';
import { useLocale } from '@/hooks/useLocale';
import { createLead } from '@/lib/data';
import { postEvent } from '@/lib/automation';
import { Select } from '@/components/ui/Select';
import { Captcha } from '@/components/ui/Captcha';
import type { CallWindow, ProductLineDb } from '@/types/database.types';

type Field = 'name' | 'phone' | 'email' | 'zip' | 'product_line' | 'best_time' | 'consent';
type Errors = Partial<Record<Field, string>>;

const PRODUCT_LINES: ProductLineDb[] = [
  'medicare',
  'dental-vision',
  'life-final-expense',
  'under-65-health',
  'general',
];
const CALL_WINDOWS: CallWindow[] = ['anytime', 'morning', 'afternoon', 'evening'];

/**
 * SFA Insurance lead-capture form. Consumer-initiated (compliant inbound): the consumer
 * must affirmatively consent to contact (PTC) before submit. No payment, no checkout.
 * On submit the lead lands in the admin Leads tab (mock store) and fires an automation
 * event that Resend/SMS follow-up will hang off of at go-live.
 *
 * `defaultProductLine` lets a landing/campaign preselect the line (attribution).
 */
export function LeadCaptureForm({
  defaultProductLine = 'medicare',
  source = 'website-form',
}: {
  defaultProductLine?: ProductLineDb;
  source?: string;
}) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    zip: '',
    product_line: defaultProductLine as ProductLineDb,
    best_time: 'anytime' as CallWindow,
    message: '',
    consent: false,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [captchaOk, setCaptchaOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  function update<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = leadSchema.safeParse({
      name: form.name,
      phone: form.phone,
      email: form.email,
      zip: form.zip,
      product_line: form.product_line,
      best_time: form.best_time,
      message: form.message,
      consent_contact: form.consent,
      locale,
    });
    if (!parsed.success) {
      const fieldErrors: Errors = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path[0];
        const key = (path === 'consent_contact' ? 'consent' : path) as Field;
        if (key && !fieldErrors[key]) fieldErrors[key] = t(issue.message as never);
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setBusy(true);
    await createLead({
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      zip: parsed.data.zip || null,
      product_line: parsed.data.product_line,
      best_time: parsed.data.best_time,
      message: parsed.data.message || null,
      consent_contact: true,
      source,
      locale,
    });
    await postEvent('lead.received', { ...parsed.data, source });
    setBusy(false);
    setDone(true);
  }

  if (done) {
    return (
      <div className="card text-center">
        <h3 className="text-xl text-brand-white">{t('lead.successHeading')}</h3>
        <p className="mt-2 text-brand-chrome">{t('lead.successBody')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5" noValidate>
      <div>
        <label className="mb-1 block text-sm text-brand-chrome">{t('lead.name')}</label>
        <input
          className="input-field"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          autoComplete="name"
        />
        {errors.name && <p className="mt-1 text-sm text-brand-red">{errors.name}</p>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-brand-chrome">{t('lead.phone')}</label>
          <input
            type="tel"
            inputMode="tel"
            className="input-field"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            autoComplete="tel"
          />
          {errors.phone && <p className="mt-1 text-sm text-brand-red">{errors.phone}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm text-brand-chrome">
            {t('lead.email')} <span className="text-brand-chrome/60">({t('common.optional')})</span>
          </label>
          <input
            type="email"
            className="input-field"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            autoComplete="email"
          />
          {errors.email && <p className="mt-1 text-sm text-brand-red">{errors.email}</p>}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-brand-chrome">{t('lead.productLine')}</label>
          <Select
            aria-label={t('lead.productLine')}
            value={form.product_line}
            onChange={(v) => update('product_line', v as ProductLineDb)}
            options={PRODUCT_LINES.map((p) => ({ value: p, label: t(`productLine.${p}`) }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-brand-chrome">
            {t('lead.zip')} <span className="text-brand-chrome/60">({t('common.optional')})</span>
          </label>
          <input
            inputMode="numeric"
            maxLength={5}
            className="input-field"
            value={form.zip}
            onChange={(e) => update('zip', e.target.value.replace(/\D/g, ''))}
            autoComplete="postal-code"
          />
          {errors.zip && <p className="mt-1 text-sm text-brand-red">{errors.zip}</p>}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-brand-chrome">{t('lead.bestTime')}</label>
        <Select
          aria-label={t('lead.bestTime')}
          value={form.best_time}
          onChange={(v) => update('best_time', v as CallWindow)}
          options={CALL_WINDOWS.map((w) => ({
            value: w,
            label: t(`lead.bestTimeOptions.${w}`),
          }))}
        />
      </div>

      <label className="flex cursor-pointer items-start gap-2 text-sm text-brand-chrome">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 shrink-0 accent-brand-red"
          checked={form.consent}
          onChange={(e) => update('consent', e.target.checked)}
        />
        <span>{t('lead.consent')}</span>
      </label>
      {errors.consent && <p className="-mt-1 text-sm text-brand-red">{errors.consent}</p>}

      <Captcha onVerify={setCaptchaOk} />
      <button type="submit" className="btn-primary w-full" disabled={busy || !captchaOk}>
        {busy ? t('lead.sending') : t('lead.submit')}
      </button>
    </form>
  );
}
