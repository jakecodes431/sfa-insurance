import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { businessConfig } from '@/config/business.config';
import {
  listInvoices,
  saveInvoice,
  sendInvoice,
  setInvoiceStatus,
  computeTotals,
  type LineItemInput,
} from '@/lib/invoices';
import { formatMoney } from '@/lib/format';
import { useAdminData, usePagination } from '@/hooks/useAdminData';
import { FormCard, ListStatus, Pagination } from '@/components/admin/ui/primitives';
import { useAdminToast } from '@/components/admin/ui/AdminToast';
import type { InvoiceRow } from '@/types/database.types';

const emptyInvoice = { customer_name: '', customer_email: '', customer_phone: '', notes: '' };
type LineForm = { description: string; quantity: string; unit_price_cents: string };
const PER_PAGE = 8;

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
}

export function InvoicesManager() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const toast = useAdminToast();
  const { data: invoices, loading, error, reload } = useAdminData<InvoiceRow[]>(listInvoices, []);
  const [form, setForm] = useState({ ...emptyInvoice });
  const [lines, setLines] = useState<LineForm[]>([{ description: '', quantity: '1', unit_price_cents: '' }]);

  const parsedLines: LineItemInput[] = lines
    .filter((l) => l.description.trim() !== '')
    .map((l) => ({
      description: l.description.trim(),
      quantity: Number(l.quantity) || 1,
      unit_price_cents: Number(l.unit_price_cents) || 0,
    }));
  const totals = computeTotals(parsedLines);
  const canSave = form.customer_name.trim() !== '' && parsedLines.length > 0;
  const { page, setPage, pageCount, pageItems } = usePagination(invoices, PER_PAGE);

  async function save(send: boolean) {
    if (!canSave) return;
    try {
      const inv = await saveInvoice(
        {
          customer_name: form.customer_name.trim(),
          customer_email: form.customer_email || null,
          customer_phone: form.customer_phone || null,
          notes: form.notes || null,
          status: 'draft',
          locale,
        },
        parsedLines,
      );
      if (send) await sendInvoice(inv);
      setForm({ ...emptyInvoice });
      setLines([{ description: '', quantity: '1', unit_price_cents: '' }]);
      toast.success(send ? t('invoices.send') : t('admin.common.saved'));
      reload();
    } catch {
      toast.error(t('admin.common.saveError'));
    }
  }

  async function run(action: () => Promise<unknown>, successMsg: string) {
    try {
      await action();
      toast.success(successMsg);
      reload();
    } catch {
      toast.error(t('admin.common.saveError'));
    }
  }

  function printInvoice(inv: InvoiceRow) {
    const w = window.open('', '_blank', 'width=720,height=900');
    if (!w) return;
    // Build a clean printable invoice from the stored invoice + its line items.
    void (async () => {
      const { getInvoice } = await import('@/lib/invoices');
      const full = await getInvoice(inv.id);
      const itemRows = (full?.items ?? [])
        .map(
          (it) =>
            `<tr><td>${escapeHtml(it.description)}</td><td style="text-align:center">${it.quantity}</td><td style="text-align:right">${formatMoney(it.unit_price_cents, locale)}</td><td style="text-align:right">${formatMoney(it.amount_cents, locale)}</td></tr>`,
        )
        .join('');
      w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${t('invoices.number')} #${inv.invoice_number}</title>
        <style>body{font-family:Arial,sans-serif;color:#111;padding:32px;max-width:680px;margin:auto}
        h1{margin:0;font-size:22px}.muted{color:#666;font-size:13px}table{width:100%;border-collapse:collapse;margin-top:20px}
        th,td{border-bottom:1px solid #ddd;padding:8px;font-size:14px}th{text-align:left;background:#f5f5f5}
        .tot{text-align:right;margin-top:12px;font-size:15px}.tot strong{font-size:18px}</style></head><body>
        <h1>${escapeHtml(businessConfig.legalName)}</h1>
        <p class="muted">${escapeHtml(businessConfig.address.full)} · ${escapeHtml(businessConfig.phone)}</p>
        <h2>${t('invoices.number')} #${inv.invoice_number}</h2>
        <p class="muted">${t('invoices.billTo')}: ${escapeHtml(inv.customer_name)}${inv.customer_email ? ' · ' + escapeHtml(inv.customer_email) : ''}</p>
        <table><thead><tr><th>${t('invoices.description')}</th><th>${t('invoices.qty')}</th><th>${t('invoices.unitPrice')}</th><th>${t('invoices.subtotal')}</th></tr></thead>
        <tbody>${itemRows}</tbody></table>
        <p class="tot">${t('invoices.subtotal')}: ${formatMoney(inv.subtotal_cents, locale)}</p>
        <p class="tot"><strong>${t('invoices.total')}: ${formatMoney(inv.total_cents, locale)}</strong></p>
        ${inv.notes ? `<p class="muted">${escapeHtml(inv.notes)}</p>` : ''}
        </body></html>`);
      w.document.close();
      w.focus();
      w.print();
    })();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <FormCard title={t('invoices.create')}>
        <input className="input-field" placeholder={t('invoices.customerName')} value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} autoComplete="name" />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input className="input-field" placeholder={t('invoices.customerEmail')} value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} autoComplete="email" />
          <input className="input-field" placeholder={t('invoices.customerPhone')} value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} inputMode="tel" />
        </div>

        <p className="pt-2 font-display text-sm uppercase tracking-wide text-brand-chrome">{t('invoices.lineItems')}</p>
        {lines.map((l, i) => (
          <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_4rem_6rem]">
            <input className="input-field" placeholder={t('invoices.description')} value={l.description} onChange={(e) => setLines(lines.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))} />
            <input className="input-field" type="number" placeholder={t('invoices.qty')} value={l.quantity} onChange={(e) => setLines(lines.map((x, j) => (j === i ? { ...x, quantity: e.target.value } : x)))} />
            <input className="input-field" type="number" placeholder={t('invoices.unitPrice')} value={l.unit_price_cents} onChange={(e) => setLines(lines.map((x, j) => (j === i ? { ...x, unit_price_cents: e.target.value } : x)))} />
          </div>
        ))}
        <button className="text-sm text-brand-red" onClick={() => setLines([...lines, { description: '', quantity: '1', unit_price_cents: '' }])}>
          + {t('invoices.addLine')}
        </button>

        <textarea className="input-field" placeholder={t('invoices.notes')} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />

        <div className="flex items-center justify-between border-t border-brand-steel/60 pt-3">
          <span className="text-brand-chrome">{t('invoices.total')}</span>
          <span className="font-display text-xl text-brand-white">{formatMoney(totals.total_cents, locale)}</span>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary w-full" disabled={!canSave} onClick={() => void save(false)}>{t('invoices.saveDraft')}</button>
          <button className="btn-primary w-full" disabled={!canSave} onClick={() => void save(true)}>{t('invoices.send')}</button>
        </div>
      </FormCard>

      <div>
        <h3 className="mb-3 text-lg text-brand-white">{t('invoices.heading')}</h3>

        <ListStatus
          loading={loading}
          error={error}
          isEmpty={invoices.length === 0}
          emptyMessage={t('invoices.empty')}
          onRetry={reload}
        />

        {!loading && !error && invoices.length > 0 && (
          <>
            <ul className="space-y-3">
              {pageItems.map((inv) => (
                <li key={inv.id} className="card">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-brand-white">{t('invoices.number')} #{inv.invoice_number} · {inv.customer_name}</p>
                      <p className="text-xs text-brand-chrome">{formatMoney(inv.total_cents, locale)} · {t(`invoices.statusLabel.${inv.status}`)}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button className="btn-secondary !py-2 !text-sm md:!py-1 md:!text-xs" onClick={() => printInvoice(inv)}>{t('invoices.view')}</button>
                    {inv.status === 'draft' && (
                      <button className="btn-primary !py-2 !text-sm md:!py-1 md:!text-xs" onClick={() => void run(() => sendInvoice(inv), t('invoices.send'))}>{t('invoices.send')}</button>
                    )}
                    {inv.status !== 'paid' && inv.status !== 'void' && (
                      <button className="btn-secondary !py-2 !text-sm md:!py-1 md:!text-xs" onClick={() => void run(() => setInvoiceStatus(inv.id, 'paid', `pi_manual_${inv.id.slice(0, 8)}`), t('admin.common.saved'))}>{t('invoices.markPaid')}</button>
                    )}
                    {inv.status !== 'void' && (
                      <button className="btn-secondary !py-2 !text-sm md:!py-1 md:!text-xs" onClick={() => void run(() => setInvoiceStatus(inv.id, 'void'), t('admin.common.saved'))}>{t('invoices.voidInvoice')}</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <Pagination page={page} pageCount={pageCount} onPage={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
