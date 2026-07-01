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
import { PlusIcon, MailIcon } from '@/components/ui/Icons';
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

export function LeadsManager() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const toast = useAdminToast();
  const { data: leads, loading, error, reload } = useAdminData<LeadRow[]>(getAllLeads, []);
  const [productFilter, setProductFilter] = useState<ProductLineDb | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<LeadRow | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [blastOpen, setBlastOpen] = useState(false);

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const q = search.trim().toLowerCase();
  const filtered = leads.filter((l) => {
    if (productFilter !== 'all' && l.product_line !== productFilter) return false;
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
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

      <div className="mb-4 flex flex-wrap items-end gap-4">
        <div className="text-sm text-brand-chrome">
          {t('admin.leads.filterProduct')}
          <Select
            className="mt-1 w-full sm:w-44"
            aria-label={t('admin.leads.filterProduct')}
            value={productFilter}
            onChange={(v) => setProductFilter(v as ProductLineDb | 'all')}
            options={[
              { value: 'all', label: t('admin.leads.all') },
              ...PRODUCTS.map((p) => ({ value: p, label: t(`productLine.${p}`) })),
            ]}
          />
        </div>
        <div className="text-sm text-brand-chrome">
          {t('admin.leads.filterStatus')}
          <Select
            className="mt-1 w-full sm:w-40"
            aria-label={t('admin.leads.filterStatus')}
            value={statusFilter}
            onChange={(v) => setStatusFilter(v as LeadStatus | 'all')}
            options={[
              { value: 'all', label: t('admin.leads.all') },
              ...STATUSES.map((s) => ({ value: s, label: t(`leadStatus.${s}`) })),
            ]}
          />
        </div>
        <div className="min-w-[12rem] flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder={t('admin.common.search')} />
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-red/40 bg-brand-red/5 px-4 py-2.5">
          <p className="text-sm text-brand-white">{selectedIds.size} selected</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setBlastOpen(true)} className="btn-primary !py-2 !text-sm">
              <MailIcon className="text-base" /> Email selected
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
    </div>
  );
}
