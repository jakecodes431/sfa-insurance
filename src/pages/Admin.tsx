import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Seo } from '@/components/seo/Seo';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { cn } from '@/lib/cn';
import { getActiveTenant } from '@/config/tenants';
import type { AdminModule } from '@/config/admin.config';
import { ADMIN_MODULES } from '@/components/admin/registry';
import { AdminToastProvider } from '@/components/admin/ui/AdminToast';

/**
 * Admin — the owner's dashboard shell. It renders only the modules the active tenant
 * enables (tenant.enabledAdminModules), in the order defined by the registry. Each tab's
 * UI lives in its own component under src/components/admin/; this file just does tab nav.
 */
export default function Admin() {
  const { t } = useTranslation();

  // Tabs = registry filtered to this tenant's enabled modules (vertical-specific).
  const modules = useMemo(() => {
    const enabled = getActiveTenant().enabledAdminModules;
    return ADMIN_MODULES.filter((m) => enabled.includes(m.id));
  }, []);

  const [tab, setTab] = useState<AdminModule>(modules[0]?.id ?? 'bookings');

  // Open the right tab when returning from Stripe Connect onboarding (?tab=payments&connect=…).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') === 'payments' && modules.some((m) => m.id === 'payments')) {
      setTab('payments');
    }
  }, [modules]);

  const ActiveComponent = modules.find((m) => m.id === tab)?.Component;

  return (
    <AdminToastProvider>
      <section className="container-content py-10 sm:py-16">
        <Seo title={t('admin.seoTitle')} path="/admin" />
        <SectionHeading title={t('admin.heading')} />

        <div className="mt-6 flex flex-nowrap gap-1 overflow-x-auto border-b border-brand-steel sm:flex-wrap sm:gap-2">
          {modules.map((m) => (
            <button
              key={m.id}
              onClick={() => setTab(m.id)}
              className={cn(
                'px-2 py-2 font-display text-sm uppercase tracking-wide sm:px-4',
                tab === m.id ? 'border-b-2 border-brand-red text-brand-white' : 'text-brand-chrome',
              )}
            >
              {t(m.labelKey)}
            </button>
          ))}
        </div>

        <div className="mt-8">{ActiveComponent && <ActiveComponent />}</div>
      </section>
    </AdminToastProvider>
  );
}
