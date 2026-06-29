import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listCategories, upsertCategory, deleteCategory } from '@/lib/catalog';
import { useAdminData } from '@/hooks/useAdminData';
import { FormCard, ListStatus, ConfirmButton } from '@/components/admin/ui/primitives';
import { useAdminToast } from '@/components/admin/ui/AdminToast';
import type { ServiceCategoryRow } from '@/types/database.types';

// ----------------------------------------------------------------- Service catalog
const emptyCat = { name_en: '', name_es: '', sort_order: '0', active: true };

function ServiceCatalogManager() {
  const { t } = useTranslation();
  const toast = useAdminToast();
  const { data: cats, loading, error, reload } = useAdminData<ServiceCategoryRow[]>(listCategories, []);
  const [form, setForm] = useState({ ...emptyCat });
  const [editingId, setEditingId] = useState<string | null>(null);

  async function save() {
    if (!form.name_en.trim()) return;
    try {
      await upsertCategory({
        id: editingId ?? undefined,
        name_en: form.name_en.trim(),
        name_es: (form.name_es || form.name_en).trim(),
        sort_order: Number(form.sort_order) || 0,
        active: form.active,
      });
      setForm({ ...emptyCat });
      setEditingId(null);
      toast.success(t('admin.common.saved'));
      reload();
    } catch {
      toast.error(t('admin.common.saveError'));
    }
  }

  async function remove(id: string) {
    try {
      await deleteCategory(id);
      toast.success(t('admin.common.deleted'));
      reload();
    } catch {
      toast.error(t('admin.common.saveError'));
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <FormCard title={t('catalog.heading')}>
        <p className="text-xs text-brand-chrome">{t('catalog.note')}</p>
        <input className="input-field" placeholder={t('catalog.nameEn')} value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} />
        <input className="input-field" placeholder={t('catalog.nameEs')} value={form.name_es} onChange={(e) => setForm({ ...form, name_es: e.target.value })} />
        <input className="input-field" type="number" placeholder={t('catalog.order')} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
        <label className="flex items-center gap-2 text-sm text-brand-chrome">
          <input type="checkbox" className="accent-brand-red" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
          {t('catalog.active')}
        </label>
        <div className="flex gap-2">
          <button className="btn-primary w-full" onClick={save}>{t('catalog.save')}</button>
          {editingId && (
            <button className="btn-secondary" onClick={() => { setForm({ ...emptyCat }); setEditingId(null); }}>
              {t('catalog.cancel')}
            </button>
          )}
        </div>
      </FormCard>
      <div>
        <ListStatus
          loading={loading}
          error={error}
          isEmpty={cats.length === 0}
          emptyMessage={t('catalog.empty')}
          onRetry={reload}
        />
        {!loading && !error && cats.length > 0 && (
          <ul className="space-y-3">
            {cats.map((c) => (
              <li key={c.id} className="card flex items-center justify-between gap-3">
                <div>
                  <p className="text-brand-white">{c.name_en} <span className="text-brand-chrome">/ {c.name_es}</span></p>
                  <p className="flex items-center gap-2 text-xs text-brand-chrome">
                    #{c.sort_order}
                    {!c.active && (
                      <span className="rounded bg-brand-steel/30 px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
                        {t('admin.common.inactive')}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button className="btn-secondary !py-2 !text-sm md:!py-1 md:!text-xs" onClick={() => { setEditingId(c.id); setForm({ name_en: c.name_en, name_es: c.name_es, sort_order: String(c.sort_order), active: c.active }); }}>
                    {t('admin.common.edit')}
                  </button>
                  <ConfirmButton onConfirm={() => void remove(c.id)}>{t('admin.common.delete')}</ConfirmButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/** Services tab = the service-category catalog manager. */
export function ServicesTab() {
  return (
    <div className="space-y-10">
      <ServiceCatalogManager />
    </div>
  );
}
