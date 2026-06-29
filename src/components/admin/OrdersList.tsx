import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { businessConfig } from '@/config/business.config';
import { getAllOrders } from '@/lib/data';
import { formatDateTime, formatMoney } from '@/lib/format';
import { useAdminData, usePagination } from '@/hooks/useAdminData';
import { ListStatus, Pagination } from '@/components/admin/ui/primitives';
import type { OrderRow } from '@/types/database.types';

const PER_PAGE = 15;

export function OrdersList() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { data: orders, loading, error, reload } = useAdminData<OrderRow[]>(getAllOrders, []);
  const { page, setPage, pageCount, pageItems } = usePagination(orders, PER_PAGE);

  return (
    <div>
      <ListStatus
        loading={loading}
        error={error}
        isEmpty={orders.length === 0}
        emptyMessage={t('admin.orders.none')}
        onRetry={reload}
      />

      {!loading && !error && orders.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="text-brand-chrome">
                <tr className="border-b border-brand-steel">
                  <th className="py-2 whitespace-nowrap">{t('admin.orders.amount')}</th>
                  <th className="whitespace-nowrap">{t('admin.orders.status')}</th>
                  <th className="whitespace-nowrap">{t('admin.orders.date')}</th>
                  <th />
                </tr>
              </thead>
              <tbody className="text-brand-white">
                {pageItems.map((o) => (
                  <tr key={o.id} className="border-b border-brand-steel/50">
                    <td className="py-2 whitespace-nowrap">{formatMoney(o.amount_cents, locale)}</td>
                    <td className="whitespace-nowrap">{t(`paymentStatus.${o.status}`)}</td>
                    <td className="whitespace-nowrap">{formatDateTime(o.created_at, locale)}</td>
                    <td className="whitespace-nowrap">
                      {o.receipt_url && (
                        <a href={o.receipt_url} target="_blank" rel="noreferrer" className="text-brand-red underline">
                          {businessConfig.name}
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pageCount={pageCount} onPage={setPage} />
        </>
      )}
    </div>
  );
}
