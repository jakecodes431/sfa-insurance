import { useTranslation } from 'react-i18next';
import { businessConfig } from '@/config/business.config';
import { PhoneIcon, MessageIcon, NavigationIcon } from './Icons';
import { cn } from '@/lib/cn';

/**
 * ContactActions — native one-tap quick actions: Call, Text (SMS), WhatsApp, Directions.
 * Every action is a plain OS handoff (tel:/sms:/wa.me/maps) — no backend, demo-safe, and
 * works for real on a phone. WhatsApp matters for ADN's large Spanish-speaking base.
 */
export function ContactActions({ className }: { className?: string }) {
  const { t } = useTranslation();

  const actions = [
    {
      href: `tel:${businessConfig.phoneE164}`,
      label: t('common.callNow'),
      Icon: PhoneIcon,
      primary: true,
    },
    {
      href: `sms:${businessConfig.phoneE164}`,
      label: t('contact.textUs'),
      Icon: MessageIcon,
      primary: false,
    },
    {
      href: businessConfig.links.whatsapp,
      label: t('contact.whatsapp'),
      Icon: MessageIcon,
      primary: false,
      external: true,
    },
    {
      href: businessConfig.links.directions,
      label: t('contact.directions'),
      Icon: NavigationIcon,
      primary: false,
      external: true,
    },
  ];

  return (
    <div className={cn('grid grid-cols-2 gap-2 sm:grid-cols-4', className)}>
      {actions.map((a) => (
        <a
          key={a.label}
          href={a.href}
          {...(a.external ? { target: '_blank', rel: 'noreferrer' } : {})}
          className={cn(
            'flex min-h-[44px] items-center justify-center gap-2 rounded-md border px-3 py-2.5 font-display text-sm font-semibold uppercase tracking-wide transition-colors',
            a.primary
              ? 'border-brand-red bg-brand-red text-brand-white hover:bg-brand-red-dark'
              : 'border-brand-steel bg-brand-charcoal text-brand-white hover:border-brand-chrome',
          )}
        >
          <a.Icon className="text-lg" />
          {a.label}
        </a>
      ))}
    </div>
  );
}
