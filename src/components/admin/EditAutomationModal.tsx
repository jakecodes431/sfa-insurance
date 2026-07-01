/**
 * EditAutomationModal — edit an automation's name and the wording of each step (email
 * subject + message body / SMS text). Saves through the data layer (persisted in the demo).
 */
import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { saveAutomation } from '@/lib/data';
import { useAdminToast } from '@/components/admin/ui/AdminToast';
import { MailIcon, MessageIcon } from '@/components/ui/Icons';
import type { Automation, AutomationStep } from '@/config/automations.config';

export function EditAutomationModal({
  automation,
  onClose,
  onSaved,
}: {
  automation: Automation | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useAdminToast();
  const [name, setName] = useState('');
  const [steps, setSteps] = useState<AutomationStep[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!automation) return;
    setName(automation.name);
    setSteps(JSON.parse(JSON.stringify(automation.steps)) as AutomationStep[]);
  }, [automation]);

  if (!automation) return null;

  function patchStep(i: number, patch: Partial<AutomationStep>) {
    setSteps((s) => s.map((step, idx) => (idx === i ? { ...step, ...patch } : step)));
  }

  async function save() {
    setBusy(true);
    try {
      await saveAutomation({ ...automation!, name: name.trim() || automation!.name, steps });
      toast.success('Automation saved');
      onSaved();
      onClose();
    } catch {
      toast.error('Could not save');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={!!automation} onClose={onClose} labelledBy="edit-automation-title" size="max-w-xl">
      <div className="max-h-[calc(100dvh-3rem)] overflow-y-auto px-6 pb-6 pt-8">
        <h2 id="edit-automation-title" className="font-display text-xl font-bold text-brand-white">
          Edit automation
        </h2>
        <p className="mt-1 text-sm text-brand-chrome">
          {automation.trigger} · {automation.timing}
        </p>

        <div className="mt-5 space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-brand-chrome">
              Name
            </label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
          </div>

          {steps.map((step, i) => (
            <div key={i} className="rounded-xl border border-brand-steel/70 bg-brand-black/20 p-4">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-brand-steel bg-brand-black/30 px-2 py-0.5 text-[0.7rem] font-medium text-brand-chrome">
                {step.channel === 'email' ? (
                  <MailIcon className="text-xs text-brand-red" />
                ) : (
                  <MessageIcon className="text-xs text-brand-red" />
                )}
                {step.channel === 'email' ? 'Email' : 'SMS'}
              </div>

              {step.channel === 'email' && (
                <div className="mb-2">
                  <label className="mb-1 block text-xs text-brand-chrome">Subject</label>
                  <input
                    value={step.subject ?? ''}
                    onChange={(e) => patchStep(i, { subject: e.target.value })}
                    className="input-field"
                  />
                </div>
              )}

              <label className="mb-1 block text-xs text-brand-chrome">
                {step.channel === 'email' ? 'Body' : 'Message'}
              </label>
              <textarea
                value={step.preview}
                onChange={(e) => patchStep(i, { preview: e.target.value })}
                rows={step.channel === 'email' ? 4 : 3}
                className="w-full resize-none rounded-lg border border-brand-steel bg-white px-3 py-2 text-sm text-brand-white placeholder:text-brand-chrome/60 focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
              />
              {step.channel === 'sms' && (
                <p className="mt-1 text-[0.7rem] text-brand-chrome/70">
                  Keep opt-out language (Reply STOP) for compliance.
                </p>
              )}
            </div>
          ))}

          <p className="text-xs text-brand-chrome/70">
            Merge fields: <code className="text-brand-white">{'{first}'}</code> (lead name),{' '}
            <code className="text-brand-white">{'{time}'}</code> (appointment time).
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-secondary !py-2 !text-sm">
            Cancel
          </button>
          <button type="button" onClick={() => void save()} disabled={busy} className="btn-primary !py-2 !text-sm disabled:opacity-40">
            Save changes
          </button>
        </div>
      </div>
    </Modal>
  );
}
