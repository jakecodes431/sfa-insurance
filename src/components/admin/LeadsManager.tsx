import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { getAllLeads, setLeadStatus } from '@/lib/data';
import { formatDateTime } from '@/lib/format';
import { useAdminData, usePagination } from '@/hooks/useAdminData';
import { Select } from '@/components/ui/Select';
import { ListStatus, Pagination, SearchInput } from '@/components/admin/ui/primitives';
import { useAdminToast } from '@/components/admin/ui/AdminToast';
import { LeadDetailDrawer } from './LeadDetailDrawer';
import { AddLeadModal } from './AddLeadModal';
import { ComposeBlastModal } from './ComposeBlastModal';
import { SmsBookingModal } from './SmsBookingModal';
import { LeadFilters } from './LeadFilters';
import { PlusIcon, MailIcon, MessageIcon } from '@/components/ui/Icons';
import type { LeadRow, LeadStatus, ProductLineDb } from '@/types/database.types';

/** Client-side CSV export of the current (filtered) leads. */
function exportLeadsCsv(rows: LeadRow[]) {
  const headers = ['Name', 'Email', 'Phone', 'Zip', 'Product', 'Status', 'Best time', 'Consent', 'Source', 'Created'];
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [headers.join(',')];
  for (const l of rows) {
    lines.push(
      [l.name, l.email, l.phone, l.zip, l.product_line, l.status, l.best_time, l.consent_contact ? 'yes' : 'no', l.source, l.created_at]
        .map(esc)
        .join(','),
    );
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sfa-leads.csv';
  a.click();
  URL.revokeObjectURL(url);
}

const STATUSES: LeadStatus[] = [
  'new',
  'contacted',
  'appointment_set',
  'quoted',
  'application_submitted',
  'enrolled',
  'not_a_fit',
];
const PRODUCTS: ProductLineDb[] = [
  'medicare',
  'dental-vision',
  'life-final-expense',
  'under-65-health',
  'general',
];
const PER_PAGE = 10;

const DATE_OPTIONS = [
  { value: 'all', label: 'All time' },
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'month', label: 'This month' },
];

const DAY_MS = 24 * 60 * 60 * 1000;

/** Is a lead's created_at within the selected date window? */
function withinWindow(createdAt: string, window: string, now: number): boolean {
  const t = new Date(createdAt).getTime();
  switch (window) {
    case 'today': {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return t >= start.getTime();
    }
    case '7d':
      return now - t <= 7 * DAY_MS;
    case '30d':
      return now - t <= 30 * DAY_MS;
    case 'month': {
      const ref = new Date(now);
      const c = new Date(createdAt);
      return c.getMonth() === ref.getMonth() && c.getFullYear() === ref.getFullYear();
    }
    default:
      return true;
  }
}

export function LeadsManager() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const toast = useAdminToast();
  const { data: leads, loading, error, reload } = useAdminData<LeadRow[]>(getAllLeads, []);
  const [productFilter, setProductFilter] = useState<ProductLineDb | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<LeadRow | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [blastOpen, setBlastOpen] = useState(false);
  const [smsOpen, setSmsOpen] = useState(false);

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const q = search.trim().toLowerCase();
  const now = Date.now();
  const filtered = leads.filter((l) => {
    if (productFilter !== 'all' && l.product_line !== productFilter) return false;
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    if (dateFilter !== 'all' && !withinWindow(l.created_at, dateFilter, now)) return false;
    if (!q) return true;
    return `${l.name} ${l.phone ?? ''} ${l.email ?? ''} ${l.zip ?? ''}`.toLowerCase().includes(q);
  });
  const { page, setPage, pageCount, pageItems } = usePagination(filtered, PER_PAGE);

  async function changeStatus(l: LeadRow, status: LeadStatus) {
    try {
      await setLeadStatus(l.id, status);
      toast.success(t('admin.common.saved'));
      reload();
    } catch {
      toast.error(t('admin.common.saveError'));
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-brand-chrome">
          {filtered.length} {filtered.length === 1 ? 'lead' : 'leads'}
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={() => setAddOpen(true)} className="btn-secondary !py-2 !text-sm">
            <PlusIcon className="text-base" /> Add lead
          </button>
          <button
            type="button"
            onClick={() => exportLeadsCsv(filtered)}
            disabled={filtered.length === 0}
            className="btn-secondary !py-2 !text-sm disabled:opacity-40"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <LeadFilters
          product={productFilter}
          status={statusFilter}
          date={dateFilter}
          onProduct={(v) => setProductFilter(v as ProductLineDb | 'all')}
          onStatus={(v) => setStatusFilter(v as LeadStatus | 'all')}
          onDate={setDateFilter}
          productOptions={[
            { value: 'all', label: t('admin.leads.all') },
            ...PRODUCTS.map((p) => ({ value: p, label: t(`productLine.${p}`) })),
          ]}
          statusOptions={[
            { value: 'all', label: t('admin.leads.all') },
            ...STATUSES.map((s) => ({ value: s, label: t(`leadStatus.${s}`) })),
          ]}
          dateOptions={DATE_OPTIONS}
        />
        <div className="min-w-[12rem] flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder={t('admin.common.search')} />
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-red/40 bg-brand-red/5 px-4 py-2.5">
          <p className="text-sm text-brand-white">{selectedIds.size} selected</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setBlastOpen(true)} className="btn-primary !py-2 !text-sm">
              <MailIcon className="text-base" /> Email selected
            </button>
            <button type="button" onClick={() => setSmsOpen(true)} className="btn-secondary !py-2 !text-sm">
              <MessageIcon className="text-base" /> Text booking link
            </button>
            <button type="button" onClick={() => setSelectedIds(new Set())} className="btn-secondary !py-2 !text-sm">
              Clear
            </button>
          </div>
        </div>
      )}

      <ListStatus
        loading={loading}
        error={error}
        isEmpty={filtered.length === 0}
        emptyMessage={t('admin.leads.noLeads')}
        onRetry={reload}
      />

      {!loading && !error && filtered.length > 0 && (
        <>
          <ul className="space-y-3">
            {pageItems.map((l) => (
              <li
                key={l.id}
                onClick={() => setSelected(l)}
                className="card cursor-pointer transition hover:border-brand-red/40"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(l.id)}
                      onChange={() => toggleSelect(l.id)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select ${l.name}`}
                      className="mt-1 h-4 w-4 shrink-0"
                    />
                    <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-brand-white">{l.name}</p>
                      <span className="rounded-full bg-brand-red/10 px-2 py-0.5 text-xs text-brand-red">
                        {t(`productLine.${l.product_line}`)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-brand-chrome">
                      {l.phone ?? '—'}
                      {l.email ? ` · ${l.email}` : ''}
                      {l.zip ? ` · ${l.zip}` : ''} · {t('admin.leads.bestTime')}:{' '}
                      {t(`lead.bestTimeOptions.${l.best_time}`)}
                    </p>
                    <p className="mt-1 text-xs text-brand-chrome/80">
                      {t('admin.leads.source')}: {l.source ?? '—'} ·{' '}
                      {formatDateTime(l.created_at, locale)} ·{' '}
                      {l.consent_contact ? '✓ ' + t('admin.leads.consent') : t('admin.leads.noConsent')}
                    </p>
                    {l.message && (
                      <p className="mt-2 rounded-md bg-brand-black/40 px-3 py-2 text-sm text-brand-chrome">
                        {l.message}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-3 text-xs" onClick={(e) => e.stopPropagation()}>
                      {l.phone && (
                        <a className="text-brand-red underline" href={`tel:${l.phone}`}>
                          {t('admin.leads.call')}
                        </a>
                      )}
                      {l.email && (
                        <a className="text-brand-red underline" href={`mailto:${l.email}`}>
                          {t('admin.leads.email')}
                        </a>
                      )}
                    </div>
                    </div>
                  </div>
                  <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Select
                      className="w-48"
                      aria-label={t('admin.leads.setStatus')}
                      value={l.status}
                      onChange={(v) => changeStatus(l, v as LeadStatus)}
                      options={STATUSES.map((s) => ({ value: s, label: t(`leadStatus.${s}`) }))}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <Pagination page={page} pageCount={pageCount} onPage={setPage} />
        </>
      )}

      <LeadDetailDrawer lead={selected} onClose={() => setSelected(null)} onChanged={reload} />
      <AddLeadModal open={addOpen} onClose={() => setAddOpen(false)} onAdded={reload} />
      <ComposeBlastModal
        leads={leads.filter((l) => selectedIds.has(l.id))}
        open={blastOpen}
        onClose={() => setBlastOpen(false)}
        onSent={() => {
          setSelectedIds(new Set());
          reload();
        }}
      />
      <SmsBookingModal
        leads={leads.filter((l) => selectedIds.has(l.id))}
        open={smsOpen}
        onClose={() => setSmsOpen(false)}
        onSent={() => {
          setSelectedIds(new Set());
          reload();
        }}
      />
    </div>
  );
}
