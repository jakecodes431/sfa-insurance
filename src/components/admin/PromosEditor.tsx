import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllPromotions, setPromotionStatus, upsertPromotion } from '@/lib/data';
import { promotionSchema } from '@/schemas';
import { postEvent } from '@/lib/automation';
import { useAdminData } from '@/hooks/useAdminData';
import { FormCard, ListStatus } from '@/components/admin/ui/primitives';
import { useAdminToast } from '@/components/admin/ui/AdminToast';
import type { PromotionRow } from '@/types/database.types';

const emptyPromo = {
  slug: '',
  title_en: '',
  title_es: '',
  body_en: '',
  body_es: '',
  image_url: '',
  is_event: false,
  requires_registration: false,
  price_cents: 0,
  capacity: '',
};

export function PromosEditor() {
  const { t } = useTranslation();
  const toast = useAdminToast();
  const { data: promos, loading, error, reload } = useAdminData<PromotionRow[]>(getAllPromotions, []);
  const [form, setForm] = useState({ ...emptyPromo });
  const [editingId, setEditingId] = useState<string | null>(null);

  async function save() {
    const parsed = promotionSchema.safeParse({
      slug: form.slug || form.title_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      title_en: form.title_en,
      title_es: form.title_es,
      body_en: form.body_en,
      body_es: form.body_es,
      is_event: form.is_event,
      requires_registration: form.requires_registration,
      price_cents: form.price_cents || 0,
      capacity: form.capacity === '' ? null : Number(form.capacity),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? t('admin.common.saveError'));
      return;
    }
    try {
      await upsertPromotion({
        id: editingId ?? undefined,
        ...parsed.data,
        image_url: form.image_url || null,
        status: 'draft',
      });
      setForm({ ...emptyPromo });
      setEditingId(null);
      toast.success(t('admin.common.saved'));
      reload();
    } catch {
      toast.error(t('admin.common.saveError'));
    }
  }

  async function publish(p: PromotionRow) {
    try {
      await setPromotionStatus(p.id, 'published');
      await postEvent('promo.published', {
        locale: 'en',
        promo_id: p.id,
        promo_slug: p.slug,
        title_en: p.title_en,
        title_es: p.title_es,
      });
      toast.success(t('admin.common.published'));
      reload();
    } catch {
      toast.error(t('admin.common.saveError'));
    }
  }

  async function archive(p: PromotionRow) {
    try {
      await setPromotionStatus(p.id, 'archived');
      toast.success(t('admin.common.saved'));
      reload();
    } catch {
      toast.error(t('admin.common.saveError'));
    }
  }

  function edit(p: PromotionRow) {
    setEditingId(p.id);
    setForm({
      slug: p.slug,
      title_en: p.title_en,
      title_es: p.title_es,
      body_en: p.body_en ?? '',
      body_es: p.body_es ?? '',
      image_url: p.image_url ?? '',
      is_event: p.is_event,
      requires_registration: p.requires_registration,
      price_cents: p.price_cents ?? 0,
      capacity: p.capacity?.toString() ?? '',
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <FormCard title={t('admin.promosEditor.heading')}>
        <input className="input-field" placeholder={t('admin.promosEditor.titleEn')} value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} />
        <input className="input-field" placeholder={t('admin.promosEditor.titleEs')} value={form.title_es} onChange={(e) => setForm({ ...form, title_es: e.target.value })} />
        <textarea className="input-field" placeholder={t('admin.promosEditor.bodyEn')} value={form.body_en} onChange={(e) => setForm({ ...form, body_en: e.target.value })} />
        <textarea className="input-field" placeholder={t('admin.promosEditor.bodyEs')} value={form.body_es} onChange={(e) => setForm({ ...form, body_es: e.target.value })} />
        <input className="input-field" placeholder={t('admin.promosEditor.image') + ' URL'} value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
        <label className="flex items-center gap-2 text-sm text-brand-chrome">
          <input type="checkbox" className="accent-brand-red" checked={form.is_event} onChange={(e) => setForm({ ...form, is_event: e.target.checked })} />
          {t('admin.promosEditor.isEvent')}
        </label>
        <label className="flex items-center gap-2 text-sm text-brand-chrome">
          <input type="checkbox" className="accent-brand-red" checked={form.requires_registration} onChange={(e) => setForm({ ...form, requires_registration: e.target.checked })} />
          {t('admin.promosEditor.requiresReg')}
        </label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input className="input-field" type="number" placeholder={t('admin.promosEditor.priceCents')} value={form.price_cents} onChange={(e) => setForm({ ...form, price_cents: Number(e.target.value) })} />
          <input className="input-field" type="number" placeholder={t('admin.promosEditor.capacity')} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
        </div>
        <button className="btn-primary w-full" onClick={save}>
          {editingId ? t('admin.promosEditor.edit') : t('admin.promosEditor.create')}
        </button>
      </FormCard>

      <div>
        <ListStatus
          loading={loading}
          error={error}
          isEmpty={promos.length === 0}
          emptyMessage={t('admin.promosEditor.empty')}
          onRetry={reload}
        />

        {!loading && !error && promos.length > 0 && (
          <ul className="space-y-3">
            {promos.map((p) => (
              <li key={p.id} className="card">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-brand-white">{p.title_en}</span>
                  <span className="text-xs text-brand-chrome">{p.status}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button className="btn-secondary !py-2 !text-sm md:!py-1 md:!text-xs" onClick={() => edit(p)}>
                    {t('admin.common.edit')}
                  </button>
                  {p.status !== 'published' && (
                    <button className="btn-primary !py-2 !text-sm md:!py-1 md:!text-xs" onClick={() => void publish(p)}>
                      {t('admin.promosEditor.publish')}
                    </button>
                  )}
                  {p.status !== 'archived' && (
                    <button className="btn-secondary !py-2 !text-sm md:!py-1 md:!text-xs" onClick={() => void archive(p)}>
                      {t('admin.promosEditor.archive')}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
