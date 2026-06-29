import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { env } from '@/config/env';

/**
 * Spam-protection placeholder. With VITE_HCAPTCHA_SITE_KEY unset, renders a clearly
 * labeled stub and auto-reports "passed" so forms work in placeholder mode. Wire the real
 * hCaptcha (or reCAPTCHA) widget here before launch (see WIRE-UP CHECKLIST).
 */
export function Captcha({ onVerify }: { onVerify: (passed: boolean) => void }) {
  const { t } = useTranslation();
  const configured = env.hcaptchaSiteKey !== '';

  useEffect(() => {
    // In placeholder mode, auto-pass so the flow is testable end-to-end.
    if (!configured) onVerify(true);
  }, [configured, onVerify]);

  if (!configured) {
    return (
      <p className="rounded-md border border-dashed border-brand-steel px-3 py-2 text-xs text-brand-chrome">
        {t('contact.captchaNotice')} (placeholder — hCaptcha key not set)
      </p>
    );
  }

  // Real widget mounts here once a key is provided.
  return (
    <div
      data-sitekey={env.hcaptchaSiteKey}
      className="h-[78px] w-full overflow-hidden rounded-md border border-brand-steel"
    />
  );
}
