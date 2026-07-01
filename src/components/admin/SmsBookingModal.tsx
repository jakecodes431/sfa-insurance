/**
 * SmsBookingModal — text a Cal booking link to selected leads so they self-book. Compliance-
 * gated: only leads with a phone AND consent are recipients (TCPA); the message keeps STOP
 * opt-out language. Demo simulates the send + logs to each lead's timeline; live sends via
 * Twilio with the agent's Cal link.
 */
import { useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { sendBookingText } from '@/lib/data';
import { businessConfig } from '@/config/business.config';
import { useAdminToast } from '@/components/admin/ui/AdminToast';
import type { LeadRow } from '@/types/database.types';

const BOOKING_LINK = businessConfig.scheduling.calUrl || 'https://calendar.serviceflowpro.co/…';

export function SmsBookingModal({
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
  const [message, setMessage] = useState(
    `Hi {first}, it's SFA Insurance Group. Book a quick call with a licensed agent here: ${BOOKING_LINK}  Reply STOP to opt out.`,
  );
  const [busy, setBusy] = useState(false);

  // Compliance: phone + consent required for SMS.
  const recipients = useMemo(
    () => leads.filter((l) => !!l.phone && l.consent_contact),
    [leads],
  );
  const excluded = leads.length - recipients.length;

  const first = recipients[0]?.name.split(' ')[0] ?? 'there';
  const preview = message.replace(/\{first\}/g, first);
  const segments = Math.max(1, Math.ceil(preview.length / 160));

  async function send() {
    if (!message.trim() || recipients.length === 0) return;
    setBusy(true);
    try {
      const n = await sendBookingText(recipients.map((l) => l.id));
      toast.success(`${n} text${n === 1 ? '' : 's'} queued`);
      onSent();
      onClose();
    } catch {
      toast.error('Could not send');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} labelledBy="sms-title" size="max-w-lg">
      <div className="max-h-[calc(100dvh-3rem)] overflow-y-auto px-6 pb-6 pt-8">
        <h2 id="sms-title" className="font-display text-xl font-bold text-brand-white">
          Text a booking link
        </h2>
        <p className="mt-1 text-sm text-brand-chrome">
          Sending to <span className="font-semibold text-brand-white">{recipients.length}</span>{' '}
          {recipients.length === 1 ? 'lead' : 'leads'}
          {excluded > 0 && (
            <span className="text-brand-chrome/70"> · {excluded} excluded (no phone or no consent)</span>
          )}
          .
        </p>

        <div className="mt-4">
          <label className="mb-1 block text-xs text-brand-chrome">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full resize-none rounded-lg border border-brand-steel bg-white px-3 py-2 text-sm text-brand-white placeholder:text-brand-chrome/60 focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
          />
          <p className="mt-1 text-[0.7rem] text-brand-chrome/70">
            {preview.length} chars · ~{segments} segment{segments === 1 ? '' : 's'} · {'{first}'} =
            first name
          </p>
        </div>

        {message.trim() && (
          <div className="mt-3 rounded-lg border border-brand-steel/70 bg-brand-black/20 p-3">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-brand-chrome">Preview</p>
            <p className="whitespace-pre-wrap text-sm text-brand-chrome">{preview}</p>
          </div>
        )}

        <p className="mt-4 text-[0.7rem] leading-relaxed text-brand-chrome/70">
          Sent via Twilio. Only leads who gave consent are included, and every text keeps a STOP
          opt-out. Requires A2P 10DLC registration to go live.
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-secondary !py-2 !text-sm">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void send()}
            disabled={busy || !message.trim() || recipients.length === 0}
            className="btn-primary !py-2 !text-sm disabled:opacity-40"
          >
            Send to {recipients.length}
          </button>
        </div>
      </div>
    </Modal>
  );
}
