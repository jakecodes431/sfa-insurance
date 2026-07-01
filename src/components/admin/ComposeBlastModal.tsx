/**
 * ComposeBlastModal — send a marketing email to selected leads. Compliance-gated: Medicare
 * leads and leads without an email are excluded from the recipient set. Copy is written in
 * the agent's own Claude and pasted here (starter templates provided). Demo simulates the
 * send + logs to each lead's timeline; live batches to Resend (cold domain).
 */
import { useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { sendMarketingEmail } from '@/lib/data';
import { useAdminToast } from '@/components/admin/ui/AdminToast';
import type { LeadRow } from '@/types/database.types';

const TEMPLATES: { label: string; subject: string; body: string }[] = [
  {
    label: 'Dental & Vision',
    subject: 'Affordable dental & vision, ready when you are',
    body: 'Hi {first},\n\nStandalone dental and vision plans are open for enrollment in your area. See your options and sign up in minutes, no phone call required.\n\nBrowse plans: [your link]\n\nSFA Insurance Group',
  },
  {
    label: 'Final Expense',
    subject: 'Protect your family with final expense coverage',
    body: 'Hi {first},\n\nA simple final expense plan can keep your family from carrying the bill. Fixed premiums, easy qualification.\n\nGet started: [your link]\n\nSFA Insurance Group',
  },
  {
    label: 'Re-engage',
    subject: 'Still comparing your options, {first}?',
    body: 'Hi {first},\n\nWhenever you are ready, a licensed agent can walk you through your options at no cost. Reply here or grab a time that works for you.\n\nSFA Insurance Group',
  },
];

export function ComposeBlastModal({
  leads,
  open,
  onClose,
  onSent,
}: {
  leads: LeadRow[];
  open: boolean;
  onClose: () => void;
  onSent: () => void;
}) {
  const toast = useAdminToast();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);

  // Compliance: no Medicare cold email, and must have an email address.
  const recipients = useMemo(
    () => leads.filter((l) => l.product_line !== 'medicare' && !!l.email),
    [leads],
  );
  const excluded = leads.length - recipients.length;

  const preview = (recipients[0]?.name.split(' ')[0] ?? 'there')
    ? body.replace(/\{first\}/g, recipients[0]?.name.split(' ')[0] ?? 'there')
    : body;

  async function send() {
    if (!subject.trim() || !body.trim() || recipients.length === 0) return;
    setBusy(true);
    try {
      const n = await sendMarketingEmail(recipients.map((l) => l.id), subject.trim());
      toast.success(`${n} email${n === 1 ? '' : 's'} queued`);
      onSent();
      onClose();
      setSubject('');
      setBody('');
    } catch {
      toast.error('Could not send');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} labelledBy="blast-title" size="max-w-xl">
      <div className="max-h-[calc(100dvh-3rem)] overflow-y-auto px-6 pb-6 pt-8">
        <h2 id="blast-title" className="font-display text-xl font-bold text-brand-white">
          Email leads
        </h2>
        <p className="mt-1 text-sm text-brand-chrome">
          Sending to <span className="font-semibold text-brand-white">{recipients.length}</span>{' '}
          {recipients.length === 1 ? 'lead' : 'leads'}
          {excluded > 0 && (
            <span className="text-brand-chrome/70">
              {' '}
              · {excluded} excluded (Medicare or no email)
            </span>
          )}
          .
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {TEMPLATES.map((tpl) => (
            <button
              key={tpl.label}
              type="button"
              onClick={() => {
                setSubject(tpl.subject);
                setBody(tpl.body);
              }}
              className="rounded-full border border-brand-steel px-3 py-1 text-xs text-brand-chrome transition-colors hover:border-brand-red hover:text-brand-white"
            >
              {tpl.label}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-xs text-brand-chrome">Subject</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-brand-chrome">Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={7}
              placeholder="Write here, or draft it in Claude and paste it in. Use {first} for the lead's first name."
              className="w-full resize-none rounded-lg border border-brand-steel bg-white px-3 py-2 text-sm text-brand-white placeholder:text-brand-chrome/60 focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
            />
          </div>

          {body.trim() && (
            <div className="rounded-lg border border-brand-steel/70 bg-brand-black/20 p-3">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-brand-chrome">Preview</p>
              <p className="whitespace-pre-wrap text-sm text-brand-chrome">{preview}</p>
            </div>
          )}
        </div>

        <p className="mt-4 text-[0.7rem] leading-relaxed text-brand-chrome/70">
          Sent from your marketing domain via Resend. An unsubscribe link is added automatically.
          Dental, vision, and life only — Medicare leads are excluded to stay compliant.
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-secondary !py-2 !text-sm">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void send()}
            disabled={busy || !subject.trim() || !body.trim() || recipients.length === 0}
            className="btn-primary !py-2 !text-sm disabled:opacity-40"
          >
            Send to {recipients.length}
          </button>
        </div>
      </div>
    </Modal>
  );
}
