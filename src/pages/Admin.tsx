import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Seo } from '@/components/seo/Seo';
import { getActiveTenant } from '@/config/tenants';
import { ADMIN_MODULES } from '@/components/admin/registry';
import { AdminToastProvider } from '@/components/admin/ui/AdminToast';

/**
 * Admin — the owner's dashboard. Tab navigation lives in AdminHeader (the back-office
 * header); the active tab is read here from the `?tab=` query param. This file just
 * renders the active module's UI.
 */
export default function Admin() {
  const { t } = useTranslation();
  const [params] = useSearchParams();

  const modules = useMemo(() => {
    const enabled = getActiveTenant().enabledAdminModules;
    return ADMIN_MODULES.filter((m) => enabled.includes(m.id));
  }, []);

  const activeId = params.get('tab') ?? modules[0]?.id;
  const ActiveComponent =
    modules.find((m) => m.id === activeId)?.Component ?? modules[0]?.Component;

  return (
    <AdminToastProvider>
      <section className="container-content py-8 sm:py-10">
        <Seo title={t('admin.seoTitle')} path="/admin" />
        {ActiveComponent && <ActiveComponent />}
      </section>
    </AdminToastProvider>
  );
}
