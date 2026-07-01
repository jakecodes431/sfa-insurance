/**
 * LeadDetailDrawer — slide-over CRM detail for a single lead: contact + status, an
 * activity timeline, and notes you can add. Reads/writes the mock data layer (persisted),
 * so status changes and notes stick and appear in the timeline.
 */
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { formatDateTime } from '@/lib/format';
import { getLeadNotes, addLeadNote, getLeadActivity, setLeadStatus } from '@/lib/data';
import { Select } from '@/components/ui/Select';
import { CloseIcon, PhoneIcon, MailIcon } from '@/components/ui/Icons';
import { useAdminToast } from '@/components/admin/ui/AdminToast';
import type { LeadRow, LeadStatus } from '@/types/database.types';
import type { LeadNote, LeadActivity } from '@/types/crm';

const STATUSES: LeadStatus[] = [
  'new',
  'contacted',
  'appointment_set',
  'quoted',
  'application_submitted',
  'enrolled',
  'not_a_fit',
];

export function LeadDetailDrawer({
  lead,
  onClose,
  onChanged,
}: {
  lead: LeadRow | null;
  onClose: () => void;
  onChanged: () => void;
}) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const toast = useAdminToast();
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [activity, setActivity] = useState<LeadActivity[]>([]);
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState<LeadStatus | null>(null);

  const refresh = useCallback(async (id: string) => {
    const [n, a] = await Promise.all([getLeadNotes(id), getLeadActivity(id)]);
    setNotes(n);
    setActivity(a);
  }, []);

  useEffect(() => {
    if (!lead) return;
    setStatus(lead.status);
    setDraft('');
    void refresh(lead.id);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [lead, refresh, onClose]);

  if (!lead) return null;

  async function changeStatus(next: LeadStatus) {
    setStatus(next);
    try {
      await setLeadStatus(lead!.id, next);
      toast.success(t('admin.common.saved'));
      await refresh(lead!.id);
      onChanged();
    } catch {
      toast.error(t('admin.common.saveError'));
    }
  }

  async function submitNote() {
    const body = draft.trim();
    if (!body) return;
    try {
      await addLeadNote(lead!.id, body);
      setDraft('');
      await refresh(lead!.id);
    } catch {
      toast.error(t('admin.common.saveError'));
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="animate-fade-in absolute inset-0 bg-brand-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Lead: ${lead.name}`}
        className="animate-slide-in-right relative z-10 flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-brand-steel bg-brand-charcoal shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-brand-steel p-5">
          <div className="min-w-0">
            <h2 className="font-display text-xl font-bold text-brand-white">{lead.name}</h2>
            <span className="mt-1 inline-block rounded-full bg-brand-red/10 px-2 py-0.5 text-xs text-brand-red">
              {t(`productLine.${lead.product_line}`)}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-steel text-brand-chrome transition hover:bg-brand-black hover:text-brand-white"
          >
            <CloseIcon className="text-lg" />
          </button>
        </div>

        <div className="space-y-6 p-5">
          {/* Status */}
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-brand-chrome">
              Status
            </label>
            <Select
              className="w-full"
              aria-label="Lead status"
              value={status ?? lead.status}
              onChange={(v) => void changeStatus(v as LeadStatus)}
              options={STATUSES.map((s) => ({ value: s, label: t(`leadStatus.${s}`) }))}
            />
          </div>

          {/* Contact */}
          <div className="space-y-2 rounded-xl border border-brand-steel/70 bg-brand-black/20 p-4 text-sm">
            <p className="text-brand-chrome">
              Best time: <span className="text-brand-white">{t(`lead.bestTimeOptions.${lead.best_time}`)}</span>
              {lead.zip ? <span className="text-brand-white"> · {lead.zip}</span> : null}
            </p>
            <p className="text-brand-chrome">
              Source: <span className="text-brand-white">{lead.source ?? '—'}</span> ·{' '}
              {lead.consent_contact ? 'Consented to contact' : 'No consent on file'}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {lead.phone && (
                <a href={`tel:${lead.phone}`} className="btn-secondary !py-2 !text-sm">
                  <PhoneIcon className="text-base" /> {lead.phone}
                </a>
              )}
              {lead.email && (
                <a href={`mailto:${lead.email}`} className="btn-secondary !py-2 !text-sm">
                  <MailIcon className="text-base" /> Email
                </a>
              )}
            </div>
            {lead.message && (
              <p className="mt-2 rounded-lg bg-brand-black/30 p-3 text-brand-chrome">{lead.message}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <h3 className="font-display text-sm font-semibold text-brand-white">Notes</h3>
            <div className="mt-2 flex gap-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Add a note…"
                rows={2}
                className="flex-1 resize-none rounded-lg border border-brand-steel bg-white px-3 py-2 text-sm text-brand-white placeholder:text-brand-chrome/60 focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
              />
            </div>
            <button
              type="button"
              onClick={() => void submitNote()}
              disabled={!draft.trim()}
              className="btn-primary mt-2 !py-2 !text-sm disabled:opacity-40"
            >
              Add note
            </button>

            <ul className="mt-4 space-y-3">
              {notes.map((n) => (
                <li key={n.id} className="rounded-lg border border-brand-steel/70 bg-brand-black/20 p-3">
                  <p className="text-sm text-brand-white">{n.body}</p>
                  <p className="mt-1 text-xs text-brand-chrome">
                    {n.author} · {formatDateTime(n.created_at, locale)}
                  </p>
                </li>
              ))}
              {notes.length === 0 && <li className="text-sm text-brand-chrome">No notes yet.</li>}
            </ul>
          </div>

          {/* Activity timeline */}
          <div>
            <h3 className="font-display text-sm font-semibold text-brand-white">Activity</h3>
            <ol className="mt-3 space-y-3 border-l border-brand-steel/70 pl-4">
              {activity.map((a) => (
                <li key={a.id} className="relative">
                  <span className="absolute -left-[1.34rem] top-1 h-2 w-2 rounded-full bg-brand-red" />
                  <p className="text-sm text-brand-white">{a.label}</p>
                  <p className="text-xs text-brand-chrome">{formatDateTime(a.created_at, locale)}</p>
                </li>
              ))}
              {activity.length === 0 && <li className="text-sm text-brand-chrome">No activity yet.</li>}
            </ol>
          </div>
        </div>
      </aside>
    </div>,
    document.body,
  );
}
