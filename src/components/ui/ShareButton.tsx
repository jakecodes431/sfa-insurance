import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShareIcon } from './Icons';
import { cn } from '@/lib/cn';

/**
 * ShareButton — opens the device's native share sheet (Web Share API). Falls back to
 * copying the link to the clipboard. Pure client-side — no backend, demo-safe.
 */
export function ShareButton({
  title,
  text,
  className,
  variant = 'secondary',
}: {
  title: string;
  text?: string;
  className?: string;
  variant?: 'primary' | 'secondary';
}) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const onShare = async () => {
    const url = window.location.href;
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({ title, text: text ?? title, url });
        return;
      } catch {
        /* user cancelled or share failed — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — nothing else to do */
    }
  };

  return (
    <button
      type="button"
      onClick={() => void onShare()}
      className={cn(variant === 'primary' ? 'btn-primary' : 'btn-secondary', className)}
    >
      <ShareIcon className="text-lg" />
      {copied ? t('common.shareCopied') : t('common.share')}
    </button>
  );
}
