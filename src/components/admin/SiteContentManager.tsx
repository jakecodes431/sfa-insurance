import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listContentBlocks, upsertContentBlock, uploadImage } from '@/lib/sfp';
import { cn } from '@/lib/cn';
import { useAdminData } from '@/hooks/useAdminData';
import { ListStatus } from '@/components/admin/ui/primitives';
import { useAdminToast } from '@/components/admin/ui/AdminToast';
import type { SfpTireContentBlockRow } from '@/types/database.types';

export function SiteContentManager() {
  const { t } = useTranslation();
  const toast = useAdminToast();
  const { data: blocks, loading, error, reload } = useAdminData<SfpTireContentBlockRow[]>(listContentBlocks, []);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  // Keep the editable draft in sync whenever the loaded blocks change (initial + after save).
  useEffect(() => {
    setDraft(Object.fromEntries(blocks.map((r) => [r.id, r.value ?? ''])));
  }, [blocks]);

  async function save(b: SfpTireContentBlockRow, value: string) {
    try {
      await upsertContentBlock({
        key: b.key,
        label: b.label,
        value,
        block_type: b.block_type,
        group_name: b.group_name,
        sort_order: b.sort_order,
      });
      toast.success(t('admin.common.saved'));
      reload();
    } catch {
      toast.error(t('admin.common.saveError'));
    }
  }

  async function onUpload(b: SfpTireContentBlockRow, file: File) {
    setUploadingId(b.id);
    try {
      const url = await uploadImage('content', file);
      setDraft((d) => ({ ...d, [b.id]: url }));
      await save(b, url);
    } catch {
      toast.error(t('admin.common.saveError'));
    } finally {
      setUploadingId(null);
    }
  }

  // Loading / error / empty all share the standard status note.
  if (loading || error || blocks.length === 0) {
    return (
      <ListStatus
        loading={loading}
        error={error}
        isEmpty={blocks.length === 0}
        emptyMessage={t('admin.siteContent.empty')}
        onRetry={reload}
      />
    );
  }

  // group blocks by group_name for a tidy editor
  const groups = blocks.reduce<Record<string, SfpTireContentBlockRow[]>>((acc, b) => {
    const g = b.group_name ?? 'General';
    (acc[g] ??= []).push(b);
    return acc;
  }, {});

  // Page navigator — one group_name per "page" so the owner can see each page's editable fields.
  const groupNames = Object.keys(groups);
  const current = activeGroup && groups[activeGroup] ? activeGroup : groupNames[0];
  const items = groups[current] ?? [];

  return (
    <div className="space-y-6">
      <p className="text-sm text-brand-chrome">{t('admin.siteContent.note')}</p>

      {/* Page picker */}
      <div className="flex flex-wrap gap-2">
        {groupNames.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setActiveGroup(g)}
            className={cn(
              'rounded-md border px-3 py-2 font-display text-sm uppercase tracking-wide transition-colors',
              g === current
                ? 'border-brand-red bg-brand-red text-brand-white'
                : 'border-brand-steel bg-brand-charcoal text-brand-chrome hover:border-brand-chrome',
            )}
          >
            {g} <span className="text-xs opacity-70">({groups[g].length})</span>
          </button>
        ))}
      </div>

      <div>
        <h3 className="mb-3 font-display text-sm uppercase tracking-wide text-brand-chrome">
          {t('admin.siteContent.editingPage', { page: current })}
        </h3>
        <ul className="space-y-4">
          {items.map((b) => (
              <li key={b.id} className="card space-y-2">
                <label className="block text-sm text-brand-white">{b.label}</label>
                {b.block_type === 'image_url' ? (
                  <div className="space-y-2">
                    {draft[b.id] && (
                      <img src={draft[b.id]} alt={b.label} loading="lazy" className="max-h-32 rounded-md border border-brand-steel object-contain" />
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="btn-secondary cursor-pointer !py-2 !text-sm">
                        {uploadingId === b.id ? t('admin.siteContent.uploading') : t('admin.siteContent.upload')}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) void onUpload(b, f);
                          }}
                        />
                      </label>
                      <input
                        className="input-field flex-1"
                        value={draft[b.id] ?? ''}
                        onChange={(e) => setDraft((d) => ({ ...d, [b.id]: e.target.value }))}
                        placeholder="https://…"
                      />
                    </div>
                  </div>
                ) : b.block_type === 'html' ? (
                  <textarea
                    className="input-field min-h-[6rem]"
                    value={draft[b.id] ?? ''}
                    onChange={(e) => setDraft((d) => ({ ...d, [b.id]: e.target.value }))}
                  />
                ) : (
                  <input
                    className="input-field"
                    type={b.block_type === 'number' ? 'number' : 'text'}
                    value={draft[b.id] ?? ''}
                    onChange={(e) => setDraft((d) => ({ ...d, [b.id]: e.target.value }))}
                  />
                )}
                <div className="flex items-center gap-3">
                  <button className="btn-primary !py-2 !text-sm" onClick={() => void save(b, draft[b.id] ?? '')}>
                    {t('admin.siteContent.save')}
                  </button>
                  <code className="ml-auto text-[11px] text-brand-chrome">{b.key}</code>
                </div>
              </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
