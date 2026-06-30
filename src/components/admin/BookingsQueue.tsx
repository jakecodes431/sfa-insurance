import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { useLocalizedService } from '@/hooks/useLocalizedService';
import { getServiceBySlug } from '@/config/services.config';
import { advanceBookingStatus, getAllBookings } from '@/lib/data';
import { formatDateTime } from '@/lib/format';
import { useAdminData, usePagination } from '@/hooks/useAdminData';
import { Select } from '@/components/ui/Select';
import { ListStatus, Pagination, SearchInput } from '@/components/admin/ui/primitives';
import { useAdminToast } from '@/components/admin/ui/AdminToast';
import type { BookingRow, BookingStatus } from '@/types/database.types';

// SFA is a phone-consult agency: appointments move requested → confirmed → completed
// (no dispatch / en_route step). cancelled and no_show are terminal.
const NEXT_STATUS: Partial<Record<BookingStatus, BookingStatus>> = {
  requested: 'confirmed',
  confirmed: 'completed',
};

const STATUSES: BookingStatus[] = ['requested', 'confirmed', 'completed', 'cancelled', 'no_show'];

const PER_PAGE = 10;

export function BookingsQueue() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const ls = useLocalizedService();
  const toast = useAdminToast();
  const { data: bookings, loading, error, reload } = useAdminData<BookingRow[]>(getAllBookings, []);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const q = search.trim().toLowerCase();
  const filtered = bookings.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (!q) return true;
    return `${b.guest_name ?? ''} ${b.guest_phone ?? ''} ${b.guest_email ?? ''} ${b.service_slug}`
      .toLowerCase()
      .includes(q);
  });
  const { page, setPage, pageCount, pageItems } = usePagination(filtered, PER_PAGE);

  async function advance(b: BookingRow) {
    const next = NEXT_STATUS[b.status];
    if (!next) return;
    try {
      await advanceBookingStatus(b.id, next);
      toast.success(t('admin.common.saved'));
      reload();
    } catch {
      toast.error(t('admin.common.saveError'));
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-4">
        <div className="text-sm text-brand-chrome">
          {t('admin.bookings.filterStatus')}
          <Select
            className="mt-1 w-full sm:w-44"
            aria-label={t('admin.bookings.filterStatus')}
            value={statusFilter}
            onChange={(v) => setStatusFilter(v as BookingStatus | 'all')}
            options={[
              { value: 'all', label: t('admin.bookings.all') },
              ...STATUSES.map((x) => ({ value: x, label: t(`bookingStatus.${x}`) })),
            ]}
          />
        </div>
        <div className="min-w-[12rem] flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder={t('admin.common.search')} />
        </div>
      </div>

      <ListStatus
        loading={loading}
        error={error}
        isEmpty={filtered.length === 0}
        emptyMessage={t('admin.bookings.noBookings')}
        onRetry={reload}
      />

      {!loading && !error && filtered.length > 0 && (
        <>
          <ul className="space-y-3">
            {pageItems.map((b) => {
              const svc = getServiceBySlug(b.service_slug);
              return (
                <li key={b.id} className="card">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-brand-white">{b.guest_name ?? '—'}</p>
                      <p className="mt-0.5 text-sm text-brand-red">{svc ? ls.name(svc) : b.service_slug}</p>
                      <p className="mt-1 text-xs text-brand-chrome">
                        {[b.guest_phone, b.guest_email].filter(Boolean).join(' · ') || '—'}
                      </p>
                      {b.scheduled_at && (
                        <p className="mt-1 text-xs text-brand-chrome">
                          {t('admin.bookings.scheduledFor', 'Requested time')}:{' '}
                          <span className="text-brand-white">{formatDateTime(b.scheduled_at, locale)}</span>
                        </p>
                      )}
                      {b.issue_description && (
                        <p className="mt-2 max-w-xl text-sm text-brand-chrome">{b.issue_description}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="rounded-full border border-brand-steel px-2 py-0.5 text-xs text-brand-chrome">
                        {t(`bookingStatus.${b.status}`)}
                      </span>
                      {NEXT_STATUS[b.status] && (
                        <button
                          className="btn-secondary !py-2 !text-sm md:!py-1 md:!text-xs"
                          onClick={() => advance(b)}
                        >
                          → {t(`bookingStatus.${NEXT_STATUS[b.status]!}`)}
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <Pagination page={page} pageCount={pageCount} onPage={setPage} />
        </>
      )}
    </div>
  );
}
