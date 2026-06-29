import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { businessConfig } from '@/config/business.config';
import { PhoneIcon } from '@/components/ui/Icons';
import { cn } from '@/lib/cn';
import { asset } from '@/lib/asset';

// Single-page landing: nav anchors to sections, not separate pages. No auth, no
// language toggle, no admin link.
const NAV_ITEMS = [
  { href: '#coverage', label: 'Plans' },
  { href: '#reviews', label: 'Reviews' },
];

const navLinkClass = 'text-sm font-medium tracking-tight text-brand-chrome transition-colors hover:text-brand-white';

export function Header() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  // Subtle elevation once the page scrolls (modern sticky header).
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      ref={headerRef}
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-brand-steel bg-brand-charcoal/90 shadow-sm backdrop-blur-md'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <div className="container-content flex h-[var(--hdr-h)] items-center justify-between gap-4">
        {/* Logo lockup: shield mark (supplies "SFA") + wordmark */}
        <Link to="/" className="flex shrink-0 items-center gap-2.5" onClick={() => setOpen(false)}>
          <img
            src={asset(businessConfig.logos.primaryBanner)}
            alt={t('header.logoAlt')}
            className="h-9 w-auto sm:h-10"
            width={512}
            height={512}
          />
          <span className="hidden font-display text-lg font-bold leading-none tracking-tight text-brand-white sm:block">
            Insurance Group
          </span>
        </Link>

        {/* Desktop nav — centered */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-9 lg:flex">
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href} className={navLinkClass}>
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop actions — phone + single CTA */}
        <div className="hidden items-center gap-5 lg:flex">
          <a
            href={`tel:${businessConfig.phoneE164}`}
            className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-brand-white transition-colors hover:text-brand-red"
          >
            <PhoneIcon className="text-base text-brand-red" />
            {businessConfig.phone}
          </a>
          <a href="#quote" className="btn-primary !py-2.5 !text-sm">
            {t('nav.book')}
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="flex h-11 w-11 flex-col items-center justify-center gap-[5px] rounded-lg lg:hidden"
          aria-expanded={open}
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span
            className={cn(
              'block h-0.5 w-6 bg-brand-white transition-all duration-300',
              open && 'translate-y-[7px] rotate-45',
            )}
          />
          <span
            className={cn('block h-0.5 w-6 bg-brand-white transition-all duration-300', open && 'opacity-0')}
          />
          <span
            className={cn(
              'block h-0.5 w-6 bg-brand-white transition-all duration-300',
              open && '-translate-y-[7px] -rotate-45',
            )}
          />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-brand-steel bg-brand-charcoal lg:hidden">
          <nav className="container-content flex flex-col gap-1 py-4">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3.5 text-base font-medium tracking-tight text-brand-chrome hover:bg-brand-black hover:text-brand-white"
              >
                {item.label}
              </a>
            ))}
            <a
              href={`tel:${businessConfig.phoneE164}`}
              className="btn-secondary mt-3 w-full"
              onClick={() => setOpen(false)}
            >
              <PhoneIcon className="text-base text-brand-red" />
              {businessConfig.phone}
            </a>
            <a href="#quote" className="btn-primary mt-2 w-full" onClick={() => setOpen(false)}>
              {t('nav.book')}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
