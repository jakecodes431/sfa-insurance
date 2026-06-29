import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { contactSchema } from '@/schemas';
import { useLocale } from '@/hooks/useLocale';
import { postEvent } from '@/lib/automation';
import { Captcha } from '@/components/ui/Captcha';

type Errors = Partial<Record<'name' | 'email' | 'phone' | 'message', string>>;

export function ContactForm() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [captchaOk, setCaptchaOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = contactSchema.safeParse({ ...form, locale });
    if (!parsed.success) {
      const fieldErrors: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof Errors;
        if (key && !fieldErrors[key]) fieldErrors[key] = t(issue.message as never);
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setBusy(true);
    // Contact goes straight to n8n (stubbed in placeholder mode — no POST made).
    await postEvent('contact.received', { ...parsed.data });
    setBusy(false);
    setDone(true);
  }

  if (done) {
    return (
      <div className="card">
        <h3 className="text-xl text-brand-white">{t('contact.successHeading')}</h3>
        <p className="mt-2 text-brand-chrome">{t('contact.successBody')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-3 sm:space-y-4" noValidate>
      <div>
        <label className="mb-1 block text-sm text-brand-chrome">{t('contact.name')}</label>
        <input
          className="input-field"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          autoComplete="name"
        />
        {errors.name && <p className="mt-1 text-sm text-brand-red">{errors.name}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-brand-chrome">{t('contact.email')}</label>
          <input
            type="email"
            className="input-field"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            autoComplete="email"
          />
          {errors.email && <p className="mt-1 text-sm text-brand-red">{errors.email}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm text-brand-chrome">
            {t('contact.phone')} <span className="text-brand-chrome/60">({t('common.optional')})</span>
          </label>
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
      </div>
      <div>
        <label className="mb-1 block text-sm text-brand-chrome">{t('contact.message')}</label>
        <textarea
          className="input-field min-h-[120px]"
          value={form.message}
          onChange={(e) => update('message', e.target.value)}
        />
        {errors.message && <p className="mt-1 text-sm text-brand-red">{errors.message}</p>}
      </div>
      <Captcha onVerify={setCaptchaOk} />
      <button type="submit" className="btn-primary w-full" disabled={busy || !captchaOk}>
        {busy ? t('contact.sending') : t('contact.send')}
      </button>
    </form>
  );
}
