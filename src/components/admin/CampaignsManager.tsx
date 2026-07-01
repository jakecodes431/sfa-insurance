/**
 * CampaignsManager — admin tab to manage carrier campaign links (one per carrier / push).
 * Each has a shareable /c/<slug> link for marketing, plus click + capture attribution.
 */
import { useState } from 'react';
import { getCampaigns, getCampaignStats, saveCampaign, deleteCampaign } from '@/lib/data';
import { useAdminData } from '@/hooks/useAdminData';
import { useAdminToast } from '@/components/admin/ui/AdminToast';
import { ListStatus } from '@/components/admin/ui/primitives';
import { EditCampaignModal } from './EditCampaignModal';
import { PlusIcon } from '@/components/ui/Icons';
import { uuid } from '@/lib/mockStore';
import type { Campaign } from '@/types/campaigns';

interface Bundle {
  campaigns: Campaign[];
  stats: Record<string, { clicks: number; captures: number }>;
}

const PRODUCT_LABELS: Record<string, string> = {
  'dental-vision': 'Dental & Vision',
  'life-final-expense': 'Life & Final Expense',
};

function blankCampaign(): Campaign {
  return {
    id: uuid(),
    name: '',
    carrier: 'Aetna',
    product_line: 'dental-vision',
    agent_url: '',
    slug: '',
    embed: false,
    enabled: true,
    created_at: new Date().toISOString(),
  };
}

export function CampaignsManager() {
  const toast = useAdminToast();
  const { data, loading, error, reload } = useAdminData<Bundle>(
    async () => {
      const [campaigns, stats] = await Promise.all([getCampaigns(), getCampaignStats()]);
      return { campaigns, stats };
    },
    { campaigns: [], stats: {} },
  );
  const [editing, setEditing] = useState<Campaign | null>(null);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  async function toggle(c: Campaign) {
    await saveCampaign({ ...c, enabled: !c.enabled });
    reload();
  }

  async function remove(c: Campaign) {
    if (!window.confirm(`Delete campaign "${c.name}"? This cannot be undone.`)) return;
    await deleteCampaign(c.id);
    toast.success('Campaign deleted');
    reload();
  }

  function copyLink(slug: string) {
    void navigator.clipboard?.writeText(`${origin}/c/${slug}`);
    toast.success('Link copied');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-brand-chrome">
          Put these links in your marketing. Each routes through your site (so you keep the lead) and
          on to the carrier to enroll.
        </p>
        <button type="button" onClick={() => setEditing(blankCampaign())} className="btn-secondary !py-2 !text-sm">
          <PlusIcon className="text-base" /> New campaign
        </button>
      </div>

      <ListStatus
        loading={loading}
        error={error}
        isEmpty={!loading && !error && data.campaigns.length === 0}
        emptyMessage="No campaigns yet. Create one to get a shareable link."
        onRetry={reload}
      />

      {!loading && !error && data.campaigns.length > 0 && (
        <ul className="space-y-3">
          {data.campaigns.map((c) => {
            const s = data.stats[c.id] ?? { clicks: 0, captures: 0 };
            return (
              <li key={c.id} className={`card ${c.enabled ? '' : 'opacity-60'}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-display text-base font-semibold text-brand-white">{c.name}</h4>
                      <span className="rounded-full bg-brand-red/10 px-2 py-0.5 text-xs text-brand-red">{c.carrier}</span>
                      <span className="rounded-full border border-brand-steel px-2 py-0.5 text-xs text-brand-chrome">
                        {PRODUCT_LABELS[c.product_line] ?? c.product_line}
                      </span>
                      {c.embed && (
                        <span className="rounded-full border border-brand-steel px-2 py-0.5 text-xs text-brand-chrome">
                          embed
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <code className="rounded bg-brand-black/40 px-2 py-1 text-xs text-brand-white">
                        {origin}/c/{c.slug}
                      </code>
                      <button
                        type="button"
                        onClick={() => copyLink(c.slug)}
                        className="rounded-lg border border-brand-steel px-2 py-1 text-xs text-brand-chrome transition-colors hover:border-brand-red hover:text-brand-white"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-brand-chrome">
                      <span className="font-semibold text-brand-white">{s.clicks}</span> clicks ·{' '}
                      <span className="font-semibold text-brand-white">{s.captures}</span> captured ·{' '}
                      routes to{' '}
                      <a href={c.agent_url} target="_blank" rel="noreferrer noopener" className="text-brand-red underline">
                        {c.carrier}
                      </a>
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditing(c)}
                      className="rounded-lg border border-brand-steel px-2.5 py-1 text-xs font-medium text-brand-chrome transition-colors hover:border-brand-red hover:text-brand-white"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(c)}
                      className="rounded-lg border border-brand-steel px-2.5 py-1 text-xs font-medium text-brand-chrome transition-colors hover:border-brand-red hover:text-brand-red"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={c.enabled}
                      onClick={() => void toggle(c)}
                      className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors ${
                        c.enabled ? 'justify-end bg-brand-red' : 'justify-start bg-brand-steel'
                      }`}
                    >
                      <span className="h-5 w-5 rounded-full bg-white shadow-sm" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <EditCampaignModal campaign={editing} onClose={() => setEditing(null)} onSaved={reload} />
    </div>
  );
}
