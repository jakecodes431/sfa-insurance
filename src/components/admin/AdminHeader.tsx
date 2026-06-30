/**
 * AdminHeader — the back-office header that replaces the public site header on /admin.
 * Logo + "Admin" wordmark (left), the admin tabs as nav (driven by ?tab=), and a
 * "Go back to site" link (right). Tabs are URL-param-driven so the header (rendered by
 * AppLayout) and the Admin page stay in sync without shared React state.
 */
import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getActiveTenant } from '@/config/tenants';
import { ADMIN_MODULES } from '@/components/admin/registry';
import { businessConfig } from '@/config/business.config';
import { asset } from '@/lib/asset';
import { cn } from '@/lib/cn';
import { ArrowRightIcon } from '@/components/ui/Icons';

export function AdminHeader() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();

  const modules = useMemo(() => {
    const enabled = getActiveTenant().enabledAdminModules;
    return ADMIN_MODULES.filter((m) => enabled.includes(m.id));
  }, []);
  const active = params.get('tab') ?? modules[0]?.id;

  return (
    <header className="sticky top-0 z-50 border-b border-brand-steel bg-brand-charcoal/95 backdrop-blur">
      {/* Top bar: brand + back to site */}
      <div className="container-content flex h-[var(--hdr-h)] items-center justify-between gap-4">
        <Link to="/admin" className="flex shrink-0 items-center gap-2.5">
          <img
            src={asset(businessConfig.logos.primaryBanner)}
            alt=""
            width={512}
            height={512}
            className="h-8 w-auto sm:h-9"
          />
          <span className="font-display text-lg font-bold tracking-tight text-brand-white">Admin</span>
        </Link>

        <Link to="/" className="btn-secondary !py-2 !text-sm">
          <ArrowRightIcon className="rotate-180 text-base" />
          <span className="hidden sm:inline">Go back to site</span>
          <span className="sm:hidden">Site</span>
        </Link>
      </div>

      {/* Tab strip */}
      <div className="border-t border-brand-steel/70">
        <nav className="container-content flex gap-1 overflow-x-auto sm:gap-2">
          {modules.map((m) => {
            const isActive = m.id === active;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setParams({ tab: m.id })}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'whitespace-nowrap border-b-2 px-3 py-3 font-display text-sm font-medium transition-colors',
                  isActive
                    ? 'border-brand-red text-brand-white'
                    : 'border-transparent text-brand-chrome hover:text-brand-white',
                )}
              >
                {t(m.labelKey)}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
