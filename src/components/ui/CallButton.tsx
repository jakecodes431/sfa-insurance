import { useTranslation } from 'react-i18next';
import { businessConfig } from '@/config/business.config';
import { PhoneIcon } from './Icons';
import { cn } from '@/lib/cn';

/** Click-to-call button. Phone number always sourced from business.config. */
export function CallButton({
  className,
  variant = 'primary',
}: {
  className?: string;
  variant?: 'primary' | 'secondary';
}) {
  const { t } = useTranslation();
  return (
    <a
      href={`tel:${businessConfig.phoneE164}`}
      className={cn(variant === 'primary' ? 'btn-primary' : 'btn-secondary', className)}
    >
      <PhoneIcon className="text-lg" />
      {t('common.callNow')}
    </a>
  );
}
