/**
 * EditCampaignModal — add or edit a carrier campaign link. The agent picks a carrier +
 * product, pastes their carrier agent link, and gets a shareable /c/<slug> link to use in
 * marketing. Saves through the data layer (persisted).
 */
import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { saveCampaign } from '@/lib/data';
import { useAdminToast } from '@/components/admin/ui/AdminToast';
import { CARRIER_OPTIONS, CAMPAIGN_PRODUCTS } from '@/config/carriers.config';
import type { Campaign } from '@/types/campaigns';

const PRODUCT_LABELS: Record<string, string> = {
  'dental-vision': 'Dental & Vision',
  'life-final-expense': 'Life & Final Expense',
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function EditCampaignModal({
  campaign,
  onClose,
  onSaved,
}: {
  campaign: Campaign | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useAdminToast();
  const [form, setForm] = useState<Campaign | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setForm(campaign ? { ...campaign } : null);
    setSlugTouched(!!campaign?.slug);
  }, [campaign]);

  if (!campaign || !form) return null;

  const patch = (p: Partial<Campaign>) => setForm((f) => (f ? { ...f, ...p } : f));

  async function save() {
    if (!form!.name.trim() || !form!.agent_url.trim()) return;
    const slug = (form!.slug || slugify(form!.name)).trim();
    setBusy(true);
    try {
      await saveCampaign({ ...form!, slug });
      toast.success('Campaign saved');
      onSaved();
      onClose();
    } catch {
      toast.error('Could not save');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={!!campaign} onClose={onClose} labelledBy="edit-campaign-title" size="max-w-lg">
      <div className="px-6 pb-6 pt-8">
        <h2 id="edit-campaign-title" className="font-display text-xl font-bold text-brand-white">
          {campaign.name ? 'Edit campaign' : 'New campaign'}
        </h2>

        <div className="mt-5 space-y-3">
          <div>
            <label className="mb-1 block text-xs text-brand-chrome">Campaign name</label>
            <input
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                patch({ name, ...(slugTouched ? {} : { slug: slugify(name) }) });
              }}
              placeholder="e.g. Dental — Facebook Q3"
              className="input-field"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-brand-chrome">Carrier</label>
              <Select
                aria-label="Carrier"
                value={form.carrier}
                onChange={(v) => patch({ carrier: v })}
                options={CARRIER_OPTIONS.map((c) => ({ value: c, label: c }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-brand-chrome">Product</label>
              <Select
                aria-label="Product"
                value={form.product_line}
                onChange={(v) => patch({ product_line: v })}
                options={CAMPAIGN_PRODUCTS.map((p) => ({ value: p, label: PRODUCT_LABELS[p] ?? p }))}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-brand-chrome">Carrier agent link</label>
            <input
              value={form.agent_url}
              onChange={(e) => patch({ agent_url: e.target.value })}
              placeholder="https://…your carrier enrollment link"
              className="input-field"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-brand-chrome">Share link (/c/…)</label>
            <div className="flex items-center rounded-lg border border-brand-steel bg-white">
              <span className="pl-3 text-sm text-brand-chrome">/c/</span>
              <input
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  patch({ slug: slugify(e.target.value) });
                }}
                placeholder="aetna-dental"
                className="w-full bg-transparent px-1 py-2 text-sm text-brand-white focus:outline-none"
              />
            </div>
          </div>

          <label className="flex items-start gap-2 pt-1 text-xs leading-relaxed text-brand-chrome">
            <input type="checkbox" checked={form.embed} onChange={(e) => patch({ embed: e.target.checked })} className="mt-0.5 h-4 w-4 shrink-0" />
            Try to embed the carrier page in the popup. Most carriers block this; leave off to hand
            off in a new tab.
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-secondary !py-2 !text-sm">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={busy || !form.name.trim() || !form.agent_url.trim()}
            className="btn-primary !py-2 !text-sm disabled:opacity-40"
          >
            Save campaign
          </button>
        </div>
      </div>
    </Modal>
  );
}
